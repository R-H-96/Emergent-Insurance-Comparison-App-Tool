import {
  Scissors,
  Building2,
  Wallet,
  Zap,
  Pill,
  RotateCcw,
  Stethoscope,
  ScanLine,
  Clock,
  History,
  Hourglass,
  Baby,
  Home,
  HeartPulse,
  Brain,
  Video,
  Bone,
  MapPin,
  CheckCircle2,
  FileText,
  Award,
  TrendingUp,
  ShieldCheck,
  XCircle,
  CalendarClock,
  Info,
} from "lucide-react";

/**
 * Explicit feature → lucide icon map per brand guideline.
 * Matching is case-insensitive and uses a `startsWith` fallback for minor
 * wording variants. Fallback icon is `Info`.
 */
const MAP = {
  "surgical benefit maximum": Scissors,
  "non-surgical hospital": Building2,
  "excess options": Wallet,
  "chemotherapy / radiotherapy": Zap,
  "chemotherapy/radiotherapy": Zap,
  "non-pharmac medicines": Pill,
  "follow-up care": RotateCcw,
  "specialist consultations": Stethoscope,
  "diagnostic imaging & tests": ScanLine,
  "diagnostic imaging": ScanLine,
  "time-link conditions": Clock,
  "pre-existing conditions": History,
  "stand-down": Hourglass,
  "stand-down/waiting": Hourglass,
  "congenital": Baby,
  "gp/day-to-day": Home,
  "gp / day-to-day": Home,
  "obstetrics/maternity": HeartPulse,
  "obstetrics / maternity": HeartPulse,
  "mental health": Brain,
  telehealth: Video,
  prosthesis: Bone,
  "approved-provider rules": MapPin,
  "approved provider": MapPin,
  "prior approval": CheckCircle2,
  "claims process": FileText,
  loyalty: Award,
  "premium structure": TrendingUp,
  "guaranteed upgrades": ShieldCheck,
  "key exclusions": XCircle,
  "age limits": CalendarClock,
};

export function iconForFeature(name) {
  if (!name || typeof name !== "string") return Info;
  const key = name.trim().toLowerCase();
  if (MAP[key]) return MAP[key];
  // Fallback: startsWith any known key (handles trailing qualifiers)
  const hit = Object.keys(MAP).find((k) => key.startsWith(k));
  return hit ? MAP[hit] : Info;
}

/**
 * <FeatureIcon name={feature.feature} /> — renders an 18px muted-ink icon.
 * Size + colour are overridable via props.
 */
export default function FeatureIcon({
  name,
  size = 18,
  className = "",
  strokeWidth = 2,
  style = {},
}) {
  const Icon = iconForFeature(name);
  return (
    <Icon
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      className={`flex-shrink-0 ${className}`}
      style={{ color: "var(--gmc-body)", ...style }}
      aria-hidden="true"
    />
  );
}
