import { Link, useNavigate } from "react-router-dom";
import { listProducts } from "../api/client";
import { firstN, timeAgo } from "../lib/format";
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Pill,
  Section,
  Skeleton,
  useAsync,
} from "../components/ui";

function ProductCard({ product }) {
  const [keywords, extra] = firstN(product.research_keywords, 4);
  const [roles] = firstN(product.target_roles, 2);

  return (
    <Card className="flex flex-col p-5 transition-shadow hover:shadow-lift">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold">{product.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm muted">
            {product.short_description || "No description yet."}
          </p>
        </div>
        {product.intelligence ? (
          <Pill className="bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20">
            profiled
          </Pill>
        ) : (
          <Pill className="bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20">
            no profile
          </Pill>
        )}
      </div>

      {roles.length > 0 && (
        <p className="mt-3 text-xs muted">
          <span className="font-medium">Target:</span> {roles.join(", ")}
        </p>
      )}

      {keywords.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {keywords.map((word) => (
            <Pill key={word}>{word}</Pill>
          ))}
          {extra > 0 && <Pill className="muted">+{extra}</Pill>}
        </div>
      )}

      <div className="mt-auto flex items-center gap-2 pt-5">
        <Link to={`/products/${product.id}`}>
          <Button size="sm">View</Button>
        </Link>
        <Link to={`/products/${product.id}/edit`}>
          <Button size="sm" variant="ghost">
            Edit
          </Button>
        </Link>
        <span className="ml-auto text-xs muted">{timeAgo(product.created_at)}</span>
      </div>
    </Card>
  );
}

export default function Products() {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useAsync(listProducts, []);

  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <Section
      eyebrow="Step 1"
      title="Products"
      description="What are you selling? Every researcher is scored against this description."
      actions={
        <Button variant="primary" onClick={() => navigate("/products/new")}>
          + Create Product
        </Button>
      }
    >
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="mt-2 h-3 w-full" />
              <Skeleton className="mt-1.5 h-3 w-2/3" />
              <Skeleton className="mt-6 h-8 w-24" />
            </Card>
          ))}
        </div>
      ) : !data.length ? (
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
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </Section>
  );
}
