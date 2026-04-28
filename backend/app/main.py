from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import auth, upload, analysis, dashboard, model, reports, mitigate

app = FastAPI(title="BAIS - Bias Analysis & Mitigation System", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(upload.router, prefix="/api/v1/upload", tags=["Upload"])
app.include_router(analysis.router, prefix="/api/v1", tags=["Analysis"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["Dashboard"])
app.include_router(model.router, prefix="/api/v1/model", tags=["Model Explainability"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["Reports"])
app.include_router(mitigate.router, prefix="/api/v1/mitigate", tags=["Mitigation"])

@app.on_event("startup")
async def on_startup():
    from app.core.database import Base, engine
    Base.metadata.create_all(bind=engine)

@app.get("/health")
def health_check():
    return {"status": "Production System Online"}
