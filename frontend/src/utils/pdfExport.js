import mermaid from 'mermaid';

// Initialize mermaid for PDF rendering with official neutral theme
mermaid.initialize({
  startOnLoad: false,
  theme: "neutral",
  securityLevel: "loose",
});

async function renderMermaidToSvg(code, id) {
  if (!code || !code.trim()) return null;
  try {
    const uniqueId = `pdf-${id}-${Math.random().toString(36).substring(2, 11)}`;
    let { svg } = await mermaid.render(uniqueId, code);
    // Strip max-width, width, and height attributes only from the outer <svg> element to let CSS scale it
    svg = svg.replace(/<svg([^>]+)>/i, (match, attrs) => {
      const cleanAttrs = attrs
        .replace(/style="[^"]*max-width:[^"]*;?"/gi, '')
        .replace(/style="[^"]*"/gi, '')
        .replace(/\bwidth="[^"]*"/gi, '')
        .replace(/\bheight="[^"]*"/gi, '');
      return `<svg ${cleanAttrs}>`;
    });
    return svg;
  } catch (err) {
    console.error(`Failed to render mermaid code for ${id}:`, err);
    return `<p style="color:#d32f2f;font-size:9pt;">⚠️ Diagram render failed: Syntax error</p>`;
  }
}


/** Shared print styles injected into every export window */
const PRINT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Inter', -apple-system, sans-serif;
    font-size: 11pt;
    line-height: 1.6;
    color: #1f2328;
    background: #fff;
    padding: 0;
  }

  /* ── Cover / Header ── */
  .pdf-cover {
    padding: 40px 48px 24px;
    border-bottom: 2px solid #0d1117;
    margin-bottom: 32px;
  }
  .pdf-brand {
    font-size: 10pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: #57606a;
    margin-bottom: 8px;
  }
  .pdf-title {
    font-size: 24pt;
    font-weight: 700;
    color: #0d1117;
    letter-spacing: -0.5px;
    margin-bottom: 6px;
  }
  .pdf-meta {
    font-size: 9pt;
    color: #57606a;
  }

  /* ── Section headings ── */
  .pdf-body { padding: 0 48px 48px; }

  h2 {
    font-size: 14pt;
    font-weight: 700;
    color: #0d1117;
    margin: 28px 0 12px;
    padding-bottom: 6px;
    border-bottom: 1px solid #d0d7de;
  }
  h3 {
    font-size: 11pt;
    font-weight: 700;
    color: #0d1117;
    margin: 16px 0 8px;
  }
  p { margin-bottom: 8px; }

  /* ── Tables ── */
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 16px;
    font-size: 10pt;
  }
  th, td {
    padding: 8px 10px;
    border: 1px solid #d0d7de;
    text-align: left;
    vertical-align: top;
  }
  th {
    background: #f6f8fa;
    font-weight: 700;
    font-size: 9pt;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    color: #57606a;
  }
  tr:nth-child(even) td { background: #f6f8fa; }

  /* ── ID badge ── */
  .req-id {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 9pt;
    font-weight: 700;
    color: #2f81f7;
    white-space: nowrap;
  }

  /* ── Lists ── */
  ul { padding-left: 20px; margin-bottom: 12px; }
  li { margin-bottom: 4px; }

  /* ── SQL / Code block ── */
  .code-block {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 9pt;
    background: #f6f8fa;
    border: 1px solid #d0d7de;
    border-radius: 4px;
    padding: 14px 16px;
    white-space: pre-wrap;
    word-break: break-all;
    line-height: 1.5;
    color: #1f2328;
    margin-bottom: 16px;
  }

  /* ── Diagram SVG ── */
  .diagram-section { margin-bottom: 28px; }
  .diagram-section svg {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 0 auto;
  }

  /* ── Page break helpers ── */
  .page-break { page-break-before: always; break-before: page; margin-top: 0; }
  .no-break { page-break-inside: avoid; break-inside: avoid; }

  /* ── Footer ── */
  @page {
    margin: 12mm 16mm;
    size: A4 portrait;
  }
  @media print {
    body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    h2 { page-break-after: avoid; }
    table { page-break-inside: auto; }
    tr { page-break-inside: avoid; }
  }
`;

/** Open a print window with the given HTML body and trigger print */
function openPrintWindow(htmlBody, title) {
  const win = window.open('', '_blank');
  if (!win) {
    alert('Pop-up blocked! Please allow pop-ups for this site and try again.');
    return;
  }
  win.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap" rel="stylesheet">
  <style>
    /* Global Styles */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: 'DM Sans', -apple-system, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      background: #FAF9F6;
      color: #1F2328;
      padding: 0;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Screen Styles */
    @media screen {
      /* Sticky Header */
      .preview-header {
        position: sticky;
        top: 0;
        left: 0;
        right: 0;
        height: 72px;
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border-bottom: 1px solid #E5E7EB;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 32px;
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
      }
      
      .preview-logo {
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 700;
        font-size: 20px;
        color: #0C1126;
        letter-spacing: -0.5px;
      }
      
      .logo-icon {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .preview-actions {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .btn-download {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: #ff5b24;
        color: #ffffff;
        font-family: inherit;
        font-weight: 600;
        font-size: 14px;
        padding: 10px 20px;
        border-radius: 6px;
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 4px 12px rgba(255, 91, 36, 0.2);
      }

      .btn-download:hover {
        background: #e04a16;
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(255, 91, 36, 0.35);
      }

      .btn-download:active {
        transform: translateY(0);
      }

      .btn-close {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: transparent;
        color: #57606a;
        font-family: inherit;
        font-weight: 600;
        font-size: 14px;
        padding: 10px 16px;
        border-radius: 6px;
        border: 1px solid #D1D5DB;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn-close:hover {
        color: #0C1126;
        border-color: #9ca3af;
        background: #f3f4f6;
      }

      /* Document Container */
      .doc-container {
        max-width: 960px;
        margin: 40px auto;
        padding: 0 24px 60px;
      }

      .doc-card {
        background: #ffffff;
        border: 1px solid #E5E7EB;
        border-radius: 12px;
        padding: 48px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
      }

      /* Document styling inside Card */
      .pdf-cover {
        border-bottom: 2px solid #ff5b24;
        padding-bottom: 24px;
        margin-bottom: 32px;
      }

      .pdf-brand {
        font-size: 10pt;
        font-weight: 700;
        text-transform: uppercase;
        color: #ff5b24;
        letter-spacing: 1.5px;
        margin-bottom: 8px;
      }

      .pdf-title {
        font-size: 26pt;
        font-weight: 700;
        color: #0C1126;
        letter-spacing: -0.5px;
        margin-bottom: 8px;
      }

      .pdf-meta {
        font-size: 10pt;
        color: #57606a;
      }

      h2 {
        font-size: 16pt;
        font-weight: 700;
        color: #0C1126;
        margin: 40px 0 16px;
        padding-bottom: 8px;
        border-bottom: 2px solid #ff5b24;
      }

      h3 {
        font-size: 12pt;
        font-weight: 700;
        color: #0C1126;
        margin: 24px 0 12px;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 24px;
        font-size: 10pt;
      }

      th, td {
        padding: 12px;
        border: 1px solid #E5E7EB;
        text-align: left;
        vertical-align: top;
      }

      th {
        background: #FAF9F6;
        color: #0C1126;
        font-weight: 700;
        font-size: 9pt;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: 2px solid #ff5b24;
      }

      tr:nth-child(even) td {
        background: #FAF9F6;
      }

      .req-id {
        font-family: monospace;
        font-weight: 700;
        color: #ff5b24;
      }

      ul {
        padding-left: 20px;
        margin-bottom: 16px;
      }

      li {
        margin-bottom: 6px;
      }

      .code-block {
        font-family: 'JetBrains Mono', monospace;
        font-size: 9.5pt;
        background: #0C1126;
        border: 1px solid #1E293B;
        border-radius: 8px;
        padding: 16px;
        white-space: pre-wrap;
        word-break: break-all;
        color: #E2E8F0;
        margin-bottom: 24px;
      }

      .diagram-section {
        margin-bottom: 32px;
      }

      /* Light card wrapper for Mermaid SVG to preserve legibility */
      .diagram-card {
        background: #ffffff;
        padding: 24px;
        border-radius: 8px;
        border: 1px solid #E5E7EB;
        margin: 16px 0;
        display: flex;
        justify-content: center;
        align-items: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.02);
      }
      
      .diagram-card svg {
        width: 100% !important;
        max-width: 100% !important;
        height: auto !important;
        display: block !important;
      }
    }

    /* Print Styles */
    @media print {
      .preview-header {
        display: none !important;
      }

      body {
        background: #ffffff !important;
        color: #1f2328 !important;
        font-family: 'Inter', -apple-system, sans-serif;
        font-size: 11pt;
        line-height: 1.6;
        padding: 0;
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }

      .doc-container {
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      .doc-card {
        background: transparent !important;
        border: none !important;
        padding: 0 !important;
        box-shadow: none !important;
      }

      .pdf-cover {
        padding: 40px 0 24px;
        border-bottom: 2px solid #0d1117;
        margin-bottom: 32px;
      }

      .pdf-brand {
        font-size: 10pt;
        font-weight: 700;
        text-transform: uppercase;
        color: #57606a;
        margin-bottom: 8px;
      }

      .pdf-title {
        font-size: 24pt;
        font-weight: 700;
        color: #0d1117;
        margin-bottom: 6px;
      }

      .pdf-meta {
        font-size: 9pt;
        color: #57606a;
      }

      h2 {
        font-size: 14pt;
        font-weight: 700;
        color: #0d1117;
        margin: 28px 0 12px;
        padding-bottom: 6px;
        border-bottom: 1px solid #d0d7de;
        page-break-after: avoid;
      }

      h3 {
        font-size: 11pt;
        font-weight: 700;
        color: #0d1117;
        margin: 16px 0 8px;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 16px;
        font-size: 10pt;
        page-break-inside: auto;
      }

      tr {
        page-break-inside: avoid;
      }

      th, td {
        padding: 8px 10px;
        border: 1px solid #d0d7de;
        text-align: left;
        vertical-align: top;
      }

      th {
        background: #f6f8fa !important;
        color: #57606a !important;
        font-size: 9pt;
        text-transform: uppercase;
      }

      tr:nth-child(even) td {
        background: #f6f8fa !important;
      }

      .req-id {
        color: #2f81f7 !important;
      }

      .code-block {
        font-family: monospace;
        font-size: 9pt;
        background: #f6f8fa !important;
        border: 1px solid #d0d7de !important;
        border-radius: 4px;
        padding: 14px 16px;
        white-space: pre-wrap;
        word-break: break-all;
        color: #1f2328 !important;
        margin-bottom: 16px;
      }

      .diagram-section {
        margin-bottom: 28px;
      }

      .diagram-card {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
        margin: 16px 0;
        display: flex;
        justify-content: center;
      }

      .diagram-card svg {
        width: 100% !important;
        max-width: 100% !important;
        height: auto !important;
        display: block !important;
      }

      .page-break {
        page-break-before: always;
        break-before: page;
        margin-top: 0;
      }

      .no-break {
        page-break-inside: avoid;
        break-inside: avoid;
      }
    }
  </style>
</head>
<body>

  <!-- Sticky Screen Header -->
  <header class="preview-header">
    <div class="preview-logo">
      <div class="logo-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="28" height="28" style="display: inline-block; vertical-align: middle;">
          <rect width="200" height="200" rx="55" fill="#FAF9F6" />
          <rect x="72" y="42" width="28" height="90" rx="14" transform="rotate(-30 86 87)" fill="#F3EFE9" />
          <rect x="98" y="32" width="28" height="110" rx="14" transform="rotate(30 112 87)" fill="#919BFC" />
          <path d="M90 92 C90 92 72 120 72 138 C72 150 80 158 92 158 C104 158 112 150 112 138 C112 120 90 92 90 92 Z" fill="#0C1126" />
        </svg>
      </div>
      <span style="margin-left: 8px;">ArchFlow</span>
      <span style="font-size: 14px; font-weight: 400; color: #57606a; margin-left: 8px;">— Design Document Preview</span>
    </div>
    <div class="preview-actions">
      <button class="btn-close" onclick="window.close()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-top: -1px;">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
        Close Preview
      </button>
      <button class="btn-download" onclick="window.print()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-top: -1px;">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        Download PDF
      </button>
    </div>
  </header>

  <!-- Document Body -->
  <div class="doc-container">
    <div class="doc-card">
      ${htmlBody}
    </div>
  </div>

</body>
</html>`);
  win.document.close();
}

function escapeHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Build the cover block HTML */
function buildCover(title, subtitle) {
  const now = new Date().toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  return `
  <div class="pdf-cover">
    <div class="pdf-brand">SE Assistant — Generated Design Document</div>
    <div class="pdf-title">${escapeHtml(title)}</div>
    <div class="pdf-meta">${escapeHtml(subtitle)} &nbsp;•&nbsp; Generated on ${now}</div>
  </div>
  <div class="pdf-body">`;
}

/** Build the SRS section as HTML */
function buildSRSHtml(srs) {
  if (!srs) return '<p><em>No SRS data available.</em></p>';

  const esc = escapeHtml;

  let html = `<h2>Software Requirements Specification</h2>`;

  // 1. Introduction
  html += `<h3>1. Introduction</h3>
    <p><strong>Purpose:</strong> ${esc(srs.purpose || '')}</p>
    <p><strong>Scope:</strong> ${esc(srs.scope || '')}</p>`;

  // 2. User Classes
  html += `<h3>2. User Classes</h3><ul>`;
  (srs.user_classes || []).forEach(u => { html += `<li>${esc(u)}</li>`; });
  html += `</ul>`;

  // 3. Functional Requirements
  html += `<h3>3. Functional Requirements</h3>
    <table><thead><tr><th>ID</th><th>Title</th><th>Description</th></tr></thead><tbody>`;
  (srs.functional_requirements || []).forEach(r => {
    html += `<tr class="no-break">
      <td class="req-id">${esc(r.id)}</td>
      <td><strong>${esc(r.title)}</strong></td>
      <td>${esc(r.description)}</td>
    </tr>`;
  });
  html += `</tbody></table>`;

  // 4. Non-Functional Requirements
  html += `<h3>4. Non-Functional Requirements</h3>
    <table><thead><tr><th>ID</th><th>Type</th><th>Description</th></tr></thead><tbody>`;
  (srs.non_functional_requirements || []).forEach(r => {
    html += `<tr class="no-break">
      <td class="req-id">${esc(r.id)}</td>
      <td>${esc(r.type)}</td>
      <td>${esc(r.description)}</td>
    </tr>`;
  });
  html += `</tbody></table>`;

  // 5. Constraints
  html += `<h3>5. Constraints</h3><ul>`;
  (srs.constraints || []).forEach(c => { html += `<li>${esc(c)}</li>`; });
  html += `</ul>`;

  return html;
}

