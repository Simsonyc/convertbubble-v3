import { createCore } from "./core/builder-core.js";
import * as selectors from "./core/selectors.js";

import { initBubbleUI } from "./modules/bubble/bubble-ui.js";
import { initBubblePreview } from "./modules/bubble/bubble-preview.js";

import { initPlayerUI } from "./modules/player/player-ui.js";
import { initTimelineUI } from "./modules/player/timeline-ui.js";

import { initPreviewBridge } from "./bridge/preview-bridge.js";

// Legacy drivers (init autorisé, UI MUST be hidden by shell)
import { initSettingsUI } from "./modules/driver/settings-ui.js";
import { initI18nUI } from "./modules/driver/i18n.js";
import { initSnippetUI } from "./modules/driver/snippet-ui.js";
// UX guardrails flags (bootstrap only)
const ENABLE_BUBBLE_PREVIEW_SCROLL_MINI = true;

(function CB_BOOTSTRAP_V3_UKIT() {
  // Prevent double execution (very important in dev/hmr/multiple script tags)
  if (window.__CB_BOOTSTRAP_V3_RUNNING__) {
    console.warn("[BOOTSTRAP] already running -> abort duplicate start");
    return;
  }
  window.__CB_BOOTSTRAP_V3_RUNNING__ = true;

  try {
    const LOG = (m) => console.log(m);

    // ==========================================================
    // 1) Premium UIKit-ish CSS injection (mobile-first)
    // ==========================================================
    function injectGlobalSkin() {
  // one-shot skin layer (update if exists, never duplicate)
  let style = document.getElementById("cb-skin");
  if (!style) {
    style = document.createElement("style");
    style.id = "cb-skin";
    document.head.appendChild(style);
  }
  style.textContent =
 `
:root{
  --cb-safe-bottom: 260px;

  --cb-accent: #2f73ff;
  --cb-accent-2: #1c4fd6;

  --cb-bg: #eef0f6;
  --cb-bg-2: #e6e8f1;
  --cb-text: rgba(18,22,32,0.92);
  --cb-muted: rgba(18,22,32,0.62);

  --cb-glass: rgba(255,255,255,0.62);
  --cb-glass-2: rgba(255,255,255,0.42);
  --cb-border: rgba(255,255,255,0.44);

  --cb-card: rgba(255,255,255,0.70);
  --cb-card-border: rgba(255,255,255,0.52);

  --cb-shadow: 0 18px 50px rgba(20,28,45,0.18);
  --cb-shadow-strong: 0 26px 70px rgba(20,28,45,0.24);

  --cb-radius-1: 14px;
  --cb-radius-2: 18px;
  --cb-radius-3: 22px;

  --cb-header-h: 54px;
  --cb-tabs-h: 54px;
}

html[data-cb-theme="dark"]{
  --cb-bg: #0a0f1a;
  --cb-bg-2: #070b12;
  --cb-text: rgba(255,255,255,0.92);
  --cb-muted: rgba(255,255,255,0.62);

  --cb-glass: rgba(18,24,38,0.52);
  --cb-glass-2: rgba(18,24,38,0.38);
  --cb-border: rgba(255,255,255,0.14);

  --cb-card: rgba(18,24,38,0.58);
  --cb-card-border: rgba(255,255,255,0.14);

  --cb-shadow: 0 18px 60px rgba(0,0,0,0.38);
  --cb-shadow-strong: 0 26px 90px rgba(0,0,0,0.52);
}

html, body{
  height: 100%;
  margin: 0;
  background: radial-gradient(900px 600px at 30% 12%, rgba(47,115,255,0.16), transparent 58%),
              radial-gradient(800px 520px at 80% 70%, rgba(255,120,180,0.10), transparent 55%),
              linear-gradient(180deg, var(--cb-bg), var(--cb-bg-2));
  color: var(--cb-text);
  font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
}

*{ box-sizing: border-box; }
button{ font-family: inherit; }

#cb-shell{
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Header glass (sticky, always visible) */
#cb-header{
  position: sticky;
  top: 0;
  z-index: 40;
  height: var(--cb-header-h);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  margin: 10px 10px 0;
  border-radius: var(--cb-radius-3);
  background: var(--cb-glass);
  border: 1px solid var(--cb-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: var(--cb-shadow);
}

#cb-brand{
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 950;
  letter-spacing: -0.02em;
  font-size: 14px;
}

#cb-brand .dot{
  width: 26px;
  height: 26px;
  border-radius: 10px;
  background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(255,255,255,0.1)),
              linear-gradient(135deg, rgba(47,115,255,1), rgba(28,79,214,1));
  box-shadow: 0 10px 22px rgba(47,115,255,0.25);
}

#cb-actions{
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Chips (FR / EN / Light|Dark) */
.cb-chip{
  border: 1px solid var(--cb-border);
  background: var(--cb-glass-2);
  color: var(--cb-text);
  border-radius: 999px;
  padding: 7px 10px;
  font-size: 12px;
  font-weight: 900;
  line-height: 1;
  cursor: pointer;
  user-select: none;
  box-shadow: 0 10px 24px rgba(20,28,45,0.10);
}
.cb-chip.is-active{
  background: rgba(47,115,255,0.18);
  border-color: rgba(47,115,255,0.36);
}

/* Tabs capsule (sticky under header) */
#cb-tabs{
  position: sticky;
  top: calc(10px + var(--cb-header-h));
  z-index: 35;
  height: var(--cb-tabs-h);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  margin: 10px 10px 0;
}

#cb-tabs-capsule{
  width: min(520px, 100%);
  background: var(--cb-glass);
  border: 1px solid var(--cb-border);
  border-radius: 999px;
  padding: 6px;
  display: flex;
  gap: 6px;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: var(--cb-shadow);
}

.cb-tab{
  flex: 1;
  border: 0;
  background: transparent;
  color: var(--cb-muted);
  border-radius: 999px;
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 950;
  cursor: pointer;
}

.cb-tab.is-active{
  color: #fff;
  background: linear-gradient(180deg, rgba(47,115,255,1), rgba(28,79,214,1));
  box-shadow: 0 16px 34px rgba(47,115,255,0.32);
}

/* Main scroll (single scroll only) */
#cb-main{
  flex: 1;
  overflow: auto;
  padding: 14px 12px;
  padding-bottom: var(--cb-safe-bottom);
  display: flex;
  justify-content: center;
}

#cb-main-inner{
  width: min(760px, 100%);
  display: grid;
  gap: 12px;
}

/* Panels iOS card */
.cb-panel{
  border-radius: var(--cb-radius-3);
  background: var(--cb-card);
  border: 1px solid var(--cb-card-border);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: var(--cb-shadow);
  padding: 14px;
}
/* ==========================================================
   Design System Variants (NO tab-specific CSS)
   ========================================================== */

/* default variant = solid (current look) */
.cb-panel[data-variant="solid"]{
  background: var(--cb-card);
  border: 1px solid var(--cb-card-border);
  box-shadow: var(--cb-shadow);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* glass variant = more premium / more translucent */
.cb-panel[data-variant="glass"]{
  background: var(--cb-glass);
  border: 1px solid var(--cb-border);
  box-shadow: var(--cb-shadow);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

/* flat variant = used by bubble to remove the “white panel” */
.cb-panel[data-variant="flat"]{
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  overflow: visible !important;
}


/* STRICT: only one visible at a time */
.cb-hidden{ display: none !important; }

/* Bubble embedded panel (single scroll: #cb-main only) */
.cb-bubble-ui-root{
  width: 100%;
}

/* IMPORTANT: no nested scroll */
#cb-bubble-panel-content{
  overflow: visible;
  max-height: none;
}
/* ---------------------------------------------------------- */
/* Bubble premium integration (bootstrap only)                */
/* ---------------------------------------------------------- */

/* Bubble panel: no padding (avoid panel-in-panel feel) */
#cb-panel-bubble{
  padding: 0;
}

/* Bubble content: the padding is applied inside */
/* Bubble content: mobile perfect + centered on desktop */
#cb-bubble-panel-content{
  padding: 14px;
  width: 100%;
  box-sizing: border-box;

  /* premium desktop alignment */
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

/* Builder root: full width on mobile, capped on desktop */
#cb-bubble-ui-root{
  width: 100%;
  max-width: 640px;
}



/* The embedded root should not introduce its own spacing */
#cb-bubble-ui-root{
  width: 100%;
  padding: 0;
  margin: 0;
}

/* Embedded legacy "window" look (generic, not module-specific) */
.cb-embedded-window{
  margin: 0 !important;
  width: 100% !important;
  max-width: 100% !important;
  box-shadow: 0 16px 40px rgba(10,14,22,0.22) !important;
  border-radius: 24px !important;
  border: 1px solid rgba(255,255,255,0.06) !important;
}
/* ✅ anti coins carrés bubble-ui embed */
#cb-bubble-ui-root{
  overflow: hidden;
  border-radius: var(--cb-radius-3);
}

#cb-bubble-ui-root > *{
  border-radius: inherit !important;
  overflow: hidden !important;
}

html[data-cb-theme="light"] .cb-embedded-window{
  box-shadow: 0 18px 46px rgba(12,18,30,0.18) !important;
  border: none !important;
}

/* Optional: in light theme, reduce harsh dark contrast a bit */
html[data-cb-theme="light"] #cb-bubble-ui-root [data-cb="bubble-ui"],
html[data-cb-theme="light"] #cb-bubble-ui-root #cb-bubble-ui,
html[data-cb-theme="light"] #cb-bubble-ui-root .cb-bubble-ui{
  box-shadow: 0 18px 46px rgba(12,18,30,0.18) !important;
  border: none !important;
}

/* ---------------------------------------------------------- */
/* Bubble preview: MINI while scrolling (Multi-corners FINAL)  */
/* Bubble-only scope: data-cb-overlay="bubble" (hermetic)      */
/* ---------------------------------------------------------- */

body.cb-preview-autohide [data-cb-overlay="bubble"].cb-preview-mini{
  opacity: 0.58 !important;
  filter: blur(0px) saturate(0.95);
  transition: opacity 180ms ease, transform 180ms ease;
  will-change: transform;
}

/* OUTWARD translation (moves away from reading zone) */
body.cb-preview-autohide [data-cb-overlay="bubble"].cb-preview-mini[data-cb-corner="TL"]{
  transform: translate3d(-26px, -12px, 0) scale(0.40) !important;
  transform-origin: left top !important;
}
body.cb-preview-autohide [data-cb-overlay="bubble"].cb-preview-mini[data-cb-corner="TR"]{
  transform: translate3d(+26px, -12px, 0) scale(0.40) !important;
  transform-origin: right top !important;
}
body.cb-preview-autohide [data-cb-overlay="bubble"].cb-preview-mini[data-cb-corner="BL"]{
  transform: translate3d(-26px, +12px, 0) scale(0.40) !important;
  transform-origin: left bottom !important;
}
body.cb-preview-autohide [data-cb-overlay="bubble"].cb-preview-mini[data-cb-corner="BR"]{
  transform: translate3d(+26px, +12px, 0) scale(0.40) !important;
  transform-origin: right bottom !important;
}
/* ===================== END PATCH: Bubble mini transform per-corner (Variant B) ===================== */

/* smooth animations */
body.cb-preview-autohide [data-cb-overlay="bubble"],
body.cb-preview-autohide .cb-overlay{
  transition: opacity 180ms ease, transform 180ms ease;
}

/* Overlays */
.cb-overlay{
  position: fixed;
  right: 14px;
  bottom: 14px;
  z-index: 1000;
}
/* Ensure overlays are always clickable and above panels */
.cb-overlay{
  pointer-events: auto !important;
}

#cb-overlay-player,
#cb-overlay-player *{
  pointer-events: auto !important;
}

#cb-overlay-player{
  z-index: 1200 !important; /* above everything */
}

/* Bubble overlay: MUST be "just the bubble" (no grey card) */
[data-cb-overlay="bubble"]{
  background: transparent;
  border: none;
  box-shadow: none;
  width: auto;
  height: auto;
}

/* Bubble overlay corner positioning (CLEAN, driven by data-cb-corner) */
[data-cb-overlay="bubble"][data-cb-corner="TL"]{ top: 16px !important; left: 16px !important; right: auto !important; bottom: auto !important; }
[data-cb-overlay="bubble"][data-cb-corner="TR"]{ top: 16px !important; right: 16px !important; left: auto !important; bottom: auto !important; }
[data-cb-overlay="bubble"][data-cb-corner="BL"]{ bottom: 16px !important; left: 16px !important; right: auto !important; top: auto !important; }
[data-cb-overlay="bubble"][data-cb-corner="BR"]{ bottom: 16px !important; right: 16px !important; left: auto !important; top: auto !important; }


/* Player overlay glass (mini + expand) */
#cb-overlay-player{
  width: 220px;
  height: 180px;
  border-radius: 18px;
  overflow: hidden;
  background: rgba(18,24,38,0.38);
  border: 1px solid rgba(255,255,255,0.16);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: var(--cb-shadow-strong);
}
#cb-overlay-player.is-expanded{
  width: min(420px, calc(100vw - 28px));
  height: min(60vh, 520px);
}

#cb-overlay-player-bar{
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 10px;
  border-bottom: 1px solid rgba(255,255,255,0.14);
  color: rgba(255,255,255,0.92);
  font-weight: 950;
  font-size: 12px;
  user-select: none;
}

#cb-overlay-player-btn{
  border: 1px solid rgba(255,255,255,0.16);
  background: rgba(255,255,255,0.10);
  color: rgba(255,255,255,0.92);
  border-radius: 10px;
  padding: 5px 8px;
  cursor: pointer;
  font-weight: 950;
  line-height: 1;
}

#cb-overlay-player-body{
  height: calc(100% - 34px);
  background: rgba(255,255,255,0.06);
}

/* Mobile <=480px */
@media(max-width:480px){
  :root{ --cb-safe-bottom: 320px; }
  #cb-header, #cb-tabs{ margin-left: 8px; margin-right: 8px; }
  #cb-main{ padding-left: 10px; padding-right: 10px; }
  #cb-overlay-player{ width: 190px; height: 150px; }
  .cb-overlay{ right: 10px; bottom: 10px; }
}

`;
        LOG("[BOOTSTRAP] Skin injected");
}

injectGlobalSkin();


    // ==========================================================
    // 2) Local UI settings (FR/EN + Light/Dark) - UI only
    // ==========================================================
    const LS_LANG = "cb_lang";
    const LS_THEME = "cb_theme";
// Global Skin / Theme (Jour 3)
function __cbDebugTheme() {
  return {
    theme: document.documentElement.getAttribute("data-cb-theme"),
    stored: (() => { try { return localStorage.getItem(LS_THEME); } catch { return null; } })(),
    skin: !!document.getElementById("cb-skin")
  };
}
window.__cbDebugTheme = __cbDebugTheme;

    function readLang() {
      try {
        const v = localStorage.getItem(LS_LANG);
        return v === "en" ? "en" : "fr";
      } catch {
        return "fr";
      }
    }

    function readTheme() {
      try {
        const v = localStorage.getItem(LS_THEME);
        if (v === "light" || v === "dark") return v;
      } catch {}
      try {
        if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) return "light";
      } catch {}
      return "dark";
    }

    function applyLang(lang) {
      const v = lang === "en" ? "en" : "fr";
      document.documentElement.setAttribute("data-cb-lang", v);
      try { localStorage.setItem(LS_LANG, v); } catch {}
      LOG(`[BOOTSTRAP] lang = ${v}`);
      return v;
    }

    function applyTheme(theme) {
      const v = theme === "light" ? "light" : "dark";
      document.documentElement.setAttribute("data-cb-theme", v);
      try { localStorage.setItem(LS_THEME, v); } catch {}
      LOG(`[BOOTSTRAP] theme = ${v}`);
      return v;
    }

    function setSafeBottom(px) {
      document.documentElement.style.setProperty("--cb-safe-bottom", px);
    }

    // ==========================================================
    // 3) HARD reset DOM (kill legacy)
    // ==========================================================
    document.body.innerHTML = "";

    // ==========================================================
    // 4) Shell DOM (single column, UIKit)
    // ==========================================================
    const shell = document.createElement("div");
    shell.id = "cb-shell";
    shell.classList.add("cb-prestige");

    const header = document.createElement("div");
    header.id = "cb-header";
    header.innerHTML = `
      <div id="cb-brand">
        <span class="dot"></span>
        <span>ConvertBubble V3</span>
      </div>
      <div id="cb-actions"></div>
    `;

    const actions = header.querySelector("#cb-actions");

    const btnFR = document.createElement("button");
    btnFR.id = "cb-lang-fr";
    btnFR.className = "cb-chip";
    btnFR.type = "button";
    btnFR.textContent = "FR";

    const btnEN = document.createElement("button");
    btnEN.id = "cb-lang-en";
    btnEN.className = "cb-chip";
    btnEN.type = "button";
    btnEN.textContent = "EN";

    const btnTheme = document.createElement("button");
    btnTheme.id = "cb-theme-toggle";
    btnTheme.className = "cb-chip";
    btnTheme.type = "button";
    btnTheme.textContent = "Light | Dark";

    actions.appendChild(btnFR);
    actions.appendChild(btnEN);
    actions.appendChild(btnTheme);

    const tabsBar = document.createElement("div");
    tabsBar.id = "cb-tabs";

    const tabsCapsule = document.createElement("div");
    tabsCapsule.id = "cb-tabs-capsule";

    const tabBubble = document.createElement("button");
    tabBubble.className = "cb-tab";
    tabBubble.type = "button";
    tabBubble.textContent = "Bulle";
    tabBubble.dataset.tab = "bubble";

    const tabPlayer = document.createElement("button");
    tabPlayer.className = "cb-tab";
    tabPlayer.type = "button";
    tabPlayer.textContent = "Player";
    tabPlayer.dataset.tab = "player";

    const tabTimeline = document.createElement("button");
    tabTimeline.className = "cb-tab";
    tabTimeline.type = "button";
    tabTimeline.textContent = "Timeline";
    tabTimeline.dataset.tab = "timeline";

    tabsCapsule.appendChild(tabBubble);
    tabsCapsule.appendChild(tabPlayer);
    tabsCapsule.appendChild(tabTimeline);
    tabsBar.appendChild(tabsCapsule);

    const main = document.createElement("div");
    main.id = "cb-main";

    const mainInner = document.createElement("div");
    mainInner.id = "cb-main-inner";

    // STRICT 3 panels in main scroll
    const panelBubble = document.createElement("section");
    panelBubble.id = "cb-panel-bubble";
    panelBubble.className = "cb-panel";
panelBubble.dataset.variant = "flat";
// ----------------------------------------------------------
// Bubble tab embedded layout (contract IA-C)
// ----------------------------------------------------------
panelBubble.innerHTML = `
  <div id="cb-bubble-panel-content">
    <div id="cb-bubble-ui-root" class="cb-bubble-ui-root"></div>
  </div>
`;
LOG?.("[BOOTSTRAP] bubble layout ensured: #cb-bubble-ui-root");

    const panelPlayer = document.createElement("section");
    panelPlayer.id = "cb-panel-player";
    panelPlayer.className = "cb-panel";
panelPlayer.dataset.variant = "glass";

    const panelTimeline = document.createElement("section");
    panelTimeline.id = "cb-panel-timeline";
    panelTimeline.className = "cb-panel";
panelTimeline.dataset.variant = "glass";

// ----------------------------------------------------------
// Legacy alias containers (required by legacy bubble/player UI)
// ----------------------------------------------------------
const legacyBubbleMount = document.createElement("div");
legacyBubbleMount.id = "panel-bubble";
const bubbleUiRoot = panelBubble.querySelector("#cb-bubble-ui-root");
bubbleUiRoot.appendChild(legacyBubbleMount);

// bubble-ui legacy expects these IDs to exist at init time
legacyBubbleMount.innerHTML = `
  <div id="dropzone" style="display:none;"></div>
  <input id="fileInput" type="file" style="display:none;" />
  <div id="bubble-ui-root"></div>
`;

const legacyPlayerMount = document.createElement("div");
legacyPlayerMount.id = "panel-player";
panelPlayer.appendChild(legacyPlayerMount);

const legacyTimelineMount = document.createElement("div");
legacyTimelineMount.id = "panel-timeline";
panelTimeline.appendChild(legacyTimelineMount);

    mainInner.appendChild(panelBubble);
    mainInner.appendChild(panelPlayer);
    mainInner.appendChild(panelTimeline);
    main.appendChild(mainInner);

    shell.appendChild(header);
    shell.appendChild(tabsBar);
    shell.appendChild(main);

    // Hidden legacy parking (NOT in main scroll)
    const legacyParking = document.createElement("div");
    legacyParking.id = "cb-legacy-parking";
    legacyParking.style.display = "none";

    // settings-ui.js requires #cb-panel (we satisfy it, but keep it hidden)
    const legacyPanel = document.createElement("div");
    legacyPanel.id = "cb-panel";
    legacyParking.appendChild(legacyPanel);

    document.body.appendChild(shell);
    document.body.appendChild(legacyParking);
// Global legacy anchors (some legacy code queries document-level IDs)
if (!document.getElementById("dropzone")) {
  const dz = document.createElement("div");
  dz.id = "dropzone";
  dz.style.display = "none";
  document.body.appendChild(dz);
}
if (!document.getElementById("fileInput")) {
  const fi = document.createElement("input");
  fi.id = "fileInput";
  fi.type = "file";
  fi.style.display = "none";
  document.body.appendChild(fi);
}

    LOG("[BOOTSTRAP] shell mounted");
    LOG("[BOOTSTRAP] panels ready");

    // ==========================================================
    // 5) Overlays (bubble-only + mini player)
    // ==========================================================
    // Bubble overlay: just bubble preview root
    const overlayBubble = document.createElement("div");
    overlayBubble.id = "cb-overlay-bubble";
    overlayBubble.className = "cb-overlay";


    // CLEAN: attribute for design-system scoping (no ID-specific CSS)
    overlayBubble.setAttribute('data-cb-overlay','bubble');
    const bubblePreviewRoot = document.createElement("div");
    bubblePreviewRoot.setAttribute("data-cb", "bubble-preview");
    overlayBubble.appendChild(bubblePreviewRoot);

    // Player overlay: glass mini with expand
    const overlayPlayer = document.createElement("div");
    overlayPlayer.id = "cb-overlay-player";
    overlayPlayer.className = "cb-overlay";
    overlayPlayer.innerHTML = `
      <div id="cb-overlay-player-bar">
        <span>Mini Player</span>
        <button id="cb-overlay-player-btn" type="button" aria-expanded="false">⤢</button>
      </div>
      <div id="cb-overlay-player-body"></div>
    `;

    // Put preview iframe inside player overlay body (bridge target)
    const overlayPlayerBody = overlayPlayer.querySelector("#cb-overlay-player-body");
    const iframe = document.createElement("iframe");
    iframe.title = "ConvertBubble Preview";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "0";
    iframe.style.background = "transparent";
    overlayPlayerBody.appendChild(iframe);

    document.body.appendChild(overlayBubble);
    document.body.appendChild(overlayPlayer);

    LOG("[BOOTSTRAP] overlays ready");

    // ==========================================================
    // 6) UI switches init
    // ==========================================================
    const lang0 = applyLang(readLang());
    const theme0 = applyTheme(readTheme());

    function syncLangUI(lang) {
      btnFR.classList.toggle("is-active", lang === "fr");
      btnEN.classList.toggle("is-active", lang === "en");
    }
    function syncThemeUI(theme) {
      btnTheme.classList.toggle("is-active", theme === "dark");
    }
    syncLangUI(lang0);
    syncThemeUI(theme0);

    btnFR.addEventListener("click", () => syncLangUI(applyLang("fr")));
    btnEN.addEventListener("click", () => syncLangUI(applyLang("en")));
    btnTheme.addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-cb-theme") === "light" ? "light" : "dark";
      const next = cur === "dark" ? "light" : "dark";
      syncThemeUI(applyTheme(next));
    });

    // ==========================================================
    // 7) Core + bridge + module init (guarded)
    // ==========================================================
    const core = createCore({ debug: false });
    const previewBridge = initPreviewBridge({ iframe, core });

    let bubblePreviewApi = null;
    let playerApi = null;
    let timelineApi = null;

    function render() {
      try { bubblePreviewApi?.render?.(); } catch {}
      try { playerApi?.sync?.(); } catch {}
      try { timelineApi?.sync?.(); } catch {}
      try { previewBridge?.render?.(); } catch {}
    }

    // init BubblePreview (contract rootEl)
    try {
      bubblePreviewApi = initBubblePreview({ core, selectors, rootEl: bubblePreviewRoot });
      LOG("[BOOTSTRAP] initBubblePreview OK");
    } catch (e) {
      console.warn("[BOOTSTRAP] initBubblePreview FAILED", e);
    }

    // init BubbleUI (contract rootEl)
    try {
      initBubbleUI({ core, selectors, render, rootEl: legacyBubbleMount });
      LOG("[BOOTSTRAP] initBubbleUI OK");
    } catch (e) {
      console.warn("[BOOTSTRAP] initBubbleUI FAILED", e);
    }

    // init PlayerUI (contract rootEl)
    try {
      playerApi = initPlayerUI({ core, selectors, render, rootEl: legacyPlayerMount });
      LOG("[BOOTSTRAP] initPlayerUI OK");
    } catch (e) {
      console.warn("[BOOTSTRAP] initPlayerUI FAILED", e);
    }

    // init TimelineUI (contract rootEl)
    try {
      timelineApi = initTimelineUI({ core, selectors, render, rootEl: legacyTimelineMount });
      LOG("[BOOTSTRAP] initTimelineUI OK");
    } catch (e) {
      console.warn("[BOOTSTRAP] initTimelineUI FAILED", e);
    }

    // Legacy drivers: we init, then we neutralize anything they inject
    try { initSettingsUI({ core, selectors, render }); } catch {}
    try { initI18nUI({ core, render }); } catch {}
    try { initSnippetUI({ core, exportConfigV3: core.exportConfigV3, rootEl: legacyPanel }); } catch {}

    // ==========================================================
    // 8) Kill ANY legacy DOM pollution (hard sweep)
    // ==========================================================
    function sweepLegacyNodes() {
      const keepIds = new Set([
  "cb-shell",
  "cb-legacy-parking",
  "cb-overlay-bubble",
  "cb-overlay-player",
  "cb-panel-bubble",
  "cb-panel-player",
  "cb-panel-timeline",
]);

      Array.from(document.body.children).forEach((node) => {
  if (!(node instanceof HTMLElement)) return;
  if (keepIds.has(node.id)) return;

  // ✅ IMPORTANT: never move anything that belongs to the shell subtree
  // (bubble-ui/player-ui may inject nodes after init)
  if (shell.contains(node)) return;

  // Anything else is considered legacy pollution -> move to parking
  // Instead of hiding legacy UI, mount it into Bubble panel
legacyParking.appendChild(node);


});
    }

    // Call once after init
    sweepLegacyNodes();

    // And keep sweeping if something tries to append later
    const mo = new MutationObserver(() => sweepLegacyNodes());
    mo.observe(document.body, { childList: true });
