from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean
from datetime import datetime
from app.core.database import Base

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(String, unique=True, index=True)
    dataset_id = Column(String, index=True)
    model_id = Column(String, nullable=True)
    target_column = Column(String)
    sensitive_attributes_json = Column(String) # JSON string
    metrics_json = Column(String) # JSON string
    risk_score = Column(Float)
    risk_level = Column(String)
    mitigation_applied = Column(Boolean, default=False)
    explainability_json = Column(String, nullable=True) # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)
