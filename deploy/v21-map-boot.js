(() => {
  if (window.__SAFARI_MAP_V21_BOOT__) return;
  window.__SAFARI_MAP_V21_BOOT__ = true;

  const addCss = (href, id) => {
    const old = document.getElementById(id);
    if (old) old.remove();
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  };

  addCss('./deploy/v17-map.css?v=21', 'safari-map-v17-css-force');
  addCss('./deploy/v20-layout.css?v=21', 'safari-layout-v20-css-force');

  const loadFreshV17 = () => {
    if (window.__SAFARI_MAP_V17_READY__) return;
    window.__SAFARI_MAP_V17_LOADING__ = false;
    const old = document.getElementById('safari-map-v17-force');
    if (old) old.remove();
    const script = document.createElement('script');
    script.id = 'safari-map-v17-force';
    script.src = './deploy/v17-map-loader.js?v=21';
    script.async = true;
    document.body.appendChild(script);
  };

  const loadLayout = () => {
    if (window.__SAFARI_LAYOUT_V20_READY__) return;
    const old = document.getElementById('safari-layout-v20-force');
    if (old) old.remove();
    const script = document.createElement('script');
    script.id = 'safari-layout-v20-force';
    script.src = './deploy/v20-layout.js?v=21';
    script.defer = true;
    document.body.appendChild(script);
  };

  const escapeText = value => String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[ch]));

  function installSearchFallback() {
    const modal = document.getElementById('mapModal');
    if (!modal || modal.querySelector('#mapSearchShell')) return;

    const canvasWrap = modal.querySelector('.map-canvas-wrap') || modal.querySelector('.map-layout') || modal.querySelector('.map-window');
    if (!canvasWrap) return;

    if (getComputedStyle(canvasWrap).position === 'static') canvasWrap.style.position = 'relative';

    const shell = document.createElement('section');
    shell.id = 'mapSearchShell';
    shell.className = 'map-search-shell v21-search-fallback';
    shell.setAttribute('aria-label', 'Buscar lugares');
    shell.innerHTML = `
      <form id="mapSearchForm" class="map-search-form" autocomplete="off">
        <span class="map-search-icon" aria-hidden="true">⌕</span>
        <input id="mapSearchInput" type="search" maxlength="100" placeholder="Buscar lugar o tipo: farmacia, restaurante, colegio..." aria-label="Buscar lugar o tipo de lugar">
        <button id="mapSearchButton" type="submit">BUSCAR</button>
      </form>
      <div class="map-search-types">
        <button type="button" data-v21-query="restaurante">RESTAURANTES</button>
        <button type="button" data-v21-query="farmacia">FARMACIAS</button>
        <button type="button" data-v21-query="hospital">HOSPITALES</button>
        <button type="button" data-v21-query="supermercado">SUPERMERCADOS</button>
      </div>
      <div class="map-search-results" id="mapSearchResults" aria-live="polite"></div>`;

    canvasWrap.appendChild(shell);

    if (!document.getElementById('safari-v21-fallback-style')) {
      const style = document.createElement('style');
      style.id = 'safari-v21-fallback-style';
      style.textContent = `
        #mapModal .v21-search-fallback{display:grid!important;visibility:visible!important;opacity:1!important;position:absolute!important;left:14px!important;top:14px!important;width:min(520px,calc(100% - 28px))!important;z-index:2000!important;gap:6px!important;pointer-events:none!important}
        #mapModal .v21-search-fallback .map-search-form,#mapModal .v21-search-fallback .map-search-types,#mapModal .v21-search-fallback .map-search-results{pointer-events:auto!important}
        #mapModal .v21-search-fallback .map-search-form{display:grid!important;grid-template-columns:auto minmax(0,1fr) auto!important;align-items:center!important;gap:7px!important;background:rgba(255,255,255,.98)!important;border:1px solid #111!important;padding:6px 6px 6px 11px!important;box-shadow:0 8px 24px rgba(0,0,0,.18)!important}
        #mapModal .v21-search-fallback input{height:36px!important;border:0!important;outline:0!important;background:transparent!important;font-size:14px!important;min-width:0!important}
        #mapModal .v21-search-fallback #mapSearchButton{height:36px!important;border:1px solid #111!important;background:#111!important;color:#fff!important;padding:0 12px!important;font-weight:800!important;font-size:10px!important}
        #mapModal .v21-search-fallback .map-search-types{display:flex!important;gap:5px!important;flex-wrap:wrap!important}
        #mapModal .v21-search-fallback .map-search-types button{min-height:30px!important;background:rgba(255,255,255,.96)!important;border:1px solid #111!important;padding:0 8px!important;font-size:9px!important;font-weight:800!important}
        #mapModal .v21-search-fallback .map-search-results{display:none;background:#fff!important;border:1px solid #111!important;max-height:330px!important;overflow:auto!important;box-shadow:0 12px 30px rgba(0,0,0,.2)!important}
        #mapModal .v21-search-fallback .map-search-results.visible{display:block!important}
        #mapModal .v21-search-result{padding:10px!important;border-bottom:1px solid #ddd!important;display:grid!important;gap:6px!important}
        #mapModal .v21-search-result strong{font-size:13px!important}
        #mapModal .v21-search-result small{font-size:10px!important;color:#666!important;line-height:1.35!important}
        #mapModal .v21-search-result-actions{display:flex!important;gap:6px!important;flex-wrap:wrap!important}
        #mapModal .v21-search-result-actions button{min-height:32px!important;border:1px solid #111!important;background:#fff!important;padding:0 9px!important;font-size:9px!important;font-weight:800!important}
        #mapModal .v21-search-result-actions button[data-action="save"]{background:#111!important;color:#fff!important}
        @media(max-width:820px){#mapModal .v21-search-fallback{left:8px!important;right:8px!important;top:max(8px,env(safe-area-inset-top))!important;width:auto!important}#mapModal .v21-search-fallback .map-search-types{overflow-x:auto!important;flex-wrap:nowrap!important}#mapModal .v21-search-fallback .map-search-types button{flex:0 0 auto!important}#mapModal .v21-search-fallback input{font-size:16px!important}}
      `;
      document.head.appendChild(style);
    }

    const form = shell.querySelector('#mapSearchForm');
    const input = shell.querySelector('#mapSearchInput');
    const button = shell.querySelector('#mapSearchButton');
    const results = shell.querySelector('#mapSearchResults');
    let active = [];
    let controller = null;

    const address = props => [props.street, props.housenumber, props.district, props.city, props.state, props.country].filter(Boolean).join(', ');

    async function search(query) {
      query = String(query || '').trim();
      if (query.length < 2) return;
      if (controller) controller.abort();
      controller = new AbortController();
      button.disabled = true;
      results.classList.add('visible');
      results.innerHTML = '<div style="padding:12px;font-size:11px">BUSCANDO…</div>';
      try {
        const params = new URLSearchParams({q:query,limit:'8',lang:'es',lat:'-25.2867',lon:'-57.5759',location_bias_scale:'0.2'});
        const response = await fetch(`https://photon.komoot.io/api/?${params}`, {signal:controller.signal,cache:'default'});
        if (!response.ok) throw new Error('search');
        const data = await response.json();
        active = Array.isArray(data.features) ? data.features : [];
        if (!active.length) {
          results.innerHTML = '<div style="padding:12px;font-size:11px">SIN RESULTADOS</div>';
          return;
        }
        results.innerHTML = active.map((feature,index) => {
          const p = feature.properties || {};
          const name = p.name || p.street || p.city || query;
          return `<article class="v21-search-result"><div><strong>${escapeText(name)}</strong><br><small>${escapeText(address(p) || p.country || 'Resultado de OpenStreetMap')}</small></div><div class="v21-search-result-actions"><button type="button" data-action="save" data-index="${index}">GUARDAR PUNTO</button></div></article>`;
        }).join('');
      } catch (error) {
        if (error.name !== 'AbortError') results.innerHTML = '<div style="padding:12px;font-size:11px">NO SE PUDO BUSCAR. INTENTÁ DE NUEVO.</div>';
      } finally {
        button.disabled = false;
      }
    }

    form.addEventListener('submit', event => {event.preventDefault();search(input.value)});
    shell.querySelectorAll('[data-v21-query]').forEach(btn => btn.addEventListener('click', () => {input.value=btn.dataset.v21Query;search(input.value)}));
    results.addEventListener('click', event => {
      const btn = event.target.closest('button[data-action="save"]');
      if (!btn) return;
      const feature = active[Number(btn.dataset.index)];
      const coords = feature?.geometry?.coordinates;
      if (!Array.isArray(coords) || coords.length < 2) return;
      const p = feature.properties || {};
      const name = p.name || p.street || p.city || 'Lugar';
      try {
        if (typeof mapData === 'undefined') throw new Error('mapData');
        if (!Array.isArray(mapData.points)) mapData.points = [];
        mapData.points.push({id:`point-${Date.now()}-${Math.random().toString(16).slice(2)}`,name,lat:Number(coords[1]),lng:Number(coords[0]),createdBy:(typeof getCurrentStaffDisplayName==='function'?getCurrentStaffDisplayName():'Staff'),createdAt:new Date().toISOString()});
        localStorage.setItem('legacyMapDataV1', JSON.stringify(mapData));
        if (typeof scheduleSharedSection === 'function') scheduleSharedSection('map');
        if (typeof renderLegacyMap === 'function') renderLegacyMap();
        results.innerHTML = '<div style="padding:12px;font-size:11px;font-weight:800">PUNTO GUARDADO</div>';
      } catch (error) {
        console.error('No se pudo guardar resultado:', error);
      }
    });
  }

  const start = () => {
    loadLayout();
    loadFreshV17();
    setTimeout(() => {
      if (!document.querySelector('#mapModal #mapSearchShell')) installSearchFallback();
    }, 3200);
    setTimeout(() => {
      if (!document.querySelector('#mapModal #mapSearchShell')) installSearchFallback();
    }, 6500);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true});
  else start();

  window.addEventListener('safari-map-v17-failed', () => setTimeout(installSearchFallback, 100));
})();
