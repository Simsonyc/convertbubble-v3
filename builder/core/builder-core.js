/**
 * ConvertBubble V3 — Core Antigravity
 * builder-core.js
 *
 * - store déterministe
 * - dispatch(action) -> reducers purs
 * - aucun DOM / runtime / UI
 */

import { createInitialState, reducer } from "./reducers.js";
import { exportConfigV3 } from "./export-config-v3.js";

export function createCore({ now = 0, debug = false, generator = "" } = {}) {
  let state = createInitialState({ now, generator });

  function debugLog(...args) {
    if (!debug) return;
    // eslint-disable-next-line no-console
    console.log("[CB-CORE]", ...args);
  }

  return Object.freeze({
    dispatch(action) {
      const prev = state;
      state = reducer(state, action, now);
      if (debug && prev !== state) debugLog("dispatch", action?.type);
      return state;
    },

    getState() {
      return state;
    },

    exportConfigV3() {
      return exportConfigV3(state);
    },
  });
}
