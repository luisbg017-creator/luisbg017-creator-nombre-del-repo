(() => {
  if (window.__SAFARI_META_V25_READY__) return;
  window.__SAFARI_META_V25_READY__ = true;

  const VERSION = 'v25';
  const STAFF_SESSION_STORAGE = 'legacyCurrentStaffV1';

  function currentStaffName() {
    try {
      const currentId = localStorage.getItem(STAFF_SESSION_STORAGE);
      if (typeof staffProfiles !== 'undefined' && Array.isArray(staffProfiles)) {
        const profile = staffProfiles.find(item => item.id === currentId);
        if (profile?.name) return profile.name;
      }
    } catch (error) {}
    return 'Staff';
  }

  function ensureVersionBadge() {
    const intro = document.getElementById('intro');
    if (!intro) return;
    let badge = document.getElementById('safariVersionBadge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'safariVersionBadge';
      badge.className = 'safari-version-badge safari-version-badge-v25';
      intro.appendChild(badge);
    }
    if (badge.textContent !== `VERSIÓN ${VERSION.toUpperCase()}`) {
      badge.textContent = `VERSIÓN ${VERSION.toUpperCase()}`;
    }
  }

  function idsOf(items) {
    return new Set((Array.isArray(items) ? items : []).map(item => String(item?.id || '')));
  }

  function setCreator(item, author) {
    if (!item || item.createdBy) return false;
    item.createdBy = author || 'Staff';
    if (!item.createdAt) item.createdAt = new Date().toISOString();
    return true;
  }

  function afterSubmit(callback) {
    setTimeout(() => {
      try { callback(); } catch (error) { console.warn('Safari v25 metadata:', error); }
    }, 0);
  }

  function trackComodines() {
    const form = document.getElementById('comodinEditorForm');
    if (!form || form.dataset.creatorTrackedV25 === '1') return;
    form.dataset.creatorTrackedV25 = '1';
    form.addEventListener('submit', () => {
      let before = new Set();
      try { before = idsOf(comodinesData); } catch (error) {}
      const author = currentStaffName();
      afterSubmit(() => {
        if (!Array.isArray(comodinesData)) return;
        let changed = false;
        for (const item of comodinesData) {
          if (!before.has(String(item.id))) changed = setCreator(item, author) || changed;
        }
        if (changed) {
          saveComodinesData();
          renderComodines();
        }
      });
    }, true);
  }

  function trackArchivo() {
    const form = document.getElementById('itemEditorForm');
    if (!form || form.dataset.creatorTrackedV25 === '1') return;
    form.dataset.creatorTrackedV25 = '1';
    form.addEventListener('submit', () => {
      let category = '';
      let before = new Set();
      try {
        category = currentArchivoCategory;
        before = idsOf(archivoData?.[category]);
      } catch (error) {}
      const author = currentStaffName();
      afterSubmit(() => {
        const items = Array.isArray(archivoData?.[category]) ? archivoData[category] : [];
        let changed = false;
        for (const item of items) {
          if (!before.has(String(item.id))) changed = setCreator(item, author) || changed;
        }
        if (changed) {
          saveArchivoData();
          renderArchivo();
        }
      });
    }, true);
  }

  function trackLeaders() {
    const form = document.getElementById('leaderEditorForm');
    if (!form || form.dataset.creatorTrackedV25 === '1') return;
    form.dataset.creatorTrackedV25 = '1';
    form.addEventListener('submit', () => {
      const author = currentStaffName();
      const before = new Set();
      try {
        Object.values(leadersData || {}).flat().forEach(item => before.add(String(item?.id || '')));
      } catch (error) {}
      afterSubmit(() => {
        let changed = false;
        Object.values(leadersData || {}).flat().forEach(item => {
          if (!before.has(String(item?.id || ''))) changed = setCreator(item, author) || changed;
        });
        if (changed) {
          saveLeadersData();
          renderLeaders();
        }
      });
    }, true);
  }

  function trackSanctions() {
    const form = document.getElementById('sanctionEditorForm');
    if (!form || form.dataset.creatorTrackedV25 === '1') return;
    form.dataset.creatorTrackedV25 = '1';
    form.addEventListener('submit', () => {
      let teamId = null;
      let before = new Set();
      try {
        teamId = currentSanctionsTeamId;
        before = idsOf(getTeamById(teamId)?.sanctions);
      } catch (error) {}
      const author = currentStaffName();
      afterSubmit(() => {
        const team = teamId ? getTeamById(teamId) : null;
        if (!team || !Array.isArray(team.sanctions)) return;
        let changed = false;
        for (const item of team.sanctions) {
          if (!before.has(String(item.id))) changed = setCreator(item, author) || changed;
        }
        if (changed) {
          saveScoreTeams();
          renderSanctions();
          renderScoreTable();
        }
      });
    }, true);
  }

  function metaEl(name) {
    const el = document.createElement('small');
    el.className = 'safari-added-by';
    el.textContent = `Añadido por ${name}`;
    return el;
  }

  function annotateComodines() {
    if (!Array.isArray(window.comodinesData)) return;
    document.querySelectorAll('#comodinesList .comodin-item').forEach(row => {
      const item = comodinesData.find(entry => String(entry.id) === String(row.dataset.comodinId));
      const host = row.querySelector('.comodin-copy');
      if (!host) return;
      host.querySelector(':scope > .safari-added-by')?.remove();
      if (item?.createdBy) host.appendChild(metaEl(item.createdBy));
    });
  }

  function annotateArchivo() {
    try {
      const items = Array.isArray(archivoData?.[currentArchivoCategory]) ? archivoData[currentArchivoCategory] : [];
      document.querySelectorAll('#archivoItems .archivo-item').forEach(row => {
        const item = items.find(entry => String(entry.id) === String(row.dataset.id));
        const host = row.children?.[1];
        if (!(host instanceof HTMLElement)) return;
        host.querySelector(':scope > .safari-added-by')?.remove();
        if (item?.createdBy) host.appendChild(metaEl(item.createdBy));
      });
    } catch (error) {}
  }

  function annotateLeaders() {
    try {
      document.querySelectorAll('#leadersGroups .leader-row').forEach(row => {
        const button = row.querySelector('button[data-id]');
        const host = row.querySelector('.leader-name');
        if (!button || !host) return;
        const item = (leadersData?.[button.dataset.group] || []).find(entry => String(entry.id) === String(button.dataset.id));
        host.querySelector(':scope > .safari-added-by')?.remove();
        if (item?.createdBy) host.appendChild(metaEl(item.createdBy));
      });
    } catch (error) {}
  }

  function annotateSanctions() {
    try {
      const team = getTeamById(currentSanctionsTeamId);
      if (!team) return;
      document.querySelectorAll('#sanctionsList .sanction-row').forEach(row => {
        const button = row.querySelector('button[data-id]');
        const host = row.querySelector('.sanction-reason');
        if (!button || !host) return;
        const item = (team.sanctions || []).find(entry => String(entry.id) === String(button.dataset.id));
        host.querySelector(':scope > .safari-added-by')?.remove();
        if (item?.createdBy) host.appendChild(metaEl(item.createdBy));
      });
    } catch (error) {}
  }

  function wrapRender(name, annotate) {
    try {
      const original = window[name];
      if (typeof original !== 'function' || original.__v25Wrapped) return;
      const wrapped = function (...args) {
        const result = original.apply(this, args);
        setTimeout(annotate, 0);
        return result;
      };
      wrapped.__v25Wrapped = true;
      window[name] = wrapped;
    } catch (error) {}
  }

  function install() {
    ensureVersionBadge();
    trackComodines();
    trackArchivo();
    trackLeaders();
    trackSanctions();
    wrapRender('renderComodines', annotateComodines);
    wrapRender('renderArchivo', annotateArchivo);
    wrapRender('renderLeaders', annotateLeaders);
    wrapRender('renderSanctions', annotateSanctions);
    setTimeout(() => {
      annotateComodines();
      annotateArchivo();
      annotateLeaders();
      annotateSanctions();
    }, 0);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
