from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timedelta, timezone
from backend.app.db_models.user import User
from backend.app.db_models.project import Project, GeneratedArtifact
from backend.app.schemas.admin import AdminUserUpdate

def get_all_users(
    db: Session, 
    page: int = 1, 
    page_size: int = 20,
    search: str | None = None
) -> dict:
    query = db.query(User)
    
    if search:
        query = query.filter(User.email.ilike(f"%{search}%"))
    
    total = query.count()
    
    users = query.options(joinedload(User.projects)) \
                 .order_by(User.created_at.desc()) \
                 .offset((page - 1) * page_size) \
                 .limit(page_size) \
                 .all()
    
    # Enrich with project_count, last_generation_at, and projects list using preloaded data
    enriched = []
    for user in users:
        sorted_projects = sorted(user.projects, key=lambda p: p.created_at or datetime.min, reverse=True)
        project_count = len(sorted_projects)
        last_project = sorted_projects[0] if sorted_projects else None
        
        projects_list = []
        for p in sorted_projects:
            projects_list.append({
                "id": p.id,
                "title": p.title,
                "description": p.description,
                "created_at": p.created_at,
                "updated_at": p.updated_at
            })
        
        enriched.append({
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active,
            "created_at": user.created_at,
            "project_count": project_count,
            "last_generation_at": last_project.created_at if last_project else None,
            "projects": projects_list
        })
    
    return {
        "items": enriched,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if total > 0 else 1
    }


def get_user_detail(db: Session, user_id: int) -> dict:
    user = db.query(User).options(joinedload(User.projects)).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    sorted_projects = sorted(user.projects, key=lambda p: p.created_at or datetime.min, reverse=True)
    project_count = len(sorted_projects)
    last_project = sorted_projects[0] if sorted_projects else None
    
    projects_list = []
    for p in sorted_projects:
        projects_list.append({
            "id": p.id,
            "title": p.title,
            "description": p.description,
            "created_at": p.created_at,
            "updated_at": p.updated_at
        })
    
    return {
        "id": user.id,
        "email": user.email,
        "role": user.role,
        "is_active": user.is_active,
        "created_at": user.created_at,
        "project_count": project_count,
        "last_generation_at": last_project.created_at if last_project else None,
        "projects": projects_list
    }


def update_user(db: Session, user_id: int, data: AdminUserUpdate) -> dict:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if data.is_active is not None:
        user.is_active = data.is_active
    if data.role is not None:
        if data.role not in ["user", "admin"]:
            raise HTTPException(status_code=400, detail="Invalid role")
        user.role = data.role
    
    db.commit()
    
    # Reload with eager loaded projects
    user = db.query(User).options(joinedload(User.projects)).filter(User.id == user_id).first()
    
    sorted_projects = sorted(user.projects, key=lambda p: p.created_at or datetime.min, reverse=True)
    project_count = len(sorted_projects)
    last_project = sorted_projects[0] if sorted_projects else None
    
    projects_list = []
    for p in sorted_projects:
        projects_list.append({
            "id": p.id,
            "title": p.title,
            "description": p.description,
            "created_at": p.created_at,
            "updated_at": p.updated_at
        })
    
    return {
        "id": user.id,
        "email": user.email,
        "role": user.role,
        "is_active": user.is_active,
        "created_at": user.created_at,
        "project_count": project_count,
        "last_generation_at": last_project.created_at if last_project else None,
        "projects": projects_list
    }


def delete_user(db: Session, user_id: int, current_admin_id: int) -> None:
    if user_id == current_admin_id:
        raise HTTPException(
            status_code=400, 
            detail="Cannot delete your own admin account"
        )
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()


def get_all_projects(
    db: Session,
    page: int = 1,
    page_size: int = 20
) -> dict:
    query = db.query(Project)
    total = query.count()
    
    projects = query.options(joinedload(Project.owner)) \
                    .order_by(Project.created_at.desc()) \
                    .offset((page - 1) * page_size) \
                    .limit(page_size) \
                    .all()
                     
    enriched_projects = []
    for p in projects:
        enriched_projects.append({
            "id": p.id,
            "title": p.title,
            "description": p.description,
            "user_id": p.user_id,
            "owner_email": p.owner.email if p.owner else "",
            "created_at": p.created_at,
            "updated_at": p.updated_at
        })
    
    return {
        "items": enriched_projects,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if total > 0 else 1
    }


def get_stats(db: Session) -> dict:
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = now - timedelta(days=7)
    
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    total_projects = db.query(Project).count()
    total_artifacts = db.query(GeneratedArtifact).count()
    
    # Filter by created_at timezone-aware if the database columns are timezone naive or aware
    # SQLAlchemy datetime fields can be queried by relative date
    generations_today = db.query(Project).filter(
        Project.created_at >= today_start.replace(tzinfo=None)
    ).count()
    generations_week = db.query(Project).filter(
        Project.created_at >= week_start.replace(tzinfo=None)
    ).count()
    new_users_week = db.query(User).filter(
        User.created_at >= week_start.replace(tzinfo=None)
    ).count()
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_projects": total_projects,
        "total_artifacts_generated": total_artifacts,
        "generations_today": generations_today,
        "generations_this_week": generations_week,
        "new_users_this_week": new_users_week
    }
