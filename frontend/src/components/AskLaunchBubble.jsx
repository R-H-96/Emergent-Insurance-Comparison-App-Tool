import { MessageCircleQuestion } from "lucide-react";
import useMediaQuery from "@/hooks/useMediaQuery";

/**
 * Classic bottom-right chat bubble launcher for the Ask panel.
 * Desktop-only (>=1200px) — mobile users get the Ask button on the
 * MobileBottomBar and the compact ask bar above the comparison surface.
 *
 * Uses the brand accent gradient. Sits above z-index of sheets/popovers.
 */
export default function AskLaunchBubble({ open, onToggle, hidden = false }) {
  const isDesktop = useMediaQuery("(min-width: 1200px)");
  if (!isDesktop) return null;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={open ? "Close ask panel" : "Ask a question"}
      aria-expanded={open}
      className="fixed bottom-6 right-6 z-[70] gmc-tap flex items-center justify-center rounded-full transition-all duration-200 ease-out hover:scale-105 focus:scale-105 active:scale-95"
      style={{
        width: 56,
        height: 56,
        background: "var(--gmc-grad-button)",
        boxShadow: "0 14px 32px rgba(20,181,175,0.42)",
        transform: hidden ? "translateY(120%)" : "none",
        opacity: hidden ? 0 : 1,
        visibility: hidden ? "hidden" : "visible",
      }}
      data-testid="ask-launch-bubble"
    >
      <MessageCircleQuestion
        className="text-white"
        width={26}
        height={26}
        strokeWidth={2.2}
      />
    </button>
  );
}
