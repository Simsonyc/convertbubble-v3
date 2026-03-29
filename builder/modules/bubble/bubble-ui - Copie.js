// /builder/modules/bubble/bubble-ui.js
import { bubbleUISchema } from "./bubble.schema.js";
import { Actions } from "../../core/actions.js";

// CBV3:ZONE:SHARED
// ---------- SAFE MODE helpers (local only) ----------
function safeQuery(root, sel) {
  const el = root?.querySelector(sel);
  if (!el) console.warn("[UI] missing element:", sel);
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
// ---------------------------------------------------

// CBV3:ZONE:EXPORTS
export function initBubbleUI({ core, selectors, render, rootEl }) {
  // ✅ CONTRACT: rootEl obligatoire (bootstrap-driven)
  if (!rootEl) {
    throw new Error('[bubble-ui] rootEl is required (bootstrap must pass it).');
  }

  // IMPORTANT CONTRACT:
  // bubble-ui.js must NOT remove shell container, must NOT append to body.
  const panel = rootEl;

  // Reset content only (never remove panel itself)
  panel.innerHTML = "";

    // CBV3:ZONE:IA-A2:LAYOUT
  // Neutral wrapper (embedded-friendly)
  const wrapper = document.createElement("div");
  wrapper.className = "cb-bubble-ui";
  wrapper.innerHTML = `
    <style>
      /* --- Bubble UI Skin-Friendly tokens (scoped) --- */
      .cb-bubble-ui{
  /* === TEXTES === */
  --cb-ui-text: color-mix(
  in srgb,
  var(--cb-text, #111) 80%,
  #000000
);


  --cb-ui-muted: var(
    --cb-muted,
    color-mix(in srgb, var(--cb-ui-text) 70%, transparent)
  );

  /* === BORDURES === */
  --cb-ui-border: var(
    --cb-border,
    color-mix(in srgb, var(--cb-ui-text) 20%, transparent)
  );

  /* === PANNEAUX === */
  --cb-ui-panel: var(
    --cb-panel,
    color-mix(in srgb, #ffffff 90%, #000000 10%)
  );

  /* === INPUTS === */
--cb-ui-input: var(--cb-input, #ffffff);


  --cb-ui-accent: var(--cb-accent, #34d5d9);
  --cb-ui-radius: var(--cb-radius-2, 16px);
  --cb-ui-gap:    var(--cb-gap-2, 12px);

  color: var(--cb-ui-text);
  font-family: var(--cb-font, system-ui, -apple-system, Segoe UI, Roboto, sans-serif);
  width: 100%;
}


      .cb-bui-card{
        border-radius: var(--cb-ui-radius);
        border: 1px solid var(--cb-ui-border);
        background: var(--cb-ui-panel);
        padding: var(--cb-ui-gap);
        display: grid;
        gap: var(--cb-ui-gap);
      }

      

      .cb-bui-title{
        font-size: 14px;
        font-weight: 900;
        letter-spacing: .2px;
        color: var(--cb-ui-text);
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap: 10px;
      }
/* === HIÉRARCHIE UI — 3 NIVEAUX CLAIRS === */

/* NIVEAU 0 — Carte racine (ConvertBubble — Bulle V3) */
.cb-bubble-ui > .cb-bui-card{
  background: color-mix(in srgb, #ffffff 75%, #000000 25%);
  border: 1px solid color-mix(in srgb, var(--cb-ui-border) 85%, rgba(0,0,0,0.15));
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

/* NIVEAU 1 — Sections (Style / Contenu / Texte / Animation) */
.cb-bui-body > .cb-bui-card{
  background: color-mix(in srgb, #ffffff 88%, #000000 12%);
  border: 1px solid color-mix(in srgb, var(--cb-ui-border) 85%, rgba(0,0,0,0.08));
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

/* NIVEAU 2 — Champs (inputs / selects / colors) */
.cb-bui-input,
.cb-bui-select,
.cb-bubble-ui input[type="color"]{
  background: var(--cb-ui-input);
}


      .cb-bui-muted{
        color: var(--cb-ui-muted);
        font-size: 12px;
        font-weight: 800;
        opacity: 0.95;
        margin-bottom: 6px;
      }

      .cb-bui-row{
        display:grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }

      @media (max-width: 420px){
        .cb-bui-row{ grid-template-columns: 1fr; }
      }

      .cb-bui-input, .cb-bui-select{
        width: 100%;
        height: 40px;
        border-radius: 12px;
        border: 1px solid var(--cb-ui-border);
        background: var(--cb-ui-input);
        color: var(--cb-ui-text);
        padding: 0 10px;
        outline: none;
      }

      .cb-bui-input:focus, .cb-bui-select:focus{
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--cb-ui-accent) 30%, transparent);
      }

      .cb-bui-range{
        width:100%;
        height: 32px;
        background: transparent;
        accent-color: var(--cb-ui-accent);
      }

      .cb-bui-label{
        font-size: 12px;
        opacity: 0.90;
        margin-top: 4px;
        color: var(--cb-ui-muted);
        font-weight: 700;
      }

      .cb-bui-header{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap: 10px;
      }

      .cb-bui-badge{
        display:flex;
        align-items:center;
        gap:10px;
        min-width: 0;
      }

      .cb-bui-dot{
        width:10px;
        height:10px;
        border-radius:999px;
        background: linear-gradient(180deg, var(--cb-ui-accent), #f97316);
        box-shadow: 0 6px 18px rgba(0,0,0,0.15);
        flex: 0 0 auto;
      }

      .cb-bui-collapse{
        width: 42px;
        height: 42px;
        border-radius: 14px;
        border: 1px solid var(--cb-ui-border);
        background: var(--cb-ui-panel);
        color: var(--cb-ui-text);
        font-size: 18px;
        cursor: pointer;
      }
      .cb-bui-collapse:hover{
        filter: brightness(1.04);
      }
      .cb-bui-collapse:focus{
        outline: none;
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--cb-ui-accent) 30%, transparent);
      }

      .cb-bui-body{
        display:grid;
        gap: var(--cb-ui-gap);
      }

      /* Color inputs (scoped) */
      .cb-bubble-ui input[type="color"]{
        width: 56px;
        height: 40px;
        border-radius: 12px;
        border: 1px solid var(--cb-ui-border);
        background: var(--cb-ui-input);
        padding: 6px;
        cursor: pointer;
      }
      .cb-bubble-ui input[type="color"].cb-bui-colorwide{
        width: 100%;
      }
      .cb-bubble-ui input[type="color"]::-webkit-color-swatch-wrapper{
        padding: 0;
        border-radius: 10px;
      }
      .cb-bubble-ui input[type="color"]::-webkit-color-swatch{
        border: none;
        border-radius: 10px;
      }
      .cb-bubble-ui input[type="color"]:hover{
        filter: brightness(1.06);
      }
      .cb-bubble-ui input[type="color"]:focus{
        outline: none;
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--cb-ui-accent) 30%, transparent);
      }

      /* Small layout helpers (scoped) */
      .cb-bui-flex{
        display:flex;
        gap:10px;
        align-items:center;
      }
      .cb-bui-flex-grow{ flex: 1; }
      .cb-bui-hidden{ display:none; }

      /* Dropzone */
      .cb-bui-drop{
        border-radius: 14px;
        border: 1px dashed var(--cb-ui-border);
        background: transparent;
        padding: 10px;
        display:grid;
        gap: 10px;
      }
      .cb-bui-drophead{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
      }
      .cb-bui-drop.is-over{
        outline: 2px solid color-mix(in srgb, var(--cb-ui-accent) 35%, transparent);
        background: color-mix(in srgb, var(--cb-ui-accent) 8%, transparent);
      }

      .cb-bui-mini{
        font-size: 12px;
        color: var(--cb-ui-muted);
        font-weight: 700;
      }

      .cb-bui-help{
        padding-top: 2px;
        border-top: 1px solid color-mix(in srgb, var(--cb-ui-border) 60%, transparent);
        margin-top: 2px;
      }
	  /* === FORCE COULEUR TEXTE (BAT LE SHELL) === */

/* Titres */
.cb-bubble-ui .cb-bui-title{
  color: color-mix(
    in srgb,
    var(--cb-text, #111) 70%,
    #000
  );
}

/* Textes standards */
.cb-bubble-ui,
.cb-bubble-ui .cb-bui-muted,
.cb-bubble-ui .cb-bui-label{
  color: color-mix(
    in srgb,
    var(--cb-text, #111) 65%,
    #000
  );
}

/* Aides / Astuces */
.cb-bubble-ui .cb-bui-mini{
  color: color-mix(
    in srgb,
    var(--cb-text, #111) 55%,
    #000
  );
}

    </style>

    <div class="cb-bui-card">
      <div class="cb-bui-header">
        <div class="cb-bui-badge">
          <div class="cb-bui-dot"></div>
          <div class="cb-bui-title">ConvertBubble — Bulle V3</div>
        </div>
        <button id="collapse" class="cb-bui-collapse" title="Réduire" type="button">–</button>
      </div>

      <div id="cb-ui-body" class="cb-bui-body">

        <!-- SECTION 1 — STYLE -->
        <div class="cb-bui-card">
          <div class="cb-bui-title">Style</div>

          <div class="cb-bui-row">
            <div>
              <div class="cb-bui-muted">Preset / forme</div>
              <select id="preset" class="cb-bui-select">
                ${bubbleUISchema.presets.map(p => `<option value="${p}">${p}</option>`).join("")}
              </select>
            </div>

            <div>
              <div class="cb-bui-muted">Taille de la bulle</div>
              <input
                id="size"
                type="range"
                min="${bubbleUISchema.minSize}"
                max="${bubbleUISchema.maxSize}"
                step="${bubbleUISchema.sizeStep || 1}"
                class="cb-bui-range"
              />
              <div id="size-label" class="cb-bui-label"></div>
            </div>
          </div>

          <div class="cb-bui-row">
            <div>
              <div class="cb-bui-muted">Bordure</div>
              <div class="cb-bui-flex">
                <input id="borderColor" type="color" />
                <input id="borderWidth" type="range" min="0" max="12" step="1" class="cb-bui-range cb-bui-flex-grow" />
              </div>
              <div id="borderWidth-label" class="cb-bui-label"></div>
            </div>

            <div>
              <div class="cb-bui-muted">Fond texte</div>
              <input id="textBg" type="color" class="cb-bui-colorwide" />
            </div>
          </div>

          <div class="cb-bui-row">
            <div>
              <div class="cb-bui-muted">Position</div>
              <select id="corner" class="cb-bui-select">
                <option value="TL">TL</option>
                <option value="TR">TR</option>
                <option value="BL">BL</option>
                <option value="BR">BR</option>
              </select>
            </div>

            <div>
              <div class="cb-bui-muted">Astuce</div>
              <div class="cb-bui-mini">La position pilote aussi le mode mini (scroll/auto-hide).</div>
            </div>
          </div>
        </div>

        <!-- SECTION 2 — CONTENU -->
        <div class="cb-bui-card">
          <div class="cb-bui-title">Contenu</div>

          <div class="cb-bui-row">
            <div>
              <div class="cb-bui-muted">Type</div>
              <select id="mediaType" class="cb-bui-select">
                ${bubbleUISchema.mediaTypes.map(t => `<option value="${t}">${t}</option>`).join("")}
              </select>
            </div>

            <div>
              <div class="cb-bui-muted">Ratio preview / texte</div>
              <input type="range" id="ratio" min="0.2" max="0.8" step="0.05" class="cb-bui-range" />
              <div id="ratio-label" class="cb-bui-label"></div>
            </div>
          </div>

          <div class="cb-bui-drop" id="dropzone">
            <div class="cb-bui-drophead">
              <div>
                <div class="cb-bui-muted" style="margin:0;">Import local (Core Assets)</div>
                <div id="uploadStatus" class="cb-bui-mini">Aucun fichier</div>
              </div>
              <input id="file" type="file" class="cb-bui-hidden" />
            </div>

            <div class="cb-bui-mini">
              Glisser-déposer un fichier ici (image / logo / vidéo)
            </div>

            <div class="cb-bui-mini cb-bui-help">
              Zone cliquable : ouvre le sélecteur de fichier (si un clic est câblé côté logique).
            </div>
          </div>
        </div>

        <!-- SECTION 3 — TEXTE -->
        <div class="cb-bui-card">
          <div class="cb-bui-title">Texte</div>

          <div class="cb-bui-row">
            <div>
              <div class="cb-bui-muted">Police</div>
              <select id="fontFamily" class="cb-bui-select">
                <!-- SAFE SYSTEM FONTS (toujours dispo, différence visible) -->
                <option value="system-ui">System UI</option>
                <option value="ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif">Sans (Safe)</option>
                <option value="ui-serif, Georgia, serif">Serif (Safe)</option>
                <option value="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace">Monospace (Safe)</option>
                <option value="cursive">Cursive</option>

                <!-- WEBFONTS (nécessitent chargement => sinon fallback) -->
                <option value="Inter, system-ui, sans-serif">Inter (Webfont)</option>
                <option value="Poppins, system-ui, sans-serif">Poppins (Webfont)</option>
                <option value="Montserrat, system-ui, sans-serif">Montserrat (Webfont)</option>
                <option value="Roboto, system-ui, sans-serif">Roboto (Webfont)</option>
              </select>
            </div>

            <div>
              <div class="cb-bui-muted">Couleur texte</div>
              <input id="textColor" type="color" class="cb-bui-colorwide" />
            </div>
          </div>

          <div>
            <div class="cb-bui-muted">Caption</div>
            <input id="caption" class="cb-bui-input" />
          </div>

          <div>
            <div class="cb-bui-muted">Taille texte (max)</div>
            <input
              id="fontSize"
              type="range"
              min="${bubbleUISchema.minFontSize}"
              max="22"
              step="1"
              class="cb-bui-range"
            />
            <div id="fontSize-label" class="cb-bui-label"></div>
          </div>
        </div>

        <!-- SECTION 4 — ANIMATION -->
        <div class="cb-bui-card">
          <div class="cb-bui-title">Animation</div>
          <div>
            <div class="cb-bui-muted">Type</div>
            <select id="anim" class="cb-bui-select">
              ${bubbleUISchema.animations.map(a => `<option value="${a}">${a}</option>`).join("")}
            </select>
          </div>
        </div>

      </div>
    </div>
  `;


  panel.appendChild(wrapper);

  // CBV3:ZONE:IA-A1:LOGIC
  // Collapse wiring
  const toggleBtn = safeQuery(panel, "#collapse");
  const body = safeQuery(panel, "#cb-ui-body");
  if (toggleBtn && body) {
    let collapsed = false;
    safeOn(toggleBtn, "click", () => {
      collapsed = !collapsed;
      body.style.display = collapsed ? "none" : "grid";
      toggleBtn.textContent = collapsed ? "+" : "—";
      toggleBtn.setAttribute("aria-label", collapsed ? "Déplier" : "Réduire");
    });
  }

  // Read current state (strict)
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

    // ✅ CONTRACT IA-D: bubble.text.fontFamily (source de vérité)
    const fontFamily = bubble?.text?.fontFamily || "system-ui";

    const caption = selectors.selectCaption(state);

    const corner = bubble.position || "BR";


    const media = bubble.media || {}; // ✅ contract bubble.media.type / bubble.media.assetId

    return {
      state,
      launcher,
      preset,
      border,
      textBg,
      anim,
      fontSize,
      ratio,
      textColor,
      fontFamily,
      caption,
      corner,
      media,
    };
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
      const toHex = (n) => {
        const x = Math.max(0, Math.min(255, Number(n) || 0));
        return x.toString(16).padStart(2, "0");
      };
      return `#${toHex(mrgb[1])}${toHex(mrgb[2])}${toHex(mrgb[3])}`;
    }
    return null;
  }

  function syncUI() {
    const {
      launcher,
      preset,
      border,
      textBg,
      anim,
      fontSize,
      ratio,
      textColor,
      fontFamily,
      caption,
      corner,
      media,
      state
    } = readState();

    const presetEl = safeQuery(panel, "#preset");
    if (presetEl) presetEl.value = preset;

    const sizeInput = safeQuery(panel, "#size");
    const sizeLabel = safeQuery(panel, "#size-label");
    if (sizeInput && sizeLabel && typeof launcher?.size === "number" && !Number.isNaN(launcher.size)) {
      sizeInput.value = String(launcher.size);
      sizeLabel.textContent = `${launcher.size}px`;
    }

    const borderColorEl = safeQuery(panel, "#borderColor");
    const borderHex = cssColorToHex6(border?.color);
    if (borderColorEl && borderHex) borderColorEl.value = borderHex;

    const textBgEl = safeQuery(panel, "#textBg");
    const textBgHex = cssColorToHex6(textBg);
    if (textBgEl && textBgHex) textBgEl.value = textBgHex;

    const bw = safeQuery(panel, "#borderWidth");
    const bwLabel = safeQuery(panel, "#borderWidth-label");
    if (bw && typeof border?.width === "number" && !Number.isNaN(border.width)) {
      bw.value = String(border.width);
      if (bwLabel) bwLabel.textContent = `${border.width}px`;
    }

    const animEl = safeQuery(panel, "#anim");
    if (animEl) animEl.value = anim;

    const fs = safeQuery(panel, "#fontSize");
    const fsLabel = safeQuery(panel, "#fontSize-label");
    if (fs && typeof fontSize === "number" && !Number.isNaN(fontSize)) {
      fs.value = String(fontSize);
      if (fsLabel) fsLabel.textContent = `${fontSize}px`;
    }

    const ff = safeQuery(panel, "#fontFamily");
    if (ff && typeof fontFamily === "string" && fontFamily) ff.value = fontFamily;

    const tc = safeQuery(panel, "#textColor");
    const tcHex = cssColorToHex6(textColor);
    if (tc && tcHex) tc.value = tcHex;

    const ratioInput = safeQuery(panel, "#ratio");
    const ratioLabel = safeQuery(panel, "#ratio-label");
    if (ratioInput && ratioLabel && typeof ratio === "number" && !Number.isNaN(ratio)) {
      ratioInput.value = String(ratio);
      const previewPct = Math.round((1 - ratio) * 100);
      const textPct = Math.round(ratio * 100);
      ratioLabel.textContent = `Preview ${previewPct}% / Texte ${textPct}%`;
    }

    const captionEl = safeQuery(panel, "#caption");
    if (captionEl) captionEl.value = caption?.text || "";

    const cornerEl = safeQuery(panel, "#corner");
    if (cornerEl) cornerEl.value = corner;

    const mediaTypeEl = safeQuery(panel, "#mediaType");
    if (mediaTypeEl) mediaTypeEl.value = media?.type || "image";

    // Upload status
    const uploadStatus = safeQuery(panel, "#uploadStatus");
    if (uploadStatus) {
      const assetId = media?.assetId;
      if (assetId) {
        const asset = selectors.selectAssetById(state, assetId);
        uploadStatus.textContent = asset?.name ? `Asset: ${asset.name}` : `Asset: ${assetId}`;
      } else {
        uploadStatus.textContent = "Aucun fichier";
      }
    }
  }

  function dispatchAndRender(action) {
    core.dispatch(action);
    render();
    syncUI();
  }

  // ---- existing controls wiring (patch minimal) ----
  const presetEl = safeQuery(panel, "#preset");
  safeOn(presetEl, "change", (e) => {
    dispatchAndRender({ type: "BUBBLE_SET_PRESET", payload: e.target.value });
  });

  const sizeEl = safeQuery(panel, "#size");
  safeOn(sizeEl, "input", (e) => {
    const value = Number(e.target.value);
    dispatchAndRender({ type: "LAUNCHER_SET_SIZE", payload: value });
  });

  const borderColorEl = safeQuery(panel, "#borderColor");
  safeOn(borderColorEl, "input", (e) => {
    dispatchAndRender({ type: "BUBBLE_SET_BORDER_COLOR", payload: e.target.value });
  });

  const borderWidthEl = safeQuery(panel, "#borderWidth");
  safeOn(borderWidthEl, "input", (e) => {
    dispatchAndRender({ type: "BUBBLE_SET_BORDER_WIDTH", payload: Number(e.target.value) });
  });

  const textBgEl = safeQuery(panel, "#textBg");
  safeOn(textBgEl, "change", (e) => {
    dispatchAndRender({ type: "BUBBLE_SET_TEXT_BG_COLOR", payload: e.target.value });
  });

  const ratioEl = safeQuery(panel, "#ratio");
  safeOn(ratioEl, "input", (e) => {
    dispatchAndRender({ type: "BUBBLE_SET_RATIO", payload: parseFloat(e.target.value) });
  });

  const captionEl = safeQuery(panel, "#caption");
  safeOn(captionEl, "input", (e) => {
    dispatchAndRender({ type: "CAPTION_SET_TEXT", payload: e.target.value });
  });

  const fontSizeEl = safeQuery(panel, "#fontSize");
  safeOn(fontSizeEl, "input", (e) => {
    dispatchAndRender({ type: "BUBBLE_SET_FONT_SIZE", payload: Number(e.target.value) });
  });

      const fontFamilyEl = safeQuery(panel, "#fontFamily");
