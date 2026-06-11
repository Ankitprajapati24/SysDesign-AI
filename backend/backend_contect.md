# SE Assistant API — Complete Backend Technical Documentation

> **Generated:** 2026-06-10  
> **Path:** `backend/backend_contect.md`  
> **Codebase root:** `c:\Users\anuj\OneDrive\Desktop\minor\backend\`

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Folder Structure](#2-folder-structure)
3. [Startup & Application Boot Flow](#3-startup--application-boot-flow)
4. [Authentication System](#4-authentication-system)
5. [Database Layer](#5-database-layer)
6. [API Documentation — Full Route Reference](#6-api-documentation--full-route-reference)
7. [Request Flow Mapping](#7-request-flow-mapping)
8. [AI Generation System (Gemini)](#8-ai-generation-system-gemini)
9. [Dependency Injection Analysis](#9-dependency-injection-analysis)
10. [Environment Variables & Configuration](#10-environment-variables--configuration)
11. [Migrations — Schema Evolution](#11-migrations--schema-evolution)
12. [Frontend Integration Guide](#12-frontend-integration-guide)
13. [State Management Design](#13-state-management-design)
14. [Security Review](#14-security-review)
15. [Architecture Review](#15-architecture-review)
16. [Missing Features & Gaps](#16-missing-features--gaps)
17. [Production Readiness Assessment](#17-production-readiness-assessment)
18. [Frontend Developer Handbook](#18-frontend-developer-handbook)
19. [Final End-to-End Flow Diagram](#19-final-end-to-end-flow-diagram)

---

## 1. Project Overview

**Project Name:** SE Assistant API  
**Framework:** FastAPI (Python 3.13)  
**Database:** PostgreSQL (hosted on Neon — serverless, pooled connection)  
**AI Backend:** Google Gemini 2.5 Flash (`gemini-2.5-flash`)  
**Auth Strategy:** JWT (access + refresh tokens) with dual delivery — HTTP-only cookies AND Authorization header  
**ORM:** SQLAlchemy 2.0 (sync, not async)  
**Migration Tool:** Alembic  
**ASGI Server:** Uvicorn (with watchfiles for hot-reload in dev)

### Purpose

This API is the backend for a Software Engineering (SE) assistant tool. Users can:

1. **Register / Login** — standard email + password authentication with token rotation.
2. **Describe a software project** — a free-text description is submitted.
3. **AI-generated artifacts** — Gemini 2.5 Flash analyzes the description and produces:
   - A full Software Requirements Specification (SRS) as structured JSON.
   - An Entity-Relationship Diagram (Mermaid `erDiagram` syntax).
   - A UML Class Diagram (Mermaid `classDiagram` syntax).
   - A Sequence Diagram (Mermaid `sequenceDiagram` syntax).
   - An SQL DDL schema (`CREATE TABLE` statements).
4. **Projects CRUD** — saved projects can be listed, retrieved, or deleted.

---

## 2. Folder Structure

```
backend/
├── .env                          # Environment variables (SECRET — never commit)
├── .gitignore                    # Ignores .venv, .env, __pycache__, etc.
├── alembic.ini                   # Alembic CLI config (script_location, logging)
├── fix_database.py               # One-off psycopg2 script to fix missing columns
├── fix_users_table.sql           # Raw SQL counterpart to fix_database.py
├── main.py                       # FastAPI application entry point
├── requirements.txt              # Python package dependencies
│
├── alembic/                      # Migration tooling
│   ├── env.py                    # Alembic runtime env — connects to DB, loads models
│   ├── script.py.mako            # Template for auto-generated migration scripts
│   └── versions/
│       ├── 001_initial_schema.py               # Rev 001_initial — creates all 4 tables
│       └── c3c6264ac0c0_create_users_and_...   # Rev c3c6264ac0c0 — empty stub (no-op)
│
└── app/
    ├── __init__.py               # Empty package marker
    │
    ├── core/                     # Cross-cutting infrastructure
    │   ├── __init__.py
    │   ├── config.py             # Pydantic Settings — reads .env into typed Settings object
    │   ├── database.py           # SQLAlchemy engine, SessionLocal, get_db generator
    │   ├── dependencies.py       # get_current_user FastAPI dependency
    │   └── security.py          # Password hashing (bcrypt), JWT creation utilities
    │
    ├── db_models/                # SQLAlchemy ORM model definitions
    │   ├── __init__.py           # Exports Base + all 4 models
    │   ├── user.py               # User, RefreshToken models
    │   └── project.py            # Project, GeneratedArtifact models
    │
    ├── routes/                   # FastAPI APIRouter modules
    │   ├── __init__.py
    │   ├── auth.py               # /api/auth/* — register, login, refresh, logout, me
    │   ├── generate.py           # /api/generate — AI artifact generation endpoint
    │   └── projects.py           # /api/projects/* — CRUD for saved projects
    │
    ├── schemas/                  # Pydantic request/response models (validation layer)
    │   ├── __init__.py           # Re-exports all schemas
    │   ├── auth.py               # UserCreate, UserLogin, UserOut, Token, etc.
    │   ├── generate.py           # ProjectInput, GeneratedArtifacts
    │   └── project.py            # ProjectCreate, ProjectOut, GeneratedArtifactOut
    │
    └── services/                 # Business logic layer
        ├── __init__.py
        ├── auth_service.py       # register_user, authenticate_user, token management
        ├── gemini.py             # Gemini SDK configuration and call_gemini()
        ├── generation_services.py# save_generated_project() — DB persistence
        ├── parser.py             # parse_response() — JSON extraction from AI output
        ├── project_service.py    # create_project, list_projects, get_project, delete_project
        └── prompt_builder.py     # build_main_prompt() — structured Gemini prompt
```

### Mermaid Folder Map

```mermaid
graph TD
    A[backend/] --> B[main.py]
    A --> C[.env]
    A --> D[requirements.txt]
    A --> E[alembic/]
    A --> F[app/]

    E --> E1[env.py]
    E --> E2[versions/]
    E2 --> E2a[001_initial_schema.py]
    E2 --> E2b[c3c6264ac0c0_...py]

    F --> F1[core/]
    F --> F2[db_models/]
    F --> F3[routes/]
    F --> F4[schemas/]
    F --> F5[services/]

    F1 --> F1a[config.py]
    F1 --> F1b[database.py]
    F1 --> F1c[dependencies.py]
    F1 --> F1d[security.py]

    F2 --> F2a[user.py]
    F2 --> F2b[project.py]

    F3 --> F3a[auth.py]
    F3 --> F3b[generate.py]
    F3 --> F3c[projects.py]

    F4 --> F4a[auth.py]
    F4 --> F4b[generate.py]
    F4 --> F4c[project.py]

    F5 --> F5a[auth_service.py]
    F5 --> F5b[gemini.py]
    F5 --> F5c[generation_services.py]
    F5 --> F5d[parser.py]
    F5 --> F5e[project_service.py]
    F5 --> F5f[prompt_builder.py]
```

---

## 3. Startup & Application Boot Flow

### Entry Point: `backend/main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.generate import router
import google.generativeai as genai
import os
from dotenv import load_dotenv

from app.core.database import engine
from app.db_models import Base
from app.routes.auth import router as auth_router
from app.routes.projects import router as projects_router

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI(title="SE Assistant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000",
                   "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api", tags=["Generation"])