// ==========================================================
// 9bis) Bubble tab embed: move legacy bubble UI into white panel
// ==========================================================
const BUBBLE_CANDIDATES = [
  "#cb-bubble-ui",
  "#bubble-ui",
  "#bubblePanel",
  "#cb-bubble-panel",
  ".cb-bubble-ui",
  ".bubble-ui",
  ".cb-bubble-panel",
  "[data-module='bubble-ui']",
  "[data-cb='bubble-ui']"
];

function ensureBubbleLayout() {
  const root = document.querySelector("#cb-bubble-ui-root");
  if (!root) {
    console.warn("[BOOTSTRAP] bubble root missing: #cb-bubble-ui-root");
    return null;
  }
  LOG("[BOOTSTRAP] bubbleTab mount");
  LOG("[BOOTSTRAP] bubble layout ensured: #cb-bubble-ui-root");
  return root;
}

function findLegacyBubbleUI() {
  for (const sel of BUBBLE_CANDIDATES) {
    const el = document.querySelector(sel);
    if (el) return { el, selector: sel };
  }
  return null;
}

function sanitizeEmbeddedStyles(el) {
  if (!(el instanceof HTMLElement)) return;
  el.classList.add("cb-embedded-window");

  el.style.position = "relative";
  el.style.left = "auto";
  el.style.top = "auto";
  el.style.right = "auto";
  el.style.bottom = "auto";
  el.style.transform = "none";
  el.style.zIndex = "auto";
  el.style.width = "100%";
  el.style.maxWidth = "100%";
  el.style.height = "auto";
  el.style.maxHeight = "none";
  el.style.pointerEvents = "auto";

  // optional cleanup
  el.style.boxShadow = "none";
  el.style.borderRadius = "inherit";
  // kill window look
  el.style.background = "transparent";
  el.style.margin = "0";
  el.style.padding = "0";
  el.style.overflow = "visible";
  

  // also neutralize nested scroll containers inside bubble UI
  try {
    el.querySelectorAll("*").forEach((n) => {
      if (!(n instanceof HTMLElement)) return;
      const ov = getComputedStyle(n).overflowY;
      if (ov === "auto" || ov === "scroll") {
        n.style.overflowY = "visible";
        n.style.maxHeight = "none";
      }
    });
  } catch {}
}


