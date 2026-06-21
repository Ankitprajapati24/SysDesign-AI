from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from backend.app.core.database import get_db
from backend.app.core.dependencies import get_current_user
from backend.app.core.config import settings
from backend.app.db_models.user import User
from backend.app.schemas.sharing import ShareLinkOut, PublicProjectOut
from backend.app.services import sharing_service

router = APIRouter()

# Response envelopes
from pydantic import BaseModel

class ShareLinkResponse(BaseModel):
    success: bool
    message: str
    data: Optional[ShareLinkOut] = None

class PublicProjectResponse(BaseModel):
    success: bool
    message: str
    data: PublicProjectOut

class GeneralResponse(BaseModel):
    success: bool
    message: str


@router.post("/projects/{project_id}/share", response_model=ShareLinkResponse, status_code=status.HTTP_200_OK)
def create_share_link(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    link = sharing_service.create_or_get_share_link(db, project_id, current_user.id)
    return {
        "success": True,
        "message": "Share link created successfully",
        "data": {
            "share_token": link.share_token,
            "share_url": f"{settings.FRONTEND_URL}/share/{link.share_token}",
            "is_active": link.is_active,
            "view_count": link.view_count,
            "created_at": link.created_at
        }
    }


@router.get("/projects/{project_id}/share", response_model=ShareLinkResponse)
def get_share_link_info(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    link = sharing_service.get_share_link(db, project_id, current_user.id)
    if not link:
        return {
            "success": True,
            "message": "No share link exists for this project",
            "data": None
        }
    return {
        "success": True,
        "message": "Share link retrieved successfully",
        "data": {
            "share_token": link.share_token,
            "share_url": f"{settings.FRONTEND_URL}/share/{link.share_token}",
            "is_active": link.is_active,
            "view_count": link.view_count,
            "created_at": link.created_at
        }
    }


@router.delete("/projects/{project_id}/share", response_model=GeneralResponse)
def revoke_share_link(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sharing_service.revoke_share_link(db, project_id, current_user.id)
    return {
        "success": True,
        "message": "Share link revoked"
    }


@router.get("/public/shared/{share_token}", response_model=PublicProjectResponse)
def get_public_project_by_token(
    share_token: str,
    db: Session = Depends(get_db)
):
    project = sharing_service.get_public_project(db, share_token)
    return {
        "success": True,
        "message": "Public project retrieved successfully",
        "data": project
    }