app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(projects_router, prefix="/api/projects", tags=["Projects"])
```

### Boot Sequence (Step by Step)

```mermaid
sequenceDiagram
    participant OS as OS / Shell
    participant UV as Uvicorn
    participant MP as main.py
    participant CFG as config.py
    participant DB as database.py
    participant G as gemini.py

    OS->>UV: uvicorn main:app --reload
    UV->>MP: import main module
    MP->>MP: load_dotenv() reads .env
    MP->>CFG: import settings (pydantic-settings reads .env)
    CFG-->>MP: Settings object with all env vars
    MP->>G: genai.configure(api_key=GEMINI_API_KEY)
    G-->>MP: Gemini SDK configured globally
    MP->>DB: import engine (create_engine(DATABASE_URL))
    DB-->>MP: SQLAlchemy engine connected to Neon PostgreSQL
    MP->>MP: FastAPI() instance created
    MP->>MP: CORSMiddleware registered
    MP->>MP: 3 routers included (/api, /api/auth, /api/projects)
    UV-->>OS: Server listening on 0.0.0.0:8000
```

### Key Notes

- **`load_dotenv()` is called twice**: once in `main.py` and independently in `app/services/gemini.py`. The second call is idempotent but redundant.
- **`genai.configure()`** is called twice: once in `main.py` (at startup) and again in `gemini.py` (at module import). Both calls use the same key. Only the last call before `model = genai.GenerativeModel(...)` matters.
- **No `@app.on_event("startup")`** hook is used. Tables are NOT auto-created by `Base.metadata.create_all(engine)` — schema must exist through Alembic migrations.
- The `/test-models` endpoint in `main.py` calls the Gemini API to list available models — useful for debugging but is publicly accessible (no auth guard).

---

## 4. Authentication System

### Overview

The authentication system uses a **dual-token strategy**:
- **Access Token** — short-lived JWT (default 30 min), delivered in both the JSON response body AND as an HTTP-only cookie.
- **Refresh Token** — long-lived JWT (default 7 days), stored in DB table `refresh_tokens`, delivered as HTTP-only cookie only.

Tokens use the HS256 algorithm signed with `SECRET_KEY` from `.env`.

### Files Involved

| File | Role |
|---|---|
| `app/core/security.py` | `verify_password`, `get_password_hash`, `create_access_token`, `create_refresh_token` |
| `app/core/dependencies.py` | `get_current_user` FastAPI dependency |
| `app/services/auth_service.py` | `register_user`, `authenticate_user`, `create_user_tokens`, `refresh_user_token`, `revoke_refresh_token` |
| `app/routes/auth.py` | HTTP endpoints: `/register`, `/login`, `/refresh`, `/logout`, `/me` |
| `app/schemas/auth.py` | Pydantic models: `UserCreate`, `UserLogin`, `UserOut`, `Token`, `TokenPayload`, `TokenRefreshRequest` |
| `app/db_models/user.py` | `User` and `RefreshToken` ORM models |

---

### `app/core/security.py` — Full Source

```python
from datetime import datetime, timedelta
from typing import Any, Union
from jose import jwt
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"exp": expire, "sub": str(subject), "type": "access"}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_refresh_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = {"exp": expire, "sub": str(subject), "type": "refresh"}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt
```

**JWT Payload Structure:**

| Claim | Type | Description |
|---|---|---|
| `sub` | `str` | User ID (integer cast to string) |
| `exp` | `int` | Unix expiry timestamp |
| `type` | `str` | `"access"` or `"refresh"` — prevents token type confusion attacks |

---

### `app/core/dependencies.py` — Token Extraction Logic

```python
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)

def get_current_user(
    request: Request,
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
```

**Token Resolution Order:**

```
1. Authorization: Bearer <token>  →  extracted by OAuth2PasswordBearer
2. Cookie: access_token = "Bearer <token>"  →  manual extraction via request.cookies
3. No token found  →  raise HTTP 401
```

The `auto_error=False` on `OAuth2PasswordBearer` prevents a 401 before the cookie fallback is checked.

**Validation Steps:**

1. Decode JWT with `SECRET_KEY` + `ALGORITHM`.
2. Check `sub` is not `None`.
3. Check `type == "access"` (prevents refresh tokens being used as access tokens).
4. Parse `user_id = int(payload["sub"])`.
5. Query DB for `User.id == user_id`.
6. Check `user.is_active == True`.

---

### Authentication Flow Diagram

```mermaid
sequenceDiagram
    actor C as Client
    participant AR as /api/auth/register
    participant AL as /api/auth/login
    participant RF as /api/auth/refresh
    participant LO as /api/auth/logout
    participant ME as /api/auth/me
    participant AS as auth_service.py
    participant SEC as security.py
    participant DB as PostgreSQL

    C->>AR: POST { email, password }
    AR->>AS: register_user(db, user_in)
    AS->>DB: SELECT user by email
    DB-->>AS: None (no duplicate)
    AS->>SEC: get_password_hash(password)
    SEC-->>AS: bcrypt hash
    AS->>DB: INSERT INTO users
    DB-->>AS: User record
    AR-->>C: 201 { id, email, is_active, created_at }

    C->>AL: POST { email, password }
    AL->>AS: authenticate_user(db, user_in)
    AS->>DB: SELECT user by email
    AS->>SEC: verify_password(plain, hashed)
    SEC-->>AS: True
    AL->>AS: create_user_tokens(db, user.id)
    AS->>SEC: create_access_token(user_id)
    AS->>SEC: create_refresh_token(user_id)
    AS->>DB: INSERT INTO refresh_tokens
    AL-->>C: 200 { access_token, refresh_token, token_type } + Set-Cookie (httponly)

    C->>RF: POST {} (cookie or body refresh_token)
    RF->>AS: refresh_user_token(db, refresh_token)
    AS->>DB: SELECT refresh_token WHERE token=? AND is_revoked=false
    AS->>DB: UPDATE refresh_token SET is_revoked=true (rotation)
    AS->>DB: INSERT new refresh_token
    RF-->>C: 200 new tokens + Set-Cookie

    C->>LO: POST (cookie refresh_token)
    LO->>AS: revoke_refresh_token(db, refresh_token)
    AS->>DB: UPDATE is_revoked=true
    LO-->>C: 200 { message } + delete cookies

    C->>ME: GET Authorization: Bearer <access_token>
    ME->>ME: get_current_user(request, token, db)
    ME->>DB: SELECT user by id
    ME-->>C: 200 { id, email, is_active, created_at }
```

---

### Pydantic Schemas: `app/schemas/auth.py`

```python
class UserBase(BaseModel):
    email: EmailStr                      # validates email format

class UserCreate(UserBase):
    password: str                        # raw password (hashed in service)

class UserLogin(UserBase):
    password: str

class UserOut(UserBase):
    model_config = ConfigDict(from_attributes=True)  # ORM mode
    id: int
    is_active: bool
    created_at: datetime

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: str | None = None
    type: str | None = None
    exp: int | None = None

class TokenRefreshRequest(BaseModel):
    refresh_token: str
```

---

## 5. Database Layer

### Connection Setup: `app/core/database.py`

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

**Key decisions:**
- Uses **synchronous** SQLAlchemy (not `asyncpg` or `databases`). This is fine with Uvicorn workers but blocks the event loop for IO-heavy operations.
- `autocommit=False` — all writes must be explicitly committed.
- `autoflush=False` — prevents auto-flush before queries.
- `get_db()` is a **generator function** used as a FastAPI dependency — session is always closed in `finally`, preventing connection leaks.

### Database Provider: Neon PostgreSQL

- **Provider:** [Neon](https://neon.tech) — serverless PostgreSQL.
- **Connection:** Uses a pooled endpoint (note `pooler` in the host name).
- **SSL:** Required — `sslmode=require&channel_binding=require` in connection string.
- **JSONB:** The `GeneratedArtifact.content` column uses `postgresql.JSONB` from `sqlalchemy.dialects.postgresql`.

---

### ORM Models

#### `users` Table — `app/db_models/user.py`

```python
class User(Base):
    __tablename__ = "users"

    id            = Column(Integer, primary_key=True, index=True)
    email         = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active     = Column(Boolean, default=True)
    created_at    = Column(DateTime, default=datetime.utcnow)
    updated_at    = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    projects       = relationship("Project", back_populates="owner", cascade="all, delete-orphan")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
```

| Column | Type | Constraints |
|---|---|---|
| `id` | INTEGER | PK, indexed |
| `email` | VARCHAR | UNIQUE, NOT NULL, indexed |
| `hashed_password` | VARCHAR | NOT NULL |
| `is_active` | BOOLEAN | DEFAULT true |
| `created_at` | TIMESTAMP | DEFAULT now() (Python-side) |
| `updated_at` | TIMESTAMP | DEFAULT now(), onupdate=now() (Python-side) |

#### `refresh_tokens` Table — `app/db_models/user.py`

```python
class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id         = Column(Integer, primary_key=True, index=True)
    token      = Column(String, unique=True, index=True, nullable=False)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_revoked = Column(Boolean, default=False)

    user = relationship("User", back_populates="refresh_tokens")
```

| Column | Type | Constraints |
|---|---|---|
| `id` | INTEGER | PK, indexed |
| `token` | VARCHAR | UNIQUE, NOT NULL, indexed |
| `user_id` | INTEGER | FK → users.id ON DELETE CASCADE |
| `expires_at` | TIMESTAMP | NOT NULL |
| `created_at` | TIMESTAMP | DEFAULT now() |
| `is_revoked` | BOOLEAN | DEFAULT false |

#### `projects` Table — `app/db_models/project.py`

```python
class Project(Base):
    __tablename__ = "projects"

    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String, nullable=False)
    description = Column(String, nullable=True)
    user_id     = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at  = Column(DateTime, default=datetime.utcnow)
    updated_at  = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner     = relationship("User", back_populates="projects")
    artifacts = relationship("GeneratedArtifact", back_populates="project", cascade="all, delete-orphan")