/** Get current rendered SVG data from the DOM if available */
function getRenderedSVG(containerId) {
  // DiagramView renders into a div with ref; we query live DOM
  const svgEls = document.querySelectorAll('.dv-inner svg');
  // We can't identify which diagram is which from DOM alone,
  // so we accept an SVG element directly
  return null;
}

/**
 * Export SRS only as PDF.
 * @param {object} srs - SRS data object
 * @param {string} projectTitle - project name
 */
export function exportSRSAsPDF(srs, projectTitle) {
  const title = srs?.project_title || projectTitle || 'Untitled Project';
  let html = buildCover(title, 'Software Requirements Specification');
  html += buildSRSHtml(srs);
  html += '</div>'; // close pdf-body
  openPrintWindow(html, `SRS – ${title}`);
}

/**
 * Export all artifacts (SRS + diagrams as source code + SQL) as a single PDF.
 * Diagrams are embedded as their Mermaid source (readable) since live SVG
 * extraction requires the tabs to be active/mounted.
 *
 * If live SVG elements are passed, they are embedded directly.
 *
 * @param {object} artifacts  - { srs, erd_mermaid, class_diagram_mermaid, sequence_diagram_mermaid, sql_schema }
 * @param {string} projectTitle
 * @param {object} [svgMap]   - optional { erd: SVGElement, class: SVGElement, sequence: SVGElement }
 */
