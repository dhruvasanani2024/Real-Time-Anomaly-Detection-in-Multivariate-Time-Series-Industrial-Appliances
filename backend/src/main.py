from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router  # Changed from src.api.routes
from core.model_loader import load_artifacts  # Changed from src.core.model_loader
from core.service import init_service  # Changed from src.core.service
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Anomaly Detection API",
    description="Hybrid LSTM + Isolation Forest",
    version="1.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    logger.info("Loading models...")
    artifacts = load_artifacts()
    init_service(artifacts)
    logger.info("Application ready!")

@app.get("/")
def root():
    return {"message": "SWAT Anomaly Detection API"}

@app.get("/health")
def health():
    return {"status": "healthy"}

app.include_router(router)