```

| Column | Type | Constraints |
|---|---|---|
| `id` | INTEGER | PK, indexed |
| `title` | VARCHAR | NOT NULL |
| `description` | VARCHAR | NULLABLE |
| `user_id` | INTEGER | FK → users.id ON DELETE CASCADE |
| `created_at` | TIMESTAMP | DEFAULT now() |
| `updated_at` | TIMESTAMP | DEFAULT now(), onupdate=now() |

#### `generated_artifacts` Table — `app/db_models/project.py`

```python
class GeneratedArtifact(Base):
    __tablename__ = "generated_artifacts"

    id            = Column(Integer, primary_key=True, index=True)
    project_id    = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    artifact_type = Column(String, nullable=False)  # 'srs', 'architecture', 'api', 'db'
    content       = Column(JSONB, nullable=False)
    created_at    = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="artifacts")
```

| Column | Type | Constraints |
|---|---|---|
| `id` | INTEGER | PK, indexed |
| `project_id` | INTEGER | FK → projects.id ON DELETE CASCADE |
| `artifact_type` | VARCHAR | NOT NULL (values: `srs`, `erd_mermaid`, `class_diagram_mermaid`, `sequence_diagram_mermaid`, `sql_schema`) |
| `content` | JSONB | NOT NULL |
| `created_at` | TIMESTAMP | DEFAULT now() |

---

### Entity-Relationship Diagram

```mermaid
erDiagram
    USERS {
        int id PK
        varchar email UK
        varchar hashed_password
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    REFRESH_TOKENS {
        int id PK
        varchar token UK
        int user_id FK
        timestamp expires_at
        timestamp created_at
        boolean is_revoked
    }

    PROJECTS {
        int id PK
        varchar title
        varchar description
        int user_id FK
        timestamp created_at
        timestamp updated_at
    }

    GENERATED_ARTIFACTS {
        int id PK
        int project_id FK
        varchar artifact_type
        jsonb content
        timestamp created_at
    }

    USERS ||--o{ REFRESH_TOKENS : "has many"
    USERS ||--o{ PROJECTS : "owns"
    PROJECTS ||--o{ GENERATED_ARTIFACTS : "contains"
```

---

### `app/db_models/__init__.py` — Model Registry

```python
from app.core.database import Base
from app.db_models.user import User, RefreshToken
from app.db_models.project import Project, GeneratedArtifact

__all__ = ["Base", "User", "RefreshToken", "Project", "GeneratedArtifact"]
```

This file ensures all models are imported before Alembic's `target_metadata = Base.metadata` call, so the metadata is fully populated.

---

## 6. API Documentation — Full Route Reference

### Base URL (Development)

```
http://localhost:8000
```

### Router Prefixes

| Router file | Prefix | Tags |
|---|---|---|
| `routes/generate.py` | `/api` | Generation |
| `routes/auth.py` | `/api/auth` | Auth |
| `routes/projects.py` | `/api/projects` | Projects |

---

### Auth Routes (`/api/auth`)

#### `POST /api/auth/register`

**Description:** Register a new user account.  
**Auth required:** No  
**Request body:** `application/json`

```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response `201`:** `UserOut`

```json
{
  "id": 1,
  "email": "user@example.com",
  "is_active": true,
  "created_at": "2026-06-10T14:00:00"
}
```

**Errors:**
- `400` — Email already registered.

**Handler chain:**
```
POST /api/auth/register
  → register(user_in: UserCreate, db: Session)
  → auth_service.register_user(db, user_in)
    → DB: SELECT user WHERE email=?  (duplicate check)
    → security.get_password_hash(password)
    → DB: INSERT INTO users
  ← 201 UserOut
```

---

#### `POST /api/auth/login`

**Description:** Authenticate user and receive JWT tokens.  
**Auth required:** No  
**Request body:** `application/json`

```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response `200`:** `Token`

```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer"
}
```

**Response headers (Set-Cookie):**

| Cookie | Value | Flags |
|---|---|---|
| `access_token` | `Bearer eyJ...` | HttpOnly, SameSite=Lax, Max-Age=1800 |
| `refresh_token` | `eyJ...` | HttpOnly, SameSite=Lax, Max-Age=604800 |

**Errors:**
- `400` — Incorrect email or password.
- `400` — Inactive user.

---

#### `POST /api/auth/refresh`

**Description:** Rotate refresh token and get new access + refresh tokens.  
**Auth required:** No (refresh token via cookie or body)

**Request body (optional):** `application/json`

```json
{
  "refresh_token": "eyJ..."
}
```

_If body is not provided, the cookie `refresh_token` is used._

**Response `200`:** `Token` + new cookies set.

**Token Rotation:** The old refresh token is marked `is_revoked=true`, a new one is inserted. This is a **sliding window** refresh pattern.

**Errors:**
- `401` — Refresh token missing.
- `401` — Invalid or expired refresh token.

---

#### `POST /api/auth/logout`

**Description:** Revoke refresh token and clear cookies.  
**Auth required:** No (reads cookie directly)

**Response `200`:**

```json
{
  "message": "Successfully logged out"
}
```

**Side effects:**
- `refresh_tokens.is_revoked` set to `true` for the provided token.
- Cookies `access_token` and `refresh_token` are deleted.

---

#### `GET /api/auth/me`

**Description:** Get the currently authenticated user's profile.  
**Auth required:** Yes (access token via header or cookie)

**Response `200`:** `UserOut`

```json
{
  "id": 1,
  "email": "user@example.com",
  "is_active": true,
  "created_at": "2026-06-10T14:00:00"
}
```

**Errors:**
- `401` — Not authenticated.
- `400` — Inactive user.

---

### Generation Route (`/api`)

#### `POST /api/generate`

**Description:** Submit a project description and receive AI-generated software engineering artifacts.  
**Auth required:** Yes  
**Request body:** `application/json`

```json
{
  "description": "Build a food delivery app where restaurants can list items and users can order."
}
```

**Response `200`:**

```json
{
  "success": true,
  "Project ID": 42,
  "title": "Food Delivery Application",
  "data": {
    "srs": {
      "project_title": "Food Delivery Application",
      "purpose": "...",
      "scope": "...",
      "user_classes": ["Customer", "Restaurant Owner", "Delivery Driver"],
      "functional_requirements": [
        { "id": "FR-01", "title": "User Registration", "description": "..." },
        ...
      ],
      "non_functional_requirements": [
        { "id": "NFR-01", "type": "Performance", "description": "..." },
        ...
      ],
      "constraints": ["..."]
    },
    "erd_mermaid": "erDiagram\n    USER {\n        int id PK\n    ...",
    "class_diagram_mermaid": "classDiagram\n    class User {\n        +int id\n        ...",
    "sequence_diagram_mermaid": "sequenceDiagram\n    actor User\n    User->>Backend: POST /order\n    ...",
    "sql_schema": "CREATE TABLE users (\n    id INT PRIMARY KEY\n...);"
  }
}
```

**Errors:**
- `401` — Not authenticated.
- `500` — Gemini API error or JSON parse failure.

**Performance Note:** This endpoint makes a synchronous call to Google Gemini. Latency is typically 3–15 seconds depending on prompt complexity and model load.

---

### Projects Routes (`/api/projects`)

#### `POST /api/projects/`

**Description:** Manually save a project with artifacts.  
**Auth required:** Yes  
**Status:** `201 Created`  
**Request body:** `application/json` — `ProjectCreate`

```json
{
  "title": "My Project",
  "description": "Optional description",
  "artifacts": [
    {
      "artifact_type": "srs",
      "content": "{ ... }"
    }
  ]
}
```

**Response `201`:** `ProjectOut`

```json
{
  "id": 1,
  "title": "My Project",
  "description": "Optional description",
  "user_id": 1,
  "created_at": "2026-06-10T14:00:00",
  "updated_at": "2026-06-10T14:00:00",
  "artifacts": [
    {
      "id": 1,
      "project_id": 1,
      "artifact_type": "srs",
      "content": "{ ... }",
      "created_at": "2026-06-10T14:00:00"
    }
  ]
}
```

---

#### `GET /api/projects/`

**Description:** List all projects belonging to the current user, ordered newest first.  
**Auth required:** Yes  
**Response `200`:** `List[ProjectOut]`

---

#### `GET /api/projects/{project_id}`

**Description:** Retrieve a single project by ID (must belong to current user).  
**Auth required:** Yes  
**Path param:** `project_id: int`

**Response `200`:** `ProjectOut`

**Errors:**
- `404` — Project not found or not owned by user.

---

#### `DELETE /api/projects/{project_id}`

**Description:** Delete a project and all its artifacts (cascade).  
**Auth required:** Yes  
**Path param:** `project_id: int`

**Response `200`:**

```json
{
  "message": "Project deleted successfully"
}
```

**Errors:**
- `404` — Project not found or not owned by user.

---

### Utility Routes (in `main.py`)

#### `GET /`

**Auth required:** No  
**Response:** `{ "message": "SE Assistant API is running" }`

#### `GET /test-models`

**Auth required:** No  
**Response:** Lists all Gemini models that support `generateContent`.

> ⚠️ **Security Gap:** `/test-models` makes a live Gemini API call on every request and is publicly accessible. This could be abused or leak model availability information.

---

## 7. Request Flow Mapping

### Flow: User Registration

```
Client
  │
  ▼
POST /api/auth/register
  │  Request Body: { email, password }
  ▼
routes/auth.py → register()
  │  Depends: get_db → SessionLocal()
  ▼
services/auth_service.py → register_user(db, user_in)
  │  1. db.query(User).filter(email==user_in.email).first()
  │  2. security.get_password_hash(password)  →  bcrypt hash
  │  3. db.add(User(...))
  │  4. db.commit(); db.refresh(user)
  ▼
Response: 201 UserOut
```

### Flow: Login

```
Client
  │
  ▼
POST /api/auth/login
  │  Request Body: { email, password }
  ▼
routes/auth.py → login()
  │  Depends: get_db
  ▼
services/auth_service.py → authenticate_user(db, user_in)
  │  1. Query User by email
  │  2. verify_password(plain, hashed)
  ▼
services/auth_service.py → create_user_tokens(db, user.id)
  │  1. create_access_token(user_id)  →  JWT HS256
  │  2. create_refresh_token(user_id)  →  JWT HS256
  │  3. db.add(RefreshToken(...)); db.commit()
  ▼
routes/auth.py → response.set_cookie(access_token) + set_cookie(refresh_token)
  ▼
Response: 200 Token (also in cookies)
```

### Flow: AI Artifact Generation

```
Client
  │
  ▼
POST /api/generate
  │  Request Body: { description: "..." }
  │  Authorization: Bearer <token>  (or cookie)
  ▼
routes/generate.py → generate_artifacts()
  │  Depends: get_db, get_current_user
  │
  ├─ get_current_user()
  │   1. Extract token from header / cookie
  │   2. jwt.decode(token, SECRET_KEY, HS256)
  │   3. db.query(User).filter(id==user_id).first()
  │   4. Check is_active
  │
  ├─ Step 1: services/prompt_builder.py → build_main_prompt(description)
  │   Returns a structured f-string prompt with JSON schema instructions
  │
  ├─ Step 2: services/gemini.py → call_gemini(prompt)
  │   model.generate_content(prompt)
  │   Returns raw JSON string from Gemini 2.5 Flash
  │
  ├─ Step 3: services/parser.py → parse_response(raw_response)
  │   Strip markdown fences if present
  │   json.loads(cleaned) → dict
  │
  └─ Step 4: services/generation_services.py → save_generated_project(db, user_id, description, artifacts)
      1. Extract title from artifacts["srs"]["project_title"]
      2. db.add(Project(title, description, user_id))
      3. db.flush()  ← gets project.id without committing
      4. Loop: db.add(GeneratedArtifact(project_id, type, content)) × 5
      5. db.commit(); db.refresh(project)
  ▼
Response: 200 { success, Project ID, title, data }
```

### Flow: Get Project by ID

```
Client
  │
  ▼
GET /api/projects/{project_id}
  │  Authorization: Bearer <token>
  ▼
routes/projects.py → get_project_by_id()
  │  Depends: get_db, get_current_user
  ▼
services/project_service.py → get_project(db, project_id, user_id)
  │  db.query(Project)
  │    .filter(Project.id==project_id, Project.user_id==user_id)
  │    .first()
  ▼
Response: 200 ProjectOut (with nested artifacts)
   OR 404 if not found
```

---

## 8. AI Generation System (Gemini)

### Architecture Overview

```mermaid
graph TD
    A[Client POST /api/generate] --> B[generate_artifacts route]
    B --> C[build_main_prompt\nprompt_builder.py]
    C -->|structured prompt string| D[call_gemini\ngemini.py]
    D -->|response_mime_type=application/json| E[Gemini 2.5 Flash API]
    E -->|raw JSON string| D
    D --> F[parse_response\nparser.py]
    F -->|Python dict| G[save_generated_project\ngeneration_services.py]
    G -->|Project + 5 Artifacts| H[(PostgreSQL)]
    G --> B
    B --> I[Response to Client]
```

### `app/services/gemini.py` — Full Source

```python
import warnings
warnings.filterwarnings("ignore", category=FutureWarning)

import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

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
```

**Model:** `gemini-2.5-flash` — fast, cost-efficient reasoning model.  
**`response_mime_type: application/json`** — forces Gemini to output valid JSON (avoids needing to strip markdown).

> ⚠️ **Note:** Despite setting `response_mime_type`, the `parser.py` still handles markdown code fence stripping as a safety net.

### `app/services/prompt_builder.py` — Full Source

```python
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
```

### `app/services/parser.py` — Full Source

```python
import json

def parse_response(raw_response: str) -> dict:
    try:
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
```

**Parser Logic:**
1. Strip whitespace.
2. If backtick code fences are present, split on ` ``` ` and find the block that starts with `{`.
3. `json.loads()` the cleaned string.
4. Raises `Exception` with detail on parse failure — caught in the route and re-raised as `HTTP 500`.

### Expected AI Output Structure

```json
{
  "srs": {
    "project_title": "string",
    "purpose": "string",
    "scope": "string",
    "user_classes": ["string"],
    "functional_requirements": [
      { "id": "FR-01", "title": "string", "description": "string" }
    ],
    "non_functional_requirements": [
      { "id": "NFR-01", "type": "string", "description": "string" }
    ],
    "constraints": ["string"]
  },
  "erd_mermaid": "erDiagram\n...",
  "class_diagram_mermaid": "classDiagram\n...",
  "sequence_diagram_mermaid": "sequenceDiagram\n...",
  "sql_schema": "CREATE TABLE ...;"
}
```

### Artifact Persistence

`save_generated_project()` creates **5 `GeneratedArtifact` rows** per generation:

| `artifact_type` | `content` stored as |
|---|---|
| `srs` | `json.dumps(artifacts["srs"], indent=2)` — serialized JSON string |
| `erd_mermaid` | Raw Mermaid string |
| `class_diagram_mermaid` | Raw Mermaid string |
| `sequence_diagram_mermaid` | Raw Mermaid string |
| `sql_schema` | Raw SQL DDL string |

> ⚠️ **Type mismatch:** `GeneratedArtifact.content` is declared as `JSONB` in SQLAlchemy, but strings are being stored (not JSON objects). This may cause issues on strict JSONB validation in PostgreSQL. Strings ARE valid JSON if they are properly quoted, but the current code stores raw strings without JSON-encoding them for the non-SRS fields.

---

## 9. Dependency Injection Analysis

### FastAPI `Depends()` Map

```mermaid
graph TD
    GDB[get_db\ndatabase.py] -->|Session| Routes
    GCU[get_current_user\ndependencies.py] -->|User| ProtectedRoutes
    GCU --> GDB
    GCU -->|OAuth2PasswordBearer| TokenExtract[Token from Header/Cookie]

    ProtectedRoutes --> GEN[POST /api/generate]
    ProtectedRoutes --> PROJ_POST[POST /api/projects/]
    ProtectedRoutes --> PROJ_GET[GET /api/projects/]
    ProtectedRoutes --> PROJ_GETID[GET /api/projects/{id}]
    ProtectedRoutes --> PROJ_DEL[DELETE /api/projects/{id}]
    ProtectedRoutes --> ME[GET /api/auth/me]

    Routes --> REG[POST /api/auth/register]
    Routes --> LOGIN[POST /api/auth/login]
    Routes --> REFRESH[POST /api/auth/refresh]
    Routes --> LOGOUT[POST /api/auth/logout]
```

### Provider Details

#### `get_db` — `app/core/database.py`

```python
def get_db():
    db = SessionLocal()    # opens a new session
    try:
        yield db           # injects into route handler
    finally:
        db.close()         # always closes, even on exception
```

- **Scope:** Per-request (new session per HTTP request).
- **Used by:** Every route handler (directly or transitively via `get_current_user`).
- **Thread safety:** SQLAlchemy's `sessionmaker` creates thread-local sessions.

#### `get_current_user` — `app/core/dependencies.py`

```python
def get_current_user(
    request: Request,
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
```

- **Depends on:** `oauth2_scheme` (OAuth2PasswordBearer) + `get_db`.
- **Returns:** `User` ORM object if valid.
- **Raises:** `HTTP 401` if invalid token; `HTTP 400` if user inactive.
- **Cookie fallback:** If header token absent, checks `request.cookies["access_token"]`.

#### `oauth2_scheme` — FastAPI built-in

```python
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)
```

- **`auto_error=False`** — does not immediately raise 401 if no token; allows cookie fallback logic.
- **`tokenUrl`** — used only for OpenAPI docs ("Authorize" button), not for actual validation.

### Dependency Resolution Order (for protected route)

```
Request arrives at protected endpoint
  ↓
FastAPI resolves dependencies in order:
  1. oauth2_scheme(request) → token string or None
  2. get_db() → db Session
  3. get_current_user(request, token, db) → User
  ↓
Route handler executes with (db, current_user, ...body)
```

---

## 10. Environment Variables & Configuration

### `app/core/config.py` — Settings Model

```python
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )
    
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    GEMINI_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None

settings = Settings()
```

The `env_file` path resolves to `backend/.env` regardless of where the process is started from (uses `__file__` relative to `config.py`).

### Environment Variables Reference Table

| Variable | Type | Required | Default | Description |
|---|---|---|---|---|
| `DATABASE_URL` | `str` | **Yes** | — | Full PostgreSQL connection string (incl. SSL params) |
| `SECRET_KEY` | `str` | **Yes** | — | JWT signing secret. Must be cryptographically random |
| `ALGORITHM` | `str` | No | `HS256` | JWT algorithm. Only HS256 tested |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `int` | No | `30` | Access token lifetime in minutes |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `int` | No | `7` | Refresh token lifetime in days |
| `GEMINI_API_KEY` | `str` | **Yes** (for /generate) | `None` | Google Gemini API key |
| `GROQ_API_KEY` | `str` | No | `None` | Groq API key (unused — imported but no implementation) |

### `.env` File Template (with secrets redacted)

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require&channel_binding=require
SECRET_KEY=<generate with: openssl rand -hex 32>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
GEMINI_API_KEY=<your-google-ai-api-key>
GROQ_API_KEY=<your-groq-api-key>
```

> ⚠️ **Critical:** The `.gitignore` lists `.env` as ignored. Confirm this is respected before pushing to any remote repository. The actual `.env` contains live API keys and a production database URL.

---

## 11. Migrations — Schema Evolution

### Alembic Configuration: `alembic.ini`

```ini
[alembic]
script_location = alembic
prepend_sys_path = .
sqlalchemy.url = driver://user:pass@localhost/dbname  # overridden by env.py
```

The placeholder URL in `alembic.ini` is **overridden at runtime** in `alembic/env.py`:

```python
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)
```

### Migration History

| Revision | Filename | Depends On | Description |
|---|---|---|---|
| `001_initial` | `001_initial_schema.py` | None (root) | Creates all 4 tables |
| `c3c6264ac0c0` | `c3c6264ac0c0_create_users_and_refresh_tokens_tables.py` | `001_initial` | Empty stub (no-op) |

### Migration 001 — Initial Schema (`001_initial_schema.py`)

Creates tables in order (respecting FK dependencies):
1. `users`
2. `refresh_tokens` (FK → users)
3. `projects` (FK → users)
4. `generated_artifacts` (FK → projects)

**Downgrade** drops them in reverse order.

> ⚠️ **Note:** The initial migration uses `sa.Text()` for `generated_artifacts.content`, but the ORM model uses `JSONB`. This mismatch means the DB column is `TEXT` while SQLAlchemy expects `JSONB` semantics — potential runtime issues on JSONB-specific queries.

### Migration c3c6264ac0c0 — Empty Stub

```python
def upgrade() -> None:
    pass  # no-op

def downgrade() -> None:
    pass  # no-op
```

This was auto-generated by `alembic revision --autogenerate` but detected no drift (schema was already in sync).

### How to Run Migrations

```bash
# From backend/ directory with venv active:
cd backend
alembic upgrade head          # apply all pending migrations
alembic downgrade -1          # roll back last migration
alembic current               # show current revision
alembic history --verbose     # show full migration history
```

---

## 12. Frontend Integration Guide

### Base URL

```
Development: http://localhost:8000
Production:  <your-deployed-url>
```

### CORS Allowed Origins

The backend explicitly allows these origins:

```
http://localhost:3000    (Next.js default)
http://127.0.0.1:3000
http://localhost:5173    (Vite default)
http://127.0.0.1:5173
```

> **Important:** All cross-origin requests MUST include `credentials: 'include'` in `fetch()` / axios config for cookies to be sent/received.

### Authentication Flow for Frontend

#### Registration

```typescript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ email, password })
});
// Response: { id, email, is_active, created_at }
```

#### Login

```typescript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',  // REQUIRED for cookies
  body: JSON.stringify({ email, password })
});
// Response: { access_token, refresh_token, token_type }
// Also sets HttpOnly cookies: access_token, refresh_token
```

#### Authenticated Requests (Two Options)

**Option A — Cookie-based (recommended for browser apps):**
```typescript
const response = await fetch('/api/auth/me', {
  credentials: 'include'  // sends access_token cookie automatically
});
```

**Option B — Bearer header:**
```typescript
const response = await fetch('/api/auth/me', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
```

#### Refresh Token

```typescript
const response = await fetch('/api/auth/refresh', {
  method: 'POST',
  credentials: 'include',  // sends refresh_token cookie
  headers: { 'Content-Type': 'application/json' }
  // No body needed if cookie is available
});
```

#### Logout

```typescript
await fetch('/api/auth/logout', {
  method: 'POST',
  credentials: 'include'
});
// Cookies cleared server-side
```

### AI Generation

```typescript
const response = await fetch('/api/generate', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    description: "Your project description here"
  })
});

