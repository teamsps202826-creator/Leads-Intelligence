import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  addNote,
  generateOutreachDraft,
  getLead,
  listActivity,
  listNotes,
  setLeadStatus,
} from "../api/client";
import {
  cn,
  decimal,
  LEAD_STATUSES,
  num,
  percent,
  timeAgo,
  tierFor,
} from "../lib/format";
import {
  Banner,
  Button,
  Card,
  CardHeader,
  ErrorState,
  Modal,
  Pill,
  Select,
  Skeleton,
  Tabs,
  Textarea,
  useAsync,
  useToast,
} from "../components/ui";
import {
  ConfidenceMeter,
  EvidenceList,
  PainPoints,
  ProductMatch,
  ScoreBreakdown,
  ScoreDial,
  TierChip,
  WhyThisLead,
} from "../components/score";

/* --- header --------------------------------------------------------------- */

const CONTACT_LINKS = [
  ["website", "🌐", "Website"],
  ["scholar", "🎓", "Google Scholar"],
  ["github", "⌨", "GitHub"],
];

function linkedinSearchUrl(lead) {
  const terms = [`"${lead.name}"`, lead.institution && `"${lead.institution}"`, "site:linkedin.com"]
    .filter(Boolean)
    .join(" ");
  return `https://www.google.com/search?q=${encodeURIComponent(terms)}`;
}

