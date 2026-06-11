import { useState } from "react"
import InputSection from "./components/InputSection"
import SRSView from "./components/SRSView"
import DiagramView from "./components/DiagramView"
import SQLView from "./components/SQLView"
import "./App.css"

function App() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [activeTab, setActiveTab] = useState("srs")
  const [error, setError] = useState(null)

  const handleGenerate = async (description) => {
    setLoading(true)
    setError(null)
    setData(null)

    try {
      const response = await fetch("http://127.0.0.1:8000/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setData(result.data)
        setActiveTab("srs")
      } else {
        setError(result.detail || "Something went wrong. Please try again.")
      }
    } catch (err) {
      setError("Cannot connect to backend. Make sure it is running.")
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: "srs", label: "SRS Document" },
    { id: "erd", label: "ER Diagram" },
    { id: "class", label: "Class Diagram" },
    { id: "sequence", label: "Sequence Diagram" },
    { id: "sql", label: "SQL Schema" }
  ]

  return (
    <div className="app">
      <header className="header">
        <h1>SE Assistant</h1>
        <p>Turn your project idea into complete software design artifacts</p>
      </header>

      <main className="main">
        <InputSection onGenerate={handleGenerate} loading={loading} />

        {error && <div className="error">{error}</div>}

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Generating your artifacts, please wait...</p>
          </div>
        )}

        {data && (
          <div className="results">
            <div className="tabs">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`tab ${activeTab === tab.id ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="tab-content">
              {activeTab === "srs" && <SRSView srs={data.srs} />}
              {activeTab === "erd" && (
                <DiagramView
                  code={data.erd_mermaid}
                  title="Entity Relationship Diagram"
                />
              )}
              {activeTab === "class" && (
                <DiagramView
                  code={data.class_diagram_mermaid}
                  title="Class Diagram"
                />
              )}
              {activeTab === "sequence" && (
                <DiagramView
                  code={data.sequence_diagram_mermaid}
                  title="Sequence Diagram"
                />
              )}
              {activeTab === "sql" && <SQLView sql={data.sql_schema} />}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App