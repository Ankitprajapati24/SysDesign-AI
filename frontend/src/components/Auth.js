import { useState } from 'react';
import { API_BASE } from '../config';

export default function Auth({ onAuthSuccess, initialMode = 'login', onGoBack, colorMode, onToggleTheme, onGuestLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState(initialMode);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [guestNameInput, setGuestNameInput] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Authentication failed');
      }

      let authData = data;
      if (mode === 'register') {
        // Auto-login to obtain tokens
        const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        authData = await loginResponse.json();
        if (!loginResponse.ok) {
          throw new Error(authData.detail || authData.message || 'Auto-login failed');
        }
      }

      if (authData.access_token) {
        const meResponse = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${authData.access_token}` }
        });
        const user = await meResponse.json();
        onAuthSuccess(authData.access_token, user, authData.refresh_token);
      } else {
        setError('Unexpected response from server');
      }
    } catch (err) {
      setError(err.message || 'Server connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSubmit = (e) => {
    e.preventDefault();
    if (!guestNameInput.trim()) {
      setError('Please enter your name');
      return;
    }
    setError('');
    if (onGuestLogin) {
      onGuestLogin(guestNameInput.trim());
    }
  };

  return (
    <div className="auth-container-wrapper">
      {/* ArchFlow Logo top left */}
      <div className="auth-logo-fixed" onClick={() => onGoBack && onGoBack()} style={{ cursor: 'pointer' }}>
        <span className="auth-logo-brand">ArchFlow</span>
      </div>

      {/* Theme toggle top right */}
      <div 
        className="auth-theme-toggle-fixed" 
        style={{ 
          position: 'absolute', 
          top: '40px', 
          right: '60px', 
          zIndex: 10, 
        }}
      >
        <div className="mode-toggle">
          <button
            type="button"
            className={`mode-btn ${colorMode === 'dark' ? 'active' : ''}`}
            onClick={() => colorMode !== 'dark' && onToggleTheme()}
            title="Dark mode"
          >
            Dark
          </button>
          <button
            type="button"
            className={`mode-btn ${colorMode === 'light' ? 'active' : ''}`}
            onClick={() => colorMode !== 'light' && onToggleTheme()}
            title="Light mode"
          >
            Light
          </button>
        </div>
      </div>

      <div className="auth-card">
        {/* Left Side: Branding & Features */}
        <div className="auth-card-left">
          <h1 className="auth-brand-headline">
            <span className="gradient-text">AI-powered</span> software engineering workspace
          </h1>

          <div className="auth-feature-list">
            <div className="auth-feature-row">
              <div className="auth-icon-circle">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="auth-feature-info">
                <h3>Generate SRS documents</h3>
                <p>Automatically from natural language.</p>
              </div>
            </div>

            <div className="auth-feature-row">
              <div className="auth-icon-circle">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2v8M12 10H5v12M12 10h7v12M2 22h6M9 22h6M16 22h6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="auth-feature-info">
                <h3>Generate UML, ER and DFD</h3>
                <p>Diagrams instantly.</p>
              </div>
            </div>

            <div className="auth-feature-row">
              <div className="auth-icon-circle">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="auth-feature-info">
                <h3>Export documents and schemas</h3>
                <p>PDF, DOCX, PNG and SQL formats.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login/Register Form */}
        <div className="auth-card-right">
          {/* Welcome alert box */}
          <div className="auth-welcome-alert">
            <p>Welcome to <strong>ArchFlow</strong> — your AI-powered software engineering workspace.</p>
          </div>

          {/* Tab Switcher */}
          {mode !== 'guest' && (
            <div className="auth-mode-tabs" style={{ display: 'flex', borderBottom: '1px solid var(--border2, #21262d)', marginBottom: '20px' }}>
              <button
                type="button"
                style={{
                  flex: 1,
                  padding: '12px 6px',
                  background: 'none',
                  border: 'none',
                  color: mode === 'login' ? 'var(--accent, #2f81f7)' : 'var(--text-sec, #8b949e)',
                  borderBottom: mode === 'login' ? '2px solid var(--accent, #2f81f7)' : '2px solid transparent',
                  fontWeight: mode === 'login' ? '600' : '500',
                  cursor: 'pointer',
                  fontFamily: 'var(--sans)',
                  fontSize: '14px',
                  transition: 'all 0.15s ease'
                }}
                onClick={() => { setMode('login'); setError(''); }}
              >
                Sign In
              </button>
              <button
                type="button"
                style={{
                  flex: 1,
                  padding: '12px 6px',
                  background: 'none',
                  border: 'none',
                  color: mode === 'register' ? 'var(--accent, #2f81f7)' : 'var(--text-sec, #8b949e)',
                  borderBottom: mode === 'register' ? '2px solid var(--accent, #2f81f7)' : '2px solid transparent',
                  fontWeight: mode === 'register' ? '600' : '500',
                  cursor: 'pointer',
                  fontFamily: 'var(--sans)',
                  fontSize: '14px',
                  transition: 'all 0.15s ease'
                }}
                onClick={() => { setMode('register'); setError(''); }}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Dynamic welcome header */}
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main, #c9d1d9)', margin: '0 0 6px 0' }}>
              {mode === 'guest' ? 'Continue as Guest' : mode === 'login' ? 'Welcome Back' : 'Get Started Free'}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-sec, #8b949e)', margin: 0 }}>
              {mode === 'guest'
                ? 'Enter your name to start using ArchFlow instantly. No password required.'
                : mode === 'login' ? 'Sign in to access your saved architecture designs' : 'Register in seconds to start building software specs'}
            </p>
          </div>

          {mode !== 'guest' ? (
            <>
              {/* Guest outline button */}
              <button 
                type="button" 
                className="auth-google-btn"
                style={{ 
                  background: 'none', 
                  border: '1px solid var(--border2)', 
                  color: 'var(--text-main)', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onClick={() => {
                  setMode('guest');
                  setError('');
                }}
              >
                <span style={{ fontSize: '15px' }}>👤</span>
                <span>Continue as Guest</span>
              </button>

              <div className="auth-divider">
                <span>OR</span>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate className="auth-form-el">
                <div className="auth-input-group">
                  <label className="auth-input-label" htmlFor="auth-email">Email</label>
                  <input
                    id="auth-email"
                    type="email"
                    placeholder="you@example.com"
                    className="auth-custom-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="auth-input-group">
                  <label className="auth-input-label" htmlFor="auth-password">Password</label>
                  <input
                    id="auth-password"
                    type="password"
                    placeholder="••••••••"
                    className="auth-custom-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    required
                  />
                </div>

                {error && (
                  <div className="auth-error-msg" role="alert">{error}</div>
                )}

                <button
                  id="auth-submit-btn"
                  type="submit"
                  className="auth-submit-pill-btn"
                  disabled={loading}
                >
                  {loading
                    ? (mode === 'login' ? 'Signing in...' : 'Creating account...')
                    : (mode === 'login' ? 'Start Designing →' : 'Create Account →')
                  }
                </button>
              </form>

              {/* Mode Switcher */}
              <div className="auth-bottom-switch">
                <p style={{ margin: '4px 0' }}>
                  {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                  <button
                    type="button"
                    className="auth-switch-link-btn"
                    onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
                  >
                    {mode === 'login' ? 'Register here' : 'Sign In'}
                  </button>
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Guest Form */}
              <form onSubmit={handleGuestSubmit} noValidate className="auth-form-el">
                <div className="auth-input-group">
                  <label className="auth-input-label" htmlFor="auth-guest-name">Your Name</label>
                  <input
                    id="auth-guest-name"
                    type="text"
                    placeholder="e.g. John Doe"
                    className="auth-custom-input"
                    value={guestNameInput}
                    onChange={(e) => setGuestNameInput(e.target.value)}
                    disabled={loading}
                    autoFocus
                    required
                  />
                </div>

                {error && (
                  <div className="auth-error-msg" role="alert">{error}</div>
                )}

                <button
                  id="auth-guest-submit-btn"
                  type="submit"
                  className="auth-submit-pill-btn"
                  disabled={loading}
                >
                  Start Designing →
                </button>
              </form>

              {/* Mode Switcher */}
              <div className="auth-bottom-switch">
                <p style={{ margin: '4px 0' }}>
                  <button
                    type="button"
                    className="auth-switch-link-btn"
                    onClick={() => { setMode('login'); setError(''); }}
                  >
                    ← Back to Sign In
                  </button>
                </p>
              </div>
            </>
          )}

          <div className="auth-card-footer">
            <p>By signing up, I agree to the <span className="footer-link">Terms of Use</span> and <span className="footer-link">Privacy Policy</span>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
