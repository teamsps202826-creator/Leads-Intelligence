import { useEffect, useState } from "react";
import { getLlmSettings, updateLlmSettings } from "../api/client";
import {
  Banner,
  Button,
  Card,
  CardHeader,
  ErrorState,
  Field,
  Input,
  Section,
  Select,
  Skeleton,
  useAsync,
  useToast,
} from "../components/ui";

/* Model ids kept in sync with the family this build ships against — see
   CLAUDE.md / system context for the current lineup. */
const MODELS = [
  { id: "claude-opus-5", label: "Claude Opus 5 — most capable" },
  { id: "claude-sonnet-5", label: "Claude Sonnet 5 — balanced" },
  { id: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5 — fastest, cheapest" },
  { id: "claude-fable-5", label: "Claude Fable 5" },
];

const EFFORTS = [
  { id: "low", label: "Low — fastest, cheapest" },
  { id: "medium", label: "Medium" },
  { id: "high", label: "High — most thorough" },
];

export default function Settings() {
  const toast = useToast();
  const settings = useAsync(getLlmSettings, []);

  const [provider, setProvider] = useState("mock");
  const [model, setModel] = useState(MODELS[0].id);
  const [effort, setEffort] = useState("high");
  const [apiKey, setApiKey] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!settings.data) return;
    setProvider(settings.data.provider || "mock");
    setModel(settings.data.model || MODELS[0].id);
    setEffort(settings.data.effort || "high");
  }, [settings.data]);

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await updateLlmSettings({
        provider,
        model: provider === "anthropic" ? model : undefined,
        effort: provider === "anthropic" ? effort : undefined,
        api_key: apiKey.trim() ? apiKey.trim() : undefined,
      });
      setApiKey("");
      toast("Settings saved");
      settings.refetch();
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function clearKey() {
    setSaving(true);
    try {
      await updateLlmSettings({ clear_api_key: true });
      toast("API key cleared — falling back to mock");
      setProvider("mock");
      setApiKey("");
      settings.refetch();
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setSaving(false);
    }
  }

  if (settings.error) {
    return <ErrorState error={settings.error} onRetry={settings.refetch} />;
  }

  return (
    <div className="mx-auto max-w-xl">
      <Section
        eyebrow="Settings"
        title="AI model"
        description="Controls which model powers product intelligence, lead scoring, and outreach drafts. Mining papers and enriching contact info never uses this — it works the same either way."
      />

      {settings.loading ? (
        <Card className="p-5">
          <Skeleton className="h-48 w-full" />
        </Card>
      ) : (
        <form onSubmit={save}>
          <Card>
            <CardHeader
              title="Provider"
              note={
                settings.data?.updated_at
                  ? `Last saved ${new Date(settings.data.updated_at).toLocaleString()}`
                  : "Using built-in defaults"
              }
            />
            <div className="space-y-4 px-5 py-5">
              <Field label="Provider">
                <Select value={provider} onChange={(e) => setProvider(e.target.value)}>
                  <option value="mock">Mock — free, deterministic, no key needed</option>
                  <option value="anthropic">Anthropic (Claude) — real analysis</option>
                </Select>
              </Field>

              {provider === "mock" && (
                <Banner tone="info" icon="🧪">
                  Mock mode fabricates plausible-looking scores and summaries
                  from real quotes in your papers, at zero cost. Good for
                  trying out the app; switch to Anthropic when you want real
                  judgement behind the scores.
                </Banner>
              )}

              {provider === "anthropic" && (
                <>
                  <Field label="Model">
                    <Select value={model} onChange={(e) => setModel(e.target.value)}>
                      {MODELS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <Field label="Reasoning effort">
                    <Select value={effort} onChange={(e) => setEffort(e.target.value)}>
                      {EFFORTS.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.label}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <Field
                    label="API key"
                    hint={
                      settings.data?.api_key_set
                        ? "A key is already saved. Leave blank to keep it, or paste a new one to replace it."
                        : "Your Anthropic API key. Stored in this app's local database, never shown again after saving."
                    }
                  >
                    <Input
                      type="password"
                      autoComplete="off"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={settings.data?.api_key_set ? "•••••••••••••••• (saved)" : "sk-ant-…"}
                    />
                  </Field>

                  {settings.data?.api_key_set && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={saving}
                      onClick={clearKey}
                    >
                      Remove saved key
                    </Button>
                  )}
                </>
              )}
            </div>
          </Card>

          <div className="mt-4 flex justify-end">
            <Button type="submit" variant="primary" loading={saving}>
              Save
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
