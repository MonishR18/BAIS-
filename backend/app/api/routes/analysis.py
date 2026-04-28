from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pathlib import Path
from app.schemas.analysis_schema import AnalyzeRequest
from app.services.bias_engine import BiasEngine
from app.services.risk_engine import calculate_risk_score
from app.core.database import get_db
from app.models.report import Report
import uuid
import json

router = APIRouter()

@router.post("/analyze")
def analyze_endpoint(payload: AnalyzeRequest, db: Session = Depends(get_db)):
    upload_dir = Path(__file__).resolve().parents[3] / "data" / "uploads"
    file_path = upload_dir / payload.dataset_id
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    engine = BiasEngine()
    try:
        metrics = engine.analyze(
            file_path=str(file_path),
            target_column=payload.target_column,
            sensitive_attribute=payload.sensitive_attributes[0],
            prediction_column=payload.prediction_column
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    risk = calculate_risk_score(metrics)
    report_id = uuid.uuid4().hex
    
    new_report = Report(
        report_id=report_id,
        dataset_id=payload.dataset_id,
        target_column=payload.target_column,
        sensitive_attributes_json=json.dumps(payload.sensitive_attributes),
        metrics_json=json.dumps(metrics),
        risk_score=risk["risk_score"],
        risk_level=risk["risk_level"]
    )
    db.add(new_report)
    db.commit()
    
    return {
        "report_id": report_id,
        "dataset_id": payload.dataset_id,
        "metrics": metrics,
        "risk_score": risk["risk_score"],
        "risk_level": risk["risk_level"]
    }
