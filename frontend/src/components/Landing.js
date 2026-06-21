import React from 'react';

export default function Landing({ onGetStarted, brandName = "ArchFlow", colorMode, onToggleTheme }) {
  // Static content that can be easily edited later
  const teamMembers = [
    { name: "Ankit Prajapati", role: "CSE 3rd Year" },
    { name: "Anuj Patel", role: "CSE 3rd Year" },
    { name: "Minisha Solanki", role: "CSE 3rd Year" },
    { name: "Aniza Hashmi", role: "CSE 3rd Year" }
  ];

  const features = [
    {
      title: "AI Architecture Design",
      description: "Generate modular software systems, components, and workflows from plain text descriptions."
    },
    {
      title: "Interactive UML Diagrams",
      description: "Explore ERD, Class, Sequence, Activity diagrams, and DFDs generated instantly via Mermaid.js."
    },
    {
      title: "SQL Schema Generator",
      description: "Instantly create database DDL schemas matching your architecture specifications."
    },
    {
      title: "SRS PDF Export",
      description: "Compile and download complete Software Requirements Specifications (SRS) with diagrams."
    }
  ];

  return (
    <div className="landing-minimal-container">
      {/* ── Navbar ── */}
      <header className="landing-minimal-header">
        <div className="landing-minimal-logo" onClick={() => onGetStarted('login')}>
          <span className="logo-brand">{brandName}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="landing-minimal-theme-toggle" onClick={onToggleTheme} title="Toggle theme" style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px' }}>
            {colorMode === 'dark' ? '☀️' : '🌙'}
          </button>
          <button className="landing-minimal-signin" onClick={() => onGetStarted('login')}>
            Sign In
          </button>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <main className="landing-minimal-hero">
        <h1 className="landing-minimal-title">
          Design software systems <span className="gradient-highlight">automatically</span>.
        </h1>
        <p className="landing-minimal-subtitle">
          ArchFlow uses AI to transform your software ideas into structured architecture designs, UML diagrams, database schemas, and complete engineering documentation.
        </p>

        <div className="landing-minimal-cta-group">
          <button className="landing-minimal-cta-btn" onClick={() => onGetStarted('register')}>
            Get Started Free
          </button>
        </div>
      </main>

      {/* ── Features Section (Minimal list) ── */}
      <section className="landing-minimal-features">
        <div className="landing-minimal-grid">
          {features.map((feature, i) => (
            <div className="minimal-feature-col" key={i}>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Team Members Section (For college project showcase) ── */}
      <section className="landing-minimal-team">
        <h2 className="team-section-title">Project Team</h2>
        <div className="landing-minimal-team-grid">
          {teamMembers.map((member, i) => (
            <div className="team-member-col" key={i}>
              <span className="member-name">{member.name}</span>
              <span className="member-role">{member.role}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-minimal-footer">
        <p>© 2026 {brandName}. Built for System Design & Engineering.</p>
      </footer>
    </div>
  );
}
