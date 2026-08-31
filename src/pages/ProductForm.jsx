import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { createProduct, getProduct, updateProduct } from "../api/client";
import {
  Button,
  Card,
  CardHeader,
  ErrorState,
  Field,
  Input,
  ListBuilder,
  Section,
  Skeleton,
  Textarea,
  useAsync,
  useToast,
} from "../components/ui";

/* Spec §6. The form is long because the analysis is only as good as this
   description — but it is grouped into six labelled sections and only the name
   is required, so nobody is blocked on filling in all of it. */

const EMPTY = {
  name: "",
  short_description: "",
  long_description: "",
  technical_capabilities: [],
  problems_solved: [],
  target_industries: [],
  research_keywords: [],
  target_roles: [],
  technologies: [],
  alternatives: [],
  use_cases: [],
  deployment_model: "",
  infrastructure: "",
  pricing: "",
  icp: "",
  pain_points: [],
  qualification_requirements: [],
  disqualifiers: [],
  competitive_advantages: [],
  value_proposition: "",
};

function FormSection({ step, title, description, children }) {
  return (
    <Card className="mb-5">
      <CardHeader
        title={
          <span className="flex items-center gap-2.5">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-accent-500/15 text-2xs font-bold text-accent-700 dark:text-accent-300">
              {step}
            </span>
            {title}
          </span>
        }
        note={description}
      />
      <div className="space-y-5 px-5 py-5">{children}</div>
    </Card>
  );
}

