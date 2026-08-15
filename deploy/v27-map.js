(function () {
  "use strict";
  if (window.__SAFARI_MAP_V16_READY__) return;

  const oldModal = document.getElementById("mapModal");
  const oldEditor = document.getElementById("mapPointEditorModal");
  const oldOpenButton = document.getElementById("openLegacyMap");

  if (!oldModal || !oldOpenButton) return;

  const holder = document.createElement("div");
  holder.innerHTML = "<div class=\"map-modal\" id=\"mapModal\" aria-hidden=\"true\">\n      <div class=\"map-backdrop\" id=\"mapBackdrop\"></div>\n\n      <section class=\"map-window map-window-v16\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"mapTitle\">\n        <header class=\"map-header map-header-v16\">\n          <div>\n            <p>SAFARI 2026 \u00b7 LEGACY</p>\n            <h4 id=\"mapTitle\">MAPA DE OPERACIONES</h4>\n          </div>\n\n          <div class=\"map-header-status\">\n            <span class=\"map-online-dot\"></span>\n            <span class=\"map-header-sync\">COMPARTIDO</span>\n            <button id=\"closeLegacyMap\" aria-label=\"Cerrar mapa\">\u00d7</button>\n          </div>\n        </header>\n\n        <div class=\"map-layout map-layout-v16\">\n          <div class=\"map-canvas-wrap map-canvas-wrap-v16\">\n            <div id=\"legacyMap\" class=\"legacy-map legacy-map-v16\" aria-label=\"Mapa compartido del staff\"></div>\n\n            <div class=\"map-floating-actions\" id=\"mapFloatingActions\" role=\"toolbar\" aria-label=\"Acciones del mapa\">\n              <button id=\"addMapPoint\" class=\"map-fab map-fab-primary\" type=\"button\" aria-pressed=\"false\">\n                <span class=\"map-fab-icon\">\uff0b</span>\n                <span class=\"map-fab-copy\">\n                  <strong>PUNTO</strong>\n                  <small>A\u00f1adir referencia</small>\n                </span>\n              </button>\n\n              <button id=\"startMapRoute\" class=\"map-fab map-fab-primary\" type=\"button\" aria-pressed=\"false\">\n                <span class=\"map-fab-icon\">\u219d</span>\n                <span class=\"map-fab-copy\">\n                  <strong>RUTA</strong>\n                  <small>Trazar por calles</small>\n                </span>\n              </button>\n\n              <button id=\"locateMapUser\" class=\"map-fab map-fab-secondary\" type=\"button\">\n                <span class=\"map-fab-icon\">\u25ce</span>\n                <span class=\"map-fab-copy\">\n                  <strong>UBICACI\u00d3N</strong>\n                  <small>Centrar mapa</small>\n                </span>\n              </button>\n\n              <button id=\"mapSidebarToggle\" class=\"map-fab map-fab-secondary map-list-toggle\" type=\"button\" aria-expanded=\"false\">\n                <span class=\"map-fab-icon\">\u2630</span>\n                <span class=\"map-fab-copy\">\n                  <strong>LISTAS</strong>\n                  <small>Puntos y rutas</small>\n                </span>\n              </button>\n            </div>\n\n            <div class=\"map-action-hint\" id=\"mapActionHint\" aria-live=\"polite\">\n              <span class=\"map-action-hint-dot\"></span>\n              <div>\n                <strong id=\"mapActionHintTitle\">MAPA LISTO</strong>\n                <small id=\"mapActionHintText\">Eleg\u00ed PUNTO o RUTA para empezar.</small>\n              </div>\n            </div>\n\n            <section class=\"route-floating-panel\" id=\"routeComposer\" aria-hidden=\"true\">\n              <header class=\"route-floating-head\">\n                <div>\n                  <span id=\"routeStopsSummary\">0 PARADAS</span>\n                  <strong id=\"routeStats\">MARC\u00c1 DOS LUGARES</strong>\n                </div>\n                <button id=\"cancelMapMode\" type=\"button\" aria-label=\"Salir del modo ruta\">\u00d7</button>\n              </header>\n\n              <input\n                id=\"routeNameInput\"\n                type=\"text\"\n                maxlength=\"60\"\n                placeholder=\"Nombre de la ruta\"\n                aria-label=\"Nombre de la ruta\"\n              />\n\n              <div class=\"route-floating-actions\">\n                <button id=\"undoMapRoute\" type=\"button\" disabled>\u21b6 \u00daLTIMO</button>\n                <button id=\"clearMapRoute\" type=\"button\" disabled>LIMPIAR</button>\n                <button id=\"saveMapRoute\" class=\"route-save-primary\" type=\"button\" disabled>GUARDAR RUTA</button>\n              </div>\n            </section>\n\n            <div class=\"map-load-error\" id=\"mapLoadError\">\n              <strong>NO SE PUDO CARGAR EL MAPA</strong>\n              <span>Revis\u00e1 la conexi\u00f3n y volv\u00e9 a abrir este apartado.</span>\n            </div>\n          </div>\n\n          <aside class=\"map-sidebar map-sidebar-v16\" id=\"mapSidebar\">\n            <div class=\"map-sidebar-mobile-grab\" aria-hidden=\"true\"></div>\n\n            <header class=\"map-sidebar-mobile-head\">\n              <strong>PUNTOS Y RUTAS</strong>\n              <button id=\"closeMapSidebarMobile\" type=\"button\">CERRAR</button>\n            </header>\n\n            <section class=\"map-draft-section\" id=\"mapDraftSection\" hidden>\n              <div class=\"map-sidebar-head\">\n                <span>PARADAS DE LA RUTA</span>\n                <strong id=\"mapDraftStopsCount\">0</strong>\n              </div>\n              <div id=\"mapDraftStopsList\" class=\"map-object-list\"></div>\n            </section>\n\n            <section>\n              <div class=\"map-sidebar-head\">\n                <span>PUNTOS DE REFERENCIA</span>\n                <strong id=\"mapPointsCount\">0</strong>\n              </div>\n              <div id=\"mapPointsList\" class=\"map-object-list\"></div>\n            </section>\n\n            <section>\n              <div class=\"map-sidebar-head\">\n                <span>RUTAS GUARDADAS</span>\n                <strong id=\"mapRoutesCount\">0</strong>\n              </div>\n              <div id=\"mapRoutesList\" class=\"map-object-list\"></div>\n            </section>\n          </aside>\n        </div>\n\n        <footer class=\"map-footer map-footer-v16\">\n          <span>OPENSTREETMAP \u00b7 RUTAS SOBRE CALLES</span>\n          <span id=\"mapSyncLabel\">SINCRONIZADO CON STAFF</span>\n        </footer>\n      </section>\n    </div>\n\n    <div class=\"map-point-editor-modal\" id=\"mapPointEditorModal\" aria-hidden=\"true\">\n      <div class=\"map-point-editor-backdrop\" id=\"mapPointEditorBackdrop\"></div>\n      <section class=\"map-point-editor-window map-point-editor-window-v16\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"mapPointEditorTitle\">\n        <header>\n          <div>\n            <p id=\"mapPointEditorMode\">NUEVO PUNTO</p>\n            <h4 id=\"mapPointEditorTitle\">REFERENCIA</h4>\n          </div>\n          <button id=\"closeMapPointEditor\" aria-label=\"Cerrar editor\">\u00d7</button>\n        </header>\n\n        <form id=\"mapPointEditorForm\">\n          <label>\n            <span>NOMBRE DEL PUNTO</span>\n            <input id=\"mapPointNameInput\" type=\"text\" maxlength=\"70\" placeholder=\"Ej.: Casa de Bola\u00f1os\" required />\n          </label>\n\n          <div class=\"map-coords-preview\">\n            <span>UBICACI\u00d3N</span>\n            <strong id=\"mapPointCoordsPreview\">--</strong>\n          </div>\n\n          <div class=\"map-added-by-preview\">\n            <span>SE GUARDAR\u00c1 COMO</span>\n            <strong id=\"mapPointAddedByPreview\">STAFF</strong>\n          </div>\n\n          <p class=\"map-point-help\">Este punto ser\u00e1 visible para todo el staff.</p>\n\n          <div class=\"map-point-editor-actions\">\n            <button type=\"button\" id=\"cancelMapPointEditor\">CANCELAR</button>\n            <button type=\"submit\">GUARDAR PUNTO</button>\n          </div>\n        </form>\n      </section>\n    </div>";

  const freshModal = holder.querySelector("#mapModal");
  const freshEditor = holder.querySelector("#mapPointEditorModal");

  oldModal.parentNode.insertBefore(freshModal, oldModal);

  if (oldEditor) {
    oldEditor.parentNode.insertBefore(freshEditor, oldEditor);
    oldEditor.remove();
  } else {
    freshModal.parentNode.insertBefore(freshEditor, freshModal.nextSibling);
  }

  oldModal.remove();

  // Remove old map click listeners (V13/V15) from the dashboard card.
  const freshOpenButton = oldOpenButton.cloneNode(true);
  oldOpenButton.replaceWith(freshOpenButton);

// =========================
// MAPA COMPARTIDO · V16
// Controles flotantes + mobile bottom sheet + autor visible
// =========================
const MAP_STORAGE_KEY = "legacyMapDataV1";
const OSRM_ROUTE_BASE = "https://router.project-osrm.org/route/v1/driving";

const openLegacyMap = document.getElementById("openLegacyMap");
const mapModal = document.getElementById("mapModal");
const mapBackdrop = document.getElementById("mapBackdrop");
const closeLegacyMap = document.getElementById("closeLegacyMap");
const legacyMapEl = document.getElementById("legacyMap");
const mapLoadError = document.getElementById("mapLoadError");
const mapSyncLabel = document.getElementById("mapSyncLabel");

const addMapPoint = document.getElementById("addMapPoint");
const startMapRoute = document.getElementById("startMapRoute");
const locateMapUser = document.getElementById("locateMapUser");
const mapSidebarToggle = document.getElementById("mapSidebarToggle");
const closeMapSidebarMobile = document.getElementById("closeMapSidebarMobile");
const mapSidebar = document.getElementById("mapSidebar");

const mapActionHint = document.getElementById("mapActionHint");
const mapActionHintTitle = document.getElementById("mapActionHintTitle");
const mapActionHintText = document.getElementById("mapActionHintText");

const undoMapRoute = document.getElementById("undoMapRoute");
const clearMapRoute = document.getElementById("clearMapRoute");
const cancelMapMode = document.getElementById("cancelMapMode");
const saveMapRoute = document.getElementById("saveMapRoute");
const routeComposer = document.getElementById("routeComposer");
const routeNameInput = document.getElementById("routeNameInput");
const routeStopsSummary = document.getElementById("routeStopsSummary");
const routeStats = document.getElementById("routeStats");

const mapDraftSection = document.getElementById("mapDraftSection");
const mapDraftStopsList = document.getElementById("mapDraftStopsList");
const mapDraftStopsCount = document.getElementById("mapDraftStopsCount");
const mapPointsList = document.getElementById("mapPointsList");
const mapRoutesList = document.getElementById("mapRoutesList");
const mapPointsCount = document.getElementById("mapPointsCount");
const mapRoutesCount = document.getElementById("mapRoutesCount");

const mapPointEditorModal = document.getElementById("mapPointEditorModal");
const mapPointEditorBackdrop = document.getElementById("mapPointEditorBackdrop");
const mapPointEditorForm = document.getElementById("mapPointEditorForm");
const mapPointEditorMode = document.getElementById("mapPointEditorMode");
const mapPointNameInput = document.getElementById("mapPointNameInput");
const mapPointCoordsPreview = document.getElementById("mapPointCoordsPreview");
const mapPointAddedByPreview = document.getElementById("mapPointAddedByPreview");
const closeMapPointEditor = document.getElementById("closeMapPointEditor");
const cancelMapPointEditor = document.getElementById("cancelMapPointEditor");

let v16MapData = loadMapData();

let legacyMapInstance = null;
let mapTileLayer = null;
let mapPointsLayer = null;
let mapRoutesLayer = null;
let mapUserLayer = null;
let mapDraftRouteLayer = null;
let mapDraftGuideLayer = null;
let mapDraftWaypointLayer = null;

let mapMode = "explore"; // explore | point | route
let pendingPointCoords = null;
let editingMapPointId = null;

let draftRouteWaypoints = [];
let draftRouteGeometry = [];
let draftRouteDistance = 0;
let draftRouteDuration = 0;
let draftRouteIsValid = false;
let routeRequestController = null;
let routeRequestTimer = null;
let routeRequestSerial = 0;
let mapResizeTimer = null;

function normalizeMapData(value) {
  const safe = value && typeof value === "object" ? value : {};
  return {
    points: Array.isArray(safe.points) ? safe.points : [],
    routes: Array.isArray(safe.routes) ? safe.routes : []
  };
}

function loadMapData() {
  try {
    if (typeof mapData !== "undefined") {
      return normalizeMapData(mapData);
    }
  } catch (error) {}

  try {
    return normalizeMapData(JSON.parse(localStorage.getItem(MAP_STORAGE_KEY) || "null"));
  } catch (error) {
    return { points: [], routes: [] };
  }
}

function saveMapData() {
  localStorage.setItem(MAP_STORAGE_KEY, JSON.stringify(v16MapData));

  try {
    mapData = normalizeMapData(JSON.parse(JSON.stringify(v16MapData)));
  } catch (error) {
    console.warn("No se pudo copiar el mapa V16 al estado compartido:", error);
  }

  mapSyncLabel.textContent = "GUARDANDO PARA EL STAFF…";

  try {
    scheduleSharedSection("map");
  } catch (error) {
    console.warn("No se pudo programar la sincronización del mapa:", error);
  }

  setTimeout(() => {
    if (mapSyncLabel) mapSyncLabel.textContent = "SINCRONIZADO CON STAFF";
  }, 900);
}

function makeMapObjectId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getCurrentStaffDisplayName() {
  const currentId = localStorage.getItem(STAFF_SESSION_KEY);
  return staffProfiles.find(profile => profile.id === currentId)?.name || "Staff";
}

function authorLabel(value) {
  return value?.trim() || "Staff";
}

function formatDistance(meters) {
  const value = Number(meters) || 0;
  if (value < 1000) return `${Math.round(value)} m`;
  return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)} km`;
}

function formatDuration(seconds) {
  const mins = Math.max(1, Math.round((Number(seconds) || 0) / 60));
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const rest = mins % 60;
  return rest ? `${h} h ${rest} min` : `${h} h`;
}

function getRouteGeometry(route) {
  if (Array.isArray(route.geometry) && route.geometry.length >= 2) return route.geometry;
  if (Array.isArray(route.coordinates) && route.coordinates.length >= 2) return route.coordinates;
  return [];
}

function createReferenceIcon() {
  return L.divIcon({
    className: "",
    html: '<div class="legacy-reference-icon"></div>',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -10]
  });
}

function createRouteWaypointIcon(index) {
  const label = index === 0 ? "A" : String(index + 1);
  return L.divIcon({
    className: "",
    html: `<div class="legacy-route-waypoint">${label}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
}

