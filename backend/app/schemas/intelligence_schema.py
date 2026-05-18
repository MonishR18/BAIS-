from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class DatasetSummary(BaseModel):
    rows: int
    columns: int
    duplicates: int
    missing_values_total: int

class ColumnAnalysis(BaseModel):
    numerical: List[str]
    categorical: List[str]
    boolean: List[str]
    datetime: List[str]
    text: List[str]

class TargetAnalysis(BaseModel):
    predicted_target: str
    confidence: float
    problem_type: str
    reasoning: str

class SensitiveAttribute(BaseModel):
    attribute: str
    sensitivity_level: str
    risk_score: float
    explanation: str

class BiasRiskAnalysis(BaseModel):
    risk_level: str
    risk_score: float
    issues: List[str]

class PreprocessingRecommendation(BaseModel):
    step: str
    target_columns: List[str]
    reason: str

class FairnessRecommendation(BaseModel):
    framework: str
    recommendation: str

class ModelReadiness(BaseModel):
    ready: bool
    warnings: List[str]

class DatasetIntelligenceResponse(BaseModel):
    dataset_summary: DatasetSummary
    column_analysis: ColumnAnalysis
    target_analysis: TargetAnalysis
    sensitive_attributes: List[SensitiveAttribute]
    bias_risk_analysis: BiasRiskAnalysis
    preprocessing_recommendations: List[PreprocessingRecommendation]
    fairness_recommendations: List[FairnessRecommendation]
    model_readiness: ModelReadiness
