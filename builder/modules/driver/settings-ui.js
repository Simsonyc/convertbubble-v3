/**
 * Settings UI — Mission 2 IA-C
 *
 * Rôle :
 * - Panneau "Settings" (UI only)
 * - Pas de logique métier
 * - Pas d'alert/confirm → toast UX
 *
 * Contrat :
 * initSettingsUI({ core, selectors, render })
 */
export function initSettingsUI({ core, selectors, render }) {
  const root = document.getElementById("cb-panel");
  if (!root) {
    throw new Error("[settings-ui] #cb-panel introuvable (layout bootstrap requis).");
  }

  // --- UI helpers (toast minimal, UX only) ---
  const toastHost = document.getElementById("cb-toasts");
  const toast = (msg) => {
    if (!toastHost) return;
    const el = document.createElement("div");
    el.className = "cb-toast";
    el.textContent = msg;
    toastHost.appendChild(el);
    setTimeout(() => el.remove(), 2200);
  };

  const section = document.createElement("section");
  section.className = "cb-section";
  section.innerHTML = `
    <h2 class="cb-h2">Settings</h2>
    <p class="cb-muted">Paramètres globaux du builder (UI uniquement).</p>
  `;

  const row = document.createElement("div");
  row.className = "cb-row";

  const btn = document.createElement("button");
  btn.className = "cb-btn";
  btn.type = "button";
  btn.textContent = "Debug (UI)";
  btn.addEventListener("click", () => {
    // Mission 2 : aucun toggle core.debug (core figé)
    toast("Debug UI : non câblé au Core (normal en Mission 2).");
  });

  const btn2 = document.createElement("button");
  btn2.className = "cb-btn cb-btn-ghost";
  btn2.type = "button";
  btn2.textContent = "Render";
  btn2.addEventListener("click", () => {
    // UI only : déclenchement manuel du render (autorisé)
    render();
    toast("Render déclenché.");
  });

  row.appendChild(btn);
  row.appendChild(btn2);
  section.appendChild(row);

  root.appendChild(section);
}