function createUserLocationIcon() {
  return L.divIcon({
    className: "",
    html: '<div class="legacy-user-location"></div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
}

function setMapHint(kind, title, text, busy = false) {
  mapActionHint.classList.toggle("point", kind === "point");
  mapActionHint.classList.toggle("route", kind === "route");
  mapActionHint.classList.toggle("busy", busy);
  mapActionHintTitle.textContent = title;
  mapActionHintText.textContent = text;
}

function openMapSidebarMobile() {
  mapSidebar.classList.add("mobile-open");
  mapSidebarToggle.setAttribute("aria-expanded", "true");
}

function closeMapSidebarMobileFn() {
  mapSidebar.classList.remove("mobile-open");
  mapSidebarToggle.setAttribute("aria-expanded", "false");
}

function initLegacyMap() {
  if (legacyMapInstance || !legacyMapEl) return;

  if (!window.L) {
    mapLoadError.classList.add("visible");
    return;
  }

  try {
    legacyMapInstance = L.map("legacyMap", {
      preferCanvas: true,
      zoomControl: true,
      attributionControl: true,
      zoomAnimation: true,
      fadeAnimation: false,
      markerZoomAnimation: true,
      wheelDebounceTime: 35,
      wheelPxPerZoomLevel: 85,
      tap: true
    }).setView([-25.2867, -57.5759], 12);

    mapTileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      minZoom: 3,
      keepBuffer: 3,
      updateWhenIdle: true,
      updateWhenZooming: false,
      detectRetina: false,
      crossOrigin: true,
      attribution: "&copy; OpenStreetMap"
    }).addTo(legacyMapInstance);

    mapPointsLayer = L.layerGroup().addTo(legacyMapInstance);
    mapRoutesLayer = L.layerGroup().addTo(legacyMapInstance);
    mapDraftWaypointLayer = L.layerGroup().addTo(legacyMapInstance);
    mapUserLayer = L.layerGroup().addTo(legacyMapInstance);

    legacyMapInstance.on("click", handleLegacyMapClick);

    renderStoredMapLayers();
    renderMapSidebar();
    updateMapModeUI();

    setMapHint("explore", "MAPA LISTO", "Elegí PUNTO o RUTA para empezar.");
  } catch (error) {
    console.error("Error al iniciar Leaflet:", error);
    mapLoadError.classList.add("visible");
  }
}

