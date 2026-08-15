(() => {
  'use strict';
  if (window.__SAFARI_LOADER_V32_READY__) return;
  window.__SAFARI_LOADER_V32_READY__ = true;

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

  function badgeV32() {
    const badge = document.getElementById('safariVersionBadge');
    if (badge) badge.textContent = 'VERSIÓN V32';
  }

  (async () => {
    try {
      await loadScript('./deploy/v32-device-auth.js?v=32', 'safari-device-auth-v32-js');
    } catch (error) {
      console.error('Safari Device Auth V32 no pudo cargarse:', error);
    }

    try {
      await loadScript('./deploy/safari-loader-v31.js?v=32', 'safari-loader-v31-compat-js');
    } catch (error) {
      console.error('Safari V31 compatibility stack no pudo cargarse:', error);
    }

    badgeV32();
  })();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(badgeV32, 0), { once: true });
  } else {
    setTimeout(badgeV32, 0);
  }
})();
