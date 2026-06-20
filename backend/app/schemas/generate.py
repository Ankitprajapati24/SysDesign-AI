# Request/Response models
from pydantic import BaseModel

class ProjectInput(BaseModel):
    description: str