function disableBubbleFloatingWindow() {
  const floating = document.querySelector(".cb-floating-bubble-panel, #cb-bubble-floating");
  if (floating) {
    floating.style.display = "none";
    LOG("[BOOTSTRAP] bubble floating window disabled");
  }
}

function embedLegacyBubbleUIIntoPanel() {
  const bubbleRootEl = ensureBubbleLayout();
  if (!bubbleRootEl) return;

  const found = findLegacyBubbleUI();
  if (!found) return;

  const legacyEl = found.el;

  // Already embedded?
  if (bubbleRootEl.contains(legacyEl)) return;

  LOG(`[BOOTSTRAP] legacy bubble UI found: ${found.selector} -> moving into panel`);

  // Move into embedded root
  bubbleRootEl.innerHTML = "";
  bubbleRootEl.appendChild(legacyEl);

  sanitizeEmbeddedStyles(legacyEl);
  disableBubbleFloatingWindow();

  LOG("[BOOTSTRAP] bubble UI embedded in panel (OK)");
}

// Debug helper
window.__cbDebugBubble = () => ({
  tab: STATE?.activeTab,
  bubblePanelRoot: !!document.querySelector("#cb-bubble-ui-root"),
  legacyFound: [...document.querySelectorAll(BUBBLE_CANDIDATES.join(","))].map(el => el.id || el.className),
});

    // ==========================================================
    // 9) Deterministic state machine (tabs -> panels + overlays + safe-bottom)
    // ==========================================================
    const STATE = { activeTab: "bubble", playerExpanded: false };

    const overlayPlayerBtn = overlayPlayer.querySelector("#cb-overlay-player-btn");
