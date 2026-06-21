import { useState } from 'react';
import { API_BASE } from '../config';

export default function Auth({ onAuthSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

      if (data.access_token) {
        const meResponse = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${data.access_token}` }
        });
        const user = await meResponse.json();
        onAuthSuccess(data.access_token, user);
      } else {
        setError('Unexpected response from server');
      }
    } catch (err) {
      setError(err.message || 'Server connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container-wrapper">
      {/* SEDocura Logo top left */}
      <div className="auth-logo-fixed">
        <span className="auth-logo-brand">SEDocura</span>
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
            <p>Welcome to <strong>SEDocura</strong> — your AI-powered software engineering workspace.</p>
          </div>

          {/* Google Sign In button */}
          <button 
            type="button" 
            className="auth-google-btn"
            onClick={() => alert("Google sign in is configured for demo. Please use the email form to sign in/register.")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span>Sign in with Google</span>
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
            <p>
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

          <div className="auth-card-footer">
            <p>By signing up, I agree to the <span className="footer-link">Terms of Use</span> and <span className="footer-link">Privacy Policy</span>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
