from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List, Optional
from backend.app.core.database import get_db
from backend.app.core.dependencies import get_current_user
from backend.app.db_models.user import User
from backend.app.schemas.project import ProjectCreate, ProjectOut, GeneratedArtifactCreate
from backend.app.services.project_service import create_project, list_projects, get_project, delete_project, update_project

router = APIRouter()

@router.post("/", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def save_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        return create_project(db, project_in, current_user.id)
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred while saving the project"
        )

@router.get("/", response_model=List[ProjectOut])
def get_all_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        return list_projects(db, current_user.id)
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred while retrieving projects"
        )

@router.get("/{project_id}", response_model=ProjectOut)
def get_project_by_id(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        project = get_project(db, project_id, current_user.id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        return project
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred while retrieving the project"
        )

@router.delete("/{project_id}")
def delete_project_by_id(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        deleted = delete_project(db, project_id, current_user.id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        return {"message": "Project deleted successfully"}
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred while deleting the project"
        )

from pydantic import BaseModel

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    artifacts: Optional[List[GeneratedArtifactCreate]] = None

@router.put("/{project_id}", response_model=ProjectOut)
def update_project_by_id(
    project_id: int,
    project_update: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        project = update_project(
            db=db,
            project_id=project_id,
            title=project_update.title,
            artifacts=project_update.artifacts,
            user_id=current_user.id
        )
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        return project
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred while updating the project"
        )
