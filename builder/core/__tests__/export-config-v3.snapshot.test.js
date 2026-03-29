import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { createInitialState } from "../reducers.js";
import { exportConfigV3 } from "../export-config-v3.js";

/**
 * Charge le snapshot JSON
 */
function loadSnapshot() {
  const snapshotPath = path.join(
    process.cwd(),
    "builder",
    "core",
    "__tests__",
    "snapshots",
    "export-config-v3.snap.json"
  );

  return JSON.parse(fs.readFileSync(snapshotPath, "utf-8"));
}

test("snapshot: exportConfigV3 default", () => {
  const snap = loadSnapshot();

  const state = createInitialState({ now: 0 });
  state.launcher.src =
    "https://cdn.convertbubble.io/assets/launcher/preview-loop.mp4";
  state.player.src =
    "https://cdn.convertbubble.io/assets/shared/demo.mp4";

  const result = exportConfigV3(state);
  assert.deepStrictEqual(result, snap.defaultExport);
});

test("snapshot: exportConfigV3 with timeline hooks", () => {
  const snap = loadSnapshot();

  const state = createInitialState({ now: 0 });
  state.launcher.src =
    "https://cdn.convertbubble.io/assets/launcher/preview-loop.mp4";
  state.player.src =
    "https://cdn.convertbubble.io/assets/shared/demo.mp4";
  state.timeline.hooks = [
    { at: 3, name: "intro" },
    { at: 12, name: "pricing_visible" }
  ];

  const result = exportConfigV3(state);
  assert.deepStrictEqual(result, snap.withTimeline);
});

test('export blocks when launcher.type !== "video"', () => {
  const state = createInitialState({ now: 0 });
  state.launcher.type = "image";
  state.launcher.src =
    "https://cdn.convertbubble.io/assets/launcher/preview-loop.mp4";
  state.player.src =
    "https://cdn.convertbubble.io/assets/shared/demo.mp4";

  assert.throws(
    () => exportConfigV3(state),
    /launcher\.type/
  );
});
