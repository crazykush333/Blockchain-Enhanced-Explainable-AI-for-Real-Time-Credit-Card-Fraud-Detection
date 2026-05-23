from __future__ import annotations

from datetime import datetime
from typing import Dict, Any


def map_transaction_to_model_features(tx: Dict[str, Any]) -> Dict[str, float]:
    """Map your app transaction payload to the Kaggle base model schema.

    NOTE:
    Kaggle creditcard model expects Time, Amount, V1..V28. Since your app does not have
    V-features from the original PCA pipeline, this mapper uses zeros for V1..V28 and
    injects business signals into a few surrogate dimensions. Replace with a better
    feature-engineering pipeline for production.
    """

    now = datetime.utcnow()
    hour = float(tx.get("hour", now.hour))
    amount = float(tx.get("amount", 0.0))

    features: Dict[str, float] = {
        "Time": hour * 3600,
        "Amount": amount,
    }

    # default placeholders
    for i in range(1, 29):
        features[f"V{i}"] = 0.0

    # crude surrogate injections (starter only)
    category = str(tx.get("merchantCategory", "")).lower()
    state = str(tx.get("state", "")).lower()

    features["V1"] = 1.0 if category in {"jewelry", "electronics", "travel & airlines"} else 0.0
    features["V2"] = 1.0 if state in {"delhi", "uttar pradesh", "bihar"} else 0.0
    features["V3"] = 1.0 if hour < 6 or hour > 23 else 0.0

    return features
