import pandas as pd
import numpy as np
from typing import Dict, Any

class LabelPredictor:
    def __init__(self, df: pd.DataFrame, col_analysis: Dict[str, list]):
        self.df = df
        self.col_analysis = col_analysis
        self.common_target_names = [
            'target', 'label', 'class', 'outcome', 'approved', 
            'decision', 'risk', 'fraud', 'prediction', 'salary', 'income',
            'churn', 'default', 'survived', 'status'
        ]

    def predict(self) -> Dict[str, Any]:
        """Predicts the most likely target column and problem type."""
        scores = {}
        
        for col in self.df.columns:
            score = 0.0
            
            # 1. Lexical Matching
            col_lower = col.lower()
            if any(name in col_lower for name in self.common_target_names):
                score += 0.5
            elif col_lower in self.common_target_names:
                score += 0.8
                
            # 2. Heuristics based on unique values and placement
            num_unique = self.df[col].nunique()
            
            # Highly unlikely to be a target if it's an ID (all unique) or constant
            if num_unique == len(self.df) or num_unique == 1:
                scores[col] = 0
                continue
                
            # Binary classification targets are very common
            if num_unique == 2:
                score += 0.4
                
            # Multi-class targets
            elif 2 < num_unique <= 10:
                score += 0.2
                
            # Usually the target is the last column
            if self.df.columns[-1] == col:
                score += 0.3
                
            scores[col] = min(score, 0.99) # Cap at 0.99 confidence
            
        if not scores or max(scores.values()) == 0:
            return {
                "predicted_target": "None Found",
                "confidence": 0.0,
                "problem_type": "Unknown",
                "reasoning": "Could not identify a clear target column based on name or distribution heuristics."
            }
            
        best_target = max(scores, key=scores.get)
        confidence = scores[best_target]
        
        # Determine problem type
        num_unique = self.df[best_target].nunique()
        if num_unique == 2:
            problem_type = "binary_classification"
        elif pd.api.types.is_numeric_dtype(self.df[best_target].dtype) and num_unique > 20:
            problem_type = "regression"
        else:
            problem_type = "multi_class_classification"
            
        reasoning = f"Selected '{best_target}' as the target column. "
        if best_target.lower() in [n for n in self.common_target_names]:
            reasoning += "It matches common target naming conventions. "
        if best_target == self.df.columns[-1]:
            reasoning += "It is located at the end of the dataset. "
            
        return {
            "predicted_target": best_target,
            "confidence": round(confidence, 2),
            "problem_type": problem_type,
            "reasoning": reasoning.strip()
        }