function ProfileHeader({ lead }) {
  const score = lead.latest_score;

  return (
    <Card className="mb-6 overflow-hidden">
      <div className="flex flex-wrap gap-6 p-6">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-ink-200 text-lg font-semibold dark:bg-ink-800">
              {lead.name
                .split(" ")
                .map((part) => part[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight">{lead.name}</h1>
              {lead.position && <p className="text-sm">{lead.position}</p>}
              <p className="text-sm muted">
                {lead.institution || "Institution unknown"}
                {lead.department && ` · ${lead.department}`}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {lead.country && <Pill>{lead.country}</Pill>}
                {lead.seniority && <Pill>{lead.seniority}</Pill>}
                {lead.task_name && (
                  <Pill className="bg-accent-500/10 text-accent-700 ring-1 ring-accent-500/20">
                    {lead.task_name}
                  </Pill>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            {lead.email ? (
              <span className="flex items-center gap-1.5">
                <span aria-hidden="true">📧</span>
                <a
                  href={`mailto:${lead.email}`}
                  className="text-accent-600 hover:underline dark:text-accent-400"
                >
                  {lead.email}
                </a>
                <Pill className="bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20">
                  {lead.email_method === "published_affiliation"
                    ? "from their paper"
                    : lead.email_method}
                </Pill>
              </span>
            ) : (
              <span className="text-xs muted">
                📧 No address could be attributed to this researcher
              </span>
            )}

            {lead.orcid && (
              <a
                href={`https://orcid.org/${lead.orcid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-600 hover:underline dark:text-accent-400"
              >
                🆔 ORCID
              </a>
            )}

            {lead.linkedin ? (
              <a
                href={lead.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-600 hover:underline dark:text-accent-400"
              >
                🔗 LinkedIn
              </a>
            ) : (
              <a
                href={linkedinSearchUrl(lead)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-600 hover:underline dark:text-accent-400"
                title="Opens a Google search for this person's LinkedIn profile — not an automatic lookup"
              >
                🔗 Search LinkedIn
              </a>
            )}

            {CONTACT_LINKS.map(([key, glyph, label]) =>
              lead[key] ? (
                <a
                  key={key}
                  href={lead[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-600 hover:underline dark:text-accent-400"
                >
                  {glyph} {label}
                </a>
              ) : null,
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-5 border-t divider pt-5 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
          <ScoreDial score={score?.score ?? lead.score} band={score?.band ?? lead.band} />
          <div className="space-y-3">
            <div>
              <p className="eyebrow">Customer potential</p>
              <div className="mt-1">
                <TierChip band={score?.band ?? lead.band} />
              </div>
            </div>
            <ConfidenceMeter confidence={score?.confidence ?? lead.confidence} />
          </div>
        </div>
      </div>

      {lead.unattributed_contacts?.length > 0 && (
        <div className="border-t divider px-6 py-4">
          <Banner tone="caution" icon="✉" title={`${lead.unattributed_contacts.length} address(es) found but not attributed`}>
            These appeared in this researcher's papers but could not be tied to
            them specifically. Corresponding-author addresses sit inside
            colleagues' affiliation strings, so guessing here misdirects mail to
            a real person.
            <ul className="mt-2 space-y-2">
              {lead.unattributed_contacts.map((contact) => (
                <li key={contact.email}>
                  <span className="font-mono text-xs">{contact.email}</span>
                  {contact.reason && (
                    <span className="block text-xs muted">{contact.reason}</span>
                  )}
                </li>
              ))}
            </ul>
          </Banner>
        </div>
      )}
    </Card>
  );
}

/* --- overview tab --------------------------------------------------------- */

function ResearchProfile({ lead }) {
  return (
    <Card>
      <CardHeader title="Research profile" />
      <div className="space-y-5 px-5 py-5">
        {lead.research_interests?.length > 0 && (
          <div>
            <p className="eyebrow mb-2">Research interests</p>
            <div className="flex flex-wrap gap-1.5">
              {lead.research_interests.map((interest) => (
                <Pill key={interest} className="bg-accent-500/10 text-accent-700 ring-1 ring-accent-500/20">
                  {interest}
                </Pill>
              ))}
            </div>
          </div>
        )}

        {lead.research_summary && (
          <div>
            <p className="eyebrow mb-1.5 flex items-center gap-2">
              Research summary
              <Pill className="bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20">
                AI generated
              </Pill>
            </p>
            <p className="text-sm leading-relaxed">{lead.research_summary}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 border-t divider pt-4 sm:grid-cols-4">
          {[
            ["Papers on topic", num(lead.paper_count)],
            ["Recent papers", num(lead.recent_paper_count)],
            ["Citations", num(lead.total_citations)],
            [
              "Active years",
              [lead.first_year, lead.last_year].filter(Boolean).join("–") || "—",
            ],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="eyebrow">{label}</p>
              <p className="tnum mt-0.5 text-lg font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function RecommendedAction({ lead, onDraft, drafting }) {
  const score = lead.latest_score;
  if (!score?.recommended_action) return null;
  const tier = tierFor(score.band);

  return (
    <Card>
      <CardHeader title="Recommended action" />
      <div className="px-5 py-5">
        <div className="mb-3 flex items-center gap-2">
          <span aria-hidden="true">{tier.mark}</span>
          <span className={cn("text-sm font-semibold", tier.text)}>
            {score.band === "High" ? "High priority" : `${tier.label} priority`}
          </span>
        </div>
        <p className="text-sm leading-relaxed">{score.recommended_action}</p>

        {score.outreach_angle && (
          <div className="surface-muted mt-4 px-4 py-3">
            <p className="eyebrow mb-1">Angle</p>
            <p className="text-sm">{score.outreach_angle}</p>
          </div>
        )}

        {score.objections?.length > 0 && (
          <div className="mt-4">
            <p className="eyebrow mb-1.5">Likely objections</p>
            <ul className="list-disc space-y-1 pl-4 text-sm muted">
              {score.objections.map((objection) => (
                <li key={objection}>{objection}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button variant="primary" loading={drafting} onClick={onDraft}>
            Generate Outreach Draft
          </Button>
          <p className="text-xs muted">
            Creates a draft for you to review. This build cannot send anything.
          </p>
        </div>
      </div>
    </Card>
  );
}

/* --- papers tab ----------------------------------------------------------- */

const PAPER_SORTS = {
  newest: (a, b) => (b.publication_year ?? 0) - (a.publication_year ?? 0),
  oldest: (a, b) => (a.publication_year ?? 0) - (b.publication_year ?? 0),
  relevant: (a, b) => (b.product_relevance ?? 0) - (a.product_relevance ?? 0),
  cited: (a, b) => (b.cited_by_count ?? 0) - (a.cited_by_count ?? 0),
};

function PapersTab({ papers }) {
  const [sort, setSort] = useState("newest");
  const sorted = [...papers].sort(PAPER_SORTS[sort]);

  if (!papers.length) {
    return (
      <Card>
        <p className="px-5 py-10 text-center text-sm muted">
          No papers recorded for this researcher.
        </p>
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <p className="text-sm muted">
          {papers.length} paper{papers.length === 1 ? "" : "s"} discovered
        </p>
        <Select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="ml-auto w-auto"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="relevant">Most relevant</option>
          <option value="cited">Most cited</option>
        </Select>
      </div>

      <div className="space-y-3">
        {sorted.map((paper) => {
          const extracted = [
            ...(paper.methods || []).map((i) => ["method", i]),
            ...(paper.datasets || []).map((i) => ["dataset", i]),
            ...(paper.compute_signals || []).map((i) => ["compute", i]),
            ...(paper.pain_points || []).map((i) => ["pain point", i]),
          ];

          return (
            <Card key={paper.id} className="p-5">
              <div className="flex flex-wrap items-start gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium leading-snug">
                    {paper.url ? (
                      <a
                        href={paper.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-accent-700 dark:hover:text-accent-300"
                      >
                        {paper.title}
                      </a>
                    ) : (
                      paper.title
                    )}
                  </h3>
                  <p className="mt-1 text-xs muted">
                    {paper.publication_year} · {num(paper.cited_by_count)} citations
                    {paper.doi && ` · ${paper.doi}`}
                  </p>
                </div>
                {paper.product_relevance !== null &&
                  paper.product_relevance !== undefined && (
                    <div className="text-right">
                      <p className="eyebrow">Relevance</p>
                      <p className="tnum text-sm font-semibold">
                        {percent(paper.product_relevance)}
                      </p>
                    </div>
                  )}
              </div>

              {extracted.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {extracted.map(([kind, item]) => (
                    <Pill
                      key={`${kind}-${item.value}`}
                      title={item.quote ? `“${item.quote}”` : undefined}
                      className="cursor-help"
                    >
                      <span className="muted">{kind}:</span> {item.value}
                    </Pill>
                  ))}
                </div>
              )}

              {extracted.length > 0 && (
                <p className="mt-2 text-2xs muted">
                  Hover a tag to see the quote it was verified against.
                </p>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* --- workflow tab: status, notes, activity -------------------------------- */

function WorkflowTab({ leadId, status, onStatusChange }) {
  const toast = useToast();
  const notes = useAsync(() => listNotes(leadId), [leadId]);
  const activity = useAsync(() => listActivity(leadId), [leadId]);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  async function submitNote(event) {
    event.preventDefault();
    if (!draft.trim()) return;
    setSaving(true);
    try {
      await addNote(leadId, draft.trim());
      setDraft("");
      notes.refetch();
      activity.refetch();
      toast("Note added");
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-5">
        <Card>
          <CardHeader title="Status" note="Where this researcher sits in your pipeline." />
          <div className="px-5 py-5">
            <Select value={status} onChange={(e) => onStatusChange(e.target.value)}>
              {LEAD_STATUSES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
            <p className="mt-2 text-xs muted">
              Set by you, not by the model. The customer-potential score is a
              separate, independent judgement.
            </p>
          </div>
        </Card>

        <Card>
          <CardHeader title="Notes" />
          <div className="px-5 py-5">
            <form onSubmit={submitNote}>
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Met this researcher at CVPR 2026…"
              />
              <Button
                type="submit"
                className="mt-2"
                loading={saving}
                disabled={!draft.trim()}
              >
                Add Note
              </Button>
            </form>

            {notes.loading ? (
              <Skeleton className="mt-4 h-16 w-full" />
            ) : notes.data?.length ? (
              <ul className="mt-5 space-y-3">
                {notes.data.map((note) => (
                  <li key={note.id} className="surface-muted px-4 py-3">
                    <p className="text-sm">{note.text}</p>
                    <p className="mt-1 text-xs muted">
                      {note.author} · {timeAgo(note.created_at)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-5 text-sm muted">No notes yet.</p>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Activity" />
        <div className="px-5 py-5">
          {activity.loading ? (
            <Skeleton className="h-32 w-full" />
          ) : activity.data?.length ? (
            <ol className="relative space-y-4 border-l divider pl-5">
              {activity.data.map((event) => (
                <li key={event.id} className="relative">
                  <span className="absolute -left-[1.6rem] top-1.5 h-2 w-2 rounded-full bg-accent-500" />
                  <p className="text-sm">{event.text}</p>
                  <p className="text-xs muted">{timeAgo(event.at)}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm muted">No activity recorded.</p>
          )}
        </div>
      </Card>
    </div>
  );
}

/* --- page ----------------------------------------------------------------- */

export default function LeadProfile() {
  const { leadId } = useParams();
  const [params, setParams] = useSearchParams();
  const toast = useToast();
  const lead = useAsync(() => getLead(leadId), [leadId]);

  const [status, setStatus] = useState(null);
  const [drafting, setDrafting] = useState(false);
  const [draftOpen, setDraftOpen] = useState(false);
  const [draftContent, setDraftContent] = useState(null);

  const tab = params.get("tab") || "overview";
  const setTab = (id) => setParams(id === "overview" ? {} : { tab: id });

  async function changeStatus(next) {
    setStatus(next);
    try {
      await setLeadStatus(leadId, next);
      toast(`Status set to ${next}`);
    } catch (error) {
      toast(error.message, "error");
    }
  }

  async function draftOutreach() {
    setDrafting(true);
    try {
      setDraftContent(await generateOutreachDraft(leadId));
      setDraftOpen(true);
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setDrafting(false);
    }
  }

  if (lead.error) return <ErrorState error={lead.error} onRetry={lead.refetch} />;
  if (lead.loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  const data = lead.data;
  const score = data.latest_score;
  const currentStatus = status ?? data.status ?? "New";

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "evidence", label: "Evidence", count: data.evidence?.length || 0 },
    { id: "papers", label: "Papers", count: data.papers?.length || 0 },
    { id: "workflow", label: "Status & notes" },
  ];

  return (
    <>
      <Link
        to="/leads"
        className="mb-4 inline-block text-sm text-accent-600 hover:underline dark:text-accent-400"
      >
        ← Back to Leads
      </Link>

      <ProfileHeader lead={data} />

      {!score && (
        <Banner tone="caution" className="mb-6" icon="⚠" title="Not scored yet">
          This researcher was discovered but hasn't been analysed against your
          product. Run lead analysis on{" "}
          <Link to={`/tasks/${data.task_id}`} className="underline">
            {data.task_name || "the task"}
          </Link>
          .
        </Banner>
      )}

      <div className="mb-6">
        <Tabs tabs={tabs} active={tab} onChange={setTab} />
      </div>

      {tab === "overview" && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="space-y-5">
            <WhyThisLead score={score} evidence={data.evidence} leadId={leadId} />
            <ScoreBreakdown score={score} />
            <ProductMatch rows={data.product_match} productName={data.product_name} />
          </div>
          <div className="space-y-5">
            <ResearchProfile lead={data} />
            <RecommendedAction
              lead={data}
              onDraft={draftOutreach}
              drafting={drafting}
            />
            <PainPoints items={data.pain_points} />
            {data.signal_classification && (
              <Card>
                <CardHeader
                  title="Competitive signal"
                  note={data.signal_classification.bucket}
                />
                <div className="px-5 py-5">
                  <p className="text-sm">{data.signal_classification.reason}</p>
                  {data.signal_classification.caveat && (
                    <Banner tone="caution" className="mt-3" icon="⚠">
                      {data.signal_classification.caveat}
                    </Banner>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {tab === "evidence" && (
        <EvidenceList evidence={data.evidence} papers={data.papers} />
      )}

      {tab === "papers" && <PapersTab papers={data.papers || []} />}

      {tab === "workflow" && (
        <WorkflowTab
          leadId={leadId}
          status={currentStatus}
          onStatusChange={changeStatus}
        />
      )}

      <Modal
        open={draftOpen}
        onClose={() => setDraftOpen(false)}
        title="Outreach draft"
        description="Review and edit before sending from your own mail client. Nothing is sent from here."
        width="max-w-2xl"
      >
        {draftContent && (
          <div className="space-y-4">
            <div>
              <p className="eyebrow mb-1">Subject</p>
              <p className="surface-muted px-3 py-2 text-sm">{draftContent.subject}</p>
            </div>
            <div>
              <p className="eyebrow mb-1">Body</p>
              <Textarea
                rows={10}
                defaultValue={draftContent.body}
                className="font-mono text-xs"
              />
            </div>
            <Banner tone="info" icon="🔒">
              This build has no outbound path. Copy the draft into your own
              client when you're happy with it.
            </Banner>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setDraftOpen(false)}>Close</Button>
              <Button
                variant="primary"
                onClick={() => {
                  navigator.clipboard?.writeText(
                    `${draftContent.subject}\n\n${draftContent.body}`,
                  );
                  toast("Draft copied to clipboard");
                }}
              >
                Copy draft
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
