/**
 * ConvertBubble V3 — Core Antigravity
 * reducers.js (V3.0.2+contract)
 *
 * - Reducer pur
 * - Aucune mutation
 * - Aucune UI / DOM / runtime
 * - Règles produit inviolables : MAX 4 CTA (legacy)
 */

import { ActionTypes } from "./actions.js";

const POSITION = new Set(["TL", "TR", "BL", "BR"]);
const ANIM = new Set(["none", "pulse", "bounce", "float", "rotate", "breath"]);
const FONT_WEIGHT = new Set(["regular", "medium", "bold"]);
const CAPTION_ALIGN = new Set(["left", "center", "right"]);
const LAUNCHER_TYPE = new Set(["video", "image", "logo"]);
const LAUNCHER_SHAPE = new Set(["circle", "rounded"]);
const CTA_MODE = new Set(["fixed", "timed"]);
const CTA_STYLE = new Set(["primary", "secondary", "outline", "ghost"]);
const PLAYER_SOURCE_TYPE = new Set(["url", "upload"]);

// IA-D CONTRACT PATCH (Assets/CTA/Branding)
const ASSET_KIND = new Set(["image", "video", "logo"]);
const CTA_TYPE = new Set(["url", "tel", "mail", "scroll", "callback"]);

function clamp(n, min, max) {
  if (typeof n !== "number" || Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function str(v) {
  return typeof v === "string" ? v : String(v ?? "");
}

function touchMeta(state, now) {
  if (!now) return state;
  return { ...state, meta: { ...state.meta, updatedAt: now } };
}

function normalizeHooks(hooks) {
  const cleaned = (Array.isArray(hooks) ? hooks : [])
    .filter((h) => h && typeof h.at === "number" && typeof h.name === "string" && h.name.trim() !== "")
    .map((h) => ({ at: h.at, name: h.name }))
    .slice()
    .sort((a, b) => a.at - b.at);

  const seen = new Set();
  const out = [];
  for (const h of cleaned) {
    if (seen.has(h.name)) continue;
    seen.add(h.name);
    out.push(h);
  }
  return out;
}

// IA-D CONTRACT PATCH (Assets/CTA/Branding)
function normalizeAsset(input) {
  const a = input && typeof input === "object" ? input : {};
  const id = str(a.id).trim();
  if (!id) return null;

  const kind = str(a.kind).trim();
  const safeKind = ASSET_KIND.has(kind) ? kind : "image";

  const asset = {
    id,
    kind: safeKind,
    name: str(a.name),
    mime: str(a.mime),
  };

  if (a.size !== undefined) asset.size = typeof a.size === "number" ? a.size : Number(a.size) || 0;
  if (a.blobUrl !== undefined) asset.blobUrl = str(a.blobUrl); // builder-only (must not export)
  if (a.src !== undefined) asset.src = str(a.src); // optional future runtime url

  return asset;
}

// IA-D CONTRACT PATCH (Assets/CTA/Branding)
const CTA_DEFAULT_STYLE = Object.freeze({
  bg: "#00ff88",
  text: "#001a0f",
  radius: 14,
  opacity: 0.95,
  borderWidth: 0,
  borderColor: "transparent",
});

function normalizeCtaStyle(style) {
  const s = style && typeof style === "object" ? style : {};
  return {
    bg: s.bg !== undefined ? str(s.bg) : CTA_DEFAULT_STYLE.bg,
    text: s.text !== undefined ? str(s.text) : CTA_DEFAULT_STYLE.text,
    radius: s.radius !== undefined ? clamp(Number(s.radius), 0, 64) : CTA_DEFAULT_STYLE.radius,
    opacity: s.opacity !== undefined ? clamp(Number(s.opacity), 0, 1) : CTA_DEFAULT_STYLE.opacity,
    borderWidth: s.borderWidth !== undefined ? clamp(Number(s.borderWidth), 0, 20) : CTA_DEFAULT_STYLE.borderWidth,
    borderColor: s.borderColor !== undefined ? str(s.borderColor) : CTA_DEFAULT_STYLE.borderColor,
  };
}

function normalizeCtaPayload(payload) {
  const p = payload && typeof payload === "object" ? payload : {};
  const out = {};
  if (p.url !== undefined) out.url = str(p.url);
  if (p.tel !== undefined) out.tel = str(p.tel);
  if (p.mail !== undefined) out.mail = str(p.mail);
  if (p.anchor !== undefined) out.anchor = str(p.anchor);
  return out;
}

function normalizeCta(input) {
  const c = input && typeof input === "object" ? input : {};
  const id = str(c.id).trim();
  if (!id) return null;

  const type = str(c.type).trim();
  const safeType = CTA_TYPE.has(type) ? type : "url";

  const at = typeof c.at === "number" ? c.at : Number(c.at);
  const duration = typeof c.duration === "number" ? c.duration : Number(c.duration);

  return {
    id,
    at: Number.isFinite(at) ? Math.max(0, at) : 0,
    duration: Number.isFinite(duration) ? Math.max(0, duration) : 0,
    type: safeType,
    label: str(c.label),
    payload: normalizeCtaPayload(c.payload),
    style: normalizeCtaStyle(c.style),
  };
}

function normalizeCtas(ctas) {
  const list = Array.isArray(ctas) ? ctas : [];
  const cleaned = [];
  const seen = new Set();
  for (const item of list) {
    const c = normalizeCta(item);
    if (!c) continue;
    if (seen.has(c.id)) continue;
    seen.add(c.id);
    cleaned.push(c);
  }
  cleaned.sort((a, b) => a.at - b.at);
  return cleaned;
}

// IA-D CONTRACT PATCH (Assets/CTA/Branding)
function normalizePlayerStyle(style) {
  const s = style && typeof style === "object" ? style : {};
  return {
    borderWidth: s.borderWidth !== undefined ? clamp(Number(s.borderWidth), 0, 20) : 0,
    borderColor: s.borderColor !== undefined ? str(s.borderColor) : "#000000",
    radius: s.radius !== undefined ? clamp(Number(s.radius), 0, 64) : 18,
    shadow: s.shadow !== undefined ? clamp(Number(s.shadow), 0, 2) : 1,
  };
}

// IA-D CONTRACT PATCH (Assets/CTA/Branding)
function normalizePlayerBranding(branding) {
  const b = branding && typeof branding === "object" ? branding : {};
  const mode = str(b.mode).trim();
  return {
    mode: mode === "premium" ? "premium" : "free",
    enabled: b.enabled !== undefined ? Boolean(b.enabled) : true,
    label: b.label !== undefined ? str(b.label) : "ConvertBubble",
    url: b.url !== undefined ? str(b.url) : "",
  };
}

export function createInitialState({ now = 0, generator = "" } = {}) {
  return {
    meta: {
      version: "3.0.2",
      createdAt: now || undefined,
      updatedAt: now || undefined,
      generator: generator || undefined,
      nextId: 1, // pour CTA ids (déterministe) - legacy
    },

    // IA-D CONTRACT PATCH (Assets)
    assets: {
      byId: {},
      allIds: [],
    },

    bubble: {
      position: "BR",
      shape: "preset_default", // legacy / compat
      preset: "circle", // state-only
      animation: "none",

      border: {
        color: "#000000",
        width: 0,
      },

      textBackgroundColor: "",
      textColor: "#ffffff",
      fontSize: 12,

      // IA-D CONTRACT PATCH (Bubble contract)
      text: {
        value: "",
        fontFamily: "system-ui",
        color: "#ffffff",
      },

      // state-only (Builder) — not exported in strict runtime config historically
      layout: "badge",

      // builder-only media for bubble preview (historique) + assetId contract
      media: {
        type: "video", // video | image | logo
        builderSrc: "", // builder-only preview
        assetId: null, // IA-D CONTRACT PATCH (Bubble media asset reference)
      },

      ratio: 0.6,
    },

    theme: {
      primaryColor: "#ff7a18",
      border: { color: "#000000", width: 0 },
      font: { family: "Inter, system-ui, sans-serif", size: 14, weight: "regular" },
      palette: { id: "default", colors: ["#ff7a18", "#00e0ff"] },
    },

    caption: {
      text: "Découvre la vidéo",
      maxLines: 2,
      align: "center",
    },

    branding: {
      enabled: false,
      label: "",
      color: "#ffffff",
    },

    launcher: {
      type: "video",
      src: "",
      alt: "",
      previewSeconds: 0,
      size: 64,
      shape: "circle",

      // state-only (Builder)
      media: {
        type: "video",
      },
    },

    player: {
      src: "", // requis runtime (legacy)
      poster: "",
      autoplay: true,
      controls: true,
      source: { type: "url", value: "" }, // Core-only legacy

      // IA-D CONTRACT PATCH (Player contract)
      assetId: null,
      style: normalizePlayerStyle({}),
      branding: normalizePlayerBranding({}),
    },

    // Legacy CTA model (kept)
    cta: { mode: "fixed" },
    ctas: [], // MAX 4 (legacy)
    ctaOverlay: { position: "bottom", layout: "row", buttonColor: "" },
    timing: { sequence: [], showAllAt: 0 },

    // Timeline contract (hooks + ctas)
    timeline: {
      hooks: [],
      // IA-D CONTRACT PATCH (Timeline CTA contract)
      ctas: [],
    },
  };
}

export function reducer(state, action, now = 0) {
  if (!state || !action || typeof action.type !== "string") return state;

  switch (action.type) {
    // META
    case ActionTypes.META_SET_GENERATOR: {
      const generator = str(action.payload);
      return touchMeta({ ...state, meta: { ...state.meta, generator } }, now);
    }

    // IA-D CONTRACT PATCH (Assets)
    case ActionTypes.ASSET_ADD: {
      const asset = normalizeAsset(action.payload);
      if (!asset) return state;

      const exists = Boolean(state.assets?.byId?.[asset.id]);
      const byId = { ...(state.assets?.byId || {}) };
      byId[asset.id] = { ...(byId[asset.id] || {}), ...asset };

      const allIds = Array.isArray(state.assets?.allIds) ? [...state.assets.allIds] : [];
      if (!exists) allIds.push(asset.id);

      return touchMeta({ ...state, assets: { byId, allIds } }, now);
    }

    case ActionTypes.ASSET_REMOVE: {
      const assetId = str(action.payload).trim();
      if (!assetId) return state;

      const byId = { ...(state.assets?.byId || {}) };
      if (!byId[assetId]) return state;
      delete byId[assetId];

      const allIds = (Array.isArray(state.assets?.allIds) ? state.assets.allIds : []).filter((id) => id !== assetId);

      // on ne fait pas de cleanup agressif dans bubble/player pour rester “data-only”
      return touchMeta({ ...state, assets: { byId, allIds } }, now);
    }

    case ActionTypes.ASSET_SET_BLOB_URL: {
      const { assetId, blobUrl } = action.payload || {};
      const id = str(assetId).trim();
      if (!id) return state;

      const byId = { ...(state.assets?.byId || {}) };
      if (!byId[id]) return state;

      byId[id] = { ...byId[id], blobUrl: str(blobUrl) }; // builder-only
      const allIds = Array.isArray(state.assets?.allIds) ? state.assets.allIds : [];
      return touchMeta({ ...state, assets: { byId, allIds } }, now);
    }

    case ActionTypes.ASSET_SET_META: {
      const { assetId, meta } = action.payload || {};
      const id = str(assetId).trim();
      if (!id) return state;

      const byId = { ...(state.assets?.byId || {}) };
      if (!byId[id]) return state;

      const m = meta && typeof meta === "object" ? meta : {};
      const patch = {};
      if (m.kind !== undefined) {
        const k = str(m.kind);
        patch.kind = ASSET_KIND.has(k) ? k : byId[id].kind;
      }
      if (m.name !== undefined) patch.name = str(m.name);
      if (m.mime !== undefined) patch.mime = str(m.mime);
      if (m.size !== undefined) patch.size = typeof m.size === "number" ? m.size : Number(m.size) || 0;
      if (m.src !== undefined) patch.src = str(m.src);

      byId[id] = { ...byId[id], ...patch };
      const allIds = Array.isArray(state.assets?.allIds) ? state.assets.allIds : [];
      return touchMeta({ ...state, assets: { byId, allIds } }, now);
    }

    // BUBBLE
    case ActionTypes.BUBBLE_SET_POSITION: {
      const p = action.payload;
      if (!POSITION.has(p)) return state;
      return touchMeta({ ...state, bubble: { ...state.bubble, position: p } }, now);
    }
    case ActionTypes.BUBBLE_SET_SHAPE: {
      const presetId = str(action.payload);
      return touchMeta({ ...state, bubble: { ...state.bubble, shape: presetId } }, now);
    }
    case ActionTypes.BUBBLE_SET_ANIMATION: {
      const a = action.payload;
      if (!ANIM.has(a)) return state;
      return touchMeta({ ...state, bubble: { ...state.bubble, animation: a } }, now);
    }

    // BUBBLE — STATE ONLY (Builder WOW)
    case ActionTypes.BUBBLE_SET_PRESET: {
      const preset = str(action.payload);
      return touchMeta({ ...state, bubble: { ...state.bubble, preset } }, now);
    }

    case ActionTypes.BUBBLE_SET_BORDER_COLOR: {
      const color = str(action.payload);
      return touchMeta(
        {
          ...state,
          bubble: { ...state.bubble, border: { ...state.bubble.border, color } },
        },
        now
      );
    }

    case ActionTypes.BUBBLE_SET_BORDER_WIDTH: {
      const width = clamp(action.payload, 0, 20);
      return touchMeta(
        {
          ...state,
          bubble: { ...state.bubble, border: { ...state.bubble.border, width } },
        },
        now
      );
    }

    case ActionTypes.BUBBLE_SET_TEXT_BG_COLOR: {
      const color = str(action.payload);
      return touchMeta({ ...state, bubble: { ...state.bubble, textBackgroundColor: color } }, now);
    }

    case ActionTypes.BUBBLE_SET_TEXT_COLOR: {
      const color = str(action.payload);
      return touchMeta({ ...state, bubble: { ...state.bubble, textColor: color } }, now);
    }

    case ActionTypes.BUBBLE_SET_FONT_SIZE: {
      const fontSize = clamp(action.payload, 8, 48);
      return touchMeta({ ...state, bubble: { ...state.bubble, fontSize } }, now);
    }

    case ActionTypes.BUBBLE_SET_LAYOUT: {
      const next = str(action.payload);
      if (!["badge", "horizontal", "vertical", "square", "circle"].includes(next)) return state;
      return touchMeta({ ...state, bubble: { ...state.bubble, layout: next } }, now);
    }

    case ActionTypes.BUBBLE_SET_MEDIA_TYPE: {
      const next = str(action.payload);
      if (!["video", "image", "logo"].includes(next)) return state;
      return touchMeta(
        { ...state, bubble: { ...state.bubble, media: { ...state.bubble.media, type: next } } },
        now
      );
    }

    case ActionTypes.BUBBLE_SET_MEDIA_SRC: {
      return touchMeta(
        { ...state, bubble: { ...state.bubble, media: { ...state.bubble.media, builderSrc: str(action.payload) } } },
        now
      );
    }

    case ActionTypes.BUBBLE_SET_RATIO: {
      const ratio = action.payload;
      if (typeof ratio !== "number") return state;
      return touchMeta({ ...state, bubble: { ...state.bubble, ratio } }, now);
    }

    // IA-D CONTRACT PATCH (Bubble contract)
    case ActionTypes.BUBBLE_SET_TEXT_FONT_FAMILY: {
      const fontFamily = str(action.payload);
      return touchMeta(
        { ...state, bubble: { ...state.bubble, text: { ...state.bubble.text, fontFamily } } },
        now
      );
    }

    case ActionTypes.BUBBLE_SET_TEXT_COLOR_V3: {
      const color = str(action.payload);
      return touchMeta(
        { ...state, bubble: { ...state.bubble, text: { ...state.bubble.text, color } } },
        now
      );
    }

    case ActionTypes.BUBBLE_SET_MEDIA: {
      const { type, assetId } = action.payload || {};
      const t = str(type);
      if (type !== undefined && !["video", "image", "logo"].includes(t)) return state;

      const next = {
        ...state.bubble.media,
        type: type !== undefined ? t : state.bubble.media.type,
        assetId: assetId !== undefined ? (assetId === null ? null : str(assetId)) : state.bubble.media.assetId,
      };

      return touchMeta({ ...state, bubble: { ...state.bubble, media: next } }, now);
    }

    // THEME
    case ActionTypes.THEME_SET_PRIMARY_COLOR: {
      const c = str(action.payload);
      return touchMeta({ ...state, theme: { ...state.theme, primaryColor: c } }, now);
    }
    case ActionTypes.THEME_SET_BORDER: {
      const { color, width } = action.payload || {};
      const next = {
        color: color !== undefined ? str(color) : state.theme.border.color,
        width: width !== undefined ? clamp(width, 0, 999) : state.theme.border.width,
      };
      return touchMeta({ ...state, theme: { ...state.theme, border: next } }, now);
    }
    case ActionTypes.THEME_SET_FONT: {
      const { family, size, weight } = action.payload || {};
      const w = weight !== undefined ? str(weight) : state.theme.font.weight;
      if (weight !== undefined && !FONT_WEIGHT.has(w)) return state;
      const next = {
        family: family !== undefined ? str(family) : state.theme.font.family,
        size: size !== undefined ? clamp(size, 8, 72) : state.theme.font.size,
        weight: w,
      };
      return touchMeta({ ...state, theme: { ...state.theme, font: next } }, now);
    }
    case ActionTypes.THEME_SET_PALETTE: {
      const { id, colors } = action.payload || {};
      const next = {
        id: id !== undefined ? str(id) : state.theme.palette.id,
        colors: Array.isArray(colors) ? colors.map(str) : state.theme.palette.colors,
      };
      return touchMeta({ ...state, theme: { ...state.theme, palette: next } }, now);
    }

    // CAPTION
    case ActionTypes.CAPTION_SET_TEXT: {
      const text = str(action.payload);
      return touchMeta({ ...state, caption: { ...state.caption, text } }, now);
    }
    case ActionTypes.CAPTION_SET_MAX_LINES: {
      const maxLines = clamp(action.payload, 1, 6);
      return touchMeta({ ...state, caption: { ...state.caption, maxLines } }, now);
    }
    case ActionTypes.CAPTION_SET_ALIGN: {
      const align = action.payload;
      if (!CAPTION_ALIGN.has(align)) return state;
      return touchMeta({ ...state, caption: { ...state.caption, align } }, now);
    }

    // BRANDING (legacy root)
    case ActionTypes.BRANDING_SET_ENABLED: {
      const enabled = Boolean(action.payload);
      return touchMeta({ ...state, branding: { ...state.branding, enabled } }, now);
    }
    case ActionTypes.BRANDING_SET_LABEL: {
      const label = str(action.payload);
      return touchMeta({ ...state, branding: { ...state.branding, label } }, now);
    }
    case ActionTypes.BRANDING_SET_COLOR: {
      const color = str(action.payload);
      return touchMeta({ ...state, branding: { ...state.branding, color } }, now);
    }

    // LAUNCHER
    case ActionTypes.LAUNCHER_SET_TYPE: {
      const t = action.payload;
      if (!LAUNCHER_TYPE.has(t)) return state;
      return touchMeta({ ...state, launcher: { ...state.launcher, type: t } }, now);
    }
    case ActionTypes.LAUNCHER_SET_SRC: {
      const src = str(action.payload);
      return touchMeta({ ...state, launcher: { ...state.launcher, src } }, now);
    }
    case ActionTypes.LAUNCHER_SET_ALT: {
      const alt = str(action.payload);
      return touchMeta({ ...state, launcher: { ...state.launcher, alt } }, now);
    }
    case ActionTypes.LAUNCHER_SET_PREVIEW_SECONDS: {
      const previewSeconds = clamp(action.payload, 0, 999);
      return touchMeta({ ...state, launcher: { ...state.launcher, previewSeconds } }, now);
    }
    case ActionTypes.LAUNCHER_SET_SIZE: {
      const size = clamp(action.payload, 24, 256);
      return touchMeta({ ...state, launcher: { ...state.launcher, size } }, now);
    }
    case ActionTypes.LAUNCHER_SET_SHAPE: {
      const s = action.payload;
      if (!LAUNCHER_SHAPE.has(s)) return state;
      return touchMeta({ ...state, launcher: { ...state.launcher, shape: s } }, now);
    }

    // PLAYER (legacy)
    case ActionTypes.PLAYER_SET_SRC: {
      const src = str(action.payload);
      return touchMeta({ ...state, player: { ...state.player, src } }, now);
    }
    case ActionTypes.PLAYER_SET_POSTER: {
      const poster = str(action.payload);
      return touchMeta({ ...state, player: { ...state.player, poster } }, now);
    }
    case ActionTypes.PLAYER_SET_AUTOPLAY: {
      const autoplay = Boolean(action.payload);
      return touchMeta({ ...state, player: { ...state.player, autoplay } }, now);
    }
    case ActionTypes.PLAYER_SET_CONTROLS: {
      const controls = Boolean(action.payload);
      return touchMeta({ ...state, player: { ...state.player, controls } }, now);
    }
    case ActionTypes.PLAYER_SET_SOURCE: {
      const { type, value } = action.payload || {};
      const t = str(type);
      if (!PLAYER_SOURCE_TYPE.has(t)) return state;
      const v = str(value);
      return touchMeta({ ...state, player: { ...state.player, source: { type: t, value: v } } }, now);
    }

    // IA-D CONTRACT PATCH (Player contract)
    case ActionTypes.PLAYER_SET_ASSET: {
      const assetId = action.payload === null ? null : str(action.payload);
      return touchMeta({ ...state, player: { ...state.player, assetId } }, now);
    }

    case ActionTypes.PLAYER_SET_STYLE: {
      const patch = action.payload || {};
      const next = normalizePlayerStyle({ ...state.player.style, ...patch });
      return touchMeta({ ...state, player: { ...state.player, style: next } }, now);
    }

    case ActionTypes.PLAYER_SET_BRANDING: {
      const patch = action.payload || {};
      const next = normalizePlayerBranding({ ...state.player.branding, ...patch });
      return touchMeta({ ...state, player: { ...state.player, branding: next } }, now);
    }

    // CTA (legacy)
    case ActionTypes.CTA_SET_MODE: {
      const mode = action.payload;
      if (!CTA_MODE.has(mode)) return state;
      return touchMeta({ ...state, cta: { ...state.cta, mode } }, now);
    }

    case ActionTypes.CTA_ADD: {
      if (state.ctas.length >= 4) return state;
      const { label, href, style } = action.payload || {};
      const s = str(style || "primary");
      if (!CTA_STYLE.has(s)) return state;

      const id = `cta_${state.meta.nextId}`;
      const nextId = state.meta.nextId + 1;

      const ctaItem = { id, label: str(label), href: str(href), style: s };

      return touchMeta({ ...state, meta: { ...state.meta, nextId }, ctas: [...state.ctas, ctaItem] }, now);
    }

    case ActionTypes.CTA_UPDATE: {
      const patch = action.payload || {};
      const id = str(patch.id);
      if (!id) return state;

      const next = state.ctas.map((c) => {
        if (c.id !== id) return c;
        const nextStyle = patch.style !== undefined ? str(patch.style) : c.style;
        if (patch.style !== undefined && !CTA_STYLE.has(nextStyle)) return c;
        return {
          ...c,
          label: patch.label !== undefined ? str(patch.label) : c.label,
          href: patch.href !== undefined ? str(patch.href) : c.href,
          style: nextStyle,
        };
      });

      return touchMeta({ ...state, ctas: next }, now);
    }

    case ActionTypes.CTA_REMOVE: {
      const id = str(action.payload);
      return touchMeta({ ...state, ctas: state.ctas.filter((c) => c.id !== id) }, now);
    }

    case ActionTypes.CTA_OVERLAY_SET: {
      const o = action.payload || {};
      const next = {
        position: o.position !== undefined ? str(o.position) : state.ctaOverlay.position,
        layout: o.layout !== undefined ? str(o.layout) : state.ctaOverlay.layout,
        buttonColor: o.buttonColor !== undefined ? str(o.buttonColor) : state.ctaOverlay.buttonColor,
      };
      return touchMeta({ ...state, ctaOverlay: next }, now);
    }

    case ActionTypes.CTA_TIMING_SET: {
      const t = action.payload || {};
      const showAllAt = t.showAllAt !== undefined ? clamp(t.showAllAt, 0, 10_000) : state.timing.showAllAt;
      const sequence = Array.isArray(t.sequence)
        ? t.sequence
            .filter((x) => x && typeof x.ctaId === "string")
            .map((x) => ({
              ctaId: str(x.ctaId),
              showAt: clamp(x.showAt, 0, 10_000),
              duration: clamp(x.duration, 0, 10_000),
            }))
        : state.timing.sequence;

      return touchMeta({ ...state, timing: { sequence, showAllAt } }, now);
    }

    // TIMELINE hooks
    case ActionTypes.TIMELINE_SET_HOOKS: {
      const hooks = normalizeHooks(action.payload);
      return touchMeta({ ...state, timeline: { ...state.timeline, hooks } }, now);
    }

    case ActionTypes.TIMELINE_ADD_HOOK: {
      const { at, name } = action.payload || {};
      const next = normalizeHooks([...(state.timeline?.hooks || []), { at, name }]);
      return touchMeta({ ...state, timeline: { ...state.timeline, hooks: next } }, now);
    }

    case ActionTypes.TIMELINE_REMOVE_HOOK: {
      const name = str(action.payload);
      const next = (state.timeline?.hooks || []).filter((h) => h.name !== name);
      return touchMeta({ ...state, timeline: { ...state.timeline, hooks: next } }, now);
    }

    // IA-D CONTRACT PATCH (Timeline CTA contract)
    case ActionTypes.TIMELINE_SET_CTAS: {
      const ctas = normalizeCtas(action.payload);
      return touchMeta({ ...state, timeline: { ...state.timeline, ctas } }, now);
    }

    case ActionTypes.TIMELINE_ADD_CTA: {
      const cta = normalizeCta(action.payload);
      if (!cta) return state;
      const next = normalizeCtas([...(state.timeline?.ctas || []), cta]);
      return touchMeta({ ...state, timeline: { ...state.timeline, ctas: next } }, now);
    }

    case ActionTypes.TIMELINE_REMOVE_CTA: {
      const id = str(action.payload).trim();
      if (!id) return state;
      const next = (state.timeline?.ctas || []).filter((c) => c.id !== id);
      return touchMeta({ ...state, timeline: { ...state.timeline, ctas: next } }, now);
    }

    case ActionTypes.TIMELINE_UPDATE_CTA: {
      const { id, patch } = action.payload || {};
      const ctaId = str(id).trim();
      if (!ctaId) return state;

      const list = Array.isArray(state.timeline?.ctas) ? state.timeline.ctas : [];
      const next = list.map((c) => {
        if (c.id !== ctaId) return c;
        const merged = { ...c, ...(patch && typeof patch === "object" ? patch : {}) };
        const normalized = normalizeCta(merged);
        return normalized || c;
      });

      return touchMeta({ ...state, timeline: { ...state.timeline, ctas: normalizeCtas(next) } }, now);
    }

    default:
      return state;
  }
}
