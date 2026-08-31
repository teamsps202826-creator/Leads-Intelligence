import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  deleteProduct,
  generateIntelligence,
  getProduct,
  listTasks,
} from "../api/client";
import {
  cn,
  num,
  stageProgress,
  TASK_STATUS_STYLE,
  timeAgo,
} from "../lib/format";
import {
  Banner,
  Button,
  Card,
  CardHeader,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Pill,
  ProgressBar,
  Section,
  Skeleton,
  useAsync,
  useToast,
} from "../components/ui";

function Bullets({ label, items }) {
  if (!items?.length) return null;
  return (
    <div>
      <p className="eyebrow mb-1.5">{label}</p>
      <ul className="list-disc space-y-1 pl-4 text-sm">
        {items.map((item) => (
          <li key={typeof item === "string" ? item : item.name}>
            {typeof item === "string" ? (
              item
            ) : (
              <>
                <span className="font-medium">{item.name}</span>
                {item.description && <span className="muted"> — {item.description}</span>}
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function IntelligencePanel({ product, onGenerate, generating }) {
  if (!product.intelligence) {
    return (
      <Card>
        <CardHeader title="Product Intelligence Profile" />
        <div className="px-5 py-5">
          <Banner tone="caution" icon="⚠">
            No profile yet. Researchers cannot be scored until one exists — it is
            what “relevant” gets measured against.
          </Banner>
          <Button
            variant="primary"
            className="mt-4"
            loading={generating}
            onClick={onGenerate}
          >
            Generate profile
          </Button>
        </div>
      </Card>
    );
  }

  const profile = product.intelligence;
  return (
    <Card>
      <CardHeader
        title="Product Intelligence Profile"
        note={`${product.intelligence_model} · ${timeAgo(product.intelligence_generated_at)}`}
        actions={
          <Button size="sm" loading={generating} onClick={onGenerate}>
            Regenerate
          </Button>
        }
      />
      <div className="px-5 py-5">
        {profile.summary && (
          <p className="mb-5 text-sm leading-relaxed">{profile.summary}</p>
        )}
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-5">
            <Bullets label="Capabilities" items={profile.capabilities} />
            <Bullets label="Pain points" items={profile.pain_points} />
            <Bullets label="Target customers" items={profile.target_customers} />
          </div>
          <div className="space-y-5">
            <Bullets label="Research signals to look for" items={profile.research_signals} />
            <Bullets label="Positive signals" items={profile.positive_signals} />
            <Bullets label="Negative signals" items={profile.negative_signals} />
            <Bullets label="Technical requirements" items={profile.technical_requirements} />
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [generating, setGenerating] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const product = useAsync(() => getProduct(productId), [productId]);
  const tasks = useAsync(() => listTasks({ product_id: productId }), [productId]);

  async function generate() {
    setGenerating(true);
    try {
      await generateIntelligence(productId);
      toast("Product intelligence profile generated");
      product.refetch();
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setGenerating(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteProduct(productId);
      toast("Product deleted");
      navigate("/products");
    } catch (error) {
      toast(error.message, "error");
      setDeleting(false);
    }
  }

  if (product.error) return <ErrorState error={product.error} onRetry={product.refetch} />;
  if (product.loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  const data = product.data;

  return (
    <>
      <div className="mb-6">
        <Link to="/products" className="text-sm text-accent-600 hover:underline dark:text-accent-400">
          ← Back to products
        </Link>
        <div className="mt-2 flex flex-wrap items-start gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold tracking-tight">{data.name}</h1>
            <p className="mt-1 text-sm muted">{data.short_description}</p>
          </div>
          <div className="flex gap-2">
            <Link to={`/products/${productId}/edit`}>
              <Button>Edit</Button>
            </Link>
            <Button variant="danger" onClick={() => setConfirmingDelete(true)}>
              Delete
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate(`/tasks/new?product=${productId}`)}
            >
              + Add Research Task
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <IntelligencePanel
          product={data}
          onGenerate={generate}
          generating={generating}
        />
      </div>

      <Section eyebrow="Step 2" title="Research tasks">
        <Card className="overflow-hidden">
          {tasks.loading ? (
            <div className="p-5">
              <Skeleton className="h-4 w-48" />
            </div>
          ) : !tasks.data.length ? (
            <EmptyState
              icon="🔍"
              title="No research tasks yet"
              description="Create a task to start discovering potential customers for this product."
              action={
                <Button
                  variant="primary"
                  onClick={() => navigate(`/tasks/new?product=${productId}`)}
                >
                  + Add Research Task
                </Button>
              }
            />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b divider">
                  {["Task", "Status", "Keywords", "Papers", "Leads", "Created"].map(
                    (head, i) => (
                      <th
                        key={head}
                        className={cn(
                          "eyebrow px-5 py-2.5 text-left font-semibold",
                          i >= 3 && "text-right",
                        )}
                      >
                        {head}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {tasks.data.map((task) => (
                  <tr key={task.id} className="border-b divider last:border-0">
                    <td className="px-5 py-3">
                      <Link
                        to={`/tasks/${task.id}`}
                        className="font-medium hover:text-accent-700 dark:hover:text-accent-300"
                      >
                        {task.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <Pill className={TASK_STATUS_STYLE[task.status]}>
                        {task.status}
                      </Pill>
                      {(task.status === "running" || task.status === "queued") && (
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
                    <td className="px-5 py-3 text-right text-xs muted">
                      {timeAgo(task.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </Section>

      <ConfirmDialog
        open={confirmingDelete}
        onClose={() => setConfirmingDelete(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title={`Delete ${data.name}?`}
        description="This permanently deletes the product and everything mined for it — tasks, papers, leads, evidence and scores. This cannot be undone."
        confirmLabel="Delete product"
      />
    </>
  );
}
