from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_reports():
    return {
        "reports": [
            {
                "id": "AUD-2847", "model": "Loan Approval Classifier v3.2", "domain": "Banking",
                "date": "Apr 19, 2026", "status": "critical", "score": 54,
                "metrics": {"dp": "FAIL", "eo": "FAIL", "eodds": "FAIL", "di": "FAIL"},
                "bias_detected": True, "mitigated": False,
            },
            {
                "id": "AUD-2846", "model": "Resume Screener v1.8", "domain": "Hiring",
                "date": "Apr 19, 2026", "status": "warning", "score": 71,
                "metrics": {"dp": "WARN", "eo": "FAIL", "eodds": "WARN", "di": "PASS"},
                "bias_detected": True, "mitigated": False,
            },
            {
                "id": "AUD-2845", "model": "Insurance Risk Predictor v2.1", "domain": "Insurance",
                "date": "Apr 18, 2026", "status": "passed", "score": 88,
                "metrics": {"dp": "PASS", "eo": "PASS", "eodds": "PASS", "di": "PASS"},
                "bias_detected": False, "mitigated": True,
            },
            {
                "id": "AUD-2844", "model": "Credit Score Engine v4.0", "domain": "Banking",
                "date": "Apr 18, 2026", "status": "passed", "score": 91,
                "metrics": {"dp": "PASS", "eo": "PASS", "eodds": "PASS", "di": "PASS"},
                "bias_detected": False, "mitigated": True,
            },
            {
                "id": "AUD-2843", "model": "Patient Triage AI v1.3", "domain": "Healthcare",
                "date": "Apr 17, 2026", "status": "warning", "score": 67,
                "metrics": {"dp": "PASS", "eo": "FAIL", "eodds": "WARN", "di": "WARN"},
                "bias_detected": True, "mitigated": False,
            },
        ],
        "radarDataCritical": [
            {"metric": "Dem. Parity", "score": 22},
            {"metric": "Equal Opp.", "score": 35},
            {"metric": "Eq. Odds", "score": 28},
            {"metric": "Disp. Impact", "score": 31},
            {"metric": "Calibration", "score": 58},
            {"metric": "Ind. Fairness", "score": 44},
        ]
    }
