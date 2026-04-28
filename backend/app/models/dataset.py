from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.core.database import Base

class DatasetMetadata(Base):
    __tablename__ = "datasets"
    
    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(String, unique=True, index=True)
    filename = Column(String)
    num_rows = Column(Integer, default=0)
    num_columns = Column(Integer, default=0)
    columns_json = Column(String) # store as JSON string
    uploaded_by = Column(Integer, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

class ModelMetadata(Base):
    __tablename__ = "models"
    
    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(String, unique=True, index=True)
    filename = Column(String)
    uploaded_by = Column(Integer, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
