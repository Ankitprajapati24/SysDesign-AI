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
