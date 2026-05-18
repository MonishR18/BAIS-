import pandas as pd
from typing import Dict, Any

from app.schemas.intelligence_schema import DatasetIntelligenceResponse
from .structure_analyzer import StructureAnalyzer
from .label_predictor import LabelPredictor
from .sensitive_detector import SensitiveAttributeDetector
from .bias_risk_analyzer import BiasRiskAnalyzer
from .preprocessing_recommender import PreprocessingRecommender
from .explainability_layer import ExplainabilityLayer

class DatasetAnalyzer:
    """
    Orchestrates the entire ML-powered Dataset Intelligence pipeline.
    """
    def __init__(self, df: pd.DataFrame):
        self.df = df

    def run_full_analysis(self) -> DatasetIntelligenceResponse:
        # 1. Structure Analysis
        struct_analyzer = StructureAnalyzer(self.df)
        struct_res = struct_analyzer.analyze()
        
        # 2. Label Prediction
        label_pred = LabelPredictor(self.df, struct_res['column_analysis'])
        target_res = label_pred.predict()
        target_col = target_res['predicted_target']
        
        # 3. Sensitive Attribute Detection
        sensitive_det = SensitiveAttributeDetector(self.df)
        sensitive_attrs = sensitive_det.detect()
        
        # 4. Bias Risk Analysis
        bias_analyzer = BiasRiskAnalyzer(self.df, target_col, sensitive_attrs)
        bias_res = bias_analyzer.analyze()
        
        # 5. Preprocessing & Fairness Recommendations
        prep_rec = PreprocessingRecommender(self.df, struct_res['column_analysis'], target_col)
        recs = prep_rec.recommend()
        
        # 6. Explainability / Model Readiness
        readiness = ExplainabilityLayer.generate_readiness_report(
            struct_res['dataset_summary'],
            target_res,
            bias_res
        )
        
        # 7. Assemble final Pydantic Response
        return DatasetIntelligenceResponse(
            dataset_summary=struct_res['dataset_summary'],
            column_analysis=struct_res['column_analysis'],
            target_analysis=target_res,
            sensitive_attributes=sensitive_attrs,
            bias_risk_analysis=bias_res,
            preprocessing_recommendations=recs['preprocessing'],
            fairness_recommendations=recs['fairness'],
            model_readiness=readiness
        )
