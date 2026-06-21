import { useState } from 'react';

const ACCENTS = [
  { name: 'blue',   color: '#2f81f7', label: 'Blue'   },
  { name: 'green',  color: '#3fb950', label: 'Green'  },
  { name: 'purple', color: '#8b5cf6', label: 'Purple' },
  { name: 'orange', color: '#f0883e', label: 'Orange' },
  { name: 'pink',   color: '#e879f9', label: 'Pink'   },
];

export default function Sidebar({
  user,
  projects,
  currentProjectId,
  onSelectProject,
  onNewProject,
  onDeleteProject,
  onRenameProject,
  onViewAdmin,
  onLogout,
  accent,
  setAccent,
  colorMode,
  setColorMode,
  mobileOpen,
  onCloseSidebar,
  isCollapsed,
  onCollapse,
}) {
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const handleStartEdit = (p) => {
    setEditingProjectId(p.id);
    setEditTitle(p.title || '');
  };

  const handleFinishEdit = async (id) => {
    if (!editTitle.trim()) { setEditingProjectId(null); return; }
    setEditingProjectId(null);
    onRenameProject(id, editTitle.trim());
  };

  const handleProjectSelect = (p) => {
    onSelectProject(p);
    if (onCloseSidebar) onCloseSidebar();
  };

  const handleNewProjectClick = () => {
    onNewProject();
    if (onCloseSidebar) onCloseSidebar();
  };

  return (
    <div className={`sidebar ${mobileOpen ? 'mobile-open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Top row: logo + new button */}
      <div className="sidebar-top">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">AF</div>
          <span className="sidebar-logo-name">ArchFlow</span>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button className="sidebar-new-btn" onClick={handleNewProjectClick}>
            + New
          </button>
          {!mobileOpen && onCollapse && (
            <button 
              className="sidebar-collapse-btn" 
              onClick={onCollapse}
              title="Collapse Sidebar"
            >
              ◀
            </button>
          )}
          {mobileOpen && onCloseSidebar && (
            <button
              onClick={onCloseSidebar}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-sec)',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '4px 6px',
                lineHeight: 1,
                borderRadius: '4px',
              }}
              title="Close menu"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Projects list */}
      <div className="sidebar-section-label">Projects</div>
      <div className="sidebar-list">
        {projects.length === 0 ? (
          <div className="sidebar-empty">No projects yet. Create one above.</div>
        ) : (
          projects.map((p) => (
            <div
              key={p.id}
              className={`project-item ${p.id === currentProjectId ? 'active' : ''}`}
              onClick={() => editingProjectId !== p.id && handleProjectSelect(p)}
              onDoubleClick={() => handleStartEdit(p)}
            >
              <div className="p-icon">◈</div>
              <div className="p-meta">
                {editingProjectId === p.id ? (
                  <input
                    className="p-name-edit"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => handleFinishEdit(p.id)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleFinishEdit(p.id); }}
                    autoFocus
                  />
                ) : (
                  <div className="p-name">{p.title || 'Untitled'}</div>
                )}
                <div className="p-date">
                  {p.created_at ? new Date(p.created_at).toLocaleDateString() : ''}
                </div>
              </div>
              <button
                className="p-del"
                onClick={(e) => { e.stopPropagation(); onDeleteProject(p.id); }}
                title="Delete project"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {/* Admin button (only for admins) */}
      {user?.role === 'admin' && (
        <div className="sidebar-admin-btn" id="adminSidebarButton">
          <button onClick={onViewAdmin}>
            🛡 Admin Panel
          </button>
        </div>
      )}

      {/* Bottom settings */}
      <div className="sidebar-bottom">
        <div className="sidebar-settings">
          {/* Dark / Light mode toggle */}
          <div className="sidebar-settings-row">
            <span className="settings-label">Mode</span>
            <div className="mode-toggle">
              <button
                className={`mode-btn ${colorMode === 'dark' ? 'active' : ''}`}
                onClick={() => setColorMode('dark')}
                title="Dark mode"
              >
                Dark
              </button>
              <button
                className={`mode-btn ${colorMode === 'light' ? 'active' : ''}`}
                onClick={() => setColorMode('light')}
                title="Light mode"
              >
                Light
              </button>
            </div>
          </div>

          {/* Accent color picker removed for standard corporate theme styling */}
        </div>

        {/* User info + logout */}
        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.email ? user.email[0].toUpperCase() : 'U'}
          </div>
          <div className="user-email" title={user?.email}>
            {user?.email || 'User'}
          </div>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </div>
    </div>
  );
}
