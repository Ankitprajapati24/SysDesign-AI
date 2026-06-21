import json

from sqlalchemy.orm import Session

from backend.app.db_models.project import Project, GeneratedArtifact


def save_generated_project(
    db: Session,
    user_id: int,
    description: str,
    artifacts: dict
):
    srs_data = artifacts.get("srs")
    if isinstance(srs_data, str):
        try:
            srs_data = json.loads(srs_data)
        except Exception:
            pass
            
    title = "Untitled Project"
    if isinstance(srs_data, dict):
        title = srs_data.get("project_title", "Untitled Project")

    project = Project(
        title=title,
        description=description,
        user_id=user_id
    )

    db.add(project)
    db.flush()

    artifact_map = {
        "srs": json.dumps(srs_data, indent=2) if isinstance(srs_data, (dict, list)) else str(srs_data),
        "erd_mermaid": artifacts.get("erd_mermaid", ""),
        "class_diagram_mermaid": artifacts.get("class_diagram_mermaid", ""),
        "sequence_diagram_mermaid": artifacts.get("sequence_diagram_mermaid", ""),
<<<<<<< HEAD
        "flowchart_mermaid": artifacts.get("flowchart_mermaid", ""),
        "use_case_diagram_mermaid": artifacts.get("use_case_diagram_mermaid", ""),
        "activity_diagram_mermaid": artifacts.get("activity_diagram_mermaid", ""),
        "dfd_mermaid": artifacts.get("dfd_mermaid", ""),
=======
>>>>>>> origin/feat/admin
        "sql_schema": artifacts.get("sql_schema", "")
    }

    for artifact_type, content in artifact_map.items():
        db_artifact = GeneratedArtifact(
            project_id=project.id,
            artifact_type=artifact_type,
            content=content
        )
        db.add(db_artifact)

    db.commit()
    db.refresh(project)

    return project