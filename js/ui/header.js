/*********************************************************
 * BetEngine Enterprise – HEADER JS (ENTERPRISE v7.4)
 * Desktop-only header behaviour
 *
 * ENTERPRISE FIX:
 * - Strict DOM scoping enforcement
 * - Desktop JS NEVER interferes with mobile DOM
 *********************************************************/

/*******************************************************
 * GLOBAL STATE (DESKTOP ONLY)
 *******************************************************/
let desktopListenersAttached = false;

const state = {
    desktopDropdownOpen: false
};

/*******************************************************
 * UTILS
 *******************************************************/
const isInside = (target, selector) => {
    return !!(target && target.closest(selector));
};

const isMobileDOM = (target) => {
    return (
        isInside(target, ".mobile-only") ||
        isInside(target, ".mobile-menu-panel") ||
        isInside(target, ".mobile-menu-overlay")
    );
};

const closeAllDesktopDropdowns = () => {
    document
        .querySelectorAll(".header-desktop .odds-dropdown, .header-desktop .language-dropdown, .header-desktop .auth-user-dropdown, .header-desktop .tools-dropdown")
        .forEach(el => el.classList.remove("show"));

    state.desktopDropdownOpen = false;
};

/*******************************************************
 * DESKTOP DROPDOWNS
 *******************************************************/
