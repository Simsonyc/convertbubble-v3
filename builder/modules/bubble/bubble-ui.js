// /builder/modules/bubble/bubble-ui.js
// ConvertBubble Builder V3 — Prestige Dark Skin
// Règle : skin uniquement, logique métier conservée à l'identique
import { bubbleUISchema } from "./bubble.schema.js";
import { Actions } from "../../core/actions.js";

// ---------- SAFE MODE helpers ----------
function safeQuery(root, sel) {
  const el = root?.querySelector(sel);
  if (!el) console.warn("[BubbleUI] missing element:", sel);
  return el;
}

function safeOn(el, event, fn) {
  if (!el) return false;
  el.addEventListener(event, fn);
  return true;
}

function genAssetId() {
  return `a_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

// ---------- Range fill helper ----------
function updateRangeFill(input) {
  if (!input) return;
  const min = parseFloat(input.min) || 0;
  const max = parseFloat(input.max) || 100;
  const val = parseFloat(input.value) || 0;
  const pct = ((val - min) / (max - min)) * 100;
  input.style.background = `linear-gradient(90deg, var(--cb-accent) ${pct}%, var(--cb-muted2) ${pct}%)`;
}

// ---------- EXPORTS ----------
export function initBubbleUI({ core, selectors, render, rootEl }) {
  if (!rootEl) {
    throw new Error('[bubble-ui] rootEl is required (bootstrap must pass it).');
  }

  const panel = rootEl;
  panel.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "cb-bubble-ui";
  wrapper.innerHTML = `
    <style>
      /* === Bubble UI — Prestige Dark (scoped) === */
      .cb-bubble-ui {
        width: 100%;
        color: var(--cb-text, #ede8df);
        font-family: inherit;
      }

      /* Scope bar */
      .cb-bubble-ui .cb-scope-bar {
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
      .cb-bubble-ui .cb-scope-bar::-webkit-scrollbar { display: none; }

      .cb-bubble-ui .cb-scope-bar__key {
        color: var(--cb-muted, #6e6a62);
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: .07em;
        margin-right: 3px;
      }
      .cb-bubble-ui .cb-scope-bar__val {
        color: var(--cb-green, #22d3a0);
        text-shadow: 0 0 7px rgba(34,211,160,0.4);
        font-size: 12px;
      }
      .cb-bubble-ui .cb-scope-item {
        display: flex;
        align-items: center;
        gap: 4px;
        flex-shrink: 0;
      }

      /* Surface / sections */
      .cb-bubble-ui .cbp-surface {
        background: var(--cb-panel, #201e1b);
        border: 1px solid var(--cb-border2, rgba(255,235,190,0.10));
        border-radius: 14px;
        overflow: hidden;
      }

      .cb-bubble-ui .cb-ui__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 11px 14px;
        background: var(--cb-rail, #1a1917);
        border-bottom: 0.5px solid var(--cb-border, rgba(255,235,190,0.06));
      }

      .cb-bubble-ui .cb-ui__title {
        margin: 0;
        font-size: 13px;
        font-weight: 800;
        color: var(--cb-text, #ede8df);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .cb-bubble-ui .cb-ui__title-dot {
        width: 7px;
        height: 7px;
        border-radius: 999px;
        background: var(--cb-amber2, #e8b45a);
        box-shadow: 0 0 7px var(--cb-amber2, #e8b45a);
        flex-shrink: 0;
      }

      .cb-bubble-ui .cb-collapse-btn {
        width: 32px;
        height: 32px;
        border-radius: 10px;
        border: 1px solid var(--cb-border2, rgba(255,235,190,0.10));
        background: var(--cb-panel2, #272420);
        color: var(--cb-muted, #6e6a62);
        font-size: 16px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color .15s, border-color .15s;
      }
      .cb-bubble-ui .cb-collapse-btn:hover {
        color: var(--cb-text, #ede8df);
        border-color: var(--cb-border3, rgba(255,235,190,0.18));
      }

      .cb-bubble-ui .cb-ui__body {
        padding: 14px;
        display: grid;
        gap: 0;
      }

      /* Section */
      .cb-bubble-ui .cb-section {
        padding: 14px 0;
        border-bottom: 0.5px solid var(--cb-border, rgba(255,235,190,0.06));
      }
      .cb-bubble-ui .cb-section:first-child { padding-top: 0; }
      .cb-bubble-ui .cb-section:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }

      .cb-bubble-ui .cb-section__title {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: .08em;
        text-transform: uppercase;
        color: var(--cb-muted, #6e6a62);
        margin: 0 0 12px;
      }

      /* Label */
      .cb-bubble-ui .cb-label {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: .02em;
        color: var(--cb-muted, #6e6a62);
        margin-bottom: 6px;
      }

      /* Input / Select */
      .cb-bubble-ui .cb-input,
      .cb-bubble-ui .cb-select {
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
      .cb-bubble-ui .cb-input:focus,
      .cb-bubble-ui .cb-select:focus {
        border-color: var(--cb-accent, #4f8cff);
        box-shadow: 0 0 0 3px rgba(79,140,255,0.18);
      }
      .cb-bubble-ui .cb-input::placeholder { color: var(--cb-muted2, #3e3b35); }

      /* Range */
      .cb-bubble-ui .cb-range {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 4px;
        border-radius: 999px;
        outline: none;
        cursor: pointer;
        background: var(--cb-muted2, #3e3b35);
      }
      .cb-bubble-ui .cb-range::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 16px;
        height: 16px;
        border-radius: 999px;
        background: #fff;
        box-shadow: 0 0 0 2px var(--cb-accent, #4f8cff),
                    0 0 10px rgba(79,140,255,0.45);
        cursor: pointer;
        transition: box-shadow .15s;
      }
      .cb-bubble-ui .cb-range::-moz-range-thumb {
        width: 16px;
        height: 16px;
        border-radius: 999px;
        border: none;
        background: #fff;
        box-shadow: 0 0 0 2px var(--cb-accent, #4f8cff),
                    0 0 10px rgba(79,140,255,0.45);
        cursor: pointer;
      }

      /* Live val */
      .cb-bubble-ui .cb-live-val {
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        font-size: 11px;
        font-weight: 600;
        color: var(--cb-green, #22d3a0);
        text-shadow: 0 0 6px rgba(34,211,160,0.35);
        letter-spacing: .03em;
        margin-top: 5px;
      }

      /* Color input */
      .cb-bubble-ui .cb-color {
        width: 48px;
        height: 38px;
        border-radius: 10px;
        border: 1px solid var(--cb-border2, rgba(255,235,190,0.10));
        background: var(--cb-inset, #0c0b09);
        padding: 4px;
        cursor: pointer;
        flex-shrink: 0;
      }
      .cb-bubble-ui .cb-color--wide { width: 100%; }
      .cb-bubble-ui .cb-color::-webkit-color-swatch-wrapper { padding: 0; border-radius: 8px; }
      .cb-bubble-ui .cb-color::-webkit-color-swatch { border: none; border-radius: 8px; }

      /* Position grid 2×2 */
      .cb-bubble-ui .cb-pos-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px;
      }
      .cb-bubble-ui .cb-pos-btn {
        height: 40px;
        border-radius: 10px;
        border: 1px solid var(--cb-border2, rgba(255,235,190,0.10));
        background: var(--cb-inset, #0c0b09);
        color: var(--cb-muted, #6e6a62);
        font-size: 11px;
        font-weight: 800;
        letter-spacing: .05em;
        cursor: pointer;
        transition: all .15s;
      }
      .cb-bubble-ui .cb-pos-btn:hover {
        border-color: var(--cb-border3, rgba(255,235,190,0.18));
        color: var(--cb-text, #ede8df);
      }
      .cb-bubble-ui .cb-pos-btn.is-active {
        background: rgba(200,151,58,0.12);
        border-color: var(--cb-amber, #c8973a);
        color: var(--cb-amber2, #e8b45a);
        box-shadow: 0 0 10px rgba(200,151,58,0.18);
      }

      /* Chips (preset / animation) */
      .cb-bubble-ui .cb-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .cb-bubble-ui .cb-chip-item {
        padding: 6px 14px;
        border-radius: 999px;
        border: 1px solid var(--cb-border2, rgba(255,235,190,0.10));
        background: var(--cb-inset, #0c0b09);
        color: var(--cb-muted, #6e6a62);
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        transition: all .15s;
        user-select: none;
        text-transform: capitalize;
      }
      .cb-bubble-ui .cb-chip-item:hover {
        border-color: var(--cb-border3, rgba(255,235,190,0.18));
        color: var(--cb-text, #ede8df);
      }
      .cb-bubble-ui .cb-chip-item.is-active {
        background: rgba(79,140,255,0.12);
        border-color: rgba(79,140,255,0.35);
        color: var(--cb-accent2, #7cacff);
      }
      .cb-bubble-ui .cb-chip-item--amber.is-active {
        background: rgba(200,151,58,0.12);
        border-color: rgba(200,151,58,0.35);
        color: var(--cb-amber2, #e8b45a);
      }

      /* Layout helpers */
      .cb-bubble-ui .cb-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .cb-bubble-ui .cb-grow { flex: 1; }
      .cb-bubble-ui .cb-grid-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      @media (max-width: 420px) {
        .cb-bubble-ui .cb-grid-2 { grid-template-columns: 1fr; }
      }

      /* Dropzone */
      .cb-bubble-ui .cb-dropzone {
        border: 1px dashed var(--cb-border2, rgba(255,235,190,0.10));
        border-radius: 10px;
        background: var(--cb-inset, #0c0b09);
        padding: 14px;
        display: grid;
        gap: 6px;
        transition: border-color .15s, background .15s;
        cursor: pointer;
      }
      .cb-bubble-ui .cb-dropzone.is-over {
        border-color: var(--cb-accent, #4f8cff);
        background: rgba(79,140,255,0.06);
      }
      .cb-bubble-ui .cb-dropzone__main {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }
      .cb-bubble-ui .cb-dropzone__label {
        font-size: 12px;
        color: var(--cb-muted, #6e6a62);
        font-weight: 600;
      }
      .cb-bubble-ui .cb-dropzone__status {
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        font-size: 10px;
        color: var(--cb-green, #22d3a0);
        text-shadow: 0 0 5px rgba(34,211,160,0.3);
        font-weight: 600;
      }
      .cb-bubble-ui .cb-dropzone__hint {
        font-size: 11px;
        color: var(--cb-muted2, #3e3b35);
        font-weight: 600;
      }

      /* Hidden file input */
      .cb-hidden { display: none !important; }
    </style>

    <!-- SCOPE BAR -->
    <div class="cb-scope-bar" id="cb-bui-scope">
      <span class="cb-scope-item">
        <span class="cb-scope-bar__key">SIZE</span>
        <span class="cb-scope-bar__val" id="scope-size">—</span>
      </span>
      <span class="cb-scope-item">
        <span class="cb-scope-bar__key">POS</span>
        <span class="cb-scope-bar__val" id="scope-pos">—</span>
      </span>
      <span class="cb-scope-item">
        <span class="cb-scope-bar__key">ANIM</span>
        <span class="cb-scope-bar__val" id="scope-anim">—</span>
      </span>
      <span class="cb-scope-item">
        <span class="cb-scope-bar__key">RATIO</span>
        <span class="cb-scope-bar__val" id="scope-ratio">—</span>
      </span>
    </div>

    <!-- SURFACE -->
    <div class="cbp-surface">
      <div class="cb-ui__header">
        <h3 class="cb-ui__title">
          <span class="cb-ui__title-dot"></span>
          Bulle V3
        </h3>
        <button id="collapse" class="cb-collapse-btn" type="button" title="Réduire" aria-label="Réduire">−</button>
      </div>

      <div id="cb-ui-body" class="cb-ui__body">

        <!-- SECTION 1 — STYLE -->
        <div class="cb-section">
          <div class="cb-section__title">Style</div>

          <!-- Preset chips -->
          <div class="cb-label">Forme</div>
          <div class="cb-chips" id="preset-chips">
            ${bubbleUISchema.presets.map(p => `
              <button type="button" class="cb-chip-item" data-preset="${p}">${p}</button>
            `).join("")}
          </div>

          <!-- Taille -->
          <div style="margin-top:12px;">
            <div class="cb-label">Taille de la bulle</div>
            <input
              id="size"
              type="range"
              min="${bubbleUISchema.minSize}"
              max="${bubbleUISchema.maxSize}"
              step="${bubbleUISchema.sizeStep || 1}"
              class="cb-range"
            />
            <div id="size-label" class="cb-live-val"></div>
          </div>

          <!-- Bordure -->
          <div class="cb-grid-2" style="margin-top:12px;">
            <div>
              <div class="cb-label">Couleur bordure</div>
              <div class="cb-row">
                <input id="borderColor" type="color" class="cb-color" />
                <input id="borderWidth" type="range" min="0" max="12" step="1" class="cb-range cb-grow" />
              </div>
              <div id="borderWidth-label" class="cb-live-val"></div>
            </div>
            <div>
              <div class="cb-label">Fond texte</div>
              <input id="textBg" type="color" class="cb-color cb-color--wide" />
            </div>
          </div>

          <!-- Position grid 2×2 -->
          <div style="margin-top:12px;">
            <div class="cb-label">Position</div>
            <div class="cb-pos-grid">
              <button type="button" class="cb-pos-btn" data-pos="TL">TL</button>
              <button type="button" class="cb-pos-btn" data-pos="TR">TR</button>
              <button type="button" class="cb-pos-btn" data-pos="BL">BL</button>
              <button type="button" class="cb-pos-btn" data-pos="BR">BR</button>
            </div>
          </div>
        </div>

        <!-- SECTION 2 — CONTENU -->
        <div class="cb-section">
          <div class="cb-section__title">Contenu</div>

          <div class="cb-grid-2">
            <div>
              <div class="cb-label">Type de média</div>
              <select id="mediaType" class="cb-select">
                ${bubbleUISchema.mediaTypes.map(t => `<option value="${t}">${t}</option>`).join("")}
              </select>
            </div>
            <div>
              <div class="cb-label">Ratio preview / texte</div>
              <input type="range" id="ratio" min="0.2" max="0.8" step="0.05" class="cb-range" />
              <div id="ratio-label" class="cb-live-val"></div>
            </div>
          </div>

          <!-- Dropzone -->
          <div class="cb-dropzone" id="dropzone" style="margin-top:10px;">
            <div class="cb-dropzone__main">
              <span class="cb-dropzone__label">Import local (Core Assets)</span>
              <span id="uploadStatus" class="cb-dropzone__status">Aucun fichier</span>
            </div>
            <div class="cb-dropzone__hint">Glisser-déposer ou cliquer pour sélectionner (image / logo / vidéo)</div>
            <input id="file" type="file" class="cb-hidden" />
          </div>
        </div>

        <!-- SECTION 3 — TEXTE -->
        <div class="cb-section">
          <div class="cb-section__title">Texte</div>

          <div class="cb-grid-2">
            <div>
              <div class="cb-label">Police</div>
              <select id="fontFamily" class="cb-select">
                <option value="system-ui">System UI</option>
                <option value="ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif">Sans (Safe)</option>
                <option value="ui-serif, Georgia, serif">Serif (Safe)</option>
                <option value="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace">Monospace (Safe)</option>
                <option value="cursive">Cursive</option>
                <option value="Inter, system-ui, sans-serif">Inter</option>
                <option value="Poppins, system-ui, sans-serif">Poppins</option>
                <option value="Montserrat, system-ui, sans-serif">Montserrat</option>
                <option value="Roboto, system-ui, sans-serif">Roboto</option>
              </select>
            </div>
            <div>
              <div class="cb-label">Couleur texte</div>
              <input id="textColor" type="color" class="cb-color cb-color--wide" />
            </div>
          </div>

          <div style="margin-top:10px;">
            <div class="cb-label">Caption</div>
            <input id="caption" class="cb-input" placeholder="Votre message…" />
          </div>

          <div style="margin-top:10px;">
            <div class="cb-label">Taille texte (max)</div>
            <input
              id="fontSize"
              type="range"
              min="${bubbleUISchema.minFontSize}"
              max="22"
              step="1"
              class="cb-range"
            />
            <div id="fontSize-label" class="cb-live-val"></div>
          </div>
        </div>

        <!-- SECTION 4 — ANIMATION -->
        <div class="cb-section">
          <div class="cb-section__title">Animation</div>
          <div class="cb-chips" id="anim-chips">
            ${bubbleUISchema.animations.map(a => `
              <button type="button" class="cb-chip-item cb-chip-item--amber" data-anim="${a}">${a}</button>
            `).join("")}
          </div>
        </div>

      </div><!-- /cb-ui__body -->
    </div><!-- /cbp-surface -->
  `;

  panel.appendChild(wrapper);

  // ---------- Collapse ----------
  const toggleBtn = safeQuery(panel, "#collapse");
  const bodyEl = safeQuery(panel, "#cb-ui-body");
  if (toggleBtn && bodyEl) {
    let collapsed = false;
    safeOn(toggleBtn, "click", () => {
      collapsed = !collapsed;
      bodyEl.style.display = collapsed ? "none" : "grid";
      toggleBtn.textContent = collapsed ? "+" : "−";
      toggleBtn.setAttribute("aria-label", collapsed ? "Déplier" : "Réduire");
    });
  }

  // ---------- Read state ----------
  function readState() {
    const state = core.getState();
    const launcher = selectors.selectLauncher(state);
    const preset = selectors.selectBubblePreset(state);
    const border = selectors.selectBubbleBorder(state);
    const textBg = selectors.selectBubbleTextBackgroundColor(state);
    const anim = selectors.selectBubbleAnimation(state);
    const fontSize = selectors.selectBubbleFontSize(state);
    const ratio = state?.bubble?.ratio;
    const textColor = selectors.selectBubbleTextColor(state);
    const bubble = state?.bubble || {};
    const fontFamily = bubble?.text?.fontFamily || "system-ui";
    const caption = selectors.selectCaption(state);
    const corner = bubble.position || "BR";
    const media = bubble.media || {};
    return { state, launcher, preset, border, textBg, anim, fontSize, ratio, textColor, fontFamily, caption, corner, media };
  }

  function cssColorToHex6(color) {
    if (typeof color !== "string") return null;
    const c = color.trim();
    if (/^#([0-9a-fA-F]{6})$/.test(c)) return c.toLowerCase();
    const m3 = c.match(/^#([0-9a-fA-F]{3})$/);
    if (m3) {
      const r = m3[1][0], g = m3[1][1], b = m3[1][2];
      return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
    }
    const mrgb = c.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i);
    if (mrgb) {
      const toHex = (n) => Math.max(0, Math.min(255, Number(n) || 0)).toString(16).padStart(2, "0");
      return `#${toHex(mrgb[1])}${toHex(mrgb[2])}${toHex(mrgb[3])}`;
    }
    return null;
  }

  // ---------- syncUI (Core → DOM) ----------
  function syncUI() {
    const { launcher, preset, border, textBg, anim, fontSize, ratio, textColor, fontFamily, caption, corner, media, state } = readState();

    // Scope bar
    const scopeSize = safeQuery(panel, "#scope-size");
    const scopePos  = safeQuery(panel, "#scope-pos");
    const scopeAnim = safeQuery(panel, "#scope-anim");
    const scopeRatio= safeQuery(panel, "#scope-ratio");
    if (scopeSize) scopeSize.textContent = launcher?.size ? `${launcher.size}px` : "—";
    if (scopePos)  scopePos.textContent  = corner || "—";
    if (scopeAnim) scopeAnim.textContent = anim   || "—";
    if (scopeRatio)scopeRatio.textContent= typeof ratio === "number" ? `${Math.round(ratio * 100)}%` : "—";

    // Preset chips
    panel.querySelectorAll("[data-preset]").forEach(btn => {
      btn.classList.toggle("is-active", btn.dataset.preset === preset);
    });

    // Size
    const sizeInput = safeQuery(panel, "#size");
    const sizeLabel = safeQuery(panel, "#size-label");
    if (sizeInput && typeof launcher?.size === "number") {
      sizeInput.value = String(launcher.size);
      updateRangeFill(sizeInput);
      if (sizeLabel) sizeLabel.textContent = `${launcher.size}px`;
    }

    // Border color
    const borderColorEl = safeQuery(panel, "#borderColor");
    const borderHex = cssColorToHex6(border?.color);
    if (borderColorEl && borderHex) borderColorEl.value = borderHex;

    // Border width
    const bw = safeQuery(panel, "#borderWidth");
    const bwLabel = safeQuery(panel, "#borderWidth-label");
    if (bw && typeof border?.width === "number") {
      bw.value = String(border.width);
      updateRangeFill(bw);
      if (bwLabel) bwLabel.textContent = `${border.width}px`;
    }

    // Text bg
    const textBgEl = safeQuery(panel, "#textBg");
    const textBgHex = cssColorToHex6(textBg);
    if (textBgEl && textBgHex) textBgEl.value = textBgHex;

    // Position grid
    panel.querySelectorAll("[data-pos]").forEach(btn => {
      btn.classList.toggle("is-active", btn.dataset.pos === corner);
    });

    // Media type
    const mediaTypeEl = safeQuery(panel, "#mediaType");
    if (mediaTypeEl) mediaTypeEl.value = media?.type || "image";

    // Ratio
    const ratioInput = safeQuery(panel, "#ratio");
    const ratioLabel = safeQuery(panel, "#ratio-label");
    if (ratioInput && typeof ratio === "number") {
      ratioInput.value = String(ratio);
      updateRangeFill(ratioInput);
      const previewPct = Math.round((1 - ratio) * 100);
      const textPct = Math.round(ratio * 100);
      if (ratioLabel) ratioLabel.textContent = `Preview ${previewPct}% · Texte ${textPct}%`;
    }

    // Upload status
    const uploadStatus = safeQuery(panel, "#uploadStatus");
    if (uploadStatus) {
      const assetId = media?.assetId;
      if (assetId) {
        const asset = selectors.selectAssetById(state, assetId);
        uploadStatus.textContent = asset?.name ? `✓ ${asset.name}` : `✓ ${assetId}`;
      } else {
        uploadStatus.textContent = "Aucun fichier";
      }
    }

    // Font family
    const ff = safeQuery(panel, "#fontFamily");
    if (ff && typeof fontFamily === "string") ff.value = fontFamily;

    // Text color
    const tc = safeQuery(panel, "#textColor");
    const tcHex = cssColorToHex6(textColor);
    if (tc && tcHex) tc.value = tcHex;

    // Caption
    const captionEl = safeQuery(panel, "#caption");
    if (captionEl) captionEl.value = caption?.text || "";

    // Font size
    const fs = safeQuery(panel, "#fontSize");
    const fsLabel = safeQuery(panel, "#fontSize-label");
    if (fs && typeof fontSize === "number") {
      fs.value = String(fontSize);
      updateRangeFill(fs);
      if (fsLabel) fsLabel.textContent = `${fontSize}px`;
    }

    // Anim chips
    panel.querySelectorAll("[data-anim]").forEach(btn => {
      btn.classList.toggle("is-active", btn.dataset.anim === anim);
    });
  }

  function dispatchAndRender(action) {
    core.dispatch(action);
    render();
    syncUI();
  }

  // ---------- Wiring ----------

  // Preset chips
  panel.querySelectorAll("[data-preset]").forEach(btn => {
    safeOn(btn, "click", () => {
      dispatchAndRender({ type: "BUBBLE_SET_PRESET", payload: btn.dataset.preset });
    });
  });

  // Size
  const sizeEl = safeQuery(panel, "#size");
  safeOn(sizeEl, "input", (e) => {
    updateRangeFill(e.target);
    dispatchAndRender({ type: "LAUNCHER_SET_SIZE", payload: Number(e.target.value) });
  });

  // Border color
  const borderColorEl = safeQuery(panel, "#borderColor");
  safeOn(borderColorEl, "input", (e) => {
    dispatchAndRender({ type: "BUBBLE_SET_BORDER_COLOR", payload: e.target.value });
  });

  // Border width
  const borderWidthEl = safeQuery(panel, "#borderWidth");
  safeOn(borderWidthEl, "input", (e) => {
    updateRangeFill(e.target);
    dispatchAndRender({ type: "BUBBLE_SET_BORDER_WIDTH", payload: Number(e.target.value) });
  });

  // Text bg
  const textBgEl = safeQuery(panel, "#textBg");
  safeOn(textBgEl, "change", (e) => {
    dispatchAndRender({ type: "BUBBLE_SET_TEXT_BG_COLOR", payload: e.target.value });
  });

  // Position grid
  panel.querySelectorAll("[data-pos]").forEach(btn => {
    safeOn(btn, "click", () => {
      core.dispatch(Actions.bubbleSetPosition(btn.dataset.pos));
      render();
      syncUI();
    });
  });

  // Media type
  const mediaTypeEl = safeQuery(panel, "#mediaType");
  safeOn(mediaTypeEl, "change", (e) => {
    const { media } = readState();
    const type = e.target.value;
    const assetId = media?.assetId || null;
    core.dispatch(Actions.bubbleSetMedia({ type, assetId }));
    render();
    syncUI();
  });

  // Ratio
  const ratioEl = safeQuery(panel, "#ratio");
  safeOn(ratioEl, "input", (e) => {
    updateRangeFill(e.target);
    dispatchAndRender({ type: "BUBBLE_SET_RATIO", payload: parseFloat(e.target.value) });
  });

  // Font family
  const fontFamilyEl = safeQuery(panel, "#fontFamily");
  safeOn(fontFamilyEl, "change", (e) => {
    dispatchAndRender(Actions.bubbleSetTextFontFamily(e.target.value));
  });

  // Text color
  const textColorEl = safeQuery(panel, "#textColor");
  safeOn(textColorEl, "input", (e) => {
    dispatchAndRender({ type: "BUBBLE_SET_TEXT_COLOR", payload: e.target.value });
  });

  // Caption
  const captionEl = safeQuery(panel, "#caption");
  safeOn(captionEl, "input", (e) => {
    dispatchAndRender({ type: "CAPTION_SET_TEXT", payload: e.target.value });
  });

  // Font size
  const fontSizeEl = safeQuery(panel, "#fontSize");
  safeOn(fontSizeEl, "input", (e) => {
    updateRangeFill(e.target);
    dispatchAndRender({ type: "BUBBLE_SET_FONT_SIZE", payload: Number(e.target.value) });
  });

  // Anim chips
  panel.querySelectorAll("[data-anim]").forEach(btn => {
    safeOn(btn, "click", () => {
      dispatchAndRender({ type: "BUBBLE_SET_ANIMATION", payload: btn.dataset.anim });
    });
  });

  // ---------- Upload / Dropzone ----------
  const fileInput = safeQuery(panel, "#file");
  const dropzone  = safeQuery(panel, "#dropzone");

  function revokePreviousBlobIfAny(prevAssetId) {
    if (!prevAssetId) return;
    try {
      const state = core.getState();
      const prev = selectors.selectAssetById(state, prevAssetId);
      const blobUrl = prev?.blobUrl;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.warn("[BubbleUI] revoke previous blob failed:", err);
    }
  }

  async function sha256File(file) {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return "sha256:" + hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  }

  async function handleFile(file) {
    if (!file) return;
    const { media } = readState();
    const prevAssetId = media?.assetId;
    if (prevAssetId) revokePreviousBlobIfAny(prevAssetId);

    let type = mediaTypeEl ? mediaTypeEl.value : "image";
    if (file.type?.startsWith("video/")) {
      type = "video";
    } else if (file.type?.startsWith("image/")) {
      if (type !== "logo") type = "image";
    } else {
      const name = (file.name || "").toLowerCase();
      if ([".mp4",".webm",".mov",".m4v"].some(ext => name.endsWith(ext))) type = "video";
      else if (type !== "logo") type = "image";
    }

    if (mediaTypeEl) mediaTypeEl.value = type;

    let fileHash = null;
    try {
      fileHash = await sha256File(file);
    } catch (err) {
      fileHash = `fp:${file.name}:${file.size}:${file.type}:${file.lastModified}`;
    }

    const id = genAssetId();
    core.dispatch(Actions.assetAdd({ id, kind: type, name: file.name, mime: file.type, size: file.size, source: "local", fileHash, lastModified: file.lastModified }));
    const blobUrl = URL.createObjectURL(file);
    core.dispatch(Actions.assetSetBlobUrl(id, blobUrl));
    core.dispatch(Actions.bubbleSetMedia({ type, assetId: id }));

    render();
    syncUI();

    const uploadStatus = safeQuery(panel, "#uploadStatus");
    if (uploadStatus) uploadStatus.textContent = `✓ ${file.name}`;
  }

  safeOn(fileInput, "change", async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    await handleFile(file);
    e.target.value = "";
  });

  if (dropzone) {
    safeOn(dropzone, "click", () => { if (fileInput) fileInput.click(); });
    safeOn(dropzone, "dragover", (e) => { e.preventDefault(); dropzone.classList.add("is-over"); });
    safeOn(dropzone, "dragleave", () => { dropzone.classList.remove("is-over"); });
    safeOn(dropzone, "drop", async (e) => {
      e.preventDefault();
      dropzone.classList.remove("is-over");
      const file = e.dataTransfer.files?.[0];
      if (file) await handleFile(file);
    });
  }

  // Initial sync
  syncUI();
}
