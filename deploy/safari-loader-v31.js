(() => {
  'use strict';
  if (window.__SAFARI_LOADER_V31_READY__) return;
  window.__SAFARI_LOADER_V31_READY__ = true;

  const VERSION = 'V31';
  let mapPromise = null;
  let mapReady = false;
  let metaPromise = null;
  let archivePromise = null;
  let comodinLocationPromise = null;
  let schedulePromise = null;

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

  function loadArchiveFix() {
    if (window.__SAFARI_ARCHIVO_V29_READY__) return Promise.resolve();
    if (archivePromise) return archivePromise;
    archivePromise = loadScript('./deploy/v29-archivo.js?v=31', 'safari-archivo-v31-js')
      .then(() => {
        if (!window.__SAFARI_ARCHIVO_V29_READY__) throw new Error('El módulo Carpeta no terminó de iniciar');
      })
      .catch((error) => {
        console.error('Safari Carpeta no pudo cargarse:', error);
        archivePromise = null;
        throw error;
      });
    return archivePromise;
  }

  function loadComodinLocation() {
    if (window.__SAFARI_COMODINES_LOCATION_V30_READY__) return Promise.resolve();
    if (comodinLocationPromise) return comodinLocationPromise;
    comodinLocationPromise = loadScript('./deploy/v30-comodines-location.js?v=31', 'safari-comodines-location-v31-js')
      .then(() => {
        if (!window.__SAFARI_COMODINES_LOCATION_V30_READY__) throw new Error('El módulo de ubicación de comodines no terminó de iniciar');
      })
      .catch((error) => {
        console.error('Safari Comodines no pudo cargarse:', error);
        comodinLocationPromise = null;
        throw error;
      });
    return comodinLocationPromise;
  }

  function loadSchedule() {
    if (window.__SAFARI_CRONOGRAMA_V31_READY__) return Promise.resolve();
    if (schedulePromise) return schedulePromise;
    schedulePromise = loadScript('./deploy/v31-cronograma.js?v=31', 'safari-cronograma-v31-js')
      .then(() => {
        if (!window.__SAFARI_CRONOGRAMA_V31_READY__) throw new Error('El cronograma editable no terminó de iniciar');
      })
      .catch((error) => {
        console.error('Safari Cronograma V31 no pudo cargarse:', error);
        schedulePromise = null;
        throw error;
      });
    return schedulePromise;
  }

  async function ensureLeaflet() {
    addStylesheet('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css', 'safari-leaflet-v31-css');
    if (window.L?.map) return;
    await loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', 'safari-leaflet-v31-js');
    if (!window.L?.map) throw new Error('Leaflet no quedó disponible');
  }

  function loadMeta() {
    if (metaPromise) return metaPromise;
    addStylesheet('./deploy/v23-meta.css?v=31', 'safari-meta-v31-css');
    metaPromise = loadScript('./deploy/v23-meta.js?v=31', 'safari-meta-v31-js')
      .then(() => installVersionBadge())
      .catch(error => {
        console.warn('Safari metadata no pudo cargarse:', error);
        metaPromise = null;
      });
    return metaPromise;
  }

  async function loadMapStack() {
    if (mapReady) return;
    if (mapPromise) return mapPromise;
    mapPromise = (async () => {
      await ensureLeaflet();
      addStylesheet('./deploy/v16-map.css?v=31', 'safari-map-v31-core-css');
      addStylesheet('./deploy/v22-map-mobile-search.css?v=31', 'safari-map-v31-search-css');
      await loadScript('./deploy/v22-map-mobile-search.js?v=31', 'safari-map-v31-search-js');
      await loadScript('./deploy/v27-map.js?v=31', 'safari-map-v31-core-js');
      if (!window.__SAFARI_MAP_V16_READY__ || !window.SafariMapV16?.open) {
        throw new Error('El mapa base no terminó de inicializar');
      }
      window.__SAFARI_V22_INSTALL?.();
      setTimeout(() => window.__SAFARI_V22_INSTALL?.(), 80);
      setTimeout(() => window.__SAFARI_V22_INSTALL?.(), 220);
      mapReady = true;
    })().catch(error => {
      console.error('No se pudo iniciar Safari Map V31:', error);
      mapPromise = null;
      throw error;
    });
    return mapPromise;
  }

  function restoreButton(html) {
    const button = document.getElementById('openLegacyMap');
    if (!button) return;
    button.disabled = false;
    button.innerHTML = html;
  }

  function loadCoreModules() {
    loadArchiveFix().catch(() => {});
    loadComodinLocation().catch(() => {});
    loadSchedule().catch(() => {});
  }

  function wireLazyLoading() {
    const enterBtn = document.getElementById('enterBtn');
    if (enterBtn && enterBtn.dataset.v31MetaWire !== '1') {
      enterBtn.dataset.v31MetaWire = '1';
      enterBtn.addEventListener('click', () => {
        setTimeout(loadMeta, 0);
        setTimeout(loadCoreModules, 0);
      }, { once: true, passive: true });
    }

    document.addEventListener('click', event => {
      const trigger = event.target.closest('#openLegacyMap,.open-map-btn');
      if (!trigger) return;
      event.preventDefault();
      event.stopImmediatePropagation();

      if (mapReady && window.SafariMapV16?.open) {
        window.SafariMapV16.open();
        window.__SAFARI_V22_INSTALL?.();
        return;
      }

      const originalHTML = trigger.innerHTML;
      trigger.disabled = true;
      trigger.textContent = 'CARGANDO MAPA…';
      loadMeta();
      loadCoreModules();
      loadMapStack()
        .then(() => {
          restoreButton(originalHTML);
          window.SafariMapV16.open();
          window.__SAFARI_V22_INSTALL?.();
        })
        .catch(error => {
          restoreButton(originalHTML);
          alert(`No se pudo cargar el mapa V31: ${error?.message || 'error desconocido'}.`);
        });
    }, true);
  }

  installVersionBadge();
  wireLazyLoading();
  loadCoreModules();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      installVersionBadge();
      wireLazyLoading();
      loadCoreModules();
    }, { once: true });
  }
})();
