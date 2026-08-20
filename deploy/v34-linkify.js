(() => {
  'use strict';
  if (window.__SAFARI_LINKIFY_V34_READY__) return;
  window.__SAFARI_LINKIFY_V34_READY__ = true;

  const SKIP_SELECTOR = 'a,script,style,textarea,input,button,select,option,code,pre,[contenteditable="true"]';
  const URL_RE = /(?:https?:\/\/[^\s<>"']+|www\.[^\s<>"']+|(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:com|org|net|io|app|me|co|tv|gg|py|edu|gov|info|xyz|site|online|link)(?:\/[^\s<>"']*)?)/gi;

  function splitTrailingPunctuation(raw) {
    let url = raw;
    let trailing = '';

    while (/[.,;:!?]$/.test(url)) {
      trailing = url.slice(-1) + trailing;
      url = url.slice(0, -1);
    }

    const pairs = [['(', ')'], ['[', ']'], ['{', '}']];
    for (const [open, close] of pairs) {
      while (url.endsWith(close)) {
        const opens = (url.match(new RegExp('\\' + open, 'g')) || []).length;
        const closes = (url.match(new RegExp('\\' + close, 'g')) || []).length;
        if (closes <= opens) break;
        trailing = close + trailing;
        url = url.slice(0, -1);
      }
    }

    return { url, trailing };
  }

  function normalizeHref(raw) {
    const value = raw.trim();
    const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    try {
      const parsed = new URL(candidate);
      if (!['http:', 'https:'].includes(parsed.protocol)) return null;
      return parsed.href;
    } catch (error) {
      return null;
    }
  }

  function makeAnchor(label, href) {
    const a = document.createElement('a');
    a.className = 'safari-auto-link-v34';
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = label;
    a.title = 'Abrir enlace';
    return a;
  }

  function shouldSkipTextNode(node) {
    const parent = node.parentElement;
    if (!parent) return true;
    return Boolean(parent.closest(SKIP_SELECTOR));
  }

  function linkifyTextNode(node) {
    if (!node?.nodeValue || shouldSkipTextNode(node)) return;
    const text = node.nodeValue;
    URL_RE.lastIndex = 0;
    if (!URL_RE.test(text)) return;
    URL_RE.lastIndex = 0;

    const frag = document.createDocumentFragment();
    let last = 0;
    let match;
    let changed = false;

    while ((match = URL_RE.exec(text))) {
      const start = match.index;
      const raw = match[0];
      const { url, trailing } = splitTrailingPunctuation(raw);
      const href = normalizeHref(url);
      if (!href || !url) continue;

      if (start > last) frag.appendChild(document.createTextNode(text.slice(last, start)));
      frag.appendChild(makeAnchor(url, href));
      if (trailing) frag.appendChild(document.createTextNode(trailing));
      last = start + raw.length;
      changed = true;
    }

    if (!changed) return;
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    node.replaceWith(frag);
  }

  function enhanceExistingAnchors(root = document) {
    const anchors = root.querySelectorAll ? root.querySelectorAll('a[href]') : [];
    anchors.forEach((a) => {
      try {
        const url = new URL(a.href, location.href);
        if (!['http:', 'https:'].includes(url.protocol)) return;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.classList.add('safari-clickable-link-v34');
      } catch (error) {}
    });
  }

  function processRoot(root) {
    if (!root) return;

    if (root.nodeType === Node.TEXT_NODE) {
      linkifyTextNode(root);
      return;
    }

    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE && root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) return;
    if (root.nodeType === Node.ELEMENT_NODE && root.matches?.(SKIP_SELECTOR)) return;

    enhanceExistingAnchors(root);

    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (!node.nodeValue?.trim()) return NodeFilter.FILTER_REJECT;
          if (shouldSkipTextNode(node)) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(linkifyTextNode);
  }

  function installStyles() {
    if (document.getElementById('safari-linkify-v34-css')) return;
    const style = document.createElement('style');
    style.id = 'safari-linkify-v34-css';
    style.textContent = `
      .safari-auto-link-v34,
      .safari-clickable-link-v34 {
        color: inherit;
        text-decoration: underline;
        text-decoration-thickness: 1px;
        text-underline-offset: 3px;
        overflow-wrap: anywhere;
        word-break: break-word;
        cursor: pointer;
      }
      .safari-auto-link-v34:hover,
      .safari-clickable-link-v34:hover {
        opacity: .72;
      }
      .archivo-item .safari-auto-link-v34,
      .comodin-item .safari-auto-link-v34,
      .schedule-event .safari-auto-link-v34,
      .folder-window .safari-auto-link-v34,
      .schedule-window .safari-auto-link-v34 {
        max-width: 100%;
      }
    `;
    document.head.appendChild(style);
  }

  function install() {
    installStyles();
    processRoot(document.body);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach(processRoot);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    window.__SAFARI_LINKIFY_V34_OBSERVER__ = observer;
    console.info('Safari Linkify V34 activo');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
