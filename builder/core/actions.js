/**
 * Actions (Core) — ConvertBubble V3
 * Pure data actions. No UI, no DOM, no runtime behavior.
 *
 * // IA-D CONTRACT PATCH:
 * - Add missing ActionTypes referenced by reducers.js
 * - Add contract actions for assets + CTA model + player branding/style + bubble media(assetId)
 */

export const ActionTypes = {
  // Meta
  META_TOUCH: "META_TOUCH",
  META_SET_GENERATOR: "META_SET_GENERATOR", // IA-D CONTRACT PATCH

  // Bubble
  BUBBLE_SET_POSITION: "BUBBLE_SET_POSITION",
  BUBBLE_SET_SHAPE: "BUBBLE_SET_SHAPE",
  BUBBLE_SET_ANIMATION: "BUBBLE_SET_ANIMATION",

  // Bubble (state-only enrichments; NEVER exported in ConfigV3)
  BUBBLE_SET_PRESET: "BUBBLE_SET_PRESET",
  BUBBLE_SET_BORDER_COLOR: "BUBBLE_SET_BORDER_COLOR",
  BUBBLE_SET_BORDER_WIDTH: "BUBBLE_SET_BORDER_WIDTH",
  BUBBLE_SET_TEXT_BG_COLOR: "BUBBLE_SET_TEXT_BG_COLOR",
  BUBBLE_SET_TEXT_COLOR: "BUBBLE_SET_TEXT_COLOR",
  BUBBLE_SET_FONT_SIZE: "BUBBLE_SET_FONT_SIZE",
  BUBBLE_SET_LAYOUT: "BUBBLE_SET_LAYOUT",
  BUBBLE_SET_MEDIA_TYPE: "BUBBLE_SET_MEDIA_TYPE",
  BUBBLE_SET_MEDIA_SRC: "BUBBLE_SET_MEDIA_SRC",
  BUBBLE_SET_RATIO: "BUBBLE_SET_RATIO",

  // Theme
  THEME_SET_PRIMARY_COLOR: "THEME_SET_PRIMARY_COLOR",
  THEME_SET_BORDER_COLOR: "THEME_SET_BORDER_COLOR",
  THEME_SET_BORDER_WIDTH: "THEME_SET_BORDER_WIDTH",
  THEME_SET_FONT_FAMILY: "THEME_SET_FONT_FAMILY",
  THEME_SET_FONT_SIZE: "THEME_SET_FONT_SIZE",
  THEME_SET_FONT_WEIGHT: "THEME_SET_FONT_WEIGHT",
  THEME_SET_PALETTE: "THEME_SET_PALETTE",

  // IA-D CONTRACT PATCH (reducers.js expects these composite actions)
  THEME_SET_BORDER: "THEME_SET_BORDER",
  THEME_SET_FONT: "THEME_SET_FONT",

  // Caption
  CAPTION_SET_TEXT: "CAPTION_SET_TEXT",
  CAPTION_SET_MAX_LINES: "CAPTION_SET_MAX_LINES",
  CAPTION_SET_ALIGN: "CAPTION_SET_ALIGN",

  // Branding (legacy root)
  BRANDING_SET_ENABLED: "BRANDING_SET_ENABLED",
  BRANDING_SET_LABEL: "BRANDING_SET_LABEL",
  BRANDING_SET_COLOR: "BRANDING_SET_COLOR",

  // Launcher
  LAUNCHER_SET_TYPE: "LAUNCHER_SET_TYPE",
  LAUNCHER_SET_SRC: "LAUNCHER_SET_SRC",
  LAUNCHER_SET_ALT: "LAUNCHER_SET_ALT",
  LAUNCHER_SET_PREVIEW_SECONDS: "LAUNCHER_SET_PREVIEW_SECONDS",
  LAUNCHER_SET_SIZE: "LAUNCHER_SET_SIZE",
  LAUNCHER_SET_SHAPE: "LAUNCHER_SET_SHAPE",

  // Player (legacy)
  PLAYER_SET_SRC: "PLAYER_SET_SRC",
  PLAYER_SET_POSTER: "PLAYER_SET_POSTER",
  PLAYER_SET_AUTOPLAY: "PLAYER_SET_AUTOPLAY",
  PLAYER_SET_CONTROLS: "PLAYER_SET_CONTROLS",
  PLAYER_SET_SOURCE: "PLAYER_SET_SOURCE",

  // CTA (legacy reducers.js expects these)
  CTA_SET_MODE: "CTA_SET_MODE",
  CTA_ADD: "CTA_ADD",
  CTA_UPDATE: "CTA_UPDATE",
  CTA_REMOVE: "CTA_REMOVE",
  CTA_OVERLAY_SET: "CTA_OVERLAY_SET",
  CTA_TIMING_SET: "CTA_TIMING_SET",

  // Timeline hooks (reducers.js expects these)
  TIMELINE_SET_HOOKS: "TIMELINE_SET_HOOKS",
  TIMELINE_ADD_HOOK: "TIMELINE_ADD_HOOK",
  TIMELINE_REMOVE_HOOK: "TIMELINE_REMOVE_HOOK",

  // Timeline (legacy / strict export helper)
  TIMELINE_SET: "TIMELINE_SET",

  // IA-D CONTRACT PATCH (Assets)
  ASSET_ADD: "ASSET_ADD",
  ASSET_REMOVE: "ASSET_REMOVE",
  ASSET_SET_BLOB_URL: "ASSET_SET_BLOB_URL",
  ASSET_SET_META: "ASSET_SET_META",

  // IA-D CONTRACT PATCH (Bubble V3 contract)
  BUBBLE_SET_TEXT_FONT_FAMILY: "BUBBLE_SET_TEXT_FONT_FAMILY",
  BUBBLE_SET_TEXT_COLOR_V3: "BUBBLE_SET_TEXT_COLOR_V3",
  BUBBLE_SET_MEDIA: "BUBBLE_SET_MEDIA",

  // IA-D CONTRACT PATCH (Player V3 contract)
  PLAYER_SET_ASSET: "PLAYER_SET_ASSET",
  PLAYER_SET_STYLE: "PLAYER_SET_STYLE",
  PLAYER_SET_BRANDING: "PLAYER_SET_BRANDING",

  // IA-D CONTRACT PATCH (Timeline CTA contract)
  TIMELINE_ADD_CTA: "TIMELINE_ADD_CTA",
  TIMELINE_REMOVE_CTA: "TIMELINE_REMOVE_CTA",
  TIMELINE_UPDATE_CTA: "TIMELINE_UPDATE_CTA",
  TIMELINE_SET_CTAS: "TIMELINE_SET_CTAS",
};