function handleLegacyMapClick(event) {
  const lat = Number(event.latlng.lat.toFixed(6));
  const lng = Number(event.latlng.lng.toFixed(6));

  if (mapMode === "point") {
    pendingPointCoords = { lat, lng };
    openMapPointEditor();
    return;
  }

  if (mapMode === "route") {
    addDraftRouteWaypoint(lat, lng);
  }
}

function renderStoredMapLayers() {
  renderMapSidebar();

  if (!legacyMapInstance || !window.L || !mapPointsLayer || !mapRoutesLayer) return;

  mapPointsLayer.clearLayers();
  mapRoutesLayer.clearLayers();

  for (const route of v16MapData.routes) {
    const geometry = getRouteGeometry(route);
    if (geometry.length < 2) continue;

    const line = L.polyline(geometry, {
      color: "#111111",
      weight: 5,
      opacity: .76,
      lineCap: "round",
      lineJoin: "round",
      interactive: true
    }).addTo(mapRoutesLayer);

    const creator = authorLabel(route.createdBy);
    const meta = [
      route.distance ? formatDistance(route.distance) : "",
      route.duration ? formatDuration(route.duration) : ""
    ].filter(Boolean).join(" · ");

    line.bindPopup(
      `<div class="legacy-map-popup">` +
        `<strong>${escapeHtml(route.name || "Ruta")}</strong>` +
        (meta ? `<span>${escapeHtml(meta)}</span>` : "") +
        `<span class="added-by">Añadida por ${escapeHtml(creator)}</span>` +
      `</div>`
    );
  }

  for (const point of v16MapData.points) {
    const lat = Number(point.lat);
    const lng = Number(point.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

    const creator = authorLabel(point.createdBy);

    const marker = L.marker([lat, lng], {
      icon: createReferenceIcon(),
      keyboard: true,
      riseOnHover: true,
      title: `${point.name || "Punto"} · añadido por ${creator}`
    }).addTo(mapPointsLayer);

    marker.bindPopup(
      `<div class="legacy-map-popup">` +
        `<strong>${escapeHtml(point.name || "Punto")}</strong>` +
        `<span>${lat.toFixed(5)}, ${lng.toFixed(5)}</span>` +
        `<span class="added-by">Añadido por ${escapeHtml(creator)}</span>` +
      `</div>`
    );

    marker.bindTooltip(
      `${escapeHtml(point.name || "Punto")} · ${escapeHtml(creator)}`,
      {
        direction: "top",
        offset: [0, -10],
        opacity: .94
      }
    );
  }
}

function renderMapSidebar() {
  if (!mapPointsList || !mapRoutesList) return;

  mapPointsCount.textContent = String(v16MapData.points.length);
  mapRoutesCount.textContent = String(v16MapData.routes.length);

  mapPointsList.innerHTML = v16MapData.points.length
    ? v16MapData.points.map(point => `
        <article class="map-object-row map-object-row-v15">
          <div>
            <h6>${escapeHtml(point.name || "Punto")}</h6>
            <div class="map-object-meta">
              <em class="created-by">${escapeHtml(authorLabel(point.createdBy))}</em>
              <em>${Number(point.lat).toFixed(5)}, ${Number(point.lng).toFixed(5)}</em>
            </div>
          </div>

          <div class="map-object-actions">
            <button data-map-action="focus-point" data-id="${escapeHtml(point.id)}">VER</button>
            <button class="map-route-add-btn ${mapMode === "route" ? "active" : ""}" data-map-action="route-add-point" data-id="${escapeHtml(point.id)}">A RUTA</button>
            <button data-map-action="edit-point" data-id="${escapeHtml(point.id)}">EDITAR</button>
            <button data-map-action="delete-point" data-id="${escapeHtml(point.id)}">QUITAR</button>
          </div>
        </article>
      `).join("")
    : '<div class="map-object-empty">No hay puntos todavía. Usá el botón PUNTO que está sobre el mapa.</div>';

  mapRoutesList.innerHTML = v16MapData.routes.length
    ? v16MapData.routes.map(route => {
        const geometry = getRouteGeometry(route);
        const meta = [
          route.distance ? formatDistance(route.distance) : "",
          route.duration ? formatDuration(route.duration) : ""
        ].filter(Boolean);

        return `
          <article class="map-object-row map-object-row-v15">
            <div>
              <h6>${escapeHtml(route.name || "Ruta")}</h6>
              <div class="map-object-meta">
                <em class="created-by">${escapeHtml(authorLabel(route.createdBy))}</em>
                ${meta.map(value => `<em>${escapeHtml(String(value))}</em>`).join("")}
                <em>${route.waypoints?.length || geometry.length} puntos</em>
              </div>
            </div>

            <div class="map-object-actions">
              <button data-map-action="focus-route" data-id="${escapeHtml(route.id)}">VER</button>
              <button data-map-action="rename-route" data-id="${escapeHtml(route.id)}">EDITAR</button>
              <button data-map-action="delete-route" data-id="${escapeHtml(route.id)}">QUITAR</button>
            </div>
          </article>
        `;
      }).join("")
    : '<div class="map-object-empty">No hay rutas guardadas todavía. Usá el botón RUTA que está sobre el mapa.</div>';

  renderDraftRouteSidebar();
}

function renderDraftRouteSidebar() {
  const routeMode = mapMode === "route";

  mapDraftSection.hidden = !routeMode;
  mapDraftStopsCount.textContent = String(draftRouteWaypoints.length);

  if (!routeMode) {
    mapDraftStopsList.innerHTML = "";
    return;
  }

  mapDraftStopsList.innerHTML = draftRouteWaypoints.length
    ? draftRouteWaypoints.map((point, index) => `
        <div class="map-route-stop-row">
          <span class="map-route-stop-index">${index === 0 ? "A" : index + 1}</span>

          <div class="map-route-stop-copy">
            <strong>${escapeHtml(point.label || (index === 0 ? "Inicio" : `Parada ${index + 1}`))}</strong>
            <small>${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}</small>
          </div>

          <button type="button" data-draft-action="remove" data-index="${index}" aria-label="Quitar parada">×</button>
        </div>
      `).join("")
    : '<div class="map-object-empty">Tocá dos lugares en el mapa. Después podés arrastrar las paradas para ajustar la ruta.</div>';
}

function setMapMode(mode) {
  if (mode === mapMode && mode !== "route") return;

  if (mode !== "route") {
    cancelRouteRequest();
    clearDraftRoute({ keepMode: true });
  }

  mapMode = mode;
  updateMapModeUI();
  renderMapSidebar();
}

function updateMapModeUI() {
  const pointMode = mapMode === "point";
  const routeMode = mapMode === "route";

  addMapPoint.classList.toggle("active", pointMode);
  startMapRoute.classList.toggle("active", routeMode);

  addMapPoint.setAttribute("aria-pressed", pointMode ? "true" : "false");
  startMapRoute.setAttribute("aria-pressed", routeMode ? "true" : "false");

  routeComposer.classList.toggle("visible", routeMode);
  routeComposer.setAttribute("aria-hidden", routeMode ? "false" : "true");

  legacyMapEl.classList.toggle("map-point-mode", pointMode);
  legacyMapEl.classList.toggle("map-route-mode", routeMode);

  routeStopsSummary.textContent =
    `${draftRouteWaypoints.length} ${draftRouteWaypoints.length === 1 ? "PARADA" : "PARADAS"}`;

  if (routeMode) {
    if (draftRouteIsValid) {
      routeStats.textContent = `${formatDistance(draftRouteDistance)} · ${formatDuration(draftRouteDuration)}`;
      setMapHint("route", "RUTA LISTA", "Podés mover las paradas o guardar la ruta.");
    } else if (draftRouteWaypoints.length >= 2) {
      routeStats.textContent = "CALCULANDO…";
      setMapHint("route", "CALCULANDO RUTA", "Buscando el recorrido por calles.", true);
    } else {
      routeStats.textContent = "MARCÁ DOS LUGARES";
      setMapHint("route", "TRAZANDO RUTA", "Tocá dos lugares en el mapa. Luego podés seguir agregando paradas.");
    }
  } else if (pointMode) {
    setMapHint("point", "AÑADIR PUNTO", "Tocá exactamente el lugar que querés guardar.");
  } else {
    setMapHint("explore", "MAPA LISTO", "Elegí PUNTO o RUTA para empezar.");
  }

  undoMapRoute.disabled = !routeMode || draftRouteWaypoints.length === 0;
  clearMapRoute.disabled = !routeMode || draftRouteWaypoints.length === 0;
  saveMapRoute.disabled = !routeMode || !draftRouteIsValid || draftRouteWaypoints.length < 2;
}

function setRouteBusy(busy) {
  if (busy) {
    setMapHint("route", "CALCULANDO RUTA", "Buscando el recorrido por calles.", true);
    routeStats.textContent = "CALCULANDO…";
    saveMapRoute.disabled = true;
  } else {
    updateMapModeUI();
  }
}

function addDraftRouteWaypoint(lat, lng, label = "") {
  if (mapMode !== "route") {
    mapMode = "route";
    updateMapModeUI();
  }

  draftRouteWaypoints.push({
    lat: Number(lat),
    lng: Number(lng),
    label: label || ""
  });

  draftRouteIsValid = false;

  renderDraftWaypointMarkers();
  renderDraftGuide();
  renderDraftRouteSidebar();
  updateMapModeUI();

  if (draftRouteWaypoints.length >= 2) {
    scheduleRouteCalculation(120);
  }
}

function renderDraftWaypointMarkers() {
  if (!legacyMapInstance || !mapDraftWaypointLayer) return;

  mapDraftWaypointLayer.clearLayers();

  draftRouteWaypoints.forEach((point, index) => {
    const marker = L.marker([point.lat, point.lng], {
      draggable: true,
      icon: createRouteWaypointIcon(index),
      autoPan: true,
      keyboard: true,
      zIndexOffset: 1000 + index
    }).addTo(mapDraftWaypointLayer);

    marker.on("dragstart", () => {
      cancelRouteRequest();
      draftRouteIsValid = false;
      setMapHint("route", "MOVIENDO PARADA", "Soltá el punto para recalcular.", true);
    });

    marker.on("drag", event => {
      const latlng = event.target.getLatLng();
      draftRouteWaypoints[index].lat = Number(latlng.lat.toFixed(6));
      draftRouteWaypoints[index].lng = Number(latlng.lng.toFixed(6));
      renderDraftGuide();
    });

    marker.on("dragend", event => {
      const latlng = event.target.getLatLng();

      draftRouteWaypoints[index].lat = Number(latlng.lat.toFixed(6));
      draftRouteWaypoints[index].lng = Number(latlng.lng.toFixed(6));

      renderDraftRouteSidebar();
      scheduleRouteCalculation(60);
    });
  });
}

function renderDraftGuide() {
  if (!legacyMapInstance) return;

  if (mapDraftGuideLayer) {
    legacyMapInstance.removeLayer(mapDraftGuideLayer);
    mapDraftGuideLayer = null;
  }

  if (draftRouteWaypoints.length >= 2 && !draftRouteIsValid) {
    mapDraftGuideLayer = L.polyline(
      draftRouteWaypoints.map(point => [point.lat, point.lng]),
      {
        color: "#111111",
        weight: 3,
        opacity: .38,
        dashArray: "7 9",
        interactive: false
      }
    ).addTo(legacyMapInstance);
  }
}

function renderDraftRoadRoute() {
  if (!legacyMapInstance) return;

  if (mapDraftRouteLayer) {
    legacyMapInstance.removeLayer(mapDraftRouteLayer);
    mapDraftRouteLayer = null;
  }

  if (draftRouteGeometry.length >= 2) {
    mapDraftRouteLayer = L.polyline(draftRouteGeometry, {
      color: "#050505",
      weight: 7,
      opacity: .94,
      lineCap: "round",
      lineJoin: "round",
      interactive: false
    }).addTo(legacyMapInstance);
  }

  if (mapDraftGuideLayer) {
    legacyMapInstance.removeLayer(mapDraftGuideLayer);
    mapDraftGuideLayer = null;
  }
}

function scheduleRouteCalculation(delay = 160) {
  if (routeRequestTimer) clearTimeout(routeRequestTimer);
  routeRequestTimer = setTimeout(calculateRoadRoute, delay);
}

function cancelRouteRequest() {
  if (routeRequestTimer) {
    clearTimeout(routeRequestTimer);
    routeRequestTimer = null;
  }

  if (routeRequestController) {
    routeRequestController.abort();
    routeRequestController = null;
  }
}

async function calculateRoadRoute() {
  if (mapMode !== "route" || draftRouteWaypoints.length < 2) {
    draftRouteIsValid = false;
    updateMapModeUI();
    return;
  }

  cancelRouteRequest();
  routeRequestController = new AbortController();

  const mySerial = ++routeRequestSerial;
  setRouteBusy(true);

  const coords = draftRouteWaypoints
    .map(point => `${point.lng.toFixed(6)},${point.lat.toFixed(6)}`)
    .join(";");

  const url =
    `${OSRM_ROUTE_BASE}/${coords}` +
    `?overview=full&geometries=geojson&steps=false&alternatives=false`;

  try {
    const response = await fetch(url, {
      signal: routeRequestController.signal,
      cache: "no-store"
    });

    if (!response.ok) throw new Error(`OSRM ${response.status}`);

    const result = await response.json();
    if (mySerial !== routeRequestSerial) return;

    const route = result?.routes?.[0];
    const coordinates = route?.geometry?.coordinates;

    if (result?.code !== "Ok" || !Array.isArray(coordinates) || coordinates.length < 2) {
      throw new Error("NoRoute");
    }

    draftRouteGeometry = coordinates.map(([lng, lat]) => [lat, lng]);
    draftRouteDistance = Number(route.distance) || 0;
    draftRouteDuration = Number(route.duration) || 0;
    draftRouteIsValid = true;

    renderDraftRoadRoute();
    setRouteBusy(false);
    renderDraftRouteSidebar();
  } catch (error) {
    if (error?.name === "AbortError") return;

    console.warn("No se pudo calcular la ruta por calles:", error);

    draftRouteGeometry = [];
    draftRouteDistance = 0;
    draftRouteDuration = 0;
    draftRouteIsValid = false;

    renderDraftGuide();
    routeStats.textContent = "SIN RUTA";
    saveMapRoute.disabled = true;

    setMapHint("route", "NO SE PUDO CALCULAR", "Mové una parada o probá con otro lugar.");
  } finally {
    if (mySerial === routeRequestSerial) routeRequestController = null;
  }
}

function removeDraftWaypoint(index) {
  if (index < 0 || index >= draftRouteWaypoints.length) return;

  cancelRouteRequest();

  draftRouteWaypoints.splice(index, 1);
  draftRouteGeometry = [];
  draftRouteDistance = 0;
  draftRouteDuration = 0;
  draftRouteIsValid = false;

  if (mapDraftRouteLayer && legacyMapInstance) {
    legacyMapInstance.removeLayer(mapDraftRouteLayer);
    mapDraftRouteLayer = null;
  }

  renderDraftWaypointMarkers();
  renderDraftGuide();
  renderDraftRouteSidebar();
  updateMapModeUI();

  if (draftRouteWaypoints.length >= 2) {
    scheduleRouteCalculation(100);
  }
}

function clearDraftRoute({ keepMode = false } = {}) {
  cancelRouteRequest();

  draftRouteWaypoints = [];
  draftRouteGeometry = [];
  draftRouteDistance = 0;
  draftRouteDuration = 0;
  draftRouteIsValid = false;
  routeNameInput.value = "";

  if (mapDraftWaypointLayer) mapDraftWaypointLayer.clearLayers();

  if (mapDraftRouteLayer && legacyMapInstance) {
    legacyMapInstance.removeLayer(mapDraftRouteLayer);
    mapDraftRouteLayer = null;
  }

  if (mapDraftGuideLayer && legacyMapInstance) {
    legacyMapInstance.removeLayer(mapDraftGuideLayer);
    mapDraftGuideLayer = null;
  }

  if (!keepMode) mapMode = "explore";

  renderDraftRouteSidebar();
  updateMapModeUI();
}

function showLegacyMap() {
  mapModal.classList.add("open");
  mapModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("map-open");

  initLegacyMap();

  if (mapResizeTimer) clearTimeout(mapResizeTimer);

  mapResizeTimer = setTimeout(() => {
    requestAnimationFrame(() => {
      legacyMapInstance?.invalidateSize({ pan: false, animate: false });
      renderStoredMapLayers();
    });
  }, 90);
}

function hideLegacyMap() {
  closeMapSidebarMobileFn();
  setMapMode("explore");

  mapModal.classList.remove("open");
  mapModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("map-open");
}

function openMapPointEditor(id = null) {
  editingMapPointId = id;

  if (id) {
    const point = v16MapData.points.find(item => item.id === id);
    if (!point) return;

    pendingPointCoords = {
      lat: Number(point.lat),
      lng: Number(point.lng)
    };

    mapPointEditorMode.textContent = "EDITAR PUNTO";
    mapPointNameInput.value = point.name || "";
    mapPointAddedByPreview.textContent = authorLabel(point.createdBy);
  } else {
    mapPointEditorMode.textContent = "NUEVO PUNTO";
    mapPointNameInput.value = "";
    mapPointAddedByPreview.textContent = getCurrentStaffDisplayName();
  }

  if (!pendingPointCoords) return;

  mapPointCoordsPreview.textContent =
    `${pendingPointCoords.lat.toFixed(6)}, ${pendingPointCoords.lng.toFixed(6)}`;

  mapPointEditorModal.classList.add("open");
  mapPointEditorModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("map-point-editor-open");

  setTimeout(() => mapPointNameInput.focus(), 50);
}

function hideMapPointEditor({ keepPointMode = false } = {}) {
  mapPointEditorModal.classList.remove("open");
  mapPointEditorModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("map-point-editor-open");

  editingMapPointId = null;
  pendingPointCoords = null;
  mapPointEditorForm.reset();

  if (!keepPointMode && mapMode === "point") {
    setMapMode("explore");
  }
}

function focusMapPoint(id) {
  const point = v16MapData.points.find(item => item.id === id);
  if (!point || !legacyMapInstance) return;

  closeMapSidebarMobileFn();

  legacyMapInstance.flyTo(
    [Number(point.lat), Number(point.lng)],
    16,
    { animate: true, duration: .5 }
  );
}

function focusMapRoute(id) {
  const route = v16MapData.routes.find(item => item.id === id);
  const geometry = route ? getRouteGeometry(route) : [];

  if (!route || !legacyMapInstance || geometry.length < 2) return;

  closeMapSidebarMobileFn();

  legacyMapInstance.fitBounds(
    L.latLngBounds(geometry),
    { padding: [38, 38], animate: true, duration: .5 }
  );
}

function useReferencePointInRoute(id) {
  const point = v16MapData.points.find(item => item.id === id);
  if (!point) return;

  closeMapSidebarMobileFn();

  if (mapMode !== "route") {
    mapMode = "route";
    updateMapModeUI();
  }

  addDraftRouteWaypoint(
    Number(point.lat),
    Number(point.lng),
    point.name || "Punto"
  );
}

function locateCurrentUser() {
  if (!legacyMapInstance || !navigator.geolocation) {
    setMapHint("explore", "UBICACIÓN NO DISPONIBLE", "Este dispositivo no permite obtenerla.");
    return;
  }

   locateMapUser.disabled = true;
  setMapHint("explore", "BUSCANDO UBICACIÓN", "Esperando permiso del dispositivo.", true);

  navigator.geolocation.getCurrentPosition(
    position => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      mapUserLayer.clearLayers();

      L.marker([lat, lng], {
        icon: createUserLocationIcon(),
        keyboard: false
      }).addTo(mapUserLayer)
        .bindTooltip("Tu ubicación", { direction: "top" });

      legacyMapInstance.flyTo([lat, lng], 16, { duration: .5 });

      locateMapUser.disabled = false;
      updateMapModeUI();
    },
    () => {
      locateMapUser.disabled = false;
      setMapHint("explore", "NO SE PUDO OBTENER", "Revisá el permiso de ubicación del navegador.");
    },
    {
      enableHighAccuracy: true,
      timeout: 7000,
      maximumAge: 30000
    }
  );
}

