(() => {
  'use strict';
  if (window.__SAFARI_DEVICE_AUTH_V32_READY__) return;
  window.__SAFARI_DEVICE_AUTH_V32_READY__ = true;

  const API_URL = 'https://sqxcygylcxlsigcmawma.supabase.co';
  const API_KEY = 'sb_publishable_SdZBbhB1onHQHFB-XFX3PQ_rsfgL7Af';
  const TOKEN_KEY = 'legacyTrustedDeviceTokenV32';
  const TRUSTED_PROFILE_KEY = 'legacyTrustedDeviceProfileV32';
  const SESSION_KEY = 'legacyCurrentStaffV1';
  const EMAILS_KEY = 'legacyStaffEmailsV1';

  let trustedProfileId = localStorage.getItem(TRUSTED_PROFILE_KEY) || '';
  let resolving = false;
  let readyResolve;
  const ready = new Promise(resolve => { readyResolve = resolve; });

  function rpc(name, payload) {
    return fetch(`${API_URL}/rest/v1/rpc/${name}`, {
      method: 'POST',
      headers: {
        apikey: API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload || {}),
      cache: 'no-store'
    }).then(async response => {
      if (!response.ok) throw new Error(`${name} ${response.status}`);
      return response.json();
    });
  }

  function makeToken() {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    const raw = Array.from(bytes, b => String.fromCharCode(b)).join('');
    return btoa(raw).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
  }

  function getToken({ create = false } = {}) {
    let token = localStorage.getItem(TOKEN_KEY) || '';
    if (!token && create) {
      token = makeToken();
      localStorage.setItem(TOKEN_KEY, token);
    }
    return token;
  }

  function getProfile(id) {
    try {
      if (typeof getStaffById === 'function') return getStaffById(id);
    } catch (error) {}
    try {
      if (typeof staffProfiles !== 'undefined' && Array.isArray(staffProfiles)) {
        return staffProfiles.find(profile => profile.id === id) || null;
      }
    } catch (error) {}
    return null;
  }

  function readCachedEmail(profileId) {
    try {
      const map = JSON.parse(localStorage.getItem(EMAILS_KEY) || '{}') || {};
      const encoded = map[profileId];
      if (!encoded) return '';
      try {
        return decodeURIComponent(escape(atob(encoded))).trim().toLowerCase();
      } catch (error) {
        return String(encoded).trim().toLowerCase();
      }
    } catch (error) {
      return '';
    }
  }

  function currentLoginEmail() {
    try {
      if (typeof staffGmailInput !== 'undefined' && staffGmailInput?.value) {
        return String(staffGmailInput.value).trim().toLowerCase();
      }
    } catch (error) {}
    return '';
  }

  function setTrusted(profileId) {
    trustedProfileId = profileId || '';
    if (trustedProfileId) localStorage.setItem(TRUSTED_PROFILE_KEY, trustedProfileId);
    else localStorage.removeItem(TRUSTED_PROFILE_KEY);
    updateRecognizedUI();
  }

  async function registerDevice(profileId, email) {
    if (!profileId || !email) return false;
    const token = getToken({ create: true });
    try {
      const result = await rpc('register_staff_device', {
        p_profile_id: profileId,
        p_email: email,
        p_device_token: token
      });
      if (!result?.ok) return false;
      setTrusted(profileId);
      return true;
    } catch (error) {
      console.warn('Safari Device V32 register:', error);
      return false;
    }
  }

  async function resolveDevice() {
    if (resolving) return ready;
    resolving = true;

    let resolved = '';
    const token = getToken();

    if (token) {
      try {
        const result = await rpc('resolve_staff_device', { p_device_token: token });
        if (result?.ok && getProfile(result.profile_id)) {
          resolved = result.profile_id;
          setTrusted(resolved);
        }
      } catch (error) {
        console.warn('Safari Device V32 resolve:', error);
      }
    }

    // Migración silenciosa: si este navegador ya tenía una sesión válida de
    // versiones anteriores, lo convertimos a dispositivo reconocido sin pedir
    // el Gmail otra vez.
    if (!resolved) {
      const legacyProfileId = localStorage.getItem(SESSION_KEY) || '';
      const cachedEmail = readCachedEmail(legacyProfileId);
      if (legacyProfileId && cachedEmail && getProfile(legacyProfileId)) {
        const ok = await registerDevice(legacyProfileId, cachedEmail);
        if (ok) resolved = legacyProfileId;
      }
    }

    if (!resolved) setTrusted('');
    resolving = false;
    readyResolve(resolved);
    return resolved;
  }

  function updateRecognizedUI() {
    try {
      document.querySelectorAll('.staff-profile-card').forEach(card => {
        const badge = card.querySelector('.staff-profile-top span:last-child');
        if (!badge) return;
        if (card.dataset.staffId === trustedProfileId) {
          badge.textContent = 'DISPOSITIVO RECONOCIDO';
          badge.classList.remove('unlinked', 'checking');
          badge.classList.add('linked');
        }
      });
    } catch (error) {}
  }

  function autoEnter(profileId) {
    const profile = getProfile(profileId);
    if (!profile) return false;
    try {
      if (typeof closeStaffLogin === 'function') closeStaffLogin();
    } catch (error) {}
    try {
      enterDashboardAsStaff(profile);
      return true;
    } catch (error) {
      console.warn('Safari Device V32 auto-enter:', error);
      return false;
    }
  }

  // Registrar el dispositivo inmediatamente después de un acceso Gmail válido.
  try {
    const originalEnterDashboardAsStaff = enterDashboardAsStaff;
    enterDashboardAsStaff = function(profile, ...args) {
      try {
        const email = currentLoginEmail() || readCachedEmail(profile?.id);
        if (profile?.id && email && profile.id !== trustedProfileId) {
          registerDevice(profile.id, email);
        }
      } catch (error) {}
      return originalEnterDashboardAsStaff.call(this, profile, ...args);
    };
  } catch (error) {
    console.warn('Safari Device V32 could not wrap dashboard entry:', error);
  }

  // Cuando el sitio pida mostrar la selección de Staff, intentar primero el
  // acceso por dispositivo reconocido.
  let rawShowStaffGate = null;
  try {
    rawShowStaffGate = showStaffGate;
    showStaffGate = function(...args) {
      if (trustedProfileId && autoEnter(trustedProfileId)) return;

      const result = rawShowStaffGate.apply(this, args);
      ready.then(profileId => {
        if (!profileId) return;
        try {
          const gateVisible = staffGate?.classList.contains('visible');
          const loginVisible = staffLoginPanel?.classList.contains('visible');
          if (gateVisible && !loginVisible) autoEnter(profileId);
        } catch (error) {}
      });
      return result;
    };
  } catch (error) {
    console.warn('Safari Device V32 could not wrap gate:', error);
  }

  // Si por alguna razón se toca la tarjeta del mismo Staff reconocido, no se
  // abre el formulario de Gmail: entra directamente.
  try {
    const originalOpenStaffLogin = openStaffLogin;
    openStaffLogin = function(id, ...args) {
      if (id && id === trustedProfileId && autoEnter(id)) return;
      return originalOpenStaffLogin.call(this, id, ...args);
    };
  } catch (error) {
    console.warn('Safari Device V32 could not wrap login:', error);
  }

  // "CAMBIAR STAFF" sí olvida este navegador a propósito. El próximo Staff
  // deberá validar Gmail una sola vez y ese perfil quedará asociado al equipo.
  try {
    const button = document.getElementById('logoutStaff');
    if (button && button.dataset.deviceV32 !== '1') {
      button.dataset.deviceV32 = '1';
      button.title = 'Olvidar este dispositivo y elegir otro Staff';
      button.addEventListener('click', event => {
        event.preventDefault();
        event.stopImmediatePropagation();

        const token = getToken();
        if (token) rpc('revoke_staff_device', { p_device_token: token }).catch(() => {});
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(TRUSTED_PROFILE_KEY);
        localStorage.removeItem(SESSION_KEY);
        trustedProfileId = '';

        try { closeStaffLogin(); } catch (error) {}
        if (rawShowStaffGate) rawShowStaffGate();
      }, true);
    }
  } catch (error) {
    console.warn('Safari Device V32 could not wire change staff:', error);
  }

  // Mantener el badge correcto aun cuando la sincronización vuelva a dibujar
  // las tarjetas.
  const observer = new MutationObserver(() => updateRecognizedUI());
  try {
    if (staffProfilesGrid) observer.observe(staffProfilesGrid, { childList: true, subtree: true });
  } catch (error) {}

  resolveDevice().then(profileId => {
    updateRecognizedUI();
    if (!profileId) return;
    try {
      const gateVisible = staffGate?.classList.contains('visible');
      const loginVisible = staffLoginPanel?.classList.contains('visible');
      if (gateVisible && !loginVisible) autoEnter(profileId);
    } catch (error) {}
  });
})();
