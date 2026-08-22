(() => {
  'use strict';
  if (window.__SAFARI_MOVE_ITEM_V35_READY__) return;
  window.__SAFARI_MOVE_ITEM_V35_READY__ = true;

  const SUPABASE_URL = 'https://sqxcygylcxlsigcmawma.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_SdZBbhB1onHQHFB-XFX3PQ_rsfgL7Af';
  const TABLE = 'safari_archive_items';
  const CATEGORIES = ['fotos', 'videos', 'tiktoks', 'averigua', 'traer', 'audios'];
  const LABELS = {
    fotos: 'FOTOS',
    videos: 'VIDEOS',
    tiktoks: 'TIKTOKS',
    averigua: 'AVERIGUA',
    traer: 'TRAER',
    audios: 'AUDIOS'
  };

  let moving = false;
  let selectedId = null;
  let sourceCategory = null;

  function currentCategory() {
    return document.querySelector('.archivo-tab.active')?.dataset.category || 'fotos';
  }

  function archiveState() {
    try { return archivoData; }
    catch (error) { return null; }
  }

  function escapeHTML(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function setArchiveStatus(text, mode = 'ok') {
    const el = document.getElementById('archivoSyncStatusV33');
    if (!el) return;
    el.classList.toggle('saving', mode === 'saving');
    el.classList.toggle('error', mode === 'error');
    const strong = el.querySelector('strong');
    if (strong) strong.textContent = text;
  }

  function ensureMoveModal() {
    if (document.getElementById('archivoMoveModalV35')) return;
    const wrap = document.createElement('div');
    wrap.id = 'archivoMoveModalV35';
    wrap.className = 'archivo-move-modal-v35';
    wrap.setAttribute('aria-hidden', 'true');
    wrap.innerHTML = `
      <div class="archivo-move-backdrop-v35" data-move-close="1"></div>
      <section class="archivo-move-window-v35" role="dialog" aria-modal="true" aria-labelledby="archivoMoveTitleV35">
        <header class="archivo-move-header-v35">
          <div>
            <small>MOVER ÍTEM</small>
            <h4 id="archivoMoveTitleV35">¿A DÓNDE QUERÉS MOVERLO?</h4>
          </div>
          <button type="button" class="archivo-move-close-v35" data-move-close="1" aria-label="Cerrar">×</button>
        </header>
        <div class="archivo-move-body-v35">
          <div class="archivo-move-summary-v35">
            <span>ÍTEM</span>
            <strong id="archivoMoveItemNameV35">—</strong>
            <small id="archivoMoveFromV35">—</small>
          </div>
          <p class="archivo-move-question-v35">Elegí la carpeta de destino:</p>
          <div class="archivo-move-destinations-v35" id="archivoMoveDestinationsV35"></div>
          <p class="archivo-move-help-v35">El contenido y el nombre del Staff que lo añadió se conservan.</p>
        </div>
      </section>`;
    document.body.appendChild(wrap);
  }

  function closeMoveModal() {
    if (moving) return;
    const modal = document.getElementById('archivoMoveModalV35');
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('archivo-move-open-v35');
    selectedId = null;
    sourceCategory = null;
  }

  function openMoveModal(id, row) {
    ensureMoveModal();
    selectedId = String(id || '');
    sourceCategory = currentCategory();
    if (!selectedId || !CATEGORIES.includes(sourceCategory)) return;

    const itemName = row?.querySelector('h6')?.textContent?.trim() || 'Ítem sin título';
    const modal = document.getElementById('archivoMoveModalV35');
    const name = document.getElementById('archivoMoveItemNameV35');
    const from = document.getElementById('archivoMoveFromV35');
    const host = document.getElementById('archivoMoveDestinationsV35');

    if (name) name.textContent = itemName;
    if (from) from.textContent = `AHORA ESTÁ EN · ${LABELS[sourceCategory] || sourceCategory.toUpperCase()}`;
    if (host) {
      host.innerHTML = CATEGORIES
        .filter((category) => category !== sourceCategory)
        .map((category) => `
          <button type="button" class="archivo-move-destination-v35" data-move-target="${category}">
            <span>${LABELS[category]}</span>
            <b>→</b>
          </button>`).join('');
    }

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('archivo-move-open-v35');
  }

  async function syncLegacyArchive() {
    const data = archiveState();
    if (!data) return;
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/safari_shared_sections?on_conflict=section`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates,return=minimal'
        },
        body: JSON.stringify({
          section: 'archivo',
          data,
          updated_at: new Date().toISOString()
        })
      });
    } catch (error) {
      console.warn('Safari Move V35 legacy sync:', error);
    }
  }

  function updateLocalArchive(id, from, to, updatedAt) {
    const data = archiveState();
    if (!data) return;
    if (!Array.isArray(data[from])) data[from] = [];
    if (!Array.isArray(data[to])) data[to] = [];

    const index = data[from].findIndex((item) => String(item.id) === String(id));
    if (index < 0) return;
    const [item] = data[from].splice(index, 1);
    item.updatedAt = updatedAt;
    data[to].unshift(item);

    try { localStorage.setItem('legacyArchivoDataV2', JSON.stringify(data)); }
    catch (error) {}

    try { window.renderArchivo?.(); }
    catch (error) { console.warn('Safari Move V35 render:', error); }
  }

  async function moveItem(targetCategory, button) {
    if (moving || !selectedId || !sourceCategory) return;
    if (!CATEGORIES.includes(targetCategory) || targetCategory === sourceCategory) return;

    moving = true;
    const originalText = button?.innerHTML;
    document.querySelectorAll('.archivo-move-destination-v35').forEach((btn) => { btn.disabled = true; });
    if (button) button.innerHTML = '<span>MOVIENDO…</span><b>↻</b>';
    setArchiveStatus('MOVIENDO ÍTEM…', 'saving');

    const now = new Date().toISOString();
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?id=eq.${encodeURIComponent(selectedId)}`, {
        method: 'PATCH',
        headers: {
          apikey: SUPABASE_KEY,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        },
        body: JSON.stringify({ category: targetCategory, updated_at: now })
      });
      if (!response.ok) throw new Error(`Supabase ${response.status}`);

      const movedId = selectedId;
      const movedFrom = sourceCategory;
      updateLocalArchive(movedId, movedFrom, targetCategory, now);
      await syncLegacyArchive();

      moving = false;
      closeMoveModal();
      setArchiveStatus(`MOVIDO A ${LABELS[targetCategory]}`, 'ok');
      setTimeout(() => {
        const status = document.querySelector('#archivoSyncStatusV33 strong');
        if (status && status.textContent.startsWith('MOVIDO A ')) status.textContent = 'SINCRONIZADO';
      }, 1800);
    } catch (error) {
      console.error('Safari Move V35:', error);
      moving = false;
      document.querySelectorAll('.archivo-move-destination-v35').forEach((btn) => { btn.disabled = false; });
      if (button && originalText != null) button.innerHTML = originalText;
      setArchiveStatus('NO SE PUDO MOVER EL ÍTEM', 'error');
      alert('No se pudo mover el ítem. Revisá la conexión e intentá nuevamente.');
    }
  }

  function injectMoveButtons() {
    document.querySelectorAll('#archivoItems .archivo-item').forEach((row) => {
      const actions = row.querySelector('.archivo-item-actions');
      if (!actions || actions.querySelector('.archivo-move-btn')) return;
      const id = row.dataset.id;
      if (!id) return;

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'archivo-move-btn';
      button.dataset.moveId = id;
      button.textContent = 'MOVER ÍTEM';

      const deleteButton = actions.querySelector('.archivo-delete-btn');
      if (deleteButton) actions.insertBefore(button, deleteButton);
      else actions.appendChild(button);
    });
  }

  function install() {
    ensureMoveModal();
    injectMoveButtons();

    const host = document.getElementById('archivoItems');
    if (host) {
      const observer = new MutationObserver(() => queueMicrotask(injectMoveButtons));
      observer.observe(host, { childList: true, subtree: true });
    }

    document.addEventListener('click', (event) => {
      const moveButton = event.target.closest('.archivo-move-btn');
      if (moveButton) {
        event.preventDefault();
        event.stopImmediatePropagation();
        const row = moveButton.closest('.archivo-item');
        openMoveModal(moveButton.dataset.moveId || row?.dataset.id, row);
        return;
      }

      const close = event.target.closest('[data-move-close="1"]');
      if (close) {
        event.preventDefault();
        closeMoveModal();
        return;
      }

      const destination = event.target.closest('.archivo-move-destination-v35');
      if (destination) {
        event.preventDefault();
        moveItem(destination.dataset.moveTarget, destination);
      }
    }, true);

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && document.getElementById('archivoMoveModalV35')?.classList.contains('open')) {
        closeMoveModal();
      }
    });

    setInterval(injectMoveButtons, 2500);
    console.info('Safari Move Item V35 activo');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
