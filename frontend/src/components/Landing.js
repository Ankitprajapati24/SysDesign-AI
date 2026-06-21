import React from 'react';

export default function Landing({ onGetStarted, brandName = "ArchFlow" }) {
  return (
    <div className="landing-container">
      {/* ── Navbar ── */}
      <header className="landing-header">
        <div className="landing-logo-area">
          <svg className="landing-logo-svg" width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7c6aff" />
                <stop offset="100%" stopColor="#2dd4a0" />
              </linearGradient>
            </defs>
            {/* Draw a stylized 'A' with nodes and flow lines */}
            <path d="M12 2L4 18H20L12 2Z" stroke="url(#logo-grad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="5" r="2.5" fill="#7c6aff" />
            <circle cx="6" cy="15" r="2.5" fill="#2dd4a0" />
            <circle cx="18" cy="15" r="2.5" fill="#2dd4a0" />
            <line x1="6.5" y1="14.5" x2="17.5" y2="14.5" stroke="url(#logo-grad)" strokeWidth="1.5" />
          </svg>
          <span className="landing-brand-name">{brandName}</span>
        </div>
        <div className="landing-nav-actions">
          <button className="landing-login-btn" onClick={() => onGetStarted('login')}>Sign In</button>
          <button className="landing-register-btn" onClick={() => onGetStarted('register')}>Register</button>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="landing-hero">
        <div className="landing-hero-badge">✦ AI-Powered Software Architecture Suite</div>
        <h1 className="landing-hero-title">
          From Text Description to <span className="gradient-text">Complete System Architecture</span> in Seconds
        </h1>
        <p className="landing-hero-subtitle">
          Describe your application ideas in plain text. ArchFlow automatically generates professional system blueprints, structured SRS documentation, database schemas, and interactive UML diagrams.
        </p>

        <div className="landing-hero-ctas">
          <button className="landing-cta-primary" onClick={() => onGetStarted('register')}>
            Start Designing for Free
            <svg className="arrow-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
          <button className="landing-cta-secondary" onClick={() => {
            const el = document.getElementById('features');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}>
            Explore Features
          </button>
        </div>

        {/* ── Mockup Preview of the App ── */}
        <div className="landing-mockup-wrapper">
          <div className="landing-mockup-header">
            <div className="mockup-dots">
              <span className="dot dot-red"></span>
              <span className="dot dot-yellow"></span>
              <span className="dot dot-green"></span>
            </div>
            <div className="mockup-tab">{brandName} Workspace</div>
          </div>
          <div className="landing-mockup-body">
            <div className="mockup-sidebar">
              <div className="mockup-item active">🏠 Workspace</div>
              <div className="mockup-item">📁 E-commerce System</div>
              <div className="mockup-item">📁 Chat Application</div>
              <div className="mockup-item">📁 Library Management</div>
            </div>
            <div className="mockup-chat-panel">
              <div className="mockup-msg user">Build a microservices architecture for a food delivery app.</div>
              <div className="mockup-msg assistant">
                Generating architecture artifacts for <strong>Food Delivery App</strong>...
                <br />
                <span className="mockup-tag">✓ SRS doc generated</span>
                <span className="mockup-tag">✓ Class Diagram ready</span>
                <span className="mockup-tag">✓ SQL Schema created</span>
              </div>
            </div>
            <div className="mockup-visualizer-panel">
              <div className="mockup-tabs">
                <span className="m-tab">SRS Document</span>
                <span className="m-tab active">System ERD</span>
                <span className="m-tab">SQL DDL</span>
              </div>
              <div className="mockup-diagram-content">
                {/* SVG Mocking a Mermaid diagram */}
                <svg width="100%" height="100%" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="10" y="35" width="45" height="25" rx="3" fill="#1e2028" stroke="#7c6aff" strokeWidth="1.5" />
                  <text x="32.5" y="50" fill="#e2e4ee" fontSize="6" textAnchor="middle" fontWeight="bold">User DB</text>
                  
                  <path d="M55 47.5 H95" stroke="#6b7090" strokeWidth="1" strokeDasharray="2,2" />
                  
                  <rect x="95" y="35" width="45" height="25" rx="3" fill="#1e2028" stroke="#2dd4a0" strokeWidth="1.5" />
                  <text x="117.5" y="50" fill="#e2e4ee" fontSize="6" textAnchor="middle" fontWeight="bold">Order Service</text>

                  <path d="M117.5 60 V90" stroke="#6b7090" strokeWidth="1" />

                  <rect x="95" y="90" width="45" height="25" rx="3" fill="#1e2028" stroke="#ffaa3d" strokeWidth="1.5" />
                  <text x="117.5" y="105" fill="#e2e4ee" fontSize="6" textAnchor="middle" fontWeight="bold">Payment API</text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section className="landing-features" id="features">
        <h2 className="section-title">Everything You Need to Design Systems</h2>
        <p className="section-subtitle">A professional playground designed for class projects, system design prep, and fast prototyping.</p>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔮</div>
            <h3>AI Architecture Blueprinting</h3>
            <p>Describe your app requirements in natural language and watch the AI build standard modular components and APIs automatically.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Mermaid Diagrams Visualizer</h3>
            <p>Generates UML diagrams, Entity Relationships (ERD), Use Case, Sequence diagrams, and DFDs. Edit the Mermaid code live inside the visualizer.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🗄️</div>
            <h3>SQL Schema Generator</h3>
            <p>Converts system designs directly into SQL database DDL scripts (PostgreSQL, SQLite compatibility) ready to import into your database.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📄</div>
            <h3>One-Click PDF / SRS Export</h3>
            <p>Compile all generated diagrams and text descriptions into a comprehensive Software Requirements Specification (SRS) PDF file in one click.</p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <p>© 2026 {brandName} Design Suite. Developed for colleges, software developers, and students.</p>
      </footer>
    </div>
  );
}
