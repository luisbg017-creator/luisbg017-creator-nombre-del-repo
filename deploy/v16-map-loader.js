(() => {
  if (window.__SAFARI_MAP_V16_LOADING__ || window.__SAFARI_MAP_V16_READY__) return;
  window.__SAFARI_MAP_V16_LOADING__ = true;

  const addStylesheet = (href, id) => {
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  };

  const loadV17 = () => {
    if (window.__SAFARI_MAP_V17_LOADING__ || window.__SAFARI_MAP_V17_READY__) return;
    const script = document.createElement('script');
    script.src = './deploy/v17-map-loader.js?v=17';
    script.async = true;
    document.body.appendChild(script);
  };

  addStylesheet('./deploy/v16-map.css?v=16', 'safari-map-v16-css');

  const parts = [
    './deploy/v16-map-part-01.txt?v=16',
    './deploy/v16-map-part-02.txt?v=16',
    './deploy/v16-map-part-03.txt?v=16',
    './deploy/v16-map-part-04.txt?v=16',
    './deploy/v16-map-part-05.txt?v=16',
    './deploy/v16-map-part-06.txt?v=16',
    './deploy/v16-map-part-07.txt?v=16'
  ];

  (async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 120));

      const responses = await Promise.all(parts.map(url => fetch(url, { cache: 'no-store' })));
      for (const response of responses) {
        if (!response.ok) throw new Error(`Safari map V16 part ${response.status}`);
      }

      const code = (await Promise.all(responses.map(response => response.text()))).join('');
      eval(code);
      loadV17();
    } catch (error) {
      console.error('No se pudo iniciar Safari Map V16:', error);
      window.__SAFARI_MAP_V16_LOADING__ = false;
    }
  })();
})();