<<<<<<< HEAD
import logging
import traceback
=======
>>>>>>> origin/feat/admin
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.core.dependencies import get_current_user
from backend.app.db_models.user import User
from backend.app.schemas.generate import ProjectInput
from backend.app.services.prompt_builder import build_main_prompt
from backend.app.services.gemini import call_gemini
<<<<<<< HEAD
from backend.app.services.groq import call_groq
from backend.app.services.parser import parse_response
from backend.app.services.generation_services import save_generated_project

logger = logging.getLogger("designdoc")
=======
from backend.app.services.parser import parse_response
from backend.app.services.generation_services import save_generated_project

>>>>>>> origin/feat/admin
router = APIRouter()


def validate_artifacts(a):
    required = [
        "srs",
        "erd_mermaid",
        "class_diagram_mermaid",
        "sequence_diagram_mermaid",
<<<<<<< HEAD
        "flowchart_mermaid",
        "use_case_diagram_mermaid",
        "activity_diagram_mermaid",
        "dfd_mermaid",
=======
>>>>>>> origin/feat/admin
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

<<<<<<< HEAD
    if not (a["flowchart_mermaid"].strip().startswith("flowchart") or a["flowchart_mermaid"].strip().startswith("graph")):
        raise Exception("Invalid Flowchart Diagram")

    if not (a["use_case_diagram_mermaid"].strip().startswith("flowchart") or a["use_case_diagram_mermaid"].strip().startswith("graph")):
        raise Exception("Invalid Use Case Diagram")

    if not (a["activity_diagram_mermaid"].strip().startswith("flowchart") or a["activity_diagram_mermaid"].strip().startswith("graph")):
        raise Exception("Invalid Activity Diagram")

    if not (a["dfd_mermaid"].strip().startswith("flowchart") or a["dfd_mermaid"].strip().startswith("graph")):
        raise Exception("Invalid Data Flow Diagram (DFD)")

=======
>>>>>>> origin/feat/admin
    for field in [
        "erd_mermaid",
        "class_diagram_mermaid",
        "sequence_diagram_mermaid",
<<<<<<< HEAD
        "flowchart_mermaid",
        "use_case_diagram_mermaid",
        "activity_diagram_mermaid",
        "dfd_mermaid",
=======
>>>>>>> origin/feat/admin
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

<<<<<<< HEAD
        # Step 2: Try Gemini, fallback to Groq
        artifacts = None
        gemini_error = None
        try:
            logger.info("Attempting artifact generation with Gemini API...")
            raw_response = call_gemini(prompt)
            artifacts = parse_response(raw_response)
            validate_artifacts(artifacts)
            logger.info("Artifact generation successful using Gemini API")
        except Exception as e:
            gemini_error = str(e)
            logger.warning(f"Gemini API generation failed: {gemini_error}. Falling back to Groq API...")

        if not artifacts:
            try:
                logger.info("Attempting artifact generation with Groq API (fallback)...")
                raw_response = call_groq(prompt)
                artifacts = parse_response(raw_response)
                validate_artifacts(artifacts)
                logger.info("Artifact generation successful using Groq API")
            except Exception as e:
                groq_error = str(e)
                logger.error(f"Groq API generation failed: {groq_error}")
                raise Exception(
                    f"Both Gemini and Groq APIs failed. "
                    f"Gemini Error: {gemini_error} | "
                    f"Groq Error: {groq_error}"
                )
=======
        # Step 2
        raw_response = call_gemini(prompt)

        # Step 3
        artifacts = parse_response(raw_response)

        # Step 4
        validate_artifacts(artifacts)
>>>>>>> origin/feat/admin

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
<<<<<<< HEAD
        logger.error(f"Generation endpoint failed: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail="There is currently a high load on the server. Thank you for your support! Many users are trying to generate diagrams right now. Please try again in a few moments."
=======
        raise HTTPException(
            status_code=500,
            detail=str(e)
>>>>>>> origin/feat/admin
        )