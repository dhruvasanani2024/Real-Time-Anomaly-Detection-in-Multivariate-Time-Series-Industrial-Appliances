from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    # Base paths
    BASE_DIR: Path = Path(__file__).parent.parent  # backend/
    
    # Model directory
    MODEL_DIR: Path = BASE_DIR / "models"
    
    # Isolation Forest files
    IF_MODEL_PATH: Path = MODEL_DIR / "isolation_forest.pkl"
    
    # LSTM files
    LSTM_MODEL_PATH: Path = MODEL_DIR / "lstm_autoencoder.pth"
    THRESHOLD_PATH: Path = MODEL_DIR / "threshold.npy"
    SEQ_LEN_PATH: Path = MODEL_DIR / "seq_len.txt"
    
    # Common files
    SCALER_PATH: Path = MODEL_DIR / "scaler.pkl"
    SENSOR_COLS_PATH: Path = MODEL_DIR / "sensor_cols.txt"
    
    # Model parameters
    SEQ_LEN: int = 30
    NUM_SENSORS: int = 51
    
    # Threshold for combining scores - LOWERED to 0.3
    COMBINED_THRESHOLD: float = 0.3
    
    # Server settings
    API_HOST: str = "127.0.0.1"
    API_PORT: int = 8000
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()