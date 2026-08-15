(() => {
  if (window.__SAFARI_LOADER_V26_READY__) return;
  window.__SAFARI_LOADER_V26_READY__ = true;

  const VERSION = 'V26';
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
    addStylesheet(
      'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
      'safari-leaflet-v26-css'
    );

    if (window.L?.map) return;

    await loadScript(
      'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
      'safari-leaflet-v26-js'
    );

    if (!window.L?.map) throw new Error('Leaflet no quedó disponible');
  }

  function loadMeta() {
    if (metaPromise) return metaPromise;
    addStylesheet('./deploy/v23-meta.css?v=26', 'safari-meta-v25-css');
    metaPromise = loadScript('./deploy/v23-meta.js?v=26', 'safari-meta-v25-js')
      .catch(error => {
        console.warn('Safari metadata no pudo cargarse:', error);
        metaPromise = null;
      });
    return metaPromise;
  }

  async function loadMapCore() {
    addStylesheet('./deploy/v16-map.css?v=26', 'safari-map-v16-css');

    const parts = [
      './deploy/v16-map-part-01.txt?v=26',
      './deploy/v16-map-part-02.txt?v=26',
      './deploy/v16-map-part-03.txt?v=26',
      './deploy/v16-map-part-04.txt?v=26',
      './deploy/v16-map-part-05.txt?v=26',
      './deploy/v16-map-part-06.txt?v=26',
      './deploy/v16-map-part-07.txt?v=26'
    ];

    const responses = await Promise.all(
      parts.map(url => fetch(url, { cache: 'no-store' }))
    );

    for (let i = 0; i < responses.length; i += 1) {
      if (!responses[i].ok) {
        throw new Error(`No se pudo cargar el fragmento ${i + 1} (${responses[i].status})`);
      }
    }

    const code = (await Promise.all(responses.map(response => response.text()))).join('');
    if (!code.trim()) throw new Error('El código del mapa llegó vacío');

    eval(code);

    if (!window.__SAFARI_MAP_V16_READY__ || !window.SafariMapV16?.open) {
      throw new Error('El mapa base no terminó de inicializar');
    }
  }

  async function loadSearchAndMobilePatch() {
    addStylesheet('./deploy/v22-map-mobile-search.css?v=26', 'safari-map-v22-css');

    await loadScript(
      './deploy/v22-map-mobile-search.js?v=26',
      'safari-map-v22-js'
    );

    window.__SAFARI_V22_INSTALL?.();
    setTimeout(() => window.__SAFARI_V22_INSTALL?.(), 80);
    setTimeout(() => window.__SAFARI_V22_INSTALL?.(), 240);
  }

  async function loadMapStack() {
    if (mapReady) return;
    if (mapPromise) return mapPromise;

    mapPromise = (async () => {
      window.__SAFARI_MAP_V16_LOADING__ = true;

      try {
        await ensureLeaflet();
        await loadMapCore();
        await loadSearchAndMobilePatch();

        mapReady = true;
        window.__SAFARI_MAP_V16_LOADING__ = false;
      } catch (error) {
        console.error('No se pudo iniciar Safari Map V26:', error);
        window.__SAFARI_MAP_V16_LOADING__ = false;
        mapPromise = null;
        throw error;
      }
    })();

    return mapPromise;
  }

  function restoreMapButton(originalHTML) {
    const liveButton = document.getElementById('openLegacyMap');
    if (!liveButton) return;
    liveButton.disabled = false;
    liveButton.innerHTML = originalHTML;
  }

  function wireLazyLoading() {
    const enterBtn = document.getElementById('enterBtn');
    if (enterBtn && enterBtn.dataset.v26MetaWire !== '1') {
      enterBtn.dataset.v26MetaWire = '1';
      enterBtn.addEventListener('click', () => {
        setTimeout(loadMeta, 0);
      }, { once: true, passive: true });
    }

    document.addEventListener('click', event => {
      const mapTrigger = event.target.closest('#openLegacyMap,.open-map-btn');
      if (!mapTrigger) return;

      if (mapReady && window.SafariMapV16?.open) {
        event.preventDefault();
        event.stopImmediatePropagation();
        window.SafariMapV16.open();
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();

      const originalHTML = mapTrigger.innerHTML;
      mapTrigger.disabled = true;
      mapTrigger.textContent = 'CARGANDO MAPA…';

      loadMeta();

      loadMapStack()
        .then(() => {
          restoreMapButton(originalHTML);
          window.SafariMapV16.open();
        })
        .catch(error => {
          restoreMapButton(originalHTML);
          console.error(error);
          alert(`No se pudo cargar el mapa: ${error?.message || 'error desconocido'}. Intentá nuevamente.`);
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

// V26 deployment marker: Leaflet -> core map -> search/mobile patch -> open.
