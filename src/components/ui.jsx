/* The design-system primitives. One file because they are small, share
 * conventions, and are always imported together. */

import { createContext, useContext, useEffect, useState } from "react";
import { cn } from "../lib/format";

/* --- buttons -------------------------------------------------------------- */

const VARIANTS = {
  primary:
    "bg-accent-600 text-white hover:bg-accent-700 border-transparent shadow-card",
  secondary:
    "bg-white text-ink-800 hover:bg-ink-50 border-ink-300 dark:bg-ink-900 dark:text-ink-100 dark:border-ink-700 dark:hover:bg-ink-800",
  ghost:
    "bg-transparent text-ink-600 hover:bg-ink-200/60 border-transparent dark:text-ink-300 dark:hover:bg-ink-800",
  danger:
    "bg-white text-red-700 hover:bg-red-50 border-red-300 dark:bg-ink-900 dark:hover:bg-red-950/40",
};

const SIZES = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-9 px-3.5 text-sm gap-2",
  lg: "h-11 px-5 text-sm gap-2",
};

export function Button({
  variant = "secondary",
  size = "md",
  className,
  loading,
  disabled,
  children,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center rounded-lg border font-medium",
        "transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {loading && <Spinner className="h-3.5 w-3.5" />}
      {children}
    </button>
  );
}

export function Spinner({ className }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block animate-spin rounded-full border-2 border-current border-t-transparent opacity-60",
        "motion-reduce:animate-[spin_2.4s_linear_infinite]",
        className || "h-4 w-4",
      )}
    />
  );
}

/* --- surfaces ------------------------------------------------------------- */

