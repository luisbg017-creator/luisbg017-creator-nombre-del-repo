(() => {
  'use strict';
  if (window.__SAFARI_LOADER_V35_READY__) return;
  window.__SAFARI_LOADER_V35_READY__ = true;

  // Keep the stable V34/V33 stack and only add the V35 move-item feature.
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

  function badgeV35() {
    const badge = document.getElementById('safariVersionBadge');
    if (badge) badge.textContent = 'VERSIÓN V35';
  }

  (async () => {
    // Preserve the responsive containment that is already working well.
    loadCSS('./deploy/v33-responsive.css?v=35', 'safari-responsive-v35-css');
    loadCSS('./deploy/v35-move-item.css?v=35', 'safari-move-item-v35-css');

    try {
      await loadScript('./deploy/v32-device-auth.js?v=35', 'safari-device-auth-v35-js');
    } catch (error) {
      console.error('Safari Device Auth V35 no pudo cargarse:', error);
    }

    try {
      await loadScript('./deploy/safari-loader-v31.js?v=35', 'safari-loader-v31-v35-compat-js');
    } catch (error) {
      console.error('Safari V31 compatibility stack no pudo cargarse:', error);
    }

    try {
      await loadScript('./deploy/v33-archivo.js?v=35', 'safari-archivo-v35-js');
    } catch (error) {
      console.error('Safari Archivo V35 no pudo cargarse:', error);
    }

    try {
      await loadScript('./deploy/v34-linkify.js?v=35', 'safari-linkify-v35-js');
    } catch (error) {
      console.error('Safari Linkify V35 no pudo cargarse:', error);
    }

    try {
      await loadScript('./deploy/v35-move-item.js?v=35', 'safari-move-item-v35-js');
    } catch (error) {
      console.error('Safari Move Item V35 no pudo cargarse:', error);
    }

    badgeV35();
  })();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(badgeV35, 0), { once: true });
  } else {
    setTimeout(badgeV35, 0);
  }
})();
