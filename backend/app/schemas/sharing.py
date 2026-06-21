from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional
from backend.app.schemas.project import GeneratedArtifactOut

class ShareLinkOut(BaseModel):
    share_token: str
    share_url: str           # full URL, computed
    is_active: bool
    view_count: int
    created_at: datetime

    class Config:
        from_attributes = True

class PublicProjectOut(BaseModel):
    title: str
    description: Optional[str] = None
    created_at: datetime
    artifacts: List[GeneratedArtifactOut]   # reuse existing schema

    class Config:
        from_attributes = True
