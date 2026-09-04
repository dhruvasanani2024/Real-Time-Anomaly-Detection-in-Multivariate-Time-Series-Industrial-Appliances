import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from pydantic import BaseModel, validator
from typing import List
from config.settings import settings

class SensorDataRequest(BaseModel):
    values: List[List[float]]

    @validator('values')
    def validate_shape(cls, v):
        if len(v) != settings.SEQ_LEN:
            raise ValueError(f"Expected {settings.SEQ_LEN} timesteps, got {len(v)}")
        if len(v) > 0 and len(v[0]) != settings.NUM_SENSORS:
            raise ValueError(f"Expected {settings.NUM_SENSORS} sensors, got {len(v[0])}")
        return v

class IFResult(BaseModel):
    score: float
    raw_score: float
    is_anomaly: bool

class LSTMResult(BaseModel):
    reconstruction_error: float
    normalized_score: float
    threshold: float
    is_anomaly: bool

class HybridResult(BaseModel):
    combined_score: float
    threshold: float
    is_anomaly: bool

class AnomalyResponse(BaseModel):
    status: str
    isolation_forest: IFResult
    lstm: LSTMResult
    hybrid: HybridResult
    message: str