function wireMiniPlayerOverlayHandlers() {
  // prevent multi-bind
  if (overlayPlayerBtn.__cbWired) return;
  overlayPlayerBtn.__cbWired = true;

  overlayPlayerBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    LOG("[BOOTSTRAP] mini player expand click");

    // ✅ Deterministic rule:
    // From Timeline => go Player tab + force expanded
   if (STATE.activeTab === "timeline") {
  STATE.playerExpanded = !STATE.playerExpanded; // toggle, sans quitter Timeline
  LOG(`[BOOTSTRAP] expanded state => ${STATE.playerExpanded ? "true" : "false"}`);
  applyPlayerOverlaySize();
  updateSafeBottom(STATE.activeTab);
  return;
}


    // Normal behavior elsewhere
    STATE.playerExpanded = !STATE.playerExpanded;
    LOG(`[BOOTSTRAP] expanded state => ${STATE.playerExpanded ? "true" : "false"}`);

    applyPlayerOverlaySize();
    updateSafeBottom(STATE.activeTab);
  });
}
// ==========================================================
// Bubble Preview: MINI while scrolling (Bubble tab only)
// CLEAN PREMIUM BLOCK (single block, no patchwork)
// - Multi-corners TL/TR/BL/BR
// - Mini applies to overlay (transformed ancestor)
// - Overlay follows corner immediately (also on switchTab)
// ==========================================================
let __cbBubbleScrollTimer = null;
let __cbBubbleScrollWired = false;
let __cbBubbleScrollHandler = null;