export async function exportAllAsPDF(artifacts, projectTitle) {
  const title = artifacts?.srs?.project_title || projectTitle || 'Untitled Project';
  const esc = escapeHtml;

  let html = buildCover(title, 'Full Design Document Package');

  // ── SRS ─────────────────────────────────────────────────────────
  html += buildSRSHtml(artifacts?.srs);

  // ── Diagrams ────────────────────────────────────────────────────
  html += `<h2 class="page-break">Diagrams</h2>`;

  // Render all SVGs asynchronously
  const erdSvg = await renderMermaidToSvg(artifacts?.erd_mermaid, 'erd');
  const classSvg = await renderMermaidToSvg(artifacts?.class_diagram_mermaid, 'class');
  const sequenceSvg = await renderMermaidToSvg(artifacts?.sequence_diagram_mermaid, 'sequence');
  const flowchartSvg = await renderMermaidToSvg(artifacts?.flowchart_mermaid, 'flowchart');
  const usecaseSvg = await renderMermaidToSvg(artifacts?.use_case_diagram_mermaid, 'usecase');
  const activitySvg = await renderMermaidToSvg(artifacts?.activity_diagram_mermaid, 'activity');
  const dfdSvg = await renderMermaidToSvg(artifacts?.dfd_mermaid, 'dfd');

  const diagrams = [
    { title: 'Entity Relationship Diagram', svg: erdSvg },
    { title: 'Class Diagram',               svg: classSvg },
    { title: 'Sequence Diagram',            svg: sequenceSvg },
    { title: 'System Flowchart',            svg: flowchartSvg },
    { title: 'Use Case Diagram',            svg: usecaseSvg },
    { title: 'Activity Diagram',            svg: activitySvg },
    { title: 'Data Flow Diagram (DFD)',     svg: dfdSvg },
  ];

  diagrams.forEach(({ title: diagTitle, svg }) => {
    html += `<div class="diagram-section no-break">`;
    html += `<h3>${esc(diagTitle)}</h3>`;

    if (svg) {
      html += `<div class="diagram-card">${svg}</div>`;
    } else {
      html += `<p><em>No diagram data.</em></p>`;
    }
    html += `</div>`;
  });

  // ── SQL Schema ──────────────────────────────────────────────────
  html += `<h2 class="page-break">SQL Schema</h2>`;
  if (artifacts?.sql_schema) {
    html += `<div class="code-block">${esc(artifacts.sql_schema)}</div>`;
  } else {
    html += `<p><em>No SQL schema available.</em></p>`;
  }

  html += '</div>'; // close pdf-body

  openPrintWindow(html, `Design Package – ${title}`);
}
