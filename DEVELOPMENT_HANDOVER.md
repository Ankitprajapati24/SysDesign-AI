# ArchFlow (SysDesign-AI) Development & Handover Guide
---

> **👋 Welcome Developer / AI Agent!**  
> *Agar aap is project par kaam karne aaye hain, toh ye file aapke liye ek complete roadmap hai. Isme humne details se likha hai ki ArchFlow kya hai, kaise kaam karta hai, iska structure kya hai, aur features ya bugs par kaam shuru karne ke liye aapko kahan aur kya changes karne honge. Sahi instructions follow karke aap instantly development shuru kar sakte hain!*

---

## 1. Project Overview & Features (Kya Banaya Hai?)
**ArchFlow** (internally known as **DesignDoc**) is an AI-powered Software Architecture Design Suite. It takes a plain text software requirement description from the user and automatically compiles:
1. **SRS Document (Software Requirements Specification):** Compiles title, purpose, scope, user classes, 5+ functional requirements, non-functional requirements, and project constraints.
2. **Interactive UML/Mermaid Diagrams:**
   - **Entity Relationship Diagram (ERD)**
   - **UML Class Diagram**
   - **Sequence Diagram**
   - **Flowchart / Architecture Diagram**
   - **Use Case Diagram**
   - **Activity Diagram**
   - **Data Flow Diagram (DFD)**
3. **Database DDL SQL Schema:** Generates production-ready table structures (PostgreSQL/MySQL/SQLite compatible).
4. **Interactive Features:**
   - Interactive zoom, pan, and dragging for all generated Mermaid diagrams.
   - SVG, PNG, and JPEG download options for diagrams.
   - Live editable source code editor for Mermaid and SQL to tweak schemas directly.
   - Export Workspace (SRS + SQL + Diagrams) directly to a formatted PDF.
   - **Global Theme Customization:** Dark and Light mode toggles on landing page, login page, and inner workspace, along with 5 custom Accent Colors (Blue, Green, Purple, Orange, Pink).
   - **Secure Public Link Sharing:** Allows generating shareable links with a view-counter. Shared views are read-only, responsive, and check user activation status.
   - **Admin Panel:** A comprehensive dashboard to view system stats, user registration rates, active sessions, and activate/deactivate/delete users.

---

## 2. Technology Stack & Key Dependencies (Kya Use Kiya Hai?)

### Backend (Python/FastAPI)
- **FastAPI:** Modern ASGI web framework chosen for its high-performance, automatic OpenAPI docs, and clean dependency injection.
- **Uvicorn:** Highly reliable ASGI server.
- **SQLAlchemy ORM:** Used for database models abstraction, mapping tables to Python classes.
- **google-generativeai:** SDK for Google Gemini. We use `gemini-2.5-flash` with JSON output mode (`response_mime_type="application/json"`).
- **Jose (python-jose):** For signing and verifying JWT tokens.
- **Bcrypt (passlib):** For password hashing.
- **Pydantic / Pydantic Settings:** For strict environment variable parsing and configuration models.

### Frontend (React/CSS)
- **React.js (v19):** Single Page Application library.
- **Mermaid.js:** Translates raw textual diagram strings (e.g., `graph TD`) into interactive rendering SVGs directly in the browser.
- **Vanilla CSS3:** Custom styling without TailwindCSS. Clean variables are used for light/dark modes and accent-color themes.
- **html2canvas & jspdf:** Frontend libraries to capture diagram canvases and print compiled workspace contents as PDFs.

### Production Infrastructure
- **Neon Database:** Serverless PostgreSQL database.
- **Render:** Runs the backend FastAPI server inside a Docker container.
- **Netlify:** Hosts the React frontend with continuous integration enabled via GitHub.
- **Cloudflare:** Handles the custom domain (`arcflow.codebread.fun`) with a DNS-only proxy CNAME pointing to Netlify.

---

## 3. Directory Layout Walkthrough (Code Base Kahan Hai?)
Here is where files are placed in the codebase:

