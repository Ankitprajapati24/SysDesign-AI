import secrets
from fastapi import HTTPException
from sqlalchemy.orm import Session
from backend.app.db_models.project import Project
from backend.app.db_models.shared_link import SharedLink
from backend.app.db_models.user import User

def create_or_get_share_link(db: Session, project_id: int, user_id: int) -> SharedLink:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.role == "admin":
        project = db.query(Project).filter(Project.id == project_id).first()
    else:
        project = db.query(Project).filter(
            Project.id == project_id,
            Project.user_id == user_id
        ).first()
        
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    existing = db.query(SharedLink).filter(
        SharedLink.project_id == project_id
    ).first()
    
    if existing:
        if not existing.is_active:
            existing.is_active = True
            db.commit()
            db.refresh(existing)
        return existing
    
    new_link = SharedLink(
        project_id=project_id,
        created_by=user_id,
        share_token=secrets.token_urlsafe(24)
    )
    db.add(new_link)
    db.commit()
    db.refresh(new_link)
    return new_link


def get_share_link(db: Session, project_id: int, user_id: int) -> SharedLink | None:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.role == "admin":
        project = db.query(Project).filter(Project.id == project_id).first()
    else:
        project = db.query(Project).filter(
            Project.id == project_id,
            Project.user_id == user_id
        ).first()
        
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return db.query(SharedLink).filter(
        SharedLink.project_id == project_id
    ).first()


def revoke_share_link(db: Session, project_id: int, user_id: int) -> None:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.role == "admin":
        project = db.query(Project).filter(Project.id == project_id).first()
    else:
        project = db.query(Project).filter(
            Project.id == project_id,
            Project.user_id == user_id
        ).first()
        
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    link = db.query(SharedLink).filter(
        SharedLink.project_id == project_id
    ).first()
    if link:
        link.is_active = False
        db.commit()


def get_public_project(db: Session, share_token: str) -> Project:
    link = db.query(SharedLink).filter(
        SharedLink.share_token == share_token,
        SharedLink.is_active == True
    ).first()
    
    if not link:
        raise HTTPException(
            status_code=404, 
            detail="Shared link not found or has been revoked"
        )
    
    # CodeRabbit: Verify project owner is active before serving public data
    if link.project.owner and not link.project.owner.is_active:
        raise HTTPException(
            status_code=403,
            detail="Shared project is no longer available"
        )
    
    # CodeRabbit: Use atomic update to prevent race conditions on concurrent hits
    db.query(SharedLink).filter(SharedLink.id == link.id).update({
        SharedLink.view_count: SharedLink.view_count + 1
    })
    db.commit()
    db.refresh(link)
    
    return link.project
