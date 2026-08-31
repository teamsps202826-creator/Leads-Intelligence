import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { leadsCsvUrl, listLeads, listProducts, listTasks } from "../api/client";
import {
  BAND_ORDER,
  cn,
  decimal,
  firstN,
  LEAD_STATUSES,
  num,
  tierFor,
} from "../lib/format";
import {
  Banner,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  Pill,
  Section,
  Select,
  TableSkeleton,
  useAsync,
} from "../components/ui";
import { TierChip } from "../components/score";

const SENIORITIES = ["PI / senior", "student / postdoc", "unclear"];

/* --- filters -------------------------------------------------------------- */

function Filters({ value, onChange, products, tasks, onReset, activeCount }) {
  const set = (key) => (e) => onChange({ ...value, [key]: e.target.value });

  return (
    <Card className="mb-4 p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className="eyebrow mb-1 block">Customer potential</span>
          <Select value={value.band} onChange={set("band")}>
            <option value="">All</option>
            {BAND_ORDER.map((band) => (
              <option key={band} value={band}>
                {tierFor(band).mark} {tierFor(band).label}
              </option>
            ))}
          </Select>
        </label>

        <label className="block">
          <span className="eyebrow mb-1 block">Product</span>
          <Select value={value.product_id} onChange={set("product_id")}>
            <option value="">All products</option>
            {(products || []).map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </Select>
        </label>

        <label className="block">
          <span className="eyebrow mb-1 block">Task</span>
          <Select value={value.task_id} onChange={set("task_id")}>
            <option value="">All tasks</option>
            {(tasks || []).map((task) => (
              <option key={task.id} value={task.id}>
                {task.name}
              </option>
            ))}
          </Select>
        </label>

        <label className="block">
          <span className="eyebrow mb-1 block">Seniority</span>
          <Select value={value.seniority} onChange={set("seniority")}>
            <option value="">Any</option>
            {SENIORITIES.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </Select>
        </label>

        <label className="block">
          <span className="eyebrow mb-1 block">Country</span>
          <Input
            value={value.country}
            onChange={set("country")}
            placeholder="ISO-2, e.g. US"
          />
        </label>

        <label className="block">
          <span className="eyebrow mb-1 block">Pipeline status</span>
          <Select value={value.status} onChange={set("status")}>
            <option value="">Any</option>
            {LEAD_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </label>

        <label className="block">
          <span className="eyebrow mb-1 block">Minimum score</span>
          <Input
            type="number"
            min={0}
            max={100}
            value={value.min_score}
            onChange={set("min_score")}
            placeholder="0"
          />
        </label>

        <label className="block">
          <span className="eyebrow mb-1 block">Sort by</span>
          <Select value={value.sort} onChange={set("sort")}>
            <option value="score">Customer potential</option>
            <option value="papers">Papers</option>
            <option value="citations">Citations</option>
            <option value="name">Name</option>
          </Select>
        </label>
      </div>

      {activeCount > 0 && (
        <div className="mt-3 flex items-center gap-3 border-t divider pt-3">
          <p className="text-xs muted">
            {activeCount} filter{activeCount === 1 ? "" : "s"} active
          </p>
          <Button size="sm" variant="ghost" onClick={onReset} className="ml-auto">
            Clear all
          </Button>
        </div>
      )}
    </Card>
  );
}

/* --- table view ----------------------------------------------------------- */

function LeadTable({ leads }) {
  const columns = [
    "Researcher",
    "Institution",
    "Research",
    "Papers",
    "Potential",
    "Confidence",
    "Status",
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b divider">
            {columns.map((head, i) => (
              <th
                key={head}
                className={cn(
                  "eyebrow whitespace-nowrap px-4 py-2.5 text-left font-semibold",
                  i === 3 && "text-right",
                )}
              >
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const tier = tierFor(lead.band);
            const [interests, extra] = firstN(lead.interests, 2);
            return (
              <tr
                key={lead.id}
                className="group border-b divider last:border-0 hover:bg-accent-500/[0.04]"
              >
                <td className="px-4 py-3">
                  <Link to={`/leads/${lead.id}`} className="block">
                    <span className="font-medium group-hover:text-accent-700 dark:group-hover:text-accent-300">
                      {lead.name}
                    </span>
                    <span className="block text-xs muted">
                      {lead.position || lead.seniority || "Role unknown"}
                      {lead.email && <span className="ml-1.5">· ✉</span>}
                    </span>
                  </Link>
                </td>
                <td className="max-w-[15rem] px-4 py-3">
                  <span className="block truncate">
                    {lead.institution || <span className="muted">—</span>}
                  </span>
                  <span className="text-xs muted">{lead.country || ""}</span>
                </td>
                <td className="max-w-[14rem] px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {interests.map((interest) => (
                      <Pill key={interest}>{interest}</Pill>
                    ))}
                    {extra > 0 && <Pill className="muted">+{extra}</Pill>}
                  </div>
                </td>
                <td className="tnum px-4 py-3 text-right">
                  {num(lead.paper_count)}
                  <span className="block text-xs muted">
                    {num(lead.total_citations)} cites
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={cn("tnum text-base font-semibold", tier.text)}>
                      {lead.score === null ? "—" : Math.round(lead.score)}
                    </span>
                    <TierChip band={lead.band} />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-ink-200 dark:bg-ink-800">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          (lead.confidence ?? 0) < 0.5 ? "bg-amber-500" : "bg-accent-600",
                        )}
                        style={{ width: `${Math.max(3, (lead.confidence ?? 0) * 100)}%` }}
                      />
                    </div>
                    <span className="tnum text-xs muted">
                      {decimal(lead.confidence)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Pill>{lead.status || "New"}</Pill>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* --- card view (spec §8) -------------------------------------------------- */

function LeadCard({ lead }) {
  const tier = tierFor(lead.band);
  const [interests, extra] = firstN(lead.interests, 3);

  return (
    <Card className="flex flex-col p-5 transition-shadow hover:shadow-lift">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink-200 text-sm font-semibold dark:bg-ink-800">
          {lead.name
            .split(" ")
            .map((part) => part[0])
            .slice(0, 2)
            .join("")}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold">{lead.name}</h3>
          <p className="truncate text-xs muted">
            {lead.position || lead.seniority || "Role unknown"}
          </p>
          <p className="truncate text-xs muted">{lead.institution || "—"}</p>
        </div>
      </div>

      {interests.length > 0 && (
        <div className="mt-4">
          <p className="eyebrow mb-1.5">Research</p>
          <div className="flex flex-wrap gap-1.5">
            {interests.map((interest) => (
              <Pill key={interest}>{interest}</Pill>
            ))}
            {extra > 0 && <Pill className="muted">+{extra}</Pill>}
          </div>
        </div>
      )}

      <div className="mt-4 flex items-baseline gap-4 text-xs muted">
        <span>
          <span className="tnum font-semibold text-ink-800 dark:text-ink-100">
            {num(lead.paper_count)}
          </span>{" "}
          papers
        </span>
        <span>
          <span className="tnum font-semibold text-ink-800 dark:text-ink-100">
            {num(lead.total_citations)}
          </span>{" "}
          citations
        </span>
      </div>

      <div className="mt-4">
        <div className="flex items-baseline justify-between">
          <p className="eyebrow">Customer potential</p>
          <span className={cn("tnum text-lg font-semibold", tier.text)}>
            {lead.score === null ? "—" : Math.round(lead.score)}
          </span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink-200 dark:bg-ink-800">
          <div
            className={cn("h-full rounded-full", tier.dot)}
            style={{ width: `${Math.max(2, lead.score ?? 0)}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <TierChip band={lead.band} />
          <span className="text-xs muted">
            confidence {decimal(lead.confidence)}
          </span>
        </div>
      </div>

      <Link to={`/leads/${lead.id}`} className="mt-5">
        <Button className="w-full">View Profile</Button>
      </Link>
    </Card>
  );
}

/* --- page ----------------------------------------------------------------- */

const EMPTY_FILTERS = {
  band: "",
  product_id: "",
  task_id: "",
  seniority: "",
  country: "",
  status: "",
  min_score: "",
  sort: "score",
};

export default function Leads() {
  const [params] = useSearchParams();
  const [filters, setFilters] = useState({
    ...EMPTY_FILTERS,
    task_id: params.get("task") || "",
  });
  const [term, setTerm] = useState(params.get("institution") || "");
  const [view, setView] = useState("table");
  const [showFilters, setShowFilters] = useState(false);

  const products = useAsync(listProducts, []);
  const tasks = useAsync(
    () => listTasks(filters.product_id ? { product_id: filters.product_id } : {}),
    [filters.product_id],
  );

  const query = useMemo(
    () => ({ ...filters, q: term.trim() || undefined, limit: 200 }),
    [filters, term],
  );
  const leads = useAsync(() => listLeads(query), [JSON.stringify(query)]);

  const activeCount = Object.entries(filters).filter(
    ([key, value]) => value && key !== "sort",
  ).length;

  const thin = useMemo(() => {
    const rows = (leads.data || []).filter((l) => l.confidence !== null);
    if (!rows.length) return null;
    return rows.reduce((sum, l) => sum + l.confidence, 0) / rows.length;
  }, [leads.data]);

  if (leads.error) return <ErrorState error={leads.error} onRetry={leads.refetch} />;

  return (
    <Section
      eyebrow="Step 3"
      title="Leads"
      description="Every researcher discovered so far, ranked by how likely they are to need your product."
      actions={
        <a href={leadsCsvUrl(query)} download>
          <Button>Export CSV</Button>
        </a>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 sm:max-w-sm">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 muted"
          >
            ⌕
          </span>
          <Input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search researchers, institutions, topics…"
            className="pl-8"
          />
        </div>

        <Button
          onClick={() => setShowFilters((v) => !v)}
          className={activeCount ? "border-accent-500 text-accent-700" : undefined}
        >
          Filters {activeCount > 0 && `(${activeCount})`} {showFilters ? "▴" : "▾"}
        </Button>

        <div className="ml-auto flex overflow-hidden rounded-lg border border-ink-300 dark:border-ink-700">
          {[
            ["table", "☰", "Table view"],
            ["cards", "▦", "Card view"],
          ].map(([id, glyph, label]) => (
            <button
              key={id}
              onClick={() => setView(id)}
              title={label}
              aria-label={label}
              aria-pressed={view === id}
              className={cn(
                "px-3 py-1.5 text-sm transition-colors",
                view === id
                  ? "bg-accent-500/10 text-accent-700 dark:text-accent-300"
                  : "muted hover:bg-ink-200/60 dark:hover:bg-ink-800",
              )}
            >
              {glyph}
            </button>
          ))}
        </div>
      </div>

      {showFilters && (
        <Filters
          value={filters}
          onChange={setFilters}
          products={products.data}
          tasks={tasks.data}
          activeCount={activeCount}
          onReset={() => {
            setFilters(EMPTY_FILTERS);
            setTerm("");
          }}
        />
      )}

      {thin !== null && thin < 0.5 && (
        <Banner tone="caution" className="mb-4" icon="⚠" title="Read the breakdown before acting">
          Mean confidence across these leads is {decimal(thin)} — on average
          fewer than half the scoring components had surviving evidence. The
          ranking is still useful; the individual numbers are not measurements.
        </Banner>
      )}

      <Card className="overflow-hidden">
        {leads.loading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : !leads.data.length ? (
          <EmptyState
            icon="👤"
            title={
              activeCount || term
                ? "No researchers match these filters"
                : "No researchers discovered yet"
            }
            description={
              activeCount || term
                ? "Try widening the filters or clearing the search."
                : "Run a research task to find potential customers."
            }
            action={
              activeCount || term ? (
                <Button
                  onClick={() => {
                    setFilters(EMPTY_FILTERS);
                    setTerm("");
                  }}
                >
                  Clear filters
                </Button>
              ) : (
                <Link to="/tasks/new">
                  <Button variant="primary">+ Add Research Task</Button>
                </Link>
              )
            }
          />
        ) : view === "table" ? (
          <LeadTable leads={leads.data} />
        ) : (
          <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {leads.data.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        )}
      </Card>

      {!leads.loading && leads.data.length > 0 && (
        <p className="mt-3 text-xs muted">
          Showing {leads.data.length} researcher
          {leads.data.length === 1 ? "" : "s"}. Score and confidence are separate
          numbers: a high score on thin evidence means “worth a look”, not
          “qualified”.
        </p>
      )}
    </Section>
  );
}