mapPointEditorForm.addEventListener("submit", event => {
  event.preventDefault();

  const name = mapPointNameInput.value.trim();
  if (!name || !pendingPointCoords) return;

  if (editingMapPointId) {
    const point = v16MapData.points.find(item => item.id === editingMapPointId);

    if (point) {
      point.name = name;
      point.updatedAt = new Date().toISOString();
    }
  } else {
    v16MapData.points.push({
      id: makeMapObjectId("point"),
      name,
      lat: pendingPointCoords.lat,
      lng: pendingPointCoords.lng,
      createdBy: getCurrentStaffDisplayName(),
      createdAt: new Date().toISOString()
    });
  }

  saveMapData();
  hideMapPointEditor();
  renderStoredMapLayers();
});

mapPointsList.addEventListener("click", event => {
  const button = event.target.closest("button[data-map-action]");
  if (!button) return;

  const id = button.dataset.id;
  const action = button.dataset.mapAction;

  if (action === "focus-point") focusMapPoint(id);
  if (action === "route-add-point") useReferencePointInRoute(id);

  if (action === "edit-point") {
    const point = v16MapData.points.find(item => item.id === id);
    if (!point) return;

    pendingPointCoords = {
      lat: Number(point.lat),
      lng: Number(point.lng)
    };

    openMapPointEditor(id);
  }

  if (action === "delete-point") {
    const point = v16MapData.points.find(item => item.id === id);
    if (!point) return;

    if (!confirm(`¿Quitar el punto "${point.name}"?`)) return;

    v16MapData.points = v16MapData.points.filter(item => item.id !== id);
    saveMapData();
    renderStoredMapLayers();
  }
});

