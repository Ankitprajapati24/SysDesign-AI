// Input section component

import { useState } from "react"

function InputSection({ onGenerate, loading }) {
  const [description, setDescription] = useState("")

  const handleSubmit = () => {
    if (description.trim().length < 20) {
      alert("Please describe your project in more detail.")
      return
    }
    onGenerate(description)
  }

  return (
    <div className="input-section">
      <h2>Describe Your Project</h2>
      <textarea
        className="input-box"
        placeholder="Example: Build a library management system where members can borrow and return books, librarians can manage inventory, and admins can generate reports..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={6}
      />
      <button
        className="generate-btn"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Artifacts"}
      </button>
    </div>
  )
}

export default InputSection