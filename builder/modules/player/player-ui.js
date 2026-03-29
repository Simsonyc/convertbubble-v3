// /builder/modules/player/player-ui.js
// ConvertBubble Builder V3 — Prestige Dark Skin
// Contrat : initPlayerUI({ core, selectors, render, rootEl }) → { sync, destroy }
import { Actions } from "../../core/actions.js";
import { selectPlayer, selectPlayerStyle, selectPlayerBranding } from "../../core/selectors.js";

// ---------- helpers ----------
function safeClear(el) {
  try { el.innerHTML = ""; } catch (_) {}
}

function safeAppend(parent, child) {
  try { parent.appendChild(child); return true; } catch (_) { return false; }
}

function updateRangeFill(input) {
  if (!input) return;
  const min = parseFloat(input.min) || 0;
  const max = parseFloat(input.max) || 100;
  const val = parseFloat(input.value) || 0;
  const pct = ((val - min) / (max - min)) * 100;
  input.style.background = `linear-gradient(90deg, var(--cb-accent) ${pct}%, var(--cb-muted2) ${pct}%)`;
}

export function initPlayerUI({ core, selectors, render, rootEl }) {
  if (!rootEl || !(rootEl instanceof HTMLElement)) {
    throw new Error("[PlayerUI] rootEl required (HTMLElement).");
  }

  safeClear(rootEl);

  // ---- Local style ----
  const style = document.createElement("style");
  style.id = "cb-player-ui-style";
  style.textContent = `
    .cb-player-ui {
      width: 100%;
      color: var(--cb-text, #ede8df);
      font-family: inherit;
    }

    /* Scope bar */
    .cb-player-ui .cb-scope-bar {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 7px 12px;
      background: var(--cb-inset, #0c0b09);
      border: 1px solid var(--cb-border, rgba(255,235,190,0.06));
      border-radius: 10px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 11px;
      overflow-x: auto;
      scrollbar-width: none;
      margin-bottom: 12px;
    }
    .cb-player-ui .cb-scope-bar::-webkit-scrollbar { display: none; }
    .cb-player-ui .cb-scope-key {
      color: var(--cb-muted, #6e6a62);
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: .07em;
      margin-right: 3px;
    }
    .cb-player-ui .cb-scope-val {
      color: var(--cb-green, #22d3a0);
      text-shadow: 0 0 7px rgba(34,211,160,0.4);
      font-size: 12px;
      white-space: nowrap;
    }
    .cb-player-ui .cb-scope-item {
      display: flex; align-items: center; gap: 4px; flex-shrink: 0;
    }

    /* Surface */
    .cb-player-ui .cbp-surface {
      background: var(--cb-panel, #201e1b);
      border: 1px solid var(--cb-border2, rgba(255,235,190,0.10));
      border-radius: 14px;
      overflow: hidden;
    }
    .cb-player-ui .cb-ui__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 11px 14px;
      background: var(--cb-rail, #1a1917);
      border-bottom: 0.5px solid var(--cb-border, rgba(255,235,190,0.06));
    }
    .cb-player-ui .cb-ui__title {
      margin: 0;
      font-size: 13px;
      font-weight: 800;
      color: var(--cb-text, #ede8df);
      display: flex; align-items: center; gap: 8px;
    }
    .cb-player-ui .cb-ui__title-dot {
      width: 7px; height: 7px;
      border-radius: 999px;
      background: var(--cb-accent, #4f8cff);
      box-shadow: 0 0 7px var(--cb-accent, #4f8cff);
      flex-shrink: 0;
    }
    .cb-player-ui .cb-ui__body {
      padding: 14px;
      display: grid;
      gap: 0;
    }

    /* Section */
    .cb-player-ui .cb-section {
      padding: 14px 0;
      border-bottom: 0.5px solid var(--cb-border, rgba(255,235,190,0.06));
    }
    .cb-player-ui .cb-section:first-child { padding-top: 0; }
    .cb-player-ui .cb-section:last-child { border-bottom: none; padding-bottom: 0; }
    .cb-player-ui .cb-section__title {
      font-size: 10px; font-weight: 700;
      letter-spacing: .08em; text-transform: uppercase;
      color: var(--cb-muted, #6e6a62);
      margin: 0 0 12px;
    }

    .cb-player-ui .cb-label {
      font-size: 11px; font-weight: 700;
      letter-spacing: .02em;
      color: var(--cb-muted, #6e6a62);
      margin-bottom: 6px;
    }

    .cb-player-ui .cb-input,
    .cb-player-ui .cb-select {
      width: 100%;
      height: 38px;
      border-radius: 10px;
      border: 1px solid var(--cb-border2, rgba(255,235,190,0.10));
      background: var(--cb-inset, #0c0b09);
      color: var(--cb-text, #ede8df);
      padding: 0 10px;
      font-size: 13px;
      font-family: inherit;
      outline: none;
      appearance: none;
      -webkit-appearance: none;
      transition: border-color .15s, box-shadow .15s;
    }
    .cb-player-ui .cb-input:focus,
    .cb-player-ui .cb-select:focus {
      border-color: var(--cb-accent, #4f8cff);
      box-shadow: 0 0 0 3px rgba(79,140,255,0.18);
    }
    .cb-player-ui .cb-input::placeholder { color: var(--cb-muted2, #3e3b35); }

    .cb-player-ui .cb-range {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 4px;
      border-radius: 999px;
      outline: none;
      cursor: pointer;
      background: var(--cb-muted2, #3e3b35);
    }
    .cb-player-ui .cb-range::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 16px; height: 16px;
      border-radius: 999px;
      background: #fff;
      box-shadow: 0 0 0 2px var(--cb-accent, #4f8cff), 0 0 10px rgba(79,140,255,0.45);
      cursor: pointer;
    }
    .cb-player-ui .cb-range::-moz-range-thumb {
      width: 16px; height: 16px;
      border-radius: 999px;
      border: none;
      background: #fff;
      box-shadow: 0 0 0 2px var(--cb-accent, #4f8cff), 0 0 10px rgba(79,140,255,0.45);
      cursor: pointer;
    }

    .cb-player-ui .cb-live-val {
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 11px; font-weight: 600;
      color: var(--cb-green, #22d3a0);
      text-shadow: 0 0 6px rgba(34,211,160,0.35);
      letter-spacing: .03em;
      margin-top: 5px;
    }

    .cb-player-ui .cb-color {
      width: 48px; height: 38px;
      border-radius: 10px;
      border: 1px solid var(--cb-border2, rgba(255,235,190,0.10));
      background: var(--cb-inset, #0c0b09);
      padding: 4px;
      cursor: pointer;
      flex-shrink: 0;
    }
    .cb-player-ui .cb-color::-webkit-color-swatch-wrapper { padding: 0; border-radius: 8px; }
    .cb-player-ui .cb-color::-webkit-color-swatch { border: none; border-radius: 8px; }

    .cb-player-ui .cb-row {
      display: flex; align-items: center; gap: 8px;
    }
    .cb-player-ui .cb-grow { flex: 1; }
    .cb-player-ui .cb-grid-2 {
      display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
    }
    @media (max-width: 420px) {
      .cb-player-ui .cb-grid-2 { grid-template-columns: 1fr; }
    }

    .cb-player-ui .cb-btn {
      display: inline-flex; align-items: center; justify-content: center;
      padding: 9px 18px;
      border-radius: 10px;
      border: 1px solid rgba(200,151,58,0.35);
      background: linear-gradient(160deg, rgba(200,151,58,0.18), rgba(200,151,58,0.08));
      color: var(--cb-amber2, #e8b45a);
      font-size: 13px; font-weight: 700; font-family: inherit;
      cursor: pointer;
      transition: all .15s;
      box-shadow: 0 0 14px rgba(200,151,58,0.12);
    }
    .cb-player-ui .cb-btn:hover {
      border-color: rgba(200,151,58,0.55);
      box-shadow: 0 0 20px rgba(200,151,58,0.25);
      color: #fff;
    }
    .cb-player-ui .cb-btn:active { transform: scale(0.97); }

    .cb-player-ui .cb-hint {
      font-size: 12px; color: var(--cb-muted, #6e6a62);
      font-weight: 600; font-style: italic;
    }

    .cb-player-ui .cb-video-preview {
      width: 100%; border-radius: 10px;
      border: 1px solid var(--cb-border2, rgba(255,235,190,0.10));
      background: var(--cb-inset, #0c0b09);
      display: none;
    }
    .cb-player-ui .cb-video-preview.is-visible { display: block; }

    /* Toggle switch (branding enabled) */
    .cb-player-ui .cb-toggle {
      position: relative; display: inline-flex;
      align-items: center; gap: 8px;
      cursor: pointer; user-select: none;
    }
    .cb-player-ui .cb-toggle input[type="checkbox"] {
      opacity: 0; width: 0; height: 0; position: absolute;
    }
    .cb-player-ui .cb-toggle__track {
      width: 36px; height: 20px;
      border-radius: 999px;
      background: var(--cb-muted2, #3e3b35);
      transition: background .2s;
      flex-shrink: 0;
    }
    .cb-player-ui .cb-toggle input:checked + .cb-toggle__track {
      background: var(--cb-accent, #4f8cff);
    }
    .cb-player-ui .cb-toggle__thumb {
      position: absolute;
      top: 3px; left: 3px;
      width: 14px; height: 14px;
      border-radius: 999px;
      background: #fff;
      transition: transform .2s;
      pointer-events: none;
    }
    .cb-player-ui .cb-toggle input:checked ~ .cb-toggle__thumb {
      transform: translateX(16px);
    }
    .cb-player-ui .cb-toggle__label {
      font-size: 12px; font-weight: 700;
      color: var(--cb-muted, #6e6a62);
    }

    /* Chips mode branding */
    .cb-player-ui .cb-chips {
      display: flex; flex-wrap: wrap; gap: 6px;
    }
    .cb-player-ui .cb-chip-item {
      padding: 6px 14px;
      border-radius: 999px;
      border: 1px solid var(--cb-border2, rgba(255,235,190,0.10));
      background: var(--cb-inset, #0c0b09);
      color: var(--cb-muted, #6e6a62);
      font-size: 12px; font-weight: 700;
      cursor: pointer; transition: all .15s;
      user-select: none;
    }
    .cb-player-ui .cb-chip-item:hover {
      border-color: var(--cb-border3, rgba(255,235,190,0.18));
      color: var(--cb-text, #ede8df);
    }
    .cb-player-ui .cb-chip-item.is-active {
      background: rgba(79,140,255,0.12);
      border-color: rgba(79,140,255,0.35);
      color: var(--cb-accent2, #7cacff);
    }
  `;

  rootEl.appendChild(style);

  // ---- DOM ----
  const root = document.createElement("div");
  root.className = "cb-player-ui";
  root.innerHTML = `
    <!-- Scope bar -->
    <div class="cb-scope-bar">
      <span class="cb-scope-item">
        <span class="cb-scope-key">SRC</span>
        <span class="cb-scope-val" id="pl-scope-src">—</span>
      </span>
      <span class="cb-scope-item">
        <span class="cb-scope-key">RADIUS</span>
        <span class="cb-scope-val" id="pl-scope-radius">—</span>
      </span>
      <span class="cb-scope-item">
        <span class="cb-scope-key">BRANDING</span>
        <span class="cb-scope-val" id="pl-scope-branding">—</span>
      </span>
    </div>

    <div class="cbp-surface">
      <div class="cb-ui__header">
        <h3 class="cb-ui__title">
          <span class="cb-ui__title-dot"></span>
          Player
        </h3>
      </div>

      <div class="cb-ui__body">

        <!-- SECTION — SOURCE VIDÉO -->
        <div class="cb-section">
          <div class="cb-section__title">Source vidéo</div>
          <div class="cb-label">URL vidéo</div>
          <div class="cb-row">
            <input id="pl-src" type="text" class="cb-input cb-grow" placeholder="https://…" autocomplete="off" />
            <button id="pl-preview-btn" type="button" class="cb-btn">▶ Prévisualiser</button>
          </div>
          <div id="pl-hint" class="cb-hint" style="margin-top:6px;">Colle une URL puis clique "Prévisualiser".</div>
          <video id="pl-video" class="cb-video-preview" controls preload="metadata"></video>
        </div>

        <!-- SECTION — STYLE -->
        <div class="cb-section">
          <div class="cb-section__title">Style player</div>

          <div class="cb-grid-2">
            <div>
              <div class="cb-label">Bordure couleur</div>
              <div class="cb-row">
                <input id="pl-border-color" type="color" class="cb-color" />
              </div>
            </div>
            <div>
              <div class="cb-label">Épaisseur bordure</div>
              <input id="pl-border-width" type="range" min="0" max="12" step="1" class="cb-range" />
              <div id="pl-border-width-lbl" class="cb-live-val"></div>
            </div>
          </div>

          <div style="margin-top:12px;">
            <div class="cb-label">Border radius</div>
            <input id="pl-radius" type="range" min="0" max="32" step="1" class="cb-range" />
            <div id="pl-radius-lbl" class="cb-live-val"></div>
          </div>

          <div style="margin-top:12px;">
            <div class="cb-label">Shadow</div>
            <div class="cb-chips" id="pl-shadow-chips">
              <button type="button" class="cb-chip-item" data-shadow="none">Aucune</button>
              <button type="button" class="cb-chip-item" data-shadow="sm">Légère</button>
              <button type="button" class="cb-chip-item" data-shadow="md">Moyenne</button>
              <button type="button" class="cb-chip-item" data-shadow="lg">Forte</button>
            </div>
          </div>
        </div>

        <!-- SECTION — BRANDING -->
        <div class="cb-section">
          <div class="cb-section__title">Branding</div>

          <label class="cb-toggle">
            <input id="pl-branding-enabled" type="checkbox" />
            <div class="cb-toggle__track"></div>
            <div class="cb-toggle__thumb"></div>
            <span class="cb-toggle__label">Afficher le branding</span>
          </label>

          <div id="pl-branding-body" style="margin-top:12px; display:grid; gap:10px;">
            <div>
              <div class="cb-label">Mode</div>
              <div class="cb-chips" id="pl-branding-mode-chips">
                <button type="button" class="cb-chip-item" data-mode="logo">Logo</button>
                <button type="button" class="cb-chip-item" data-mode="text">Texte</button>
                <button type="button" class="cb-chip-item" data-mode="both">Les deux</button>
              </div>
            </div>
            <div>
              <div class="cb-label">Label branding</div>
              <input id="pl-branding-label" type="text" class="cb-input" placeholder="Mon Branding" />
            </div>
            <div>
              <div class="cb-label">URL branding</div>
              <input id="pl-branding-url" type="text" class="cb-input" placeholder="https://…" />
            </div>
          </div>
        </div>

      </div>
    </div>
  `;

  safeAppend(rootEl, root);

  // ---- Refs ----
  const srcInput       = root.querySelector("#pl-src");
  const previewBtn     = root.querySelector("#pl-preview-btn");
  const video          = root.querySelector("#pl-video");
  const borderColorEl  = root.querySelector("#pl-border-color");
  const borderWidthEl  = root.querySelector("#pl-border-width");
  const borderWidthLbl = root.querySelector("#pl-border-width-lbl");
  const radiusEl       = root.querySelector("#pl-radius");
  const radiusLbl      = root.querySelector("#pl-radius-lbl");
  const brandingEnabled= root.querySelector("#pl-branding-enabled");
  const brandingBody   = root.querySelector("#pl-branding-body");
  const brandingLabel  = root.querySelector("#pl-branding-label");
  const brandingUrl    = root.querySelector("#pl-branding-url");

  // ---- Event registry ----
  const cleanups = [];
  function on(el, evt, fn, opts) {
    if (!el?.addEventListener) return;
    el.addEventListener(evt, fn, opts);
    cleanups.push(() => { try { el.removeEventListener(evt, fn, opts); } catch (_) {} });
  }

  // ---- Helpers ----
  const SHADOW_MAP = {
    none: "none",
    sm:   "0 4px 12px rgba(0,0,0,0.25)",
    md:   "0 8px 24px rgba(0,0,0,0.40)",
    lg:   "0 16px 48px rgba(0,0,0,0.60)",
  };

  function shadowKeyFromValue(val) {
    const v = val || "none";
    return Object.keys(SHADOW_MAP).find(k => SHADOW_MAP[k] === v) || "none";
  }

  function updateBrandingBodyVisibility(enabled) {
    if (brandingBody) brandingBody.style.display = enabled ? "grid" : "none";
  }

  // ---- Sync (Core → UI) ----
  function sync() {
    try {
      if (!core || typeof core.getState !== "function") return;
      const state = core.getState();
      const player   = selectPlayer(state);
      const pStyle   = selectPlayerStyle(state);
      const branding = selectPlayerBranding(state);

      const src = player?.src || "";

      // Scope bar
      const scopeSrc     = root.querySelector("#pl-scope-src");
      const scopeRadius  = root.querySelector("#pl-scope-radius");
      const scopeBranding= root.querySelector("#pl-scope-branding");
      if (scopeSrc) {
        scopeSrc.textContent = src ? (src.length > 28 ? src.slice(0, 26) + "…" : src) : "—";
      }
      if (scopeRadius) scopeRadius.textContent = pStyle?.radius != null ? `${pStyle.radius}px` : "—";
      if (scopeBranding) scopeBranding.textContent = branding?.enabled ? (branding?.mode || "on") : "off";

      // URL input
      if (srcInput && srcInput.value !== src) srcInput.value = src;

      // Video element
      const currentAttr = video?.getAttribute("src") || "";
      if (video && currentAttr !== src) {
        if (src) video.setAttribute("src", src);
        else video.removeAttribute("src");
        try { video.load(); } catch (_) {}
      }
      if (video) video.classList.toggle("is-visible", !!src);

      // Style
      if (borderColorEl && pStyle?.borderColor) borderColorEl.value = pStyle.borderColor;
      if (borderWidthEl && pStyle?.borderWidth != null) {
        borderWidthEl.value = String(pStyle.borderWidth);
        updateRangeFill(borderWidthEl);
        if (borderWidthLbl) borderWidthLbl.textContent = `${pStyle.borderWidth}px`;
      }
      if (radiusEl && pStyle?.radius != null) {
        radiusEl.value = String(pStyle.radius);
        updateRangeFill(radiusEl);
        if (radiusLbl) radiusLbl.textContent = `${pStyle.radius}px`;
      }

      // Shadow chips
      const currentShadowKey = shadowKeyFromValue(pStyle?.shadow);
      root.querySelectorAll("[data-shadow]").forEach(btn => {
        btn.classList.toggle("is-active", btn.dataset.shadow === currentShadowKey);
      });

      // Branding
      const enabled = !!branding?.enabled;
      if (brandingEnabled) brandingEnabled.checked = enabled;
      updateBrandingBodyVisibility(enabled);

      const mode = branding?.mode || "logo";
      root.querySelectorAll("[data-mode]").forEach(btn => {
        btn.classList.toggle("is-active", btn.dataset.mode === mode);
      });

      if (brandingLabel) brandingLabel.value = branding?.label || "";
      if (brandingUrl)   brandingUrl.value   = branding?.url   || "";

    } catch (_) {}
  }

  // ---- Commit src ----
  function commitSrc() {
    try {
      const src = srcInput?.value || "";
      if (core && typeof core.dispatch === "function") {
        core.dispatch(Actions.playerSetSrc(src));
      }
      if (typeof render === "function") render();
      sync();
    } catch (_) {}
  }

  // ---- Commit style ----
  function commitStyle(patch) {
    try {
      const state   = core.getState();
      const pStyle  = selectPlayerStyle(state) || {};
      const next    = { ...pStyle, ...patch };
      core.dispatch(Actions.playerSetStyle(next));
      if (typeof render === "function") render();
      sync();
    } catch (_) {}
  }

  // ---- Commit branding ----
  function commitBranding(patch) {
    try {
      const state   = core.getState();
      const br      = selectPlayerBranding(state) || {};
      const next    = { ...br, ...patch };
      core.dispatch(Actions.playerSetBranding(next));
      if (typeof render === "function") render();
      sync();
    } catch (_) {}
  }

  // ---- Wire events ----
  on(previewBtn, "click", commitSrc);
  on(srcInput, "change", commitSrc);

  on(borderColorEl, "input", (e) => commitStyle({ borderColor: e.target.value }));

  on(borderWidthEl, "input", (e) => {
    updateRangeFill(e.target);
    if (borderWidthLbl) borderWidthLbl.textContent = `${e.target.value}px`;
    commitStyle({ borderWidth: Number(e.target.value) });
  });

  on(radiusEl, "input", (e) => {
    updateRangeFill(e.target);
    if (radiusLbl) radiusLbl.textContent = `${e.target.value}px`;
    commitStyle({ radius: Number(e.target.value) });
  });

  root.querySelectorAll("[data-shadow]").forEach(btn => {
    on(btn, "click", () => commitStyle({ shadow: SHADOW_MAP[btn.dataset.shadow] || "none" }));
  });

  on(brandingEnabled, "change", (e) => commitBranding({ enabled: e.target.checked }));

  root.querySelectorAll("[data-mode]").forEach(btn => {
    on(btn, "click", () => commitBranding({ mode: btn.dataset.mode }));
  });

  on(brandingLabel, "change", (e) => commitBranding({ label: e.target.value }));
  on(brandingUrl,   "change", (e) => commitBranding({ url: e.target.value }));

  // Init fill on ranges
  updateRangeFill(borderWidthEl);
  updateRangeFill(radiusEl);

  // Initial sync
  sync();

  // ---- destroy ----
  function destroy() {
    while (cleanups.length) cleanups.pop()();
    try {
      if (video) {
        if (typeof video.pause === "function") video.pause();
        video.removeAttribute("src");
        try { video.load(); } catch (_) {}
      }
    } catch (_) {}
    safeClear(rootEl);
  }

  return { sync, destroy };
}
