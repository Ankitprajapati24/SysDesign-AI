/**
 * Copies text to clipboard.
 * Uses the modern async Clipboard API where available,
 * with a textarea + execCommand fallback for browsers/contexts
 * where the document is not focused (which throws NotAllowedError).
 *
 * @param {string} text  - Text to copy
 * @returns {boolean}    - true if copy succeeded, false otherwise
 */
export async function copyToClipboard(text) {
  // 1. Try modern async Clipboard API first
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to execCommand fallback
    }
  }

  // 2. Fallback: create a temporary off-screen textarea
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    // Make it out of view
    ta.style.cssText = 'position:fixed;top:-999px;left:-999px;opacity:0;';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
