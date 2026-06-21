# SDE AI Tool 🚀

An intelligent AI-powered Software Development Engineering tool that generates Software Requirement Specifications (SRS), SQL queries, and visual diagrams from natural language input using Google's Gemini AI.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Folder Structure](#folder-structure)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Project](#running-the-project)
- [Project Features](#project-features)
- [API Documentation](#api-documentation)
- [Team Collaboration Guide](#team-collaboration-guide)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## 📖 Project Overview

**SDE AI Tool** leverages Google Gemini AI to:

- Convert natural language requirements into structured SRS documents
- Generate SQL queries from natural language descriptions
- Create visual diagrams (sequence, ER, flowchart, etc.) using Mermaid
- Parse and structure complex software requirements

**Perfect for:** Agile teams, startup MVPs, requirement analysis, and rapid development cycles.

---

## 📁 Folder Structure

```
SDE_ai_tool/
│
├── 📄 README.md                 ← You are here! Project documentation
├── 📄 package.json              ← Root-level npm scripts for running both services
├── 📄 .gitignore                ← Git configuration (multilevel)
├── 🔐 .env                      ← Environment variables (not committed)
│
├── 🔧 backend/                  ← Flask/FastAPI Python Backend
│   ├── main.py                  ← Backend entry point (Server startup)
│   ├── requirements.txt         ← Python dependencies
│   ├── .gitignore               ← Backend-specific ignores
│   │
│   ├── models/
│   │   └── schemas.py           ← Data models & validation schemas
│   │
│   ├── routes/
│   │   └── generate.py          ← API endpoints for generation
│   │
│   └── services/
│       ├── gemini.py            ← Google Gemini AI integration
│       ├── parser.py            ← Parse & structure AI responses
│       └── prompt_builder.py    ← Build optimized prompts
│
└── 🎨 frontend/                 ← React.js Frontend Application
    ├── package.json             ← Node dependencies & scripts
    ├── .gitignore               ← Frontend-specific ignores
    ├── public/
    │   ├── index.html           ← Main HTML template
    │   └── manifest.json        ← PWA configuration
    │
    └── src/
        ├── App.js               ← Root React component
        ├── App.css              ← Global styles
        ├── index.js             ← React entry point
        │
        └── components/
            ├── InputSection.js  ← User input form
            ├── SRSView.js       ← Display SRS output
            ├── SQLView.js       ← Display SQL queries
            └── DiagramView.js   ← Display Mermaid diagrams
```

### Folder Roles 📌

| Folder                 | Purpose             | Tech                  |
| ---------------------- | ------------------- | --------------------- |
| `backend/`             | API & AI processing | Python, FastAPI/Flask |
| `frontend/`            | User interface      | React.js, CSS         |
| `backend/models/`      | Data validation     | Pydantic schemas      |
| `backend/routes/`      | API endpoints       | REST endpoints        |
| `backend/services/`    | Business logic      | Gemini API, parsing   |
| `frontend/components/` | React components    | UI modules            |

---

## 🛠 Tech Stack

### Backend

- **Framework:** Flask/FastAPI (Python 3.9+)
- **AI Model:** Google Gemini API
- **Data Validation:** Pydantic
- **Environment:** Python virtual environment

### Frontend

- **Framework:** React.js (v19.2.6+)
- **Styling:** CSS3
- **HTTP Client:** Axios
- **Diagrams:** Mermaid.js
- **Build Tool:** Create React App

### DevOps

- **Version Control:** Git & GitHub
- **Task Runner:** npm (concurrently)
- **Container:** Docker (optional)

---

## 📋 Prerequisites

Before you start, ensure you have:

- ✅ **Git** - Version control ([Download](https://git-scm.com/))
- ✅ **Node.js** (v16+) & npm - For frontend ([Download](https://nodejs.org/))
- ✅ **Python** (v3.9+) - For backend ([Download](https://www.python.org/))
- ✅ **Google Gemini API Key** - Free tier available ([Get Key](https://ai.google.dev/))

### Verify Installation

```bash
node --version      # v16.0.0 or higher
npm --version       # 7.0.0 or higher
python --version    # 3.9.0 or higher
git --version       # 2.30.0 or higher
```

---

## 🚀 Installation & Setup

### Step 1: Clone Repository

```bash
git clone https://github.com/Ankitprajapati24/SDE_Ai_Tool.git
cd SDE_ai_tool
```

### Step 2: Setup Backend

```bash
# Navigate to backend folder
cd backend

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo GEMINI_API_KEY=your_key_here > .env
```

### Step 3: Setup Frontend

```bash
# Navigate to frontend folder
cd ../frontend

# Install npm dependencies
npm install
```

### Step 4: Get Gemini API Key

1. Go to [Google AI Studio](https://ai.google.dev/)
2. Click "Get API Key"
3. Create new API key
4. Copy and add to `backend/.env`:

```env
GEMINI_API_KEY=your_actual_api_key_here
```

---

## ▶️ Running the Project

### **Option 1: Run Both Services (RECOMMENDED) 🎯**

From root directory:

```bash
npm start
```

This will start:

- **Backend:** Running on `http://localhost:5000` (or your configured port)
- **Frontend:** Running on `http://localhost:3000`

### **Option 2: Run Services Separately**

#### Backend Only

```bash
cd backend
.\venv\Scripts\activate        # Windows
python main.py                 # Starts server
```

#### Frontend Only

```bash
cd frontend
npm start                       # Starts React dev server
```

### **Option 3: Run with Docker (Optional)**

```bash
docker-compose up
```

---

## ✨ Project Features

### 🤖 AI-Powered Generation

- **SRS Generator:** Converts requirements → structured SRS documents
- **SQL Query Generator:** Natural language → SQL queries
- **Diagram Generator:** Text descriptions → Mermaid diagrams
- **Smart Parser:** Extracts and structures AI responses

### 🎨 User Interface

- Intuitive input form for natural language
- Real-time output display
- Tabbed interface (SRS | SQL | Diagrams)
- Copy-to-clipboard functionality
- Responsive design

### 🔧 Backend Features

- REST API endpoints
- Prompt optimization
- Response parsing & validation
- Error handling & logging

---

## 📡 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Endpoints

#### 1. **Generate SRS**

```
POST /api/generate/srs
Content-Type: application/json

{
  "requirement": "Build a user authentication system"
}

Response:
{
  "srs": "1. Functional Requirements\n   - User login\n   - Password reset\n...",
  "status": "success"
}
```

#### 2. **Generate SQL Query**

```
POST /api/generate/sql
Content-Type: application/json

{
  "description": "Get all users who registered in last 30 days"
}

Response:
{
  "query": "SELECT * FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY);",
  "status": "success"
}
```

#### 3. **Generate Diagram**

```
POST /api/generate/diagram
Content-Type: application/json

{
  "description": "User logs in, system validates, returns token"
}

Response:
{
  "diagram": "sequenceDiagram\n  User->>System: Login\n...",
  "type": "sequence",
  "status": "success"
}
```

---

## 👥 Team Collaboration Guide

### For Team Members Joining the Project

#### 1. **Clone and Setup (First Time Only)**

```bash
git clone https://github.com/Ankitprajapati24/SDE_Ai_Tool.git
cd SDE_ai_tool

# Setup backend
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
cd ..

# Setup frontend
cd frontend
npm install
```

#### 2. **Daily Development Workflow**

```bash
# Start of day - fetch latest changes
git pull origin main

# Activate backend environment
cd backend
.\venv\Scripts\activate

# Run entire project from root
cd ..
npm start
```

#### 3. **Making Changes**

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes...

# Stage changes
git add .

# Commit with meaningful message
git commit -m "feat: Add SRS export to PDF feature"

# Push to GitHub
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```

#### 4. **Folder Assignments**

| Team Member  | Assigned Folder            | Responsibility                   |
| ------------ | -------------------------- | -------------------------------- |
| Backend Dev  | `/backend`                 | API, Gemini integration, parsing |
| Frontend Dev | `/frontend/src/components` | UI components, user interactions |
| Full Stack   | Both                       | Feature integration, deployment  |
| DevOps       | `/` root                   | Deployment, CI/CD, Docker        |

#### 5. **Communication Guidelines**

- Use **meaningful commit messages** (not "fix bug" or "update")
- Update `.env` locally (never commit secrets)
- Keep `requirements.txt` and `package.json` synced
- Test locally before pushing
- Create Pull Requests for code review

#### 6. **Sync Dependencies**

**After pulling new code:**

```bash
# Backend dependencies updated?
cd backend
pip install -r requirements.txt

# Frontend dependencies updated?
cd ../frontend
npm install
```

---

## 🐛 Troubleshooting

### Issue: Backend won't start

**Solution:**

```bash
# 1. Check Python version
python --version  # Should be 3.9+

# 2. Recreate virtual environment
cd backend
rmdir /s venv      # Windows
rm -rf venv        # macOS/Linux
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

### Issue: Frontend won't load

**Solution:**

```bash
# 1. Clear cache
cd frontend
rm -rf node_modules
npm cache clean --force

# 2. Reinstall
npm install
npm start
```

### Issue: Gemini API Key not working

**Solution:**

```bash
# 1. Check .env file exists
ls backend/.env    # macOS/Linux
dir backend\.env   # Windows

# 2. Verify key format
# Should look like: AIzaSy... (no quotes)

# 3. Restart backend after changing .env
```

### Issue: Port already in use

**Solution:**

```bash
# Backend port 5000 in use?
netstat -ano | findstr :5000    # Windows

# Kill process
taskkill /PID <PID> /F          # Windows

# Or change port in backend/main.py
# Change: app.run(port=5001)
```

---

## 📝 Contributing

### Contribution Steps

1. **Fork** the repository
2. **Create feature branch**: `git checkout -b feature/your-feature`
3. **Make changes** with clear commits
4. **Test thoroughly** locally
5. **Push** to your fork: `git push origin feature/your-feature`
6. **Create Pull Request** with description of changes

### Code Standards

- ✅ Write clear, commented code
- ✅ Follow existing code style
- ✅ Test before committing
- ✅ Use meaningful variable names
- ✅ Add docstrings to functions

---

## 📞 Support & Questions

- **Documentation Issues?** Check existing issues
- **Feature Request?** Open a GitHub issue
- **Need Help?** Ask in team discussions

---

## 📄 License

This project is licensed under MIT License - see LICENSE file for details.

---

## 🎯 Quick Start Cheatsheet

```bash
# First time setup
git clone <repo>
cd SDE_ai_tool
cd backend && python -m venv venv && .\venv\Scripts\activate && pip install -r requirements.txt && cd ..
cd frontend && npm install && cd ..

# Daily start
npm start

# Updating code
git pull origin main
cd backend && pip install -r requirements.txt && cd ..
cd frontend && npm install && cd ..

# Making changes
git checkout -b feature/name
# ... make changes ...
git add .
git commit -m "feat: description"
git push origin feature/name
```

---

## 🚀 Production Deployment Guide

**Recommended Stack (Free Tier, No Docker needed):**

| Component | Platform | URL |
|---|---|---|
| Frontend (React) | **Vercel** | vercel.com |
| Backend (FastAPI) | **Render** | render.com |
| Database (PostgreSQL) | **Neon** | neon.tech |

---

### Step 1: Database — Neon.tech (Free PostgreSQL)

1. Go to [neon.tech](https://neon.tech) → Create account → New Project
2. Copy the **Connection String** (looks like `postgresql://user:pass@host/dbname?sslmode=require`)
3. Keep it ready for Step 2

---

### Step 2: Backend — Render.com

1. Go to [render.com](https://render.com) → New → **Web Service**
2. Connect your GitHub repo
3. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add **Environment Variables** (from `backend/.env.example`):
   ```
   GEMINI_API_KEY=your_key_here
   GROQ_API_KEY=your_key_here
   DATABASE_URL=postgresql://... (from Neon)
   SECRET_KEY=generate_with: python -c "import secrets; print(secrets.token_hex(32))"
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   REFRESH_TOKEN_EXPIRE_DAYS=7
   FRONTEND_URL=https://your-app.vercel.app
   ```
5. Deploy → Copy your backend URL (e.g., `https://sysdesign-ai.onrender.com`)

---

### Step 3: Frontend — Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import GitHub repo
2. Settings:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
3. Add **Environment Variable**:
   ```
   REACT_APP_API_BASE_URL=https://sysdesign-ai.onrender.com
   ```
4. Update `frontend/src/config.js` to use the env var:
   ```js
   export const API_BASE = process.env.REACT_APP_API_BASE_URL || 
     (window.location.hostname === 'localhost' ? 'http://localhost:8000' : window.location.origin);
   ```
5. Deploy → Your app is live! 🎉

---

## 🔒 Security Checklist Before Git Push

- [ ] `backend/.env` is in `.gitignore` ✅
- [ ] `backend/designdoc.db` is in `.gitignore` ✅
- [ ] `SECRET_KEY` is a strong random hex string (not placeholder) ✅
- [ ] No API keys hardcoded in any `.js` or `.py` file ✅
- [ ] Run `git status` to verify secrets are not tracked

```bash
# Verify nothing sensitive is being tracked:
git status
git ls-files | grep -E "\.env$|\.db$|\.log$"
# Above command should return EMPTY — if not, add to .gitignore
```

---

**Made with ❤️ by the Team**

Last Updated: June 21, 2026
