(() => {
  if (window.__SAFARI_LAYOUT_V20_READY__) return;
  window.__SAFARI_LAYOUT_V20_READY__ = true;

  const root = document.documentElement;
  const vv = window.visualViewport;
  let raf = 0;

  const modalIds = [
    'comodinesModal','cronogramaModal','archivoModal','itemEditorModal','profileEditorModal',
    'exportPasswordModal','scoreModal','scorePasswordModal','sanctionsModal','sanctionEditorModal',
    'leadersModal','leaderEditorModal','comodinEditorModal','mapModal','mapPointEditorModal'
  ];

  const scrollSelectors = [
    '.comodines-list','.schedule-days','.archivo-items','.archivo-empty','.league-table-wrap',
    '.sanctions-list','.sanctions-empty','.leaders-groups','.map-sidebar','.map-search-results',
    '#itemEditorForm','#profileEditorForm','#exportPasswordForm','#scorePasswordForm',
    '#sanctionEditorForm','#leaderEditorForm','#comodinEditorForm','#mapPointEditorForm'
  ].join(',');

  function updateVisualViewportVars() {
    const width = Math.max(280, Math.round(vv?.width || window.innerWidth || document.documentElement.clientWidth));
    const height = Math.max(260, Math.round(vv?.height || window.innerHeight || document.documentElement.clientHeight));
    const top = Math.max(0, Math.round(vv?.offsetTop || 0));
    const left = Math.max(0, Math.round(vv?.offsetLeft || 0));

    root.style.setProperty('--v20-vw', `${width}px`);
    root.style.setProperty('--v20-vh', `${height}px`);
    root.style.setProperty('--v20-vtop', `${top}px`);
    root.style.setProperty('--v20-vleft', `${left}px`);
  }

  function isOpen(modal) {
    return modal?.classList.contains('open');
  }

  function resetModalScroll(modal) {
    if (!modal) return;

    modal.querySelectorAll(scrollSelectors).forEach(el => {
      el.scrollTop = 0;
      el.scrollLeft = 0;
    });

    modal.querySelectorAll(
      '.folder-window,.schedule-window,.archivo-window,.score-window,.sanctions-window,.leaders-window,.map-window,' +
      '.item-editor-window,.profile-editor-window,.export-password-window,.score-password-window,' +
      '.sanction-editor-window,.leader-editor-window,.comodin-editor-window,.map-point-editor-window'
    ).forEach(el => {
      el.scrollTop = 0;
      el.scrollLeft = 0;
    });
  }

  function refitMap() {
    const modal = document.getElementById('mapModal');
    if (!isOpen(modal)) return;

    window.dispatchEvent(new Event('resize'));

    const search = modal.querySelector('.map-search-shell');
    if (search) {
      search.style.visibility = 'visible';
      search.style.opacity = '1';
    }
  }

  function refit() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      updateVisualViewportVars();
      refitMap();
    });
  }

  function onOpened(modal) {
    updateVisualViewportVars();
    resetModalScroll(modal);

    [0, 40, 120, 260].forEach(delay => {
      setTimeout(() => {
        updateVisualViewportVars();
        if (isOpen(modal)) {
          if (delay <= 40) resetModalScroll(modal);
          refitMap();
        }
      }, delay);
    });
  }

  function wireModal(modal) {
    if (!modal || modal.dataset.v20Fit === '1') return;
    modal.dataset.v20Fit = '1';

    let open = isOpen(modal);

    const observer = new MutationObserver(() => {
      const next = isOpen(modal);
      if (next && !open) onOpened(modal);
      open = next;
    });

    observer.observe(modal, {
      attributes: true,
      attributeFilter: ['class', 'aria-hidden']
    });

    if (open) onOpened(modal);
  }

  function wireAll() {
    modalIds.forEach(id => wireModal(document.getElementById(id)));
  }

  document.addEventListener('click', event => {
    const trigger = event.target.closest(
      '#openComodines,#openCronograma,#openArchivo,#openScoreTable,#openLeaders,#openLegacyMap,' +
      '.open-folder-btn,.open-schedule-btn,.open-archivo-btn,.open-score-btn,.open-leaders-btn,.open-map-btn'
    );

    if (!trigger) return;

    updateVisualViewportVars();

    setTimeout(() => {
      modalIds.forEach(id => {
        const modal = document.getElementById(id);
        if (isOpen(modal)) onOpened(modal);
      });
    }, 0);
  }, true);

  document.addEventListener('focusin', event => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const modal = target.closest(
      '.item-editor-modal.open,.profile-editor-modal.open,.export-password-modal.open,' +
      '.score-password-modal.open,.sanction-editor-modal.open,.leader-editor-modal.open,' +
      '.comodin-editor-modal.open,.map-point-editor-modal.open'
    );

    if (!modal) return;

    setTimeout(() => {
      updateVisualViewportVars();
      target.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });
    }, 80);
  });

  if (vv) {
    vv.addEventListener('resize', refit, { passive: true });
    vv.addEventListener('scroll', refit, { passive: true });
  }

  window.addEventListener('resize', refit, { passive: true });
  window.addEventListener('orientationchange', () => {
    setTimeout(refit, 40);
    setTimeout(refit, 220);
  }, { passive: true });

  window.addEventListener('pageshow', () => {
    updateVisualViewportVars();
    wireAll();
  });

  const bodyObserver = new MutationObserver(() => wireAll());
  bodyObserver.observe(document.body, { childList: true, subtree: true });

  updateVisualViewportVars();
  wireAll();
})();
