import pandas as pd
from typing import Dict, Any, List

class BiasRiskAnalyzer:
    def __init__(self, df: pd.DataFrame, target_col: str, sensitive_attrs: List[Dict[str, Any]]):
        self.df = df
        self.target_col = target_col
        self.sensitive_attrs = [s['attribute'] for s in sensitive_attrs if s['sensitivity_level'] == 'High']
        
    def analyze(self) -> Dict[str, Any]:
        """Analyzes representation bias and historical bias."""
        issues = []
        risk_score = 0.0
        
        # 1. Target Imbalance Analysis
        if self.target_col in self.df.columns:
            target_counts = self.df[self.target_col].value_counts(normalize=True)
            min_class_ratio = target_counts.min()
            
            if min_class_ratio < 0.1:
                issues.append(f"Severe label imbalance detected in target '{self.target_col}'. Minority class is {min_class_ratio:.1%}.")
                risk_score += 30
            elif min_class_ratio < 0.3:
                issues.append(f"Moderate label imbalance detected in target '{self.target_col}'. Minority class is {min_class_ratio:.1%}.")
                risk_score += 15

        # 2. Representation Bias (Demographic Parity in dataset)
        for attr in self.sensitive_attrs:
            if attr in self.df.columns:
                counts = self.df[attr].value_counts(normalize=True)
                min_group_ratio = counts.min()
                
                if min_group_ratio < 0.05:
                    issues.append(f"Critical underrepresentation in sensitive attribute '{attr}'. Minority group is only {min_group_ratio:.1%}.")
                    risk_score += 40
                elif min_group_ratio < 0.2:
                    issues.append(f"Representation bias in sensitive attribute '{attr}'. Minority group is {min_group_ratio:.1%}.")
                    risk_score += 20
                    
                # 3. Simple proxy for Historical Bias: Target vs Sensitive Attribute correlation
                if self.target_col in self.df.columns and len(counts) <= 10:
                    # Calculate simple cross-tabulation variation
                    try:
                        cross = pd.crosstab(self.df[attr], self.df[self.target_col], normalize='index')
                        # If the outcome probability varies wildly across groups, flag it
                        variation = cross.var(axis=0).mean()
                        if variation > 0.05: # Arbitrary threshold for variation
                            issues.append(f"Historical bias suspected: The distribution of target '{self.target_col}' varies significantly across groups in '{attr}'.")
                            risk_score += 25
                    except Exception:
                        pass
        
        # Cap risk score
        risk_score = min(risk_score, 100.0)
        
        if risk_score > 70:
            risk_level = "HIGH"
        elif risk_score > 30:
            risk_level = "MEDIUM"
        elif risk_score > 0:
            risk_level = "LOW"
        else:
            risk_level = "MINIMAL"
            
        if not issues:
            issues.append("No immediate structural fairness risks detected. However, algorithmic evaluation is still recommended.")
            
        return {
            "risk_level": risk_level,
            "risk_score": round(risk_score, 1),
            "issues": issues
        }
