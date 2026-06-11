from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.generate import router
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Database and Router imports
from app.core.database import engine
from app.db_models import Base
from app.routes.auth import router as auth_router
from app.routes.projects import router as projects_router


load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI(title="SE Assistant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api",tags=["Generation"])
app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(projects_router, prefix="/api/projects", tags=["Projects"])

@app.get("/")
def root():
    return {"message": "SE Assistant API is running"}

@app.get("/test-models")
def list_models():
    models = []
    for m in genai.list_models():
        if "generateContent" in m.supported_generation_methods:
            models.append(m.name)
    return {"available_models": models}