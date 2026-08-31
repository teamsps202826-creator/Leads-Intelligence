/* Customer-potential rendering.
 *
 * This is where the product either stays honest or quietly stops being useful.
 * Three rules, all visual:
 *
 *   1. Score and confidence are never the same number and never share a badge.
 *      A lead can be a strong fit on thin evidence; that is a high score with a
 *      low confidence and it means "worth a look", not "qualified".
 *   2. A component with no surviving evidence is hatched, not drawn as an empty
 *      bar. An empty bar says "measured, found nothing". Hatching says "never
 *      evaluated". The scoring model turns on that difference.
 *   3. Inferences are labelled as inferences, next to the facts they rest on.
 */

import { Link } from "react-router-dom";
import { cn, decimal, percent, tierFor } from "../lib/format";
import { Banner, Card, CardHeader, Pill } from "./ui";

/* --- the headline number -------------------------------------------------- */

export function ScoreDial({ score, band, size = 132 }) {
  const tier = tierFor(band);
  const value = Math.max(0, Math.min(100, score ?? 0));
  const stroke = 9;
  const radius = size / 2 - stroke;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-ink-200 dark:stroke-ink-800"
        />
        {score !== null && score !== undefined && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - value / 100)}
            className={cn("transition-[stroke-dashoffset] duration-700", tier.text)}
            stroke="currentColor"
          />
        )}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="tnum text-3xl font-semibold leading-none tracking-tight">
            {score === null || score === undefined ? "—" : Math.round(score)}
          </p>
          <p className="mt-1 text-2xs muted">out of 100</p>
        </div>
      </div>
    </div>
  );
}

export function TierChip({ band, className }) {
  const tier = tierFor(band);
  return (
    <Pill className={cn(tier.chip, className)}>
      <span aria-hidden="true">{tier.mark}</span>
      {tier.label}
    </Pill>
  );
}

/** Confidence, always rendered separately from the score and always labelled
 *  with what it actually measures. */
export function ConfidenceMeter({ confidence, showExplanation = false }) {
  const value = confidence ?? 0;
  const thin = value < 0.5;

  return (
    <div>
      <div className="flex items-baseline gap-2">
        <p className="eyebrow">Confidence</p>
        <span className="tnum text-sm font-semibold">{decimal(confidence)}</span>
        {thin && (
          <Pill className="bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20">
            thin evidence
          </Pill>
        )}
      </div>
      <div className="mt-1.5 h-2 w-40 overflow-hidden rounded-full bg-ink-200 dark:bg-ink-800">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-700",
            thin ? "bg-amber-500" : "bg-accent-600",
          )}
          style={{ width: `${Math.max(2, value * 100)}%` }}
        />
      </div>
      {showExplanation && (
        <p className="mt-2 max-w-sm text-xs leading-relaxed muted">
          The share of scoring weight that had surviving evidence — not how sure
          the model is.{" "}
          {value < 1
            ? `${percent(1 - value)} of the weight scored zero for want of evidence, not because it was measured as zero.`
            : "Every component was evidenced."}
        </p>
      )}
    </div>
  );
}

/* --- the weighted breakdown ---------------------------------------------- */

function ComponentRow({ component }) {
  const { label, weight, value, contribution, grounded, rationale, note } = component;

  return (
    <div className="border-b divider py-3 last:border-0">
      <div className="flex items-center gap-4">
        <div className="w-48 shrink-0">
          <p className={cn("text-sm", grounded ? "font-medium" : "muted")}>{label}</p>
          <p className="text-2xs muted">weight {percent(weight)}</p>
        </div>

        <div className="min-w-0 flex-1">
          {grounded ? (
            <div className="h-3 overflow-hidden rounded bg-ink-200 dark:bg-ink-800">
              <div
                className="h-full rounded bg-accent-600 transition-[width] duration-700"
                style={{ width: `${Math.max(1, value * 100)}%` }}
              />
            </div>
          ) : (
            <div
              className="hatched h-3 rounded border border-dashed border-ink-300 dark:border-ink-700"
              title="Not evaluated — no surviving evidence"
            />
          )}
        </div>

        <div className="w-28 shrink-0 text-right">
          {grounded ? (
            <p className="tnum text-sm">
              {percent(value)}
              <span className="muted"> · +{decimal(contribution, 1)}</span>
            </p>
          ) : (
            <p className="text-xs italic muted">no evidence</p>
          )}
        </div>
      </div>

      {(rationale || note) && (
        <p className="mt-1.5 max-w-3xl pl-0 text-xs leading-relaxed muted sm:pl-52">
          {rationale || note}
        </p>
      )}
    </div>
  );
}

