from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from pathlib import Path

from app.core.security import get_current_user_email
from app.services.bias_engine import BiasEngine, BiasEngineError


router = APIRouter()
root_router = APIRouter()


class AnalyzeRequest(BaseModel):
    dataset_id: str | None = Field(default=None, min_length=1)
    file_path: str | None = Field(default=None, min_length=1)
    target_column: str = Field(min_length=1)
    sensitive_attribute: str = Field(min_length=1)
    prediction_column: str = Field(default="prediction", min_length=1)


@router.get("/protected")
def protected_route(current_user_email: str = Depends(get_current_user_email)) -> dict:
    return {"message": "You are authenticated", "user": current_user_email}


@root_router.post("/analyze")
def analyze(payload: AnalyzeRequest) -> dict:
    engine = BiasEngine()
    if not payload.dataset_id and not payload.file_path:
        raise HTTPException(status_code=400, detail="Provide either dataset_id or file_path")

    file_path: str
    if payload.dataset_id:
        upload_dir = Path(__file__).resolve().parents[3] / "data" / "uploads"
        candidate = upload_dir / f"{payload.dataset_id}.csv"
        if not candidate.exists():
            raise HTTPException(status_code=404, detail="Dataset not found")
        file_path = str(candidate)
    else:
        file_path = payload.file_path or ""

    try:
        return engine.analyze(
            file_path=file_path,
            target_column=payload.target_column,
            sensitive_attribute=payload.sensitive_attribute,
            prediction_column=payload.prediction_column,
        )
    except BiasEngineError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
