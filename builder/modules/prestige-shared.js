// Prestige Shared CSS — SINGLE SOURCE OF TRUTH
// IA-A2 (UI layout only)

export const PRESTIGE_SHARED_CSS = ``;

export function ensurePrestigeSharedStyles(){
  if (document.getElementById("cb-prestige-shared-style")) return;
  const style = document.createElement("style");
  style.id = "cb-prestige-shared-style";
  style.textContent = PRESTIGE_SHARED_CSS;
  document.head.appendChild(style);
}
