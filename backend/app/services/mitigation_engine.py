import pandas as pd
from typing import Dict, Any
from app.services.bias_engine import BiasEngine

class MitigationEngine:
    def __init__(self):
        self.bias_engine = BiasEngine()

    def apply_reweighing(self, df: pd.DataFrame, target_col: str, sensitive_col: str) -> Dict[str, Any]:
        df = df.dropna(subset=[sensitive_col, target_col]).copy()
        df[sensitive_col] = df[sensitive_col].astype(str)
        df[target_col] = self.bias_engine._coerce_binary_series(df[target_col], target_col)
        
        n = len(df)
        weights_dict = {}
        s_vals = df[sensitive_col].unique()
        y_vals = df[target_col].unique()
        
        for s in s_vals:
            p_s = len(df[df[sensitive_col] == s]) / n
            for y_val in y_vals:
                p_y = len(df[df[target_col] == y_val]) / n
                p_sy = len(df[(df[sensitive_col] == s) & (df[target_col] == y_val)]) / n
                weights_dict[(s, y_val)] = (p_s * p_y) / p_sy if p_sy > 0 else 1.0
                
        df['weights'] = df.apply(lambda row: weights_dict[(row[sensitive_col], row[target_col])], axis=1)
        
        return {
            "success": True,
            "weights": df['weights'].tolist(),
            "message": "Reweighing completed successfully."
        }
