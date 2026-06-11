from sqlalchemy.orm import Session
from typing import List, Optional
from app.db_models.project import Project, GeneratedArtifact
from app.schemas.project import ProjectCreate

def create_project(db: Session, project_in: ProjectCreate, user_id: int) -> Project:
    db_project = Project(
        title=project_in.title,
        description=project_in.description,
        user_id=user_id
    )
    db.add(db_project)
    db.flush()  # Get generated ID
    
    for artifact in project_in.artifacts:
        db_artifact = GeneratedArtifact(
            project_id=db_project.id,
            artifact_type=artifact.artifact_type,
            content=artifact.content
        )
        db.add(db_artifact)
        
    db.commit()
    db.refresh(db_project)
    return db_project

def list_projects(db: Session, user_id: int) -> List[Project]:
    return db.query(Project).filter(Project.user_id == user_id).order_by(Project.created_at.desc()).all()

def get_project(db: Session, project_id: int, user_id: int) -> Optional[Project]:
    return db.query(Project).filter(Project.id == project_id, Project.user_id == user_id).first()

def delete_project(db: Session, project_id: int, user_id: int) -> bool:
    db_project = db.query(Project).filter(Project.id == project_id, Project.user_id == user_id).first()
    if db_project:
        db.delete(db_project)
        db.commit()
        return True
    return False
