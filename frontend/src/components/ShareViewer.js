import { useState, useEffect } from 'react';
import { API_BASE } from '../config';
import SRSView from './SRSView';
import DiagramView from './DiagramView';
import SQLView from './SQLView';

export default function ShareViewer({ shareToken }) {
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('srs');
  const [artifacts, setArtifacts] = useState(null);

  useEffect(() => {
    if (shareToken) {
      loadSharedProject();
    }
  }, [shareToken]);

  const loadSharedProject = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/public/shared/${shareToken}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to load shared project');
      }

      const r = await res.json();
      const p = r.data;
      setProject(p);

      // Reconstruct artifacts dictionary
      let content = {};
      if (p.artifacts?.length) {
        p.artifacts.forEach(art => {
          if (art.artifact_type === 'srs') {
            try { content.srs = JSON.parse(art.content); } catch { content.srs = art.content; }
          } else {
            content[art.artifact_type] = art.content;
          }
        });
      }
      setArtifacts(content);
    } catch (e) {
      setError(e.message || 'Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
        <div className="spinner"></div>
        <p style={{ color: 'var(--muted2)' }}>Loading shared project design doc...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)', padding: '20px', textAlign: 'center' }}>
        <div className="artifact-empty">
          <div className="icon-wrap" style={{ color: 'var(--danger)', borderColor: 'rgba(255,79,106,0.2)' }}>✕</div>
          <h3 style={{ marginTop: '10px' }}>Shared Project Unavaliable</h3>
          <p style={{ color: 'var(--muted2)' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)', justifyContent: 'center' }}>
      <div className="artifacts-panel" style={{ width: '80%', maxWidth: '1000px', borderLeft: 'none', borderRight: 'none' }}>
        <div className="artifacts-header">
          <h3>Shared design: {project?.title || 'Untitled'}</h3>
          <span style={{ fontSize: '11px', color: 'var(--muted)' }}>READ-ONLY VIEWER</span>
        </div>

        <div className="tab-bar">
          <button className={`tab-btn ${activeTab === 'srs' ? 'active' : ''}`} onClick={() => setActiveTab('srs')}>SRS</button>
          <button className={`tab-btn ${activeTab === 'erd' ? 'active' : ''}`} onClick={() => setActiveTab('erd')}>ERD</button>
          <button className={`tab-btn ${activeTab === 'class' ? 'active' : ''}`} onClick={() => setActiveTab('class')}>Class</button>
          <button className={`tab-btn ${activeTab === 'sequence' ? 'active' : ''}`} onClick={() => setActiveTab('sequence')}>Sequence</button>
          <button className={`tab-btn ${activeTab === 'sql' ? 'active' : ''}`} onClick={() => setActiveTab('sql')}>SQL</button>
        </div>

        <div className="sidebar-list" style={{ flex: 1, overflowY: 'auto' }}>
          {artifacts && (
            <div style={{ padding: '24px' }}>
              {activeTab === 'srs' && <SRSView srs={artifacts.srs} />}
              {activeTab === 'erd' && (
                <DiagramView 
                  code={artifacts.erd_mermaid} 
                  title="Entity Relationship Diagram" 
                />
              )}
              {activeTab === 'class' && (
                <DiagramView 
                  code={artifacts.class_diagram_mermaid} 
                  title="Class Diagram" 
                />
              )}
              {activeTab === 'sequence' && (
                <DiagramView 
                  code={artifacts.sequence_diagram_mermaid} 
                  title="Sequence Diagram" 
                />
              )}
              {activeTab === 'sql' && <SQLView sql={artifacts.sql_schema} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
