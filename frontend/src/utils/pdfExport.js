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
    const { svg } = await mermaid.render(uniqueId, code);
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
  const win = window.open('', '_blank', 'width=900,height=700');
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
  <style>${PRINT_CSS}</style>
</head>
<body>
${htmlBody}
<script>
  // Auto-trigger print once fonts + content load
  window.onload = function() {
    setTimeout(function() {
      window.print();
      // Close the window after print dialog closes (optional)
      // window.close();
    }, 600);
  };
<\/script>
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
      html += `<div style="text-align:center;margin:15px 0;">${svg}</div>`;
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
