import sys
import os
import logging
import time
import traceback

# Ensure the parent directory is in sys.path so we can import 'backend'
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
import uvicorn
from dotenv import load_dotenv

# Setup logging
log_file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "app.log")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.FileHandler(log_file_path, encoding="utf-8"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("designdoc")

from backend.app.routes.generate import router

# Database and Router imports
from backend.app.core.database import engine
from backend.app.db_models import Base
from backend.app.routes.auth import router as auth_router
from backend.app.routes.projects import router as projects_router
from backend.app.routes.admin import router as admin_router
from backend.app.routes.sharing import router as sharing_router

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI(title="DesignDoc API")

# Request Logging Middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    try:
        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000
        logger.info(
            f"{request.method} {request.url.path} - Status: {response.status_code} - Completed in {process_time:.2f}ms"
        )
        return response
    except Exception as e:
        process_time = (time.time() - start_time) * 1000
        logger.error(
            f"Unhandled exception during {request.method} {request.url.path} after {process_time:.2f}ms:\n"
            f"{traceback.format_exc()}"
        )
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal Server Error"}
        )

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api", tags=["Generation"])
app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(projects_router, prefix="/api/projects", tags=["Projects"])
app.include_router(admin_router, prefix="/api/admin", tags=["Admin"])
app.include_router(sharing_router, prefix="/api", tags=["Sharing"])

@app.exception_handler(HTTPException)
async def admin_http_exception_handler(request: Request, exc: HTTPException):
    logger.warning(f"HTTPException {exc.status_code} for {request.method} {request.url.path}: {exc.detail}")
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
    logger.warning(f"Validation Error for {request.method} {request.url.path}: {exc.errors()}")
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

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)