function getCornerUX(position) {
  const p = String(position || "BR").toUpperCase();
  if (p === "TL") return { pos: "TL", origin: "left top" };
  if (p === "TR") return { pos: "TR", origin: "right top" };
  if (p === "BL") return { pos: "BL", origin: "left bottom" };
  return { pos: "BR", origin: "right bottom" };
}

function readBubbleCornerPosition() {
  try {
    const st = core?.getState?.();
    const pos = st?.bubble?.position || "BR";
    return String(pos || "BR").toUpperCase();
  } catch (e) {
    return "BR";
  }
}

function getBubbleOverlayEl() {
  // Prefer clean attribute scope (design system), fallback to legacy id
  return document.querySelector('[data-cb-overlay="bubble"]') || document.getElementById('cb-overlay-bubble');
}

function applyBubbleCornerToOverlay() {
  const ov = getBubbleOverlayEl();
  if (!ov) return;

  const pos = readBubbleCornerPosition();
  const ux = getCornerUX(pos);

  ov.setAttribute('data-cb-corner', ux.pos);
  ov.style.transformOrigin = ux.origin;

  LOG("[BOOTSTRAP] Bubble ScrollUX corner:", ux.pos, ux.origin);
}

function resetBubbleCornerOverlay() {
  const ov = getBubbleOverlayEl();
  if (!ov) return;
  ov.removeAttribute('data-cb-corner');
  ov.style.transformOrigin = "";
}

