(() => {
  if (window.__SAFARI_META_V24_READY__) return;
  window.__SAFARI_META_V24_READY__ = true;

  const VERSION = 'v24';
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

  function installVersionBadge() {
    const intro = document.getElementById('intro');
    if (!intro) return;

    let badge = intro.querySelector('#safariVersionBadge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'safariVersionBadge';
      badge.className = 'safari-version-badge';
      intro.appendChild(badge);
    }

    const label = `VERSIÓN ${VERSION.toUpperCase()}`;
    if (badge.dataset.versionLabel !== label) {
      badge.dataset.versionLabel = label;
      badge.innerHTML = `<span>VERSIÓN</span><strong>${VERSION.toUpperCase()}</strong>`;
    }
  }

  function setCreator(item, author) {
    if (!item || item.createdBy) return false;
    item.createdBy = author || 'Staff';
    if (!item.createdAt) item.createdAt = new Date().toISOString();
    return true;
  }

  function idsOf(items) {
    return new Set((Array.isArray(items) ? items : []).map(item => String(item?.id || '')));
  }

  function afterExistingSubmit(callback) {
    setTimeout(() => {
      try {
        callback();
      } catch (error) {
        console.warn('Safari creator metadata:', error);
      }
    }, 0);
  }

  function trackComodines() {
    const form = document.getElementById('comodinEditorForm');
    if (!form || form.dataset.creatorTracked === '1') return;
    form.dataset.creatorTracked = '1';

    form.addEventListener('submit', () => {
      let before = new Set();
      try { before = idsOf(comodinesData); } catch (error) {}
      const author = currentStaffName();

      afterExistingSubmit(() => {
        if (typeof comodinesData === 'undefined' || !Array.isArray(comodinesData)) return;
        let changed = false;
        comodinesData.forEach(item => {
          if (!before.has(String(item.id))) changed = setCreator(item, author) || changed;
        });
        if (changed) {
          saveComodinesData();
          renderComodines();
        }
      });
    }, true);
  }

  function trackArchivo() {
    const form = document.getElementById('itemEditorForm');
    if (!form || form.dataset.creatorTracked === '1') return;
    form.dataset.creatorTracked = '1';

    form.addEventListener('submit', () => {
      let category = '';
      let before = new Set();
      try {
        category = currentArchivoCategory;
        before = idsOf(archivoData?.[category]);
      } catch (error) {}
      const author = currentStaffName();

      afterExistingSubmit(() => {
        if (!category || typeof archivoData === 'undefined') return;
        const items = Array.isArray(archivoData[category]) ? archivoData[category] : [];
        let changed = false;
        items.forEach(item => {
          if (!before.has(String(item.id))) changed = setCreator(item, author) || changed;
        });
        if (changed) {
          saveArchivoData();
          if (typeof currentArchivoCategory !== 'undefined' && currentArchivoCategory === category) {
            renderArchivo();
          }
        }
      });
    }, true);
  }

  function trackLeaders() {
    const form = document.getElementById('leaderEditorForm');
    if (!form || form.dataset.creatorTracked === '1') return;
    form.dataset.creatorTracked = '1';

    form.addEventListener('submit', () => {
      let group = '';
      let before = new Set();
      try {
        group = editingLeaderGroup || '';
        before = idsOf(leadersData?.[group]);
      } catch (error) {}
      const author = currentStaffName();

      afterExistingSubmit(() => {
        if (!group || typeof leadersData === 'undefined') return;
        const items = Array.isArray(leadersData[group]) ? leadersData[group] : [];
        let changed = false;
        items.forEach(item => {
          if (!before.has(String(item.id))) changed = setCreator(item, author) || changed;
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
    if (!form || form.dataset.creatorTracked === '1') return;
    form.dataset.creatorTracked = '1';

    form.addEventListener('submit', () => {
      let teamId = null;
      let before = new Set();
      try {
        teamId = currentSanctionsTeamId;
        const team = getTeamById(teamId);
        before = idsOf(team?.sanctions);
      } catch (error) {}
      const author = currentStaffName();

      afterExistingSubmit(() => {
        if (!teamId) return;
        const team = getTeamById(teamId);
        if (!team || !Array.isArray(team.sanctions)) return;
        let changed = false;
        team.sanctions.forEach(item => {
          if (!before.has(String(item.id))) changed = setCreator(item, author) || changed;
        });
        if (changed) {
          saveScoreTeams();
          if (typeof currentSanctionsTeamId !== 'undefined' && currentSanctionsTeamId === teamId) {
            renderSanctions();
          }
          renderScoreTable();
        }
      });
    }, true);
  }

  function syncCreatorMeta(host, name) {
    if (!(host instanceof HTMLElement)) return;
    const existing = host.querySelector(':scope > .safari-added-by');

    if (!name) {
      if (existing) existing.remove();
      return;
    }

    const text = `Añadido por ${name}`;
    if (existing) {
      if (existing.textContent !== text) existing.textContent = text;
      return;
    }

    const meta = document.createElement('small');
    meta.className = 'safari-added-by';
    meta.textContent = text;
    host.appendChild(meta);
  }

  function annotateComodines() {
    const list = document.getElementById('comodinesList');
    if (!list || typeof comodinesData === 'undefined' || !Array.isArray(comodinesData)) return;

    list.querySelectorAll('.comodin-item').forEach(row => {
      const item = comodinesData.find(entry => String(entry.id) === String(row.dataset.comodinId));
      syncCreatorMeta(row.querySelector('.comodin-copy'), item?.createdBy || '');
    });
  }

  function annotateArchivo() {
    const list = document.getElementById('archivoItems');
    if (!list || typeof archivoData === 'undefined' || typeof currentArchivoCategory === 'undefined') return;

    const items = Array.isArray(archivoData[currentArchivoCategory]) ? archivoData[currentArchivoCategory] : [];
    list.querySelectorAll('.archivo-item').forEach(row => {
      const item = items.find(entry => String(entry.id) === String(row.dataset.id));
      const host = row.children?.[1];
      syncCreatorMeta(host, item?.createdBy || '');
    });
  }

  function annotateLeaders() {
    const root = document.getElementById('leadersGroups');
    if (!root || typeof leadersData === 'undefined') return;

    root.querySelectorAll('.leader-row').forEach(row => {
      const button = row.querySelector('button[data-id]');
      if (!button) return;
      const group = button.dataset.group;
      const item = (leadersData[group] || []).find(entry => String(entry.id) === String(button.dataset.id));
      syncCreatorMeta(row.querySelector('.leader-name'), item?.createdBy || '');
    });
  }

  function annotateSanctions() {
    const root = document.getElementById('sanctionsList');
    if (!root || typeof currentSanctionsTeamId === 'undefined' || !currentSanctionsTeamId) return;

    const team = getTeamById(currentSanctionsTeamId);
    if (!team) return;

    root.querySelectorAll('.sanction-row').forEach(row => {
      const button = row.querySelector('button[data-id]');
      if (!button) return;
      const item = (team.sanctions || []).find(entry => String(entry.id) === String(button.dataset.id));
      syncCreatorMeta(row.querySelector('.sanction-reason'), item?.createdBy || '');
    });
  }

  let annotateQueued = false;
  function annotateAllSoon() {
    if (annotateQueued) return;
    annotateQueued = true;
    requestAnimationFrame(() => {
      annotateQueued = false;
      try { annotateComodines(); } catch (error) {}
      try { annotateArchivo(); } catch (error) {}
      try { annotateLeaders(); } catch (error) {}
      try { annotateSanctions(); } catch (error) {}
    });
  }

  function wireObservers() {
    ['comodinesList', 'archivoItems', 'leadersGroups', 'sanctionsList'].forEach(id => {
      const node = document.getElementById(id);
      if (!node || node.dataset.creatorObserver === '1') return;
      node.dataset.creatorObserver = '1';
      new MutationObserver(annotateAllSoon).observe(node, { childList: true, subtree: true });
    });
  }

  function install() {
    installVersionBadge();
    trackComodines();
    trackArchivo();
    trackLeaders();
    trackSanctions();
    wireObservers();
    annotateAllSoon();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }

  const bodyObserver = new MutationObserver(() => {
    installVersionBadge();
    wireObservers();
  });
  bodyObserver.observe(document.body, { childList: true, subtree: true });
})();
