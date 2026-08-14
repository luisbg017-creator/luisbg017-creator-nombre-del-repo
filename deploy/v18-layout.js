(() => {
  if (window.__SAFARI_LAYOUT_V18_READY__) return;
  window.__SAFARI_LAYOUT_V18_READY__ = true;

  const root = document.documentElement;
  const vv = window.visualViewport;
  let resizeTimer = null;

  function updateViewportVars() {
    const width = Math.max(280, Math.round(vv?.width || window.innerWidth || document.documentElement.clientWidth));
    const height = Math.max(320, Math.round(vv?.height || window.innerHeight || document.documentElement.clientHeight));

    root.style.setProperty('--legacy-vw', `${width}px`);
    root.style.setProperty('--legacy-vh', `${height}px`);
  }

  function notifyLayoutChange() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      window.dispatchEvent(new Event('safari:viewport-fit'));
      if (window.SafariMapV17?.refresh) {
        try { window.SafariMapV17.refresh(); } catch (error) {}
      }
    }, 80);
  }

  function fitViewport() {
    updateViewportVars();
    notifyLayoutChange();
  }

  updateViewportVars();

  window.addEventListener('resize', fitViewport, { passive: true });
  window.addEventListener('orientationchange', () => {
    setTimeout(fitViewport, 80);
    setTimeout(fitViewport, 350);
  }, { passive: true });

  if (vv) {
    vv.addEventListener('resize', fitViewport, { passive: true });
    vv.addEventListener('scroll', updateViewportVars, { passive: true });
  }

  const modalConfigs = [
    ['folderModal', '.folder-window'],
    ['cronogramaModal', '.schedule-window'],
    ['archivoModal', '.archivo-window'],
    ['itemEditorModal', '.item-editor-window'],
    ['profileEditorModal', '.profile-editor-window'],
    ['exportPasswordModal', '.export-password-window'],
    ['scoreModal', '.score-window'],
    ['scorePasswordModal', '.score-password-window'],
    ['sanctionsModal', '.sanctions-window'],
    ['sanctionEditorModal', '.sanction-editor-window'],
    ['leadersModal', '.leaders-window'],
    ['leaderEditorModal', '.leader-editor-window'],
    ['comodinEditorModal', '.comodin-editor-window'],
    ['mapModal', '.map-window'],
    ['mapPointEditorModal', '.map-point-editor-window']
  ];

  function resetScrollablePosition(modal, scrollSelector) {
    const scroller = modal.querySelector(scrollSelector);
    if (scroller) {
      scroller.scrollTop = 0;
      scroller.scrollLeft = 0;
    }

    modal.querySelectorAll('.league-table-wrap, .archivo-tabs, .map-sidebar').forEach(el => {
      el.scrollTop = 0;
      el.scrollLeft = 0;
    });
  }

  function afterOpen(modal, scrollSelector) {
    updateViewportVars();
    resetScrollablePosition(modal, scrollSelector);

    [0, 80, 220].forEach(delay => {
      setTimeout(() => {
        updateViewportVars();
        window.dispatchEvent(new Event('resize'));
      }, delay);
    });
  }

  function attachModalObserver(modal, scrollSelector) {
    let wasOpen = modal.classList.contains('open');

    const observer = new MutationObserver(() => {
      const isOpen = modal.classList.contains('open');
      if (isOpen && !wasOpen) afterOpen(modal, scrollSelector);
      wasOpen = isOpen;
    });

    observer.observe(modal, { attributes: true, attributeFilter: ['class'] });

    if (wasOpen) afterOpen(modal, scrollSelector);
  }

  function wireExistingModals() {
    modalConfigs.forEach(([id, selector]) => {
      const modal = document.getElementById(id);
      if (modal && !modal.dataset.viewportFitV18) {
        modal.dataset.viewportFitV18 = '1';
        attachModalObserver(modal, selector);
      }
    });
  }

  wireExistingModals();

  const bodyObserver = new MutationObserver(() => wireExistingModals());
  bodyObserver.observe(document.body, { childList: true, subtree: true });

  window.addEventListener('pageshow', () => {
    updateViewportVars();
    wireExistingModals();
    document.querySelectorAll('.open').forEach(modal => {
      const entry = modalConfigs.find(([id]) => id === modal.id);
      if (entry) afterOpen(modal, entry[1]);
    });
  });
})();
