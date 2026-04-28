from fastapi import APIRouter

router = APIRouter()

@router.get("/explain")
async def get_model_explanation():
    return {
        "shapGlobalData": [
            {"feature": "capital-gain", "shap": 0.342, "direction": "positive"},
            {"feature": "age", "shap": 0.287, "direction": "positive"},
            {"feature": "education-num", "shap": 0.241, "direction": "positive"},
            {"feature": "hours-per-week", "shap": 0.198, "direction": "positive"},
            {"feature": "occupation", "shap": 0.176, "direction": "positive"},
            {"feature": "sex", "shap": 0.154, "direction": "negative"},
            {"feature": "marital-status", "shap": 0.143, "direction": "positive"},
            {"feature": "race", "shap": 0.089, "direction": "negative"},
            {"feature": "native-country", "shap": 0.063, "direction": "negative"},
            {"feature": "relationship", "shap": 0.047, "direction": "positive"},
        ],
        "shapLocalMale": [
            {"feature": "age=38", "value": 0.18},
            {"feature": "edu=Bachelors", "value": 0.14},
            {"feature": "capital-gain=5000", "value": 0.31},
            {"feature": "hours=50", "value": 0.12},
            {"feature": "sex=Male", "value": 0.09},
            {"feature": "race=White", "value": 0.06},
            {"feature": "occupation=Prof", "value": 0.11},
        ],
        "shapLocalFemale": [
            {"feature": "age=38", "value": 0.17},
            {"feature": "edu=Bachelors", "value": 0.13},
            {"feature": "capital-gain=5000", "value": 0.30},
            {"feature": "hours=50", "value": 0.11},
            {"feature": "sex=Female", "value": -0.14},
            {"feature": "race=White", "value": 0.05},
            {"feature": "occupation=Prof", "value": 0.10},
        ],
        "limeData": [
            {"feature": "capital-gain > 3000", "weight": 0.38, "label": "Supports (+50K)"},
            {"feature": "education = Bachelors", "weight": 0.22, "label": "Supports (+50K)"},
            {"feature": "age between 35-50", "weight": 0.17, "label": "Supports (+50K)"},
            {"feature": "sex = Female", "weight": -0.19, "label": "Against (+50K)"},
            {"feature": "hours-per-week < 45", "weight": -0.12, "label": "Against (+50K)"},
            {"feature": "occupation = Service", "weight": -0.09, "label": "Against (+50K)"},
        ],
        "counterfactualData": [
            {"change": "sex: Male → Female", "impact": -0.19, "type": "protected"},
            {"change": "race: White → Black", "impact": -0.12, "type": "protected"},
            {"change": "edu-num: 13 → 16", "impact": 0.18, "type": "neutral"},
            {"change": "hours: 40 → 50", "impact": 0.09, "type": "neutral"},
            {"change": "capital-gain: 0 → 5000", "impact": 0.34, "type": "neutral"},
        ],
        "pdpAge": [
            {"age": 20, "male": 0.08, "female": 0.04},
            {"age": 25, "male": 0.13, "female": 0.06},
            {"age": 30, "male": 0.21, "female": 0.09},
            {"age": 35, "male": 0.28, "female": 0.12},
            {"age": 40, "male": 0.33, "female": 0.14},
            {"age": 45, "male": 0.36, "female": 0.15},
            {"age": 50, "male": 0.34, "female": 0.14},
            {"age": 55, "male": 0.30, "female": 0.12},
            {"age": 60, "male": 0.22, "female": 0.09},
            {"age": 65, "male": 0.15, "female": 0.06},
        ]
    }
