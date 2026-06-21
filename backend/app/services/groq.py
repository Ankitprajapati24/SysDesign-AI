from groq import Groq
from backend.app.core.config import settings

def call_groq(prompt: str) -> str:
    if not settings.GROQ_API_KEY:
        raise Exception("Groq API key not configured")
    try:
        client = Groq(api_key=settings.GROQ_API_KEY)
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.2,
            response_format={"type": "json_object"}
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        raise Exception(f"Groq API error: {str(e)}")

