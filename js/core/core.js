/*********************************************************
 * BetEngine Enterprise – CORE JS (FINAL)
 * Global helpers, event bus, state store, logging, storage
 * No API calls, no side effects on HTML or CSS.
 *********************************************************/

(function (window, document) {
    "use strict";

    /*******************************************************
     * 1. LOGGER
     *******************************************************/
    const LOG_NAMESPACE = "[BetEngine]";

    const log = {
        debug: (...args) => {
            if (window && window.BE_DEBUG) {
                console.debug(LOG_NAMESPACE, "[DEBUG]", ...args);
            }
        },
        info: (...args) => {
            console.info(LOG_NAMESPACE, "[INFO]", ...args);
        },
        warn: (...args) => {
            console.warn(LOG_NAMESPACE, "[WARN]", ...args);
        },
        error: (...args) => {
            console.error(LOG_NAMESPACE, "[ERROR]", ...args);
        }
    };

    /*******************************************************
     * 2. DOM HELPERS
     *******************************************************/
    const dom = {
        qs(selector, scope) {
            return (scope || document).querySelector(selector);
        },
        qsa(selector, scope) {
            return Array.prototype.slice.call(
                (scope || document).querySelectorAll(selector)
            );
        },
        on(target, type, handler, options) {
            if (!target) return;
            target.addEventListener(type, handler, options || false);
        },
        off(target, type, handler, options) {
            if (!target) return;
            target.removeEventListener(type, handler, options || false);
        },
        delegate(root, selector, type, handler) {
            if (!root) return;
            root.addEventListener(type, function (event) {
                const potential = dom.qsa(selector, root);
                const target = event.target;
                for (let i = 0, l = potential.length; i < l; i++) {
                    const el = potential[i];
                    if (el === target || el.contains(target)) {
                        handler.call(el, event);
                        break;
                    }
                }
            });
        },
        addClass(el, className) {
            if (!el) return;
            el.classList.add(className);
        },
        removeClass(el, className) {
            if (!el) return;
            el.classList.remove(className);
        },
        toggleClass(el, className, force) {
            if (!el) return;
            if (typeof force === "boolean") {
                el.classList.toggle(className, force);
            } else {
                el.classList.toggle(className);
            }
        }
    };

    /*******************************************************
     * 3. SIMPLE EVENT BUS
     *******************************************************/
    const events = (function () {
        const listeners = {};

        function on(eventName, handler) {
            if (!listeners[eventName]) {
                listeners[eventName] = [];
            }
            listeners[eventName].push(handler);
        }

        function off(eventName, handler) {
            if (!listeners[eventName]) return;
            listeners[eventName] = listeners[eventName].filter(fn => fn !== handler);
        }

        function emit(eventName, payload) {
            if (!listeners[eventName]) return;
            listeners[eventName].forEach(fn => {
                try {
                    fn(payload);
                } catch (err) {
                    log.error("Event handler error for", eventName, err);
                }
            });
        }

        function clear(eventName) {
            if (eventName) {
                delete listeners[eventName];
            } else {
                Object.keys(listeners).forEach(key => delete listeners[key]);
            }
        }

        return {
            on,
            off,
            emit,
            clear
        };
    })();

    /*******************************************************
     * 4. IN-MEMORY STATE STORE
     *******************************************************/
    const state = (function () {
        const store = {};

        function set(key, value) {
            store[key] = value;
            events.emit("state:change", { key, value });
        }

        function get(key, fallback) {
            return Object.prototype.hasOwnProperty.call(store, key)
                ? store[key]
                : fallback;
        }

        function remove(key) {
            if (Object.prototype.hasOwnProperty.call(store, key)) {
                delete store[key];
                events.emit("state:remove", { key });
            }
        }

        function clear() {
            Object.keys(store).forEach(k => delete store[k]);
            events.emit("state:clear");
        }

        return {
            set,
            get,
            remove,
            clear
        };
    })();

    /*******************************************************
     * 5. SAFE STORAGE WRAPPER (localStorage)
     *******************************************************/
    const storage = (function () {
        const isAvailable = (function () {
            try {
                const testKey = "__be_test__";
                window.localStorage.setItem(testKey, "1");
                window.localStorage.removeItem(testKey);
                return true;
            } catch (e) {
                return false;
            }
        })();

        function set(key, value) {
            if (!isAvailable) return;
            try {
                const serialized = JSON.stringify(value);
                window.localStorage.setItem(key, serialized);
            } catch (err) {
                log.warn("Failed to write to storage", key, err);
            }
        }

        function get(key, fallback) {
            if (!isAvailable) return fallback;
            try {
                const raw = window.localStorage.getItem(key);
                if (raw === null) return fallback;
                return JSON.parse(raw);
            } catch (err) {
                log.warn("Failed to read from storage", key, err);
                return fallback;
            }
        }

        function remove(key) {
            if (!isAvailable) return;
            try {
                window.localStorage.removeItem(key);
            } catch (err) {
                log.warn("Failed to remove from storage", key, err);
            }
        }

        function clear() {
            if (!isAvailable) return;
            try {
                window.localStorage.clear();
            } catch (err) {
                log.warn("Failed to clear storage", err);
            }
        }

        return {
            set,
            get,
            remove,
            clear,
            isAvailable
        };
    })();

    /*******************************************************
     * 6. PUBLIC API EXPORT
     *******************************************************/
    const BetEngineCore = {
        log,
        dom,
        events,
        state,
        storage
    };

    // Expose globally
    window.BetEngineCore = BetEngineCore;

    /*******************************************************
     * 7. INITIAL HELLO LOG (optional)
     *******************************************************/
    log.info("Core initialized");

})(window, document);

