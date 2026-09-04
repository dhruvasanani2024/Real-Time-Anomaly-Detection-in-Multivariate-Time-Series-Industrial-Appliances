from fastapi import APIRouter, HTTPException
from api.schemas import SensorDataRequest, AnomalyResponse  # Changed from src.api.schemas
from core.service import predict  # Changed from src.core.service
import numpy as np

router = APIRouter(tags=["Prediction"])

@router.post("/predict", response_model=AnomalyResponse)
def predict_endpoint(request: SensorDataRequest):
    try:
        data = np.array(request.values, dtype=np.float32)
        result = predict(data)
        
        return AnomalyResponse(
            status="success",
            isolation_forest=result["isolation_forest"],
            lstm=result["lstm"],
            hybrid=result["hybrid"],
            message="🚨 ANOMALY DETECTED!" if result["hybrid"]["is_anomaly"] else "✅ Normal operation."
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")