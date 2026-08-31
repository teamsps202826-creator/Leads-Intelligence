import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  deleteTask,
  getTask,
  getTaskOverview,
  listLeads,
  listRuns,
  runTask,
} from "../api/client";
import {
  cn,
  decimal,
  num,
  percent,
  stageProgress,
  TASK_STAGES,
  TASK_STATUS_STYLE,
  tierFor,
  timeAgo,
} from "../lib/format";
import {
  Banner,
  Button,
  Card,
  CardHeader,
  ConfirmDialog,
  ErrorState,
  Pill,
  ProgressBar,
  Section,
  Skeleton,
  StatTile,
  useAsync,
  useToast,
} from "../components/ui";
import { TierChip } from "../components/score";

/** Spec §30: a running task must show what it is doing, not just a spinner.
 *  The backend reports named stages rather than a percentage, so the bar is
 *  derived from stage position — and the copy says "stage 3 of 5" rather than
 *  implying a measured 60%. */
function RunningPanel({ task }) {
  const stage = task.progress?.stage;
  const index = TASK_STAGES.findIndex(([key]) => key === stage);

  return (
    <Card className="mb-6">
      <CardHeader title="Research in progress" note={task.name} />
      <div className="px-5 py-5">
        <ProgressBar value={stageProgress(stage)} />
        <p className="mt-2 text-sm muted">
          Stage {Math.max(1, index + 1)} of {TASK_STAGES.length}
        </p>

        <ol className="mt-5 space-y-2.5">
          {TASK_STAGES.map(([key, label], i) => {
            const done = index > i;
            const active = index === i;
            return (
              <li key={key} className="flex items-center gap-3 text-sm">
                <span
                  className={cn(
                    "grid h-5 w-5 shrink-0 place-items-center rounded-full text-2xs",
                    done && "bg-emerald-500/15 text-emerald-700",
                    active && "bg-accent-500/15 text-accent-700",
                    !done && !active && "bg-ink-200 muted dark:bg-ink-800",
                  )}
                >
                  {done ? "✓" : i + 1}
                </span>
                <span className={cn(!done && !active && "muted")}>{label}</span>
                {active && (
                  <span className="ml-1 h-1.5 w-1.5 animate-pulse rounded-full bg-accent-500" />
                )}
              </li>
            );
          })}
        </ol>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <StatTile label="Papers found" value={num(task.progress?.papers)} />
          <StatTile label="Authors found" value={num(task.progress?.leads)} />
          <StatTile label="Profiles enriched" value={num(task.progress?.enriched)} />
        </div>
      </div>
    </Card>
  );
}

