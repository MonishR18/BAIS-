import pandas as pd
from typing import Dict, Any, List

class PreprocessingRecommender:
    def __init__(self, df: pd.DataFrame, col_analysis: Dict[str, list], target_col: str):
        self.df = df
        self.col_analysis = col_analysis
        self.target_col = target_col

    def recommend(self) -> Dict[str, List[Dict[str, Any]]]:
        """Generates standard preprocessing and fairness mitigation recommendations."""
        preprocessing = []
        fairness = []
        
        # 1. Missing Values
        missing_cols = self.df.columns[self.df.isnull().sum() > 0].tolist()
        if missing_cols:
            preprocessing.append({
                "step": "Imputation",
                "target_columns": missing_cols,
                "reason": "Missing values detected. Consider SimpleImputer (mean/median for numerical, mode for categorical) or dropping columns if >50% null."
            })
            
        # 2. Categorical Encoding
        if self.col_analysis['categorical']:
            # Filter out target column
            cats_to_encode = [c for c in self.col_analysis['categorical'] if c != self.target_col]
            if cats_to_encode:
                preprocessing.append({
                    "step": "One-Hot / Label Encoding",
                    "target_columns": cats_to_encode,
                    "reason": "Categorical variables must be numerically encoded for most ML models. Use One-Hot for nominal and Label/Ordinal for ordered categories."
                })
                
        # 3. Scaling
        if self.col_analysis['numerical']:
            nums_to_scale = [c for c in self.col_analysis['numerical'] if c != self.target_col]
            if nums_to_scale:
                preprocessing.append({
                    "step": "Standardization / Normalization",
                    "target_columns": nums_to_scale,
                    "reason": "Numerical features have varying scales. StandardScaler or MinMaxScaler prevents features with large values from dominating the model."
                })
                
        # 4. Target Imbalance (if classification)
        if self.target_col in self.df.columns and self.df[self.target_col].nunique() < 10:
            counts = self.df[self.target_col].value_counts(normalize=True)
            if counts.min() < 0.2:
                preprocessing.append({
                    "step": "Class Balancing (SMOTE / Undersampling)",
                    "target_columns": [self.target_col],
                    "reason": f"Class imbalance detected. Minority class is only {counts.min():.1%}. Applying SMOTE or class weights will improve model recall."
                })
                
        # Fairness Recommendations
        fairness.append({
            "framework": "AIF360 / Fairlearn",
            "recommendation": "Use Reweighing (Pre-processing) to balance the weights of privileged and unprivileged groups before training."
        })
        fairness.append({
            "framework": "Scikit-Learn / XGBoost",
            "recommendation": "If using a standard model, ensure sensitive attributes are explicitly excluded (dropped) from the training feature set (X) to prevent direct disparate treatment."
        })

        return {
            "preprocessing": preprocessing,
            "fairness": fairness
        }
