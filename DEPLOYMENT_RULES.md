# ArchFlow Deployment & Workflow Rules

This document outlines the strict development, testing, and deployment rules for the **ArchFlow (SysDesign-AI)** codebase. Any developer or AI agent contributing to this repository must strictly adhere to these guidelines to ensure zero production downtime and maintain visual and mobile excellence.

---

## 1. Branching & Pull Request (PR) Workflow
To protect the production environment (which deploys automatically to Netlify and Render on changes to the `main` branch), **direct pushes to `main` are strictly prohibited.**

### Rule Set:
1. **Never Commit Directly to `main`:**
   - Any new feature, bug fix, or documentation update must be developed on a dedicated feature branch.
2. **Branch Naming Conventions:**
   - Features: `feat/feature-name` or `feature/feature-name` (e.g., `feat/mobile-responsiveness`)
   - Bug fixes: `bugfix/issue-name` or `fix/issue-name`
   - Hotfixes: `hotfix/issue-name`
3. **Pull Request Requirement:**
   - Push your feature branch to the remote repository.
   - Generate a **Pull Request (PR)** targeting the `main` branch.
   - Verify the PR builds successfully in the Netlify preview/CI checks.
   - Merge the PR to `main` only after manual review or validation passes.

---

## 2. Mobile Responsiveness Verification Checklists
ArchFlow must look premium, modern, and function flawlessly on both desktop and mobile viewports.

### Design Standards:
* **No Side-by-Side Split Screens on Mobile:** On screens `<= 768px`, the split-pane layout is disabled, and views must stack or toggle.
* **Persistent Bottom Navigation:** A mobile bottom tab bar (toggling between "Chat" and "Docs") must stay visible at all times to prevent users from getting stuck when switching panes.
* **Header Clearances:** Minimize header clutter on mobile. Hamburger menus and primary triggers should be easily reachable.
* **Modal Overlay Sizing:** Modals must not overflow horizontally on small screens. Ensure `.modal-box` has `max-width: 96vw;` or is set to wrap text correctly down to `320px` width.

### Verification Checklist before PR Merge:
- [ ] Test the landing page at `375px` and `320px` width (ensuring no text overflows, grids wrap to 1 column).
- [ ] Test the login/register screen to ensure panels stack vertically and inputs are fully clickable.
- [ ] Verify that switching to the "Docs" view displays the mobile bottom nav bar and allows switching back to the "Chat" view.
- [ ] Verify that the sidebar drawer can be opened via the hamburger button from **both** the Chat and Docs views.
- [ ] Verify that Mermaid diagrams render inside their container and support horizontal scroll/zoom gestures.

---

## 3. Local and Production Environment Consistency
* **API Base URL Config:** Ensure `REACT_APP_API_BASE_URL` in Netlify does **NOT** contain a trailing slash `/`.
* **Database migrations:** SQLAlchemy handles table creation automatically on startup. Do not write manual raw SQL DDL files to setup production schemas unless modifying columns.

---

## 4. Developer & AI Agent Protocol (Safety & Testing)
To prevent issues in the live production project and maintain clean version control history, any developer or AI agent must strictly follow these rules:
* **Local-First Testing:** Every single update or feature must be run and verified locally first. Do not attempt to apply changes to production/live services without verifying them in the local development environment.
* **No Unauthorized Git Actions:** Never push or merge changes to Git without explicit approval from the project owner.
* **Selective Staging:** Stage and push only targeted, updated, and necessary files. Do not commit unnecessary workspace config files or temp files.
* **Clear Communication:** Always explain what changes you are planning to make, how you will make them, and what the expected impact/result is.
* **No Assumptions:** If any requirement, architectural pattern, or code detail is unclear, stop and ask the project owner for clarification immediately. Do not make assumptions or proceed with guessing.

