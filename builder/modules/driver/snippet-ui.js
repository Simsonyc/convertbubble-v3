// /builder/modules/driver/snippet-ui.js
// ConvertBubble Builder V3 — Prestige Dark Skin
// Contrat : initSnippetUI({ core, exportConfigV3, rootEl }) → void

export function initSnippetUI({ core, exportConfigV3, rootEl }) {
  if (!rootEl || !(rootEl instanceof HTMLElement)) {
    throw new Error("[SnippetUI] rootEl required (HTMLElement).");
  }

  // ---- Local style ----
  const style = document.createElement("style");
  style.id = "cb-snippet-ui-style";
  style.textContent = `
    .cb-snippet-ui {
      width: 100%;
      color: var(--cb-text, #ede8df);
      font-family: inherit;
    }

    /* Surface */
    .cb-snippet-ui .cbp-surface {
      background: var(--cb-panel, #201e1b);
      border: 1px solid var(--cb-border2, rgba(255,235,190,0.10));
      border-radius: 14px;
      overflow: hidden;
    }
    .cb-snippet-ui .cb-ui__header {
      display: flex; align-items: center; justify-content: space-between;
      gap: 10px; padding: 11px 14px;
      background: var(--cb-rail, #1a1917);
      border-bottom: 0.5px solid var(--cb-border, rgba(255,235,190,0.06));
    }
    .cb-snippet-ui .cb-ui__title {
      margin: 0; font-size: 13px; font-weight: 800;
      color: var(--cb-text, #ede8df);
      display: flex; align-items: center; gap: 8px;
    }
    .cb-snippet-ui .cb-ui__title-dot {
      width: 7px; height: 7px; border-radius: 999px;
      background: var(--cb-green, #22d3a0);
      box-shadow: 0 0 7px var(--cb-green, #22d3a0);
      flex-shrink: 0;
    }
    .cb-snippet-ui .cb-ui__body {
      padding: 14px; display: grid; gap: 14px;
    }

    /* Status */
    .cb-snippet-ui .cb-status-row {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 12px;
      background: var(--cb-inset, #0c0b09);
      border: 1px solid var(--cb-border, rgba(255,235,190,0.06));
      border-radius: 10px;
    }
    .cb-snippet-ui .cb-status-dot {
      width: 6px; height: 6px; border-radius: 999px;
      background: var(--cb-green, #22d3a0);
      box-shadow: 0 0 6px var(--cb-green, #22d3a0);
      flex-shrink: 0;
      animation: cb-pulse 2s ease-in-out infinite;
    }
    .cb-snippet-ui .cb-status-text {
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 11px; font-weight: 600;
      color: var(--cb-green, #22d3a0);
      text-shadow: 0 0 6px rgba(34,211,160,0.3);
      letter-spacing: .04em;
      text-transform: uppercase;
    }

    @keyframes cb-pulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.5; }
    }

    /* Code block */
    .cb-snippet-ui .cb-code-block {
      background: var(--cb-inset, #0c0b09);
      border: 1px solid var(--cb-border2, rgba(255,235,190,0.10));
      border-radius: 10px;
      padding: 12px 14px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 11px;
      line-height: 1.7;
      color: var(--cb-green, #22d3a0);
      word-break: break-all;
      white-space: pre-wrap;
      text-shadow: 0 0 5px rgba(34,211,160,0.18);
      max-height: 220px;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: var(--cb-muted2, #3e3b35) transparent;
      cursor: text;
      user-select: all;
    }
    .cb-snippet-ui .cb-code-block::-webkit-scrollbar { width: 3px; }
    .cb-snippet-ui .cb-code-block::-webkit-scrollbar-thumb {
      background: var(--cb-muted2, #3e3b35); border-radius: 999px;
    }

    /* Error block */
    .cb-snippet-ui .cb-error-block {
      background: rgba(255,80,80,0.06);
      border: 1px solid rgba(255,80,80,0.20);
      border-radius: 10px;
      padding: 12px 14px;
      font-size: 12px;
      color: #ff8080;
      font-style: italic;
    }

    /* Actions row */
    .cb-snippet-ui .cb-actions-row {
      display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
    }

    /* Buttons */
    .cb-snippet-ui .cb-btn {
      display: inline-flex; align-items: center; justify-content: center;
      gap: 6px; padding: 9px 20px;
      border-radius: 10px;
      border: 1px solid rgba(200,151,58,0.35);
      background: linear-gradient(160deg, rgba(200,151,58,0.18), rgba(200,151,58,0.08));
      color: var(--cb-amber2, #e8b45a);
      font-size: 13px; font-weight: 700; font-family: inherit;
      cursor: pointer;
      transition: all .15s;
      box-shadow: 0 0 14px rgba(200,151,58,0.12);
    }
    .cb-snippet-ui .cb-btn:hover {
      border-color: rgba(200,151,58,0.55);
      box-shadow: 0 0 20px rgba(200,151,58,0.25);
      color: #fff;
    }
    .cb-snippet-ui .cb-btn:active { transform: scale(0.97); }
    .cb-snippet-ui .cb-btn--ghost {
      background: transparent;
      border-color: var(--cb-border2, rgba(255,235,190,0.10));
      color: var(--cb-muted, #6e6a62);
      box-shadow: none;
    }
    .cb-snippet-ui .cb-btn--ghost:hover {
      border-color: var(--cb-border3, rgba(255,235,190,0.18));
      color: var(--cb-text, #ede8df);
      box-shadow: none;
    }

    /* Copy flash */
    .cb-snippet-ui .cb-copy-flash {
      font-size: 12px; font-weight: 700;
      font-family: ui-monospace, Consolas, monospace;
      color: var(--cb-green, #22d3a0);
      text-shadow: 0 0 6px rgba(34,211,160,0.35);
      opacity: 0;
      transition: opacity .2s;
      letter-spacing: .03em;
    }
    .cb-snippet-ui .cb-copy-flash.is-visible { opacity: 1; }

    /* Section divider */
    .cb-snippet-ui .cb-section {
      border-top: 0.5px solid var(--cb-border, rgba(255,235,190,0.06));
      padding-top: 14px;
    }
    .cb-snippet-ui .cb-section__title {
      font-size: 10px; font-weight: 700;
      letter-spacing: .08em; text-transform: uppercase;
      color: var(--cb-muted, #6e6a62);
      margin: 0 0 10px;
    }

    /* Data-config preview (attr only, smaller) */
    .cb-snippet-ui .cb-attr-preview {
      background: var(--cb-inset, #0c0b09);
      border: 1px solid var(--cb-border, rgba(255,235,190,0.06));
      border-radius: 10px;
      padding: 10px 12px;
      font-family: ui-monospace, Consolas, monospace;
      font-size: 10px;
      line-height: 1.6;
      color: var(--cb-muted, #6e6a62);
      word-break: break-all;
      white-space: pre-wrap;
      max-height: 120px;
      overflow-y: auto;
    }

    /* Label */
    .cb-snippet-ui .cb-label {
      font-size: 11px; font-weight: 700;
      letter-spacing: .02em;
      color: var(--cb-muted, #6e6a62);
      margin-bottom: 6px;
    }
  `;

  rootEl.innerHTML = "";
  rootEl.appendChild(style);

  // ---- DOM ----
  const root = document.createElement("div");
  root.className = "cb-snippet-ui";
  root.innerHTML = `
    <div class="cbp-surface">
      <div class="cb-ui__header">
        <h3 class="cb-ui__title">
          <span class="cb-ui__title-dot"></span>
          Export &amp; Snippet
        </h3>
      </div>

      <div class="cb-ui__body">

        <!-- Status -->
        <div class="cb-status-row">
          <div class="cb-status-dot"></div>
          <div class="cb-status-text">Config prête · cb.js runtime</div>
        </div>

        <!-- Snippet -->
        <div>
          <div class="cb-label">Snippet à coller sur votre site</div>
          <div id="sn-code" class="cb-code-block"></div>
        </div>

        <!-- Actions -->
        <div class="cb-actions-row">
          <button id="sn-copy" type="button" class="cb-btn">⎘ Copier le snippet</button>
          <button id="sn-refresh" type="button" class="cb-btn cb-btn--ghost">↻ Regénérer</button>
          <span id="sn-flash" class="cb-copy-flash">✓ Copié !</span>
        </div>

        <!-- Config JSON (detail) -->
        <div class="cb-section">
          <div class="cb-section__title">Config JSON (data-config)</div>
          <div id="sn-attr" class="cb-attr-preview"></div>
        </div>

      </div>
    </div>
  `;

  rootEl.appendChild(root);

  // ---- Refs ----
  const codeEl   = root.querySelector("#sn-code");
  const attrEl   = root.querySelector("#sn-attr");
  const copyBtn  = root.querySelector("#sn-copy");
  const refreshBtn = root.querySelector("#sn-refresh");
  const flash    = root.querySelector("#sn-flash");

  let flashTimer = null;

  // ---- Generate snippet ----
  function generateSnippet() {
    try {
      // Prefer exportConfigV3 passed in, fallback to core.exportConfigV3
      const exportFn = typeof exportConfigV3 === "function"
        ? exportConfigV3
        : (typeof core?.exportConfigV3 === "function" ? core.exportConfigV3.bind(core) : null);

      if (!exportFn) {
        return { snippet: null, config: null, error: "exportConfigV3 non disponible." };
      }

      const config = exportFn();
      const encoded = JSON.stringify(config);
      const snippet = `<script src="cb.js" data-config='${encoded}'><\/script>`;
      return { snippet, config, error: null };
    } catch (err) {
      return { snippet: null, config: null, error: String(err?.message || err) };
    }
  }

  // ---- Render snippet ----
  function renderSnippet() {
    try {
      const { snippet, config, error } = generateSnippet();

      if (error || !snippet) {
        if (codeEl) {
          codeEl.className = "cb-error-block";
          codeEl.textContent = `Erreur : ${error || "snippet vide"}`;
        }
        if (attrEl) attrEl.textContent = "";
        return;
      }

      if (codeEl) {
        codeEl.className = "cb-code-block";
        codeEl.textContent = snippet;
      }

      // JSON attr preview (pretty, truncated for readability)
      if (attrEl) {
        try {
          attrEl.textContent = JSON.stringify(config, null, 2);
        } catch (_) {
          attrEl.textContent = "";
        }
      }
    } catch (_) {}
  }

  // ---- Copy ----
  function copySnippet() {
    try {
      const text = codeEl?.textContent || "";
      if (!text) return;

      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        navigator.clipboard.writeText(text).then(showFlash).catch(fallbackCopy.bind(null, text));
      } else {
        fallbackCopy(text);
      }
    } catch (_) {}
  }

  function fallbackCopy(text) {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0;";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      showFlash();
    } catch (_) {}
  }

  function showFlash() {
    try {
      if (!flash) return;
      flash.classList.add("is-visible");
      clearTimeout(flashTimer);
      flashTimer = setTimeout(() => {
        flash.classList.remove("is-visible");
      }, 2000);
    } catch (_) {}
  }

  // ---- Wire ----
  if (copyBtn)    copyBtn.addEventListener("click", copySnippet);
  if (refreshBtn) refreshBtn.addEventListener("click", renderSnippet);

  // ---- Initial render ----
  renderSnippet();
}
