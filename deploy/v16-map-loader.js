(() => {
  if (window.__SAFARI_MAP_V16_LOADING__ || window.__SAFARI_MAP_V16_READY__) return;
  window.__SAFARI_MAP_V16_LOADING__ = true;

  const addStylesheet = (href, id) => {
    const old = document.getElementById(id);
    if (old) old.remove();
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  };

  const loadScript = (src, id) => new Promise((resolve, reject) => {
    const old = document.getElementById(id);
    if (old) old.remove();
    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
    document.body.appendChild(script);
  });

  addStylesheet('./deploy/v16-map.css?v=16', 'safari-map-v16-css');
  addStylesheet('./deploy/v22-map-mobile-search.css?v=22', 'safari-map-v22-css');

  const parts = [
    './deploy/v16-map-part-01.txt?v=22',
    './deploy/v16-map-part-02.txt?v=22',
    './deploy/v16-map-part-03.txt?v=22',
    './deploy/v16-map-part-04.txt?v=22',
    './deploy/v16-map-part-05.txt?v=22',
    './deploy/v16-map-part-06.txt?v=22',
    './deploy/v16-map-part-07.txt?v=22'
  ];

  (async () => {
    try {
      // V22 patches Leaflet before V16 creates the map, so search results can
      // focus the live map reliably. It also observes the V16 modal replacement.
      await loadScript('./deploy/v22-map-mobile-search.js?v=22', 'safari-map-v22-js');
      await new Promise(resolve => setTimeout(resolve, 40));

      const responses = await Promise.all(parts.map(url => fetch(url, { cache: 'no-store' })));
      for (const response of responses) {
        if (!response.ok) throw new Error(`Safari map V16 part ${response.status}`);
      }

      const code = (await Promise.all(responses.map(response => response.text()))).join('');
      eval(code);

      // One authoritative map stack: V16 runtime + V22 search/mobile layer.
      // Do not load V17/V21 here; those partial replacements caused the search
      // bar to disappear in some browsers.
      window.__SAFARI_V22_INSTALL?.();
      setTimeout(() => window.__SAFARI_V22_INSTALL?.(), 80);
      setTimeout(() => window.__SAFARI_V22_INSTALL?.(), 300);
    } catch (error) {
      console.error('No se pudo iniciar Safari Map V16/V22:', error);
      window.__SAFARI_MAP_V16_LOADING__ = false;
      try { window.__SAFARI_V22_INSTALL?.(); } catch (installError) {}
    }
  })();
})();