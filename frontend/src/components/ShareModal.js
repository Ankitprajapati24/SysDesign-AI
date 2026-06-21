import { useState, useEffect } from 'react';
import { API_BASE } from '../config';
import { copyToClipboard } from '../utils/clipboard';

export default function ShareModal({ projectId, isOpen, onClose, token, onToast }) {
  const [loading, setLoading] = useState(false);
  const [shareData, setShareData] = useState(null);

  useEffect(() => {
    if (isOpen && projectId) {
      loadShareInfo();
    }
  }, [isOpen, projectId]);

  const loadShareInfo = async () => {
    setLoading(true);
    setShareData(null);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/api/projects/${projectId}/share`, { headers });
      const r = await res.json();
      
      if (r.success && r.data) {
        setShareData(r.data);
      } else {
        // Create new share link if none exists
        const createRes = await fetch(`${API_BASE}/api/projects/${projectId}/share`, {
          method: 'POST',
          headers
        });
        const cr = await createRes.json();
        if (cr.success) {
          setShareData(cr.data);
        } else {
          throw new Error(cr.message || 'Failed to create share link');
        }
      }
    } catch (e) {
      onToast(e.message || 'Failed to fetch share details', 'err');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const copyShareUrl = async () => {
    if (!shareData?.share_token) return;
    const localShareUrl = `${window.location.origin}/share/${shareData.share_token}`;
    const ok = await copyToClipboard(localShareUrl);
    onToast(ok ? 'Link copied to clipboard!' : 'Failed to copy — please copy manually', ok ? 'ok' : 'err');
  };

  const revokeShare = async () => {
    if (!projectId || !window.confirm('Revoke this share link? People will no longer be able to view it.')) return;
    
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/api/projects/${projectId}/share`, {
        method: 'DELETE',
        headers
      });
      const r = await res.json();
      if (r.success) {
        onToast('Share link revoked successfully', 'ok');
        onClose();
      } else {
        throw new Error(r.message || 'Failed to revoke link');
      }
    } catch (e) {
      onToast(e.message || 'Failed to revoke link', 'err');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h3>Share Project</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: '13px', color: 'var(--muted2)', marginBottom: '15px' }}>
            Anyone with this link will be able to view the generated artifacts in read-only mode.
          </p>
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--muted)' }}>
              <span className="spin"></span> Generating link...
            </div>
          )}
          {shareData && !loading && (
            <div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
                <input
                  id="shareUrlInput"
                  className="auth-input"
                  readOnly
                  style={{ marginBottom: 0, flex: 1, cursor: 'pointer' }}
                  value={`${window.location.origin}/share/${shareData.share_token}`}
                  onClick={(e) => e.target.select()}
                />
                <button
                  className="auth-btn"
                  style={{ marginTop: 0, width: 'auto', padding: '10px 16px', WhiteSpace: 'nowrap' }}
                  onClick={copyShareUrl}
                >
                  Copy Link
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                  Views: {shareData.view_count || 0}
                </span>
                <button
                  className="dg-btn"
                  style={{ color: 'var(--danger)', borderColor: 'rgba(255,79,106,0.2)' }}
                  onClick={revokeShare}
                >
                  Revoke Share
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
