import warnings
warnings.filterwarnings("ignore", category=FutureWarning)

import random
import threading
import logging
import google.generativeai as genai
from backend.app.core.config import settings

logger = logging.getLogger("designdoc")
configure_lock = threading.Lock()

# Parse comma-separated keys if present
def get_api_keys() -> list[str]:
    if not settings.GEMINI_API_KEY:
        return []
    return [k.strip() for k in settings.GEMINI_API_KEY.split(",") if k.strip()]

# Using gemini-2.5-flash which is available and fast.
# Enforce JSON mime-type to guarantee structure parsing works correctly.
model = genai.GenerativeModel(
    "gemini-2.5-flash",
    generation_config={"response_mime_type": "application/json",
    "temperature": 0.2
    }
)

def call_gemini(prompt: str) -> str:
    keys = get_api_keys()
    if not keys:
        raise Exception("Gemini API key not configured")
    
    keys_to_try = list(keys)
    random.shuffle(keys_to_try)
    
    last_error = None
    for key in keys_to_try:
        try:
            with configure_lock:
                genai.configure(api_key=key)
                response = model.generate_content(prompt)
                return response.text
        except Exception as e:
            last_error = e
            masked_key = f"...{key[-5:]}" if len(key) > 5 else "short_key"
            logger.warning(f"Gemini API request failed using key ({masked_key}): {str(e)}. Trying next key...")
            continue
            
    raise Exception(f"All configured Gemini API keys failed. Last error: {str(last_error)}")