export function Card({ className, children, ...props }) {
  return (
    <div className={cn("surface", className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ title, note, actions, className }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 border-b divider px-5 py-3.5",
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="truncate text-sm font-semibold">{title}</h2>
        {note && <p className="mt-0.5 text-xs muted">{note}</p>}
      </div>
      {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Section({ eyebrow, title, description, actions, children }) {
  return (
    <section className="mb-8">
      {(eyebrow || title || actions) && (
        <div className="mb-3 flex flex-wrap items-end gap-3">
          <div>
            {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
            {title && <h2 className="text-lg font-semibold tracking-tight">{title}</h2>}
            {description && <p className="mt-1 text-sm muted">{description}</p>}
          </div>
          {actions && <div className="ml-auto flex gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

/* --- pills ---------------------------------------------------------------- */

export function Pill({ className, children, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5",
        "text-2xs font-semibold",
        className || "bg-ink-200/60 text-ink-700 dark:bg-ink-800 dark:text-ink-300",
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/* --- stats ---------------------------------------------------------------- */

export function StatTile({ label, value, hint, tone = "default", icon }) {
  return (
    <div className="surface px-4 py-3.5">
      <div className="flex items-start justify-between gap-2">
        <p className="eyebrow">{label}</p>
        {icon && <span className="text-base leading-none opacity-70">{icon}</span>}
      </div>
      <p
        className={cn(
          "tnum mt-1.5 text-2xl font-semibold tracking-tight",
          tone === "muted" && "muted",
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-0.5 text-xs muted">{hint}</p>}
    </div>
  );
}

/* --- states --------------------------------------------------------------- */

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="surface flex flex-col items-center gap-3 px-6 py-14 text-center">
      {icon && (
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent-500/10 text-2xl">
          {icon}
        </div>
      )}
      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        {description && (
          <p className="mx-auto mt-1.5 max-w-sm text-sm muted">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="surface border-red-300 px-5 py-6 dark:border-red-900/60">
      <p className="text-sm font-semibold text-red-700 dark:text-red-400">
        Something went wrong
      </p>
      <p className="mt-1 text-sm muted">{String(error?.message || error)}</p>
      {onRetry && (
        <Button className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function Skeleton({ className }) {
  return <div className={cn("skeleton", className || "h-4 w-full")} />;
}

export function TableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <div className="divide-y divider">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-5 py-3">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton
              key={c}
              className={cn("h-3.5", c === 0 ? "w-40" : "w-20")}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/* --- banners -------------------------------------------------------------- */

const BANNER_TONES = {
  info: "bg-accent-500/[0.07] border-accent-500/25 text-ink-700 dark:text-ink-200",
  caution: "bg-amber-500/[0.09] border-amber-500/30 text-ink-700 dark:text-ink-200",
  danger: "bg-red-500/[0.07] border-red-500/30 text-red-800 dark:text-red-300",
};

export function Banner({ tone = "info", icon, title, children, className }) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        BANNER_TONES[tone],
        className,
      )}
    >
      <div className="flex gap-3">
        {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
        <div className="min-w-0">
          {title && <p className="font-semibold">{title}</p>}
          <div className={cn(title && "mt-0.5", "leading-relaxed")}>{children}</div>
        </div>
      </div>
    </div>
  );
}

/* --- tabs ----------------------------------------------------------------- */

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b divider" role="tablist">
      {tabs.map((tab) => {
        const on = tab.id === active;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative whitespace-nowrap px-3.5 py-2.5 text-sm font-medium transition-colors",
              on
                ? "text-ink-900 dark:text-white"
                : "muted hover:text-ink-800 dark:hover:text-ink-100",
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="tnum ml-1.5 text-xs muted">{tab.count}</span>
            )}
            {on && (
              <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent-600" />
            )}
          </button>
        );
      })}
    </div>
  );
}

/* --- progress ------------------------------------------------------------- */

export function ProgressBar({ value, className, indeterminate }) {
  return (
    <div
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-ink-200 dark:bg-ink-800",
        className,
      )}
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn(
          "h-full rounded-full bg-accent-600 transition-[width] duration-500 ease-out",
          "motion-reduce:transition-none",
        )}
        style={{ width: `${Math.max(2, Math.min(100, value || 0))}%` }}
      />
    </div>
  );
}

/* --- form fields ---------------------------------------------------------- */

export function Field({ label, hint, required, children, className }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 flex items-baseline gap-1.5 text-xs font-medium text-ink-700 dark:text-ink-300">
        {label}
        {required && <span className="text-accent-600">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs muted">{hint}</span>}
    </label>
  );
}

export function Input(props) {
  return <input {...props} className={cn("field-input", props.className)} />;
}

export function Textarea(props) {
  return (
    <textarea
      rows={3}
      {...props}
      className={cn("field-input resize-y leading-relaxed", props.className)}
    />
  );
}

export function Select({ children, ...props }) {
  return (
    <select {...props} className={cn("field-input pr-8", props.className)}>
      {children}
    </select>
  );
}

/** A repeatable list of short strings — capabilities, problems, keywords.
 *  Spec §6 asks for "+ Add Capability" rather than a comma-soup textarea. */
export function ListBuilder({ items, onChange, placeholder, addLabel = "Add" }) {
  const [draft, setDraft] = useState("");

  function add() {
    const value = draft.trim();
    if (!value) return;
    onChange([...(items || []), value]);
    setDraft("");
  }

  return (
    <div>
      {(items || []).length > 0 && (
        <ul className="mb-2 space-y-1.5">
          {items.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="surface-muted flex items-center gap-2 px-3 py-1.5 text-sm"
            >
              <span className="min-w-0 flex-1 break-words">{item}</span>
              <button
                type="button"
                aria-label={`Remove ${item}`}
                onClick={() => onChange(items.filter((_, i) => i !== index))}
                className="shrink-0 rounded px-1 text-xs muted hover:text-red-600"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <Input
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <Button type="button" onClick={add} className="shrink-0">
          + {addLabel}
        </Button>
      </div>
    </div>
  );
}

/* --- modal + confirm ------------------------------------------------------ */

export function Modal({ open, onClose, title, description, children, width = "max-w-lg" }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div
        className="absolute inset-0 bg-ink-950/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "surface relative w-full animate-fade-up p-5 shadow-lift",
          width,
        )}
      >
        {title && <h2 className="text-base font-semibold">{title}</h2>}
        {description && <p className="mt-1 text-sm muted">{description}</p>}
        <div className={cn(title && "mt-4")}>{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Delete",
  loading = false,
}) {
  return (
    <Modal open={open} onClose={loading ? undefined : onClose} title={title} description={description}>
      <div className="flex justify-end gap-2">
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

/* --- toasts --------------------------------------------------------------- */

const ToastContext = createContext(() => {});
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  function push(message, tone = "success") {
    const id = Math.random().toString(36).slice(2);
    setToasts((current) => [...current, { id, message, tone }]);
    setTimeout(
      () => setToasts((current) => current.filter((t) => t.id !== id)),
      tone === "error" ? 8000 : 4000,
    );
  }

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[60] flex w-80 flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={cn(
              "surface pointer-events-auto animate-fade-up px-4 py-3 text-sm shadow-lift",
              toast.tone === "error" &&
                "border-red-300 text-red-700 dark:border-red-900/60 dark:text-red-400",
            )}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* --- data fetching -------------------------------------------------------- */

/** Minimal request hook: loading, error, data, refetch. Enough for this app,
 *  and it keeps every page's fetch lifecycle identical. */
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ loading: true, error: null, data: null });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    Promise.resolve()
      .then(fn)
      .then((data) => alive && setState({ loading: false, error: null, data }))
      .catch((error) => alive && setState({ loading: false, error, data: null }));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  return { ...state, refetch: () => setNonce((n) => n + 1) };
}
