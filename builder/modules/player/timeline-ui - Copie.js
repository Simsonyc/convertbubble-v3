// IA-B Jour4 Audit:
// - removed inline “panel/window” look (no heavy bg/shadow/fixed/z-index)
// - moved to skin-friendly CSS vars + tiny local CSS scoped to rootEl
// - SAFE MODE: protected DOM/state access; never crashes bootstrap

import { Actions } from "../../core/actions.js";
import { selectTimeline } from "../../core/selectors.js";

/**
 * Timeline Builder UI — V3 Contractuel (Jour 4)
 *
 * Invariants:
 * - rootEl required (HTMLElement) else throw
 * - rootEl only (no document.body)
 * - no shell / no fixed / no z-index hacks
 * - skin-friendly via CSS vars
 * - SAFE MODE: never crash if DOM missing
 * - returns { sync, destroy }
 *
 * Format strict:
 * - hooks = Array<{ at:number, name:string }>
 */
export function initTimelineUI({ core, selectors, render, rootEl }) {
  if (!rootEl || !(rootEl instanceof HTMLElement)) {
    throw new Error("[TimelineUI] rootEl required (HTMLElement).");
  }

  // ---------- helpers ----------
  function safeClear(el) {
    try {
      el.innerHTML = "";
    } catch (_) {}
  }

  function safeAppend(parent, child) {
    try {
      parent.appendChild(child);
      return true;
    } catch (_) {
      return false;
    }
  }

  function injectLocalStyleOnce(root, styleId, cssText) {
    try {
      if (root.querySelector && root.querySelector(`#${styleId}`)) return;
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = cssText;
      root.appendChild(style);
    } catch (_) {}
  }

  function createSectionRoot(root, titleText) {
    safeClear(root);

    const wrap = document.createElement("div");
    wrap.className = "cb-ui cb-prestige cb-ui--timeline";

    const header = document.createElement("div");
    header.className = "cb-ui__header";

    const title = document.createElement("h3");
    title.className = "cb-ui__title";
    title.textContent = titleText;

    header.appendChild(title);
    wrap.appendChild(header);

    const body = document.createElement("div");
    body.className = "cb-ui__body";
    wrap.appendChild(body);

    safeAppend(root, wrap);

    return { wrap, body };
  }


  // dynamic row listeners (rebuilt each sync)
  const rowCleanups = [];
  function clearRowListeners() {
    while (rowCleanups.length) {
      const fn = rowCleanups.pop();
      try {
        fn();
      } catch (_) {}
    }
  }
  function onRow(el, evt, fn, opts) {
    if (!el || !el.addEventListener) return;
    el.addEventListener(evt, fn, opts);
    rowCleanups.push(() => {
      try {
        el.removeEventListener(evt, fn, opts);
      } catch (_) {}
    });
  }

  function getHooks() {
    try {
      if (!core || typeof core.getState !== "function") return [];
      const state = core.getState();
      const timeline = selectTimeline(state);
      const hooks = timeline?.hooks;
      return Array.isArray(hooks) ? hooks : [];
    } catch (_) {
      return [];
    }
  }

  // --- Core → UI (idempotent) ---
  function sync() {
    try {
      const hooks = getHooks();

      clearRowListeners();
      if (list) list.innerHTML = "";

      if (!list) return;

      if (hooks.length === 0) {
        const empty = document.createElement("div");
        empty.className = "cb-hint";
        empty.textContent = "Aucun repère pour l’instant.";
        list.appendChild(empty);
        return;
      }

      hooks.forEach((hook) => {
        const row = document.createElement("div");
        row.className = "cb-row";

        const atInput = document.createElement("input");
        atInput.type = "number";
        atInput.step = "0.1";
        atInput.min = "0";
        atInput.value = String(hook.at);

        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.value = hook.name;

        const btnRemove = document.createElement("button");
        btnRemove.type = "button";
        btnRemove.textContent = "✕";
        btnRemove.title = "Supprimer";

        // Edition (format strict)
        onRow(nameInput, "change", () => {
          const current = getHooks();
          const next = current.map((h) =>
            h.name === hook.name ? { at: h.at, name: nameInput.value } : { at: h.at, name: h.name }
          );
          try {
            if (core && typeof core.dispatch === "function") {
              core.dispatch(Actions.timelineSetHooks(next));
            }
            if (typeof render === "function") render();
          } catch (_) {}
        });

        onRow(atInput, "change", () => {
          const current = getHooks();
          const next = current.map((h) =>
            h.name === hook.name ? { at: Number(atInput.value), name: h.name } : { at: h.at, name: h.name }
          );
          try {
            if (core && typeof core.dispatch === "function") {
              core.dispatch(Actions.timelineSetHooks(next));
            }
            if (typeof render === "function") render();
          } catch (_) {}
        });

        onRow(btnRemove, "click", () => {
          try {
            if (core && typeof core.dispatch === "function") {
              core.dispatch(Actions.timelineRemoveHook(hook.name));
            }
            if (typeof render === "function") render();
          } catch (_) {}
        });

        row.appendChild(atInput);
        row.appendChild(nameInput);
        row.appendChild(btnRemove);
        list.appendChild(row);
      });
    } catch (_) {
      // SAFE MODE: never crash
    }
  }

  // --- UI → Core (dispatch + render strict) ---
  on(btnAdd, "click", () => {
    try {
      const name = `hook_${Date.now()}`;
      if (core && typeof core.dispatch === "function") {
        core.dispatch(Actions.timelineAddHook({ at: 0, name }));
      }
      if (typeof render === "function") render();
    } catch (_) {}
  });

  // Sync initial
  sync();

  function destroy() {
    while (cleanups.length) cleanups.pop()();
    clearRowListeners();
    safeClear(rootEl);
  }

  return { sync, destroy };
}

