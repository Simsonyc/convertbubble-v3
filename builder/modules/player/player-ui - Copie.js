// IA-B Jour4 Audit:
// - removed inline “panel/window” look (no heavy bg/shadow/fixed/z-index)
// - moved to skin-friendly CSS vars + tiny local CSS scoped to rootEl
// - kept rootEl-only injection, added SAFE MODE guards (never crash UI)
import { ensurePrestigeSharedStyles } from "../prestige-shared.js";
import { Actions } from "../../core/actions.js";
import { selectPlayer } from "../../core/selectors.js";

/**
 * Player Builder UI — V3 Contractuel (Jour 4)
 *
 * Invariants:
 * - rootEl required (HTMLElement) else throw
 * - rootEl only (no document.body)
 * - no shell / no fixed / no z-index hacks
 * - skin-friendly via CSS vars (no theme hardcode)
 * - SAFE MODE: never crash bootstrap if DOM missing
 * - returns { sync, destroy }
 */
export function initPlayerUI({ core, selectors, render, rootEl }) {
  //ensurePrestigeSharedStyles();
  if (!rootEl || !(rootEl instanceof HTMLElement)) {
    throw new Error("[PlayerUI] rootEl required (HTMLElement).");
  }

  // ---------- helpers ----------
  function safeClear(el) {
    try {
      el.innerHTML = "";
    } catch (_) {
      // SAFE MODE: do nothing
    }
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
    } catch (_) {
      // SAFE MODE: ignore
    }
  }

 function createSectionRoot(root, titleText) {
  safeClear(root);

  const wrap = document.createElement("div");
  wrap.className = "cb-ui cb-prestige cb-ui--player";

 const header = document.createElement("div");
header.className = "cb-ui__header";

const title = document.createElement("h3");
title.className = "cb-ui__title";
title.textContent = titleText;

header.appendChild(title);

// ✅ SURFACE PRESTIGE (IDENTIQUE À BUBBLE)
const surface = document.createElement("div");
surface.className = "cbp-surface";

// ✅ règle Bubble : header DANS la surface
surface.appendChild(header);

const body = document.createElement("div");
body.className = "cb-ui__body";

surface.appendChild(body);
wrap.appendChild(surface);

safeAppend(root, wrap);

return { wrap, body };


}

  // ---------- DOM build ----------
  const { body } = createSectionRoot(rootEl, "Player");

  const card = document.createElement("div");
  card.className = "cb-card";

  const row = document.createElement("div");
  row.className = "cb-row";

  const label = document.createElement("label");
  label.textContent = "URL vidéo";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "https://…";
  input.autocomplete = "off";

  const actionsRow = document.createElement("div");
  actionsRow.className = "cb-actions";

  const btnPreview = document.createElement("button");
  btnPreview.type = "button";
  btnPreview.textContent = "Prévisualiser";

  const hint = document.createElement("div");
  hint.className = "cb-hint";
  hint.textContent = "Colle une URL puis clique “Prévisualiser”.";

  const video = document.createElement("video");
  video.controls = true;
  video.autoplay = false;
  video.preload = "metadata";

  row.appendChild(label);
  row.appendChild(input);
  actionsRow.appendChild(btnPreview);

  card.appendChild(row);
  card.appendChild(actionsRow);
  card.appendChild(hint);

  safeAppend(body, card);
  safeAppend(body, video);

  // ---------- listeners / cleanup ----------
  const cleanups = [];

  function on(el, evt, fn, opts) {
    if (!el || !el.addEventListener) return;
    el.addEventListener(evt, fn, opts);
    cleanups.push(() => {
      try {
        el.removeEventListener(evt, fn, opts);
      } catch (_) {
        // SAFE MODE
      }
    });
  }

  // ---------- Core → UI (idempotent) ----------
  function sync() {
    try {
      if (!core || typeof core.getState !== "function") return;

      const state = core.getState();
      const player = selectPlayer(state);
      const src = player?.src || "";

      if (input && input.value !== src) input.value = src;

      // <video>.src is always absolute after assignment in some browsers;
      // so we compare using getAttribute for stability.
      const currentAttr = video ? video.getAttribute("src") || "" : "";
      if (video && currentAttr !== src) {
        if (src) video.setAttribute("src", src);
        else video.removeAttribute("src");
        // refresh media element
        try {
          video.load();
        } catch (_) {
          // SAFE MODE
        }
      }
    } catch (_) {
      // SAFE MODE: never crash
    }
  }

  // ---------- UI → Core (dispatch + render strict) ----------
  function commitSrc() {
    try {
      const src = input?.value || "";
      if (core && typeof core.dispatch === "function") {
        core.dispatch(Actions.playerSetSrc(src));
      }
      if (typeof render === "function") render();
    } catch (_) {
      // SAFE MODE
    }
  }

  on(btnPreview, "click", commitSrc);
  on(input, "change", commitSrc);

  // Sync initial
  sync();

  function destroy() {
    while (cleanups.length) cleanups.pop()();

    try {
      if (video && typeof video.pause === "function") video.pause();
      if (video) {
        video.removeAttribute("src");
        try {
          video.load();
        } catch (_) {}
      }
    } catch (_) {}

    safeClear(rootEl);
  }

  return { sync, destroy };
}

