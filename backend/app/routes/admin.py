from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.dependencies import get_current_admin
from backend.app.db_models.user import User
from backend.app.schemas.admin import (
    AdminUserUpdate,
    EnvelopeSingle,
    EnvelopePaginated
)
from backend.app.services import admin_service

router = APIRouter()

@router.get("/users", response_model=EnvelopePaginated)
def get_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    data = admin_service.get_all_users(db, page, page_size, search)
    return {
        "success": True,
        "message": "Users retrieved successfully",
        "data": data
    }

@router.get("/users/{user_id}", response_model=EnvelopeSingle)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    user_detail = admin_service.get_user_detail(db, user_id)
    return {
        "success": True,
        "message": "User retrieved successfully",
        "data": user_detail
    }

@router.patch("/users/{user_id}", response_model=EnvelopeSingle)
def update_user_details(
    user_id: int,
    data: AdminUserUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    updated_user = admin_service.update_user(db, user_id, data)
    return {
        "success": True,
        "message": "User updated successfully",
        "data": updated_user
    }

@router.delete("/users/{user_id}")
def delete_user_account(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    admin_service.delete_user(db, user_id, current_admin.id)
    return {
        "success": True,
        "message": "User deleted"
    }

@router.get("/projects", response_model=EnvelopePaginated)
def get_projects(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    data = admin_service.get_all_projects(db, page, page_size)
    return {
        "success": True,
        "message": "Projects retrieved successfully",
        "data": data
    }

@router.get("/stats", response_model=EnvelopeSingle)
def get_system_stats(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    stats = admin_service.get_stats(db)
    return {
        "success": True,
        "message": "Stats retrieved successfully",
        "data": stats
    }