function setBubblePreviewMini(isMini) {
  const ov = getBubbleOverlayEl();
  if (!ov) return;
  ov.classList.toggle('cb-preview-mini', !!isMini);
}

window.__cbDebugBubbleCornerUX = () => {
  const ov = getBubbleOverlayEl();
  const pos = readBubbleCornerPosition();
  const ux = getCornerUX(pos);
  return {
    bubblePosition: pos,
    ux,
    overlayFound: !!ov,
    overlayCorner: ov ? ov.getAttribute('data-cb-corner') : null,
    overlayHasMini: ov ? ov.classList.contains('cb-preview-mini') : false,
    computedTransform: ov ? getComputedStyle(ov).transform : null,
    computedOrigin: ov ? getComputedStyle(ov).transformOrigin : null,
  };
};

function attachBubbleScrollUX() {
  if (!ENABLE_BUBBLE_PREVIEW_SCROLL_MINI) return;

  // attach only in bubble tab
  if (STATE.activeTab !== "bubble") return;

  // prevent double bind
  if (__cbBubbleScrollWired) return;

  const scroller = document.querySelector("#cb-main");
  if (!scroller) return;

  document.body.classList.add("cb-preview-autohide");

  // Apply immediately (not only while scrolling)
  applyBubbleCornerToOverlay();

  __cbBubbleScrollHandler = () => {
    if (STATE.activeTab !== "bubble") return;

    // keep in sync with position changes
    applyBubbleCornerToOverlay();

    setBubblePreviewMini(true);

    clearTimeout(__cbBubbleScrollTimer);
    __cbBubbleScrollTimer = setTimeout(() => {
      if (STATE.activeTab !== "bubble") return;
      setBubblePreviewMini(false);
    }, 700);
  };

  scroller.addEventListener("scroll", __cbBubbleScrollHandler, { passive: true });
  __cbBubbleScrollWired = true;

  LOG("[BOOTSTRAP] attachBubbleScrollUX (OK)");
}

