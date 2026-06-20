from datetime import datetime
from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any

class AdminUserProjectOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AdminUserOut(BaseModel):
    id: int
    email: str
    role: str
    is_active: bool
    created_at: datetime
    project_count: int        # computed field
    last_generation_at: Optional[datetime] = None  # computed field
    projects: List[AdminUserProjectOut] = []

    class Config:
        from_attributes = True

class AdminUserUpdate(BaseModel):
    is_active: Optional[bool] = None
    role: Optional[str] = None    # "user" or "admin"

class AdminStatsOut(BaseModel):
    total_users: int
    active_users: int
    total_projects: int
    total_artifacts_generated: int
    generations_today: int
    generations_this_week: int
    new_users_this_week: int

class PaginatedResponse(BaseModel):
    items: list
    total: int
    page: int
    page_size: int
    total_pages: int

class AdminProjectOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    user_id: int
    owner_email: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Consistent response envelopes
class EnvelopeSingle(BaseModel):
    success: bool
    message: str
    data: Any

class EnvelopePaginated(BaseModel):
    success: bool
    message: str
    data: PaginatedResponse

class EnvelopeError(BaseModel):
    success: bool
    message: str
    detail: Any
