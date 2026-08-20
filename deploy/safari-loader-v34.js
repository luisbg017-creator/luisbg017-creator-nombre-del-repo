(() => {
  'use strict';
  if (window.__SAFARI_LOADER_V34_READY__) return;
  window.__SAFARI_LOADER_V34_READY__ = true;

  // Prevent the V31 compatibility stack from installing the superseded archive module.
  window.__SAFARI_ARCHIVO_V29_READY__ = true;

  function loadScript(src, id) {
    return new Promise((resolve, reject) => {
      const existing = document.getElementById(id);
      if (existing?.dataset.loaded === '1') return resolve();
      if (existing) existing.remove();
      const script = document.createElement('script');
      script.id = id;
      script.src = src;
      script.async = false;
      script.onload = () => { script.dataset.loaded = '1'; resolve(); };
      script.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
      document.body.appendChild(script);
    });
  }

  function loadCSS(href, id) {
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  function badgeV34() {
    const badge = document.getElementById('safariVersionBadge');
    if (badge) badge.textContent = 'VERSIÓN V34';
  }

  (async () => {
    loadCSS('./deploy/v33-responsive.css?v=34', 'safari-responsive-v34-css');

    try {
      await loadScript('./deploy/v32-device-auth.js?v=34', 'safari-device-auth-v34-js');
    } catch (error) {
      console.error('Safari Device Auth V34 no pudo cargarse:', error);
    }

    try {
      await loadScript('./deploy/safari-loader-v31.js?v=34', 'safari-loader-v31-v34-compat-js');
    } catch (error) {
      console.error('Safari V31 compatibility stack no pudo cargarse:', error);
    }

    try {
      await loadScript('./deploy/v33-archivo.js?v=34', 'safari-archivo-v34-js');
    } catch (error) {
      console.error('Safari Archivo V34 no pudo cargarse:', error);
    }

    try {
      await loadScript('./deploy/v34-linkify.js?v=34', 'safari-linkify-v34-js');
    } catch (error) {
      console.error('Safari Linkify V34 no pudo cargarse:', error);
    }

    badgeV34();
  })();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(badgeV34, 0), { once: true });
  } else {
    setTimeout(badgeV34, 0);
  }
})();