export const Actions = {
  // Meta
  metaTouch: () => ({ type: ActionTypes.META_TOUCH }),
  metaSetGenerator: (generator) => ({ type: ActionTypes.META_SET_GENERATOR, payload: generator }), // IA-D CONTRACT PATCH

  // Bubble
  bubbleSetPosition: (position) => ({ type: ActionTypes.BUBBLE_SET_POSITION, payload: position }),
  bubbleSetShape: (shape) => ({ type: ActionTypes.BUBBLE_SET_SHAPE, payload: shape }),
  bubbleSetAnimation: (animation) => ({ type: ActionTypes.BUBBLE_SET_ANIMATION, payload: animation }),

  // Bubble (state-only enrichments; NEVER exported in ConfigV3)
  bubbleSetPreset: (presetId) => ({ type: ActionTypes.BUBBLE_SET_PRESET, payload: presetId }),
  bubbleSetBorderColor: (color) => ({ type: ActionTypes.BUBBLE_SET_BORDER_COLOR, payload: color }),
  bubbleSetBorderWidth: (width) => ({ type: ActionTypes.BUBBLE_SET_BORDER_WIDTH, payload: width }),
  bubbleSetTextBackgroundColor: (color) => ({ type: ActionTypes.BUBBLE_SET_TEXT_BG_COLOR, payload: color }),
  bubbleSetTextColor: (color) => ({ type: ActionTypes.BUBBLE_SET_TEXT_COLOR, payload: color }),
  bubbleSetFontSize: (px) => ({ type: ActionTypes.BUBBLE_SET_FONT_SIZE, payload: px }),
  bubbleSetLayout: (layout) => ({ type: ActionTypes.BUBBLE_SET_LAYOUT, payload: layout }),
  bubbleSetMediaType: (mediaType) => ({ type: ActionTypes.BUBBLE_SET_MEDIA_TYPE, payload: mediaType }),
  bubbleSetMediaSrc: (src) => ({ type: ActionTypes.BUBBLE_SET_MEDIA_SRC, payload: src }),
  bubbleSetRatio: (ratio) => ({ type: ActionTypes.BUBBLE_SET_RATIO, payload: ratio }),

  // Theme granular (kept)
  themeSetPrimaryColor: (color) => ({ type: ActionTypes.THEME_SET_PRIMARY_COLOR, payload: color }),
  themeSetBorderColor: (color) => ({ type: ActionTypes.THEME_SET_BORDER_COLOR, payload: color }),
  themeSetBorderWidth: (width) => ({ type: ActionTypes.THEME_SET_BORDER_WIDTH, payload: width }),
  themeSetFontFamily: (family) => ({ type: ActionTypes.THEME_SET_FONT_FAMILY, payload: family }),
  themeSetFontSize: (size) => ({ type: ActionTypes.THEME_SET_FONT_SIZE, payload: size }),
  themeSetFontWeight: (weight) => ({ type: ActionTypes.THEME_SET_FONT_WEIGHT, payload: weight }),
  themeSetPalette: (palette) => ({ type: ActionTypes.THEME_SET_PALETTE, payload: palette }),

  // Theme composite (reducers.js-compatible)
  themeSetBorder: ({ color, width } = {}) => ({ type: ActionTypes.THEME_SET_BORDER, payload: { color, width } }), // IA-D CONTRACT PATCH
  themeSetFont: ({ family, size, weight } = {}) => ({ type: ActionTypes.THEME_SET_FONT, payload: { family, size, weight } }), // IA-D CONTRACT PATCH

  // Caption
  captionSetText: (text) => ({ type: ActionTypes.CAPTION_SET_TEXT, payload: text }),
  captionSetMaxLines: (maxLines) => ({ type: ActionTypes.CAPTION_SET_MAX_LINES, payload: maxLines }),
  captionSetAlign: (align) => ({ type: ActionTypes.CAPTION_SET_ALIGN, payload: align }),

  // Branding (legacy root)
  brandingSetEnabled: (enabled) => ({ type: ActionTypes.BRANDING_SET_ENABLED, payload: enabled }),
  brandingSetLabel: (label) => ({ type: ActionTypes.BRANDING_SET_LABEL, payload: label }),
  brandingSetColor: (color) => ({ type: ActionTypes.BRANDING_SET_COLOR, payload: color }),

  // Launcher
  launcherSetType: (type) => ({ type: ActionTypes.LAUNCHER_SET_TYPE, payload: type }),
  launcherSetSrc: (src) => ({ type: ActionTypes.LAUNCHER_SET_SRC, payload: src }),
  launcherSetAlt: (alt) => ({ type: ActionTypes.LAUNCHER_SET_ALT, payload: alt }),
  launcherSetPreviewSeconds: (seconds) => ({ type: ActionTypes.LAUNCHER_SET_PREVIEW_SECONDS, payload: seconds }),
  launcherSetSize: (size) => ({ type: ActionTypes.LAUNCHER_SET_SIZE, payload: size }),
  launcherSetShape: (shape) => ({ type: ActionTypes.LAUNCHER_SET_SHAPE, payload: shape }),

  // Player (legacy)
  playerSetSrc: (src) => ({ type: ActionTypes.PLAYER_SET_SRC, payload: src }),
  playerSetPoster: (poster) => ({ type: ActionTypes.PLAYER_SET_POSTER, payload: poster }),
  playerSetAutoplay: (autoplay) => ({ type: ActionTypes.PLAYER_SET_AUTOPLAY, payload: autoplay }),
  playerSetControls: (controls) => ({ type: ActionTypes.PLAYER_SET_CONTROLS, payload: controls }),
  playerSetSource: (source) => ({ type: ActionTypes.PLAYER_SET_SOURCE, payload: source }),

  // CTA (legacy reducers.js-compatible)
  ctaSetMode: (mode) => ({ type: ActionTypes.CTA_SET_MODE, payload: mode }), // IA-D CONTRACT PATCH
  ctaAdd: ({ label, href, style } = {}) => ({ type: ActionTypes.CTA_ADD, payload: { label, href, style } }), // IA-D CONTRACT PATCH
  ctaUpdate: (patch) => ({ type: ActionTypes.CTA_UPDATE, payload: patch }), // IA-D CONTRACT PATCH
  ctaRemove: (id) => ({ type: ActionTypes.CTA_REMOVE, payload: id }), // IA-D CONTRACT PATCH
  ctaOverlaySet: (overlay) => ({ type: ActionTypes.CTA_OVERLAY_SET, payload: overlay }), // IA-D CONTRACT PATCH
  ctaTimingSet: (timing) => ({ type: ActionTypes.CTA_TIMING_SET, payload: timing }), // IA-D CONTRACT PATCH

  // Timeline hooks (contract)
  timelineSetHooks: (hooks) => ({ type: ActionTypes.TIMELINE_SET_HOOKS, payload: hooks }), // IA-D CONTRACT PATCH
  timelineAddHook: ({ at, name } = {}) => ({ type: ActionTypes.TIMELINE_ADD_HOOK, payload: { at, name } }), // IA-D CONTRACT PATCH
  timelineRemoveHook: (name) => ({ type: ActionTypes.TIMELINE_REMOVE_HOOK, payload: name }), // IA-D CONTRACT PATCH

  // Timeline legacy (keep)
  timelineSet: (timeline) => ({ type: ActionTypes.TIMELINE_SET, payload: timeline }),

  // IA-D CONTRACT PATCH (Assets)
  assetAdd: (asset) => ({ type: ActionTypes.ASSET_ADD, payload: asset }),
  assetRemove: (assetId) => ({ type: ActionTypes.ASSET_REMOVE, payload: assetId }),
  assetSetBlobUrl: (assetId, blobUrl) => ({ type: ActionTypes.ASSET_SET_BLOB_URL, payload: { assetId, blobUrl } }),
  assetSetMeta: (assetId, meta) => ({ type: ActionTypes.ASSET_SET_META, payload: { assetId, meta } }),

  // IA-D CONTRACT PATCH (Bubble V3 contract)
  bubbleSetTextFontFamily: (fontFamily) => ({ type: ActionTypes.BUBBLE_SET_TEXT_FONT_FAMILY, payload: fontFamily }),
  bubbleSetTextColorV3: (color) => ({ type: ActionTypes.BUBBLE_SET_TEXT_COLOR_V3, payload: color }),
  bubbleSetMedia: ({ type, assetId } = {}) => ({ type: ActionTypes.BUBBLE_SET_MEDIA, payload: { type, assetId } }),

  // IA-D CONTRACT PATCH (Player V3 contract)
  playerSetAsset: (assetId) => ({ type: ActionTypes.PLAYER_SET_ASSET, payload: assetId }),
  playerSetStyle: (partialStyle) => ({ type: ActionTypes.PLAYER_SET_STYLE, payload: partialStyle }),
  playerSetBranding: (partialBranding) => ({ type: ActionTypes.PLAYER_SET_BRANDING, payload: partialBranding }),

  // IA-D CONTRACT PATCH (Timeline CTA contract)
  timelineAddCta: (cta) => ({ type: ActionTypes.TIMELINE_ADD_CTA, payload: cta }),
  timelineRemoveCta: (id) => ({ type: ActionTypes.TIMELINE_REMOVE_CTA, payload: id }),
  timelineUpdateCta: (id, patch) => ({ type: ActionTypes.TIMELINE_UPDATE_CTA, payload: { id, patch } }),
  timelineSetCtas: (ctas) => ({ type: ActionTypes.TIMELINE_SET_CTAS, payload: ctas }),
};