const data = await response.json();
// data.data.srs — SRS object
// data.data.erd_mermaid — Mermaid erDiagram string
// data.data.class_diagram_mermaid — Mermaid classDiagram string
// data.data.sequence_diagram_mermaid — Mermaid sequenceDiagram string
// data.data.sql_schema — SQL CREATE TABLE string
// data["Project ID"] — saved project ID
```

### Projects API

```typescript
// List all user's projects
const projects = await fetch('/api/projects/', { credentials: 'include' });

// Get single project
const project = await fetch(`/api/projects/${id}`, { credentials: 'include' });

// Delete project
await fetch(`/api/projects/${id}`, {
  method: 'DELETE',
  credentials: 'include'
});
```

### Rendering Mermaid Diagrams

The API returns raw Mermaid strings. Use `mermaid.js` to render them:

```html
<script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
<script>mermaid.initialize({ startOnLoad: true });</script>

<div class="mermaid">
  <!-- Insert erd_mermaid, class_diagram_mermaid, or sequence_diagram_mermaid here -->
</div>
```

Or in React:
```typescript
import mermaid from 'mermaid';

useEffect(() => {
  mermaid.contentLoaded();
}, [diagram]);
```

---

## 13. State Management Design

### Server State

The backend is **stateless** from an HTTP perspective — all state is in the PostgreSQL database. The only server-side state is:

1. **JWT tokens** — stateless by design (no server-side session store). Access tokens cannot be revoked before expiry.
2. **Refresh tokens** — stored in DB. Can be revoked (logout), rotated (refresh), and expire.
3. **Generated artifacts** — stored in `generated_artifacts` table, linked to projects.

### Client State Recommendations

| State | Where to store | Notes |
|---|---|---|
| `access_token` | HttpOnly Cookie (auto) | Never store in localStorage (XSS risk) |
| `refresh_token` | HttpOnly Cookie (auto) | Never store in localStorage |
| `user` object | React Context / Zustand | Hydrate on app load via `GET /api/auth/me` |
| `projects` list | React Query / SWR | Cache with stale-while-revalidate |
| `currentProject` | React Query | Cache by `project_id` |
| Generation result | Component state | Ephemeral — store if needed via POST /api/projects/ |

### Recommended Frontend Auth State Machine

```mermaid
stateDiagram-v2
    [*] --> Checking: App Load
    Checking --> Authenticated: GET /auth/me succeeds
    Checking --> Unauthenticated: GET /auth/me returns 401
    Unauthenticated --> Authenticated: POST /auth/login succeeds
    Authenticated --> Unauthenticated: POST /auth/logout
    Authenticated --> Refreshing: 401 on any request
    Refreshing --> Authenticated: POST /auth/refresh succeeds
    Refreshing --> Unauthenticated: Refresh token expired/invalid