export default function ProductForm() {
  const { productId } = useParams();
  const editing = Boolean(productId);
  const navigate = useNavigate();
  const toast = useToast();

  const existing = useAsync(
    () => (editing ? getProduct(productId) : Promise.resolve(null)),
    [productId],
  );

  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existing.data) {
      setForm({ ...EMPTY, ...existing.data });
    }
  }, [existing.data]);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));
  const setText = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(event) {
    event.preventDefault();
    if (!form.name.trim()) {
      toast("A product name is required", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form };
      delete payload.id;
      delete payload.owner_id;
      delete payload.created_at;
      delete payload.intelligence;
      delete payload.intelligence_model;
      delete payload.intelligence_generated_at;
      delete payload.capabilities;

      const saved = editing
        ? await updateProduct(productId, payload)
        : await createProduct(payload);
      toast(editing ? "Product updated" : "Product created");
      navigate(`/products/${saved.id}`);
    } catch (error) {
      toast(error.message, "error");
      setSaving(false);
    }
  }

  if (existing.error) {
    return <ErrorState error={existing.error} onRetry={existing.refetch} />;
  }
  if (editing && existing.loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <Link to="/products" className="text-sm text-accent-600 hover:underline dark:text-accent-400">
          ← Back to products
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          {editing ? `Edit ${existing.data?.name}` : "Create a product"}
        </h1>
        <p className="mt-1 text-sm muted">
          The more precisely you describe this, the better the matching. Only
          the name is required — you can come back and fill in the rest.
        </p>
      </div>

      <form onSubmit={submit}>
        <FormSection
          step="1"
          title="Basic information"
          description="What the product is."
        >
          <Field label="Product name" required>
            <Input
              value={form.name}
              onChange={setText("name")}
              placeholder="Long Video AI Platform"
              autoFocus
            />
          </Field>
          <Field label="Short description" hint="One sentence, shown in lists.">
            <Input
              value={form.short_description || ""}
              onChange={setText("short_description")}
              placeholder="AI platform for long-video understanding"
            />
          </Field>
          <Field
            label="Detailed description"
            hint="Paste your datasheet or product page. This is the single biggest lever on match quality."
          >
            <Textarea
              rows={6}
              value={form.long_description || ""}
              onChange={setText("long_description")}
            />
          </Field>
        </FormSection>

        <FormSection
          step="2"
          title="Product capabilities"
          description="What does your product do?"
        >
          <ListBuilder
            items={form.technical_capabilities}
            onChange={set("technical_capabilities")}
            placeholder="Video understanding"
            addLabel="Add Capability"
          />
        </FormSection>

        <FormSection
          step="3"
          title="Problems solved"
          description="What problems does your product solve?"
        >
          <ListBuilder
            items={form.problems_solved}
            onChange={set("problems_solved")}
            placeholder="High inference cost"
            addLabel="Add Problem"
          />
          <Field
            label="Pain points it removes"
            hint="Symptoms your buyer feels, in their words."
          >
            <ListBuilder
              items={form.pain_points}
              onChange={set("pain_points")}
              placeholder="Multi-day evaluation runs"
              addLabel="Add Pain Point"
            />
          </Field>
        </FormSection>

        <FormSection
          step="4"
          title="Target customers"
          description="Who you are selling to, and what they publish about."
        >
          <Field
            label="Research keywords"
            hint="Seeds the literature search. List synonyms — they retrieve noticeably different papers."
          >
            <ListBuilder
              items={form.research_keywords}
              onChange={set("research_keywords")}
              placeholder="long video understanding"
              addLabel="Add Keyword"
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Target industries">
              <ListBuilder
                items={form.target_industries}
                onChange={set("target_industries")}
                placeholder="Academic research"
              />
            </Field>
            <Field label="Target job roles">
              <ListBuilder
                items={form.target_roles}
                onChange={set("target_roles")}
                placeholder="Computer vision PI"
              />
            </Field>
          </div>
          <Field label="Use cases">
            <ListBuilder
              items={form.use_cases}
              onChange={set("use_cases")}
              placeholder="Benchmark evaluation at scale"
            />
          </Field>
        </FormSection>

        <FormSection
          step="5"
          title="Technical information"
          description="Used to judge whether a researcher's stack is compatible."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Supported models / frameworks">
              <ListBuilder
                items={form.technologies}
                onChange={set("technologies")}
                placeholder="PyTorch"
              />
            </Field>
            <Field label="Alternatives & competitors" hint="Also useful as signal terms on a task.">
              <ListBuilder
                items={form.alternatives}
                onChange={set("alternatives")}
                placeholder="vLLM"
              />
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Deployment options">
              <Input
                value={form.deployment_model || ""}
                onChange={setText("deployment_model")}
                placeholder="Self-hosted / SaaS"
              />
            </Field>
            <Field label="Infrastructure">
              <Input
                value={form.infrastructure || ""}
                onChange={setText("infrastructure")}
                placeholder="NVIDIA GPUs, Linux"
              />
            </Field>
            <Field label="Pricing">
              <Input
                value={form.pricing || ""}
                onChange={setText("pricing")}
                placeholder="Annual site licence"
              />
            </Field>
          </div>
        </FormSection>

        <FormSection
          step="6"
          title="Customer qualification"
          description="What makes a lead good — and what rules one out."
        >
          <Field label="Ideal customer">
            <Textarea
              rows={2}
              value={form.icp || ""}
              onChange={setText("icp")}
              placeholder="A university CV group running its own GPU cluster"
            />
          </Field>
          <Field label="Value proposition">
            <Input
              value={form.value_proposition || ""}
              onChange={setText("value_proposition")}
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Strong buying signals">
              <ListBuilder
                items={form.qualification_requirements}
                onChange={set("qualification_requirements")}
                placeholder="Reports GPU-hours in papers"
              />
            </Field>
            <Field label="Disqualifying signals">
              <ListBuilder
                items={form.disqualifiers}
                onChange={set("disqualifiers")}
                placeholder="No compute footprint"
              />
            </Field>
          </div>
          <Field label="Competitive advantages">
            <ListBuilder
              items={form.competitive_advantages}
              onChange={set("competitive_advantages")}
            />
          </Field>
        </FormSection>

        <div className="sticky bottom-0 -mx-4 flex items-center gap-3 border-t divider bg-white/90 px-4 py-3 backdrop-blur dark:bg-ink-950/90 sm:-mx-6 sm:px-6">
          <p className="text-xs muted">
            Saving generates an AI Product Intelligence Profile in the
            background.
          </p>
          <div className="ml-auto flex gap-2">
            <Button type="button" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              Save Product
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
