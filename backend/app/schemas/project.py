from datetime import datetime
from pydantic import BaseModel, ConfigDict
from typing import List, Optional

class GeneratedArtifactBase(BaseModel):
    artifact_type: str
    content: str

class GeneratedArtifactCreate(GeneratedArtifactBase):
    pass

class GeneratedArtifactOut(GeneratedArtifactBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    project_id: int
    created_at: datetime

class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    artifacts: List[GeneratedArtifactCreate] = []

class ProjectOut(ProjectBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    artifacts: List[GeneratedArtifactOut] = []