```

---

## 14. Security Review

### ✅ Implemented Correctly

| Control | Implementation |
|---|---|
| Password hashing | bcrypt via `passlib` — industry standard |
| JWT type claim | `type: "access"/"refresh"` prevents token type confusion |
| HttpOnly cookies | Prevents XSS-based token theft |
| Refresh token rotation | Old token revoked on each refresh — detects reuse |
| Cascade deletes | Artifacts deleted when project deleted; tokens deleted when user deleted |
| Email validation | `pydantic.EmailStr` validates format at schema level |
| User ownership check | All project queries filter by `user_id` — no IDOR |

### ⚠️ Security Gaps & Recommendations

#### 1. Secrets in `.env` — Not Rotated

The `.env` file contains live production credentials. These should be:
- Rotated immediately if the repo was ever committed with `.env` unignored.
- Managed via a secrets manager (AWS Secrets Manager, GCP Secret Manager, HashiCorp Vault) in production.

#### 2. `/test-models` — No Auth Guard

```python
@app.get("/test-models")
def list_models():
    for m in genai.list_models():  # live API call
```

This endpoint is publicly accessible and makes a live Gemini API call. **Add auth or remove in production.**

#### 3. No Rate Limiting

The `/api/generate` endpoint calls Gemini on every request. Without rate limiting, a single user could:
- Exhaust Gemini API quota.
- Generate unbounded storage in `generated_artifacts`.

**Recommendation:** Add `slowapi` (FastAPI rate limiter) with per-user limits.

#### 4. `SECRET_KEY` in `.env` — Weak Default

The current `SECRET_KEY` value (`eswqazxdr4321tygvcf78ujhbnimkop`) appears to be a manually chosen string. This should be replaced with a cryptographically random value:

```bash
openssl rand -hex 32
```

#### 5. No HTTPS Enforcement

CORS is configured for `http://` origins. In production:
- Use HTTPS origins only.
- Add `Secure` flag to cookies: `response.set_cookie(..., secure=True)`.

