import shap
import pandas as pd
import numpy as np
import joblib
from typing import Dict, Any

class ExplainabilityEngine:
    def __init__(self, model_path: str):
        self.model = joblib.load(model_path)
        
    def generate_global_shap(self, df: pd.DataFrame, target_column: str) -> Dict[str, Any]:
        X = df.drop(columns=[target_column]).select_dtypes(include=[np.number])
        try:
            explainer = shap.TreeExplainer(self.model)
            shap_values = explainer.shap_values(X)
        except Exception:
            explainer = shap.KernelExplainer(self.model.predict, shap.sample(X, 100))
            shap_values = explainer.shap_values(X[:100])
            
        if isinstance(shap_values, list):
            shap_values = shap_values[1] # For classification, take positive class
            
        vals = np.abs(shap_values).mean(0)
        feature_importance = pd.DataFrame(list(zip(X.columns, vals)), columns=['feature', 'shap_importance'])
        feature_importance.sort_values(by=['shap_importance'], ascending=False, inplace=True)
        return {"global_shap": feature_importance.to_dict(orient="records")}