mapRoutesList.addEventListener("click", event => {
  const button = event.target.closest("button[data-map-action]");
  if (!button) return;

  const id = button.dataset.id;
  const route = v16MapData.routes.find(item => item.id === id);
  if (!route) return;

  if (button.dataset.mapAction === "focus-route") {
    focusMapRoute(id);
  }

  if (button.dataset.mapAction === "rename-route") {
    const next = prompt("Nombre de la ruta:", route.name || "Ruta");
    if (next == null) return;

    const name = next.trim();
    if (!name) return;

    route.name = name;
    route.updatedAt = new Date().toISOString();

    saveMapData();
    renderStoredMapLayers();
  }

  if (button.dataset.mapAction === "delete-route") {
    if (!confirm(`¿Quitar la ruta "${route.name}"?`)) return;

    v16MapData.routes = v16MapData.routes.filter(item => item.id !== id);
    saveMapData();
    renderStoredMapLayers();
  }
});

mapDraftStopsList.addEventListener("click", event => {
  const button = event.target.closest("button[data-draft-action='remove']");
  if (!button) return;

  removeDraftWaypoint(Number(button.dataset.index));
});

addMapPoint.addEventListener("click", () => {
  closeMapSidebarMobileFn();

  if (mapMode === "point") {
    setMapMode("explore");
  } else {
    setMapMode("point");
  }
});

