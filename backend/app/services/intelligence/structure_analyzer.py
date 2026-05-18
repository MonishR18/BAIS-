import pandas as pd
from typing import Dict, Any

class StructureAnalyzer:
    def __init__(self, df: pd.DataFrame):
        self.df = df

    def analyze(self) -> Dict[str, Any]:
        """Analyzes the dataset structure and classifies columns."""
        summary = {
            "rows": int(self.df.shape[0]),
            "columns": int(self.df.shape[1]),
            "duplicates": int(self.df.duplicated().sum()),
            "missing_values_total": int(self.df.isnull().sum().sum())
        }

        col_analysis = {
            "numerical": [],
            "categorical": [],
            "boolean": [],
            "datetime": [],
            "text": []
        }

        for col in self.df.columns:
            dtype = self.df[col].dtype
            num_unique = self.df[col].nunique()
            
            if pd.api.types.is_bool_dtype(dtype) or set(self.df[col].dropna().unique()).issubset({0, 1, '0', '1', 'True', 'False', True, False}):
                col_analysis["boolean"].append(col)
            elif pd.api.types.is_datetime64_any_dtype(dtype):
                col_analysis["datetime"].append(col)
            elif pd.api.types.is_numeric_dtype(dtype):
                # If very few unique values, might be categorical
                if num_unique < 10 and num_unique < len(self.df) * 0.1:
                    col_analysis["categorical"].append(col)
                else:
                    col_analysis["numerical"].append(col)
            elif pd.api.types.is_object_dtype(dtype) or pd.api.types.is_string_dtype(dtype):
                # Check for datetime masquerading as strings
                try:
                    pd.to_datetime(self.df[col].dropna().head(5))
                    col_analysis["datetime"].append(col)
                    continue
                except (ValueError, TypeError):
                    pass
                
                # Check if text or categorical based on uniqueness ratio
                if num_unique > len(self.df) * 0.5 and num_unique > 50:
                    col_analysis["text"].append(col)
                else:
                    col_analysis["categorical"].append(col)

        return {
            "dataset_summary": summary,
            "column_analysis": col_analysis
        }
