/**
 * Lightweight dataLayer helper. Ensures `window.dataLayer` exists and pushes a
 * normalised event payload.
 *
 * NOTE: these land in `window.dataLayer` for GTM to pick up. If GTM isn't on the
* page this embeds into, every event below is collected and never read, worth
 * confirming as part of the embed test.
 *
 * Events currently fired:
 *   Intake     gmc_intake_step · gmc_intake_complete · gmc_intake_skip · gmc_intake_reopen
 *   Navigation gmc_level_change · gmc_group_open · gmc_modal_open · gmc_select_insurers
 *   Content    gmc_question_asked · gmc_glossary_open
 *   Output     gmc_share · gmc_print · gmc_cta_click
 *   Health     gmc_error
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