startMapRoute.addEventListener("click", () => {
  closeMapSidebarMobileFn();

  if (mapMode === "route") {
    setMapMode("explore");
    return;
  }

  clearDraftRoute({ keepMode: true });
  mapMode = "route";
  updateMapModeUI();
  renderMapSidebar();
});

locateMapUser.addEventListener("click", locateCurrentUser);

mapSidebarToggle.addEventListener("click", () => {
  if (mapSidebar.classList.contains("mobile-open")) {
    closeMapSidebarMobileFn();
  } else {
    openMapSidebarMobile();
  }
});

closeMapSidebarMobile.addEventListener("click", closeMapSidebarMobileFn);

undoMapRoute.addEventListener("click", () => {
  if (!draftRouteWaypoints.length) return;
  removeDraftWaypoint(draftRouteWaypoints.length - 1);
});

clearMapRoute.addEventListener("click", () => {
  if (!draftRouteWaypoints.length) return;

  clearDraftRoute({ keepMode: true });
  mapMode = "route";
  updateMapModeUI();
  renderMapSidebar();
});

cancelMapMode.addEventListener("click", () => {
  setMapMode("explore");
});

saveMapRoute.addEventListener("click", () => {
  if (!draftRouteIsValid ||
      draftRouteGeometry.length < 2 ||
      draftRouteWaypoints.length < 2) return;

  const name = routeNameInput.value.trim() || `Ruta ${v16MapData.routes.length + 1}`;

  v16MapData.routes.push({
    id: makeMapObjectId("route"),
    name,
    waypoints: draftRouteWaypoints.map(point => ({
      lat: point.lat,
      lng: point.lng,
      label: point.label || ""
    })),
    geometry: draftRouteGeometry.map(coord => [...coord]),
    distance: draftRouteDistance,
    duration: draftRouteDuration,
    createdBy: getCurrentStaffDisplayName(),
    createdAt: new Date().toISOString()
  });

  saveMapData();
  clearDraftRoute();
  renderStoredMapLayers();

  setMapHint("explore", "RUTA GUARDADA", `Añadida por ${getCurrentStaffDisplayName()}.`);
});

