def calculate_risk_score(metrics: dict) -> dict:
    dp_diff = metrics.get('demographic_parity', {}).get('difference', 0)
    eo_diff = metrics.get('equal_opportunity', {}).get('difference', 0)
    di_min = metrics.get('disparate_impact', {}).get('min_ratio', 1.0)
    
    di_penalty = max(0, abs(1.0 - di_min) - 0.2) * 100
    dp_penalty = max(0, dp_diff - 0.05) * 500
    eo_penalty = max(0, eo_diff - 0.05) * 500
    
    total_penalty = di_penalty + dp_penalty + eo_penalty
    score = max(0, min(100, 100 - total_penalty))
    
    level = "LOW"
    if score < 60:
        level = "CRITICAL"
    elif score < 80:
        level = "HIGH"
    elif score < 90:
        level = "MEDIUM"
        
    return {"risk_score": round(score, 1), "risk_level": level}
