/**
 * One container that every portal in the tool renders into.
 *
 * Why this exists
 * ---------------
 * Modals, sheets, popovers, tooltips and selects all portal their content to
 * `document.body`, which puts it OUTSIDE `#gmc-root` and therefore outside the
 * `.gmc-app` class that carries our scoped reset. Everything styled by a
 * Tailwind class still looked right, because utilities are global. Anything
 * relying on the reset did not, so on the Webflow page the host stylesheet
 * styled it instead: bare buttons inside modals picked up a grey background,
 * native button chrome and 1px of UA padding.
 *
 * The fix is structural rather than another specificity patch. This host is a
 * direct child of `<body>`, so `position: fixed` still resolves against the
 * viewport and no transformed ancestor can trap an overlay, and it carries
 * `.gmc-app`, so portalled content sits inside our scope like the rest of the
 * tool.
 *
 * Any new portal should pass this as its container. Radix primitives take it
 * as `container`; `createPortal` takes it as the second argument.
 */
export default function portalHost() {
  if (typeof document === "undefined") return undefined;

  let host = document.getElementById("gmc-portal-host");
  if (!host) {
    host = document.createElement("div");
    host.id = "gmc-portal-host";
    host.className = "gmc-app";
    document.body.appendChild(host);
  }
  return host;
}
