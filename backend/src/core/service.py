import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

import numpy as np
import torch
from config.settings import settings

_artifacts = None

def init_service(artifacts):
    global _artifacts
    _artifacts = artifacts
    print("Service initialized")

def predict(data: np.ndarray) -> dict:
    global _artifacts
    
    # ================================================================
    # DEBUG: Log the data to see what's being received
    # ================================================================
    print(f"Received data shape: {data.shape}")
    print(f"First row: {data[0][:5]}")
    print(f"Last row: {data[-1][:5]}")
    print(f"Max value: {data.max()}")
    print(f"Min value: {data.min()}")
    
    # ... rest of code 
    seq_len = _artifacts["seq_len"]
    num_sensors = len(_artifacts["sensor_cols"])
    
    if data.shape != (seq_len, num_sensors):
        raise ValueError(f"Expected shape ({seq_len}, {num_sensors}), got {data.shape}")
    
    scaler = _artifacts["scaler"]
    original_shape = data.shape
    data_flat = data.reshape(-1, data.shape[-1])
    data_scaled_flat = scaler.transform(data_flat)
    data_scaled = data_scaled_flat.reshape(original_shape)
    
    # ================================================================
    # ISOLATION FOREST
    # ================================================================
    if_model = _artifacts["if_model"]
    last_timestep = data_scaled[-1].reshape(1, -1)
    if_pred = if_model.predict(last_timestep)[0]
    if_score = if_model.decision_function(last_timestep)[0]
    
    # ================================================================
    # PROPER SCORE NORMALIZATION
    # Isolation Forest scores are typically between -0.5 and 0.5
    # Negative = more anomalous, Positive = more normal
    # ================================================================
    
    # Method 1: Simple normalization based on typical range
    # IF scores typically range from -0.5 to 0.5
    # Normalize: (score - min) / (max - min) where min=-0.5, max=0.5
    # Higher = more anomalous (so we negate)
    if_normalized = max(0, min(1, (-if_score + 0.5) / 1.0))
    
    # Method 2: If using sigmoid (alternative)
    # if_normalized = 1.0 / (1.0 + np.exp(if_score * 3))
    
    # Convert to binary - use a higher threshold for IF
    if_is_anomaly = if_normalized > 0.6  # IF needs higher threshold
    
    # ================================================================
    # LSTM (Disabled for now)
    # ================================================================
    lstm_is_anomaly = False
    lstm_normalized = 0.0
    mse = 0.0
    lstm_threshold = 0.0
    
    # ================================================================
    # HYBRID
    # ================================================================
    hybrid_score = if_normalized
    hybrid_threshold = 0.6  # Higher threshold for hybrid
    is_anomaly = hybrid_score > hybrid_threshold
    
    return {
        "isolation_forest": {
            "score": float(if_normalized),
            "raw_score": float(if_score),
            "is_anomaly": if_is_anomaly
        },
        "lstm": {
            "reconstruction_error": float(mse),
            "normalized_score": float(lstm_normalized),
            "threshold": float(lstm_threshold),
            "is_anomaly": lstm_is_anomaly
        },
        "hybrid": {
            "combined_score": float(hybrid_score),
            "threshold": float(hybrid_threshold),
            "is_anomaly": is_anomaly
        }
    }