from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.okrs import router as okrs_router
from app.db.models import Base
from app.db.session import engine

Base.metadata.create_all(bind=engine)  # Dev only

app = FastAPI(title="OKR Evaluator API", version="1.0.0")

# Prometheus metrics at /metrics
Instrumentator().instrument(app).expose(app, include_in_schema=False, endpoint="/metrics")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(okrs_router, prefix="/api/v1/okrs", tags=["okrs"])
