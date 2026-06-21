# ArchFlow Developer & Integration Guide
---
Welcome to **ArchFlow** — a production-ready, AI-powered Software System Architecture Design Suite. This document is a comprehensive guide designed for any future developer or AI agent to understand the codebase, operations, architecture, and deployment procedures, allowing them to start developing or maintaining features immediately.

---

## 1. Project Overview & Architecture
ArchFlow allows developers and students to describe software ideas in plain text. It automatically compiles a complete **Software Requirements Specification (SRS)**, interactive visual diagrams (UML Class, ERD, Sequence, Activity, Use Case, DFDs), and database **SQL DDL Schemas**.

### Core Architecture Flow
```mermaid
graph TD
    A[React Frontend: Netlify / custom domain] -->|HTTPS request| B[FastAPI Backend: Render / Docker]
    B -->|SQLAlchemy ORM| C[PostgreSQL Database: Neon]
    B -->|API Request| D[Google Gemini API]
    D -->|Structured JSON Response| B
    B -->|JSON Response / HTTP-Only Cookies| A
```

---

## 2. Technology Stack
* **Frontend:** React (Create React App), Vanilla CSS, Mermaid.js (for rendering UML diagrams in the browser).
* **Backend:** FastAPI (Python 3.11), Uvicorn (ASGI Server), SQLAlchemy ORM.
* **Database:** SQLite (Local Dev fallback `designdoc.db`) / PostgreSQL (Production Neon Serverless DB).
* **Auth:** JSON Web Tokens (JWT) with HTTP-only cookies and automatic Token Rotation.
* **AI Engine:** Google Gemini Pro (`google-generativeai` package) with structured JSON generation.
* **Deployment:** Netlify (Frontend), Render (Backend via Docker), Cloudflare (DNS/SSL), Neon (Database).

---

## 3. Directory Structure Walkthrough
The workspace is structured as a monorepo containing both the frontend and backend applications.

```
SysDesign-AI/
│
├── backend/                       # FastAPI Backend Application
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py          # Configuration loading using Pydantic Settings
│   │   │   ├── database.py        # SQLAlchemy engine and session makers
│   │   │   └── security.py        # Bcrypt hashing and JWT token handlers
│   │   ├── db_models/
│   │   │   ├── __init__.py        # Auto-registers models for metadata
│   │   │   ├── project.py         # SQLAlchemy Project & Artifact tables
│   │   │   ├── shared_link.py     # Share tokens mapping database
│   │   │   └── user.py            # User and RefreshToken models
│   │   ├── routes/
│   │   │   ├── admin.py           # Admin panel statistics and user control endpoints
│   │   │   ├── auth.py            # Login, registration, cookies, and session handling
│   │   │   ├── generate.py        # Prompt submission and Gemini model caller
│   │   │   ├── projects.py        # Project CRUD, rename, and delete actions
│   │   │   └── sharing.py         # Token generator for project sharing links
│   │   ├── schemas/               # Pydantic schemas for request/response validation
│   │   └── services/              # Business logic layers (Auth, Gemini prompt engineering)
│   │
│   ├── Dockerfile                 # Production Docker image setup for Render
│   ├── main.py                    # Application entrypoint & CORS middleware
│   └── requirements.txt           # Python backend dependencies
│
├── frontend/                      # React Frontend Application
│   ├── public/
│   │   ├── favicon.png            # Minimalist flat brand logo favicon
│   │   └── index.html             # HTML entry point with ArchFlow branding
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminPanel.js      # Panel to monitor user accounts, projects, and live stats
│   │   │   ├── Auth.js            # Login/Register panel with Dark/Light support
│   │   │   ├── DiagramView.js     # Pan/zoomable Mermaid diagram renderer
│   │   │   ├── Landing.js         # Minimalist landing page with editable Team details
│   │   │   ├── Sidebar.js         # Workspace projects management with AF branding
│   │   │   ├── SRSView.js         # Structured PDF-exportable markdown parser
│   │   │   └── SQLView.js         # Code-highlighted database schema viewer
│   │   ├── App.js                 # Global state controller, view routers, and layouts
│   │   ├── App.css                # Adaptive CSS classes supporting Light & Dark mode
│   │   ├── config.js              # Auto-detects local API vs production build URLs
│   │   └── index.js               # React startup script
│   └── package.json               # Frontend dependencies and npm scripts
│
├── netlify.toml                   # Root configuration for Netlify deployment pipeline
└── DEVELOPER.md                   # This developer & AI integration guide
```

---

## 4. Local Development Setup
To run the project locally on your machine, follow these instructions:

### Backend Setup:
1. Navigate into `backend/` directory.
2. Create a virtual environment and activate it:
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # Linux/macOS:
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file inside `backend/` using the following variables:
   ```env
   DATABASE_URL=sqlite:///./designdoc.db
   SECRET_KEY=generate_a_random_hex_key
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   REFRESH_TOKEN_EXPIRE_DAYS=7
   GEMINI_API_KEY=your_gemini_api_key
   FRONTEND_URL=http://localhost:3000
   ```
5. Run the local backend server:
   ```bash
   python -m uvicorn backend.main:app --port 8000 --reload
   ```

### Frontend Setup:
1. Navigate into `frontend/` directory.
2. Install npm packages:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm start
   ```
   The application will open at `http://localhost:3000`.

