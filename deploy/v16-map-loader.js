(() => {
  if (window.__SAFARI_LOADER_V27_READY__) return;
  window.__SAFARI_LOADER_V27_READY__ = true;

  const VERSION = 'V27';
  let mapPromise = null;
  let mapReady = false;
  let metaPromise = null;

  function installVersionBadge() {
    const intro = document.getElementById('intro');
    if (!intro) return;

    let badge = document.getElementById('safariVersionBadge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'safariVersionBadge';
      intro.appendChild(badge);
    }

    badge.textContent = `VERSIÓN ${VERSION}`;
    Object.assign(badge.style, {
      position: 'absolute',
      right: 'max(22px, env(safe-area-inset-right))',
      bottom: 'max(20px, env(safe-area-inset-bottom))',
      zIndex: '8',
      color: 'rgba(255,255,255,.58)',
      fontFamily: 'Inter, sans-serif',
      fontSize: '10px',
      fontWeight: '700',
      letterSpacing: '.2em',
      pointerEvents: 'none'
    });
  }

  function addStylesheet(href, id) {
    const existing = document.getElementById(id);
    if (existing) {
      if (existing.getAttribute('href') !== href) existing.setAttribute('href', href);
      return;
    }
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  function loadScript(src, id) {
    return new Promise((resolve, reject) => {
      const existing = document.getElementById(id);
      if (existing?.dataset.loaded === '1') return resolve();
      if (existing) existing.remove();

      const script = document.createElement('script');
      script.id = id;
      script.src = src;
      script.async = false;
      script.onload = () => {
        script.dataset.loaded = '1';
        resolve();
      };
      script.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
      document.body.appendChild(script);
    });
  }

  async function ensureLeaflet() {
    addStylesheet('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css', 'safari-leaflet-v27-css');
    if (window.L?.map) return;

    await loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', 'safari-leaflet-v27-js');
    if (!window.L?.map) throw new Error('Leaflet no quedó disponible');
  }

  function loadMeta() {
    if (metaPromise) return metaPromise;
    addStylesheet('./deploy/v23-meta.css?v=27', 'safari-meta-v27-css');
    metaPromise = loadScript('./deploy/v23-meta.js?v=27', 'safari-meta-v27-js').catch(error => {
      console.warn('Safari metadata no pudo cargarse:', error);
      metaPromise = null;
    });
    return metaPromise;
  }

  async function loadMapCore() {
    addStylesheet('./deploy/v16-map.css?v=27', 'safari-map-v16-css');

    await loadScript('./deploy/v27-map.js?v=27', 'safari-map-v27-core');

    if (!window.__SAFARI_MAP_V16_READY__ || !window.SafariMapV16?.open) {
      throw new Error('El mapa validado no terminó de inicializar');
    }
  }

  async function loadSearchAndMobilePatch() {
    addStylesheet('./deploy/v22-map-mobile-search.css?v=27', 'safari-map-v22-css');
    await loadScript('./deploy/v22-map-mobile-search.js?v=27', 'safari-map-v22-js');
    window.__SAFARI_V22_INSTALL?.();
    setTimeout(() => window.__SAFARI_V22_INSTALL?.(), 100);
  }

  async function loadMapStack() {
    if (mapReady) return;
    if (mapPromise) return mapPromise;

    mapPromise = (async () => {
      try {
        await ensureLeaflet();
        await loadMapCore();
        await loadSearchAndMobilePatch();
        mapReady = true;
      } catch (error) {
        console.error('No se pudo iniciar Safari Map V27:', error);
        mapPromise = null;
        throw error;
      }
    })();

    return mapPromise;
  }

  function restoreButton(html) {
    const button = document.getElementById('openLegacyMap');
    if (!button) return;
    button.disabled = false;
    button.innerHTML = html;
  }

  function wireLazyLoading() {
    const enterBtn = document.getElementById('enterBtn');
    if (enterBtn && enterBtn.dataset.v27MetaWire !== '1') {
      enterBtn.dataset.v27MetaWire = '1';
      enterBtn.addEventListener('click', () => setTimeout(loadMeta, 0), { once: true, passive: true });
    }

    document.addEventListener('click', event => {
      const trigger = event.target.closest('#openLegacyMap,.open-map-btn');
      if (!trigger) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      if (mapReady && window.SafariMapV16?.open) {
        window.SafariMapV16.open();
        return;
      }

      const originalHTML = trigger.innerHTML;
      trigger.disabled = true;
      trigger.textContent = 'CARGANDO MAPA…';

      loadMeta();
      loadMapStack()
        .then(() => {
          restoreButton(originalHTML);
          window.SafariMapV16.open();
        })
        .catch(error => {
          restoreButton(originalHTML);
          alert(`No se pudo cargar el mapa: ${error?.message || 'error desconocido'}.`);
        });
    }, true);
  }

  installVersionBadge();
  wireLazyLoading();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      installVersionBadge();
      wireLazyLoading();
    }, { once: true });
  }
})();
