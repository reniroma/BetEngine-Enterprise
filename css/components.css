/*********************************************************
 * BetEngine Enterprise – COMPONENTS CSS (FINAL)
 * Buttons, dropdowns, chips, modal, header elements
 *********************************************************/

/* -------------------------------------------------------
   GENERIC BUTTONS / CONTROLS
-------------------------------------------------------- */

button {
    font-family: inherit;
    border: none;
    outline: none;
    cursor: pointer;
    background: none;
}

.btn-auth,
.odds-toggle,
.language-toggle,
.hamburger,
.notif-button,
.nav-chip,
.sub-chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    white-space: nowrap;
}

.btn-auth.login {
    background: var(--bg-button-secondary, #222236);
    color: var(--text-secondary, #00eaff);
}

.btn-auth.register {
    background: var(--bg-button-primary, #ffec00);
    color: #000;
}

.btn-auth img {
    width: 14px;
    height: 14px;
}

/* Notification button */
.notif-button {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: var(--bg-panel-soft, #181824);
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.notif-icon {
    width: 18px;
    height: 18px;
}

/* Hamburger - desktop hidden in layout.css / mobile.css */
.hamburger {
    font-size: 20px;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: var(--bg-panel-soft, #181824);
    color: var(--text-secondary, #00eaff);
}

/* -------------------------------------------------------
   HEADER LEFT/RIGHT BLOCKS
-------------------------------------------------------- */

.header-row.row-top .right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
}

/* Brand block */
.brand {
    display: flex;
    align-items: center;
    gap: 10px;
}

.brand .logo {
    width: 34px;
    height: 34px;
}

.brand-text {
    display: flex;
    flex-direction: column;
    line-height: 1.05;
}

.brand-text .name {
    font-size: 15px;
    font-weight: 700;
    color: var(--text-primary, #ffec00);
}

.brand-text .tagline {
    font-size: 11px;
    color: var(--text-muted, #b3b3b3);
}

/* Search box */
.search-notify {
    display: flex;
    align-items: center;
    gap: 8px;
}

.search-box {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 999px;
    background: var(--bg-panel-soft, #181824);
    min-width: 220px;
}

.search-icon {
    width: 14px;
    height: 14px;
}

.search-box input {
    border: none;
    outline: none;
    background: transparent;
    color: var(--text-secondary, #00eaff);
    font-size: 13px;
}

/* -------------------------------------------------------
   MAIN NAV (DESKTOP)
-------------------------------------------------------- */

.main-nav {
    display: flex;
    align-items: center;
    gap: 18px;
}

.main-nav .nav-item {
    position: relative;
    font-size: 13px;
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-muted, #b3b3b3);
    padding: 6px 0;
}

.main-nav .nav-item.active {
    color: var(--text-secondary, #00eaff);
}

.main-nav .nav-item.active::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -4px;
    width: 100%;
    height: 2px;
    border-radius: 999px;
    background: var(--text-secondary, #00eaff);
}

/* Premium link + star centered */
.premium-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: var(--bg-badge-premium, #ff9800);
}

.premium-link .premium-star {
    font-size: 13px;
    line-height: 1;
}

/* -------------------------------------------------------
   SUBNAV (DESKTOP) + BETTING TOOLS DROPDOWN
-------------------------------------------------------- */

.row-sub {
    display: flex;
    align-items: center;
}

.row-sub .subnav-group {
    display: none;
    align-items: center;
    gap: 14px;
}

.row-sub .subnav-group.active {
    display: flex;
}

.sub-item {
    position: relative;
    font-size: 12px;
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted, #b3b3b3);
    padding: 4px 0;
    cursor: pointer;
}

.sub-item:hover {
    color: var(--text-secondary, #00eaff);
}

/* Betting tools container */
.sub-item-tools {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    position: relative;
}

.sub-item-tools .caret {
    width: 10px;
    height: 10px;
}

/* Tools dropdown */
.tools-dropdown {
    position: absolute;
    top: 110%;
    left: 0;
    min-width: 200px;
    background: var(--bg-panel, #11141d);
    border-radius: 8px;
    padding: 6px 0;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.6);
    opacity: 0;
    visibility: hidden;
    transform: translateY(4px);
    transition: opacity 0.15s ease, transform 0.15s ease, visibility 0.15s ease;
    z-index: 50;
}

.tools-dropdown .item {
    padding: 8px 12px;
    font-size: 13px;
    color: var(--text-muted, #b3b3b3);
    white-space: nowrap;
}

.tools-dropdown .item:hover {
    background: var(--bg-panel-soft, #181824);
    color: var(--text-secondary, #00eaff);
}

/* Visible state for all dropdowns (shared class) */
.odds-dropdown,
.language-dropdown,
.tools-dropdown {
    opacity: 0;
    visibility: hidden;
    transform: translateY(4px);
}

.odds-dropdown.show,
.language-dropdown.show,
.tools-dropdown.show {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}

/* -------------------------------------------------------
   ODDS FORMAT + LANGUAGE (DESKTOP)
-------------------------------------------------------- */

.odds-format,
.language-selector {
    position: relative;
}

.odds-toggle,
.language-toggle {
    background: var(--bg-panel-soft, #181824);
    color: var(--text-secondary, #00eaff);
    padding-left: 10px;
    padding-right: 10px;
}

.odds-toggle .label {
    font-size: 11px;
    text-transform: none;
    opacity: 0.7;
}

.odds-toggle .value {
    font-size: 12px;
    font-weight: 600;
}

.icon-caret {
    width: 10px;
    height: 10px;
}

/* Odds dropdown panel */
.odds-dropdown {
    position: absolute;
    right: 0;
    top: 120%;
    min-width: 230px;
    background: var(--bg-panel, #11141d);
    border-radius: 8px;
    padding: 6px 0;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.6);
    z-index: 50;
}

.odds-dropdown .item {
    padding: 8px 12px;
    font-size: 13px;
    color: var(--text-muted, #b3b3b3);
    display: flex;
    justify-content: space-between;
    gap: 10px;
}

.odds-dropdown .item.active {
    color: var(--text-secondary, #00eaff);
}

.odds-dropdown .item:hover {
    background: var(--bg-panel-soft, #181824);
}

/* Language dropdown panel */
.language-dropdown {
    position: absolute;
    right: 0;
    top: 120%;
    min-width: 210px;
    max-height: 260px;
    overflow-y: auto;
    background: var(--bg-panel, #11141d);
    border-radius: 8px;
    padding: 6px 0;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.6);
    z-index: 50;
}

.language-dropdown .item {
    padding: 8px 12px;
    font-size: 13px;
    color: var(--text-muted, #b3b3b3);
    display: flex;
    align-items: center;
    gap: 8px;
}

.language-dropdown .item.active {
    color: var(--text-secondary, #00eaff);
}

.language-dropdown .item:hover {
    background: var(--bg-panel-soft, #181824);
}

/* -------------------------------------------------------
   MOBILE HEADER – CHIPS & ROWS
-------------------------------------------------------- */

.header-mobile .mobile-row {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    gap: 8px;
}

.header-mobile .row-top {
    justify-content: space-between;
}

.header-mobile .top-options {
    display: flex;
    align-items: center;
    gap: 8px;
}

.header-mobile .row-brand .logo {
    width: 30px;
    height: 30px;
}

.header-mobile .row-search .search-box {
    flex: 1;
}

/* Mobile main nav chips */
.mobile-main-nav {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px 10px;
    overflow-x: auto;
}

.nav-chip {
    border-radius: 999px;
    padding: 6px 12px;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background: var(--bg-panel-soft, #181824);
    color: var(--text-muted, #b3b3b3);
    flex-shrink: 0;
}

.nav-chip.active {
    background: var(--bg-button-primary-soft, rgba(255, 236, 0, 0.12));
    color: var(--text-primary, #ffec00);
}

/* Mobile subnav chips */
.mobile-sub-nav {
    padding: 0 12px 10px;
}

.mobile-sub-nav .subnav-group {
    display: none;
    flex-wrap: wrap;
    gap: 6px;
}

.mobile-sub-nav .subnav-group.active {
    display: flex;
}

.sub-chip {
    border-radius: 999px;
    background: var(--bg-panel-soft, #181824);
    color: var(--text-muted, #b3b3b3);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 5px 10px;
}

.sub-chip.tools {
    background: var(--bg-button-secondary, #222236);
    color: var(--text-secondary, #00eaff);
}

/* -------------------------------------------------------
   MOBILE MODAL
-------------------------------------------------------- */

.be-modal-overlay {
    position: fixed;
    inset: 0;
    display: none;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.7);
    z-index: 1000;
}

.be-modal-overlay.show {
    display: flex;
}

.be-modal {
    width: 90%;
    max-width: 360px;
    background: var(--bg-panel, #11141d);
    border-radius: 14px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.7);
    overflow: hidden;
}

.be-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    background: var(--bg-panel-strong, #0d0d16);
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.be-modal-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-secondary, #00eaff);
}

.be-modal-close {
    width: 28px;
    height: 28px;
    border-radius: 999px;
    background: var(--bg-panel-soft, #181824);
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.be-modal-close img {
    width: 12px;
    height: 12px;
}

.be-modal-body {
    padding: 8px 0;
}

.be-modal-section {
    display: none;
}

.be-modal-section.active {
    display: block;
}

.be-modal-item {
    width: 100%;
    text-align: left;
    padding: 8px 14px;
    font-size: 13px;
    color: var(--text-muted, #b3b3b3);
    background: transparent;
}

.be-modal-item:hover {
    background: var(--bg-panel-soft, #181824);
    color: var(--text-secondary, #00eaff);
}

/* -------------------------------------------------------
   RESPONSIVE HOOKS (DESKTOP vs MOBILE)
   (Visibility itself kontrollohet në desktop.css + mobile.css)
-------------------------------------------------------- */

/* No visibility rules here on purpose – only style.
   Desktop/mobile display is controlled in desktop.css and mobile.css. */