#### 6. `SameSite=Lax` on Cookies

`SameSite=Lax` allows cookies to be sent on top-level GET navigations from other sites. For a pure API, consider `SameSite=Strict`.

#### 7. `datetime.utcnow()` Deprecation

`datetime.utcnow()` is deprecated in Python 3.12+. Use `datetime.now(timezone.utc)` instead. This affects token expiry calculations.

#### 8. Broad Exception Catch in `/generate`

```python
except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))
```

`str(e)` may leak internal error details (stack traces, API keys in error messages) to clients. Log the full error server-side and return a generic message.

#### 9. Inactive User Tokens Not Invalidated

If `user.is_active` is set to `False` while a user has valid access tokens, those tokens will be rejected by `get_current_user`. However, existing valid refresh tokens in the DB are not explicitly revoked — they would fail at the `get_current_user` check but remain in the DB.

---

## 15. Architecture Review

### Strengths

1. **Clean separation of concerns** — routes → services → DB models is a sound layered architecture.
2. **Pydantic validation** — all inputs are validated at the boundary.
3. **Dependency injection** — `get_db` and `get_current_user` are properly injected, making testing straightforward.
4. **Token rotation** — refresh token rotation is correctly implemented.
5. **Cascade deletes** — referential integrity is maintained via ON DELETE CASCADE.

