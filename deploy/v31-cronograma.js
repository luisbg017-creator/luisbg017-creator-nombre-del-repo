(() => {
  'use strict';
  if (window.__SAFARI_CRONOGRAMA_V31_READY__) return;
  window.__SAFARI_CRONOGRAMA_V31_READY__ = true;

  const SUPABASE_URL = 'https://sqxcygylcxlsigcmawma.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_SdZBbhB1onHQHFB-XFX3PQ_rsfgL7Af';
  const TABLE = 'safari_schedule_events';

  let rows = [];
  let polling = false;
  let mutationBusy = false;
  let editingId = null;
  let lastSignature = '';

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

  function currentStaffName() {
    try {
      const id = localStorage.getItem('legacyCurrentStaffV1');
      if (typeof staffProfiles !== 'undefined' && Array.isArray(staffProfiles)) {
        return staffProfiles.find((profile) => profile.id === id)?.name || 'Staff';
      }
    } catch (error) {}
    return 'Staff';
  }

  function signature(value) {
    try {
      return JSON.stringify((value || []).map((row) => [
        row.id, row.day_number, row.day_label, row.time_label,
        row.title, row.detail, row.updated_at, row.sort_order
      ]));
    } catch (error) {
      return '';
    }
  }

  function installStyles() {
    if ($('cronogramaV31Styles')) return;
    const style = document.createElement('style');
    style.id = 'cronogramaV31Styles';
    style.textContent = `
      .schedule-intro { gap: 12px; flex-wrap: wrap; }
      .schedule-tools-v31 { margin-left: auto; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
      .schedule-add-v31 {
        border: 1px solid #050505; background: #050505; color: #fff;
        min-height: 38px; padding: 0 14px; font-size: .52rem; font-weight: 800;
        letter-spacing: .13em; cursor: pointer;
      }
      .schedule-sync-v31 { color: #777; font-size: .48rem; letter-spacing: .12em; white-space: nowrap; }
      .schedule-event { position: relative; }
      .schedule-event-actions-v31 {
        display: flex; gap: 6px; align-items: center; justify-content: flex-end;
        grid-column: 1 / -1; margin-top: 8px;
      }
      .schedule-event-actions-v31 button {
        border: 1px solid rgba(0,0,0,.26); background: transparent; color: inherit;
        min-height: 30px; padding: 0 10px; font-size: .46rem; font-weight: 800;
        letter-spacing: .1em; cursor: pointer;
      }
      .schedule-event:hover .schedule-event-actions-v31 button { border-color: rgba(255,255,255,.35); }
      .schedule-event-actions-v31 .schedule-delete-v31:hover { background: #8f2424; color: #fff; border-color: #8f2424; }
      .schedule-created-v31 { display: block; margin-top: 5px; color: #8b8b85; font-size: .45rem; letter-spacing: .1em; }
      .schedule-event:hover .schedule-created-v31 { color: #aaa; }

      .schedule-editor-v31 {
        position: fixed; inset: 0; z-index: 2400; display: none; place-items: center;
        padding: 18px; background: rgba(0,0,0,.78); backdrop-filter: blur(8px);
      }
      .schedule-editor-v31.open { display: grid; }
      .schedule-editor-card-v31 {
        width: min(620px, 100%); max-height: min(88vh, 760px); overflow: auto;
        background: #f2f2ee; color: #050505; border: 1px solid #050505;
        box-shadow: 0 30px 110px rgba(0,0,0,.55);
      }
      .schedule-editor-head-v31 {
        display: flex; align-items: center; justify-content: space-between; gap: 16px;
        padding: 18px 20px; border-bottom: 1px solid rgba(0,0,0,.18);
      }
      .schedule-editor-head-v31 p { font-size: .5rem; letter-spacing: .16em; color: #777; margin-bottom: 4px; }
      .schedule-editor-head-v31 h5 { font-size: 1.25rem; font-family: 'Space Grotesk', sans-serif; }
      .schedule-editor-close-v31 { border: 0; background: transparent; font-size: 1.7rem; cursor: pointer; }
      .schedule-editor-form-v31 { display: grid; gap: 14px; padding: 20px; }
      .schedule-editor-form-v31 label { display: grid; gap: 7px; }
      .schedule-editor-form-v31 label span { font-size: .49rem; font-weight: 800; letter-spacing: .13em; }
      .schedule-editor-form-v31 input,
      .schedule-editor-form-v31 textarea {
        width: 100%; border: 1px solid rgba(0,0,0,.28); background: #fff; color: #050505;
        padding: 12px; font: inherit; outline: none;
      }
      .schedule-editor-form-v31 input:focus,
      .schedule-editor-form-v31 textarea:focus { border-color: #050505; }
      .schedule-editor-grid-v31 { display: grid; grid-template-columns: .7fr 1.3fr; gap: 12px; }
      .schedule-editor-actions-v31 { display: flex; justify-content: flex-end; gap: 8px; padding-top: 4px; }
      .schedule-editor-actions-v31 button {
        min-height: 42px; padding: 0 15px; border: 1px solid #050505;
        font-size: .5rem; font-weight: 800; letter-spacing: .12em; cursor: pointer;
      }
      .schedule-editor-actions-v31 .cancel { background: transparent; color: #050505; }
      .schedule-editor-actions-v31 .save { background: #050505; color: #fff; }
      .schedule-empty-v31 {
        margin: 25px 0; padding: 38px 20px; text-align: center; border: 1px dashed rgba(0,0,0,.2);
        color: #777; font-size: .58rem; letter-spacing: .13em;
      }
      @media (max-width: 700px) {
        .schedule-tools-v31 { width: 100%; margin-left: 0; justify-content: space-between; }
        .schedule-add-v31 { flex: 1; }
        .schedule-event { grid-template-columns: 82px 1fr; }
        .schedule-event-actions-v31 { justify-content: stretch; }
        .schedule-event-actions-v31 button { flex: 1; min-height: 36px; }
        .schedule-editor-grid-v31 { grid-template-columns: 1fr; }
        .schedule-editor-actions-v31 { display: grid; grid-template-columns: 1fr 1fr; }
      }
    `;
    document.head.appendChild(style);
  }

  function ensureTools() {
    const intro = document.querySelector('#cronogramaModal .schedule-intro');
    if (!intro || $('scheduleToolsV31')) return;

    const tools = document.createElement('div');
    tools.id = 'scheduleToolsV31';
    tools.className = 'schedule-tools-v31';
    tools.innerHTML = `
      <span class="schedule-sync-v31" id="scheduleSyncV31">SINCRONIZANDO…</span>
      <button class="schedule-add-v31" id="scheduleAddV31" type="button">+ AÑADIR EVENTO</button>
    `;
    intro.appendChild(tools);
    $('scheduleAddV31')?.addEventListener('click', () => openEditor());
  }

  function ensureEditor() {
    if ($('scheduleEditorV31')) return;
    const modal = document.createElement('div');
    modal.id = 'scheduleEditorV31';
    modal.className = 'schedule-editor-v31';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <section class="schedule-editor-card-v31" role="dialog" aria-modal="true" aria-labelledby="scheduleEditorTitleV31">
        <header class="schedule-editor-head-v31">
          <div>
            <p id="scheduleEditorModeV31">NUEVO EVENTO</p>
            <h5 id="scheduleEditorTitleV31">CRONOGRAMA</h5>
          </div>
          <button class="schedule-editor-close-v31" id="scheduleEditorCloseV31" type="button" aria-label="Cerrar">×</button>
        </header>
        <form class="schedule-editor-form-v31" id="scheduleEditorFormV31">
          <div class="schedule-editor-grid-v31">
            <label><span>DÍA</span><input id="scheduleDayV31" type="number" min="1" max="31" required></label>
            <label><span>NOMBRE DEL DÍA</span><input id="scheduleDayLabelV31" type="text" maxlength="20" placeholder="Ej.: SÁBADO" required></label>
          </div>
          <label><span>HORA / FRANJA</span><input id="scheduleTimeV31" type="text" maxlength="40" placeholder="Ej.: 15:30–18:00" required></label>
          <label><span>TÍTULO</span><input id="scheduleTitleV31" type="text" maxlength="140" required></label>
          <label><span>DETALLE / NOTAS</span><textarea id="scheduleDetailV31" rows="4" maxlength="420" placeholder="Detalle opcional"></textarea></label>
          <div class="schedule-editor-actions-v31">
            <button class="cancel" id="scheduleEditorCancelV31" type="button">CANCELAR</button>
            <button class="save" type="submit">GUARDAR</button>
          </div>
        </form>
      </section>
    `;
    document.body.appendChild(modal);

    $('scheduleEditorCloseV31')?.addEventListener('click', closeEditor);
    $('scheduleEditorCancelV31')?.addEventListener('click', closeEditor);
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeEditor();
    });
    $('scheduleEditorFormV31')?.addEventListener('submit', saveEditor, true);
  }

  function setSync(text) {
    ensureTools();
    const el = $('scheduleSyncV31');
    if (el) el.textContent = text;
  }

  function groupRows() {
    const groups = new Map();
    for (const row of rows) {
      const key = `${row.day_number}|${row.day_label}`;
      if (!groups.has(key)) groups.set(key, {
        dayNumber: Number(row.day_number),
        dayLabel: String(row.day_label || ''),
        events: []
      });
      groups.get(key).events.push(row);
    }
    return [...groups.values()].sort((a, b) => a.dayNumber - b.dayNumber || a.dayLabel.localeCompare(b.dayLabel));
  }

  function render() {
    const host = document.querySelector('#cronogramaModal .schedule-days');
    if (!host) return;
    const groups = groupRows();

    if (!groups.length) {
      host.innerHTML = '<div class="schedule-empty-v31">NO HAY EVENTOS · USÁ “AÑADIR EVENTO” PARA CREAR EL PRIMERO.</div>';
      return;
    }

    host.innerHTML = groups.map((group) => `
      <section class="schedule-day">
        <div class="schedule-date">
          <strong>${String(group.dayNumber).padStart(2, '0')}</strong>
          <span>${escapeHTML(group.dayLabel)}</span>
        </div>
        <div class="schedule-events">
          ${group.events.map((row) => `
            <article class="schedule-event" data-schedule-id="${escapeHTML(row.id)}">
              <time>${escapeHTML(row.time_label || '—')}</time>
              <div>
                <h5>${escapeHTML(row.title)}</h5>
                ${row.detail ? `<p>${escapeHTML(row.detail)}</p>` : ''}
                ${row.created_by ? `<small class="schedule-created-v31">AÑADIDO POR ${escapeHTML(row.created_by)}</small>` : ''}
              </div>
              <div class="schedule-event-actions-v31">
                <button type="button" data-action="edit" data-id="${escapeHTML(row.id)}">EDITAR</button>
                <button type="button" class="schedule-delete-v31" data-action="delete" data-id="${escapeHTML(row.id)}">QUITAR</button>
              </div>
            </article>
          `).join('')}
        </div>
      </section>
    `).join('');
  }

  async function fetchRows() {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/${TABLE}?select=id,day_number,day_label,time_label,title,detail,created_by,created_at,updated_at,sort_order&order=day_number.asc,sort_order.asc,created_at.asc`,
      { headers: headers(), cache: 'no-store' }
    );
    if (!response.ok) throw new Error(`Supabase ${response.status}`);
    return response.json();
  }

  async function refresh({ force = false } = {}) {
    if (polling || mutationBusy) return;
    polling = true;
    try {
      const next = await fetchRows();
      const nextSignature = signature(next);
      if (force || nextSignature !== lastSignature) {
        rows = Array.isArray(next) ? next : [];
        lastSignature = nextSignature;
        render();
      }
      setSync('SINCRONIZADO · ' + new Date().toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' }));
    } catch (error) {
      console.warn('Safari Cronograma V31 sync:', error);
      setSync('SIN CONEXIÓN · REINTENTANDO');
    } finally {
      polling = false;
    }
  }

  function newId() {
    if (crypto?.randomUUID) return `schedule-${crypto.randomUUID()}`;
    return `schedule-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function openEditor(id = null) {
    ensureEditor();
    editingId = id;
    const row = id ? rows.find((item) => String(item.id) === String(id)) : null;
    $('scheduleEditorModeV31').textContent = row ? 'EDITAR EVENTO' : 'NUEVO EVENTO';
    $('scheduleDayV31').value = row?.day_number ?? '';
    $('scheduleDayLabelV31').value = row?.day_label ?? '';
    $('scheduleTimeV31').value = row?.time_label ?? '';
    $('scheduleTitleV31').value = row?.title ?? '';
    $('scheduleDetailV31').value = row?.detail ?? '';
    const modal = $('scheduleEditorV31');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    setTimeout(() => $('scheduleDayV31')?.focus(), 50);
  }

  function closeEditor() {
    editingId = null;
    const modal = $('scheduleEditorV31');
    modal?.classList.remove('open');
    modal?.setAttribute('aria-hidden', 'true');
    $('scheduleEditorFormV31')?.reset();
  }

  async function saveEditor(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (mutationBusy) return;

    const dayNumber = Number($('scheduleDayV31')?.value);
    const dayLabel = $('scheduleDayLabelV31')?.value.trim().toUpperCase() || '';
    const timeLabel = $('scheduleTimeV31')?.value.trim() || '';
    const title = $('scheduleTitleV31')?.value.trim() || '';
    const detail = $('scheduleDetailV31')?.value.trim() || '';
    if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > 31 || !dayLabel || !timeLabel || !title) return;

    const form = $('scheduleEditorFormV31');
    const save = form?.querySelector('button[type="submit"]');
    mutationBusy = true;
    if (save) { save.disabled = true; save.textContent = 'GUARDANDO…'; }
    setSync('GUARDANDO…');

    try {
      const now = new Date().toISOString();
      if (editingId) {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?id=eq.${encodeURIComponent(editingId)}`, {
          method: 'PATCH',
          headers: headers({ Prefer: 'return=minimal' }),
          body: JSON.stringify({
            day_number: dayNumber,
            day_label: dayLabel,
            time_label: timeLabel,
            title,
            detail,
            updated_at: now
          })
        });
        if (!response.ok) throw new Error(`Supabase ${response.status}`);
      } else {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
          method: 'POST',
          headers: headers({ Prefer: 'return=minimal' }),
          body: JSON.stringify({
            id: newId(),
            day_number: dayNumber,
            day_label: dayLabel,
            time_label: timeLabel,
            title,
            detail,
            created_by: currentStaffName(),
            created_at: now,
            updated_at: now,
            sort_order: Date.now()
          })
        });
        if (!response.ok) throw new Error(`Supabase ${response.status}`);
      }

      closeEditor();
      mutationBusy = false;
      await refresh({ force: true });
      setSync('GUARDADO Y SINCRONIZADO');
    } catch (error) {
      console.error('Safari Cronograma V31 save:', error);
      setSync('NO SE PUDO GUARDAR');
      alert('No se pudo guardar el evento. Revisá la conexión e intentá nuevamente.');
    } finally {
      mutationBusy = false;
      if (save) { save.disabled = false; save.textContent = 'GUARDAR'; }
    }
  }

  async function deleteRow(id) {
    if (mutationBusy) return;
    const row = rows.find((item) => String(item.id) === String(id));
    if (!row) return;
    const ok = confirm(`¿Quitar “${row.title}” del cronograma?`);
    if (!ok) return;

    mutationBusy = true;
    setSync('ELIMINANDO…');
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?id=eq.${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: headers({ Prefer: 'return=minimal' })
      });
      if (!response.ok) throw new Error(`Supabase ${response.status}`);
      mutationBusy = false;
      await refresh({ force: true });
      setSync('CAMBIO SINCRONIZADO');
    } catch (error) {
      console.error('Safari Cronograma V31 delete:', error);
      setSync('NO SE PUDO ELIMINAR');
      alert('No se pudo quitar el evento. Intentá nuevamente.');
    } finally {
      mutationBusy = false;
    }
  }

  function installActions() {
    const host = document.querySelector('#cronogramaModal .schedule-days');
    if (!host || host.dataset.v31Actions === '1') return;
    host.dataset.v31Actions = '1';
    host.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-action][data-id]');
      if (!button) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const id = button.dataset.id;
      if (button.dataset.action === 'edit') openEditor(id);
      if (button.dataset.action === 'delete') deleteRow(id);
    }, true);
  }

  function boot() {
    installStyles();
    ensureTools();
    ensureEditor();
    installActions();
    refresh({ force: true });
    setInterval(() => refresh(), 4500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