function initDesktopDropdowns() {
    const header = document.querySelector(".header-desktop");
    if (!header) return;

    /* ---------------- ODDS ---------------- */
    const oddsToggle   = header.querySelector(".odds-format .odds-toggle");
    const oddsDropdown = header.querySelector(".odds-dropdown");
    const oddsItems    = oddsDropdown?.querySelectorAll(".item") || [];
    const oddsLabel    = header.querySelector(".odds-label");

    if (oddsToggle && oddsDropdown) {
        oddsToggle.addEventListener("click", (e) => {
            if (isMobileDOM(e.target)) return;

            e.stopPropagation();
            if (typeof window.closeDesktopSearch === "function") window.closeDesktopSearch();
            document.dispatchEvent(new CustomEvent("header:interaction"));
            const open = oddsDropdown.classList.contains("show");
            closeAllDesktopDropdowns();
            if (!open) {
                oddsDropdown.classList.add("show");
                state.desktopDropdownOpen = true;
            }
        });

        oddsItems.forEach(item => {
            item.addEventListener("click", (e) => {
                if (isMobileDOM(e.target)) return;

                e.stopPropagation();

                oddsItems.forEach(i => i.classList.remove("active"));
                item.classList.add("active");

                const clean = item.textContent.split("(")[0].trim();
                if (oddsLabel) oddsLabel.textContent = clean;

                closeAllDesktopDropdowns();
            });
        });
    }

  /* ---------------- LANGUAGE ---------------- */
const langToggle   = header.querySelector('.language-toggle');
const langDropdown = header.querySelector('.language-dropdown');
const langItems    = langDropdown ? Array.from(langDropdown.querySelectorAll('.item')) : [];
const langLabel    = header.querySelector('.language-selector .lang-label');

/* Unified storage (desktop + mobile) */
const LANG_STORAGE_DESKTOP = 'be_lang_desktop';
const LANG_STORAGE_MOBILE  = 'be_lang_mobile';

const safeJsonParse = (raw) => {
  try { return JSON.parse(raw); } catch (_) { return null; }
};

const readLangStorage = (key) => {
  try {
    const parsed = safeJsonParse(localStorage.getItem(key) || 'null');
    if (!parsed || typeof parsed !== 'object') return null;

    const code  = typeof parsed.code === 'string'  ? parsed.code.trim()  : '';
    const label = typeof parsed.label === 'string' ? parsed.label.trim() : '';

    if (!code && !label) return null;
    return { code, label };
  } catch (_) {
    return null;
  }
};

const writeLangStorage = (key, payload) => {
  try {
    localStorage.setItem(key, JSON.stringify(payload));
  } catch (_) {
    /* no-op */
  }
};

/* Desktop wins resolver (on load/init) */
const resolveLanguage = () => {
  const d = readLangStorage(LANG_STORAGE_DESKTOP);
  if (d && (d.code || d.label)) return d;

  const m = readLangStorage(LANG_STORAGE_MOBILE);
  if (m && (m.code || m.label)) return m;

  return null;
};

/* Single source of truth apply (shared for desktop + mobile) */
const applyLanguage = (payload) => {
  if (!payload) return;

  const code  = typeof payload.code === 'string'  ? payload.code.trim()  : '';
  const label = typeof payload.label === 'string' ? payload.label.trim() : '';

  if (!code && !label) return;

  /* 1) <html lang=""> */
  if (code) {
    try { document.documentElement.setAttribute('lang', code); } catch (_) {}
  }

  /* 2) Desktop dropdown active state */
  if (langItems.length) {
    langItems.forEach((i) => {
      const c = (i.getAttribute('data-lang') || '').trim();
      i.classList.toggle('active', !!code && c === code);
      // UX: show clickable cursor on options
      i.style.cursor = 'pointer';
    });
  }

  /* 3) Desktop label */
  if (langLabel && label) langLabel.textContent = label;

  /* 4) Mobile modal active state (if present) */
  const mobileItems = Array.from(document.querySelectorAll('#mobile-language-modal .be-modal-item'));
  if (mobileItems.length) {
    mobileItems.forEach((i) => {
      const c = (i.dataset.lang || '').trim();
      i.classList.toggle('active', !!code && c === code);
      // UX: show clickable cursor on options
      i.style.cursor = 'pointer';
    });
  }

  /* 5) Mobile menu Preferences label (if present) */
  const mobileMenuValue = document.querySelector('.menu-section.preferences .menu-item.menu-lang .value');
  if (mobileMenuValue && label) mobileMenuValue.textContent = label;
};

/* Expose shared function name (desktop is authoritative on conflict) */
window.applyLanguage = applyLanguage;

/* Apply stored language once (resolver + mirror both keys) */
const applyStoredLanguage = () => {
  if (!langItems.length) return;

  const chosen = resolveLanguage();
  if (!chosen) return;

  // Normalize against desktop list first (prefer data-lang match)
  const matchByCode = chosen.code
    ? langItems.find((it) => (it.getAttribute('data-lang') || '').trim() === chosen.code)
    : null;

  const matchByLabel = !matchByCode && chosen.label
    ? langItems.find((it) => it.textContent.trim() === chosen.label)
    : null;

  const item = matchByCode || matchByLabel;
  if (!item) return;

  const code  = (item.getAttribute('data-lang') || '').trim();
  const label = item.textContent.trim();

  const payload = { code: code || '', label: label || '' };

  // Desktop wins conflict => after resolution, mirror BOTH
  writeLangStorage(LANG_STORAGE_DESKTOP, payload);
  writeLangStorage(LANG_STORAGE_MOBILE,  payload);

  applyLanguage(payload);
};

/* Enterprise positioning: dropdown must open directly under the BUTTON (not label) */
let langViewportHooksBound = false;

const positionLangDropdown = () => {
  if (!langToggle || !langDropdown) return;

  const btnRect = langToggle.getBoundingClientRect();
  const gap = 6;              // keeps consistent with other dropdown spacing
  const pad = 8;              // viewport padding (prevent edge overflow)

  const width = Math.max(0, Math.round(btnRect.width));
  let left = Math.round(btnRect.right - width);     // align RIGHT edge to the button's right edge
  let top  = Math.round(btnRect.bottom + gap);      // directly below the button

  // Clamp inside viewport (enterprise-safe)
  const maxLeft = Math.max(pad, Math.round(window.innerWidth - pad - width));
  if (left < pad) left = pad;
  if (left > maxLeft) left = maxLeft;

  // Use fixed so Row 1 layout is never affected
  langDropdown.style.position = 'fixed';
  langDropdown.style.top = `${top}px`;
  langDropdown.style.left = `${left}px`;
  langDropdown.style.right = 'auto';
  langDropdown.style.width = `${width}px`;
  langDropdown.style.marginTop = '0';
  langDropdown.style.zIndex = '9999';

  // remove horizontal scrollbar at the bottom
  langDropdown.style.boxSizing = 'border-box';
  langDropdown.style.overflowX = 'hidden';
};

const bindLangViewportHooks = () => {
  if (langViewportHooksBound) return;
  langViewportHooksBound = true;

  const onViewportChange = () => {
    if (!langDropdown || !langDropdown.classList.contains('show')) return;
    positionLangDropdown();
  };

  window.addEventListener('resize', onViewportChange, { passive: true });
  // capture=true so it also catches scroll on containers, not only window
  window.addEventListener('scroll', onViewportChange, true);
};

if (langToggle && langDropdown) {
  /* Apply stored language once (desktop wins conflict + mirrors both keys) */
  applyStoredLanguage();

  langToggle.addEventListener('click', (e) => {
    if (isMobileDOM(e.target)) return;

    e.stopPropagation();

    if (typeof window.closeDesktopSearch === 'function') window.closeDesktopSearch();
    document.dispatchEvent(new CustomEvent('header:interaction'));

    const isOpen = langDropdown.classList.contains('show');

    closeAllDesktopDropdowns();

    if (!isOpen) {
      // Open + enterprise position under the BUTTON
      langDropdown.classList.add('show');
      langToggle.setAttribute('aria-expanded', 'true');
      state.desktopDropdownOpen = true;

      positionLangDropdown();
      bindLangViewportHooks();
    } else {
      langToggle.setAttribute('aria-expanded', 'false');
    }
  });

  langItems.forEach((item) => {
    // UX: pointer on dropdown options
    item.style.cursor = 'pointer';

    item.addEventListener('click', (e) => {
      if (isMobileDOM(e.target)) return;

      e.stopPropagation();

      const code  = (item.getAttribute('data-lang') || '').trim();
      const label = item.textContent.trim();

      const payload = { code: code || '', label: label || '' };

      // Persist to BOTH keys (desktop wins conflict rule)
      writeLangStorage(LANG_STORAGE_DESKTOP, payload);
      writeLangStorage(LANG_STORAGE_MOBILE,  payload);

      // Apply everywhere (desktop + mobile UI + <html lang>)
      applyLanguage(payload);

      langToggle.setAttribute('aria-expanded', 'false');
      closeAllDesktopDropdowns();
    });
  });
}


    /* ---------------- USER ---------------- */
const userToggle   = header.querySelector(".auth-user-toggle");
const userDropdown = header.querySelector(".auth-user-dropdown");

if (userToggle && userDropdown) {
  userToggle.addEventListener("click", (e) => {
    if (isMobileDOM(e.target)) return;

    e.stopPropagation();
    if (typeof window.closeDesktopSearch === "function") window.closeDesktopSearch();
    document.dispatchEvent(new CustomEvent("header:interaction"));
    const open = userDropdown.classList.contains("show");
    closeAllDesktopDropdowns();
    if (!open) {
      userDropdown.classList.add("show");
      state.desktopDropdownOpen = true;
    }
  });
}

    /* ---------------- BETTING TOOLS ---------------- */
    const toolsTrigger  = header.querySelector(".sub-item-tools");
    const toolsDropdown = toolsTrigger?.querySelector(".tools-dropdown");

    if (toolsTrigger && toolsDropdown) {
        toolsTrigger.addEventListener("click", (e) => {
            if (isMobileDOM(e.target)) return;

            e.stopPropagation();
            if (typeof window.closeDesktopSearch === "function") window.closeDesktopSearch();
            document.dispatchEvent(new CustomEvent("header:interaction"));
            const open = toolsDropdown.classList.contains("show");
            closeAllDesktopDropdowns();
            if (!open) {
                toolsDropdown.classList.add("show");
                state.desktopDropdownOpen = true;
            }
        });
    }
}

