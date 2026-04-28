from pydantic import BaseModel
from typing import List, Optional

class AnalyzeRequest(BaseModel):
    dataset_id: str
    model_id: Optional[str] = None
    target_column: str
    sensitive_attributes: List[str]
    prediction_column: Optional[str] = "prediction"

class MitigateRequest(BaseModel):
    dataset_id: str
    algorithm: str
    target_column: str
    sensitive_attribute: str
    prediction_column: Optional[str] = "prediction"
