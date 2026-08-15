(() => {
  'use strict';
  if (window.__SAFARI_COMODINES_LOCATION_V30_READY__) return;
  window.__SAFARI_COMODINES_LOCATION_V30_READY__ = true;

  const LOCATION_INPUT_ID = 'comodinLocationInputV30';
  const STYLE_ID = 'comodinLocationStylesV30';

  function escapeHTML(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function getComodines() {
    try {
      return Array.isArray(comodinesData) ? comodinesData : [];
    } catch (error) {
      return [];
    }
  }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .comodin-location-v30 {
        margin-top: 12px;
        padding: 10px 12px;
        border: 1px solid rgba(255,255,255,.16);
        background: rgba(255,255,255,.035);
        display: grid;
        gap: 4px;
      }
      .comodin-location-v30 .comodin-location-label-v30 {
        color: #8e8e89;
        font-size: .47rem;
        line-height: 1.2;
        letter-spacing: .18em;
        font-weight: 800;
        text-transform: uppercase;
      }
      .comodin-location-v30 .comodin-location-text-v30 {
        color: #efefeb;
        font-size: .72rem;
        line-height: 1.45;
        letter-spacing: .02em;
        font-weight: 600;
      }
      .comodin-item.found .comodin-location-v30 {
        border-color: rgba(36,112,66,.32);
        background: rgba(36,112,66,.08);
      }
      .comodin-item.found .comodin-location-v30 .comodin-location-text-v30 {
        color: #1f6a3e;
      }
      .comodin-location-empty-v30 {
        opacity: .52;
        font-style: italic;
        font-weight: 500 !important;
      }
      #comodinEditorForm .comodin-location-field-v30 input {
        width: 100%;
        border: 1px solid rgba(0,0,0,.3);
        background: #fff;
        color: #050505;
        padding: 12px;
        font: inherit;
      }
      #comodinEditorForm .comodin-location-field-v30 small {
        color: #73736f;
        font-size: .48rem;
        line-height: 1.45;
        letter-spacing: .06em;
      }
      @media (max-width: 700px) {
        .comodin-location-v30 {
          margin-top: 10px;
          padding: 9px 10px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function ensureLocationField() {
    const form = document.getElementById('comodinEditorForm');
    if (!form) return null;

    let input = document.getElementById(LOCATION_INPUT_ID);
    if (input) return input;

    const actions = form.querySelector('.comodin-editor-actions');
    if (!actions) return null;

    const label = document.createElement('label');
    label.className = 'comodin-location-field-v30';
    label.innerHTML = `
      <span>UBICACIÓN</span>
      <input id="${LOCATION_INPUT_ID}" type="text" maxlength="180" placeholder="Ej.: Complejo Auriazul · acceso principal" required />
      <small>Escribí textualmente dónde está o dónde se encuentra este comodín.</small>
    `;
    actions.insertAdjacentElement('beforebegin', label);
    return label.querySelector('input');
  }

  function decorateLocations() {
    const items = getComodines();
    const list = document.getElementById('comodinesList');
    if (!list) return;

    list.querySelectorAll('.comodin-item').forEach((row) => {
      const id = row.dataset.comodinId;
      const item = items.find((entry) => String(entry?.id) === String(id));
      const host = row.querySelector('.comodin-copy');
      if (!host || !item) return;

      host.querySelector(':scope > .comodin-location-v30')?.remove();

      const location = String(item.location || '').trim();
      const block = document.createElement('div');
      block.className = 'comodin-location-v30';
      block.innerHTML = `
        <span class="comodin-location-label-v30">UBICACIÓN</span>
        <span class="comodin-location-text-v30 ${location ? '' : 'comodin-location-empty-v30'}">${escapeHTML(location || 'Ubicación no especificada')}</span>
      `;
      host.appendChild(block);
    });
  }

  function wrapRenderComodines() {
    try {
      const original = renderComodines;
      if (typeof original !== 'function' || original.__locationV30Wrapped) return;
      const wrapped = function (...args) {
        const result = original.apply(this, args);
        decorateLocations();
        return result;
      };
      wrapped.__locationV30Wrapped = true;
      renderComodines = wrapped;
      window.renderComodines = wrapped;
    } catch (error) {
      console.warn('Safari Comodines V30 render:', error);
    }
  }

  function wrapOpenEditor() {
    try {
      const original = openComodinEditor;
      if (typeof original !== 'function' || original.__locationV30Wrapped) return;
      const wrapped = function (id = null) {
        const result = original.call(this, id);
        const input = ensureLocationField();
        if (input) {
          const item = id ? getComodines().find((entry) => String(entry?.id) === String(id)) : null;
          input.value = item?.location || '';
        }
        return result;
      };
      wrapped.__locationV30Wrapped = true;
      openComodinEditor = wrapped;
      window.openComodinEditor = wrapped;
    } catch (error) {
      console.warn('Safari Comodines V30 editor:', error);
    }
  }

  function installSubmitPersistence() {
    const form = document.getElementById('comodinEditorForm');
    if (!form || form.dataset.locationV30 === '1') return;
    form.dataset.locationV30 = '1';

    form.addEventListener('submit', () => {
      const input = ensureLocationField();
      const location = input?.value.trim() || '';
      const beforeIds = new Set(getComodines().map((item) => String(item?.id)));
      let editingId = null;
      try { editingId = editingComodinId; } catch (error) {}

      setTimeout(() => {
        try {
          const items = getComodines();
          let item = editingId
            ? items.find((entry) => String(entry?.id) === String(editingId))
            : items.find((entry) => !beforeIds.has(String(entry?.id)));

          if (!item) return;
          item.location = location;
          item.updatedAt = new Date().toISOString();
          saveComodinesData();
          renderComodines();
        } catch (error) {
          console.warn('Safari Comodines V30 location save:', error);
        }
      }, 0);
    }, true);
  }

  function installEditorFallbacks() {
    const list = document.getElementById('comodinesList');
    if (list && list.dataset.locationV30 !== '1') {
      list.dataset.locationV30 = '1';
      list.addEventListener('click', (event) => {
        const button = event.target.closest('.comodin-edit-btn[data-id]');
        if (!button) return;
        const id = button.dataset.id;
        setTimeout(() => {
          const input = ensureLocationField();
          const item = getComodines().find((entry) => String(entry?.id) === String(id));
          if (input) input.value = item?.location || '';
        }, 0);
      });
    }

    ['addComodinBtn', 'addComodinEmptyBtn'].forEach((id) => {
      const button = document.getElementById(id);
      if (!button || button.dataset.locationV30 === '1') return;
      button.dataset.locationV30 = '1';
      button.addEventListener('click', () => {
        setTimeout(() => {
          const input = ensureLocationField();
          if (input) input.value = '';
        }, 0);
      });
    });
  }

  function install() {
    installStyles();
    ensureLocationField();
    wrapRenderComodines();
    wrapOpenEditor();
    installSubmitPersistence();
    installEditorFallbacks();
    decorateLocations();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