/*******************************************************
 * GLOBAL DESKTOP LISTENERS (STRICTLY DESKTOP)
 *******************************************************/
function attachDesktopGlobalListeners() {
    if (desktopListenersAttached) return;
    desktopListenersAttached = true;

    document.addEventListener("click", (e) => {
        if (isMobileDOM(e.target)) return;
        if (!state.desktopDropdownOpen) return;

        if (
            !isInside(e.target, ".header-desktop .odds-format") &&
            !isInside(e.target, ".header-desktop .language-selector") &&
            !isInside(e.target, ".header-desktop .auth-user") &&
            !isInside(e.target, ".header-desktop .sub-item-tools")
        ) {
           closeAllDesktopDropdowns();
            // ENTERPRISE: sync close search and notify
      if (typeof window.closeDesktopSearch === "function") {
        window.closeDesktopSearch();
      }

      document.dispatchEvent(new CustomEvent("header:interaction"));
    }
  });

    document.addEventListener("keydown", (e) => {
        if (e.key !== "Escape") return;
        if (!state.desktopDropdownOpen) return;

        closeAllDesktopDropdowns();
     });
   }


/*******************************************************
 * NAVIGATION SYNC (DESKTOP ONLY)
 *******************************************************/
function initSectionNavigation() {
    const dMain = document.querySelectorAll(".header-desktop .main-nav .nav-item");
    const dSub  = document.querySelectorAll(".header-desktop .row-sub .subnav-group");

    if (!dMain.length) return;

    const activate = (section) => {
        dMain.forEach(i =>
            i.classList.toggle("active", i.dataset.section === section)
        );

        dSub.forEach(g =>
            g.classList.toggle("active", g.dataset.subnav === section)
        );
    };

    dMain.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            activate(item.dataset.section);
        });
    });
}

/*******************************************************
 * INIT (AFTER HEADER INJECTION)
 *******************************************************/
function initHeader() {
    initDesktopDropdowns();
    attachDesktopGlobalListeners();
    initSectionNavigation();
}

/*******************************************************
 * EVENT BINDING
 *******************************************************/
document.addEventListener("headerLoaded", initHeader);

if (window.__BE_HEADER_READY__ === true) {
    initHeader();
}