```text
SysDesign-AI/
│
├── netlify.toml                 # Netlify frontend build configurations
├── DEVELOPMENT_HANDOVER.md      # This comprehensive document (Handover roadmap)
├── DEVELOPER.md                 # Developer cheat-sheets and deployment logs
├── understand.md               # Visual generation sequences and feature lists
│
├── backend/                     # Python Backend Directory
│   ├── Dockerfile               # Container setup for Render deploys
│   ├── main.py                  # API entry point, middleware, exception handlers
│   ├── requirements.txt         # Core dependencies
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py        # Environmental variables parser & validation
│   │   │   ├── database.py      # SQLAlchemy session registry and engine creation
│   │   │   └── security.py      # Bcrypt hashes & JWT token verification helpers
│   │   │
│   │   ├── db_models/
│   │   │   ├── __init__.py      # Imports models to register with Base metadata
│   │   │   ├── user.py          # User schema & Refresh tokens
│   │   │   ├── project.py       # User projects & generated AI JSON artifacts
│   │   │   └── shared_link.py   # Public UUID sharing link mappings
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.py          # /api/auth (Login, register, cookie management)
│   │   │   ├── generate.py      # /api/generate (Validates and calls Gemini)
│   │   │   ├── projects.py      # /api/projects (CRUD database operations)
│   │   │   ├── sharing.py       # /api/share (Access controller for sharing links)
│   │   │   └── admin.py         # /api/admin (Dashboard telemetry & moderation)
│   │   │
│   │   └── services/
│   │       ├── auth_service.py  # Checks sessions and issues security claims
│   │       ├── gemini.py        # Configures API keys & triggers content generation
│   │       ├── prompt_builder.py# Prompt constructor containing JSON templates
│   │       ├── parser.py        # Cleans Gemini strings to valid JSON arrays
│   │       ├── project_service.py # Database helpers for CRUD
│   │       └── admin_service.py # Telemetry calculations
│   
└── frontend/                    # React Frontend Directory
    ├── package.json             # NPM package dependencies
    ├── public/
    │   ├── favicon.png          # ArchFlow brand icon
    │   └── index.html           # Document template
    └── src/
        ├── App.js               # Main Controller (View routing, accent-themes)
        ├── App.css              # Custom styling (CSS grid/flex variables)
        ├── config.js            # Environment detection for backend API endpoints
        ├── utils/
        │   ├── clipboard.js     # Quick copy utilities
        │   └── pdfExport.js     # Formats SRS text and compiles to PDF exports
        └── components/
            ├── Auth.js          # Authentication form (Includes Dark Mode switches)
            ├── Landing.js       # Minimalist landing page (With Team Members array)
            ├── Sidebar.js       # Projects listing, theme config, and logouts
            ├── SRSView.js       # Markdown parser rendering SRS requirements
            ├── SQLView.js       # SQL code editor container
            ├── DiagramView.js   # Pan/Zoom diagram rendering wrapper for Mermaid
            ├── ShareModal.js    # Link generator UI modal
            ├── ShareViewer.js   # Read-only public portal (Displays shared assets)
            └── AdminPanel.js    # Telemetry grids & user activation switches
```

---