### Weaknesses & Architectural Concerns

#### 1. Synchronous SQLAlchemy + Async FastAPI

The app uses `async def generate_artifacts()` but calls synchronous SQLAlchemy operations. This blocks the event loop for the duration of DB calls. Options:
- Switch to `asyncpg` + `SQLAlchemy async` (requires significant refactoring).
- Use `run_in_executor` to run sync DB calls in a thread pool.
- Or use `def` (sync) route handlers — FastAPI runs them in a thread pool automatically.

#### 2. `content` Column Type Mismatch

- **ORM defines:** `Column(JSONB, ...)` — expects JSONB.
- **Migration creates:** `sa.Text()` — creates TEXT column.
- **Data written:** strings (for non-SRS artifacts), JSON-encoded string for SRS.

This inconsistency means JSONB operators (e.g., `@>`, `->`) cannot be used on most artifacts.

#### 3. No Background Task for AI Generation

The generate endpoint is synchronous from the client's perspective (waits 3–15 seconds for Gemini). Consider:
- FastAPI `BackgroundTasks` for fire-and-forget.
- Celery + Redis for true async job queue with status polling.
- WebSocket for real-time progress updates.

#### 4. No Pagination

`list_projects` returns ALL projects for a user with no limit. At scale, this is a performance issue. Add `skip: int = 0, limit: int = 20` query params.

#### 5. `GROQ_API_KEY` Declared But Unused

The `Settings` model declares `GROQ_API_KEY` and it is in `.env`, but there is no `groq` service module. It appears planned but not implemented.

#### 6. No Logging Framework

No structured logging (Python `logging` module, `loguru`, or similar) is configured. Exceptions are caught and re-raised as HTTP errors but not logged server-side.

#### 7. No Health Check Endpoint

The `/` endpoint returns a basic string. A proper `/health` or `/ready` endpoint should check DB connectivity.

---

## 16. Missing Features & Gaps

| Feature | Status | Notes |
|---|---|---|
| Project update (PUT/PATCH) | ❌ Missing | No endpoint to update project title/description |
| Artifact update | ❌ Missing | Cannot regenerate or edit individual artifacts |
| User profile update | ❌ Missing | Cannot change email or password |
| Account deletion | ❌ Missing | No `DELETE /api/auth/me` |
| Password reset flow | ❌ Missing | No forgot-password/email flow |
| Email verification | ❌ Missing | Users can register with unverified emails |
| Groq integration | ❌ Planned | Key declared, no implementation |
| Rate limiting | ❌ Missing | Any user can spam /api/generate |
| Pagination | ❌ Missing | `GET /api/projects/` returns all records |
| Search/filter projects | ❌ Missing | No query parameters on list endpoint |
| Background job queue | ❌ Missing | AI generation blocks HTTP connection |
| Structured logging | ❌ Missing | No log output beyond uvicorn access logs |
| Health check endpoint | ❌ Missing | `/` returns string, not a proper health check |
| OpenAPI docs customization | ❌ Missing | Default FastAPI docs, no custom descriptions |
| Input sanitization | ⚠️ Partial | Pydantic validates types but not content length/injection |
| HTTPS in production | ❌ Not configured | Needs reverse proxy (nginx) or cloud LB |
| Token blacklist for access tokens | ❌ Missing | Logout only clears cookies; access tokens valid until expiry |

---

## 17. Production Readiness Assessment

### Infrastructure Checklist

| Item | Status | Action Required |
|---|---|---|
| Database | ✅ Neon PostgreSQL (production-grade) | Verify connection pooling limits |
| SSL | ✅ `sslmode=require` in DATABASE_URL | Verify TLS cert chain |
| ASGI Server | ✅ Uvicorn | Use `gunicorn -k uvicorn.workers.UvicornWorker` in prod |
| Reverse Proxy | ❌ Not configured | Add nginx or use cloud load balancer |
| HTTPS | ❌ Not configured | Required before production |
| Environment Secrets | ⚠️ `.env` file | Move to secrets manager |
| Docker | ❌ No Dockerfile | Add for reproducible deployments |
| Health checks | ❌ Missing | Add `/health` endpoint for load balancer |

### Recommended Production Command

```bash
gunicorn main:app \
  --worker-class uvicorn.workers.UvicornWorker \
  --workers 4 \
  --bind 0.0.0.0:8000 \
  --timeout 120 \
  --log-level info
```

### Minimum Production `.env` Changes

```env
# Use cryptographically random secret
SECRET_KEY=$(openssl rand -hex 32)

# Restrict CORS in main.py to actual frontend domain
# allow_origins=["https://your-frontend.com"]

# Use connection pooler URL from Neon for serverless
DATABASE_URL=postgresql://...?sslmode=require

# Remove test endpoints (/test-models)
```

---

## 18. Frontend Developer Handbook

### Quick Reference: All API Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Register new user |
| `POST` | `/api/auth/login` | No | Login → get tokens + cookies |
| `POST` | `/api/auth/refresh` | No (refresh token) | Rotate tokens |
| `POST` | `/api/auth/logout` | No (refresh token) | Revoke + clear cookies |
| `GET` | `/api/auth/me` | Yes | Get current user |
| `POST` | `/api/generate` | Yes | Generate SE artifacts |
| `POST` | `/api/projects/` | Yes | Save a project |
| `GET` | `/api/projects/` | Yes | List all projects |
| `GET` | `/api/projects/{id}` | Yes | Get one project |
| `DELETE` | `/api/projects/{id}` | Yes | Delete a project |
| `GET` | `/` | No | Health ping |
| `GET` | `/test-models` | No | List Gemini models |