safeOn(fontFamilyEl, "change", (e) => {
  const fontFamily = e.target.value;

  // TEMP diag: distinguer "UI changed font"
  console.log("[UI FONT CHANGE] bubble.text.fontFamily =", fontFamily, "\nSTACK:\n", new Error().stack);

  dispatchAndRender(Actions.bubbleSetTextFontFamily(fontFamily));
});



  const textColorEl = safeQuery(panel, "#textColor");
  safeOn(textColorEl, "input", (e) => {
    dispatchAndRender({ type: "BUBBLE_SET_TEXT_COLOR", payload: e.target.value });
  });

  const animEl = safeQuery(panel, "#anim");
  safeOn(animEl, "change", (e) => {
    dispatchAndRender({ type: "BUBBLE_SET_ANIMATION", payload: e.target.value });
  });

  // ✅ Position corner
  const cornerEl = safeQuery(panel, "#corner");
  safeOn(cornerEl, "change", (e) => {
    // Contractuel
    core.dispatch(Actions.bubbleSetPosition(e.target.value));
    render();
    syncUI();
  });

  // ✅ Media type (bubble.media.type)
  const mediaTypeEl = safeQuery(panel, "#mediaType");
  safeOn(mediaTypeEl, "change", (e) => {
    const { media } = readState();
    const type = e.target.value;
    const assetId = media?.assetId || null;
    // Contractuel : bubble.media.type + assetId
    core.dispatch(Actions.bubbleSetMedia({ type, assetId }));
    render();
    syncUI();
  });

  // ✅ Upload / Drag & drop -> Core Assets pipeline
  const fileInput = safeQuery(panel, "#file");
  const dropzone = safeQuery(panel, "#dropzone");

  function revokePreviousBlobIfAny(prevAssetId) {
    if (!prevAssetId) return;
    try {
      const state = core.getState();
      const prev = selectors.selectAssetById(state, prevAssetId);
      const blobUrl = prev?.blobUrl;
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    } catch (err) {
      console.warn("[UI] revoke previous blob failed:", err);
    }
  }
