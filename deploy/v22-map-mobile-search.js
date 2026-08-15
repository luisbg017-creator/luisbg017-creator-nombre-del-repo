(() => {
  'use strict';
  if (window.__SAFARI_MAP_V22_READY__) return;
  window.__SAFARI_MAP_V22_READY__ = true;

  let capturedMap = null;
  let searchController = null;
  let activeResults = [];

  const escapeHtmlV22 = (value) => String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[ch]));

  function captureLeafletMap() {
    if (!window.L || !L.map || window.__SAFARI_V22_LEAFLET_PATCHED__) return;
    window.__SAFARI_V22_LEAFLET_PATCHED__ = true;

    const originalMap = L.map;
    const patchedMap = function (...args) {
      const instance = originalMap.apply(this, args);
      const target = args[0];
      const id = typeof target === 'string' ? target : target?.id;
      if (id === 'legacyMap') {
        capturedMap = instance;
        window.__SAFARI_V22_ACTIVE_MAP__ = instance;
      }
      return instance;
    };

    Object.assign(patchedMap, originalMap);
    L.map = patchedMap;
  }

  function getActiveMap() {
    return window.__SAFARI_V22_ACTIVE_MAP__ || capturedMap || null;
  }

  function formatAddress(properties = {}) {
    return [
      properties.street,
      properties.housenumber,
      properties.district,
      properties.city,
      properties.county,
      properties.state,
      properties.country
    ].filter(Boolean).join(', ');
  }

  function createSearchDock() {
    const section = document.createElement('section');
    section.id = 'mapSearchDockV22';
    section.className = 'map-search-dock-v22';
    section.setAttribute('aria-label', 'Buscador de lugares');
    section.innerHTML = `
      <form id="mapSearchFormV22" class="map-search-form-v22" autocomplete="off">
        <span class="map-search-icon-v22" aria-hidden="true">⌕</span>
        <input
          id="mapSearchInputV22"
          type="search"
          maxlength="100"
          enterkeyhint="search"
          placeholder="Buscar lugar o tipo: farmacia, restaurante, colegio..."
          aria-label="Buscar lugar o tipo de lugar"
        />
        <button id="mapSearchSubmitV22" type="submit">BUSCAR</button>
      </form>
      <div class="map-search-shortcuts-v22" aria-label="Búsquedas rápidas">
        <button type="button" data-v22-query="restaurante">RESTAURANTES</button>
        <button type="button" data-v22-query="farmacia">FARMACIAS</button>
        <button type="button" data-v22-query="hospital">HOSPITALES</button>
        <button type="button" data-v22-query="supermercado">SUPERMERCADOS</button>
      </div>
      <div id="mapSearchResultsV22" class="map-search-results-v22" aria-live="polite"></div>
    `;
    return section;
  }

  function installSearchDock() {
    const modal = document.getElementById('mapModal');
    if (!modal) return false;

    const mapWindow = modal.querySelector('.map-window-v16') || modal.querySelector('.map-window');
    const header = mapWindow?.querySelector('.map-header-v16') || mapWindow?.querySelector('.map-header');
    const layout = mapWindow?.querySelector('.map-layout-v16') || mapWindow?.querySelector('.map-layout');
    if (!mapWindow || !layout) return false;

    // Remove older search implementations so there is one authoritative bar.
    modal.querySelectorAll('#mapSearchShell,.map-search-shell,.v21-search-fallback').forEach(node => {
      if (node.id !== 'mapSearchDockV22') node.remove();
    });

    let dock = mapWindow.querySelector('#mapSearchDockV22');
    if (!dock) {
      dock = createSearchDock();
      if (header?.nextSibling) mapWindow.insertBefore(dock, header.nextSibling);
      else mapWindow.insertBefore(dock, layout);
    }

    mapWindow.classList.add('map-window-v22');
    bindSearchDock(dock);
    return true;
  }

  function renderResults(container, query) {
    if (!activeResults.length) {
      container.innerHTML = '<div class="map-search-message-v22">SIN RESULTADOS</div>';
      container.classList.add('visible');
      return;
    }

    container.innerHTML = activeResults.map((feature, index) => {
      const p = feature.properties || {};
      const name = p.name || p.street || p.city || query;
      const address = formatAddress(p) || 'Resultado de OpenStreetMap';
      return `
        <article class="map-search-result-v22">
          <div class="map-search-result-copy-v22">
            <strong>${escapeHtmlV22(name)}</strong>
            <small>${escapeHtmlV22(address)}</small>
          </div>
          <div class="map-search-result-actions-v22">
            <button type="button" data-v22-action="view" data-index="${index}">VER</button>
            <button type="button" data-v22-action="save" data-index="${index}">GUARDAR PUNTO</button>
          </div>
        </article>`;
    }).join('');
    container.classList.add('visible');
  }

  async function performSearch(dock, query) {
    query = String(query || '').trim();
    if (query.length < 2) return;

    const submit = dock.querySelector('#mapSearchSubmitV22');
    const results = dock.querySelector('#mapSearchResultsV22');

    if (searchController) searchController.abort();
    searchController = new AbortController();
    submit.disabled = true;
    results.classList.add('visible');
    results.innerHTML = '<div class="map-search-message-v22">BUSCANDO…</div>';

    try {
      const params = new URLSearchParams({
        q: query,
        limit: '10',
        lang: 'es',
        lat: '-25.2867',
        lon: '-57.5759',
        location_bias_scale: '0.35'
      });
      const response = await fetch(`https://photon.komoot.io/api/?${params}`, {
        signal: searchController.signal,
        cache: 'no-store'
      });
      if (!response.ok) throw new Error(`search ${response.status}`);
      const data = await response.json();
      activeResults = Array.isArray(data.features) ? data.features : [];
      renderResults(results, query);
    } catch (error) {
      if (error.name !== 'AbortError') {
        activeResults = [];
        results.innerHTML = '<div class="map-search-message-v22">NO SE PUDO BUSCAR. INTENTÁ DE NUEVO.</div>';
        results.classList.add('visible');
      }
    } finally {
      submit.disabled = false;
    }
  }

  function featureData(index) {
    const feature = activeResults[Number(index)];
    const coords = feature?.geometry?.coordinates;
    if (!feature || !Array.isArray(coords) || coords.length < 2) return null;
    const p = feature.properties || {};
    return {
      feature,
      name: p.name || p.street || p.city || 'Lugar',
      lat: Number(coords[1]),
      lng: Number(coords[0])
    };
  }

  function viewFeature(index) {
    const data = featureData(index);
    if (!data) return;
    const map = getActiveMap();
    if (map?.setView) {
      map.setView([data.lat, data.lng], Math.max(16, Number(map.getZoom?.() || 16)));
      setTimeout(() => map.invalidateSize?.(), 80);
    }
  }

  function readSharedMapData() {
    try {
      if (typeof mapData !== 'undefined' && mapData && typeof mapData === 'object') {
        return {
          points: Array.isArray(mapData.points) ? [...mapData.points] : [],
          routes: Array.isArray(mapData.routes) ? [...mapData.routes] : []
        };
      }
    } catch (error) {}

    try {
      const local = JSON.parse(localStorage.getItem('legacyMapDataV1') || 'null') || {};
      return {
        points: Array.isArray(local.points) ? local.points : [],
        routes: Array.isArray(local.routes) ? local.routes : []
      };
    } catch (error) {
      return { points: [], routes: [] };
    }
  }

  function saveFeature(index, resultsContainer) {
    const data = featureData(index);
    if (!data) return;

    const next = readSharedMapData();
    let author = 'Staff';
    try {
      const currentId = localStorage.getItem('legacyCurrentStaffV1');
      if (typeof staffProfiles !== 'undefined') {
        author = staffProfiles.find(profile => profile.id === currentId)?.name || author;
      }
    } catch (error) {}

    next.points.push({
      id: `point-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: data.name,
      lat: data.lat,
      lng: data.lng,
      createdBy: author,
      createdAt: new Date().toISOString()
    });

    localStorage.setItem('legacyMapDataV1', JSON.stringify(next));

    try {
      if (typeof mapData !== 'undefined') mapData = next;
    } catch (error) {}

    try {
      if (typeof scheduleSharedSection === 'function') scheduleSharedSection('map');
    } catch (error) {}

    try {
      window.SafariMapV16?.refresh?.();
    } catch (error) {}

    viewFeature(index);
    resultsContainer.innerHTML = '<div class="map-search-message-v22 success">PUNTO GUARDADO · VISIBLE PARA EL STAFF</div>';
    resultsContainer.classList.add('visible');
  }

  function bindSearchDock(dock) {
    if (!dock || dock.dataset.v22Bound === '1') return;
    dock.dataset.v22Bound = '1';

    const form = dock.querySelector('#mapSearchFormV22');
    const input = dock.querySelector('#mapSearchInputV22');
    const results = dock.querySelector('#mapSearchResultsV22');

    form.addEventListener('submit', event => {
      event.preventDefault();
      performSearch(dock, input.value);
    });

    dock.querySelectorAll('[data-v22-query]').forEach(button => {
      button.addEventListener('click', () => {
        input.value = button.dataset.v22Query || '';
        performSearch(dock, input.value);
      });
    });

    results.addEventListener('click', event => {
      const button = event.target.closest('button[data-v22-action]');
      if (!button) return;
      if (button.dataset.v22Action === 'view') viewFeature(button.dataset.index);
      if (button.dataset.v22Action === 'save') saveFeature(button.dataset.index, results);
    });

    document.addEventListener('pointerdown', event => {
      if (!dock.contains(event.target)) results.classList.remove('visible');
    });
  }

  function refitOpenMap() {
    const modal = document.getElementById('mapModal');
    if (!modal?.classList.contains('open')) return;
    installSearchDock();
    const map = getActiveMap();
    [0, 80, 220].forEach(delay => setTimeout(() => map?.invalidateSize?.(), delay));
  }

  captureLeafletMap();

  window.__SAFARI_V22_INSTALL = () => {
    captureLeafletMap();
    installSearchDock();
    refitOpenMap();
  };

  document.addEventListener('click', event => {
    if (!event.target.closest('#openLegacyMap,.open-map-btn')) return;
    setTimeout(window.__SAFARI_V22_INSTALL, 0);
    setTimeout(window.__SAFARI_V22_INSTALL, 120);
    setTimeout(window.__SAFARI_V22_INSTALL, 360);
  }, true);

  const observer = new MutationObserver(() => installSearchDock());
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener('resize', refitOpenMap, { passive: true });
  window.visualViewport?.addEventListener('resize', refitOpenMap, { passive: true });
  window.addEventListener('orientationchange', () => setTimeout(refitOpenMap, 160), { passive: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.__SAFARI_V22_INSTALL, { once: true });
  } else {
    window.__SAFARI_V22_INSTALL();
  }
})();