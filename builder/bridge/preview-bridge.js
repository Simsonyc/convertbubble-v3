/**
 * Preview Bridge — Mission 2 IA-C
 *
 * Rôle :
 * - Gérer l'iframe preview via postMessage
 * - Lecture seule du state
 * - Aucune logique métier
 *
 * Contrat :
 * - Le bootstrap appelle bridge.render()
 */
export function initPreviewBridge({ iframe, core }) {
  if (!iframe) {
    throw new Error("[preview-bridge] iframe manquant.");
  }
  if (!core) {
    throw new Error("[preview-bridge] core manquant.");
  }

  function post(type, payload) {
    if (!iframe.contentWindow) return;
    iframe.contentWindow.postMessage({ type, payload }, "*");
  }

  function render() {
    // Synchronisation state → preview (lecture seule)
    const state = core.getState();
    post("CB_BUILDER_STATE", state);
  }

  window.addEventListener("message", () => {
    // Mission 2 : aucun routage métier
    // Réservé à une mission ultérieure
  });

  return { render };
}
