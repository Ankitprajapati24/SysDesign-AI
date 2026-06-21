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
  "flowchart_mermaid": "flowchart TD\\n    Start[Start] --> Process[Process]\\n    Process --> End((End))",
  "use_case_diagram_mermaid": "flowchart LR\\n    subgraph System\\n        UC1([Use Case 1])\\n    end\\n    User((User)) --> UC1",
  "activity_diagram_mermaid": "flowchart TD\\n    Start([Start]) --> Action1[Action]\\n    Action1 --> End([End])",
  "dfd_mermaid": "flowchart LR\\n    User[User] -->|Input| Process[Process]\\n    Process -->|Store| DB[(Database)]",
  "sql_schema": "CREATE TABLE table_name (\\n    id INT PRIMARY KEY\\n);"
}}

Rules:
- Return ONLY valid JSON.
- Do NOT wrap Mermaid code inside triple backticks.
- Mermaid fields must contain RAW Mermaid strings.
- Preserve newline characters using \n.
- erd_mermaid must begin with "erDiagram".
- class_diagram_mermaid must begin with "classDiagram".
- sequence_diagram_mermaid must begin with "sequenceDiagram".
- flowchart_mermaid must begin with "flowchart" or "graph".
- use_case_diagram_mermaid must begin with "flowchart" or "graph". Model actors as circles/nodes and use cases as stadium shapes `([Use Case])` within a boundary subgraph.
- activity_diagram_mermaid must begin with "flowchart" or "graph". Model process nodes, start/end nodes, and decision diamonds.
- dfd_mermaid must begin with "flowchart" or "graph". Model data flows between external entities (rectangles), processes, and data stores (e.g. `[(Database)]`).
- Use Mermaid v10 compatible syntax.
- Avoid Java/C# generics such as List<Task>.
- Use simple Mermaid syntax that compiles successfully.
- For flowchart, use_case_diagram, activity_diagram, and dfd diagrams (which are all flowchart-based), ALWAYS enclose node labels in double quotes (e.g., `Node["Label (text)"]` or `UC1(["Use Case Name"])`) to prevent syntax rendering errors caused by parentheses or other special characters.
- Never use the `actor` keyword or sequence-diagram-specific syntax inside flowchart diagrams.
- For erd_mermaid, do NOT use parentheses, commas, or complex SQL constraints (like PRIMARY KEY (col1, col2) or KEY (col)) inside entity attribute blocks. Attributes must strictly follow the format: type name [PK/FK].
- functional_requirements must contain at least 5 items.
"""