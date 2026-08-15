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

  const loadV21Boot = () => {
    const old = document.getElementById('safari-v21-map-boot-from-v16');
    if (old) old.remove();
    const script = document.createElement('script');
    script.id = 'safari-v21-map-boot-from-v16';
    script.src = `./deploy/v21-map-boot.js?v=21&t=${Date.now()}`;
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
      await new Promise(resolve => setTimeout(resolve, 100));

      const responses = await Promise.all(parts.map(url => fetch(url, { cache: 'no-store' })));
      for (const response of responses) {
        if (!response.ok) throw new Error(`Safari map V16 part ${response.status}`);
      }

      const code = (await Promise.all(responses.map(response => response.text()))).join('');
      eval(code);

      // V21 is now the authoritative map boot. It forces V17 search/groups
      // and installs an independent search fallback if V17 cannot replace V16.
      loadV21Boot();
    } catch (error) {
      console.error('No se pudo iniciar Safari Map V16:', error);
      window.__SAFARI_MAP_V16_LOADING__ = false;
      // Even when the V16 runtime fails, still try the independent V21 boot.
      loadV21Boot();
    }
  })();
})();