---

## 5. Security & Authentication Flow
ArchFlow incorporates industry-standard security practices:
1. **JWT HTTP-Only Cookies:** Tokens (`access_token`, `refresh_token`) are set from the backend using `httponly=True` and `secure=True` (in production). This blocks Client-side scripts from reading the cookie, mitigating **XSS** attacks.
2. **CORS Strict Settings:** Handled inside [backend/main.py](file:///c:/Users/ankit/Work/minor/SysDesign-AI/backend/main.py). Wildcards are blocked. Only the dynamic frontend URL configured via `FRONTEND_URL` is authorized.
3. **Database Auto-Migration:** On backend launch, `Base.metadata.create_all(bind=engine)` runs automatically. If PostgreSQL or SQLite is empty, it automatically constructs all tables.

---

## 6. How to Deploy to Production

### Part A: Database (Neon PostgreSQL)
1. Register at [neon.tech](https://neon.tech/) and create a free project.
2. Copy your PostgreSQL Connection string. It looks like:
   `postgresql://user:password@host/neondb?sslmode=require`

### Part B: Backend (Render)
1. Log in to [Render](https://render.com) and create a **Web Service**.
2. Connect your GitHub repository.
3. **Settings Checklist:**
   * **Root Directory:** Keep it **blank / empty** (defaults to repository root `.`). Do NOT set it to `backend`.
   * **Runtime:** Select **Docker**.
   * **Dockerfile Path:** Set to **`backend/Dockerfile`**.
4. **Environment Variables:** In the Environment tab, add:
   * `DATABASE_URL` = *[Your Neon Connection String]*
   * `SECRET_KEY` = *[A strong secret hex key]*
   * `GEMINI_API_KEY` = *[Your Google Gemini Key]*
   * `FRONTEND_URL` = `https://arcflow.codebread.fun` (Or your Netlify custom domain).

### Part C: Frontend (Netlify)
1. Log in to [Netlify](https://netlify.com) and click **Import from Git**.
2. Connect your repository. Netlify reads the root `netlify.toml` automatically:
   * **Base Directory:** `frontend`
   * **Build Command:** `CI=false npm run build` (Preconfigured to ignore lint warnings).
   * **Publish Directory:** `build`
3. Add the Environment Variable:
   * `REACT_APP_API_BASE_URL` = *[Your Render Backend HTTPS URL, e.g. `https://archflow-api.onrender.com`]* (Do not add a trailing slash `/`).
4. Trigger deploy.

### Part D: DNS & SSL (Cloudflare Subdomain)
To map the project to `arcflow.codebread.fun`:
1. In Netlify **Domain Management**, add custom domain: `arcflow.codebread.fun`.
2. In **Cloudflare**, select `codebread.fun` -> **DNS Records** -> **Add Record**:
   * **Type:** `CNAME`
   * **Name:** `arcflow`
   * **Target:** `arcflowapp.netlify.app` (Your default Netlify site name).
   * **Proxy Status:** `DNS Only` (Grey Cloud).
3. Wait 2 minutes. Netlify will verify the CNAME and provision a free SSL certificate.

---

## 7. Developer Cheat-Sheet: How to Modify the App

### A. How to edit the Landing Page or Team List
The minimal landing page is located in [Landing.js](file:///c:/Users/ankit/Work/minor/SysDesign-AI/frontend/src/components/Landing.js).
* **To change team member names/roles:** Modify the `teamMembers` array at the top of the file:
  ```javascript
  const teamMembers = [
    { name: "Ankit Prajapati", role: "CSE 3rd Year" },
    ...
  ];
  ```
* **To change feature texts:** Modify the `features` array.
* **To toggle Light/Dark Mode:** The page adapts automatically to the `colorMode` synced via React. Simply use the `onToggleTheme` callback prop.

### B. How to promote a user to Admin in Production
1. Open your **Neon Console** -> **SQL Editor**.
2. Click the **`+`** button to create a new SQL query tab.
3. Paste and run:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your_registered_email@example.com';
   ```
4. Alternatively, to force reset the password of that admin to `lazyadmin`, run:
   ```sql
   UPDATE users 
   SET hashed_password = '$2b$12$haPvuWasRry6ChlED0zxuOifOpQZ9Uw74ecffnvdIuEswFS2yBnjy', role = 'admin'
   WHERE email = 'your_registered_email@example.com';
   ```

### C. How to add a new Diagram Tab (e.g., Use Case, DFD)
1. **Gemini Service:** In `backend/app/services/gemini.py`, update the prompt instructions to tell Gemini to generate the new diagram's Mermaid code inside the structured JSON response.
2. **Frontend Tab List:** In `frontend/src/App.js` around line 800, add the new tab button:
   ```javascript
   <button className={`tab-btn ${activeTab === "new_diagram" ? "active" : ''}`} onClick={() => setActiveTab("new_diagram")}>New Diagram</button>
   ```
3. **Diagram Renderer:** In `App.js` around line 820, mount the new diagram view:
   ```javascript
   {activeTab === "new_diagram" && <DiagramView code={currentArtifacts.new_diagram_mermaid} title="New Diagram Description" onUpdateCode={(c) => updateLocalArtifact('new_diagram_mermaid', c)} />}
   ```

---
*For any additional issues, refer to Render service logs or Netlify build consoles. Happy coding!*
