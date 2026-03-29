/**
 * I18n UI — Mission 2 IA-C
 *
 * Rôle :
 * - Sélecteur FR / EN (UI uniquement)
 * - Ne touche pas au Core (pas de champ lang inventé)
 *
 * Contrat :
 * initI18nUI({ core, render })
 */
export function initI18nUI({ core, render }) {
  const root = document.getElementById("cb-panel");
  if (!root) {
    throw new Error("[i18n-ui] #cb-panel introuvable (layout bootstrap requis).");
  }

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
    <h2 class="cb-h2">Langue</h2>
    <p class="cb-muted">FR / EN (UI uniquement — aucun champ Core).</p>
  `;

  const row = document.createElement("div");
  row.className = "cb-row";

  const fr = document.createElement("button");
  fr.className = "cb-btn";
  fr.type = "button";
  fr.textContent = "FR";
  fr.addEventListener("click", () => {
    toast("Langue UI = FR (non persistée Core en Mission 2).");
    render();
  });

  const en = document.createElement("button");
  en.className = "cb-btn cb-btn-ghost";
  en.type = "button";
  en.textContent = "EN";
  en.addEventListener("click", () => {
    toast("Langue UI = EN (non persistée Core en Mission 2).");
    render();
  });

  row.appendChild(fr);
  row.appendChild(en);
  section.appendChild(row);

  root.appendChild(section);
}
