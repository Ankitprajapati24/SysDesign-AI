import { useState, useEffect, useRef, useCallback } from "react";
import { API_BASE } from "./config";
import { copyToClipboard } from "./utils/clipboard";
import { exportSRSAsPDF, exportAllAsPDF } from "./utils/pdfExport";
import Auth from "./components/Auth";
import Sidebar from "./components/Sidebar";
import ShareModal from "./components/ShareModal";
import ShareViewer from "./components/ShareViewer";
import AdminPanel from "./components/AdminPanel";
import SRSView from "./components/SRSView";
import DiagramView from "./components/DiagramView";
import SQLView from "./components/SQLView";
import Landing from "./components/Landing";
import "./App.css";

function App() {
  // App views: 'loading' | 'landing' | 'auth' | 'workspace' | 'admin' | 'share'
  const [view, setView] = useState("loading");
  const [authMode, setAuthMode] = useState("login");
  
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  
  const [projects, setProjects] = useState([]);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [projectTitle, setProjectTitle] = useState("");
  const [isSaved, setIsSaved] = useState(true);
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("srs");
  const [currentArtifacts, setCurrentArtifacts] = useState(null);
  
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareToken, setShareToken] = useState(null);
  
  const [toasts, setToasts] = useState([]);
  const messagesEndRef = useRef(null);

  // Color mode (dark/light) and accent color
  const [colorMode, setColorMode] = useState(() => localStorage.getItem("color-mode") || "dark");
  const [accent, setAccent] = useState(() => localStorage.getItem("accent-color") || "blue");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileActiveView, setMobileActiveView] = useState("chat");

  // Resizable artifacts panel (desktop only)
  const [panelWidth, setPanelWidth] = useState(() => {
    const saved = parseInt(localStorage.getItem("panel-width"), 10);
    return saved && saved > 200 ? saved : 480;
  });
  const isResizing = useRef(false);
  const containerRef = useRef(null);

  const startResize = useCallback((e) => {
    isResizing.current = true;
    e.preventDefault();

    const onMove = (me) => {
      if (!isResizing.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = rect.right - me.clientX;
      const clamped = Math.min(Math.max(newWidth, 280), rect.width - 320);
      setPanelWidth(clamped);
    };
    const onUp = () => {
      isResizing.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      // Persist
      setPanelWidth((w) => { localStorage.setItem("panel-width", w); return w; });
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, []);

  // Sync color mode and accent to document body
  useEffect(() => {
    localStorage.setItem("color-mode", colorMode);
    localStorage.setItem("accent-color", accent);
    const classes = [];
    if (colorMode === "dark") classes.push("dark");
    classes.push(`accent-${accent}`);
    document.body.className = classes.join(" ");
  }, [colorMode, accent]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Boot: Check for share links or auto-refresh session cookies
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith("/share/")) {
      const parts = path.split("/");
      const sToken = parts[parts.length - 1];
      if (sToken) {
        setShareToken(sToken);
        setView("share");
        return;
      }
    }

    const tryRefresh = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/refresh`, {
          method: "POST",
          credentials: "include"
        });
        const d = await res.json();
        if (d.access_token) {
          const meRes = await fetch(`${API_BASE}/api/auth/me`, {
            headers: { Authorization: `Bearer ${d.access_token}` }
          });
          const loggedInUser = await meRes.json();
          handleAuthSuccess(d.access_token, loggedInUser);
        } else {
          setView("landing");
        }
      } catch (err) {
        setView("landing");
      }
    };
    tryRefresh();
  }, []);

  const showToast = (message, type = "ok") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const loadProjects = async (authToken) => {
    try {
      const res = await fetch(`${API_BASE}/api/projects/`, {
        headers: { Authorization: `Bearer ${authToken || token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setProjects(Array.isArray(data) ? data : []);
      }
    } catch {
      showToast("Failed to load projects sidebar", "err");
    }
  };

  const handleAuthSuccess = (accessToken, loggedInUser) => {
    setToken(accessToken);
    setUser(loggedInUser);
    setView("workspace");
    loadProjects(accessToken);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        credentials: "include"
      });
    } catch {}
    setToken("");
    setUser(null);
    setProjects([]);
    setCurrentProjectId(null);
    setCurrentArtifacts(null);
    setMessages([]);
    setView("landing");
  };

  const handleSelectProject = (proj) => {
    setCurrentProjectId(proj.id);
    setProjectTitle(proj.title || "Untitled Project");
    setIsSaved(true);
    setMessages([]);
    setCurrentArtifacts(null);

    // Reconstruct artifacts
    let content = {};
    if (proj.artifacts?.length) {
      proj.artifacts.forEach(art => {
        if (art.artifact_type === 'srs') {
          try { content.srs = JSON.parse(art.content); } catch { content.srs = art.content; }
        } else {
          content[art.artifact_type] = art.content;
        }
      });
    }

    if (proj.description) {
      setMessages([{ id: "desc", role: "user", text: proj.description }]);
    }

    if (content && Object.keys(content).length > 0) {
      setCurrentArtifacts(content);
      setMessages(prev => [
        ...prev,
        {
          id: "artifacts-ready",
          role: "assistant",
          text: "Here are the design doc artifacts generated for this project. Explore the tabs on the right side.",
          withChips: true
        }
      ]);
    } else if (proj.description) {
      setMessages(prev => [
        ...prev,
        { id: "no-artifacts", role: "assistant", text: "No artifacts have been generated for this project yet." }
      ]);
    }
  };

  const handleNewProject = () => {
    setCurrentProjectId(null);
    setProjectTitle("");
    setIsSaved(true);
    setMessages([]);
    setCurrentArtifacts(null);
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm("Delete this project permanently?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/projects/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast("Project deleted", "ok");
        if (currentProjectId === id) {
          handleNewProject();
        }
        loadProjects();
      } else {
        const d = await res.json();
        throw new Error(d.detail || "Failed to delete");
      }
    } catch (e) {
      showToast(e.message, "err");
    }
  };

  const handleRenameProject = async (id, newTitle) => {
    try {
      const res = await fetch(`${API_BASE}/api/projects/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title: newTitle })
      });
      if (res.ok) {
        showToast("Renamed successfully", "ok");
        if (currentProjectId === id) {
          setProjectTitle(newTitle);
        }
        loadProjects();
      } else {
        const d = await res.json();
        throw new Error(d.detail || "Rename failed");
      }
    } catch (e) {
      showToast(e.message, "err");
    }
  };

  const updateLocalArtifact = (key, val) => {
    setCurrentArtifacts(prev => {
      if (!prev) return prev;
      const updated = { ...prev, [key]: val };
      setIsSaved(false);
      return updated;
    });
  };

  const handleSaveProjectChanges = async () => {
    if (!currentProjectId || !currentArtifacts) return;
    try {
      const artifactsList = Object.keys(currentArtifacts).map(key => {
        const val = currentArtifacts[key];
        return {
          artifact_type: key,
          content: typeof val === 'object' ? JSON.stringify(val) : val
        };
      });

      const res = await fetch(`${API_BASE}/api/projects/${currentProjectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: projectTitle,
          artifacts: artifactsList
        })
      });

      if (res.ok) {
        showToast("Project saved successfully!", "ok");
        setIsSaved(true);
        loadProjects();
      } else {
        const d = await res.json();
        throw new Error(d.detail || "Failed to save project");
      }
    } catch (e) {
      showToast(e.message, "err");
    }
  };

  const handleSaveProjectName = () => {
    if (!currentProjectId || !projectTitle.trim()) return;
    const p = projects.find(x => x.id === currentProjectId);
    if (p && p.title === projectTitle.trim()) return;
    handleRenameProject(currentProjectId, projectTitle.trim());
  };

  const triggerGenerate = async () => {
    if (!inputText.trim()) return;
    const promptText = inputText.trim();
    setInputText("");

    setMessages(prev => [...prev, { id: Date.now() + "-user", role: "user", text: promptText }]);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ description: promptText })
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.detail || "Generation failed");
      }

      const artifacts = result.data;
      setCurrentArtifacts(artifacts);
      setIsSaved(true);

      if (artifacts.srs?.project_title && !projectTitle) {
        setProjectTitle(artifacts.srs.project_title);
      }

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + "-assistant",
          role: "assistant",
          text: `I've successfully generated the complete design document suite for ${artifacts.srs?.project_title || "your project"}:`,
          withChips: true
        }
      ]);

      // Automatically reload projects sidebar so new auto-saved project appears
      loadProjects();
      if (result["Project ID"]) {
        setCurrentProjectId(result["Project ID"]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { id: Date.now() + "-err", role: "assistant", text: `Sorry, generation failed: ${err.message}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleUseSuggestion = (suggestionText) => {
    setInputText(suggestionText);
  };

  const handleCopyArtifact = async () => {
    if (!currentArtifacts) return;
    let content = "";
    if (activeTab === "srs" && currentArtifacts.srs) {
      const s = currentArtifacts.srs;
      content = `# SRS: ${s.project_title || "Untitled"}\n\n`;
      content += `## 1. Introduction\n- **Purpose:** ${s.purpose || ""}\n- **Scope:** ${s.scope || ""}\n\n`;
      content += `## 2. User Classes\n${(s.user_classes || []).map(uc => `- ${uc}`).join("\n")}\n\n`;
      content += `## 3. Functional Requirements\n`;
      content += `| ID | Title | Description |\n|---|---|---|\n`;
      content += (s.functional_requirements || []).map(r => `| ${r.id} | ${r.title} | ${r.description} |`).join("\n") + `\n\n`;
      content += `## 4. Non-Functional Requirements\n`;
      content += `| ID | Type | Description |\n|---|---|---|\n`;
      content += (s.non_functional_requirements || []).map(r => `| ${r.id} | ${r.type} | ${r.description} |`).join("\n") + `\n\n`;
      content += `## 5. Constraints\n${(s.constraints || []).map(c => `- ${c}`).join("\n")}\n`;
    } else if (activeTab === "erd") {
      content = currentArtifacts.erd_mermaid;
    } else if (activeTab === "class") {
      content = currentArtifacts.class_diagram_mermaid;
    } else if (activeTab === "sequence") {
      content = currentArtifacts.sequence_diagram_mermaid;
    } else if (activeTab === "flowchart") {
      content = currentArtifacts.flowchart_mermaid;
    } else if (activeTab === "usecase") {
      content = currentArtifacts.use_case_diagram_mermaid;
    } else if (activeTab === "activity") {
      content = currentArtifacts.activity_diagram_mermaid;
    } else if (activeTab === "dfd") {
      content = currentArtifacts.dfd_mermaid;
    } else if (activeTab === "sql") {
      content = currentArtifacts.sql_schema;
    }

    if (content) {
      const ok = await copyToClipboard(content);
      showToast(ok ? "Copied to clipboard!" : "Copy failed — try again", ok ? "ok" : "err");
    } else {
      showToast("No content to copy", "err");
    }
  };

  // ── PDF exports ──────────────────────────────────────────────────
  const handleExportSRSPDF = () => {
    if (!currentArtifacts?.srs) {
      showToast("No SRS data to export", "err");
      return;
    }
    exportSRSAsPDF(currentArtifacts.srs, projectTitle);
    showToast("PDF print dialog opened — choose \"Save as PDF\"", "ok");
  };

  const handleExportAllPDF = async () => {
    if (!currentArtifacts) {
      showToast("No artifacts to export", "err");
      return;
    }
    showToast("Generating PDF report...", "ok");
    try {
      await exportAllAsPDF(currentArtifacts, projectTitle);
      showToast("PDF print dialog opened — choose \"Save as PDF\"", "ok");
    } catch (e) {
      console.error(e);
      showToast("Failed to generate PDF diagrams", "err");
    }
  };

  const handleDownloadArtifact = () => {
    if (!currentArtifacts) return;

    // SRS → export as PDF directly
    if (activeTab === "srs" && currentArtifacts.srs) {
      handleExportSRSPDF();
      return;
    }

    let content = "";
    let filename = (projectTitle || "project").toLowerCase().replace(/\s+/g, "_");
    let ext = "txt";

    if (activeTab === "erd") {
      content = currentArtifacts.erd_mermaid;
      filename += "_erd";
      ext = "mmd";
    } else if (activeTab === "class") {
      content = currentArtifacts.class_diagram_mermaid;
      filename += "_class_diagram";
      ext = "mmd";
    } else if (activeTab === "sequence") {
      content = currentArtifacts.sequence_diagram_mermaid;
      filename += "_sequence_diagram";
      ext = "mmd";
    } else if (activeTab === "flowchart") {
      content = currentArtifacts.flowchart_mermaid;
      filename += "_flowchart";
      ext = "mmd";
    } else if (activeTab === "usecase") {
      content = currentArtifacts.use_case_diagram_mermaid;
      filename += "_use_case_diagram";
      ext = "mmd";
    } else if (activeTab === "activity") {
      content = currentArtifacts.activity_diagram_mermaid;
      filename += "_activity_diagram";
      ext = "mmd";
    } else if (activeTab === "dfd") {
      content = currentArtifacts.dfd_mermaid;
      filename += "_dfd";
      ext = "mmd";
    } else if (activeTab === "sql") {
      content = currentArtifacts.sql_schema;
      filename += "_schema";
      ext = "sql";
    }

    if (!content) {
      showToast("No content to download", "err");
      return;
    }

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Downloaded successfully!", "ok");
  };

  if (view === "loading") {
    return (
      <div className="auth-loading-screen">
        <div className="spin" />
        <p>Loading design suite…</p>
      </div>
    );
  }

  if (view === "landing") {
    return (
      <>
        <Landing
          onGetStarted={(mode) => {
            setAuthMode(mode || "login");
            setView("auth");
          }}
          brandName="ArchFlow"
        />
        <div className="toast-container">
          {toasts.map(t => (
            <div key={t.id} className={`toast ${t.type}`}>
              {t.type === "ok" ? "✓" : "✕"} {t.message}
            </div>
          ))}
        </div>
      </>
    );
  }

  if (view === "auth") {
    return (
      <>
        <Auth
          onAuthSuccess={handleAuthSuccess}
          initialMode={authMode}
          onGoBack={() => setView("landing")}
        />
        <div className="toast-container">
          {toasts.map(t => (
            <div key={t.id} className={`toast ${t.type}`}>
              {t.type === "ok" ? "✓" : "✕"} {t.message}
            </div>
          ))}
        </div>
      </>
    );
  }

  if (view === "share") {
    return <ShareViewer shareToken={shareToken} />;
  }

  if (view === "admin") {
    return (
      <>
        <AdminPanel
          token={token}
          onCloseAdmin={() => setView("workspace")}
          onToast={showToast}
        />
        <div className="toast-container">
          {toasts.map(t => (
            <div key={t.id} className={`toast ${t.type}`}>
              {t.type === "ok" ? "✓" : "✕"} {t.message}
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <div className={`dashboard-container ${isSidebarCollapsed ? 'sidebar-collapsed-active' : ''}`} ref={containerRef}>
      {/* Mobile Drawer Overlay Backdrop */}
      {mobileSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileSidebarOpen(false)} />
      )}

      <Sidebar
        user={user}
        projects={projects}
        currentProjectId={currentProjectId}
        onSelectProject={handleSelectProject}
        onNewProject={handleNewProject}
        onDeleteProject={handleDeleteProject}
        onRenameProject={handleRenameProject}
        onViewAdmin={() => setView("admin")}
        onLogout={handleLogout}
        accent={accent}
        setAccent={setAccent}
        colorMode={colorMode}
        setColorMode={setColorMode}
        mobileOpen={mobileSidebarOpen}
        onCloseSidebar={() => setMobileSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onCollapse={() => setIsSidebarCollapsed(true)}
      />

      {isSidebarCollapsed && (
        <button 
          className="sidebar-expand-handle" 
          onClick={() => setIsSidebarCollapsed(false)}
          title="Expand Sidebar"
        >
          ▶
        </button>
      )}

      <div className={`chat-area ${mobileActiveView === "chat" ? "active-view" : ""}`}>
        <div className="chat-header">
          <div className="chat-header-left">
            <button 
              className="hamburger-btn" 
              onClick={() => {
                if (window.innerWidth <= 768) {
                  setMobileSidebarOpen(true);
                } else {
                  setIsSidebarCollapsed(false);
                }
              }} 
              title="Open Menu"
            >
              <svg viewBox="0 0 24 24">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <input
              className="project-name-input"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              onBlur={handleSaveProjectName}
              onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
              placeholder="New Project"
              disabled={!currentProjectId}
            />
          </div>
          <div className="chat-header-right">
            {/* Mobile Chat vs Docs Tab Switcher */}
            <div className="mobile-view-tabs">
              <button 
                className={`mobile-view-tab ${mobileActiveView === "chat" ? "active" : ""}`}
                onClick={() => setMobileActiveView("chat")}
              >
                Chat
              </button>
              <button 
                className={`mobile-view-tab ${mobileActiveView === "artifacts" ? "active" : ""}`}
                onClick={() => setMobileActiveView("artifacts")}
              >
                Docs
              </button>
            </div>

            {currentProjectId && (
              <button
                className="share-btn"
                onClick={() => setIsShareModalOpen(true)}
              >
                Share
              </button>
            )}
            <span className={`status-chip ${isSaved ? "saved" : "unsaved"}`}>
              {isSaved ? "Saved" : "Unsaved"}
            </span>
          </div>
        </div>

        <div className="messages">
          {messages.length === 0 ? (
            <div className="welcome-state">
              <div className="welcome-icon">📄</div>
              <h2>DesignDoc Workspace</h2>
              <p>Enter your system specifications below to generate structured requirement documents, technical UML diagrams, and database schemas.</p>
              <div className="suggestion-grid">
                <div className="suggestion" onClick={() => handleUseSuggestion("E-commerce Store: Online store with products, cart, orders, and payment flow")}>
                  <strong>E-commerce</strong>Online store with products, cart, orders, and payment flow
                </div>
                <div className="suggestion" onClick={() => handleUseSuggestion("Social Networking App: User profiles, posts, comments, likes, and following system")}>
                  <strong>Social app</strong>User profiles, posts, comments, likes, and following system
                </div>
                <div className="suggestion" onClick={() => handleUseSuggestion("Booking System: Appointments, availability calendar, reminders, and notifications")}>
                  <strong>Booking system</strong>Appointments, availability calendar, reminders, and notifications
                </div>
                <div className="suggestion" onClick={() => handleUseSuggestion("SaaS Dashboard: Teams, roles, subscription plans, usage tracking, and billing")}>
                  <strong>SaaS dashboard</strong>Teams, roles, subscription plans, usage tracking, and billing
                </div>
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`msg ${m.role}`}>
                <div className="msg-avatar">
                  {m.role === "user" ? (user?.email ? user.email[0].toUpperCase() : "U") : "✦"}
                </div>
                <div className="msg-bubble">
                  <div>
                    {m.text.split("\n").map((line, i) => (
                      <span key={i}>
                        {line}
                        {i < m.text.split("\n").length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                  {m.withChips && currentArtifacts && (
                    <div className="artifact-chips">
                      <div className="artifact-chip" onClick={() => { setActiveTab("srs"); setMobileActiveView("artifacts"); }}>
                        <span className="artifact-chip-dot"></span>📄 SRS
                      </div>
                      <div className="artifact-chip" onClick={() => { setActiveTab("erd"); setMobileActiveView("artifacts"); }}>
                        <span className="artifact-chip-dot"></span>◈ Diagrams
                      </div>
                      <div className="artifact-chip" onClick={() => { setActiveTab("sql"); setMobileActiveView("artifacts"); }}>
                        <span className="artifact-chip-dot"></span>🗄️ SQL Schema
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-wrap" style={{ paddingTop: 0 }}>
          <div className="chat-input-box">
            <textarea
              className="chat-textarea"
              placeholder={currentProjectId ? "Ask for modifications or details..." : "Describe your project or choose a suggestion..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  triggerGenerate();
                }
              }}
              rows={1}
              disabled={loading}
            />
            <button className="send-btn" onClick={triggerGenerate} disabled={loading || !inputText.trim()}>
              <svg viewBox="0 0 24 24">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Resize Handle (desktop only) ── */}
      <div
        className="panel-resize-handle"
        onMouseDown={startResize}
        title="Drag to resize"
      />

      <div
        className={`artifacts-panel ${mobileActiveView === "artifacts" ? "active-view" : ""}`}
        style={{ width: panelWidth, minWidth: panelWidth, maxWidth: panelWidth }}
      >
        <div className="artifacts-header">
          <span className="artifacts-header-title">Artifacts</span>
          <div className="artifacts-header-actions">
            {currentArtifacts && (
              <>
                {!isSaved && (
                  <button className="action-btn" onClick={handleSaveProjectChanges} title="Save changes to database" style={{ background: 'var(--accent)', color: '#fff', border: 'none' }}>
                    💾 Save
                  </button>
                )}
                <button className="action-btn" onClick={handleCopyArtifact} title="Copy current tab content">
                  <svg viewBox="0 0 24 24">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copy
                </button>
                {/* Download current tab (SRS → PDF, others → text file) */}
                <button className="action-btn" onClick={handleDownloadArtifact} title={activeTab === 'srs' ? 'Download SRS as PDF' : 'Download file'}>
                  <svg viewBox="0 0 24 24">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  {activeTab === 'srs' ? 'PDF' : 'Download'}
                </button>
                {/* Export everything as one PDF */}
                <button
                  className="action-btn"
                  onClick={handleExportAllPDF}
                  title="Export all artifacts (SRS + Diagrams + SQL) as one PDF"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  📄 All PDF
                </button>
              </>
            )}
            {loading && <span className="spin" />}
          </div>
        </div>

        {!currentArtifacts ? (
          <div className="artifact-empty">
            <div className="artifact-empty-icon">✦</div>
            <h3>No Artifacts Yet</h3>
            <p>Artifacts will appear here after you send a message.</p>
          </div>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div className="tab-bar">
              <button className={`tab-btn ${activeTab === "srs" ? "active" : ''}`} onClick={() => setActiveTab("srs")}>SRS</button>
              <button className={`tab-btn ${activeTab === "erd" ? "active" : ''}`} onClick={() => setActiveTab("erd")}>ERD</button>
              <button className={`tab-btn ${activeTab === "class" ? "active" : ''}`} onClick={() => setActiveTab("class")}>Class</button>
              <button className={`tab-btn ${activeTab === "sequence" ? "active" : ''}`} onClick={() => setActiveTab("sequence")}>Sequence</button>
              {currentArtifacts.flowchart_mermaid && (
                <button className={`tab-btn ${activeTab === "flowchart" ? "active" : ''}`} onClick={() => setActiveTab("flowchart")}>Flowchart</button>
              )}
              {currentArtifacts.use_case_diagram_mermaid && (
                <button className={`tab-btn ${activeTab === "usecase" ? "active" : ''}`} onClick={() => setActiveTab("usecase")}>Use Case</button>
              )}
              {currentArtifacts.activity_diagram_mermaid && (
                <button className={`tab-btn ${activeTab === "activity" ? "active" : ''}`} onClick={() => setActiveTab("activity")}>Activity</button>
              )}
              {currentArtifacts.dfd_mermaid && (
                <button className={`tab-btn ${activeTab === "dfd" ? "active" : ''}`} onClick={() => setActiveTab("dfd")}>DFD</button>
              )}
              <button className={`tab-btn ${activeTab === "sql" ? "active" : ''}`} onClick={() => setActiveTab("sql")}>SQL</button>
            </div>
            
            {/* Diagram tabs: no padding — dv-root fills the full height */}
            {(activeTab === "erd" || activeTab === "class" || activeTab === "sequence" || activeTab === "flowchart" || activeTab === "usecase" || activeTab === "activity" || activeTab === "dfd") && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                {activeTab === "erd"       && <DiagramView code={currentArtifacts.erd_mermaid}              title="Entity Relationship Diagram" onUpdateCode={(c) => updateLocalArtifact('erd_mermaid', c)} />}
                {activeTab === "class"     && <DiagramView code={currentArtifacts.class_diagram_mermaid}    title="Class Diagram" onUpdateCode={(c) => updateLocalArtifact('class_diagram_mermaid', c)} />}
                {activeTab === "sequence"  && <DiagramView code={currentArtifacts.sequence_diagram_mermaid} title="Sequence Diagram" onUpdateCode={(c) => updateLocalArtifact('sequence_diagram_mermaid', c)} />}
                {activeTab === "flowchart" && <DiagramView code={currentArtifacts.flowchart_mermaid}        title="System Flowchart" onUpdateCode={(c) => updateLocalArtifact('flowchart_mermaid', c)} />}
                {activeTab === "usecase"   && <DiagramView code={currentArtifacts.use_case_diagram_mermaid} title="Use Case Diagram" onUpdateCode={(c) => updateLocalArtifact('use_case_diagram_mermaid', c)} />}
                {activeTab === "activity"  && <DiagramView code={currentArtifacts.activity_diagram_mermaid} title="Activity Diagram" onUpdateCode={(c) => updateLocalArtifact('activity_diagram_mermaid', c)} />}
                {activeTab === "dfd"       && <DiagramView code={currentArtifacts.dfd_mermaid}              title="Data Flow Diagram (DFD)" onUpdateCode={(c) => updateLocalArtifact('dfd_mermaid', c)} />}
              </div>
            )}

            {/* SRS & SQL: standard scrollable padded container */}
            {(activeTab === "srs" || activeTab === "sql") && (
              <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
                {activeTab === "srs" && <SRSView srs={currentArtifacts.srs} />}
                {activeTab === "sql" && <SQLView sql={currentArtifacts.sql_schema} />}
              </div>
            )}
          </div>
        )}
      </div>

      <ShareModal
        projectId={currentProjectId}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        token={token}
        onToast={showToast}
      />

      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.type === "ok" ? "✓" : "✕"} {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
