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

/* Storage (desktop language) */
const LANG_STORAGE_KEY = 'be_lang_desktop';

const readLangStorage = () => {
  try {
    const raw = localStorage.getItem(LANG_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    const code  = typeof parsed.code === 'string' ? parsed.code : '';
    const label = typeof parsed.label === 'string' ? parsed.label : '';

    if (!code && !label) return null;
    return { code, label };
  } catch (_) {
    return null;
  }
};

const writeLangStorage = (payload) => {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, JSON.stringify(payload));
  } catch (_) {
    /* no-op */
  }
};

const applyStoredLanguage = () => {
  if (!langItems.length) return;

  const saved = readLangStorage();
  if (!saved) return;

  const matchByCode = saved.code
    ? langItems.find((it) => (it.getAttribute('data-lang') || '').trim() === saved.code)
    : null;

  const matchByLabel = !matchByCode && saved.label
    ? langItems.find((it) => it.textContent.trim() === saved.label)
    : null;

  const item = matchByCode || matchByLabel;
  if (!item) return;

  langItems.forEach((i) => i.classList.remove('active'));
  item.classList.add('active');

  if (langLabel) langLabel.textContent = item.textContent.trim();
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

  // <<< remove horizontal scrollbar at the bottom
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
  /* Apply stored language once (safe, no behavior changes) */
  applyStoredLanguage();

  /* Cursor must show clickable on dropdown options */
  langItems.forEach((item) => {
    item.style.cursor = 'pointer';
  });

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
    item.addEventListener('click', (e) => {
      if (isMobileDOM(e.target)) return;

      e.stopPropagation();

      langItems.forEach((i) => i.classList.remove('active'));
      item.classList.add('active');

      const nextLabel = item.textContent.trim();
      if (langLabel) langLabel.textContent = nextLabel;

      /* Persist selection (code preferred, label fallback) */
      const code = (item.getAttribute('data-lang') || '').trim();
      writeLangStorage({
        code: code || '',
        label: nextLabel || ''
      });

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
