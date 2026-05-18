import pandas as pd
from typing import List, Dict, Any

class SensitiveAttributeDetector:
    def __init__(self, df: pd.DataFrame):
        self.df = df
        
        # Explicitly protected attributes by law or common fairness frameworks
        self.protected_keywords = {
            'High': ['race', 'gender', 'sex', 'ethnicity', 'religion', 'age', 'disability', 'nationality', 'national_origin'],
            'Medium': ['marital_status', 'pregnancy', 'veteran', 'citizen']
        }
        
        # Attributes that often act as proxies for protected attributes (e.g. zip code -> race, income -> gender/race)
        self.proxy_keywords = {
            'High': ['zip', 'zip_code', 'postal', 'location', 'address', 'neighborhood'],
            'Medium': ['income', 'salary', 'education', 'degree', 'language']
        }

    def detect(self) -> List[Dict[str, Any]]:
        """Identifies explicit sensitive attributes and potential proxies."""
        sensitive_cols = []
        
        for col in self.df.columns:
            col_lower = col.lower()
            
            # Check for direct protected attributes
            for level, keywords in self.protected_keywords.items():
                if any(k in col_lower for k in keywords):
                    sensitive_cols.append({
                        "attribute": col,
                        "sensitivity_level": level,
                        "risk_score": 0.9 if level == 'High' else 0.7,
                        "explanation": f"Column '{col}' is a known protected demographic attribute ({level} Risk)."
                    })
                    break # Stop checking proxy if already found as protected
            else:
                # If not explicitly protected, check if it's a known proxy
                for level, keywords in self.proxy_keywords.items():
                    if any(k in col_lower for k in keywords):
                        sensitive_cols.append({
                            "attribute": col,
                            "sensitivity_level": "Proxy",
                            "risk_score": 0.6 if level == 'High' else 0.4,
                            "explanation": f"Column '{col}' is a potential proxy variable that may indirectly leak sensitive demographic information."
                        })
                        break
                        
            # Note: A more advanced version would also compute correlation (Cramer's V) 
            # between all columns and the identified protected attributes to find latent proxies.
            
        return sensitive_cols
