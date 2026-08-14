(() => {
  const API_URL = "https://sqxcygylcxlsigcmawma.supabase.co";
  const API_KEY = "sb_publishable_SdZBbhB1onHQHFB-XFX3PQ_rsfgL7Af";

  let bindingStatus = {};
  let bindingStatusLoaded = false;
  let bindingFetchInFlight = false;

  function getProfileIdFromCard(card) {
    return card?.dataset?.staffId || "";
  }

  function applyCardBadges() {
    document.querySelectorAll(".staff-profile-card").forEach((card) => {
      const id = getProfileIdFromCard(card);
      const badge = card.querySelector(".staff-profile-top span:last-child");
      if (!badge || !id) return;

      badge.classList.add("staff-binding-badge");
      badge.classList.remove("linked", "unlinked", "checking");

      if (!bindingStatusLoaded) {
        badge.classList.add("checking");
        badge.textContent = "VERIFICANDO…";
      } else if (bindingStatus[id]) {
        badge.classList.add("linked");
        badge.textContent = "GMAIL VINCULADO";
      } else {
        badge.classList.add("unlinked");
        badge.textContent = "SIN VINCULAR";
      }
    });
  }

  function ensureLoginBindingBox() {
    const form = document.getElementById("staffLoginForm");
    if (!form) return null;

    const legacyNote = form.querySelector(".google-auth-ready-note");
    if (legacyNote) legacyNote.remove();

    let box = document.getElementById("staffBindingLive");
    if (!box) {
      box = document.createElement("div");
      box.className = "staff-binding-live unknown";
      box.id = "staffBindingLive";
      box.innerHTML = '<span class="staff-binding-dot"></span><span id="staffBindingLiveText">CONSULTANDO VINCULACIÓN…</span>';
      const error = document.getElementById("staffLoginError");
      form.insertBefore(box, error);
    }
    return box;
  }

  function updateSelectedBindingUI() {
    const box = ensureLoginBindingBox();
    const text = document.getElementById("staffBindingLiveText");
    const help = document.getElementById("staffLoginHelp");
    if (!box || !text || !help || !selectedStaffId) return;

    const linked = Boolean(bindingStatus[selectedStaffId]);
    box.classList.remove("linked", "unlinked", "unknown");

    if (!bindingStatusLoaded) {
      box.classList.add("unknown");
      text.textContent = "CONSULTANDO VINCULACIÓN…";
      help.textContent = "Estamos verificando si este perfil ya tiene un Gmail vinculado.";
      return;
    }

    if (linked) {
      box.classList.add("linked");
      text.textContent = "GMAIL VINCULADO";
      help.textContent = "Este perfil ya está vinculado. Ingresá exactamente el mismo Gmail para continuar.";
    } else {
      box.classList.add("unlinked");
      text.textContent = "PRIMER INGRESO · SIN VINCULAR";
      help.textContent = "El primer Gmail válido que uses quedará vinculado a este perfil para todos los dispositivos.";
    }
  }

  async function fetchBindingStatus() {
    if (bindingFetchInFlight) return;
    bindingFetchInFlight = true;
    try {
      const response = await fetch(`${API_URL}/rest/v1/rpc/get_staff_gmail_status`, {
        method: "POST",
        headers: {
          apikey: API_KEY,
          "Content-Type": "application/json"
        },
        body: "{}",
        cache: "no-store"
      });
      if (!response.ok) throw new Error(`status ${response.status}`);

      const rows = await response.json();
      bindingStatus = {};
      for (const row of rows || []) {
        bindingStatus[row.profile_id] = Boolean(row.linked);
      }
      bindingStatusLoaded = true;
      applyCardBadges();
      updateSelectedBindingUI();
    } catch (error) {
      console.warn("V14 Gmail status error:", error);
      bindingStatusLoaded = false;
      applyCardBadges();
      updateSelectedBindingUI();
    } finally {
      bindingFetchInFlight = false;
    }
  }

  async function claimGmail(profileId, email) {
    const response = await fetch(`${API_URL}/rest/v1/rpc/claim_staff_gmail`, {
      method: "POST",
      headers: {
        apikey: API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        p_profile_id: profileId,
        p_email: email
      }),
      cache: "no-store"
    });

    if (!response.ok) throw new Error(`claim ${response.status}`);
    return response.json();
  }

  function errorMessage(code) {
    if (code === "wrong_gmail") {
      return "Ese Gmail no corresponde a este staff. Usá el Gmail que quedó vinculado originalmente.";
    }
    if (code === "gmail_already_used") {
      return "Ese Gmail ya está vinculado a otro perfil del staff.";
    }
    if (code === "invalid_gmail") {
      return "Ingresá una dirección @gmail.com válida.";
    }
    return "No se pudo validar este acceso. Probá nuevamente.";
  }

  try {
    const originalRenderStaffProfiles = renderStaffProfiles;
    renderStaffProfiles = function (...args) {
      const result = originalRenderStaffProfiles.apply(this, args);
      queueMicrotask(applyCardBadges);
      return result;
    };
  } catch (error) {
    console.warn("V14 could not wrap renderStaffProfiles:", error);
  }

  try {
    const originalShowStaffGate = showStaffGate;
    showStaffGate = function (...args) {
      const result = originalShowStaffGate.apply(this, args);
      fetchBindingStatus();
      return result;
    };
  } catch (error) {
    console.warn("V14 could not wrap showStaffGate:", error);
  }

  try {
    const originalOpenStaffLogin = openStaffLogin;
    openStaffLogin = function (...args) {
      const result = originalOpenStaffLogin.apply(this, args);
      ensureLoginBindingBox();
      updateSelectedBindingUI();
      fetchBindingStatus();
      return result;
    };
  } catch (error) {
    console.warn("V14 could not wrap openStaffLogin:", error);
  }

  const form = document.getElementById("staffLoginForm");
  if (form) {
    ensureLoginBindingBox();

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();

      const profile = getStaffById(selectedStaffId);
      const email = normalizeGmail(staffGmailInput.value);
      const errorBox = document.getElementById("staffLoginError");
      const submit = form.querySelector(".staff-login-submit");

      if (!profile) return;

      if (!isGmail(email)) {
        errorBox.textContent = "Ingresá una dirección @gmail.com válida.";
        return;
      }

      const oldHTML = submit.innerHTML;
      submit.disabled = true;
      submit.classList.add("loading");
      submit.textContent = "VERIFICANDO GMAIL…";
      errorBox.textContent = "";

      try {
        const result = await claimGmail(profile.id, email);

        if (!result?.ok) {
          errorBox.textContent = errorMessage(result?.code);
          return;
        }

        try {
          staffEmailBindings[profile.id] = encodeLocalEmail(email);
          saveStaffEmailBindings();
        } catch (cacheError) {
          console.warn("V14 local cache warning:", cacheError);
        }

        bindingStatus[profile.id] = true;
        bindingStatusLoaded = true;
        applyCardBadges();
        updateSelectedBindingUI();

        const liveText = document.getElementById("staffBindingLiveText");
        if (result.newly_linked && liveText) {
          liveText.textContent = "GMAIL VINCULADO · LISTO";
        }

        enterDashboardAsStaff(profile);
      } catch (error) {
        console.error("V14 Gmail claim error:", error);
        errorBox.textContent = "No se pudo conectar con el sistema de acceso. Revisá tu conexión e intentá de nuevo.";
      } finally {
        submit.disabled = false;
        submit.classList.remove("loading");
        submit.innerHTML = oldHTML;
      }
    }, true);
  }

  applyCardBadges();
  fetchBindingStatus();
  setInterval(fetchBindingStatus, 15000);
})();