## 4. Database Schema (Database Kaise Kaam Karta Hai?)
On backend startup, `Base.metadata.create_all(bind=engine)` runs inside [main.py](file:///c:/Users/ankit/Work/minor/SysDesign-AI/backend/main.py). If tables don't exist in PostgreSQL or the local SQLite file, they are auto-created dynamically.

### Key DB Models:
1. **User (`users` table):**
   - Contains credentials, account status (`is_active`), registration dates, and user role (`admin` or `user`).
   - Defined in [backend/app/db_models/user.py](file:///c:/Users/ankit/Work/minor/SysDesign-AI/backend/app/db_models/user.py).
2. **RefreshToken (`refresh_tokens` table):**
   - Relates to Users. Stores cryptographically secure tokens used for rotating user sessions safely.
   - Defined in [backend/app/db_models/user.py](file:///c:/Users/ankit/Work/minor/SysDesign-AI/backend/app/db_models/user.py).
3. **Project (`projects` table):**
   - Stores user projects, titles, and dates.
   - Defined in [backend/app/db_models/project.py](file:///c:/Users/ankit/Work/minor/SysDesign-AI/backend/app/db_models/project.py).
4. **GeneratedArtifact (`generated_artifacts` table):**
   - Relates to Projects. Contains the full JSON response received from the Gemini generator (SRS, diagram codes, SQL).
   - Defined in [backend/app/db_models/project.py](file:///c:/Users/ankit/Work/minor/SysDesign-AI/backend/app/db_models/project.py).
5. **SharedLink (`shared_links` table):**
   - Relates to Projects. Contains unique UUID strings, created dates, and a view counter (`views`).
   - Defined in [backend/app/db_models/shared_link.py](file:///c:/Users/ankit/Work/minor/SysDesign-AI/backend/app/db_models/shared_link.py).

---

## 5. Guide for Developers / AI Agents (Kahan pe Kya karna hai?)

If you want to modify a feature, check the guide below to find exactly where to make changes:

### A. Authentication & Session Handling
- **Backend:** 
  - Routes are in [backend/app/routes/auth.py](file:///c:/Users/ankit/Work/minor/SysDesign-AI/backend/app/routes/auth.py).
  - Business logic is in [backend/app/services/auth_service.py](file:///c:/Users/ankit/Work/minor/SysDesign-AI/backend/app/services/auth_service.py).
  - JWT tokens are loaded directly into cookies: `access_token` and `refresh_token`. Both use the flags `httponly=True`, `samesite="lax"`, and `secure=True` (in production).
- **Frontend:**
  - UI is in [frontend/src/components/Auth.js](file:///c:/Users/ankit/Work/minor/SysDesign-AI/frontend/src/components/Auth.js).
  - Core API calls and cookie authentication checks are loaded inside the `useEffect` hook in [frontend/src/App.js](file:///c:/Users/ankit/Work/minor/SysDesign-AI/frontend/src/App.js).

### B. Changing or Adding AI-Generated Diagrams / Output Structuring
- **Prompt Alterations:**
  - If you need to instruct the AI to build better schemas or new diagram types, modify the prompt instructions template inside [backend/app/services/prompt_builder.py](file:///c:/Users/ankit/Work/minor/SysDesign-AI/backend/app/services/prompt_builder.py).
- **Gemini Parameters Configuration:**
  - You can change models or adjust temperatures inside [backend/app/services/gemini.py](file:///c:/Users/ankit/Work/minor/SysDesign-AI/backend/app/services/gemini.py).
- **Adding a Tab in Frontend:**
  1. Add the tab button inside the tab navigation section in [frontend/src/App.js](file:///c:/Users/ankit/Work/minor/SysDesign-AI/frontend/src/App.js).
  2. Map the new diagram state to a `<DiagramView>` instance inside the active tab switch block in [frontend/src/App.js](file:///c:/Users/ankit/Work/minor/SysDesign-AI/frontend/src/App.js).

### C. Modifying the Landing Page or Project Team
- The static layout is in [frontend/src/components/Landing.js](file:///c:/Users/ankit/Work/minor/SysDesign-AI/frontend/src/components/Landing.js).
- **To update the list of team members:** Find the `teamMembers` array at the top of `Landing.js` and modify it:
  ```javascript
  const teamMembers = [
    { name: "Ankit Prajapati", role: "CSE 3rd Year" },
    ...
  ];
  ```
- Landing page styling uses custom variables defined in [frontend/src/App.css](file:///c:/Users/ankit/Work/minor/SysDesign-AI/frontend/src/App.css).

### D. Extending the Admin Dashboard
- **Backend telemetry endpoints:** [backend/app/routes/admin.py](file:///c:/Users/ankit/Work/minor/SysDesign-AI/backend/app/routes/admin.py) and [backend/app/services/admin_service.py](file:///c:/Users/ankit/Work/minor/SysDesign-AI/backend/app/services/admin_service.py).
- **Frontend Admin Panel interface:** [frontend/src/components/AdminPanel.js](file:///c:/Users/ankit/Work/minor/SysDesign-AI/frontend/src/components/AdminPanel.js). Add columns, user manipulation triggers, or stats grids directly here.

### E. Diagram View & Panning/Zooming Logic
- Render container is in [frontend/src/components/DiagramView.js](file:///c:/Users/ankit/Work/minor/SysDesign-AI/frontend/src/components/DiagramView.js).
- Zooming uses state scaling (`transform: scale(zoom)`). Dragging updates coordinates `translateX` and `translateY` on mouse move handlers.

---

## 6. How to Run Locally (Local Setup Steps)

### Pre-requisites:
- Python 3.10+ installed
- Node.js (v18+) installed

### 1. Setup Backend:
```bash
# Go to backend directory
cd backend

# Create Virtual Environment
python -m venv .venv

# Activate it (Windows)
.venv\Scripts\activate

# Activate it (Mac/Linux)
source .venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

### 2. Configure Local Environment:
Create a `.env` file in the **root** folder or inside the `backend/` directory:
```env
DATABASE_URL=sqlite:///./designdoc.db
SECRET_KEY=dev_secret_key_random_hex_characters_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
GEMINI_API_KEY=your_google_gemini_api_key_goes_here
FRONTEND_URL=http://localhost:3000
```

### 3. Run Backend:
```bash
python -m uvicorn backend.main:app --port 8000 --reload
```
*API will be running on `http://localhost:8000` with Swagger docs available at `http://localhost:8000/docs`.*

### 4. Setup Frontend:
```bash
# Go to frontend directory
cd ../frontend

# Install dependencies
npm install

# Run the development server
npm start
```
*React app will open automatically on `http://localhost:3000`.*

---

## 7. Production Deployment Instructions (Production Pe Kaise Dale?)

### A. Neon Database setup
- Register at [neon.tech](https://neon.tech/) and create a PostgreSQL instance.
- Copy your connection string. It looks like:
  `postgresql://neondb_owner:password@ep-host.region.pooler.neon.tech/neondb?sslmode=require`

### B. Render (Backend Docker deployment)
- Create a new **Web Service** on Render.
- Point to your Github repo.
- **Required settings:**
  - **Root Directory:** (Keep empty)
  - **Runtime:** `Docker`
  - **Dockerfile Path:** `backend/Dockerfile`
- **Environment variables in Render:**
  - `DATABASE_URL` = (Your Neon connection string)
  - `SECRET_KEY` = (A secure random string)
  - `GEMINI_API_KEY` = (Your Google Gemini key)
  - `FRONTEND_URL` = `https://arcflow.codebread.fun`

### C. Netlify (Frontend React deployment)
- Import your repository to Netlify.
- Netlify will automatically detect settings via `netlify.toml` in the repository root:
  - **Base Directory:** `frontend`
  - **Build Command:** `CI=false npm run build`
  - **Publish Directory:** `build`
- **Environment variables in Netlify:**
  - `REACT_APP_API_BASE_URL` = (Your Render Web Service URL, e.g., `https://archflow-api.onrender.com` without a trailing `/`)

### D. Cloudflare Custom Domain Setup
- Go to Netlify and add the custom domain: `arcflow.codebread.fun`.
- In Cloudflare DNS settings:
  - Add a **CNAME** record.
  - **Name:** `arcflow`
  - **Target:** (Your Netlify site hostname, e.g., `your-netlify-site.netlify.app`)
  - **Proxy Status:** `DNS Only` (Grey Cloud). *This is critical to let Netlify provision the SSL certificate successfully.*

---

## 8. Crucial Notes for AI Agents (AI Agents Ke Liye Zaroori Baatein)
If you are an AI coding agent working on this repository, make sure to follow these instructions to avoid build errors:

1. **Module Import Errors:**
   - Always run uvicorn with `"backend.main:app"` (as configured in `main.py`). The backend's directory structure requires `sys.path.insert` to prevent relative import failures.
2. **CORS Origins:**
   - Any URL configured in the backend's `FRONTEND_URL` or frontend's `REACT_APP_API_BASE_URL` must **NOT** contain a trailing slash `/`. The code in `main.py` strips it automatically, but configuring it cleanly prevents unexpected issues.
3. **Netlify Builds:**
   - Netlify builds are set to `CI=false` inside the `netlify.toml`. React treats unused variables and standard linter warnings as fatal errors if `CI=true`. Keep `CI=false` to prevent build failures over small warnings.
4. **Database Migration:**
   - No need to run database migrations manually on the production database. The backend automatically creates tables on launch via SQLAlchemy `metadata.create_all`.
5. **No Placeholders in code:**
   - Never write mock placeholder icons or graphics. Standard modern SVG elements and clean CSS styles are configured globally. Ensure all modifications respect the light/dark themes.
