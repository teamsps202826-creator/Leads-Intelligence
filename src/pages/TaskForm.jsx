import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { createTask, getTask, listProducts, runTask, updateTask } from "../api/client";
import {
  Banner,
  Button,
  Card,
  CardHeader,
  Field,
  Input,
  ListBuilder,
  Select,
  Skeleton,
  Textarea,
  useAsync,
  useToast,
} from "../components/ui";

/* Spec §4. Required fields sit up top; everything else is behind "More
   filters" so the common case is a five-field form, not a twenty-field one. */

const DATE_RANGES = [
  { id: "2", label: "Last 2 years" },
  { id: "3", label: "Last 3 years" },
  { id: "5", label: "Last 5 years" },
  { id: "10", label: "Last 10 years" },
  { id: "any", label: "Any date" },
];

const SOURCES = [
  { id: "openalex", label: "OpenAlex", note: "broadest metadata coverage" },
  { id: "europepmc", label: "Europe PMC", note: "abstracts, affiliations, ORCIDs" },
  { id: "crossref", label: "Crossref", note: "DOI registry" },
  { id: "arxiv", label: "arXiv", note: "preprints, always open access" },
];

export default function TaskForm() {
  const { taskId } = useParams();
  const editing = Boolean(taskId);
  const navigate = useNavigate();
  const toast = useToast();
  const [params] = useSearchParams();
  const products = useAsync(listProducts, []);
  const existing = useAsync(
    () => (editing ? getTask(taskId) : Promise.resolve(null)),
    [taskId],
  );

  const [form, setForm] = useState({
    name: "",
    domain: "",
    topics: [],
    keywords: [],
    range: "2",
    year_from: "",
    year_to: "",
    max_papers: 500,
    max_authors: 100,
    product_id: params.get("product") || "",
    sources: ["openalex"],
    authors_filter: [],
    institutions_filter: [],
    countries: "",
    conferences: [],
    journals: [],
    technologies: [],
    models: [],
    datasets: [],
    signal_terms: [],
    include_preprints: true,
    enrich_authors: true,
    enrich_pdf: false,
  });
  const [showMore, setShowMore] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing && !form.product_id && products.data?.length) {
      setForm((f) => ({ ...f, product_id: products.data[0].id }));
    }
  }, [editing, products.data, form.product_id]);

  useEffect(() => {
    if (!existing.data) return;
    const t = existing.data;
    setForm((f) => ({
      ...f,
      name: t.name,
      domain: t.domain || "",
      topics: t.topics || [],
      keywords: t.keywords || [],
      product_id: t.product_id || "",
      sources: t.sources?.length ? t.sources : ["openalex"],
      authors_filter: t.authors_filter || [],
      institutions_filter: t.institutions_filter || [],
      countries: (t.countries || []).join(", "),
      year_from: t.year_from ?? "",
      year_to: t.year_to ?? "",
      max_papers: t.max_papers,
      max_authors: t.max_authors,
      signal_terms: (t.signal_terms || []).map((s) => s.term),
      include_preprints: t.include_preprints,
      enrich_authors: (t.enrichers || []).some(
        (e) => e === "published_contact" || e === "orcid",
      ),
      enrich_pdf: (t.enrichers || []).includes("pdf_scrape"),
    }));
  }, [existing.data]);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));
  const setText = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const selectedProduct = useMemo(
    () => products.data?.find((p) => p.id === form.product_id),
    [products.data, form.product_id],
  );

  function toggleSource(id) {
    setForm((f) => ({
      ...f,
      sources: f.sources.includes(id)
        ? f.sources.filter((s) => s !== id)
        : [...f.sources, id],
    }));
  }

  async function submit(event) {
    event.preventDefault();
    if (!form.name.trim()) return toast("Give the task a name", "error");
    if (!form.keywords.length && !form.topics.length) {
      return toast("Add at least one keyword or topic", "error");
    }
    if (!form.sources.length) return toast("Select at least one source", "error");

    const thisYear = new Date().getFullYear();
    const yearFrom = editing
      ? form.year_from === "" ? null : Number(form.year_from)
      : form.range === "any" ? null : thisYear - Number(form.range) + 1;
    const yearTo = editing ? (form.year_to === "" ? null : Number(form.year_to)) : null;

    const enrichers = [
      ...(form.enrich_authors ? ["published_contact", "orcid"] : []),
      ...(form.enrich_pdf ? ["pdf_scrape"] : []),
    ];

    const payload = {
      name: form.name.trim(),
      domain: form.domain || null,
      topics: form.topics,
      keywords: form.keywords,
      authors_filter: form.authors_filter,
      institutions_filter: form.institutions_filter,
      countries: form.countries
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      year_from: yearFrom,
      year_to: yearTo,
      max_papers: Number(form.max_papers),
      max_authors: Number(form.max_authors),
      sources: form.sources,
      include_preprints: form.include_preprints,
      enrich_authors: enrichers.length > 0,
      enrichers,
      signal_terms: form.signal_terms.map((term) => ({
        term,
        category: "competitor",
      })),
    };

    setSaving(true);
    try {
      if (editing) {
        await updateTask(taskId, { ...payload, product_id: form.product_id || null });
        toast("Task updated");
        navigate(`/tasks/${taskId}`);
      } else {
        const task = await createTask(form.product_id || null, payload);
        await runTask(task.id);
        toast("Research mining started");
        navigate(`/tasks/${task.id}`);
      }
    } catch (error) {
      toast(error.message, "error");
      setSaving(false);
    }
  }

  if (products.loading || (editing && existing.loading)) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (editing && existing.error) {
    return (
      <div className="mx-auto max-w-3xl">
        <Banner tone="danger" title="Couldn't load this task">
          {existing.error.message}
        </Banner>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <Link
          to={editing ? `/tasks/${taskId}` : "/"}
          className="text-sm text-accent-600 hover:underline dark:text-accent-400"
        >
          ← {editing ? "Back to task" : "Back to home"}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          {editing ? `Edit ${existing.data?.name || ""}` : "Add Research Task"}
        </h1>
        <p className="mt-1 text-sm muted">
          {editing
            ? "Changes apply the next time this task runs — editing doesn't start a new scan."
            : "Describe the researchers you want to find. We search the literature, resolve the authors, and score each one against your product."}
        </p>
      </div>

      <form onSubmit={submit}>
        <Card className="mb-5">
          <CardHeader title="What are you looking for?" />
          <div className="space-y-5 px-5 py-5">
            <Field label="Task name" required>
              <Input
                value={form.name}
                onChange={setText("name")}
                placeholder="VLM Researchers"
                autoFocus
              />
            </Field>

            <Field label="Research field" hint="Optional. Free text, for your own reference.">
              <Input
                value={form.domain}
                onChange={setText("domain")}
                placeholder="Computer Vision"
              />
            </Field>

            <Field
              label="Keywords"
              required
              hint="Combined with OR. Always list synonyms — they retrieve noticeably different papers."
            >
              <ListBuilder
                items={form.keywords}
                onChange={set("keywords")}
                placeholder="long video understanding"
                addLabel="Add Keyword"
              />
            </Field>

            <Field label="Research topics" hint="Broader than keywords. Used when no keyword matches.">
              <ListBuilder
                items={form.topics}
                onChange={set("topics")}
                placeholder="video-language models"
                addLabel="Add Topic"
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="Publication date">
                {editing ? (
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="From year"
                      value={form.year_from}
                      onChange={setText("year_from")}
                    />
                    <Input
                      type="number"
                      placeholder="To year"
                      value={form.year_to}
                      onChange={setText("year_to")}
                    />
                  </div>
                ) : (
                  <Select value={form.range} onChange={setText("range")}>
                    {DATE_RANGES.map((range) => (
                      <option key={range.id} value={range.id}>
                        {range.label}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label="Maximum papers" hint="Deeper coverage, slower scan.">
                <Input
                  type="number"
                  min={1}
                  max={20000}
                  value={form.max_papers}
                  onChange={setText("max_papers")}
                />
              </Field>
              <Field label="Maximum leads">
                <Input
                  type="number"
                  min={1}
                  max={20000}
                  value={form.max_authors}
                  onChange={setText("max_authors")}
                />
              </Field>
            </div>
          </div>
        </Card>

        <Card className="mb-5">
          <CardHeader
            title="Score against which product?"
            note="Optional — a task with no product still mines papers and authors, just without a score."
          />
          <div className="space-y-4 px-5 py-5">
            <Field label="Product">
              <Select value={form.product_id} onChange={setText("product_id")}>
                <option value="">No product — mining only</option>
                {products.data?.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </Select>
            </Field>

            {!form.product_id && (
              <Banner tone="info" icon="ℹ">
                This task will find papers and authors but won't be scored —
                there's no product profile to measure fit against. Pick a
                product above (or{" "}
                <Link to="/products/new" className="underline">
                  create one
                </Link>
                ) any time to score it later.
              </Banner>
            )}

            {selectedProduct && !selectedProduct.intelligence && (
              <Banner tone="caution" icon="⚠" title="No intelligence profile">
                “{selectedProduct.name}” has no profile yet. Mining will still
                run, but leads cannot be scored until you generate one from the{" "}
                <Link
                  to={`/products/${selectedProduct.id}`}
                  className="underline"
                >
                  product page
                </Link>
                .
              </Banner>
            )}

            <Field label="Sources">
              <div className="flex flex-wrap gap-2">
                {SOURCES.map((source) => {
                  const on = form.sources.includes(source.id);
                  return (
                    <button
                      key={source.id}
                      type="button"
                      onClick={() => toggleSource(source.id)}
                      className={
                        on
                          ? "rounded-lg border border-accent-500 bg-accent-500/10 px-3 py-2 text-left text-xs"
                          : "rounded-lg border border-ink-300 px-3 py-2 text-left text-xs dark:border-ink-700"
                      }
                    >
                      <span className="block font-medium">{source.label}</span>
                      <span className="block muted">{source.note}</span>
                    </button>
                  );
                })}
              </div>
            </Field>
          </div>
        </Card>

        <Card className="mb-5">
          <button
            type="button"
            onClick={() => setShowMore((v) => !v)}
            className="flex w-full items-center gap-2 px-5 py-3.5 text-left text-sm font-semibold"
          >
            <span className="muted">{showMore ? "▾" : "▸"}</span>
            Narrow the search
            <span className="ml-auto text-xs font-normal muted">
              optional filters
            </span>
          </button>

          {showMore && (
            <div className="space-y-5 border-t divider px-5 py-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Authors">
                  <ListBuilder items={form.authors_filter} onChange={set("authors_filter")} />
                </Field>
                <Field label="Institutions / universities">
                  <ListBuilder
                    items={form.institutions_filter}
                    onChange={set("institutions_filter")}
                    placeholder="MIT"
                  />
                </Field>
              </div>
              <Field label="Countries" hint="ISO-2 codes, comma separated.">
                <Input
                  value={form.countries}
                  onChange={setText("countries")}
                  placeholder="US, GB, DE"
                />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Conferences">
                  <ListBuilder items={form.conferences} onChange={set("conferences")} placeholder="CVPR" />
                </Field>
                <Field label="Journals">
                  <ListBuilder items={form.journals} onChange={set("journals")} />
                </Field>
                <Field label="Technologies">
                  <ListBuilder items={form.technologies} onChange={set("technologies")} placeholder="CUDA" />
                </Field>
                <Field label="Models">
                  <ListBuilder items={form.models} onChange={set("models")} placeholder="LLaVA" />
                </Field>
                <Field label="Datasets">
                  <ListBuilder items={form.datasets} onChange={set("datasets")} placeholder="EgoSchema" />
                </Field>
                <Field
                  label="Competitor names to watch"
                  hint="Mentions in the papers mark a lead as already running a rival workflow."
                >
                  <ListBuilder items={form.signal_terms} onChange={set("signal_terms")} placeholder="vLLM" />
                </Field>
              </div>
              <div className="flex flex-wrap gap-5 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.include_preprints}
                    onChange={(e) => set("include_preprints")(e.target.checked)}
                    className="accent-accent-600"
                  />
                  Include preprints
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.enrich_authors}
                    onChange={(e) => set("enrich_authors")(e.target.checked)}
                    className="accent-accent-600"
                  />
                  Look for public contact details
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.enrich_pdf}
                    onChange={(e) => set("enrich_pdf")(e.target.checked)}
                    className="accent-accent-600"
                  />
                  Scrape open-access PDFs for author details
                </label>
              </div>
              <p className="text-xs muted">
                Contacts are only taken from public, citable records and only
                when the address can be attributed to that specific author.
                Nothing is pattern-guessed. PDF scraping downloads the paper
                itself when a free, direct PDF link exists (arXiv, PMC, etc.)
                and reads the actual text for an author's own email — no LLM
                involved, and nothing paywalled is ever fetched.
              </p>
            </div>
          )}
        </Card>

        <div className="sticky bottom-0 -mx-4 flex items-center gap-3 border-t divider bg-white/90 px-4 py-3 backdrop-blur dark:bg-ink-950/90 sm:-mx-6 sm:px-6">
          <p className="text-xs muted">
            {editing
              ? "Saving doesn't re-run the scan — use Run on the task page for that."
              : `A scan of ${Number(form.max_papers).toLocaleString()} papers usually takes a few minutes.`}
          </p>
          <div className="ml-auto flex gap-2">
            <Button type="button" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              {editing ? "Save Changes" : "Start Research Mining"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
