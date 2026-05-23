from __future__ import annotations

import json
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Dict, Any

import joblib
import numpy as np
import pandas as pd
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    average_precision_score,
    f1_score,
    precision_recall_curve,
    roc_auc_score,
    classification_report,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


ROOT = Path(__file__).resolve().parents[2]
RAW_DATA_PATH = ROOT / "ml" / "data" / "raw" / "creditcard.csv"
ARTIFACT_DIR = ROOT / "ml" / "artifacts"


@dataclass
class ModelMetrics:
    roc_auc: float
    pr_auc: float
    f1_at_best_threshold: float
    best_threshold: float
    precision_at_best_threshold: float
    recall_at_best_threshold: float
    train_samples: int
    test_samples: int
    fraud_rate_train: float
    fraud_rate_test: float


def load_and_clean_data(path: Path) -> pd.DataFrame:
    if not path.exists():
        raise FileNotFoundError(f"Dataset not found at {path}")

    df = pd.read_csv(path)

    required_cols = {"Class", "Amount", "Time"}
    if not required_cols.issubset(df.columns):
        raise ValueError(f"Dataset missing required columns: {required_cols - set(df.columns)}")

    # Keep only numeric columns for this base model
    numeric_cols = [c for c in df.columns if pd.api.types.is_numeric_dtype(df[c])]
    df = df[numeric_cols].copy()

    # Remove duplicates and invalid labels
    df = df.drop_duplicates().reset_index(drop=True)
    df = df[df["Class"].isin([0, 1])].copy()

    # Robust amount transform to reduce skew
    df["Amount"] = np.log1p(df["Amount"].clip(lower=0))

    return df


def choose_best_threshold(y_true: np.ndarray, y_proba: np.ndarray) -> Dict[str, float]:
    precision, recall, thresholds = precision_recall_curve(y_true, y_proba)

    # thresholds has len n-1 compared to precision/recall
    f1_scores = 2 * (precision[:-1] * recall[:-1]) / (precision[:-1] + recall[:-1] + 1e-12)
    best_idx = int(np.argmax(f1_scores))
    raw_threshold = float(thresholds[best_idx])

    # Guardrail: avoid extreme thresholds that make live inference unusable.
    # Values too close to 1.0 can suppress almost all fraud alerts in streaming mode.
    safe_threshold = float(np.clip(raw_threshold, 0.05, 0.95))

    return {
        "threshold": safe_threshold,
        "raw_threshold": raw_threshold,
        "precision": float(precision[best_idx]),
        "recall": float(recall[best_idx]),
        "f1": float(f1_scores[best_idx]),
    }


def train() -> None:
    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)

    df = load_and_clean_data(RAW_DATA_PATH)

    feature_columns = [c for c in df.columns if c != "Class"]
    X = df[feature_columns]
    y = df["Class"].astype(int)

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    model = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
            (
                "classifier",
                LogisticRegression(
                    class_weight="balanced",
                    max_iter=250,
                    solver="liblinear",
                    random_state=42,
                ),
            ),
        ]
    )

    model.fit(X_train, y_train)

    y_proba = model.predict_proba(X_test)[:, 1]
    threshold_metrics = choose_best_threshold(y_test.to_numpy(), y_proba)
    best_threshold = threshold_metrics["threshold"]

    y_pred = (y_proba >= best_threshold).astype(int)

    metrics = ModelMetrics(
        roc_auc=float(roc_auc_score(y_test, y_proba)),
        pr_auc=float(average_precision_score(y_test, y_proba)),
        f1_at_best_threshold=threshold_metrics["f1"],
        best_threshold=best_threshold,
        precision_at_best_threshold=threshold_metrics["precision"],
        recall_at_best_threshold=threshold_metrics["recall"],
        train_samples=int(len(X_train)),
        test_samples=int(len(X_test)),
        fraud_rate_train=float(y_train.mean()),
        fraud_rate_test=float(y_test.mean()),
    )

    model_payload: Dict[str, Any] = {
        "model": model,
        "feature_columns": feature_columns,
        "threshold": best_threshold,
        "model_version": "kaggle-creditcard-lr-v1",
    }

    joblib.dump(model_payload, ARTIFACT_DIR / "fraud_model.joblib")

    report = classification_report(y_test, y_pred, output_dict=True)

    with open(ARTIFACT_DIR / "metrics.json", "w", encoding="utf-8") as f:
        json.dump(
            {
                "summary": asdict(metrics),
                "threshold_details": {
                    "raw_best_threshold": threshold_metrics.get("raw_threshold"),
                    "used_threshold": threshold_metrics["threshold"],
                    "guardrail": "clip_to_[0.05,0.95]",
                },
                "classification_report": report,
            },
            f,
            indent=2,
        )

    with open(ARTIFACT_DIR / "feature_contract.json", "w", encoding="utf-8") as f:
        json.dump(
            {
                "input_features": feature_columns,
                "label": "Class",
                "notes": "Amount is expected as raw amount before log1p; transform handled in model preprocessing.",
            },
            f,
            indent=2,
        )

    print("Training complete")
    print(f"Artifact: {ARTIFACT_DIR / 'fraud_model.joblib'}")
    print(f"Metrics:  {ARTIFACT_DIR / 'metrics.json'}")
    print(f"ROC-AUC:  {metrics.roc_auc:.4f}")
    print(f"PR-AUC:   {metrics.pr_auc:.4f}")
    print(f"F1*:      {metrics.f1_at_best_threshold:.4f} @ threshold={metrics.best_threshold:.4f}")


if __name__ == "__main__":
    train()
