# Request/Response models
from pydantic import BaseModel

class ProjectInput(BaseModel):
    description: str

class GeneratedArtifacts(BaseModel):
    srs: dict
    erd_mermaid: str
    class_diagram_mermaid: str
    sequence_diagram_mermaid: str
    sql_schema: str