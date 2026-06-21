import { useEffect, useRef, useState, useCallback } from "react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: false,
  theme: "neutral",
  securityLevel: "loose",
});

/* ────────────────────────────────────────────────
   Helper: download an SVG element as PNG / JPEG / SVG
   ──────────────────────────────────────────────── */
async function downloadDiagram(svgEl, filename, format) {
  if (!svgEl) return;

  // Clone SVG and fix dimensions
  const clone = svgEl.cloneNode(true);
  const bbox = svgEl.getBoundingClientRect();
  const w = Math.max(bbox.width, 600);
  const h = Math.max(bbox.height, 400);
  clone.setAttribute("width", w);
  clone.setAttribute("height", h);
  clone.style.background = "#ffffff";

  const svgData = new XMLSerializer().serializeToString(clone);

  if (format === "svg") {
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    triggerDownload(URL.createObjectURL(blob), `${filename}.svg`);
    return;
  }

  // PNG / JPEG — rasterize via canvas
  const img = new Image();
  const scale = 2; // retina quality
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext("2d");
    ctx.scale(scale, scale);
    if (format === "jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
    }
    ctx.drawImage(img, 0, 0, w, h);
    const mimeType = format === "jpeg" ? "image/jpeg" : "image/png";
    const dataUrl = canvas.toDataURL(mimeType, 0.95);
    triggerDownload(dataUrl, `${filename}.${format === "jpeg" ? "jpg" : "png"}`);
  };
  img.onerror = () => {
    // Fallback: blob URL
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    triggerDownload(URL.createObjectURL(blob), `${filename}.svg`);
  };
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgData);
}

function triggerDownload(url, filename) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/* ────────────────────────────────────────────────
   Main DiagramView component
   ──────────────────────────────────────────────── */
function DiagramView({ code, title }) {
  const diagramRef = useRef(null);
  const wrapRef = useRef(null);
  const svgRef = useRef(null);

  const [editableCode, setEditableCode] = useState(code || "");
  const [showSource, setShowSource] = useState(false);
  const [error, setError] = useState(null);

  // Zoom state (fraction: 1 = 100%)
  const [zoom, setZoom] = useState(1);
  // Pan state
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ mx: 0, my: 0, px: 0, py: 0 });

  // Download dropdown
  const [dlOpen, setDlOpen] = useState(false);

  // Reset view when code changes
  useEffect(() => {
    setEditableCode(code || "");
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [code]);

  // Render mermaid
  useEffect(() => {
    const render = async () => {
      if (!diagramRef.current || !editableCode.trim()) return;
      try {
        setError(null);
        const id = "diag-" + Date.now();
        const { svg } = await mermaid.render(id, editableCode);
        diagramRef.current.innerHTML = svg;
        // Keep a ref to the inner SVG element for download
        svgRef.current = diagramRef.current.querySelector("svg");
        if (svgRef.current) {
          svgRef.current.style.overflow = "visible";
        }
      } catch {
        setError("Diagram syntax error. Edit the source below to fix.");
      }
    };
    render();
  }, [editableCode]);

  // ── Zoom helpers ──
  const clampZoom = (z) => Math.min(Math.max(z, 0.2), 5);

  const zoomIn  = () => setZoom((z) => clampZoom(+(z + 0.2).toFixed(1)));
  const zoomOut = () => setZoom((z) => clampZoom(+(z - 0.2).toFixed(1)));
  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  // Wheel zoom (ctrl+wheel) and scroll-pan (plain wheel)
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    if (e.ctrlKey) {
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom((z) => clampZoom(+(z + delta).toFixed(2)));
    } else {
      setPan((p) => ({
        x: p.x - (e.shiftKey ? e.deltaY : 0),
        y: p.y - (e.shiftKey ? 0 : e.deltaY),
      }));
    }
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  // ── Pan (mouse drag) ──
  const startPan = (e) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    panStart.current = { mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y };
  };
  const movePan = (e) => {
    if (!isPanning) return;
    const dx = e.clientX - panStart.current.mx;
    const dy = e.clientY - panStart.current.my;
    setPan({ x: panStart.current.px + dx, y: panStart.current.py + dy });
  };
  const endPan = () => setIsPanning(false);

  // ── Touch pinch zoom ──
  const lastDist = useRef(null);
  const handleTouchMove = (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      if (lastDist.current !== null) {
        const ratio = dist / lastDist.current;
        setZoom((z) => clampZoom(+(z * ratio).toFixed(2)));
      }
      lastDist.current = dist;
    }
  };
  const handleTouchEnd = () => { lastDist.current = null; };

  // ── Download ──
  const safeName = (title || "diagram").toLowerCase().replace(/\s+/g, "_");
  const handleDownload = (fmt) => {
    setDlOpen(false);
    downloadDiagram(svgRef.current, safeName, fmt);
  };

  return (
    <div className="dv-root">
      {/* ── Toolbar ── */}
      <div className="dv-toolbar">
        <span className="dv-title">{title}</span>

        <div className="dv-toolbar-right">
          {/* Zoom controls */}
          <div className="dv-zoom-group">
            <button className="dg-btn" onClick={zoomOut} title="Zoom out">−</button>
            <span className="dv-zoom-label" onClick={resetView} title="Click to reset">
              {Math.round(zoom * 100)}%
            </span>
            <button className="dg-btn" onClick={zoomIn} title="Zoom in">+</button>
          </div>

          {/* Source toggle */}
          <button
            className={`dg-btn ${showSource ? "dg-btn-active" : ""}`}
            onClick={() => setShowSource((s) => !s)}
            title="Toggle source code"
          >
            {showSource ? "Hide Source" : "Source"}
          </button>

          {/* Download dropdown */}
          <div className="dv-dl-wrap">
            <button
              className="dg-btn dg-btn-primary"
              onClick={() => setDlOpen((o) => !o)}
              title="Download diagram"
            >
              ↓ Download
            </button>
            {dlOpen && (
              <div className="dv-dl-menu">
                <button onClick={() => handleDownload("png")}>PNG (recommended)</button>
                <button onClick={() => handleDownload("jpeg")}>JPEG</button>
                <button onClick={() => handleDownload("svg")}>SVG (vector)</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Diagram canvas ── */}
      <div
        ref={wrapRef}
        className={`dv-canvas ${isPanning ? "dv-panning" : ""}`}
        onMouseDown={startPan}
        onMouseMove={movePan}
        onMouseUp={endPan}
        onMouseLeave={endPan}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {error ? (
          <div className="dv-error">{error}</div>
        ) : (
          <div
            className="dv-inner"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "center center",
              transition: isPanning ? "none" : "transform 0.1s ease",
            }}
          >
            <div ref={diagramRef} />
          </div>
        )}
      </div>

      {/* ── Editable source ── */}
      {showSource && (
        <div className="dv-source">
          <textarea
            className="dv-source-ta"
            value={editableCode}
            onChange={(e) => setEditableCode(e.target.value)}
            rows={10}
            spellCheck={false}
          />
        </div>
      )}
    </div>
  );
}

export default DiagramView;