async function sha256File(file) {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return "sha256:" + hashHex;
}

 async function handleFile(file) {
  if (!file) return;

  const { media } = readState();
  const prevAssetId = media?.assetId;

  // ✅ leak guard : revoke old blob if exists
  if (prevAssetId) {
    revokePreviousBlobIfAny(prevAssetId);
  }

  // --------------------------------------------------
  // ✅ AUTO-DETECT MEDIA TYPE (PRO)
  // --------------------------------------------------
  let type = mediaTypeEl ? mediaTypeEl.value : "image";

  if (file.type && file.type.startsWith("video/")) {
    type = "video";
  } else if (file.type && file.type.startsWith("image/")) {
    if (type !== "logo") type = "image";
  } else {
    const name = (file.name || "").toLowerCase();
    if (
      name.endsWith(".mp4") ||
      name.endsWith(".webm") ||
      name.endsWith(".mov") ||
      name.endsWith(".m4v")
    ) {
      type = "video";
    } else {
      if (type !== "logo") type = "image";
    }
  }

  // ✅ sync dropdown UI
  if (mediaTypeEl) mediaTypeEl.value = type;

  // --------------------------------------------------
  // ✅ SHA256 HASH (PRO)
  // --------------------------------------------------
  let fileHash = null;
  try {
    fileHash = await sha256File(file);
  } catch (err) {
    console.warn("[UI] sha256 failed -> fallback fingerprint:", err);
    fileHash = `fp:${file.name}:${file.size}:${file.type}:${file.lastModified}`;
  }

  // --------------------------------------------------
  // ✅ Core Assets pipeline contractuel + enrichi PRO
  // --------------------------------------------------
  const id = genAssetId();

  core.dispatch(
    Actions.assetAdd({
      id,
      kind: type,
      name: file.name,
      mime: file.type,
      size: file.size,

      // ✅ MODE PRO : upgrade serveur futur
      source: "local",
      fileHash,
      lastModified: file.lastModified,
    })
  );

  const blobUrl = URL.createObjectURL(file);
  core.dispatch(Actions.assetSetBlobUrl(id, blobUrl));
  core.dispatch(Actions.bubbleSetMedia({ type, assetId: id }));

  render();
  syncUI();

  const uploadStatus = safeQuery(panel, "#uploadStatus");
  if (uploadStatus) uploadStatus.textContent = `Importé: ${file.name}`;
}


  safeOn(fileInput, "change", async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    await handleFile(file);
    e.target.value = "";
  });

  // Dropzone behavior
  if (dropzone) {
    safeOn(dropzone, "dragover", (e) => {
      e.preventDefault();
      dropzone.classList.add("is-over");
    });
    safeOn(dropzone, "dragleave", () => {
      dropzone.classList.remove("is-over");
    });
    safeOn(dropzone, "drop", async (e) => {
      e.preventDefault();
      dropzone.classList.remove("is-over");
      const file = e.dataTransfer.files && e.dataTransfer.files[0];
      if (!file) return;
      await handleFile(file);
    });
  }

  // Initial sync
  syncUI();
}