### Error Handling Reference

| HTTP Status | Meaning | Common Cause |
|---|---|---|
| `400` | Bad request | Email taken, wrong credentials, inactive user |
| `401` | Unauthorized | No token, invalid token, expired token |
| `404` | Not found | Project doesn't exist or not owned by user |
| `422` | Validation error | Request body fails Pydantic validation |
| `500` | Server error | Gemini API failure, JSON parse error |

### TypeScript Types (Generated from Pydantic Schemas)

```typescript
interface UserOut {
  id: number;
  email: string;
  is_active: boolean;
  created_at: string; // ISO 8601
}

interface Token {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
}

interface FunctionalRequirement {
  id: string;         // e.g., "FR-01"
  title: string;
  description: string;
}

interface NonFunctionalRequirement {
  id: string;         // e.g., "NFR-01"
  type: string;       // e.g., "Performance"
  description: string;
}

interface SRS {
  project_title: string;
  purpose: string;
  scope: string;
  user_classes: string[];
  functional_requirements: FunctionalRequirement[];
  non_functional_requirements: NonFunctionalRequirement[];
  constraints: string[];
}

interface GeneratedArtifacts {
  srs: SRS;
  erd_mermaid: string;
  class_diagram_mermaid: string;
  sequence_diagram_mermaid: string;
  sql_schema: string;
}

interface GenerateResponse {
  success: boolean;
  "Project ID": number;
  title: string;
  data: GeneratedArtifacts;
}

interface GeneratedArtifactOut {
  id: number;
  project_id: number;
  artifact_type: "srs" | "erd_mermaid" | "class_diagram_mermaid" | "sequence_diagram_mermaid" | "sql_schema";
  content: string;
  created_at: string;
}

interface ProjectOut {
  id: number;
  title: string;
  description: string | null;
  user_id: number;
  created_at: string;
  updated_at: string;
  artifacts: GeneratedArtifactOut[];
}
```

### Axios Configuration Example

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,  // Required for cookies
});

// Auto-refresh on 401
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      try {
        await api.post('/api/auth/refresh');
        return api.request(error.config);
      } catch {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

---

## 19. Final End-to-End Flow Diagram

```mermaid
graph TB
    subgraph Client["🌐 Frontend (localhost:3000 or :5173)"]
        UI[User Interface]
        AUTH_STATE[Auth State\nReact Context]
        MERMAID[Mermaid.js Renderer]
    end

    subgraph Backend["⚙️ FastAPI Backend (localhost:8000)"]
        direction TB
        
        subgraph Middleware["Middleware Layer"]
            CORS[CORS Middleware\nAllows :3000, :5173]
        end

        subgraph Routes["Routes Layer"]
            R_AUTH[/api/auth/\nregister, login, refresh, logout, me]
            R_GEN[/api/generate\nAI artifact generation]
            R_PROJ[/api/projects/\nCRUD]
        end

        subgraph Core["Core Layer"]
            DEP[get_current_user\ndependencies.py]
            SEC[security.py\nbcrypt + JWT]
            CFG[config.py\nSettings]
        end

        subgraph Services["Services Layer"]
            AUTH_SVC[auth_service.py]
            PROMPT[prompt_builder.py]
            GEMINI_SVC[gemini.py]
            PARSER[parser.py]
            GEN_SVC[generation_services.py]
            PROJ_SVC[project_service.py]
        end

        subgraph Models["DB Models Layer"]
            USER_M[User\nRefreshToken]
            PROJ_M[Project\nGeneratedArtifact]
        end
    end

    subgraph External["☁️ External Services"]
        NEON[(Neon PostgreSQL\nus-east-1)]
        GEMINI_API[Google Gemini 2.5 Flash\nAI Generation]
    end

    UI -->|HTTP + cookies| CORS
    CORS --> R_AUTH
    CORS --> R_GEN
    CORS --> R_PROJ

    R_AUTH --> DEP
    R_GEN --> DEP
    R_PROJ --> DEP

    DEP --> SEC
    DEP --> USER_M

    R_AUTH --> AUTH_SVC
    AUTH_SVC --> SEC
    AUTH_SVC --> USER_M

    R_GEN --> PROMPT
    PROMPT -->|structured prompt| GEMINI_SVC
    GEMINI_SVC -->|API call| GEMINI_API
    GEMINI_API -->|JSON response| GEMINI_SVC
    GEMINI_SVC --> PARSER
    PARSER --> GEN_SVC
    GEN_SVC --> PROJ_M

    R_PROJ --> PROJ_SVC
    PROJ_SVC --> PROJ_M

    USER_M <-->|SQLAlchemy ORM| NEON
    PROJ_M <-->|SQLAlchemy ORM| NEON

    CFG -.->|env vars| SEC
    CFG -.->|DATABASE_URL| NEON
    CFG -.->|GEMINI_API_KEY| GEMINI_SVC

    Backend -->|JSON responses + Set-Cookie| Client
    AUTH_STATE -.->|stores user| UI
    UI -->|mermaid strings| MERMAID
```

---

## Appendix A: Python Package Dependencies

| Package | Version Constraint | Purpose |
|---|---|---|
| `fastapi` | `>=0.115.0` | Web framework |
| `uvicorn[standard]` | `>=0.30.0` | ASGI server (includes watchfiles, websockets) |
| `python-dotenv` | `>=1.0.0` | `.env` file loading |
| `google-generativeai` | `>=0.8.0` | Gemini SDK |
| `pydantic` | `>=2.9.0` | Data validation |
| `pydantic-settings` | `>=2.5.0` | Settings from env |
| `python-multipart` | `>=0.0.9` | Form data parsing |
| `aiofiles` | `>=23.0.0` | Async file I/O (not currently used) |
| `groq` | `>=0.9.0` | Groq SDK (declared, not implemented) |
| `sqlalchemy` | `>=2.0.0` | ORM |
| `psycopg2-binary` | `>=2.9.0` | PostgreSQL driver |
| `python-jose[cryptography]` | `>=3.3.0` | JWT encode/decode |
| `passlib[bcrypt]` | `>=1.7.4` | Password hashing |
| `bcrypt` | `>=4.0.0` | bcrypt algorithm |
| `email-validator` | `>=2.0.0` | EmailStr validation |
| `alembic` | `>=1.13.0` | Database migrations |

---

## Appendix B: Running the Backend Locally

```bash
# 1. Navigate to project root
cd c:\Users\anuj\OneDrive\Desktop\minor

# 2. Activate virtual environment
.venv\Scripts\Activate.ps1

# 3. Install dependencies
pip install -r backend/requirements.txt

# 4. Ensure .env is populated (see Section 10)
# backend/.env must have DATABASE_URL, SECRET_KEY, GEMINI_API_KEY

# 5. Run migrations
cd backend
alembic upgrade head

# 6. Start development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# API is now at http://localhost:8000
# Interactive docs: http://localhost:8000/docs
# ReDoc: http://localhost:8000/redoc
```

---

*Documentation generated from source code analysis of `backend/` directory.*  
*All code snippets are verbatim from the source files as of 2026-06-10.*
