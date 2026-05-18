from fastapi import APIRouter, HTTPException, UploadFile, File
import pandas as pd
import io

from app.schemas.intelligence_schema import DatasetIntelligenceResponse
from app.services.intelligence.dataset_analyzer import DatasetAnalyzer

router = APIRouter()

@router.post("/analyze-intelligence", response_model=DatasetIntelligenceResponse)
async def analyze_dataset_intelligence(file: UploadFile = File(...)):
    """
    Ingests a CSV dataset, runs the ML-powered intelligence pipeline, and returns 
    structured JSON detailing structure, predicted targets, sensitive attributes, 
    bias risks, and preprocessing recommendations.
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")
        
    try:
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        # Initialize and run the engine
        analyzer = DatasetAnalyzer(df)
        result = analyzer.run_full_analysis()
        
        return result
        
    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="The uploaded CSV file is empty.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Intelligence Analysis failed: {str(e)}")
