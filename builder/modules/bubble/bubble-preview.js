console.log("🟢 bubble-preview.js LOADED");

// /builder/modules/bubble/bubble-preview.js

// CBV3:ZONE:EXPORTS
export function initBubblePreview({ core, selectors, rootEl }) {
  // ✅ CONTRACT: Preview mounted ONLY in shell container
  const existing =
    rootEl ||
    document.querySelector('[data-cb="bubble-preview"]');

  if (!existing) return;

  // Idempotent init: if the shell calls initBubblePreview() multiple times, reuse the same instance
  if (existing.__cbpBubblePreview && typeof existing.__cbpBubblePreview.render === "function") {
    return existing.__cbpBubblePreview;
  }


  // IMPORTANT: never remove shell root
  existing.innerHTML = "";

  // CBV3:ZONE:IA-A2:DOM-CSS
  // Scoped CSS (no global hacks)
  const styleId = "cb-bubble-v3-premium-preview";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      .cbp-root{
        position:fixed;
        z-index:2147483647;
        display:grid;
        place-items:center;
        user-select:none;
        touch-action:manipulation;
        -webkit-tap-highlight-color:transparent;
      }

      /* single DOM bubble */
      .cbp-bubble{
        width:100%;
        height:100%;
        display:block;
        overflow:hidden;
        box-sizing:border-box;

        border-style:solid;
        border-color: var(--cbp-border-color);
        border-width: clamp(0px, var(--cbp-border-width), 12px);

        background: rgba(12,13,22,0.96);

        /* soft 3D / glass / depth */
        box-shadow:
          0 22px 55px rgba(0,0,0,0.48),
          0 8px 22px rgba(0,0,0,0.32),
          inset 0 0 0 1px rgba(255,255,255,0.06);
        transform: translateZ(0);
      }

      .cbp-layout{
        width:100%;
        height:100%;
        display:grid;
        overflow:hidden;
        align-content: stretch;
      }
      .cbp-layout > *{
        min-height: 0;
        min-width: 0;
        height: 100%;
        align-self: stretch;
      }

      /* presets */
      .cbp-bubble[data-preset="circle"]{ border-radius:999px; }
      .cbp-bubble[data-preset="rounded"]{ border-radius:20px; }
      .cbp-bubble[data-preset="badge"]{ border-radius:16px; }

      /* zones */
      .cbp-zone-preview{
        position:relative;
        overflow:hidden;
        background: #07080f;
      }

      /* premium light + vignette + depth */
      .cbp-zone-preview::before{
        content:"";
        position:absolute;
        inset:-35%;
        background: radial-gradient(closest-side at 28% 18%,
          rgba(255,255,255,0.18),
          rgba(255,255,255,0.00) 62%);
        opacity:0.9;
        pointer-events:none;
        transform: translateZ(0);
      }
      .cbp-zone-preview::after{
        content:"";
        position:absolute;
        inset:0;
        background:
          linear-gradient(to bottom,
            rgba(0,0,0,0.10) 0%,
            rgba(0,0,0,0.18) 45%,
            rgba(0,0,0,0.70) 100%);
        pointer-events:none;
      }

      .cbp-media{
        position:absolute;
        inset:0;
        width:100%;
        height:100%;
        object-fit:cover;
        transform: scale(1.04);
        filter: saturate(1.05) contrast(1.03);
        opacity:0.98;
        pointer-events:none;
      }

      /* logo mode: contain + soft panel */
      .cbp-zone-preview[data-media-type="logo"] .cbp-media{
        object-fit:contain;
        transform:none;
        padding:10%;
        filter:none;
        opacity:0.98;
      }
      .cbp-zone-preview[data-media-type="logo"]{
        background:
          radial-gradient(120% 120% at 20% 20%,
            rgba(255,255,255,0.10) 0%,
            rgba(255,255,255,0.02) 35%,
            rgba(0,0,0,0.55) 100%);
      }

      .cbp-zone-text{
        display:grid;
        place-items:center;
        padding:10px 12px;
        box-sizing:border-box;
        background: var(--cbp-text-bg);
        position:relative;
        height: 100%;
      }

      .cbp-zone-text::before{
        content:"";
        position:absolute;
        inset:0;
        background: linear-gradient(
          to bottom,
          rgba(255,255,255,0.10),
          rgba(255,255,255,0.00) 55%
        );
        pointer-events:none;
        opacity:0.35;
      }

      .cbp-caption{
        width:100%;
        text-align:center;
        white-space: normal;
        word-break: break-word;
        hyphens: auto;
        padding: 0 2px;

        font-family: var(--cbp-font-family, system-ui);
        font-weight: 800;
        letter-spacing: 0.15px;
        line-height: 1.08;
        color: var(--cbp-text-color, rgba(255,255,255,0.96));
        text-shadow: 0 2px 10px rgba(0,0,0,0.40);
        transform: translateZ(0);
      }

      /* animations (preview-only) */
      @keyframes cbpPulse { 0%,100%{ transform:scale(1);} 50%{ transform:scale(1.04);} }
      @keyframes cbpBounce { 0%,100%{ transform:translateY(0);} 50%{ transform:translateY(-6px);} }

      .cbp-bubble[data-anim="pulse"]{ animation: cbpPulse 2.7s ease-in-out infinite; }
      .cbp-bubble[data-anim="bounce"]{ animation: cbpBounce 1.9s ease-in-out infinite; }

      @media (prefers-reduced-motion: reduce){
        .cbp-bubble{ animation:none !important; }
      }

      .cbp-placeholder{
        position:absolute;
        inset:0;
        display:grid;
        place-items:center;
        color: rgba(255,255,255,0.75);
        font-weight: 800;
        font-size: 12px;
        letter-spacing: .2px;
        text-align:center;
        padding: 16px;
      }
    `;
    document.head.appendChild(style);
  }
// ✅ IA-A1: Webfonts loader (preview-only, idempotent)
const fontLinkId = "cb-bubble-preview-webfonts";
if (!document.getElementById(fontLinkId)) {
  const link = document.createElement("link");
  link.id = fontLinkId;
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?" +
    "family=Inter:wght@400;600;700;800;900&" +
    "family=Poppins:wght@400;600;700;800;900&" +
    "family=Montserrat:wght@400;600;700;800;900&" +
    "family=Roboto:wght@400;700;900&" +
    "display=swap";
  document.head.appendChild(link);
}

  // DOM: mount into existing bootstrap root (do NOT recreate it)
  const root = existing;
  root.className = "cbp-root";

  const bubble = document.createElement("div");
  bubble.className = "cbp-bubble";

  const layoutContainer = document.createElement("div");
  layoutContainer.className = "cbp-layout";

  const zonePreview = document.createElement("div");
  zonePreview.className = "cbp-zone-preview";

  const imgEl = document.createElement("img");
  imgEl.className = "cbp-media";
  imgEl.alt = "";
  imgEl.decoding = "async";
  imgEl.loading = "eager";
  imgEl.style.display = "none";

  const videoEl = document.createElement("video");
  videoEl.className = "cbp-media";
  videoEl.muted = true;
  videoEl.loop = true;
  videoEl.playsInline = true;
  videoEl.autoplay = true;
  videoEl.preload = "metadata";
  videoEl.controls = false;
  videoEl.style.display = "none";

  const placeholder = document.createElement("div");
  placeholder.className = "cbp-placeholder";
  placeholder.style.display = "none";
  placeholder.textContent = "Aucun média importé";

  const zoneText = document.createElement("div");
  zoneText.className = "cbp-zone-text";

  const captionEl = document.createElement("span");
  captionEl.className = "cbp-caption";

  zonePreview.appendChild(imgEl);
  zonePreview.appendChild(videoEl);
  zonePreview.appendChild(placeholder);

  zoneText.appendChild(captionEl);
  layoutContainer.appendChild(zonePreview);
  layoutContainer.appendChild(zoneText);
  bubble.appendChild(layoutContainer);
  root.appendChild(bubble);

  // CBV3:ZONE:SHARED
    function applyCorner(bubbleState) {
    // ✅ CONTRACT: bubble.position ("TL" | "TR" | "BL" | "BR")
    const pos = bubbleState?.position || "BR";

    root.style.top = root.style.right = root.style.bottom = root.style.left = "";
    const inset = "16px";

    switch (pos) {
      case "TL":
        root.style.left = inset;
        root.style.top = inset;
        break;
      case "TR":
        root.style.right = inset;
        root.style.top = inset;
        break;
      case "BL":
        root.style.left = inset;
        root.style.bottom = inset;
        break;
      case "BR":
      default:
        root.style.right = inset;
        root.style.bottom = inset;
        break;
    }

    return pos; // utile pour l'effet mini
  }


  function autoscaleCaption(containerEl, textEl, maxPx, minPx) {
    textEl.style.fontSize = `${maxPx}px`;
    let guard = 28;
    while (guard-- > 0) {
      const fitsW = textEl.scrollWidth <= containerEl.clientWidth;
      const fitsH = textEl.scrollHeight <= containerEl.clientHeight;
      if (fitsW && fitsH) break;

      const current = parseFloat(getComputedStyle(textEl).fontSize);
      const next = Math.max(minPx, Math.floor(current - 1));
      if (next === current) break;
      textEl.style.fontSize = `${next}px`;
      if (next <= minPx) break;
    }
  }

  function setGridRatio(textRatio) {
    const r = textRatio;
    const isValid = (typeof r === "number") && Number.isFinite(r) && r > 0 && r < 1;
    if (!isValid) {
      console.error("[CB PREVIEW] ratio invalide (attendu: number entre 0 et 1) :", r);
      return;
    }
    const previewRatio = 1 - r;
    layoutContainer.style.gridTemplateRows = `${previewRatio}fr ${r}fr`;
  }

  function renderMedia(type, src) {
    zonePreview.setAttribute("data-media-type", type);

    // hide placeholder when we have a src
    placeholder.style.display = "none";

    if (type === "video") {
      imgEl.removeAttribute("src");
      imgEl.style.display = "none";

      if (videoEl.src !== src) videoEl.src = src;
      videoEl.style.display = "block";
      try { videoEl.play(); } catch (_) {}
      return;
    }

    // image / logo
    videoEl.removeAttribute("src");
    videoEl.style.display = "none";

    if (imgEl.getAttribute("src") !== src) imgEl.setAttribute("src", src);
    imgEl.style.display = "block";
  }

  function clearMedia() {
    imgEl.removeAttribute("src");
    imgEl.style.display = "none";

    videoEl.removeAttribute("src");
    videoEl.style.display = "none";

    zonePreview.setAttribute("data-media-type", "");
    placeholder.style.display = "grid";
  }

  // CBV3:ZONE:IA-A1:RENDER-LOGIC
  function render() {
    const state = core.getState();

    const launcher = selectors.selectLauncher(state);
    const bubbleState = state?.bubble || {};

    const preset = selectors.selectBubblePreset(state);
    const border = selectors.selectBubbleBorder(state);
    const textBg = selectors.selectBubbleTextBackgroundColor(state);
    const anim = selectors.selectBubbleAnimation(state);
    const fontSize = selectors.selectBubbleFontSize(state);
    const caption = selectors.selectCaption(state);
    const textColor = selectors.selectBubbleTextColor(state);

    const theme = selectors.selectTheme(state) || {};

// =========================
// IA-A1 FONT FIX (V3)
// =========================
const DBG_FONT = true; // TEMP (mettre false après diag)

// Helper d'instrumentation: log + stack + valeur précédente
function dbgFontWrite(target, propLabel, nextValue, reason) {
  if (!DBG_FONT) return;
  let prev = "";
  try {
    if (propLabel === "--cbp-font-family") {
      prev = getComputedStyle(target).getPropertyValue("--cbp-font-family").trim();
    } else if (propLabel === "font-family") {
      prev = getComputedStyle(target).fontFamily;
    }
  } catch (_) {}
  console.log(
    `[FONT APPLY] ${propLabel} prev=`,
    prev,
    "next=",
    nextValue,
    "reason=",
    reason,
    "\nSTACK:\n",
    new Error().stack
  );
}

// ✅ CONTRACT: bubble.text.fontFamily PRIME toujours
const bubbleFont = (bubbleState?.text?.fontFamily || "").trim();
const themeFont = (theme?.fontFamily || "").trim();

// IMPORTANT:
// - On ignore volontairement bubbleState.fontFamily (racine) car c'est souvent le champ "pollué" par le thème.
// - On ignore aussi caption.fontFamily si ça peut être dérivé du thème.
// => source de vérité : bubble.text.fontFamily
const finalFont = bubbleFont || themeFont || "system-ui";

// ---- APPLY (design-system var + hard lock inline) ----
dbgFontWrite(bubble, "--cbp-font-family", finalFont, bubbleFont ? "bubble.text.fontFamily" : "theme.fontFamily/fallback");
bubble.style.setProperty("--cbp-font-family", finalFont);

dbgFontWrite(captionEl, "font-family", finalFont, "hard-lock inline (anti flicker)");
captionEl.style.setProperty("font-family", finalFont, "important");

// ✅ ANTI-OVERWRITE GUARD (obligatoire)
// Si bubbleFont existe, on ne doit jamais redescendre à theme dans la même frame/sync
// -> ce guard ne stoppe pas render(), il verrouille juste la source utilisée.
if (bubbleFont) {
  // NOTE: aucun autre apply "theme font" ne doit s'exécuter après ce point pour la bubble preview
}



    // Position
    applyCorner(bubbleState);

    // Size
    root.style.width = `${launcher.size}px`;
    root.style.height = `${launcher.size}px`;

    // Preset
    bubble.setAttribute("data-preset", preset);

    // Border + text BG
    bubble.style.setProperty("--cbp-border-color", border.color);
    bubble.style.setProperty("--cbp-border-width", `${border.width}px`);
    bubble.style.setProperty("--cbp-text-bg", textBg);
    
    bubble.style.setProperty("--cbp-text-color", textColor);

    // Animation
    bubble.setAttribute("data-anim", anim);

    // Ratio (V3 strict: state.bubble.ratio is TEXT ratio)
    setGridRatio(bubbleState.ratio);

    // ✅ MEDIA CONTRACT
    // bubble.media.type + bubble.media.assetId -> selectors.selectAssetById -> asset.blobUrl
    const media = bubbleState.media || {};
    const mediaType = media.type;
    const assetId = media.assetId;

    if (mediaType && assetId) {
      const asset = selectors.selectAssetById(state, assetId);
      const src = asset?.blobUrl || "";

      if (src) {
        renderMedia(mediaType, src);
      } else {
        // SAFE MODE: missing asset or blobUrl
        clearMedia();
      }
    } else {
      clearMedia();
    }

    // Caption
    captionEl.textContent = caption?.text || "";

    // Font size + autoscale
    autoscaleCaption(zoneText, captionEl, fontSize, 9);
  }

  render();
  const api = { render };
  existing.__cbpBubblePreview = api;
  return api;
}

