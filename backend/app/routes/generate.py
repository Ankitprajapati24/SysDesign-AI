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


def validate_artifacts(a):
    required = [
        "srs",
        "erd_mermaid",
        "class_diagram_mermaid",
        "sequence_diagram_mermaid",
        "sql_schema",
    ]

    for field in required:
        if field not in a:
            raise Exception(f"{field} missing")

    if not a["erd_mermaid"].strip().startswith("erDiagram"):
        raise Exception("Invalid ERD")

    if not a["class_diagram_mermaid"].strip().startswith("classDiagram"):
        raise Exception("Invalid Class Diagram")

    if not a["sequence_diagram_mermaid"].strip().startswith("sequenceDiagram"):
        raise Exception("Invalid Sequence Diagram")

    for field in [
        "erd_mermaid",
        "class_diagram_mermaid",
        "sequence_diagram_mermaid",
    ]:
        if "```" in a[field]:
            raise Exception(f"{field} contains markdown fences")


@router.post("/generate")
async def generate_artifacts(
    project: ProjectInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # Step 1
        prompt = build_main_prompt(project.description)

        # Step 2
        raw_response = call_gemini(prompt)

        # Step 3
        artifacts = parse_response(raw_response)

        # Step 4
        validate_artifacts(artifacts)

        # Step 5
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