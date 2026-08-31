/* The single seam between the UI and the backend.
 *
 * Pages never call `fetch`, never know a URL, and never see a shape the real
 * API wouldn't return. Every function has the same form: talk to the backend,
 * or serve a fixture that mirrors backend/app/schemas.py field for field.
 *
 * The backend now implements every endpoint below, so real data is the
 * default. Fixtures remain for designing against states that are tedious to
 * reproduce — a lead with no attributable email, a task mid-scan, a product
 * with no intelligence profile:
 *
 *     VITE_USE_MOCKS=true npm run dev
 */

import * as mock from "./mocks";

export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

/** Network latency simulation. Real requests take time; a UI built against
 *  instant fixtures hides every missing loading state. */
const LATENCY = USE_MOCKS ? 260 : 0;

function delay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY));
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function http(path, { method = "GET", body, signal } = {}) {
  const response = await fetch(path, {
    method,
    signal,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }

  if (!response.ok) {
    const detail =
      payload && typeof payload === "object" && payload.detail
        ? payload.detail
        : response.statusText;
    throw new ApiError(
      typeof detail === "string" ? detail : JSON.stringify(detail),
      response.status,
    );
  }
  return payload;
}

function query(params = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, value);
    }
  }
  const string = search.toString();
  return string ? `?${string}` : "";
}

// --- meta ------------------------------------------------------------------

export function getHealth() {
  if (USE_MOCKS) return delay(mock.health());
  return http("/health");
}

// --- settings ----------------------------------------------------------------

export function getLlmSettings() {
  if (USE_MOCKS) return delay(mock.getLlmSettings());
  return http("/api/settings/llm");
}

export function updateLlmSettings(payload) {
  if (USE_MOCKS) return delay(mock.updateLlmSettings(payload));
  return http("/api/settings/llm", { method: "PUT", body: payload });
}

/** Totals for the home dashboard. */
export function getDashboard() {
  if (USE_MOCKS) return delay(mock.dashboard());
  return http("/api/dashboard");
}

// --- products --------------------------------------------------------------

export function listProducts() {
  if (USE_MOCKS) return delay(mock.listProducts());
  return http("/api/products");
}

export function getProduct(id) {
  if (USE_MOCKS) return delay(mock.getProduct(id));
  return http(`/api/products/${id}`);
}

export function createProduct(payload) {
  if (USE_MOCKS) return delay(mock.createProduct(payload));
  return http("/api/products", { method: "POST", body: payload });
}

export function updateProduct(id, payload) {
  if (USE_MOCKS) return delay(mock.updateProduct(id, payload));
  return http(`/api/products/${id}`, { method: "PATCH", body: payload });
}

export function generateIntelligence(id) {
  if (USE_MOCKS) return delay(mock.generateIntelligence(id));
  return http(`/api/products/${id}/intelligence`, { method: "POST" });
}

/** Cascades to tasks, papers, leads, evidence and scores. The caller confirms
 *  first; this does not second-guess a confirmed request. */
export function deleteProduct(id) {
  if (USE_MOCKS) return delay(mock.deleteProduct(id));
  return http(`/api/products/${id}`, { method: "DELETE" });
}

// --- tasks -----------------------------------------------------------------

export function listTasks(params = {}) {
  if (USE_MOCKS) return delay(mock.listTasks(params));
  return http(`/api/tasks${query(params)}`);
}

export function getTask(id) {
  if (USE_MOCKS) return delay(mock.getTask(id));
  return http(`/api/tasks/${id}`);
}

/** Rejected by the backend with 409 while the task is running. */
export function updateTask(id, payload) {
  if (USE_MOCKS) return delay(mock.updateTask(id, payload));
  return http(`/api/tasks/${id}`, { method: "PATCH", body: payload });
}

/** `productId` may be null/undefined — a task with no product mines papers
 *  and authors but scores nothing. */
export function createTask(productId, payload) {
  if (USE_MOCKS) return delay(mock.createTask(productId, payload));
  if (!productId) {
    return http("/api/tasks", {
      method: "POST",
      body: { ...payload, product_id: null },
    });
  }
  return http(`/api/products/${productId}/tasks`, {
    method: "POST",
    body: payload,
  });
}

export function runTask(id) {
  if (USE_MOCKS) return delay(mock.runTask(id));
  return http(`/api/tasks/${id}/run`, { method: "POST" });
}

export function getTaskOverview(id) {
  if (USE_MOCKS) return delay(mock.getTaskOverview(id));
  return http(`/api/tasks/${id}/overview`);
}

export function analyzePapers(id) {
  if (USE_MOCKS) return delay(mock.analyzePapers(id));
  return http(`/api/tasks/${id}/analyze-papers`, { method: "POST" });
}

export function analyzeLeads(id) {
  if (USE_MOCKS) return delay(mock.analyzeLeads(id));
  return http(`/api/tasks/${id}/analyze`, { method: "POST" });
}

export function listRuns(taskId) {
  if (USE_MOCKS) return delay(mock.listRuns(taskId));
  return http(`/api/runs${query({ task_id: taskId })}`);
}

/** Rejected by the backend with 409 while the task is running. */
export function deleteTask(id) {
  if (USE_MOCKS) return delay(mock.deleteTask(id));
  return http(`/api/tasks/${id}`, { method: "DELETE" });
}

// --- leads -----------------------------------------------------------------

/** Every lead across every task, ranked. Optionally scoped by product or task. */
export function listLeads(params = {}) {
  if (USE_MOCKS) return delay(mock.listLeads(params));
  return http(`/api/leads${query(params)}`);
}

export function getLead(id) {
  if (USE_MOCKS) return delay(mock.getLead(id));
  return http(`/api/leads/${id}`);
}

/** Free-text search across names, institutions, topics, papers and contacts. */
export function search(term) {
  if (USE_MOCKS) return delay(mock.search(term));
  return http(`/api/search${query({ q: term })}`);
}

export function leadsCsvUrl(params = {}) {
  return `/api/leads.csv${query(params)}`;
}

// --- lead workflow (spec §23–§25) ------------------------------------------

export function setLeadStatus(id, status) {
  if (USE_MOCKS) return delay(mock.setLeadStatus(id, status));
  return http(`/api/leads/${id}`, { method: "PATCH", body: { status } });
}

export function listNotes(id) {
  if (USE_MOCKS) return delay(mock.listNotes(id));
  return http(`/api/leads/${id}/notes`);
}

export function addNote(id, text) {
  if (USE_MOCKS) return delay(mock.addNote(id, text));
  return http(`/api/leads/${id}/notes`, { method: "POST", body: { text } });
}

export function listActivity(id) {
  if (USE_MOCKS) return delay(mock.listActivity(id));
  return http(`/api/leads/${id}/activity`);
}

/** Generates a draft only. Nothing is ever sent from the MVP. */
export function generateOutreachDraft(id) {
  if (USE_MOCKS) return delay(mock.generateOutreachDraft(id));
  return http(`/api/leads/${id}/outreach-draft`, { method: "POST" });
}
