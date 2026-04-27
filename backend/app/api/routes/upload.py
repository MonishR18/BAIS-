from __future__ import annotations

from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, File, HTTPException, UploadFile, status


_UPLOAD_DIR = Path(__file__).resolve().parents[3] / "data" / "uploads"



router = APIRouter()


@router.post("/dataset", status_code=status.HTTP_201_CREATED)
async def upload_dataset(file: UploadFile = File(...)) -> dict:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing filename")

    suffix = Path(file.filename).suffix.lower()
    if suffix != ".csv":
        raise HTTPException(status_code=400, detail="Only .csv files are supported")

    dataset_id = uuid4().hex
    _UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    dest = _UPLOAD_DIR / f"{dataset_id}.csv"

    try:
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")
        dest.write_bytes(content)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Failed to store uploaded file") from exc

    return {
        "dataset_id": dataset_id,
        "filename": file.filename,
        "stored_path": str(dest),
    }
