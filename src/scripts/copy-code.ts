type MaybeHTMLElement = HTMLElement | null;

function getCodeText(pre: HTMLPreElement): string {
  const code = pre.querySelector('code');
  // Prefer innerText to avoid copying markup and to preserve line breaks.
  return (code?.innerText ?? pre.innerText ?? '').trimEnd();
}

async function copyTextToClipboard(text: string): Promise<void> {
  if (
    typeof navigator !== 'undefined' &&
    navigator.clipboard?.writeText &&
    window.isSecureContext
  ) {
    await navigator.clipboard.writeText(text);
    return;
  }

  // Fallback for non-secure contexts / older browsers.
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  textarea.style.top = '0';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
  }
}

function ensureCopyButton(pre: HTMLPreElement): void {
  if (pre.dataset.copyButton === 'true') return;
  if (!pre.querySelector('code')) return;

  const parent = pre.parentElement as MaybeHTMLElement;
  if (parent && parent.classList.contains('code-block')) {
    pre.dataset.copyButton = 'true';
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'code-block';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'code-copy-button';
  button.setAttribute('aria-label', 'Copy code to clipboard');
  button.textContent = 'Copy';

  let resetTimer: number | undefined;

  button.addEventListener('click', async () => {
    const text = getCodeText(pre);
    if (!text) return;

    try {
      await copyTextToClipboard(text);
      button.textContent = 'Copied';
      button.setAttribute('data-copied', 'true');
      if (resetTimer) window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        button.textContent = 'Copy';
        button.removeAttribute('data-copied');
      }, 1200);
    } catch {
      button.textContent = 'Failed';
      if (resetTimer) window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        button.textContent = 'Copy';
      }, 1200);
    }
  });

  // Insert wrapper in place of pre, then move pre into it.
  pre.parentNode?.insertBefore(wrapper, pre);
  wrapper.appendChild(pre);
  wrapper.appendChild(button);

  pre.dataset.copyButton = 'true';
}

function setupCopyButtons(root: ParentNode = document): void {
  // Restrict to rendered prose content to avoid interfering with other <pre> usage.
  const pres = root.querySelectorAll<HTMLPreElement>('.prose pre');
  pres.forEach(ensureCopyButton);
}

// Initial load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setupCopyButtons();
  });
} else {
  setupCopyButtons();
}

// Astro view transitions: re-run after navigation swaps.
document.addEventListener('astro:page-load', () => {
  setupCopyButtons();
});
document.addEventListener('astro:after-swap', () => {
  setupCopyButtons();
});
