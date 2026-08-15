(() => {
  if (window.__SAFARI_LOADER_V25_READY__) return;
  window.__SAFARI_LOADER_V25_READY__ = true;

  const VERSION = 'V25';
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
    if (document.getElementById(id)) return;
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

  function loadMeta() {
    if (metaPromise) return metaPromise;
    addStylesheet('./deploy/v23-meta.css?v=25', 'safari-meta-v25-css');
    metaPromise = loadScript('./deploy/v23-meta.js?v=25', 'safari-meta-v25-js')
      .catch(error => {
        console.warn('Safari V25 metadata no pudo cargarse:', error);
        metaPromise = null;
      });
    return metaPromise;
  }

  async function loadMapStack() {
    if (mapReady) return;
    if (mapPromise) return mapPromise;

    window.__SAFARI_MAP_V16_LOADING__ = true;

    mapPromise = (async () => {
      try {
        addStylesheet('./deploy/v16-map.css?v=25', 'safari-map-v16-css');
        addStylesheet('./deploy/v22-map-mobile-search.css?v=25', 'safari-map-v22-css');

        await loadScript('./deploy/v22-map-mobile-search.js?v=25', 'safari-map-v22-js');

        const parts = [
          './deploy/v16-map-part-01.txt?v=25',
          './deploy/v16-map-part-02.txt?v=25',
          './deploy/v16-map-part-03.txt?v=25',
          './deploy/v16-map-part-04.txt?v=25',
          './deploy/v16-map-part-05.txt?v=25',
          './deploy/v16-map-part-06.txt?v=25',
          './deploy/v16-map-part-07.txt?v=25'
        ];

        const responses = await Promise.all(parts.map(url => fetch(url, { cache: 'force-cache' })));
        for (const response of responses) {
          if (!response.ok) throw new Error(`Safari map part ${response.status}`);
        }

        const code = (await Promise.all(responses.map(response => response.text()))).join('');
        eval(code);

        window.__SAFARI_V22_INSTALL?.();
        setTimeout(() => window.__SAFARI_V22_INSTALL?.(), 100);

        mapReady = true;
        window.__SAFARI_MAP_V16_READY__ = true;
        window.__SAFARI_MAP_V16_LOADING__ = false;
      } catch (error) {
        console.error('No se pudo iniciar Safari Map V25:', error);
        window.__SAFARI_MAP_V16_LOADING__ = false;
        mapPromise = null;
        throw error;
      }
    })();

    return mapPromise;
  }

  function wireLazyLoading() {
    const enterBtn = document.getElementById('enterBtn');
    if (enterBtn && enterBtn.dataset.v25MetaWire !== '1') {
      enterBtn.dataset.v25MetaWire = '1';
      enterBtn.addEventListener('click', () => {
        setTimeout(loadMeta, 0);
      }, { once: true, passive: true });
    }

    document.addEventListener('click', event => {
      const mapTrigger = event.target.closest('#openLegacyMap,.open-map-btn');
      if (!mapTrigger || mapReady) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      const oldText = mapTrigger.textContent;
      mapTrigger.disabled = true;
      mapTrigger.textContent = 'CARGANDO MAPA…';

      loadMeta();
      loadMapStack()
        .then(() => {
          mapTrigger.disabled = false;
          mapTrigger.textContent = oldText;
          setTimeout(() => document.getElementById('openLegacyMap')?.click(), 0);
        })
        .catch(() => {
          mapTrigger.disabled = false;
          mapTrigger.textContent = oldText;
          alert('No se pudo cargar el mapa. Revisá tu conexión e intentá nuevamente.');
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

// V25 deployment marker: access-safe lightweight startup.
