# Lead Intelligence — frontend

React + Vite + Tailwind. A separate application from the FastAPI backend: its
own dependencies, its own build, its own deployment.

```bash
npm install
npm run dev        # http://localhost:5173
```

It talks to the backend in `../backend` by default. Start that first:

```bash
cd ../backend && uvicorn app.main:app --reload
```

To design without a backend, run on fixtures instead — a banner across the top
says so, so nobody mistakes a seeded researcher for a real one:

```bash
VITE_USE_MOCKS=true npm run dev
```

## How it talks to the backend

Everything goes through `src/api/client.js`. Pages never call `fetch`, never
see a URL, and never receive a shape the real API wouldn't return.

```js
export function getLead(id) {
  if (USE_MOCKS) return delay(mock.getLead(id));
  return http(`/api/leads/${id}`);
}
```

The fixtures in `src/api/mocks.js` mirror `backend/app/schemas.py` field for
field, so the two paths cannot drift into different shapes.

In development Vite proxies `/api` and `/health` to `http://127.0.0.1:8000`, so
the browser sees one origin and there is no CORS to configure. For a
cross-origin production deploy, set `CORS_ORIGINS` on the backend.

## Deliberate fixture choices

The fixtures are not a happy path. They are the shapes the UI has to survive,
and they are the reason the mock path is worth keeping:

- **A lead with no email.** `lead-okafor` has nothing attributable, plus a
  shared lab address held back with the reason it was rejected.
- **A component with no evidence.** `lead-smith` scores 94 with
  `purchase_signals` ungrounded — the case where an honest UI and a dishonest
  one look different.
- **An unprofiled product.** `prod-satellite` has `intelligence: null`, the
  state every product is in right after creation.
- **A failed task and a running one.** `task-remote` carries a real
  `BudgetError`; `task-cv` is mid-scan.

A fixture set where everything is populated produces a UI that falls apart on
first contact with real data.

## The rules the UI enforces

The scoring model goes to some length to keep a score honest, and a dashboard
can undo all of it in one badge. Three rules live in the markup:

**Score and confidence never merge.** Separate columns in the table, separate
figures on the profile. A high score on thin evidence means "worth a look",
not "qualified".

**An unevidenced component is hatched, not drawn as an empty bar.** An empty
bar says *measured, found nothing*. Hatching says *never evaluated*. See
`.hatched` in `index.css` and `ComponentRow` in `components/score.jsx`.

**Inferences are labelled, next to the facts they rest on.** Pain points carry
`AI inference` or `stated`; evidence cards show a "Rests on" list.

## Layout

```
src/
  api/client.js      the only place that knows about HTTP
  api/mocks.js       Stage-1 fixtures, shaped like app/schemas.py
  lib/format.js      numbers, dates, potential tiers, pipeline statuses
  components/ui.jsx  buttons, cards, fields, modal, toasts, useAsync
  components/score.jsx   dial, breakdown, evidence, product match, pain points
  components/Navbar.jsx  nav + global search
  pages/             Home, Products, ProductForm, ProductDetail,
                     TaskForm, TaskDetail, Leads, LeadProfile
```

## Potential tiers

The backend assigns the band (`scoring.py`: 75 / 50 / 25). The UI renders the
spec's wording for those same four buckets rather than re-deriving tiers from
the raw score — two threshold systems would eventually disagree, and a lead
labelled "High Potential" on screen while the API calls it Medium is a bug
nobody notices until a customer asks.

| API band | Shown as |
|---|---|
| `High` | 🔥 High Potential |
| `Medium` | 🟡 Potential |
| `Low` | ⚪ Low Potential |
| `Not a fit` | ✕ Not a Fit |
