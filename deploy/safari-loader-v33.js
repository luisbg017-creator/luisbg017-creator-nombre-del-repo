(() => {
  'use strict';
  if (window.__SAFARI_LOADER_V33_READY__) return;
  window.__SAFARI_LOADER_V33_READY__ = true;

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

  function badgeV33() {
    const badge = document.getElementById('safariVersionBadge');
    if (badge) badge.textContent = 'VERSIÓN V33';
  }

  (async () => {
    loadCSS('./deploy/v33-responsive.css?v=33', 'safari-responsive-v33-css');

    try {
      await loadScript('./deploy/v32-device-auth.js?v=33', 'safari-device-auth-v33-js');
    } catch (error) {
      console.error('Safari Device Auth V33 no pudo cargarse:', error);
    }

    try {
      await loadScript('./deploy/safari-loader-v31.js?v=33', 'safari-loader-v31-v33-compat-js');
    } catch (error) {
      console.error('Safari V31 compatibility stack no pudo cargarse:', error);
    }

    try {
      await loadScript('./deploy/v33-archivo.js?v=33', 'safari-archivo-v33-js');
    } catch (error) {
      console.error('Safari Archivo V33 no pudo cargarse:', error);
    }

    badgeV33();
  })();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(badgeV33, 0), { once: true });
  } else {
    setTimeout(badgeV33, 0);
  }
})();
