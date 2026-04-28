from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from pathlib import Path
from uuid import uuid4
import joblib

router = APIRouter()

_UPLOAD_DIR = Path(__file__).resolve().parents[3] / "data" / "uploads"
_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/dataset")
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv") and not file.filename.endswith(".json"):
        raise HTTPException(status_code=400, detail="Only CSV/JSON allowed")
        
    dataset_id = uuid4().hex
    dest = _UPLOAD_DIR / f"{dataset_id}_{file.filename}"
    
    content = await file.read()
    dest.write_bytes(content)
    
    return {"dataset_id": f"{dataset_id}_{file.filename}", "message": "Dataset uploaded successfully"}

@router.post("/model")
async def upload_model(file: UploadFile = File(...)):
    if not file.filename.endswith(".pkl") and not file.filename.endswith(".joblib"):
        raise HTTPException(status_code=400, detail="Only .pkl or .joblib allowed")
        
    model_id = uuid4().hex
    dest = _UPLOAD_DIR / f"{model_id}_{file.filename}"
    
    content = await file.read()
    dest.write_bytes(content)
    
    try:
        joblib.load(dest)
    except Exception as e:
        dest.unlink()
        raise HTTPException(status_code=400, detail=f"Invalid model file: {e}")
        
    return {"model_id": f"{model_id}_{file.filename}", "message": "Model loaded securely"}