function detachBubbleScrollUX() {
  if (!__cbBubbleScrollWired) return;

  const scroller = document.querySelector("#cb-main");
  if (scroller && __cbBubbleScrollHandler) {
    scroller.removeEventListener("scroll", __cbBubbleScrollHandler);
  }

  __cbBubbleScrollHandler = null;
  __cbBubbleScrollWired = false;

  clearTimeout(__cbBubbleScrollTimer);
  __cbBubbleScrollTimer = null;

  resetBubbleCornerOverlay();
  setBubblePreviewMini(false);

  LOG("[BOOTSTRAP] detachBubbleScrollUX (OK)");
}

    function setTabsUI(tab) {
      tabBubble.classList.toggle("is-active", tab === "bubble");
      tabPlayer.classList.toggle("is-active", tab === "player");
      tabTimeline.classList.toggle("is-active", tab === "timeline");
    }

    function setPanels(tab) {
      panelBubble.classList.toggle("cb-hidden", tab !== "bubble");
      panelPlayer.classList.toggle("cb-hidden", tab !== "player");
      panelTimeline.classList.toggle("cb-hidden", tab !== "timeline");
    }

    function setOverlays(tab) {
      // NEVER both overlays at same time
      overlayBubble.style.display = tab === "bubble" ? "block" : "none";
      overlayPlayer.style.display = tab === "bubble" ? "none" : "block";
    }

    function updateSafeBottom(tab) {
      const w = window.innerWidth;
      if (w <= 480) {
        setSafeBottom(tab === "bubble" ? "320px" : "260px");
        return;
      }
      if (tab === "bubble") setSafeBottom("260px");
      if (tab === "player") setSafeBottom("260px");
      if (tab === "timeline") setSafeBottom("220px");
    }

    function applyPlayerOverlaySize() {
      const expanded = !!STATE.playerExpanded;
      overlayPlayer.classList.toggle("is-expanded", expanded);
      overlayPlayerBtn.setAttribute("aria-expanded", expanded ? "true" : "false");
      overlayPlayerBtn.textContent = expanded ? "⤡" : "⤢";
    }

    function switchTab(tabName) {
const prevTab = STATE.activeTab;

      const tab = (tabName === "player" || tabName === "timeline") ? tabName : "bubble";
      STATE.activeTab = tab;
LOG(`[BOOTSTRAP] switchTab: ${prevTab} -> ${tab}`);

// ✅ Auto-collapse: leaving Timeline => force mini
if (prevTab === "timeline" && tab !== "timeline") {
  STATE.playerExpanded = false;
  LOG("[BOOTSTRAP] leaving timeline -> collapse mini player");
}
// ✅ Auto-collapse: entering Timeline => force mini
if (tab === "timeline") {
  STATE.playerExpanded = false;
  LOG("[BOOTSTRAP] entering timeline -> collapse mini player");
}

      // Timeline forces mini overlay
      

      setTabsUI(tab);
      setPanels(tab);
if (tab === "bubble") {
  embedLegacyBubbleUIIntoPanel();
}

      setOverlays(tab);
      if (tab === "bubble") {
        // apply corner immediately so mini/anchor is correct even before scroll
        applyBubbleCornerToOverlay();
      }


      applyPlayerOverlaySize();
      updateSafeBottom(tab);
wireMiniPlayerOverlayHandlers();

// Bubble preview mini-on-scroll guardrails
if (tab === "bubble") {
  attachBubbleScrollUX();
} else {
  detachBubbleScrollUX();
}


      LOG(`[BOOTSTRAP] tab switch: ${tab}`);
      render();
    }

    tabBubble.addEventListener("click", () => switchTab("bubble"));
    tabPlayer.addEventListener("click", () => switchTab("player"));
    tabTimeline.addEventListener("click", () => switchTab("timeline"));

    

    window.addEventListener("resize", () => updateSafeBottom(STATE.activeTab));

    // ==========================================================
    // 10) Boot initial state
    // ==========================================================
    switchTab("bubble");

    
  } catch (err) {
    console.error(err);
    document.body.innerHTML = `
      <div style="padding:16px;font-family:Inter,system-ui,sans-serif;">
        <div style="font-weight:900;font-size:16px;margin-bottom:8px;">ConvertBubble — Shell error</div>
        <div style="opacity:.75;line-height:1.35;">Le shell n’a pas pu démarrer, mais l’écran blanc a été évité. Ouvre la console.</div>
      </div>
    `;
  }
})();


