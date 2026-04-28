from fastapi import APIRouter

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats():
    return {
        "auditTrendData": [
            {"month": "Oct", "passed": 12, "failed": 5, "total": 17},
            {"month": "Nov", "passed": 15, "failed": 4, "total": 19},
            {"month": "Dec", "passed": 18, "failed": 6, "total": 24},
            {"month": "Jan", "passed": 22, "failed": 3, "total": 25},
            {"month": "Feb", "passed": 28, "failed": 4, "total": 32},
            {"month": "Mar", "passed": 31, "failed": 2, "total": 33},
            {"month": "Apr", "passed": 35, "failed": 3, "total": 38},
        ],
        "metricsRadarData": [
            {"metric": "Demographic Parity", "score": 68},
            {"metric": "Equal Opportunity", "score": 82},
            {"metric": "Equalized Odds", "score": 74},
            {"metric": "Disparate Impact", "score": 79},
            {"metric": "Predictive Parity", "score": 85},
            {"metric": "Calibration", "score": 71},
        ],
        "biasDistributionData": [
            {"domain": "Hiring", "high": 4, "medium": 8, "low": 12},
            {"domain": "Banking", "high": 3, "medium": 6, "low": 9},
            {"domain": "Healthcare", "high": 2, "medium": 5, "low": 11},
            {"domain": "Education", "high": 1, "medium": 4, "low": 14},
        ],
        "recentAudits": [
            {"id": "AUD-2847", "model": "Loan Approval v3.2", "domain": "Banking", "status": "critical", "score": 54, "time": "2h ago"},
            {"id": "AUD-2846", "model": "Resume Screener v1.8", "domain": "Hiring", "status": "warning", "score": 71, "time": "5h ago"},
            {"id": "AUD-2845", "model": "Risk Predictor v2.1", "domain": "Insurance", "status": "passed", "score": 88, "time": "1d ago"},
            {"id": "AUD-2844", "model": "Credit Score Engine", "domain": "Banking", "status": "passed", "score": 91, "time": "1d ago"},
            {"id": "AUD-2843", "model": "Patient Triage AI", "domain": "Healthcare", "status": "warning", "score": 67, "time": "2d ago"},
        ],
        "statCards": [
            {"label": "Total Audits", "value": "1,247", "change": "+12%", "color": "violet"},
            {"label": "Bias Detected", "value": "342", "change": "-8%", "color": "amber"},
            {"label": "Passed Audits", "value": "905", "change": "+18%", "color": "emerald"},
            {"label": "Avg. Fairness Score", "value": "76.4", "change": "+3.2", "color": "blue"},
        ]
    }
