// ConvertBubble — Logger Module (PHASE 7.1.1)
// Rôle : écouter tous les événements runtime et les afficher

(function () {
  'use strict';

  if (!window.ConvertBubbleRuntime) {
    console.warn('[CB-LOGGER] Runtime non détecté');
    return;
  }

  console.log('[CB-LOGGER] Module chargé');

  function log(eventName, payload) {
    const time = new Date().toISOString();
    console.log(
      `%c[CB EVENT] ${eventName}`,
      'color:#00e0ff;font-weight:bold;',
      {
        time,
        payload,
        state: window.ConvertBubbleRuntime.getState
          ? window.ConvertBubbleRuntime.getState()
          : null
      }
    );
  }

  // Écoute générique via CustomEvent
  window.addEventListener('cb:event', function (e) {
    if (!e.detail || !e.detail.type) return;
    log(e.detail.type, e.detail.payload || {});
  });
})();
