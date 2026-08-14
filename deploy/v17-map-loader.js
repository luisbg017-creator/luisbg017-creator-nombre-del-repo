(() => {
  if (window.__SAFARI_MAP_V17_LOADING__ || window.__SAFARI_MAP_V17_READY__) return;
  window.__SAFARI_MAP_V17_LOADING__ = true;

  const addStylesheet = (href, id) => {
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  };

  addStylesheet('./deploy/v17-map.css?v=17', 'safari-map-v17-css');

  const parts = [
    './deploy/v17-map-part-01.txt?v=17',
    './deploy/v17-map-part-02.txt?v=17',
    './deploy/v17-map-part-03.txt?v=17',
    './deploy/v17-map-part-04.txt?v=17',
    './deploy/v17-map-part-05.txt?v=17',
    './deploy/v17-map-part-06.txt?v=17',
    './deploy/v17-map-part-07.txt?v=17',
    './deploy/v17-map-part-08.txt?v=17'
  ];

  const waitForV16 = async () => {
    const deadline = Date.now() + 7000;
    while (!window.__SAFARI_MAP_V16_READY__ && Date.now() < deadline) {
      await new Promise(resolve => setTimeout(resolve, 80));
    }
  };

  (async () => {
    try {
      await waitForV16();

      const responses = await Promise.all(parts.map(url => fetch(url, { cache: 'no-store' })));
      for (const response of responses) {
        if (!response.ok) throw new Error(`Safari map V17 part ${response.status}`);
      }

      const code = (await Promise.all(responses.map(response => response.text()))).join('');
      eval(code);
    } catch (error) {
      console.error('No se pudo iniciar Safari Map V17:', error);
      window.__SAFARI_MAP_V17_LOADING__ = false;
    }
  })();
})();