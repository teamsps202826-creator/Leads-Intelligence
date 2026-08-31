/** Presentation helpers. Nothing here invents data — a missing value stays
 *  missing and renders as an explicit dash, never as 0 or "Unknown". */

export function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

export const isMissing = (value) =>
  value === null || value === undefined || value === "";

export function num(value) {
  return isMissing(value) ? "—" : Number(value).toLocaleString();
}

export function decimal(value, places = 2) {
  return isMissing(value) ? "—" : Number(value).toFixed(places);
}

export function percent(value, places = 0) {
  return isMissing(value) ? "—" : `${(Number(value) * 100).toFixed(places)}%`;
}

/* Timestamps from the API are UTC stored in a naive column, so they arrive
   without an offset. A bare "2026-08-08T10:30:00" is parsed as *local* time by
   the browser, which makes a run that just finished read as hours ago. */
const asUTC = (iso) =>
  /(Z|[+-]\d{2}:?\d{2})$/.test(iso) ? iso : `${iso}Z`;

export function timeAgo(iso) {
  if (!iso) return "—";
  const seconds = (Date.now() - new Date(asUTC(iso)).getTime()) / 1000;
  if (seconds < 45) return "just now";
  if (seconds < 3600) return `${Math.round(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.round(seconds / 86400)}d ago`;
  return new Date(asUTC(iso)).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function dateOnly(iso) {
  if (!iso) return "—";
  return new Date(asUTC(iso)).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function greeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/* --- potential tiers ------------------------------------------------------
 *
 * The backend assigns the band (scoring.py: 75 / 50 / 25). The UI renders the
 * spec's wording for those same four buckets rather than re-deriving tiers
 * from the raw score — two thresholds systems would eventually disagree, and
 * a lead labelled "High Potential" in a table while the API calls it Medium is
 * a bug nobody notices until a customer asks.
 */
export const TIERS = {
  High: {
    label: "High Potential",
    mark: "🔥",
    dot: "bg-hot",
    text: "text-hot",
    ring: "ring-hot/30",
    chip: "bg-hot/10 text-hot ring-1 ring-hot/20",
  },
  Medium: {
    label: "Potential",
    mark: "🟡",
    dot: "bg-warm",
    text: "text-warm",
    ring: "ring-warm/30",
    chip: "bg-warm/10 text-warm ring-1 ring-warm/20",
  },
  Low: {
    label: "Low Potential",
    mark: "⚪",
    dot: "bg-cool",
    text: "text-cool",
    ring: "ring-cool/30",
    chip: "bg-cool/10 text-cool ring-1 ring-cool/20",
  },
  "Not a fit": {
    label: "Not a Fit",
    mark: "✕",
    dot: "bg-cold",
    text: "text-cold",
    ring: "ring-cold/30",
    chip: "bg-cold/10 text-cold ring-1 ring-cold/20",
  },
};

export const UNSCORED_TIER = {
  label: "Not scored",
  mark: "–",
  dot: "bg-ink-300",
  text: "muted",
  ring: "ring-ink-300/30",
  chip: "bg-ink-200/50 muted ring-1 ring-ink-300/40",
};

export const tierFor = (band) => TIERS[band] || UNSCORED_TIER;

export const BAND_ORDER = ["High", "Medium", "Low", "Not a fit"];

/* --- lead pipeline status (spec §23) -------------------------------------- */

export const LEAD_STATUSES = [
  "New",
  "Reviewed",
  "Qualified",
  "Contacted",
  "Interested",
  "Meeting",
  "Customer",
  "Not Interested",
  "Not a Fit",
];

export const TASK_STATUS_STYLE = {
  succeeded: "bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20",
  running: "bg-accent-500/10 text-accent-700 ring-1 ring-accent-500/20",
  queued: "bg-accent-500/10 text-accent-700 ring-1 ring-accent-500/20",
  pending: "bg-ink-200/60 text-ink-600 ring-1 ring-ink-300/50",
  failed: "bg-red-500/10 text-red-700 ring-1 ring-red-500/20",
};

/** Percentage complete for a running task. The backend reports named stages,
 *  not a number, so this maps stages onto a coarse progress bar — and says as
 *  much in the UI rather than implying a measured percentage. */
export const TASK_STAGES = [
  ["fetching", "Searching papers"],
  ["aggregating", "Aggregating authors"],
  ["enriching", "Enriching profiles"],
  ["signals", "Detecting signals"],
  ["done", "Complete"],
];

export function stageProgress(stage) {
  const index = TASK_STAGES.findIndex(([key]) => key === stage);
  if (index < 0) return 0;
  return Math.round(((index + 1) / TASK_STAGES.length) * 100);
}

/** Split a list into the first n and the remainder, for "+3 more" chips. */
export function firstN(list, n) {
  const items = list || [];
  return [items.slice(0, n), Math.max(0, items.length - n)];
}
