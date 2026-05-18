from typing import Dict, Any

class ExplainabilityLayer:
    """
    Translates the heuristic and statistical outputs of the intelligence engine
    into human-readable justifications to ensure system transparency.
    """
    
    @staticmethod
    def generate_readiness_report(
        dataset_summary: Dict[str, Any],
        target_analysis: Dict[str, Any],
        risk_analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        
        warnings = []
        ready = True
        
        # Check dataset size
        if dataset_summary['rows'] < 100:
            warnings.append("Dataset is very small (<100 rows). ML models and fairness metrics may not be statistically significant.")
            ready = False
            
        # Check missing values
        if dataset_summary['missing_values_total'] > (dataset_summary['rows'] * dataset_summary['columns']) * 0.1:
            warnings.append("Dataset has >10% overall missing values. Heavy imputation required.")
            ready = False
            
        # Check target
        if target_analysis['confidence'] < 0.5:
            warnings.append(f"Low confidence in target prediction ({target_analysis['predicted_target']}). Please verify the label manually.")
            ready = False
            
        # Check Bias Risk
        if risk_analysis['risk_level'] == 'HIGH':
            warnings.append("High bias risk detected. Mitigation is strongly recommended before deploying any models on this data.")
            # We don't mark ready=False for bias, as the platform's job is to analyze it,
            # but it is a critical warning.
            
        if not warnings:
            warnings.append("Dataset structure looks clean and ready for ML modeling.")
            
        return {
            "ready": ready,
            "warnings": warnings
        }