export default function TaskDetail() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const task = useAsync(() => getTask(taskId), [taskId]);
  // Re-keyed on status so a transition (queued -> running -> succeeded)
  // pulls fresh results the moment a run finishes, not just on page load.
  const overview = useAsync(
    () => getTaskOverview(taskId),
    [taskId, task.data?.status],
  );
  const leads = useAsync(
    () => listLeads({ task_id: taskId, limit: 8 }),
    [taskId, task.data?.status],
  );
  const runs = useAsync(() => listRuns(taskId), [taskId, task.data?.status]);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [starting, setStarting] = useState(false);

  const liveStatus = task.data?.status;
  const isRunning = liveStatus === "running" || liveStatus === "queued";

  // The backend runs mining as a background job — poll while it's live so
  // progress and, once it finishes, results show up without a manual reload.
  useEffect(() => {
    if (!isRunning) return undefined;
    const timer = setInterval(() => task.refetch(), 2500);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  if (task.error) return <ErrorState error={task.error} onRetry={task.refetch} />;
  if (task.loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  const data = task.data;
  const running = isRunning;
  const stats = overview.data;

  async function handleRun() {
    setStarting(true);
    try {
      await runTask(taskId);
      toast(data.status === "pending" ? "Research mining started" : "Re-run started");
      task.refetch();
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setStarting(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteTask(taskId);
      toast("Task deleted");
      navigate(`/products/${data.product_id}`);
    } catch (error) {
      toast(error.message, "error");
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="mb-6">
        <Link
          to={data.product_id ? `/products/${data.product_id}` : "/"}
          className="text-sm text-accent-600 hover:underline dark:text-accent-400"
        >
          ← {data.product_id ? data.product_name || "Back to product" : "Back to home"}
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{data.name}</h1>
          <Pill className={TASK_STATUS_STYLE[data.status]}>{data.status}</Pill>
          <div className="ml-auto flex gap-2">
            <Button
              variant="primary"
              size="sm"
              loading={starting}
              disabled={running}
              title={running ? "Already running" : undefined}
              onClick={handleRun}
            >
              {data.status === "pending" ? "Run" : "Re-run"}
            </Button>
            <Link
              to={`/tasks/${data.id}/edit`}
              aria-disabled={running}
              onClick={(e) => running && e.preventDefault()}
              title={running ? "Wait for the task to finish before editing" : undefined}
            >
              <Button size="sm" disabled={running}>
                Edit
              </Button>
            </Link>
            <Button
              variant="danger"
              size="sm"
              disabled={running}
              title={running ? "Wait for the task to finish before deleting" : undefined}
              onClick={() => setConfirmingDelete(true)}
            >
              Delete
            </Button>
          </div>
        </div>
        <p className="mt-1 text-sm muted">
          {(data.keywords || []).join(", ")}
          {data.year_from && ` · from ${data.year_from}`}
          {" · "}
          {(data.sources || []).join(", ")}
        </p>
      </div>

      {!data.product_id && (
        <Banner tone="info" className="mb-6" icon="ℹ" title="No product attached">
          This task mines papers and authors only — there's no product
          profile to score leads against, so potential, confidence and band
          stay empty below.
        </Banner>
      )}

      {data.error && (
        <Banner tone="danger" className="mb-6" icon="✕" title="This task failed">
          {data.error}
        </Banner>
      )}

      {running && <RunningPanel task={data} />}

      {!running && stats && (
        <>
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <StatTile label="Papers" value={num(stats.papers)} />
            <StatTile label="Leads" value={num(stats.leads)} />
            <StatTile label="Scored" value={num(stats.scored)} />
            <StatTile label="High potential" value={num(stats.bands?.High)} />
            <StatTile label="With email" value={num(stats.with_email)} />
            <StatTile
              label="Mean confidence"
              value={decimal(stats.mean_confidence)}
              tone={stats.mean_confidence < 0.5 ? "muted" : "default"}
            />
          </div>

          {stats.relevance?.analyzed > 0 && (
            <p className="mb-6 text-xs muted">
              Per-paper extraction: {num(stats.relevance.analyzed)} of{" "}
              {num(stats.relevance.papers)} papers analysed ·{" "}
              {num(stats.relevance.above_threshold)} above the{" "}
              {stats.relevance.threshold} relevance threshold · mean relevance{" "}
              {decimal(stats.relevance.mean_relevance)} ·{" "}
              {num(stats.relevance.grounded_items)} verified extractions
            </p>
          )}
        </>
      )}

      <Section
        eyebrow="Results"
        title="Top leads"
        actions={
          <Link to={`/leads?task=${taskId}`}>
            <Button>View all leads</Button>
          </Link>
        }
      >
        <Card className="overflow-hidden">
          {leads.loading ? (
            <Skeleton className="m-5 h-24" />
          ) : !leads.data?.length ? (
            <p className="px-5 py-10 text-center text-sm muted">
              {running
                ? "Leads appear as the scan progresses."
                : "No leads produced by this task."}
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b divider">
                  {["Researcher", "Institution", "Papers", "Potential", "Confidence"].map(
                    (head, i) => (
                      <th
                        key={head}
                        className={cn(
                          "eyebrow px-5 py-2.5 text-left font-semibold",
                          i === 2 && "text-right",
                        )}
                      >
                        {head}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {leads.data.map((lead) => (
                  <tr key={lead.id} className="border-b divider last:border-0">
                    <td className="px-5 py-3">
                      <Link
                        to={`/leads/${lead.id}`}
                        className="font-medium hover:text-accent-700 dark:hover:text-accent-300"
                      >
                        {lead.name}
                      </Link>
                    </td>
                    <td className="max-w-[16rem] truncate px-5 py-3 muted">
                      {lead.institution || "—"}
                    </td>
                    <td className="tnum px-5 py-3 text-right">
                      {num(lead.paper_count)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "tnum mr-2 font-semibold",
                          tierFor(lead.band).text,
                        )}
                      >
                        {lead.score === null ? "—" : Math.round(lead.score)}
                      </span>
                      <TierChip band={lead.band} />
                    </td>
                    <td className="tnum px-5 py-3 muted">
                      {decimal(lead.confidence)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </Section>

      <Section eyebrow="Provenance" title="Analysis runs">
        <Card className="overflow-hidden">
          {runs.loading ? (
            <Skeleton className="m-5 h-16" />
          ) : !runs.data?.length ? (
            <p className="px-5 py-8 text-center text-sm muted">No runs yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b divider">
                  {["Run", "Status", "Model", "Versions", "Started", "Stats"].map(
                    (head) => (
                      <th
                        key={head}
                        className="eyebrow px-5 py-2.5 text-left font-semibold"
                      >
                        {head}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {runs.data.map((run) => {
                  const dropped = run.stats?.items_dropped_unverified || 0;
                  return (
                    <tr key={run.id} className="border-b divider last:border-0">
                      <td className="px-5 py-3 font-medium">{run.kind}</td>
                      <td className="px-5 py-3">
                        <Pill className={TASK_STATUS_STYLE[run.status]}>
                          {run.status}
                        </Pill>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs muted">
                        {run.model}
                      </td>
                      <td className="px-5 py-3 font-mono text-xs muted">
                        p{run.prompt_version} / s{run.scoring_version}
                      </td>
                      <td className="px-5 py-3 text-xs muted">
                        {timeAgo(run.started_at)}
                      </td>
                      <td className="px-5 py-3 text-xs muted">
                        {Object.entries(run.stats || {})
                          .map(([key, value]) => `${key}=${value}`)
                          .join(" · ")}
                        {dropped > 0 && (
                          <Pill className="ml-2 bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20">
                            {dropped} dropped unverified
                          </Pill>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>
        <p className="mt-2 text-xs muted">
          Every run is stamped with its model and prompt version, so any score
          can be reproduced. A rising <em>dropped unverified</em> count means
          extractions are failing their quote check — worth investigating, not
          ignoring.
        </p>
      </Section>

      <ConfirmDialog
        open={confirmingDelete}
        onClose={() => setConfirmingDelete(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title={`Delete ${data.name}?`}
        description="This permanently deletes the task and everything it found — papers, leads, evidence and scores. This cannot be undone."
        confirmLabel="Delete task"
      />
    </>
  );
}
