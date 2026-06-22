# Parses AI response and sanitizes Mermaid diagrams


import json
import re
import logging

logger = logging.getLogger("designdoc")


# ── Mermaid sanitization helpers ────────────────────────────────────────────
# These fix the most common syntax errors that LLMs produce and that break
# Mermaid v11+.  The goal is best-effort repair — if the diagram is still
# broken the frontend DiagramView already shows an "edit source" fallback.

def _sanitize_flowchart(code: str) -> str:
    """Fix common issues in flowchart-based diagrams
    (flowchart, activity, use_case, dfd)."""
    if not code:
        return code

    lines = code.split("\n")
    cleaned = []

    for line in lines:
        stripped = line.strip()

        # Remove accidental ```mermaid / ``` wrappers
        if stripped in ("```mermaid", "```", "```json"):
            continue

        # Fix unquoted node labels that contain parentheses or special chars.
        # Pattern: NodeID[Label (with parens)] → NodeID["Label (with parens)"]
        # Also handles ([...]), ((...))), {{}}, etc.
        # We only touch lines that look like node definitions, NOT edge-only lines.
        line = _quote_node_labels(line)

        # Replace HTML-like angle brackets in labels: <Thing> → Thing
        line = re.sub(r'<(\w[\w\s]*)>', r'\1', line)

        # Remove stray semicolons at end of lines (not valid in flowchart)
        if stripped.endswith(";") and not stripped.startswith("%%"):
            line = line.rstrip(";")

        cleaned.append(line)

    return "\n".join(cleaned)


def _quote_node_labels(line: str) -> str:
    """Ensure node labels in square/round/stadium brackets are quoted
    when they contain special characters that would break Mermaid parsing."""

    # Match patterns like:  ID[label text]  ID([label text])  ID{label text}
    # but skip lines that are only edges (e.g.  A --> B)
    # and skip already-quoted labels like ID["label"]

    # Bracket types and their openers/closers
    bracket_pairs = [
        (r'\[', r'\]', '[', ']'),        # [label]
        (r'\(\[', r'\]\)', '([', '])'),   # ([stadium label])
        (r'\(\(', r'\)\)', '((', '))'),   # ((circle label))
        (r'\(', r'\)', '(', ')'),         # (round label)
        (r'\{', r'\}', '{', '}'),         # {diamond label}
    ]

    for open_re, close_re, open_ch, close_ch in bracket_pairs:
        # Pattern: word_chars + open_bracket + unquoted_content + close_bracket
        pattern = (
            r'(\b\w+)'           # node ID
            + open_re             # opening bracket
            + r'([^"\']*?)'       # label content (not already quoted)
            + close_re            # closing bracket
        )

        def _replacer(m):
            node_id = m.group(1)
            label = m.group(2)
            # Only quote if label has problematic chars
            needs_quoting = any(c in label for c in '(){}[]<>&|#;')
            if needs_quoting and not label.startswith('"'):
                # Escape any existing double quotes in the label
                safe_label = label.replace('"', "'")
                return f'{node_id}{open_ch}"{safe_label}"{close_ch}'
            return m.group(0)

        line = re.sub(pattern, _replacer, line)

    return line


def _sanitize_class_diagram(code: str) -> str:
    """Fix common issues in classDiagram syntax."""
    if not code:
        return code

    lines = code.split("\n")
    cleaned = []

    for line in lines:
        stripped = line.strip()

        # Remove accidental code fences
        if stripped in ("```mermaid", "```", "```json"):
            continue

        # Fix Java/C# generics: List<Task> → List~Task~
        line = re.sub(r'(\w+)<(\w+(?:,\s*\w+)*)>', r'\1~\2~', line)

        # Remove `abstract` keyword before class (not supported in Mermaid)
        line = re.sub(r'\babstract\s+class\b', 'class', line)

        cleaned.append(line)

    return "\n".join(cleaned)


def _sanitize_er_diagram(code: str) -> str:
    """Fix common issues in erDiagram syntax."""
    if not code:
        return code

    lines = code.split("\n")
    cleaned = []

    for line in lines:
        stripped = line.strip()

        # Remove accidental code fences
        if stripped in ("```mermaid", "```", "```json"):
            continue

        # Inside attribute blocks, remove SQL-style constraints like
        #   PRIMARY KEY (col1, col2)  or  KEY (col)
        line = re.sub(r'\bPRIMARY\s+KEY\s*\([^)]*\)', '', line)
        line = re.sub(r'\bFOREIGN\s+KEY\s*\([^)]*\)', '', line)
        line = re.sub(r'\bKEY\s*\([^)]*\)', '', line)
        line = re.sub(r'\bUNIQUE\s*\([^)]*\)', '', line)

        # Remove inline DEFAULT values
        line = re.sub(r'\bDEFAULT\s+\S+', '', line)

        # Remove NOT NULL (just keep type name PK/FK)
        line = re.sub(r'\bNOT\s+NULL\b', '', line)
        line = re.sub(r'\bNULL\b', '', line)
        line = re.sub(r'\bAUTO_INCREMENT\b', '', line)
        line = re.sub(r'\bAUTOINCREMENT\b', '', line)

        # Remove commas (not valid in ERD attribute blocks)
        if '||' not in stripped and '--' not in stripped and '}' not in stripped:
            line = line.replace(',', '')

        # Collapse excess whitespace
        line = re.sub(r'  +', ' ', line)

        cleaned.append(line)

    return "\n".join(cleaned)


def _sanitize_sequence_diagram(code: str) -> str:
    """Fix common issues in sequenceDiagram syntax."""
    if not code:
        return code

    lines = code.split("\n")
    cleaned = []

    for line in lines:
        stripped = line.strip()

        # Remove accidental code fences
        if stripped in ("```mermaid", "```", "```json"):
            continue

        cleaned.append(line)

    return "\n".join(cleaned)


def sanitize_mermaid_artifacts(data: dict) -> dict:
    """Post-process all Mermaid diagram fields in the parsed AI response
    to fix common syntax errors before the frontend tries to render them."""

    mermaid_fields = {
        "erd_mermaid":                _sanitize_er_diagram,
        "class_diagram_mermaid":      _sanitize_class_diagram,
        "sequence_diagram_mermaid":   _sanitize_sequence_diagram,
        "flowchart_mermaid":          _sanitize_flowchart,
        "use_case_diagram_mermaid":   _sanitize_flowchart,
        "activity_diagram_mermaid":   _sanitize_flowchart,
        "dfd_mermaid":                _sanitize_flowchart,
    }

    for field, sanitizer in mermaid_fields.items():
        if field in data and data[field]:
            original = data[field]
            try:
                data[field] = sanitizer(original)
            except Exception as e:
                logger.warning(f"Mermaid sanitization failed for {field}: {e}")
                # Keep the original if sanitization itself crashes
                data[field] = original

    return data


# ── Main JSON parser ────────────────────────────────────────────────────────

def parse_response(raw_response: str) -> dict:
    try:
        # Clean markdown if present
        cleaned = raw_response.strip()

        if "```" in cleaned:
            parts = cleaned.split("```")
            for part in parts:
                part = part.strip()
                if part.startswith("json"):
                    part = part[4:].strip()
                if part.startswith("{"):
                    cleaned = part
                    break

        result = json.loads(cleaned)

        # Sanitize all Mermaid diagram fields
        result = sanitize_mermaid_artifacts(result)

        return result

    except json.JSONDecodeError as e:
        raise Exception(f"Failed to parse AI response: {str(e)}")