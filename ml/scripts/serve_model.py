from __future__ import annotations

from pathlib import Path
from typing import Dict, Any

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

ROOT = Path(__file__).resolve().parents[2]
ARTIFACT_PATH = ROOT / "ml" / "artifacts" / "fraud_model.joblib"


class TransactionFeatures(BaseModel):
    features: Dict[str, float]


def load_payload() -> Dict[str, Any]:
    if not ARTIFACT_PATH.exists():
        raise FileNotFoundError(f"Model artifact not found: {ARTIFACT_PATH}")
    return joblib.load(ARTIFACT_PATH)


payload = load_payload()
model = payload["model"]
feature_columns = payload["feature_columns"]
threshold = float(payload["threshold"])
model_version = payload.get("model_version", "unknown")

app = FastAPI(title="Fraud Inference API", version=model_version)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> Dict[str, Any]:
    return {
        "ok": True,
        "modelVersion": model_version,
        "threshold": threshold,
        "featureCount": len(feature_columns),
    }


@app.post("/analyze")
def analyze(payload_in: TransactionFeatures) -> Dict[str, Any]:
    row = {k: float(payload_in.features.get(k, 0.0)) for k in feature_columns}

    # Apply same transform as training for Amount
    if "Amount" in row:
        row["Amount"] = float(np.log1p(max(row["Amount"], 0.0)))

    frame = pd.DataFrame([row], columns=feature_columns)
    fraud_probability = float(model.predict_proba(frame)[0][1])
    risk_score = round(fraud_probability * 100, 2)

    if fraud_probability >= threshold:
        decision = "blocked" if risk_score >= 80 else "flagged"
    else:
        decision = "approved"

    return {
        "success": True,
        "analysis": {
            "riskScore": risk_score,
            "decision": decision,
            "confidence": round(max(fraud_probability, 1 - fraud_probability) * 100, 2),
            "summary": f"ML inference complete. Fraud probability={fraud_probability:.4f}.",
            "factors": [],
        },
        "modelVersion": model_version,
        "processedAt": pd.Timestamp.utcnow().isoformat(),
        "aiPowered": True,
    }
