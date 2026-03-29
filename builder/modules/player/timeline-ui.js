// /builder/modules/player/timeline-ui.js
// ConvertBubble Builder V3 — Prestige Dark Skin
// Contrat : initTimelineUI({ core, selectors, render, rootEl }) → { sync, destroy }
import { Actions } from "../../core/actions.js";
import { selectTimeline, selectTimelineHooks, selectTimelineCtas } from "../../core/selectors.js";

// ---------- helpers ----------
function safeClear(el) {
  try { el.innerHTML = ""; } catch (_) {}
}

function safeAppend(parent, child) {
  try { parent.appendChild(child); return true; } catch (_) { return false; }
}

export function initTimelineUI({ core, selectors, render, rootEl }) {
  if (!rootEl || !(rootEl instanceof HTMLElement)) {
    throw new Error("[TimelineUI] rootEl required (HTMLElement).");
  }

  safeClear(rootEl);

  // ---- Local style ----
  const style = document.createElement("style");
  style.id = "cb-timeline-ui-style";
  style.textContent = `
    .cb-timeline-ui {
      width: 100%;
      color: var(--cb-text, #ede8df);
      font-family: inherit;
    }

    /* Scope bar */
    .cb-timeline-ui .cb-scope-bar {
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
    .cb-timeline-ui .cb-scope-bar::-webkit-scrollbar { display: none; }
    .cb-timeline-ui .cb-scope-key {
      color: var(--cb-muted, #6e6a62);
      font-size: 10px; text-transform: uppercase;
      letter-spacing: .07em; margin-right: 3px;
    }
    .cb-timeline-ui .cb-scope-val {
      color: var(--cb-green, #22d3a0);
      text-shadow: 0 0 7px rgba(34,211,160,0.4);
      font-size: 12px;
    }
    .cb-timeline-ui .cb-scope-item {
      display: flex; align-items: center; gap: 4px; flex-shrink: 0;
    }

    /* Surface */
    .cb-timeline-ui .cbp-surface {
      background: var(--cb-panel, #201e1b);
      border: 1px solid var(--cb-border2, rgba(255,235,190,0.10));
      border-radius: 14px;
      overflow: hidden;
    }
    .cb-timeline-ui .cb-ui__header {
      display: flex; align-items: center; justify-content: space-between;
      gap: 10px; padding: 11px 14px;
      background: var(--cb-rail, #1a1917);
      border-bottom: 0.5px solid var(--cb-border, rgba(255,235,190,0.06));
    }
    .cb-timeline-ui .cb-ui__title {
      margin: 0; font-size: 13px; font-weight: 800;
      color: var(--cb-text, #ede8df);
      display: flex; align-items: center; gap: 8px;
    }
    .cb-timeline-ui .cb-ui__title-dot {
      width: 7px; height: 7px; border-radius: 999px;
      background: var(--cb-amber2, #e8b45a);
      box-shadow: 0 0 7px var(--cb-amber2, #e8b45a);
      flex-shrink: 0;
    }
    .cb-timeline-ui .cb-ui__body {
      padding: 14px; display: grid; gap: 0;
    }

    /* Section */
    .cb-timeline-ui .cb-section {
      padding: 14px 0;
      border-bottom: 0.5px solid var(--cb-border, rgba(255,235,190,0.06));
    }
    .cb-timeline-ui .cb-section:first-child { padding-top: 0; }
    .cb-timeline-ui .cb-section:last-child { border-bottom: none; padding-bottom: 0; }
    .cb-timeline-ui .cb-section__header {
      display: flex; align-items: center; justify-content: space-between;
      gap: 8px; margin-bottom: 12px;
    }
    .cb-timeline-ui .cb-section__title {
      font-size: 10px; font-weight: 700;
      letter-spacing: .08em; text-transform: uppercase;
      color: var(--cb-muted, #6e6a62);
      margin: 0;
    }

    .cb-timeline-ui .cb-label {
      font-size: 11px; font-weight: 700;
      letter-spacing: .02em;
      color: var(--cb-muted, #6e6a62);
      margin-bottom: 6px;
    }

    .cb-timeline-ui .cb-input,
    .cb-timeline-ui .cb-select {
      width: 100%;
      height: 36px;
      border-radius: 10px;
      border: 1px solid var(--cb-border2, rgba(255,235,190,0.10));
      background: var(--cb-inset, #0c0b09);
      color: var(--cb-text, #ede8df);
      padding: 0 10px;
      font-size: 12px;
      font-family: inherit;
      outline: none;
      appearance: none; -webkit-appearance: none;
      transition: border-color .15s, box-shadow .15s;
    }
    .cb-timeline-ui .cb-input:focus,
    .cb-timeline-ui .cb-select:focus {
      border-color: var(--cb-accent, #4f8cff);
      box-shadow: 0 0 0 3px rgba(79,140,255,0.18);
    }
    .cb-timeline-ui .cb-input::placeholder { color: var(--cb-muted2, #3e3b35); }
    .cb-timeline-ui .cb-input--at {
      width: 64px; flex-shrink: 0; font-family: ui-monospace, Consolas, monospace;
    }

    .cb-timeline-ui .cb-btn {
      display: inline-flex; align-items: center; justify-content: center;
      gap: 5px;
      padding: 7px 14px;
      border-radius: 10px;
      border: 1px solid rgba(200,151,58,0.35);
      background: linear-gradient(160deg, rgba(200,151,58,0.18), rgba(200,151,58,0.08));
      color: var(--cb-amber2, #e8b45a);
      font-size: 12px; font-weight: 700; font-family: inherit;
      cursor: pointer;
      transition: all .15s;
      box-shadow: 0 0 12px rgba(200,151,58,0.10);
      white-space: nowrap;
    }
    .cb-timeline-ui .cb-btn:hover {
      border-color: rgba(200,151,58,0.55);
      box-shadow: 0 0 18px rgba(200,151,58,0.22);
      color: #fff;
    }
    .cb-timeline-ui .cb-btn:active { transform: scale(0.97); }
    .cb-timeline-ui .cb-btn--danger {
      border-color: rgba(255,80,80,0.30);
      background: rgba(255,80,80,0.06);
      color: #ff6060;
      box-shadow: none;
    }
    .cb-timeline-ui .cb-btn--danger:hover {
      border-color: rgba(255,80,80,0.55);
      box-shadow: 0 0 12px rgba(255,80,80,0.18);
    }
    .cb-timeline-ui .cb-btn--sm {
      padding: 5px 10px; font-size: 11px;
    }

    .cb-timeline-ui .cb-hint {
      font-size: 12px; color: var(--cb-muted, #6e6a62);
      font-weight: 600; font-style: italic;
      padding: 8px 0;
    }

    /* Hook row */
    .cb-timeline-ui .cb-hook-row {
      display: grid;
      grid-template-columns: 64px 1fr auto;
      gap: 6px;
      align-items: center;
      background: var(--cb-inset, #0c0b09);
      border: 1px solid var(--cb-border, rgba(255,235,190,0.06));
      border-radius: 10px;
      padding: 8px 10px;
    }

    .cb-timeline-ui .cb-hook-list,
    .cb-timeline-ui .cb-cta-list {
      display: grid; gap: 6px;
    }

    /* CTA row — richer */
    .cb-timeline-ui .cb-cta-card {
      background: var(--cb-inset, #0c0b09);
      border: 1px solid var(--cb-border2, rgba(255,235,190,0.10));
      border-radius: 10px;
      padding: 10px;
      display: grid;
      gap: 8px;
    }
    .cb-timeline-ui .cb-cta-card__top {
      display: grid;
      grid-template-columns: 64px 1fr 80px auto;
      gap: 6px;
      align-items: center;
    }
    .cb-timeline-ui .cb-cta-card__url {
      grid-column: 1 / -1;
    }
    @media (max-width: 520px) {
      .cb-timeline-ui .cb-cta-card__top {
        grid-template-columns: 64px 1fr auto;
        grid-template-rows: auto auto;
      }
      .cb-timeline-ui .cb-cta-card__duration {
        grid-column: 1 / 3;
      }
    }
    .cb-timeline-ui .cb-live-val {
      font-family: ui-monospace, Consolas, monospace;
      font-size: 10px; font-weight: 600;
      color: var(--cb-green, #22d3a0);
      letter-spacing: .03em;
    }
    .cb-timeline-ui .cb-input-label {
      font-size: 10px; font-weight: 700;
      color: var(--cb-muted2, #3e3b35);
      letter-spacing: .04em; text-transform: uppercase;
    }
  `;
  rootEl.appendChild(style);

  // ---- DOM ----
  const root = document.createElement("div");
  root.className = "cb-timeline-ui";
  root.innerHTML = `
    <!-- Scope bar -->
    <div class="cb-scope-bar">
      <span class="cb-scope-item">
        <span class="cb-scope-key">HOOKS</span>
        <span class="cb-scope-val" id="tl-scope-hooks">0</span>
      </span>
      <span class="cb-scope-item">
        <span class="cb-scope-key">CTA</span>
        <span class="cb-scope-val" id="tl-scope-ctas">0</span>
      </span>
    </div>

    <div class="cbp-surface">
      <div class="cb-ui__header">
        <h3 class="cb-ui__title">
          <span class="cb-ui__title-dot"></span>
          Timeline
        </h3>
      </div>

      <div class="cb-ui__body">

        <!-- SECTION — HOOKS -->
        <div class="cb-section">
          <div class="cb-section__header">
            <div class="cb-section__title">Repères (Hooks)</div>
            <button id="tl-add-hook" type="button" class="cb-btn cb-btn--sm">+ Repère</button>
          </div>
          <div id="tl-hook-list" class="cb-hook-list"></div>
        </div>

        <!-- SECTION — CTA TIMÉS -->
        <div class="cb-section">
          <div class="cb-section__header">
            <div class="cb-section__title">CTA timés</div>
            <button id="tl-add-cta" type="button" class="cb-btn cb-btn--sm">+ CTA</button>
          </div>
          <div id="tl-cta-list" class="cb-cta-list"></div>
        </div>

      </div>
    </div>
  `;

  safeAppend(rootEl, root);

  // ---- Static refs ----
  const addHookBtn = root.querySelector("#tl-add-hook");
  const addCtaBtn  = root.querySelector("#tl-add-cta");
  const hookList   = root.querySelector("#tl-hook-list");
  const ctaList    = root.querySelector("#tl-cta-list");

  // ---- Event registries ----
  const cleanups    = [];
  const rowCleanups = [];

  function on(el, evt, fn, opts) {
    if (!el?.addEventListener) return;
    el.addEventListener(evt, fn, opts);
    cleanups.push(() => { try { el.removeEventListener(evt, fn, opts); } catch (_) {} });
  }

  function onRow(el, evt, fn, opts) {
    if (!el?.addEventListener) return;
    el.addEventListener(evt, fn, opts);
    rowCleanups.push(() => { try { el.removeEventListener(evt, fn, opts); } catch (_) {} });
  }

  function clearRowListeners() {
    while (rowCleanups.length) { try { rowCleanups.pop()(); } catch (_) {} }
  }

  // ---- State accessors ----
  function getHooks() {
    try {
      const state = core.getState();
      const hooks = selectTimelineHooks ? selectTimelineHooks(state) : selectTimeline(state)?.hooks;
      return Array.isArray(hooks) ? hooks : [];
    } catch (_) { return []; }
  }

  function getCtas() {
    try {
      const state = core.getState();
      const ctas = selectTimelineCtas ? selectTimelineCtas(state) : selectTimeline(state)?.ctas;
      return Array.isArray(ctas) ? ctas : [];
    } catch (_) { return []; }
  }

  function dispatch(action) {
    try {
      if (core && typeof core.dispatch === "function") core.dispatch(action);
      if (typeof render === "function") render();
    } catch (_) {}
  }

  // ---- Build hook row ----
  function buildHookRow(hook) {
    const row = document.createElement("div");
    row.className = "cb-hook-row";

    const atInput = document.createElement("input");
    atInput.type = "number";
    atInput.step = "0.1";
    atInput.min  = "0";
    atInput.value = String(hook.at);
    atInput.className = "cb-input cb-input--at";
    atInput.title = "Temps (secondes)";

    const nameInput = document.createElement("input");
    nameInput.type  = "text";
    nameInput.value = hook.name;
    nameInput.className = "cb-input";
    nameInput.placeholder = "Nom du repère";

    const removeBtn = document.createElement("button");
    removeBtn.type  = "button";
    removeBtn.className = "cb-btn cb-btn--danger cb-btn--sm";
    removeBtn.textContent = "✕";
    removeBtn.title = "Supprimer";

    row.appendChild(atInput);
    row.appendChild(nameInput);
    row.appendChild(removeBtn);

    // Edition at
    onRow(atInput, "change", () => {
      const current = getHooks();
      const next = current.map(h =>
        h.name === hook.name ? { at: Number(atInput.value), name: h.name } : h
      );
      dispatch(Actions.timelineSetHooks(next));
      syncScopeBar();
    });

    // Edition name
    onRow(nameInput, "change", () => {
      const current = getHooks();
      const next = current.map(h =>
        h.name === hook.name ? { at: h.at, name: nameInput.value } : h
      );
      dispatch(Actions.timelineSetHooks(next));
    });

    // Remove
    onRow(removeBtn, "click", () => {
      dispatch(Actions.timelineRemoveHook(hook.name));
      sync();
    });

    return row;
  }

  // ---- Build CTA card ----
  function buildCtaCard(cta) {
    const card = document.createElement("div");
    card.className = "cb-cta-card";

    // Top row: AT · LABEL · DURATION · REMOVE
    const topRow = document.createElement("div");
    topRow.className = "cb-cta-card__top";

    // AT
    const atWrap = document.createElement("div");
    const atLbl  = document.createElement("div");
    atLbl.className = "cb-input-label";
    atLbl.textContent = "AT (s)";
    const atInput = document.createElement("input");
    atInput.type = "number";
    atInput.step = "0.1";
    atInput.min  = "0";
    atInput.value = String(cta.at ?? 0);
    atInput.className = "cb-input cb-input--at";
    atWrap.appendChild(atLbl);
    atWrap.appendChild(atInput);

    // LABEL
    const labelWrap = document.createElement("div");
    const labelLbl  = document.createElement("div");
    labelLbl.className = "cb-input-label";
    labelLbl.textContent = "LABEL";
    const labelInput = document.createElement("input");
    labelInput.type = "text";
    labelInput.value = cta.label || "";
    labelInput.className = "cb-input";
    labelInput.placeholder = "Texte du CTA";
    labelWrap.appendChild(labelLbl);
    labelWrap.appendChild(labelInput);

    // DURATION
    const durWrap = document.createElement("div");
    durWrap.className = "cb-cta-card__duration";
    const durLbl = document.createElement("div");
    durLbl.className = "cb-input-label";
    durLbl.textContent = "DURÉE (s)";
    const durInput = document.createElement("input");
    durInput.type = "number";
    durInput.step = "0.5";
    durInput.min  = "0";
    durInput.value = String(cta.duration ?? 5);
    durInput.className = "cb-input";
    durWrap.appendChild(durLbl);
    durWrap.appendChild(durInput);

    // REMOVE
    const removeBtn = document.createElement("button");
    removeBtn.type  = "button";
    removeBtn.className = "cb-btn cb-btn--danger cb-btn--sm";
    removeBtn.textContent = "✕";
    removeBtn.title = "Supprimer ce CTA";
    removeBtn.style.alignSelf = "flex-end";

    topRow.appendChild(atWrap);
    topRow.appendChild(labelWrap);
    topRow.appendChild(durWrap);
    topRow.appendChild(removeBtn);

    // URL row (full width)
    const urlWrap = document.createElement("div");
    urlWrap.className = "cb-cta-card__url";
    const urlLbl = document.createElement("div");
    urlLbl.className = "cb-input-label";
    urlLbl.textContent = "URL";
    const urlInput = document.createElement("input");
    urlInput.type = "text";
    urlInput.value = cta.url || "";
    urlInput.className = "cb-input";
    urlInput.placeholder = "https://…";
    urlWrap.appendChild(urlLbl);
    urlWrap.appendChild(urlInput);

    // Live display
    const liveRow = document.createElement("div");
    liveRow.className = "cb-live-val";
    function refreshLive() {
      const at  = parseFloat(atInput.value) || 0;
      const dur = parseFloat(durInput.value) || 0;
      liveRow.textContent = `@${at}s → +${dur}s`;
    }
    refreshLive();

    card.appendChild(topRow);
    card.appendChild(urlWrap);
    card.appendChild(liveRow);

    // Events
    function patchCta(patch) {
      dispatch(Actions.timelineUpdateCta(cta.id, patch));
      refreshLive();
      syncScopeBar();
    }

    onRow(atInput,    "change", () => patchCta({ at:       Number(atInput.value) }));
    onRow(durInput,   "change", () => patchCta({ duration: Number(durInput.value) }));
    onRow(labelInput, "change", () => patchCta({ label:    labelInput.value }));
    onRow(urlInput,   "change", () => patchCta({ url:      urlInput.value }));

    onRow(atInput,    "input", refreshLive);
    onRow(durInput,   "input", refreshLive);

    onRow(removeBtn, "click", () => {
      dispatch(Actions.timelineRemoveCta(cta.id));
      sync();
    });

    return card;
  }

  // ---- Scope bar update ----
  function syncScopeBar() {
    try {
      const hooks = getHooks();
      const ctas  = getCtas();
      const scopeHooks = root.querySelector("#tl-scope-hooks");
      const scopeCtas  = root.querySelector("#tl-scope-ctas");
      if (scopeHooks) scopeHooks.textContent = String(hooks.length);
      if (scopeCtas)  scopeCtas.textContent  = String(ctas.length);
    } catch (_) {}
  }

  // ---- Main sync ----
  function sync() {
    try {
      clearRowListeners();

      const hooks = getHooks();
      const ctas  = getCtas();

      syncScopeBar();

      // Rebuild hooks list
      if (hookList) {
        hookList.innerHTML = "";
        if (hooks.length === 0) {
          const empty = document.createElement("div");
          empty.className = "cb-hint";
          empty.textContent = 'Aucun repère. Clique "+ Repère" pour en ajouter.';
          hookList.appendChild(empty);
        } else {
          hooks.forEach(hook => hookList.appendChild(buildHookRow(hook)));
        }
      }

      // Rebuild CTAs list
      if (ctaList) {
        ctaList.innerHTML = "";
        if (ctas.length === 0) {
          const empty = document.createElement("div");
          empty.className = "cb-hint";
          empty.textContent = 'Aucun CTA. Clique "+ CTA" pour en ajouter.';
          ctaList.appendChild(empty);
        } else {
          ctas.forEach(cta => ctaList.appendChild(buildCtaCard(cta)));
        }
      }
    } catch (_) {}
  }

  // ---- Static wiring ----
  on(addHookBtn, "click", () => {
    const name = `hook_${Date.now()}`;
    dispatch(Actions.timelineAddHook({ at: 0, name }));
    sync();
  });

  on(addCtaBtn, "click", () => {
    const id = `cta_${Date.now()}`;
    dispatch(Actions.timelineAddCta({ id, at: 0, duration: 5, label: "Clique ici", url: "" }));
    sync();
  });

  // Initial
  sync();

  // ---- destroy ----
  function destroy() {
    while (cleanups.length)    cleanups.pop()();
    clearRowListeners();
    safeClear(rootEl);
  }

  return { sync, destroy };
}
