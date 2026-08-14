(() => {
  if (window.__SAFARI_MAP_V15_LOADING__) return;
  window.__SAFARI_MAP_V15_LOADING__ = true;

  const addStylesheet = (href, id) => {
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  };

  // The previous Leaflet CSS SRI was wrong. Load the official stable CSS again.
  addStylesheet('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css', 'safari-leaflet-v15-css');
  addStylesheet('./deploy/v15-map.css?v=15', 'safari-map-v15-css');

  const parts = [
    './deploy/v15-map-part-01.txt?v=15',
    './deploy/v15-map-part-02.txt?v=15',
    './deploy/v15-map-part-03.txt?v=15',
    './deploy/v15-map-part-04.txt?v=15',
    './deploy/v15-map-part-05.txt?v=15'
  ];

  (async () => {
    try {
      const responses = await Promise.all(parts.map(url => fetch(url, { cache: 'no-store' })));
      for (const response of responses) {
        if (!response.ok) throw new Error(`Safari map part ${response.status}`);
      }
      const code = (await Promise.all(responses.map(response => response.text()))).join('');
      eval(code);
      window.__SAFARI_MAP_V15_READY__ = true;
    } catch (error) {
      console.error('No se pudo iniciar Safari Map v15:', error);
      window.__SAFARI_MAP_V15_LOADING__ = false;
    }
  })();
})();
