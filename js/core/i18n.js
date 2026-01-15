/*********************************************************
 * BetEngine Enterprise – i18n module (FOUNDATION v1)
 *
 * RULES
 * - Registers via window.BeInit
 * - Listens to be:langChanged (from header.js + header-mobile.js)
 * - Loads dictionaries from: assets/i18n/{code}.json
 * - Applies translations to DOM via:
 *     - [data-i18n]              -> textContent
 *     - [data-i18n-placeholder]  -> placeholder
 *     - [data-i18n-title]        -> title
 *********************************************************/

(() => {
  "use strict";

  const MODULE_NAME = "i18n";
  const DEFAULT_LANG = "en";
  const DICT_BASE = "assets/i18n";

  // Cache dictionaries by code
  const dictCache = new Map();

  // Current language state
  let currentLang = "";

  const safeJsonParse = (raw) => {
    try { return JSON.parse(raw); } catch (_) { return null; }
  };

  const readLangFromStorage = () => {
    // Desktop wins by design; storage is mirrored, but we still follow the rule.
    const d = safeJsonParse(localStorage.getItem("be_lang_desktop") || "null");
    if (d && typeof d === "object") {
      const code = typeof d.code === "string" ? d.code.trim() : "";
      const label = typeof d.label === "string" ? d.label.trim() : "";
      if (code || label) return { code, label };
    }
    const m = safeJsonParse(localStorage.getItem("be_lang_mobile") || "null");
    if (m && typeof m === "object") {
      const code = typeof m.code === "string" ? m.code.trim() : "";
      const label = typeof m.label === "string" ? m.label.trim() : "";
      if (code || label) return { code, label };
    }
    return null;
  };

  const resolveInitialLang = () => {
    // 1) If core bus already holds it
    if (window.BE_LANG && window.BE_LANG.current) {
      const c = window.BE_LANG.current;
      const code = typeof c.code === "string" ? c.code.trim() : "";
      if (code) return code;
    }

    // 2) Storage
    try {
      const stored = readLangFromStorage();
      if (stored && stored.code) return stored.code;
    } catch (_) {}

    // 3) <html lang="">
    const htmlLang = (document.documentElement && document.documentElement.getAttribute("lang")) || "";
    if (typeof htmlLang === "string" && htmlLang.trim()) return htmlLang.trim();

    return DEFAULT_LANG;
  };

  const getByPath = (obj, path) => {
  if (!obj || !path) return null;

  // 1) Flat-key support (e.g. "header.language")
  if (Object.prototype.hasOwnProperty.call(obj, path)) {
    return obj[path];
  }

  // 2) Nested support (e.g. header: { language: "..." })
  const parts = String(path).split(".");
  let cur = obj;
  for (const p of parts) {
    if (!cur || typeof cur !== "object" || !(p in cur)) return null;
    cur = cur[p];
  }
  return cur;
};

  const t = (key) => {
    const dict = dictCache.get(currentLang) || null;
    const val = getByPath(dict, key);
    return (typeof val === "string") ? val : null;
  };

  const applyTranslations = () => {
    // textContent
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = (el.getAttribute("data-i18n") || "").trim();
      if (!key) return;
      const val = t(key);
      if (val !== null) el.textContent = val;
    });

    // placeholder
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = (el.getAttribute("data-i18n-placeholder") || "").trim();
      if (!key) return;
      const val = t(key);
      if (val !== null) el.setAttribute("placeholder", val);
    });

    // title
    document.querySelectorAll("[data-i18n-title]").forEach((el) => {
      const key = (el.getAttribute("data-i18n-title") || "").trim();
      if (!key) return;
      const val = t(key);
      if (val !== null) el.setAttribute("title", val);
    });
  };

  const loadDictionary = async (code) => {
    const lang = (code || "").trim() || DEFAULT_LANG;
    if (dictCache.has(lang)) return dictCache.get(lang);

    const url = `${DICT_BASE}/${encodeURIComponent(lang)}.json`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`i18n dictionary fetch failed: ${lang} (${res.status})`);
    const json = await res.json();

    if (!json || typeof json !== "object") {
      throw new Error(`i18n dictionary invalid: ${lang}`);
    }

    dictCache.set(lang, json);
    return json;
  };

  const setLanguage = async (code) => {
    const next = (code || "").trim() || DEFAULT_LANG;
    if (next === currentLang && dictCache.has(next)) {
      applyTranslations();
      return;
    }

    currentLang = next;

    // Keep <html lang=""> aligned (safety)
    try {
      document.documentElement.setAttribute("lang", next);
    } catch (_) {}

    try {
      await loadDictionary(next);
    } catch (err) {
      // Fail-safe: fallback to default if the requested lang dictionary fails
      if (next !== DEFAULT_LANG) {
        currentLang = DEFAULT_LANG;
        try { document.documentElement.setAttribute("lang", DEFAULT_LANG); } catch (_) {}
        await loadDictionary(DEFAULT_LANG);
      } else {
        throw err;
      }
    }

    applyTranslations();

    // Optional: announce readiness for other modules (non-breaking)
    try {
      document.dispatchEvent(new CustomEvent("be:i18nReady", { detail: { code: currentLang } }));
    } catch (_) {}
  };

  const init = () => {
    // Listen for language changes coming from headers
    document.addEventListener("be:langChanged", (e) => {
      const detail = (e && e.detail && typeof e.detail === "object") ? e.detail : {};
      const code = (typeof detail.code === "string") ? detail.code.trim() : "";
      if (!code) return;
      setLanguage(code);
    });

    // Initial apply
    const initial = resolveInitialLang();
    setLanguage(initial);
  };

  // Register module in enterprise init bus
  window.BeInit = window.BeInit || [];
  window.BeInit.push({ name: MODULE_NAME, init });

  // Expose minimal public API
  window.BeI18n = {
    setLanguage,
    t,
    apply: applyTranslations,
    getLanguage: () => currentLang || DEFAULT_LANG
  };
})();
