/**
 * Selectors — ConvertBubble V3
 *
 * IA-D CONTRACT PATCH (Assets/CTA/Branding)
 * - assets selectors
 * - bubble media builderSrc (never src)
 * - timeline ctas selectors
 * - legacy CTA overlay selectors kept
 * - fallback-safe always
 */

const safeObj = (v, fallback) => (v && typeof v === "object" ? v : fallback);

// ----------------------------------
// Meta
// ----------------------------------
export const selectMeta = (s) => safeObj(s, {}).meta ?? {};

// ----------------------------------
// Assets
// ----------------------------------
export const selectAssets = (s) => {
  const a = safeObj(s, {}).assets ?? {};
  const byId = safeObj(a.byId, {});
  const allIds = Array.isArray(a.allIds) ? a.allIds : [];
  return { byId, allIds };
};

export const selectAssetById = (s, id) => {
  const assetId = typeof id === "string" ? id : String(id ?? "");
  const { byId } = selectAssets(s);
  const a = byId?.[assetId];
  return a && typeof a === "object" ? a : null;
};

// ----------------------------------
// Bubble (legacy + contract)
// ----------------------------------
export const selectBubble = (s) => safeObj(s, {}).bubble ?? {};
export const selectBubblePosition = (s) => selectBubble(s).position ?? "BR";
export const selectBubbleShape = (s) => selectBubble(s).shape ?? "";
export const selectBubbleAnimation = (s) => selectBubble(s).animation ?? "none";

export const selectBubblePreset = (s) => selectBubble(s).preset ?? "circle";
export const selectBubbleBorder = (s) => selectBubble(s).border ?? { color: "#000000", width: 0 };
export const selectBubbleBorderColor = (s) => selectBubbleBorder(s).color ?? "#000000";
export const selectBubbleBorderWidth = (s) => selectBubbleBorder(s).width ?? 0;
export const selectBubbleTextBackgroundColor = (s) => selectBubble(s).textBackgroundColor ?? "";
export const selectBubbleTextColor = (s) => selectBubble(s).textColor ?? "#ffffff";
export const selectBubbleFontSize = (s) => selectBubble(s).fontSize ?? 12;

export const selectBubbleLayout = (s) => selectBubble(s).layout ?? "badge";

// Bubble media
export const selectBubbleMedia = (s) =>
  selectBubble(s).media ?? { type: "video", builderSrc: "", assetId: null };

export const selectBubbleMediaType = (s) => selectBubbleMedia(s).type ?? "video";

export const selectBubbleMediaAssetId = (s) => selectBubbleMedia(s).assetId ?? null;

export const selectBubbleMediaAsset = (s) => {
  const id = selectBubbleMediaAssetId(s);
  if (!id) return null;
  return selectAssetById(s, id);
};

/**
 * IA-D CONTRACT PATCH: builder-only naming
 * - Prefer builderSrc
 * - Soft-migrate old "src" if state still has it
 */
export const selectBubbleMediaBuilderSrc = (s) => {
  const m = selectBubbleMedia(s);
  if (typeof m.builderSrc === "string") return m.builderSrc;
  if (typeof m.src === "string") return m.src; // legacy fallback
  return "";
};

// keep legacy name for UI modules if they still call it
export const selectBubbleMediaSrc = (s) => selectBubbleMediaBuilderSrc(s);

export const selectBubbleRatio = (s) => {
  const r = selectBubble(s).ratio;
  return typeof r === "number" ? r : 0.6;
};

// ----------------------------------
// Theme / Caption / Branding / Launcher
// ----------------------------------
export const selectTheme = (s) => safeObj(s, {}).theme ?? {};
export const selectCaption = (s) => safeObj(s, {}).caption ?? {};
export const selectBranding = (s) => safeObj(s, {}).branding ?? {};
export const selectLauncher = (s) => safeObj(s, {}).launcher ?? {};

// ----------------------------------
// Player (legacy + contract)
// ----------------------------------
export const selectPlayer = (s) => {
  const p = safeObj(s, {}).player;
  return p && typeof p === "object" ? p : { src: "", assetId: null, style: {}, branding: {} };
};

export const selectPlayerAssetId = (s) => selectPlayer(s).assetId ?? null;

export const selectPlayerAsset = (s) => {
  const id = selectPlayerAssetId(s);
  if (!id) return null;
  return selectAssetById(s, id);
};

export const selectPlayerStyle = (s) => {
  const st = selectPlayer(s).style;
  const o = st && typeof st === "object" ? st : {};
  return {
    borderWidth: typeof o.borderWidth === "number" ? o.borderWidth : 0,
    borderColor: typeof o.borderColor === "string" ? o.borderColor : "#000000",
    radius: typeof o.radius === "number" ? o.radius : 18,
    shadow: o.shadow === 0 || o.shadow === 1 || o.shadow === 2 ? o.shadow : 1,
  };
};

export const selectPlayerBranding = (s) => {
  const b = selectPlayer(s).branding;
  const o = b && typeof b === "object" ? b : {};
  const mode = typeof o.mode === "string" ? o.mode : "free";
  return {
    mode: mode === "premium" ? "premium" : "free",
    enabled: o.enabled !== undefined ? Boolean(o.enabled) : true,
    label: typeof o.label === "string" ? o.label : "ConvertBubble",
    url: typeof o.url === "string" ? o.url : "",
  };
};

// ----------------------------------
// Timeline contract (hooks + ctas)
// ----------------------------------
export const selectTimeline = (s) => safeObj(s, {}).timeline ?? { hooks: [], ctas: [] };

export const selectTimelineHooks = (s) => {
  const t = selectTimeline(s);
  const hooks = t?.hooks;
  return Array.isArray(hooks) ? hooks : [];
};

export const selectTimelineCtas = (s) => {
  const t = selectTimeline(s);
  const ctas = t?.ctas;
  return Array.isArray(ctas) ? ctas : [];
};

// ----------------------------------
// Legacy CTA overlay model (explicit cohabitation)
// ----------------------------------
export const selectLegacyCtas = (s) => {
  const list = safeObj(s, {}).ctas;
  return Array.isArray(list) ? list : [];
};

export const selectLegacyCtaOverlay = (s) =>
  safeObj(s, {}).ctaOverlay ?? { position: "bottom", layout: "row", buttonColor: "" };

export const selectLegacyTiming = (s) =>
  safeObj(s, {}).timing ?? { sequence: [], showAllAt: 0 };


