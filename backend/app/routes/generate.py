from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.db_models.user import User
from app.schemas.generate import ProjectInput
from app.services.prompt_builder import build_main_prompt
from app.services.gemini import call_gemini
from app.services.parser import parse_response
from app.services.generation_services import save_generated_project

router = APIRouter()


@router.post("/generate")

async def generate_artifacts(
    project: ProjectInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # Step 1: Build prompt
        prompt = build_main_prompt(project.description)
        
        # Step 2: Call Gemini
        raw_response = call_gemini(prompt)
        
        # Step 3: Parse response
        artifacts = parse_response(raw_response)
        
        # Step 4: Save to database
        saved_project = save_generated_project(
            db=db,
            user_id=current_user.id,
            description=project.description,
            artifacts=artifacts
        )
        return {
            "success": True,
            "Project ID": saved_project.id,
            "title": saved_project.title,
            "data": artifacts
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )