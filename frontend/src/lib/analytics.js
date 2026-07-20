/**
 * Lightweight dataLayer helper. Ensures `window.dataLayer` exists and pushes
 * a normalised event payload. Event names must match spec exactly:
 *   gmc_select_insurers, gmc_group_open, gmc_modal_open,
 *   gmc_question_asked, gmc_cta_click, gmc_share
 */
export function pushEvent(event, payload = {}) {
  if (typeof window === "undefined") return;
  if (!Array.isArray(window.dataLayer)) window.dataLayer = [];
  try {
    window.dataLayer.push({
      event,
      ts: new Date().toISOString(),
      ...payload,
    });
  } catch (_err) {
    /* ignore */
  }
}
