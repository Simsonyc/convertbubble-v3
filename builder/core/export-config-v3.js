/**
 * ConvertBubble V3 — exportConfigV3
 *
 * IA-D CONTRACT PATCH (Assets/CTA/Branding)
 * - SAFE default: never throws, returns exportable runtime config
 * - strict mode option: exportConfigV3(state, { strict:true }) throws on invalid/incomplete config
 * - warnings option: exportConfigV3(state, { withWarnings:true }) returns { config, warnings }
 *
 * - Never export blobUrl / builderSrc / file objects
 */

const POS = new Set(["TL", "TR", "BL", "BR"]);

function safeObj(v, fallback) {
  return v && typeof v === "object" ? v : fallback;
}

function str(v) {
  return typeof v === "string" ? v : String(v ?? "");
}

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function sanitizeHooks(hooks) {
  const list = Array.isArray(hooks) ? hooks : [];
  return list
    .filter((h) => h && typeof h.at === "number" && typeof h.name === "string" && h.name.trim() !== "")
    .map((h) => ({ at: h.at, name: h.name }));
}

function sanitizeCtas(ctas) {
  const list = Array.isArray(ctas) ? ctas : [];
  return list
    .filter((c) => c && typeof c.id === "string")
    .map((c) => ({
      id: str(c.id),
      at: typeof c.at === "number" ? c.at : 0,
      duration: typeof c.duration === "number" ? c.duration : 0,
      type: str(c.type || "url"),
      label: str(c.label || ""),
      payload: safeObj(c.payload, {}),
      style: safeObj(c.style, {}),
    }));
}

function sanitizeAssets(assets) {
  const a = safeObj(assets, {});
  const byId = safeObj(a.byId, {});
  const outById = {};
  for (const id of Object.keys(byId)) {
    const item = byId[id];
    if (!item || typeof item !== "object") continue;

    // IMPORTANT: never export blobUrl
    const cleaned = {
      id: str(item.id || id),
      kind: str(item.kind || "image"),
      name: str(item.name || ""),
      mime: str(item.mime || ""),
    };

    if (item.size !== undefined) cleaned.size = typeof item.size === "number" ? item.size : Number(item.size) || 0;
    if (item.src !== undefined) cleaned.src = str(item.src);

    outById[id] = cleaned;
  }
  const allIds = Array.isArray(a.allIds) ? a.allIds.map(str) : Object.keys(outById);
  return { byId: outById, allIds };
}

function buildWarnings(state) {
  const s = safeObj(state, {});
  const w = [];

  const bubble = safeObj(s.bubble, {});
  const bubbleMedia = safeObj(bubble.media, {});
  if (bubbleMedia.assetId && !s.assets?.byId?.[bubbleMedia.assetId]) {
    w.push(`bubble.media.assetId "${bubbleMedia.assetId}" not found in assets.byId`);
  }

  const player = safeObj(s.player, {});
  if (!isNonEmptyString(player.src) && !player.assetId) {
    w.push(`player is missing both src and assetId (runtime may not play)`);
  }
  if (player.assetId && !s.assets?.byId?.[player.assetId]) {
    w.push(`player.assetId "${player.assetId}" not found in assets.byId`);
  }

  const timeline = safeObj(s.timeline, {});
  const ctas = Array.isArray(timeline.ctas) ? timeline.ctas : [];
  for (const c of ctas) {
    if (!c || typeof c !== "object") continue;
    if (!isNonEmptyString(c.id)) w.push(`timeline.ctas contains CTA without id`);
    if (typeof c.at !== "number") w.push(`timeline.ctas[${c.id || "?"}] missing numeric at`);
  }

  return w;
}

/**
 * exportConfigV3(state, opts?)
 *
 * opts:
 * - strict: boolean
 * - withWarnings: boolean
 *
 * returns:
 * - if withWarnings: { config, warnings }
 * - else: config
 */
export function exportConfigV3(state, opts = {}) {
  const strict = Boolean(opts.strict);
  const withWarnings = Boolean(opts.withWarnings);

  const warnings = buildWarnings(state);
  if (strict && warnings.length) {
    const err = new Error(`exportConfigV3(strict) refused export:\n- ${warnings.join("\n- ")}`);
    err.name = "ExportConfigV3StrictError";
    throw err;
  }

  const s = safeObj(state, {});
  const bubble = safeObj(s.bubble, {});
  const bubbleText = safeObj(bubble.text, {});
  const bubbleMedia = safeObj(bubble.media, {});

  const player = safeObj(s.player, {});
  const playerStyle = safeObj(player.style, {});
  const playerBranding = safeObj(player.branding, {});

  const timeline = safeObj(s.timeline, {});

  const position = POS.has(bubble.position) ? bubble.position : "BR";

  const config = {
    bubble: {
      ratio: typeof bubble.ratio === "number" ? bubble.ratio : 0.6,
      position,
      text: {
        value: bubbleText.value !== undefined ? str(bubbleText.value) : "",
        fontFamily: bubbleText.fontFamily !== undefined ? str(bubbleText.fontFamily) : "system-ui",
        color: bubbleText.color !== undefined ? str(bubbleText.color) : "#ffffff",
      },
      media: {
        type: bubbleMedia.type !== undefined ? str(bubbleMedia.type) : "video",
        assetId: bubbleMedia.assetId !== undefined ? (bubbleMedia.assetId === null ? null : str(bubbleMedia.assetId)) : null,
      },
    },

    player: {
      src: player.src !== undefined ? str(player.src) : "",
      assetId: player.assetId !== undefined ? (player.assetId === null ? null : str(player.assetId)) : null,
      style: {
        borderWidth: typeof playerStyle.borderWidth === "number" ? playerStyle.borderWidth : 0,
        borderColor: typeof playerStyle.borderColor === "string" ? playerStyle.borderColor : "#000000",
        radius: typeof playerStyle.radius === "number" ? playerStyle.radius : 18,
        shadow: playerStyle.shadow === 0 || playerStyle.shadow === 1 || playerStyle.shadow === 2 ? playerStyle.shadow : 1,
      },
      branding: {
        mode: playerBranding.mode === "premium" ? "premium" : "free",
        enabled: playerBranding.enabled !== undefined ? Boolean(playerBranding.enabled) : true,
        label: playerBranding.label !== undefined ? str(playerBranding.label) : "ConvertBubble",
        url: playerBranding.url !== undefined ? str(playerBranding.url) : "",
      },
    },

    timeline: {
      hooks: sanitizeHooks(timeline.hooks),
      ctas: sanitizeCtas(timeline.ctas),
    },
  };

  // Optional sanitized assets export (NEVER blobUrl)
  if (s.assets) {
    config.assets = sanitizeAssets(s.assets);
  }

  // Keep legacy runtime keys if present (compat)
  if (s.launcher) {
    const launcher = safeObj(s.launcher, {});
    config.launcher = {
      type: launcher.type !== undefined ? str(launcher.type) : "video",
      src: launcher.src !== undefined ? str(launcher.src) : "",
      size: typeof launcher.size === "number" ? launcher.size : 64,
      shape: launcher.shape !== undefined ? str(launcher.shape) : "circle",
    };
  }

  config.position = { corner: position, margin: 16 };

  if (player.autoplay !== undefined || player.controls !== undefined) {
    config.player.autoplay = player.autoplay !== undefined ? Boolean(player.autoplay) : true;
    config.player.controls = player.controls !== undefined ? Boolean(player.controls) : true;
  }

  if (withWarnings) {
    return { config, warnings };
  }
  return config;
}

