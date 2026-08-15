(() => {
  if (window.__SAFARI_MAP_V17_READY__) return;
  if (window.__SAFARI_MAP_V17_LOADING__) return;
  window.__SAFARI_MAP_V17_LOADING__ = true;

  const addStylesheet = (href, id) => {
    const old = document.getElementById(id);
    if (old) old.remove();
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  };

  const addScript = (src, id) => {
    const old = document.getElementById(id);
    if (old) old.remove();
    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.defer = true;
    document.body.appendChild(script);
  };

  addStylesheet('./deploy/v17-map.css?v=21', 'safari-map-v17-css');
  addStylesheet('./deploy/v20-layout.css?v=21', 'safari-layout-v20-css');

  const parts = [
    './deploy/v17-map-part-01.txt?v=21',
    './deploy/v17-map-part-02.txt?v=21',
    './deploy/v17-map-part-03.txt?v=21',
    './deploy/v17-map-part-04.txt?v=21',
    './deploy/v17-map-part-05.txt?v=21',
    './deploy/v17-map-part-06.txt?v=21',
    './deploy/v17-map-part-07.txt?v=21',
    './deploy/v17-map-part-08.txt?v=21'
  ];

  const waitForV16 = async () => {
    const deadline = Date.now() + 10000;
    while (!window.__SAFARI_MAP_V16_READY__ && Date.now() < deadline) {
      await new Promise(resolve => setTimeout(resolve, 60));
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

      if (!window.__SAFARI_MAP_V17_READY__) {
        throw new Error('V17 runtime did not finish initialization');
      }

      addScript('./deploy/v20-layout.js?v=21', 'safari-layout-v20-js');
    } catch (error) {
      console.error('No se pudo iniciar Safari Map V17:', error);
      window.__SAFARI_MAP_V17_LOADING__ = false;
      window.dispatchEvent(new CustomEvent('safari-map-v17-failed', { detail: String(error) }));
    }
  })();
})();
