import { useEffect, useRef, useState } from "react"
import mermaid from "mermaid"

mermaid.initialize({
  startOnLoad: false,
  theme: "default",
  securityLevel: "loose"
})

function DiagramView({ code, title }) {
  const diagramRef = useRef(null)
  const [editableCode, setEditableCode] = useState(code)
  const [error, setError] = useState(null)

  useEffect(() => {
    setEditableCode(code)
  }, [code])

  useEffect(() => {
    const renderDiagram = async () => {
      if (!diagramRef.current) return
      try {
        setError(null)
        const id = "diagram-" + Date.now()
        const { svg } = await mermaid.render(id, editableCode)
        diagramRef.current.innerHTML = svg
      } catch (err) {
        setError("Diagram syntax error. Try editing the code below.")
      }
    }
    renderDiagram()
  }, [editableCode])

  return (
    <div className="diagram-view">
      <h2>{title}</h2>

      {error && <div className="error">{error}</div>}

      <div className="diagram-container" ref={diagramRef}></div>

      <div className="code-editor">
        <h4>Edit Diagram Code</h4>
        <textarea
          value={editableCode}
          onChange={(e) => setEditableCode(e.target.value)}
          rows={12}
          className="code-box"
        />
      </div>
    </div>
  )
}

export default DiagramView