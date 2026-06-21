// SRS View component

function SRSView({ srs }) {
  return (
    <div className="srs-view">
      <h2>{srs.project_title}</h2>

      <section>
        <h3>1. Introduction</h3>
        <p><strong>Purpose:</strong> {srs.purpose}</p>
        <p><strong>Scope:</strong> {srs.scope}</p>
      </section>

      <section>
        <h3>2. User Classes</h3>
        <ul>
          {srs.user_classes.map((u, i) => (
            <li key={i}>{u}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3>3. Functional Requirements</h3>
        <table className="req-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {srs.functional_requirements.map((req) => (
              <tr key={req.id}>
                <td>{req.id}</td>
                <td>{req.title}</td>
                <td>{req.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h3>4. Non-Functional Requirements</h3>
        <table className="req-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {srs.non_functional_requirements.map((req) => (
              <tr key={req.id}>
                <td>{req.id}</td>
                <td>{req.type}</td>
                <td>{req.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h3>5. Constraints</h3>
        <ul>
          {srs.constraints.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export default SRSView