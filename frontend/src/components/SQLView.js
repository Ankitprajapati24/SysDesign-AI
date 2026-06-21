<<<<<<< HEAD
import { useState } from 'react';
import { copyToClipboard } from '../utils/clipboard';

function SQLView({ sql }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard(sql);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="sql-wrap">
      <div className="sql-toolbar">
        <span>SQL Schema</span>
        <button className="dg-btn" onClick={handleCopy}>
          {copied ? '✓ Copied' : 'Copy SQL'}
        </button>
      </div>
      <pre className="sql-pre">{sql}</pre>
    </div>
  );
}

export default SQLView;
=======
// SQL View component


function SQLView({ sql }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(sql)
    alert("SQL copied to clipboard!")
  }

  return (
    <div className="sql-view">
      <div className="sql-header">
        <h2>SQL Schema</h2>
        <button className="copy-btn" onClick={handleCopy}>
          Copy SQL
        </button>
      </div>
      <pre className="sql-code">{sql}</pre>
    </div>
  )
}

export default SQLView
>>>>>>> origin/feat/admin
