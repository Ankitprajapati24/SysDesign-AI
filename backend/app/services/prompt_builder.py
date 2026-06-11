# Builds prompts

def build_main_prompt(description: str) -> str:
    return f"""
You are an expert software engineering assistant.
A user has described their project below.
Analyze it and return a single valid JSON object.
No explanation, no markdown, no extra text.
Just the raw JSON.

Project Description:
{description}

Return exactly this JSON structure:

{{
  "srs": {{
    "project_title": "",
    "purpose": "",
    "scope": "",
    "user_classes": [],
    "functional_requirements": [
      {{"id": "FR-01", "title": "", "description": ""}}
    ],
    "non_functional_requirements": [
      {{"id": "NFR-01", "type": "", "description": ""}}
    ],
    "constraints": []
  }},
  "erd_mermaid": "erDiagram\\n    ENTITY1 {{\\n        int id PK\\n    }}",
  "class_diagram_mermaid": "classDiagram\\n    class ClassName {{\\n        +int id\\n        +method()\\n    }}",
  "sequence_diagram_mermaid": "sequenceDiagram\\n    actor User\\n    User->>Backend: action",
  "sql_schema": "CREATE TABLE table_name (\\n    id INT PRIMARY KEY\\n);"
}}

Rules:
- erd_mermaid must be valid Mermaid erDiagram syntax
- class_diagram_mermaid must be valid Mermaid classDiagram syntax  
- sequence_diagram_mermaid must be valid Mermaid sequenceDiagram syntax
- sql_schema must be valid SQL CREATE TABLE statements
- functional_requirements must have at least 5 items
- Return ONLY the JSON, nothing else
"""