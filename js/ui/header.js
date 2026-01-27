/*********************************************************
 * BetEngine Enterprise – HEADER JS (ENTERPRISE v7.5)
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
    desktopDropdownOpen: false,
    desktopNotifOpen: false
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
 * DESKTOP NOTIFICATIONS (OVERLAY + PANEL)
 * - Desktop-only, does not touch mobile DOM
 * - DOM is created lazily and kept hidden until opened
 *******************************************************/
const ensureDesktopNotificationsDOM = () => {
    let overlay = document.getElementById("be-notif-overlay");
    let panel = document.getElementById("be-notif-panel");

    if (overlay && panel) return { overlay, panel };

    const tpl = document.getElementById("be-notif-template");
    if (tpl && tpl.content) {
        const frag = tpl.content.cloneNode(true);
        document.body.appendChild(frag);

        overlay = document.getElementById("be-notif-overlay");
        panel = document.getElementById("be-notif-panel");

        if (overlay && panel) return { overlay, panel };
    }

    overlay = document.createElement("div");
    overlay.id = "be-notif-overlay";
    overlay.className = "be-notif-overlay";
    overlay.setAttribute("data-notif-overlay", "");
    overlay.hidden = true;

    panel = document.createElement("aside");
    panel.id = "be-notif-panel";
    panel.className = "be-notif-panel";
    panel.setAttribute("data-notif-panel", "");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-hidden", "true");
    panel.setAttribute("aria-label", "Notifications");
    panel.hidden = true;

    panel.innerHTML = `
        <div class="be-notif-panel-header">
            <span class="be-notif-title" data-i18n="notifications.title">Notifications</span>
            <button type="button" class="be-notif-close" data-notif-close aria-label="Close notifications">
                <span aria-hidden="true">×</span>
            </button>
        </div>
        <div class="be-notif-panel-body" role="region" aria-live="polite">
            <div class="be-notif-empty" data-notif-empty>
                <span data-i18n="notifications.empty">No notifications.</span>
            </div>
            <ul class="be-notif-list" data-notif-list></ul>
        </div>
        <div class="be-notif-panel-footer">
            <a href="#" class="be-notif-view-all" data-notif-view-all data-i18n="notifications.viewAll">View all</a>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(panel);

    return { overlay, panel };
};

const setDesktopNotifExpanded = (btn, expanded) => {
    if (!btn) return;
    btn.setAttribute("aria-expanded", expanded ? "true" : "false");
};

const closeDesktopNotifications = () => {
    const btn = document.querySelector(".header-desktop .notif-button");
    const overlay = document.getElementById("be-notif-overlay");
    const panel = document.getElementById("be-notif-panel");

    if (overlay) overlay.hidden = true;
    if (panel) {
        panel.hidden = true;
        panel.setAttribute("aria-hidden", "true");
    }

    setDesktopNotifExpanded(btn, false);
    state.desktopNotifOpen = false;
};

const openDesktopNotifications = () => {
    const btn = document.querySelector(".header-desktop .notif-button");
    const { overlay, panel } = ensureDesktopNotificationsDOM();

    if (typeof window.closeDesktopSearch === "function") window.closeDesktopSearch();
    closeAllDesktopDropdowns();
    document.dispatchEvent(new CustomEvent("header:interaction"));

    overlay.hidden = false;
    panel.hidden = false;
    panel.setAttribute("aria-hidden", "false");

    setDesktopNotifExpanded(btn, true);
    state.desktopNotifOpen = true;
};

window.closeDesktopNotifications = closeDesktopNotifications;

function initDesktopNotifications() {
    const header = document.querySelector(".header-desktop");
    if (!header) return;

    const btn = header.querySelector(".notif-button");
    if (!btn) return;

    btn.setAttribute("aria-haspopup", "dialog");
    btn.setAttribute("aria-controls", "be-notif-panel");
    if (!btn.hasAttribute("aria-expanded")) btn.setAttribute("aria-expanded", "false");

    const bindPanelHandlers = () => {
        const overlay = document.getElementById("be-notif-overlay");
        const panel = document.getElementById("be-notif-panel");
        if (!overlay || !panel) return;

        if (panel.dataset.notifBound === "1") return;
        panel.dataset.notifBound = "1";

        panel.addEventListener("click", (ev) => {
            if (isMobileDOM(ev.target)) return;
            ev.stopPropagation();
        });

        overlay.addEventListener("click", (ev) => {
            if (isMobileDOM(ev.target)) return;
            closeDesktopNotifications();
        });

        const closeBtn = panel.querySelector("[data-notif-close], .be-notif-close");
        if (closeBtn) {
            closeBtn.addEventListener("click", (ev) => {
                if (isMobileDOM(ev.target)) return;
                ev.preventDefault();
                ev.stopPropagation();
                closeDesktopNotifications();
            });
        }

        const viewAll = panel.querySelector("[data-notif-view-all], .be-notif-view-all");
        if (viewAll) {
            viewAll.addEventListener("click", (ev) => {
                if (isMobileDOM(ev.target)) return;
                closeDesktopNotifications();
            });
        }
    };

    btn.addEventListener("click", (e) => {
        if (isMobileDOM(e.target)) return;

        e.stopPropagation();

        if (state.desktopNotifOpen) {
            closeDesktopNotifications();
            return;
        }

        openDesktopNotifications();
        bindPanelHandlers();
    });

    bindPanelHandlers();

    window.openDesktopNotifications = () => {
        openDesktopNotifications();
        bindPanelHandlers();
    };
}

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
            if (typeof window.closeDesktopNotifications === "function") window.closeDesktopNotifications();
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
    const langToggle   = header.querySelector(".language-toggle");
    const langDropdown = header.querySelector(".language-dropdown");
    const langItems    = langDropdown ? Array.from(langDropdown.querySelectorAll(".item")) : [];
    const langLabel    = header.querySelector(".language-selector .lang-label");

    const LANG_STORAGE_DESKTOP = "be_lang_desktop";
    const LANG_STORAGE_MOBILE  = "be_lang_mobile";

    const safeJsonParse = (raw) => {
        try { return JSON.parse(raw); } catch (_) { return null; }
    };

    const readLangStorage = (key) => {
        const parsed = safeJsonParse(localStorage.getItem(key) || "null");
        if (!parsed || typeof parsed !== "object") return null;

        const code  = typeof parsed.code === "string"  ? parsed.code.trim()  : "";
        const label = typeof parsed.label === "string" ? parsed.label.trim() : "";

        if (!code && !label) return null;
        return { code, label };
    };

    const writeLangStorage = (key, payload) => {
        try { localStorage.setItem(key, JSON.stringify(payload)); } catch (_) {}
    };

    const resolveLanguage = () => {
        const d = readLangStorage(LANG_STORAGE_DESKTOP);
        if (d && (d.code || d.label)) return d;

        const m = readLangStorage(LANG_STORAGE_MOBILE);
        if (m && (m.code || m.label)) return m;

        return null;
    };

    const applyLanguage = (payload) => {
        if (!payload) return;

        const code  = typeof payload.code === "string"  ? payload.code.trim()  : "";
        const label = typeof payload.label === "string" ? payload.label.trim() : "";

        if (!code && !label) return;

        if (code) {
            try { document.documentElement.setAttribute("lang", code); } catch (_) {}
        }

        if (langItems.length) {
            langItems.forEach((i) => {
                const c = (i.getAttribute("data-lang") || "").trim();
                if (code) i.classList.toggle("active", c === code);
                i.style.cursor = "pointer";
            });
        }

        if (langLabel && label) langLabel.textContent = label;

        const mobileItems = Array.from(document.querySelectorAll("#mobile-language-modal .be-modal-item"));
        if (mobileItems.length) {
            mobileItems.forEach((i) => {
                const c = (i.dataset.lang || "").trim();
                if (code) i.classList.toggle("active", c === code);
                i.style.cursor = "pointer";
            });
        }

        const mobileMenuValue = document.querySelector(".menu-section.preferences .menu-item.menu-lang .value");
        if (mobileMenuValue && label) mobileMenuValue.textContent = label;

        document.dispatchEvent(new CustomEvent("be:langChanged", { detail: payload }));
    };

    window.applyLanguage = applyLanguage;

    const normalizeAgainstDesktop = (chosen) => {
        if (!chosen) return null;

        let picked = null;

        if (langItems.length && chosen.code) {
            picked = langItems.find((it) => ((it.getAttribute("data-lang") || "").trim() === chosen.code));
        }
        if (!picked && langItems.length && chosen.label) {
            picked = langItems.find((it) => (it.textContent.trim() === chosen.label));
        }

        const code  = picked ? ((picked.getAttribute("data-lang") || "").trim()) : (chosen.code || "");
        const label = picked ? (picked.textContent.trim()) : (chosen.label || "");

        if (!code && !label) return null;
        return { code: code || "", label: label || "" };
    };

    const applyStoredLanguage = () => {
        const chosen = resolveLanguage();
        if (!chosen) return;

        const payload = normalizeAgainstDesktop(chosen) || { code: chosen.code || "", label: chosen.label || "" };

        writeLangStorage(LANG_STORAGE_DESKTOP, payload);
        writeLangStorage(LANG_STORAGE_MOBILE,  payload);

        applyLanguage(payload);
    };

    let langViewportHooksBound = false;

    const positionLangDropdown = () => {
        if (!langToggle || !langDropdown) return;

        const btnRect = langToggle.getBoundingClientRect();
        const gap = 6;
        const pad = 8;

        const width = Math.max(0, Math.round(btnRect.width));
        let left = Math.round(btnRect.right - width);
        let top  = Math.round(btnRect.bottom + gap);

        const maxLeft = Math.max(pad, Math.round(window.innerWidth - pad - width));
        if (left < pad) left = pad;
        if (left > maxLeft) left = maxLeft;

        langDropdown.style.position  = "fixed";
        langDropdown.style.top       = `${top}px`;
        langDropdown.style.left      = `${left}px`;
        langDropdown.style.right     = "auto";
        langDropdown.style.width     = `${width}px`;
        langDropdown.style.marginTop = "0";
        langDropdown.style.zIndex    = "9999";

        langDropdown.style.boxSizing  = "border-box";
        langDropdown.style.overflowX  = "hidden";
    };

    const bindLangViewportHooks = () => {
        if (langViewportHooksBound) return;
        langViewportHooksBound = true;

        const onViewportChange = () => {
            if (!langDropdown || !langDropdown.classList.contains("show")) return;
            positionLangDropdown();
        };

        window.addEventListener("resize", onViewportChange, { passive: true });
        window.addEventListener("scroll", onViewportChange, true);
    };

    if (langToggle && langDropdown) {
        applyStoredLanguage();

        langToggle.addEventListener("click", (e) => {
            if (isMobileDOM(e.target)) return;

            e.stopPropagation();

            if (typeof window.closeDesktopSearch === "function") window.closeDesktopSearch();
            if (typeof window.closeDesktopNotifications === "function") window.closeDesktopNotifications();
            document.dispatchEvent(new CustomEvent("header:interaction"));

            const isOpen = langDropdown.classList.contains("show");

            closeAllDesktopDropdowns();

            if (!isOpen) {
                langDropdown.classList.add("show");
                langToggle.setAttribute("aria-expanded", "true");
                state.desktopDropdownOpen = true;

                positionLangDropdown();
                bindLangViewportHooks();
            } else {
                langToggle.setAttribute("aria-expanded", "false");
            }
        });

        langItems.forEach((item) => {
            item.style.cursor = "pointer";

            item.addEventListener("click", (e) => {
                if (isMobileDOM(e.target)) return;

                e.stopPropagation();

                const code  = (item.getAttribute("data-lang") || "").trim();
                const label = item.textContent.trim();
                const payload = { code: code || "", label: label || "" };

                writeLangStorage(LANG_STORAGE_DESKTOP, payload);
                writeLangStorage(LANG_STORAGE_MOBILE,  payload);

                applyLanguage(payload);

                langToggle.setAttribute("aria-expanded", "false");
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
            if (typeof window.closeDesktopNotifications === "function") window.closeDesktopNotifications();
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
            if (typeof window.closeDesktopNotifications === "function") window.closeDesktopNotifications();
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

        /* ENTERPRISE: search closes on ANY outside click */
        if (
            typeof window.closeDesktopSearch === "function" &&
            !isInside(e.target, ".header-desktop .be-search")
        ) {
            window.closeDesktopSearch();
        }

        /* ENTERPRISE: notifications close on outside click */
        if (state.desktopNotifOpen) {
            const panel = document.getElementById("be-notif-panel");
            const overlay = document.getElementById("be-notif-overlay");
            const btn = document.querySelector(".header-desktop .notif-button");

            const clickedInsidePanel = panel && isInside(e.target, "#be-notif-panel");
            const clickedButton = btn && isInside(e.target, ".header-desktop .notif-button");

            if (!clickedInsidePanel && !clickedButton) {
                closeDesktopNotifications();
            } else {
                if (overlay && e.target === overlay) closeDesktopNotifications();
            }
        }

        /* Existing dropdown logic (unchanged) */
        if (!state.desktopDropdownOpen) return;

        if (
            !isInside(e.target, ".header-desktop .odds-format") &&
            !isInside(e.target, ".header-desktop .language-selector") &&
            !isInside(e.target, ".header-desktop .auth-user") &&
            !isInside(e.target, ".header-desktop .sub-item-tools")
        ) {
            closeAllDesktopDropdowns();
            document.dispatchEvent(new CustomEvent("header:interaction"));
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key !== "Escape") return;
        if (state.desktopNotifOpen) {
            closeDesktopNotifications();
            return;
        }
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
    initDesktopNotifications();
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
