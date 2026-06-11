# Parses AI response


import json

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
        return result

    except json.JSONDecodeError as e:
        raise Exception(f"Failed to parse AI response: {str(e)}")