/** `showHeadline` is off wherever the page already shows the dial — repeating
 *  a 94 twice on one screen adds nothing and pushes the components below the
 *  fold, which is the part that actually explains the number. */
export function ScoreBreakdown({ score, showHeadline = false }) {
  if (!score) return null;
  const components = Object.values(score.components || {});
  const ungrounded = components.filter((c) => !c.grounded);

  return (
    <Card>
      <CardHeader
        title="How this score was built"
        note="Six weighted components. Unevidenced components contribute zero and are marked."
      />
      <div className="px-5 py-4">
        {showHeadline ? (
          <div className="mb-6 flex flex-wrap items-center gap-8">
            <ScoreDial score={score.score} band={score.band} />
            <div className="space-y-4">
              <div>
                <p className="eyebrow">Potential</p>
                <div className="mt-1.5">
                  <TierChip band={score.band} className="text-xs" />
                </div>
              </div>
              <ConfidenceMeter confidence={score.confidence} showExplanation />
            </div>
          </div>
        ) : (
          <p className="mb-4 max-w-2xl text-xs leading-relaxed muted">
            Confidence is the share of scoring weight that had surviving
            evidence — not how sure the model is.{" "}
            {score.confidence < 1
              ? `${percent(1 - score.confidence)} of the weight scored zero for want of evidence, not because it was measured as zero.`
              : "Every component was evidenced."}
          </p>
        )}

        <div>{components.map((c) => <ComponentRow key={c.key} component={c} />)}</div>

        {ungrounded.length > 0 && (
          <Banner tone="caution" className="mt-4" icon="⚠" title="What is missing">
            <ul className="mt-1 list-disc space-y-0.5 pl-4">
              {(score.missing_information || []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Banner>
        )}
      </div>
    </Card>
  );
}

/* --- evidence ------------------------------------------------------------- */

function EvidenceItem({ item, byId, papersById }) {
  const isFact = item.kind === "FACT";
  const paper = item.ref_id ? papersById[item.ref_id] : null;
  const supports = (item.supported_by || []).map((id) => byId[id]).filter(Boolean);

  return (
    <li
      className={cn(
        "surface-muted border-l-[3px] px-4 py-3",
        isFact ? "border-l-emerald-500" : "border-l-amber-500",
      )}
    >
      <div className="mb-1.5 flex flex-wrap items-center gap-2">
        <Pill
          className={
            isFact
              ? "bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20"
              : "bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20"
          }
        >
          {isFact ? "FACT" : "INFERENCE"}
        </Pill>
        <span className="text-2xs uppercase tracking-wide muted">
          {item.category?.replace(/_/g, " ")}
        </span>
      </div>

      <p className="text-sm leading-relaxed">{item.statement}</p>

      {item.quote && (
        <blockquote className="mt-2 border-l-2 border-ink-300 pl-3 text-sm italic muted dark:border-ink-700">
          “{item.quote}”
        </blockquote>
      )}

      {paper && (
        <p className="mt-2 text-xs muted">
          {item.ref_field && <span>{item.ref_field} · </span>}
          {paper.url ? (
            <a
              href={paper.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-600 hover:underline dark:text-accent-400"
            >
              {paper.title}
            </a>
          ) : (
            paper.title
          )}
        </p>
      )}

      {supports.length > 0 && (
        <div className="mt-2.5 rounded-lg bg-ink-200/40 px-3 py-2 dark:bg-ink-800/60">
          <p className="text-2xs font-semibold uppercase tracking-wide muted">
            Rests on
          </p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs muted">
            {supports.map((fact) => (
              <li key={fact.id}>{fact.statement}</li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

export function EvidenceList({ evidence = [], papers = [] }) {
  const byId = Object.fromEntries(evidence.map((e) => [e.id, e]));
  const papersById = Object.fromEntries(papers.map((p) => [p.id, p]));
  const facts = evidence.filter((e) => e.kind === "FACT");
  const inferences = evidence.filter((e) => e.kind !== "FACT");

  if (!evidence.length) {
    return (
      <Card>
        <CardHeader title="Evidence" />
        <p className="px-5 py-8 text-center text-sm muted">
          No evidence survived verification for this lead.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Evidence"
        note={`${facts.length} verified fact${facts.length === 1 ? "" : "s"}, ${inferences.length} inference${inferences.length === 1 ? "" : "s"}`}
      />
      <div className="space-y-5 px-5 py-4">
        <Banner tone="info" icon="🔍">
          Every <strong>fact</strong> quotes text checked to exist in the stored
          record. Every <strong>inference</strong> names the facts it rests on.
          Claims failing either check were never saved, so nothing here is
          unsourced.
        </Banner>

        {facts.length > 0 && (
          <div>
            <p className="eyebrow mb-2">Facts</p>
            <ul className="space-y-2">
              {facts.map((item) => (
                <EvidenceItem
                  key={item.id}
                  item={item}
                  byId={byId}
                  papersById={papersById}
                />
              ))}
            </ul>
          </div>
        )}

        {inferences.length > 0 && (
          <div>
            <p className="eyebrow mb-2">Inferences</p>
            <ul className="space-y-2">
              {inferences.map((item) => (
                <EvidenceItem
                  key={item.id}
                  item={item}
                  byId={byId}
                  papersById={papersById}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}

/* --- product match (spec §21) --------------------------------------------- */

export function ProductMatch({ rows = [], productName }) {
  if (!rows.length) return null;
  const matched = rows.filter((r) => r.supported).length;

  return (
    <Card>
      <CardHeader
        title="Product match"
        note={`${matched} of ${rows.length} observed requirements are covered by ${productName || "your product"}`}
      />
      <ul className="divide-y divider">
        {rows.map((row) => (
          <li
            key={row.requirement}
            className="flex items-center gap-3 px-5 py-2.5 text-sm"
          >
            <span className={cn("min-w-0 flex-1", !row.supported && "muted")}>
              {row.requirement}
            </span>
            <span aria-hidden="true" className="muted">
              →
            </span>
            {row.supported ? (
              <span className="flex w-52 items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                <span aria-hidden="true">✓</span>
                <span className="truncate text-xs">{row.capability}</span>
              </span>
            ) : (
              <span className="w-52 text-xs muted">✕ not relevant</span>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* --- pain points (spec §20) ----------------------------------------------- */

export function PainPoints({ items = [] }) {
  if (!items.length) return null;

  return (
    <Card>
      <CardHeader
        title="Potential pain points"
        note="Items marked AI inference were not stated by the researcher"
      />
      <ul className="space-y-2 px-5 py-4">
        {items.map((item) => (
          <li key={item.text} className="flex items-start gap-2.5 text-sm">
            <span
              aria-hidden="true"
              className={cn(
                "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                item.inferred ? "bg-amber-500" : "bg-emerald-500",
              )}
            />
            <span className="min-w-0 flex-1">{item.text}</span>
            {item.inferred ? (
              <Pill className="bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20">
                AI inference
              </Pill>
            ) : (
              <Pill className="bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20">
                stated
              </Pill>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* --- "Why this lead?" (spec §18) ------------------------------------------ */

export function WhyThisLead({ score, evidence = [], leadId }) {
  if (!score) return null;

  const reasons = Object.values(score.components || {})
    .filter((c) => c.grounded && c.rationale)
    .map((c) => ({
      text: c.rationale,
      evidenceId: c.evidence_ids?.[0],
      label: c.label,
    }));

  if (!reasons.length) return null;
  const byId = Object.fromEntries(evidence.map((e) => [e.id, e]));

  return (
    <Card>
      <CardHeader title="Why this lead?" note={score.why_relevant} />
      <ul className="space-y-2.5 px-5 py-4">
        {reasons.map((reason) => {
          const source = byId[reason.evidenceId];
          return (
            <li key={reason.label} className="flex items-start gap-2.5 text-sm">
              <span
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
              >
                ✓
              </span>
              <span className="min-w-0 flex-1">
                {reason.text}
                {source && (
                  <Link
                    to={`/leads/${leadId}?tab=evidence`}
                    className="ml-1.5 text-xs text-accent-600 hover:underline dark:text-accent-400"
                  >
                    evidence
                  </Link>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
