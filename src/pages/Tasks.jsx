import { Link, useNavigate } from "react-router-dom";
import { listTasks } from "../api/client";
import { cn, num, stageProgress, TASK_STATUS_STYLE, timeAgo } from "../lib/format";
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Pill,
  ProgressBar,
  Section,
  TableSkeleton,
  useAsync,
} from "../components/ui";

const HEADS = ["Task", "Product", "Status", "Keywords", "Papers", "Leads", "Created", ""];

export default function Tasks() {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useAsync(() => listTasks(), []);

  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <Section
      eyebrow="Mining"
      title="Research tasks"
      description="Every scan you've run — a product is optional; a task with none mines papers and authors but scores nothing."
      actions={
        <Button variant="primary" onClick={() => navigate("/tasks/new")}>
          + Add Research Task
        </Button>
      }
    >
      <Card className="overflow-hidden">
        {loading ? (
          <TableSkeleton rows={6} cols={7} />
        ) : !data.length ? (
          <EmptyState
            icon="🔍"
            title="No research tasks yet"
            description="Create a task to start discovering potential customers — a product is optional."
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
                {HEADS.map((head, i) => (
                  <th
                    key={head || i}
                    className={cn(
                      "eyebrow px-5 py-2.5 text-left font-semibold",
                      (i === 4 || i === 5) && "text-right",
                    )}
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((task) => {
                const running = task.status === "running" || task.status === "queued";
                return (
                  <tr key={task.id} className="border-b divider last:border-0">
                    <td className="px-5 py-3">
                      <Link
                        to={`/tasks/${task.id}`}
                        className="font-medium hover:text-accent-700 dark:hover:text-accent-300"
                      >
                        {task.name}
                      </Link>
                    </td>
                    <td className="max-w-[12rem] truncate px-5 py-3 muted">
                      {task.product_id ? (
                        <Link
                          to={`/products/${task.product_id}`}
                          className="hover:underline"
                        >
                          {task.product_name || "—"}
                        </Link>
                      ) : (
                        "No product"
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <Pill className={TASK_STATUS_STYLE[task.status]}>
                        {task.status}
                      </Pill>
                      {running && (
                        <ProgressBar
                          value={stageProgress(task.progress?.stage)}
                          className="mt-1.5 h-1 w-24"
                        />
                      )}
                    </td>
                    <td className="max-w-[16rem] truncate px-5 py-3 muted">
                      {(task.keywords || []).join(", ")}
                    </td>
                    <td className="tnum px-5 py-3 text-right">
                      {num(task.progress?.papers)}
                    </td>
                    <td className="tnum px-5 py-3 text-right">
                      {num(task.progress?.leads)}
                    </td>
                    <td className="px-5 py-3 text-xs muted">
                      {timeAgo(task.created_at)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link to={`/tasks/${task.id}/edit`}>
                        <Button size="sm" variant="ghost">
                          Edit
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </Section>
  );
}