openLegacyMap.addEventListener("click", showLegacyMap);
closeLegacyMap.addEventListener("click", hideLegacyMap);
mapBackdrop.addEventListener("click", hideLegacyMap);

closeMapPointEditor.addEventListener("click", () => hideMapPointEditor());
cancelMapPointEditor.addEventListener("click", () => hideMapPointEditor());
mapPointEditorBackdrop.addEventListener("click", () => hideMapPointEditor());

document.addEventListener("keydown", event => {
  if (event.key !== "Escape") return;

  if (mapPointEditorModal.classList.contains("open")) {
    hideMapPointEditor();
    return;
  }

  if (mapSidebar.classList.contains("mobile-open")) {
    closeMapSidebarMobileFn();
    return;
  }

  if (mapModal.classList.contains("open")) {
    if (mapMode !== "explore") {
      setMapMode("explore");
      return;
    }

    hideLegacyMap();
  }
});

window.addEventListener("resize", () => {
  if (!mapModal.classList.contains("open") || !legacyMapInstance) return;

  if (window.innerWidth > 820) {
    closeMapSidebarMobileFn();
  }

  if (mapResizeTimer) clearTimeout(mapResizeTimer);

  mapResizeTimer = setTimeout(() => {
    legacyMapInstance.invalidateSize({ pan: false, animate: false });
  }, 100);
});


// Refresh V16 whenever the existing shared-state synchronizer receives map changes.
try {
  renderLegacyMap = function () {
    try {
      if (typeof mapData !== "undefined") {
        v16MapData = normalizeMapData(mapData);
        localStorage.setItem(MAP_STORAGE_KEY, JSON.stringify(v16MapData));
      }
    } catch (error) {
      console.warn("No se pudo actualizar Safari Map V16 desde el estado compartido:", error);
    }
    renderStoredMapLayers();
  };
} catch (error) {
  console.warn("No se pudo enlazar Safari Map V16 al sincronizador:", error);
}

window.SafariMapV16 = {
  refresh() {
    try {
      if (typeof mapData !== "undefined") v16MapData = normalizeMapData(mapData);
    } catch (error) {}
    renderStoredMapLayers();
  },
  open: showLegacyMap
};

renderMapSidebar();

  window.__SAFARI_MAP_V16_READY__ = true;
})();