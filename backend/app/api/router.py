from fastapi import APIRouter

from app.api.routes import analysis, auth, upload, dashboard, model, reports, mitigate


api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(upload.router, prefix="/upload", tags=["upload"])
api_router.include_router(analysis.router, prefix="", tags=["analysis"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(model.router, prefix="/model", tags=["model"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(mitigate.router, prefix="/mitigate", tags=["mitigate"])
api_router.include_router(analysis.root_router, tags=["analysis"])
