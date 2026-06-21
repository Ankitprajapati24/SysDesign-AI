// API Base URL Configuration
// - Development: auto-detects localhost:8000
// - Production: set REACT_APP_API_BASE_URL in Vercel environment variables
export const API_BASE = 
  process.env.REACT_APP_API_BASE_URL ||
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000'
    : window.location.origin);
