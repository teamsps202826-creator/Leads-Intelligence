import { Link, useNavigate } from "react-router-dom";
import { getDashboard, listProducts } from "../api/client";
import {
  cn,
  greeting,
  num,
  decimal,
  timeAgo,
  TASK_STATUS_STYLE,
  stageProgress,
} from "../lib/format";
import {
  Banner,
  Button,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  Pill,
  ProgressBar,
  Section,
  Skeleton,
  StatTile,
  TableSkeleton,
  useAsync,
} from "../components/ui";

/** The one action the whole product exists to start. Deliberately the largest
 *  thing on the page — spec §3. */
function StartTaskHero({ hasProduct }) {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden rounded-2xl border border-accent-500/25 bg-gradient-to-br from-accent-500/[0.09] via-accent-500/[0.04] to-transparent p-6 sm:p-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent-500/10 blur-2xl"
      />
      <div className="relative flex flex-wrap items-center gap-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Find researchers who need your product
          </h2>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed muted">
            Describe what you are looking for. We mine the literature, resolve
            the authors behind it, and score each one as a potential customer —
            with the evidence attached.
          </p>
          {!hasProduct && (
            <p className="mt-3 text-xs text-amber-700 dark:text-amber-400">
              You need a product first — it is what every score is measured
              against.
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <Button
            size="lg"
            variant="primary"
            onClick={() => navigate(hasProduct ? "/tasks/new" : "/products/new")}
          >
            + Add Research Task
          </Button>
          {hasProduct && (
            <Link
              to="/products/new"
              className="text-center text-xs text-accent-700 hover:underline dark:text-accent-300"
            >
              or add another product
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function TaskRow({ task }) {
  const running = task.status === "running" || task.status === "queued";
  return (
    <tr className="border-b divider last:border-0">
      <td className="px-5 py-3">
        <Link
          to={`/tasks/${task.id}`}
          className="font-medium hover:text-accent-700 dark:hover:text-accent-300"
        >
          {task.name}
        </Link>
        <p className="text-xs muted">{task.product_name || "No product"}</p>
      </td>
      <td className="px-5 py-3">
        <Pill className={TASK_STATUS_STYLE[task.status]}>{task.status}</Pill>
        {running && (
          <div className="mt-1.5 w-28">
            <ProgressBar value={stageProgress(task.progress?.stage)} className="h-1" />
          </div>
        )}
      </td>
      <td className="tnum px-5 py-3 text-right">{num(task.papers)}</td>
      <td className="tnum px-5 py-3 text-right">{num(task.leads)}</td>
      <td className="px-5 py-3 text-right text-xs muted">
        {timeAgo(task.created_at)}
      </td>
    </tr>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const dashboard = useAsync(getDashboard, []);
  const products = useAsync(listProducts, []);

  const data = dashboard.data;
  const hasProduct = (products.data?.length ?? 0) > 0;
  const loading = dashboard.loading || products.loading;

  if (dashboard.error) {
    return <ErrorState error={dashboard.error} onRetry={dashboard.refetch} />;
  }

  return (
    <>
      <div className="mb-7">
        <p className="text-sm muted">{greeting()}</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Which researchers should you talk to?
        </h1>
      </div>

      <div className="mb-8">
        <StartTaskHero hasProduct={hasProduct} />
      </div>

      <Section eyebrow="Overview" title="Your pipeline">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="surface px-4 py-3.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="mt-2 h-7 w-12" />
              </div>
            ))
          ) : (
            <>
              <StatTile label="Products" value={num(data.products)} icon="📦" />
              <StatTile label="Tasks" value={num(data.tasks)} icon="🔍" />
              <StatTile label="Papers" value={num(data.papers)} icon="📄" />
              <StatTile label="Leads" value={num(data.leads)} icon="👤" />
              <StatTile
                label="High potential"
                value={num(data.high_potential)}
                hint={`of ${num(data.scored)} scored`}
                icon="🔥"
              />
              <StatTile
                label="Mean confidence"
                value={decimal(data.mean_confidence)}
                hint="evidence coverage"
                tone={data.mean_confidence < 0.5 ? "muted" : "default"}
              />
            </>
          )}
        </div>

        {!loading && data.mean_confidence < 0.5 && (
          <Banner tone="caution" className="mt-3" icon="⚠" title="Thin evidence">
            On average fewer than half the scoring components had surviving
            evidence. Treat the scores as a ranking hint, not a measurement, and
            open the breakdown before acting on one.
          </Banner>
        )}
      </Section>

      <Section
        eyebrow="Activity"
        title="Recent tasks"
        actions={
          hasProduct && (
            <Button onClick={() => navigate("/tasks/new")}>
              + Add Research Task
            </Button>
          )
        }
      >
        <Card className="overflow-hidden">
          {loading ? (
            <TableSkeleton rows={4} cols={5} />
          ) : !data.recent_tasks.length ? (
            <EmptyState
              icon="🔍"
              title="No research tasks yet"
              description="Create a task to start discovering potential customers."
              action={
                <Button variant="primary" onClick={() => navigate("/tasks/new")}>
                  + Add Research Task
                </Button>
              }
            />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b divider">
                  {["Task", "Status", "Papers", "Leads", "Created"].map((head, i) => (
                    <th
                      key={head}
                      className={cn(
                        "eyebrow px-5 py-2.5 text-left font-semibold",
                        i >= 2 && "text-right",
                      )}
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.recent_tasks.map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </Section>

      {!loading && !hasProduct && (
        <EmptyState
          icon="📦"
          title="You haven't created a product yet"
          description="Create your first product so we can find researchers who may need it."
          action={
            <Button variant="primary" onClick={() => navigate("/products/new")}>
              + Create Product
            </Button>
          }
        />
      )}
    </>
  );
}
