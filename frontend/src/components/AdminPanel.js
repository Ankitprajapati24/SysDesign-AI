import { useState, useEffect } from 'react';
import { API_BASE } from '../config';

export default function AdminPanel({ token, onCloseAdmin, onToast }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  useEffect(() => {
    loadAllAdminData();
  }, [search]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      refreshAdminDataSilent();
    }, 15000);
    return () => clearInterval(interval);
  }, [autoRefresh, search]);

  const refreshAdminDataSilent = async () => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const statsRes = await fetch(`${API_BASE}/api/admin/stats`, { headers });
      const sr = await statsRes.json();
      if (sr.success) setStats(sr.data);

      const usersUrl = search 
        ? `${API_BASE}/api/admin/users?search=${encodeURIComponent(search)}`
        : `${API_BASE}/api/admin/users`;
      const usersRes = await fetch(usersUrl, { headers });
      const ur = await usersRes.json();
      if (ur.success) setUsers(ur.data.items || []);

      const projectsRes = await fetch(`${API_BASE}/api/admin/projects`, { headers });
      const pr = await projectsRes.json();
      if (pr.success) setProjects(pr.data.items || []);
      
      setLastRefreshed(new Date());
    } catch (e) {
      console.warn("Silent admin refresh failed:", e);
    }
  };

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // 1. Fetch Stats
      const statsRes = await fetch(`${API_BASE}/api/admin/stats`, { headers });
      const sr = await statsRes.json();
      if (sr.success) setStats(sr.data);

      // 2. Fetch Users
      const usersUrl = search 
        ? `${API_BASE}/api/admin/users?search=${encodeURIComponent(search)}`
        : `${API_BASE}/api/admin/users`;
      const usersRes = await fetch(usersUrl, { headers });
      const ur = await usersRes.json();
      if (ur.success) setUsers(ur.data.items || []);

      // 3. Fetch Projects
      const projectsRes = await fetch(`${API_BASE}/api/admin/projects`, { headers });
      const pr = await projectsRes.json();
      if (pr.success) setProjects(pr.data.items || []);
      
      setLastRefreshed(new Date());
    } catch (e) {
      onToast(e.message || 'Failed to fetch admin data', 'err');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const headers = { 
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      
      const res = await fetch(`${API_BASE}/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ is_active: !user.is_active })
      });
      const r = await res.json();
      if (r.success) {
        onToast(`User status updated`, 'ok');
        loadAllAdminData();
      } else {
        throw new Error(r.message || 'Failed to update user status');
      }
    } catch (e) {
      onToast(e.message, 'err');
    }
  };

  const handleToggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

    try {
      const headers = { 
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      
      const res = await fetch(`${API_BASE}/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ role: newRole })
      });
      const r = await res.json();
      if (r.success) {
        onToast(`User role updated`, 'ok');
        loadAllAdminData();
      } else {
        throw new Error(r.message || 'Failed to update user role');
      }
    } catch (e) {
      onToast(e.message, 'err');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action is permanent and deletes all their projects.')) return;

    try {
      const headers = { 
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers
      });
      const r = await res.json();
      if (r.success || res.status === 200) {
        onToast('User deleted', 'ok');
        loadAllAdminData();
      } else {
        throw new Error(r.message || 'Failed to delete user');
      }
    } catch (e) {
      onToast(e.message, 'err');
    }
  };

  return (
    <div className="admin-view">
      <div className="admin-header-row">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h2 style={{ margin: 0 }}>🛡 System Administration</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--text-sec)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span className="dot" style={{ width: '8px', height: '8px', background: autoRefresh ? 'var(--success, #3fb950)' : 'var(--text-sec)', borderRadius: '50%', display: 'inline-block' }}></span>
              {autoRefresh ? 'Live Polling Active' : 'Polling Paused'}
            </span>
            <span>Last Updated: {lastRefreshed.toLocaleTimeString()}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="back-btn" 
            onClick={() => loadAllAdminData()}
            title="Force refresh all admin metrics"
            style={{ padding: '7px 12px' }}
          >
            🔄 Refresh
          </button>
          <button 
            className="back-btn" 
            onClick={() => setAutoRefresh(!autoRefresh)}
            style={{ padding: '7px 12px', borderColor: autoRefresh ? 'var(--accent)' : 'var(--border2)' }}
          >
            {autoRefresh ? 'Pause Auto' : 'Resume Auto'}
          </button>
          <button className="back-btn" onClick={onCloseAdmin}>← Back</button>
        </div>
      </div>

      {loading && !stats ? (
        <div style={{ display: 'flex', gap: '8px', color: 'var(--text-sec)', fontSize: '13px', padding: '20px 0' }}>
          <span className="spin"></span> Loading administration data...
        </div>
      ) : (
        <>
          {/* STATS */}
          {stats && (
            <div className="stats-grid">
              <div className="stat-card accent">
                <div className="stat-label">Total Users</div>
                <div className="stat-value">{stats.total_users}</div>
              </div>
              <div className="stat-card green">
                <div className="stat-label">Active Users</div>
                <div className="stat-value">{stats.active_users}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Projects</div>
                <div className="stat-value">{stats.total_projects}</div>
              </div>
              <div className="stat-card warn">
                <div className="stat-label">Generations Today</div>
                <div className="stat-value">{stats.generations_today}</div>
              </div>
            </div>
          )}

          {/* USER MANAGEMENT */}
          <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>User Management</h3>
              <input
                className="auth-input"
                placeholder="Search users by email..."
                style={{ marginBottom: 0, width: '260px', padding: '6px 12px' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Projects</th>
                    <th>Registered</th>
                    <th>Last Active</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', color: 'var(--muted)', padding: '20px' }}>
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td style={{ fontWeight: 500 }}>{u.email}</td>
                        <td>
                          <span className={`badge ${u.role === 'admin' ? 'admin' : u.role === 'guest' ? 'guest' : 'user'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>{u.project_count || 0}</td>
                        <td>{u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}</td>
                        <td>{u.last_generation_at ? new Date(u.last_generation_at).toLocaleString() : 'Never'}</td>
                        <td>
                          <span className={`badge ${u.is_active ? 'active' : 'inactive'}`}>
                            {u.is_active ? 'active' : 'inactive'}
                          </span>
                        </td>
                        <td className="actions-cell">
                          <button 
                            className="dg-btn" 
                            style={{ borderColor: u.is_active ? 'rgba(255,79,106,0.2)' : 'rgba(45,212,160,0.2)', color: u.is_active ? 'var(--danger)' : 'var(--green)' }}
                            onClick={() => handleToggleStatus(u)}
                          >
                            {u.is_active ? 'Suspend' : 'Activate'}
                          </button>
                          <button 
                            className="dg-btn"
                            onClick={() => handleToggleRole(u)}
                          >
                            Toggle Role
                          </button>
                          <button 
                            className="dg-btn" 
                            style={{ background: 'rgba(255, 79, 106, 0.05)', color: 'var(--danger)', borderColor: 'rgba(255,79,106,0.15)' }}
                            onClick={() => handleDeleteUser(u.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SYSTEM PROJECTS */}
          <div className="admin-card">
            <h3>System Projects (Latest)</h3>
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Owner</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', color: 'var(--muted)', padding: '20px' }}>
                        No projects created yet
                      </td>
                    </tr>
                  ) : (
                    projects.map((p) => (
                      <tr key={p.id}>
                        <td>{p.id}</td>
                        <td style={{ fontWeight: 500 }}>{p.title || 'Untitled'}</td>
                        <td>{p.owner_email || 'Unknown'}</td>
                        <td>{p.created_at ? new Date(p.created_at).toLocaleString() : ''}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
