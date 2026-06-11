import warnings
warnings.filterwarnings("ignore", category=FutureWarning)

import google.generativeai as genai

import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

# Configure the Gemini API with the key from environment variables
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Using gemini-2.5-flash which is available and fast.
# Enforce JSON mime-type to guarantee structure parsing works correctly.
model = genai.GenerativeModel(
    "gemini-2.5-flash",
    generation_config={"response_mime_type": "application/json"}
)

def call_gemini(prompt: str) -> str:
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        raise Exception(f"Gemini API error: {str(e)}")