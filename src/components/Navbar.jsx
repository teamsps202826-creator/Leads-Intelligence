import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { getHealth, search as searchApi } from "../api/client";
import { cn, tierFor } from "../lib/format";
import { Pill, Spinner, useAsync } from "./ui";

const LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/products", label: "Products" },
  { to: "/tasks", label: "Tasks" },
  { to: "/leads", label: "Leads" },
];

function Logo() {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2.5">
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent-600 text-sm font-bold text-white">
        L
      </span>
      <span className="hidden text-sm font-semibold tracking-tight sm:block">
        Lead Intelligence
      </span>
    </Link>
  );
}

/** Global search (spec §10). Searches leads, papers and institutions at once —
 *  a salesperson knows a name or a topic, not which entity it lives on. */
function GlobalSearch() {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState(null);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const query = term.trim();
    if (query.length < 2) {
      setResults(null);
      return undefined;
    }
    setBusy(true);
    const timer = setTimeout(() => {
      searchApi(query)
        .then((data) => {
          setResults(data);
          setOpen(true);
        })
        .finally(() => setBusy(false));
    }, 220);
    return () => clearTimeout(timer);
  }, [term]);

  useEffect(() => {
    const onClick = (event) => {
      if (boxRef.current && !boxRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function go(path) {
    setOpen(false);
    setTerm("");
    navigate(path);
  }

  const empty =
    results &&
    !results.leads.length &&
    !results.papers.length &&
    !results.institutions.length;

  return (
    <div ref={boxRef} className="relative hidden min-w-0 flex-1 md:block">
      <div className="relative mx-auto max-w-md">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm muted"
        >
          ⌕
        </span>
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          onFocus={() => results && setOpen(true)}
          placeholder="Search researchers, institutions, papers…"
          aria-label="Search"
          className="field-input h-9 pl-8 pr-8 text-sm"
        />
        {busy && (
          <Spinner className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
        )}
      </div>

      {open && results && (
        <div className="surface absolute left-1/2 top-11 z-50 max-h-[70vh] w-[28rem] -translate-x-1/2 overflow-y-auto p-2 shadow-lift">
          {empty && (
            <p className="px-3 py-6 text-center text-sm muted">
              Nothing matched “{term}”.
            </p>
          )}

          {results.leads.length > 0 && (
            <section className="mb-1">
              <p className="eyebrow px-3 py-1.5">Researchers</p>
              {results.leads.map((lead) => {
                const tier = tierFor(lead.band);
                return (
                  <button
                    key={lead.id}
                    onClick={() => go(`/leads/${lead.id}`)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-ink-200/50 dark:hover:bg-ink-800"
                  >
                    <span className={cn("h-2 w-2 shrink-0 rounded-full", tier.dot)} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {lead.name}
                      </span>
                      <span className="block truncate text-xs muted">
                        {lead.institution || "Institution unknown"}
                      </span>
                    </span>
                    <span className="tnum shrink-0 text-xs muted">
                      {lead.score === null ? "—" : Math.round(lead.score)}
                    </span>
                  </button>
                );
              })}
            </section>
          )}

          {results.papers.length > 0 && (
            <section className="mb-1">
              <p className="eyebrow px-3 py-1.5">Papers</p>
              {results.papers.map((paper) => (
                <button
                  key={paper.id}
                  onClick={() => go(`/leads/${paper.lead_id}?tab=papers`)}
                  className="block w-full rounded-lg px-3 py-2 text-left hover:bg-ink-200/50 dark:hover:bg-ink-800"
                >
                  <span className="block truncate text-sm">{paper.title}</span>
                  <span className="text-xs muted">{paper.publication_year}</span>
                </button>
              ))}
            </section>
          )}

          {results.institutions.length > 0 && (
            <section>
              <p className="eyebrow px-3 py-1.5">Institutions</p>
              {results.institutions.map((name) => (
                <button
                  key={name}
                  onClick={() => go(`/leads?institution=${encodeURIComponent(name)}`)}
                  className="block w-full truncate rounded-lg px-3 py-2 text-left text-sm hover:bg-ink-200/50 dark:hover:bg-ink-800"
                >
                  {name}
                </button>
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function ThemeToggle() {
  const [theme, setTheme] = useState(
    () => document.documentElement.dataset.theme || "light",
  );

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
    setTheme(next);
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle colour theme"
      className="grid h-8 w-8 place-items-center rounded-lg text-sm muted hover:bg-ink-200/60 dark:hover:bg-ink-800"
    >
      {theme === "dark" ? "☀" : "☾"}
    </button>
  );
}

function AccountMenu({ health }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Account"
        className="grid h-8 w-8 place-items-center rounded-full bg-ink-800 text-xs font-semibold text-white dark:bg-ink-200 dark:text-ink-900"
      >
        YS
      </button>
      {open && (
        <div className="surface absolute right-0 top-10 z-50 w-64 p-1.5 shadow-lift">
          <div className="border-b divider px-3 py-2">
            <p className="text-sm font-medium">Your workspace</p>
            <p className="text-xs muted">owner@localhost</p>
          </div>
          <div className="space-y-1 px-3 py-2 text-xs muted">
            <div className="flex justify-between gap-3">
              <span>Model</span>
              <span className="font-mono">
                {health ? `${health.llm_provider}:${health.llm_model}` : "…"}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span>Embeddings</span>
              <span className="font-mono">{health?.embedding_provider ?? "…"}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Outreach</span>
              {health?.outbound_enabled ? (
                <Pill className="bg-red-500/10 text-red-700 ring-1 ring-red-500/20">
                  sending ON
                </Pill>
              ) : (
                <Pill className="bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20">
                  never sends
                </Pill>
              )}
            </div>
          </div>
          <Link
            to="/settings"
            onClick={() => setOpen(false)}
            className="block border-t divider px-3 py-2 text-sm font-medium text-accent-600 hover:bg-ink-200/60 dark:text-accent-400 dark:hover:bg-ink-800"
          >
            ⚙ AI model settings
          </Link>
          <p className="border-t divider px-3 py-2 text-2xs leading-relaxed muted">
            Drafts are generated for review. This build has no outbound path.
          </p>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { data: health } = useAsync(getHealth, []);

  return (
    <header className="sticky top-0 z-40 border-b divider bg-white/85 backdrop-blur dark:bg-ink-950/85">
      <div className="mx-auto flex h-14 max-w-[1500px] items-center gap-4 px-4 sm:px-6">
        <Logo />

        <nav className="flex items-center gap-0.5" aria-label="Main">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  "whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent-500/10 text-accent-700 dark:text-accent-300"
                    : "muted hover:bg-ink-200/60 hover:text-ink-900 dark:hover:bg-ink-800 dark:hover:text-white",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <GlobalSearch />

        <div className="ml-auto flex items-center gap-1.5">
          <ThemeToggle />
          <AccountMenu health={health} />
        </div>
      </div>
    </header>
  );
}
