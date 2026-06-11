import json

from sqlalchemy.orm import Session

from app.db_models.project import Project, GeneratedArtifact


def save_generated_project(
    db: Session,
    user_id: int,
    description: str,
    artifacts: dict
):
    title = artifacts["srs"].get(
        "project_title",
        "Untitled Project"
    )

    project = Project(
        title=title,
        description=description,
        user_id=user_id
    )

    db.add(project)
    db.flush()

    artifact_map = {
        "srs": json.dumps(
            artifacts["srs"],
            indent=2
        ),
        "erd_mermaid": artifacts["erd_mermaid"],
        "class_diagram_mermaid": artifacts["class_diagram_mermaid"],
        "sequence_diagram_mermaid": artifacts["sequence_diagram_mermaid"],
        "sql_schema": artifacts["sql_schema"]
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