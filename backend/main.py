
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from backend.app.routes.generate import router
import google.generativeai as genai
import os
import uvicorn
from dotenv import load_dotenv

# Database and Router imports
from backend.app.core.database import engine
from backend.app.db_models import Base
from backend.app.routes.auth import router as auth_router
from backend.app.routes.projects import router as projects_router
from backend.app.routes.admin import router as admin_router
from backend.app.routes.sharing import router as sharing_router


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI(title="DesignDoc API")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api",tags=["Generation"])
app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(projects_router, prefix="/api/projects", tags=["Projects"])
app.include_router(admin_router, prefix="/api/admin", tags=["Admin"])
app.include_router(sharing_router, prefix="/api", tags=["Sharing"])

@app.exception_handler(HTTPException)
async def admin_http_exception_handler(request: Request, exc: HTTPException):
    if request.url.path.startswith("/api/admin"):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "message": exc.detail,
                "detail": exc.detail
            }
        )
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

@app.exception_handler(RequestValidationError)
async def admin_validation_exception_handler(request: Request, exc: RequestValidationError):
    if request.url.path.startswith("/api/admin"):
        return JSONResponse(
            status_code=422,
            content={
                "success": False,
                "message": "Validation Error",
                "detail": exc.errors()
            }
        )
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()}
    )

@app.get("/")
def root():
    return {"message": "DesignDoc API is running"}