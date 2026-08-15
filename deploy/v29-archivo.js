(() => {
  'use strict';
  if (window.__SAFARI_ARCHIVO_V29_READY__) return;
  window.__SAFARI_ARCHIVO_V29_READY__ = true;

  const VERSION = 'V29';
  const SUPABASE_URL = 'https://sqxcygylcxlsigcmawma.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_SdZBbhB1onHQHFB-XFX3PQ_rsfgL7Af';
  const TABLE = 'safari_archive_items';
  const CATEGORIES = ['fotos', 'videos', 'averigua', 'traer', 'audios'];
  const LABELS = {
    fotos: 'FOTOS',
    videos: 'VIDEOS',
    averigua: 'AVERIGUA',
    traer: 'TRAER',
    audios: 'AUDIOS'
  };

  let polling = false;
  let lastSignature = '';
  let mutationBusy = false;
  let highlightId = null;

  const $ = (id) => document.getElementById(id);

  function headers(extra = {}) {
    return {
      apikey: SUPABASE_KEY,
      'Content-Type': 'application/json',
      ...extra
    };
  }

  function escapeHTML(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function currentStaffNameV29() {
    try {
      const id = localStorage.getItem('legacyCurrentStaffV1');
      if (typeof staffProfiles !== 'undefined' && Array.isArray(staffProfiles)) {
        return staffProfiles.find((profile) => profile.id === id)?.name || 'Staff';
      }
    } catch (error) {}
    return 'Staff';
  }

  function emptyArchive() {
    return { fotos: [], videos: [], averigua: [], traer: [], audios: [] };
  }

  function rowToItem(row) {
    return {
      id: String(row.id),
      title: String(row.title || ''),
      detail: String(row.detail || ''),
      createdBy: row.created_by || undefined,
      createdAt: row.created_at || undefined,
      updatedAt: row.updated_at || undefined,
      sortOrder: Number(row.sort_order || 0)
    };
  }

  function rowsToArchive(rows) {
    const next = emptyArchive();
    for (const row of Array.isArray(rows) ? rows : []) {
      if (!CATEGORIES.includes(row.category)) continue;
      next[row.category].push(rowToItem(row));
    }
    return next;
  }

  function archiveSignature(value) {
    try {
      return JSON.stringify(CATEGORIES.map((category) =>
        (value?.[category] || []).map((item) => [item.id, item.title, item.detail, item.updatedAt])
      ));
    } catch (error) {
      return '';
    }
  }

  function ensureStatusUI() {
    const toolbar = document.querySelector('.archivo-toolbar');
    if (!toolbar || $('archivoSyncStatusV29')) return;

    const status = document.createElement('div');
    status.id = 'archivoSyncStatusV29';
    status.className = 'archivo-sync-status-v29';
    status.innerHTML = '<span></span><strong>SINCRONIZADO</strong>';
    toolbar.insertAdjacentElement('afterend', status);

    const style = document.createElement('style');
    style.id = 'archivoV29Styles';
    style.textContent = `
      .archivo-sync-status-v29 {
        min-height: 34px;
        padding: 0 24px;
        border-bottom: 1px solid rgba(0,0,0,.1);
        display: flex;
        align-items: center;
        gap: 8px;
        color: #676763;
        font-size: .48rem;
        letter-spacing: .13em;
      }
      .archivo-sync-status-v29 span {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #2d6b45;
        box-shadow: 0 0 0 3px rgba(45,107,69,.12);
      }
      .archivo-sync-status-v29.saving span { background: #a5781e; box-shadow: 0 0 0 3px rgba(165,120,30,.12); }
      .archivo-sync-status-v29.error span { background: #8a2424; box-shadow: 0 0 0 3px rgba(138,36,36,.12); }
      .archivo-item.archivo-new-v29 {
        animation: archivoNewV29 1.15s ease both;
        outline: 2px solid #1e6b42;
        outline-offset: -2px;
      }
      .archivo-item .archivo-created-by-v29 {
        display: block;
        margin-top: 6px;
        color: #777;
        font-size: .48rem;
        letter-spacing: .11em;
      }
      .archivo-item:hover .archivo-created-by-v29 { color: #b9b9b5; }
      @keyframes archivoNewV29 {
        0% { background: #d9f1df; transform: translateY(-4px); }
        100% { background: transparent; transform: none; }
      }
      @media (max-width: 700px) {
        .archivo-sync-status-v29 { padding-left: 16px; padding-right: 16px; }
      }
    `;
    document.head.appendChild(style);
  }

  function setSyncStatus(text, mode = 'ok') {
    ensureStatusUI();
    const el = $('archivoSyncStatusV29');
    if (!el) return;
    el.classList.toggle('saving', mode === 'saving');
    el.classList.toggle('error', mode === 'error');
    const strong = el.querySelector('strong');
    if (strong) strong.textContent = text;
  }

  function updateCardSummary() {
    try {
      const cardText = document.querySelector('.archivo-card .archivo-preview p');
      if (!cardText || typeof archivoData === 'undefined') return;
      const counts = CATEGORIES.map((category) => (archivoData?.[category] || []).length);
      cardText.textContent = `${counts[0]} fotos · ${counts[1]} videos · ${counts[2]} averigua · ${counts[3]} traer · ${counts[4]} audios.`;
    } catch (error) {}
  }

  function renderArchivoV29() {
    try {
      const category = CATEGORIES.includes(currentArchivoCategory) ? currentArchivoCategory : 'fotos';
      const items = Array.isArray(archivoData?.[category]) ? archivoData[category] : [];
      const itemsHost = $('archivoItems');
      const empty = $('archivoEmpty');
      const title = $('archivoCategoryTitle');
      const count = $('archivoCount');
      if (!itemsHost || !empty || !title || !count) return;

      title.textContent = LABELS[category] || category.toUpperCase();
      count.textContent = `${items.length} ${items.length === 1 ? 'ÍTEM' : 'ÍTEMS'}`;

      document.querySelectorAll('.archivo-tab').forEach((tab) => {
        tab.classList.toggle('active', tab.dataset.category === category);
      });

      itemsHost.innerHTML = items.map((item, index) => `
        <article class="archivo-item ${String(item.id) === String(highlightId) ? 'archivo-new-v29' : ''}" data-id="${escapeHTML(item.id)}">
          <span class="archivo-item-index">${String(index + 1).padStart(2, '0')}</span>
          <div>
            <h6>${escapeHTML(item.title)}</h6>
            ${item.detail ? `<p>${escapeHTML(item.detail)}</p>` : ''}
            ${item.createdBy ? `<small class="archivo-created-by-v29">AÑADIDO POR ${escapeHTML(item.createdBy)}</small>` : ''}
          </div>
          <div class="archivo-item-actions">
            <button class="archivo-edit-btn" data-action="edit" data-id="${escapeHTML(item.id)}" type="button">EDITAR</button>
            <button class="archivo-delete-btn" data-action="delete" data-id="${escapeHTML(item.id)}" type="button">QUITAR</button>
          </div>
        </article>
      `).join('');

      empty.classList.toggle('visible', items.length === 0);
      itemsHost.style.display = items.length === 0 ? 'none' : 'block';
      updateCardSummary();
      ensureStatusUI();

      if (highlightId) {
        const id = highlightId;
        highlightId = null;
        setTimeout(() => {
          const row = itemsHost.querySelector(`[data-id="${CSS.escape(String(id))}"]`);
          if (row) row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 80);
      }
    } catch (error) {
      console.warn('Safari Archivo V29 render:', error);
    }
  }

  async function fetchRows() {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/${TABLE}?select=id,category,title,detail,created_by,created_at,updated_at,sort_order&order=category.asc,sort_order.asc,created_at.asc`,
      { headers: headers(), cache: 'no-store' }
    );
    if (!response.ok) throw new Error(`Supabase ${response.status}`);
    return response.json();
  }

  async function refreshFromServer({ force = false } = {}) {
    if (polling || mutationBusy) return;
    polling = true;
    try {
      const rows = await fetchRows();
      const next = rowsToArchive(rows);
      const signature = archiveSignature(next);
      if (force || signature !== lastSignature) {
        archivoData = next;
        lastSignature = signature;
        localStorage.setItem('legacyArchivoDataV2', JSON.stringify(archivoData));
        renderArchivoV29();
      }
      setSyncStatus('SINCRONIZADO · ' + new Date().toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' }), 'ok');
    } catch (error) {
      console.warn('Safari Archivo V29 sync:', error);
      setSyncStatus('SIN CONEXIÓN · REINTENTANDO', 'error');
    } finally {
      polling = false;
    }
  }

  async function syncLegacySection() {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/safari_shared_sections?on_conflict=section`, {
        method: 'POST',
        headers: headers({ Prefer: 'resolution=merge-duplicates,return=minimal' }),
        body: JSON.stringify({
          section: 'archivo',
          data: archivoData,
          updated_at: new Date().toISOString()
        })
      });
    } catch (error) {
      console.warn('Safari Archivo V29 legacy bridge:', error);
    }
  }

  function newId() {
    if (crypto?.randomUUID) return `archivo-${crypto.randomUUID()}`;
    return `archivo-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  async function insertItem(category, title, detail) {
    const id = newId();
    const now = new Date().toISOString();
    const createdBy = currentStaffNameV29();
    const row = {
      id,
      category,
      title,
      detail,
      created_by: createdBy,
      created_at: now,
      updated_at: now,
      sort_order: -Date.now()
    };

    const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
      method: 'POST',
      headers: headers({ Prefer: 'return=minimal' }),
      body: JSON.stringify(row)
    });
    if (!response.ok) throw new Error(`Supabase ${response.status}`);
    return id;
  }

  async function updateItem(id, title, detail) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: headers({ Prefer: 'return=minimal' }),
      body: JSON.stringify({ title, detail, updated_at: new Date().toISOString() })
    });
    if (!response.ok) throw new Error(`Supabase ${response.status}`);
  }

  async function deleteItem(id) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: headers({ Prefer: 'return=minimal' })
    });
    if (!response.ok) throw new Error(`Supabase ${response.status}`);
  }

  function installSharedArchiveGuard() {
    try {
      if (typeof applySharedSection !== 'function' || applySharedSection.__archivoV29Guard) return;
      const original = applySharedSection;
      const guarded = function (section, data) {
        if (section === 'archivo') return;
        return original(section, data);
      };
      guarded.__archivoV29Guard = true;
      applySharedSection = guarded;
    } catch (error) {
      console.warn('Safari Archivo V29 guard:', error);
    }
  }

  function installRenderOverride() {
    try {
      renderArchivo = renderArchivoV29;
      window.renderArchivo = renderArchivoV29;
    } catch (error) {
      console.warn('Safari Archivo V29 render override:', error);
    }
  }

  function installFormHandler() {
    const form = $('itemEditorForm');
    if (!form || form.dataset.archivoV29 === '1') return;
    form.dataset.archivoV29 = '1';

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (mutationBusy) return;

      const title = $('itemTitleInput')?.value.trim() || '';
      const detail = $('itemDetailInput')?.value.trim() || '';
      const category = CATEGORIES.includes(currentArchivoCategory) ? currentArchivoCategory : 'fotos';
      const editingId = editingArchivoId;
      if (!title) return;

      const saveButton = form.querySelector('button[type="submit"]');
      mutationBusy = true;
      if (saveButton) {
        saveButton.disabled = true;
        saveButton.textContent = 'GUARDANDO…';
      }
      setSyncStatus('GUARDANDO…', 'saving');

      try {
        if (editingId) {
          await updateItem(editingId, title, detail);
          highlightId = editingId;
        } else {
          highlightId = await insertItem(category, title, detail);
        }

        hideItemEditor();
        mutationBusy = false;
        await refreshFromServer({ force: true });
        await syncLegacySection();
        setSyncStatus('GUARDADO Y SINCRONIZADO', 'ok');
      } catch (error) {
        mutationBusy = false;
        console.error('Safari Archivo V29 save:', error);
        setSyncStatus('NO SE PUDO GUARDAR · INTENTÁ DE NUEVO', 'error');
        alert('No se pudo guardar el ítem. Revisá la conexión e intentá nuevamente.');
      } finally {
        mutationBusy = false;
        if (saveButton) {
          saveButton.disabled = false;
          saveButton.textContent = 'GUARDAR';
        }
      }
    }, true);
  }

  function installItemActions() {
    const host = $('archivoItems');
    if (!host || host.dataset.archivoV29 === '1') return;
    host.dataset.archivoV29 = '1';

    host.addEventListener('click', async (event) => {
      const button = event.target.closest('button[data-action]');
      if (!button) return;
      event.preventDefault();
      event.stopImmediatePropagation();

      const id = button.dataset.id;
      if (!id) return;

      if (button.dataset.action === 'edit') {
        openItemEditor(id);
        return;
      }

      if (button.dataset.action !== 'delete' || mutationBusy) return;
      const item = (archivoData?.[currentArchivoCategory] || []).find((entry) => String(entry.id) === String(id));
      if (!item) return;
      if (!confirm(`¿Quitar "${item.title}" de ${LABELS[currentArchivoCategory] || currentArchivoCategory}?`)) return;

      mutationBusy = true;
      setSyncStatus('ELIMINANDO…', 'saving');
      try {
        await deleteItem(id);
        mutationBusy = false;
        await refreshFromServer({ force: true });
        await syncLegacySection();
        setSyncStatus('ELIMINADO Y SINCRONIZADO', 'ok');
      } catch (error) {
        mutationBusy = false;
        console.error('Safari Archivo V29 delete:', error);
        setSyncStatus('NO SE PUDO ELIMINAR', 'error');
        alert('No se pudo eliminar el ítem. Intentá nuevamente.');
      } finally {
        mutationBusy = false;
      }
    }, true);
  }

  function installTabRefresh() {
    document.querySelectorAll('.archivo-tab').forEach((tab) => {
      if (tab.dataset.archivoV29 === '1') return;
      tab.dataset.archivoV29 = '1';
      tab.addEventListener('click', () => setTimeout(renderArchivoV29, 0));
    });
  }

  function install() {
    ensureStatusUI();
    installSharedArchiveGuard();
    installRenderOverride();
    installFormHandler();
    installItemActions();
    installTabRefresh();
    refreshFromServer({ force: true });

    setInterval(() => {
      if (document.visibilityState === 'visible') refreshFromServer();
    }, 4000);

    window.addEventListener('online', () => refreshFromServer({ force: true }));
    console.info(`Safari Archivo ${VERSION} activo`);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
