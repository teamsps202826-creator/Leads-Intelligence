/* Stage-1 fixtures.
 *
 * Every shape here mirrors app/schemas.py exactly — same field names, same
 * nullability, same nesting. That is deliberate: the point of building on
 * fixtures is to design the UI, not to invent a second data model that has to
 * be reconciled later.
 *
 * Two rules the fixtures follow, because the UI has to handle both honestly:
 *
 *   1. Some leads are missing data. No email, no ORCID, no department, unknown
 *      seniority. A fixture set where every record is complete produces a UI
 *      that falls apart on real data.
 *   2. Some score components are ungrounded. Those must render as "not
 *      evaluated", never as a measured zero.
 */

let seq = 0;
const uid = (prefix) => `${prefix}-${(++seq).toString().padStart(4, "0")}`;

const iso = (daysAgo, hoursAgo = 0) =>
  new Date(Date.now() - daysAgo * 86400000 - hoursAgo * 3600000).toISOString();

// --- products --------------------------------------------------------------

const products = [
  {
    id: "prod-longvideo",
    owner_id: "user-1",
    name: "Long Video AI Platform",
    short_description:
      "AI platform for long-video understanding and efficient multimodal inference.",
    long_description:
      "A self-hostable inference platform for vision-language models operating over hour-scale video. Handles temporal chunking, KV-cache reuse across segments, and GPU scheduling for multi-tenant research clusters.",
    research_keywords: [
      "long video understanding",
      "vision language model",
      "temporal reasoning",
      "multimodal inference",
    ],
    problems_solved: [
      "Inference cost on hour-scale video is prohibitive",
      "GPU utilisation collapses on variable-length inputs",
      "Long-video context exceeds model windows",
    ],
    pain_points: [
      "Multi-day evaluation runs on video benchmarks",
      "Cluster contention between lab members",
    ],
    technologies: ["VLM", "CUDA", "vLLM", "PyTorch"],
    alternatives: ["vLLM", "TensorRT-LLM", "Ray Serve"],
    target_roles: ["Computer vision PI", "ML infrastructure lead"],
    target_industries: ["Academic research", "Autonomous systems"],
    technical_capabilities: [
      "Video understanding",
      "Multimodal inference",
      "GPU optimisation",
      "Private deployment",
    ],
    intelligence: {
      summary:
        "A self-hosted inference platform targeting research groups that run vision-language models over long video, where cost and GPU scheduling dominate the workflow.",
      capabilities: [
        {
          name: "Long-video chunked inference",
          description:
            "Segments hour-scale video and reuses attention state across segments.",
          solves_problems: ["Long-video context exceeds model windows"],
        },
        {
          name: "GPU scheduling",
          description: "Multi-tenant queueing for shared lab clusters.",
          solves_problems: ["GPU utilisation collapses on variable-length inputs"],
        },
        {
          name: "Private deployment",
          description: "Runs entirely inside the institution's network.",
          solves_problems: ["Data cannot leave the institution"],
        },
      ],
      target_customers: [
        "Computer vision groups publishing on video-language models",
        "Labs running large-scale video benchmark evaluations",
      ],
      pain_points: [
        "Evaluation runs measured in GPU-days",
        "Video benchmarks that do not fit in a model context window",
      ],
      research_signals: [
        "Papers reporting GPU-hours or A100/H100 counts",
        "Benchmarks over untrimmed or hour-scale video",
        "Ablations limited by compute budget",
      ],
      positive_signals: [
        "Explicit mention of inference cost or latency as a limitation",
        "Self-hosted cluster described in the methods",
      ],
      negative_signals: [
        "Purely theoretical work with no compute footprint",
        "Already committed to a managed cloud inference vendor",
      ],
      technical_requirements: [
        "NVIDIA GPUs, Linux, containerised deployment",
      ],
    },
    intelligence_model: "claude-opus-5",
    intelligence_generated_at: iso(2, 4),
    created_at: iso(31),
    capabilities: [],
  },
  {
    id: "prod-satellite",
    owner_id: "user-1",
    name: "Satellite Vision Platform",
    short_description: "AI solution for large-scale satellite image analysis.",
    long_description:
      "Tiled inference and change-detection pipeline for multispectral satellite imagery at continental scale.",
    research_keywords: ["remote sensing", "change detection", "multispectral"],
    problems_solved: ["Tiling artefacts at scene boundaries"],
    pain_points: [],
    technologies: ["Segmentation", "Sentinel-2"],
    alternatives: ["Google Earth Engine"],
    target_roles: ["Remote sensing researcher"],
    target_industries: ["Earth observation"],
    technical_capabilities: ["Tiled inference", "Change detection"],
    // Deliberately un-profiled: the UI must handle a product with no
    // intelligence yet, because that is the state right after creation.
    intelligence: null,
    intelligence_model: null,
    intelligence_generated_at: null,
    created_at: iso(9),
    capabilities: [],
  },
];

// --- tasks -----------------------------------------------------------------

const tasks = [
  {
    id: "task-vlm",
    product_id: "prod-longvideo",
    name: "VLM Researchers",
    topics: ["video-language models"],
    keywords: ["long video understanding", "video question answering", "VLM"],
    countries: [],
    year_from: 2024,
    year_to: 2026,
    max_papers: 500,
    sources: ["openalex", "europepmc"],
    status: "succeeded",
    progress: { stage: "done", papers: 428, leads: 93, enriched: 41 },
    error: null,
    started_at: iso(1, 3),
    finished_at: iso(1, 2),
    created_at: iso(1, 3),
  },
  {
    id: "task-cv",
    product_id: "prod-longvideo",
    name: "Computer Vision — temporal",
    topics: [],
    keywords: ["temporal reasoning", "video transformer"],
    countries: ["US", "GB"],
    year_from: 2025,
    year_to: 2026,
    max_papers: 400,
    sources: ["openalex"],
    status: "running",
    progress: { stage: "enriching", papers: 215, leads: 41, enriched: 12 },
    error: null,
    started_at: iso(0, 0.2),
    finished_at: null,
    created_at: iso(0, 0.3),
  },
  {
    id: "task-robotics",
    product_id: "prod-longvideo",
    name: "Robotics Research",
    topics: [],
    keywords: ["robot learning", "embodied video"],
    countries: [],
    year_from: 2025,
    year_to: null,
    max_papers: 300,
    sources: ["openalex"],
    status: "pending",
    progress: null,
    error: null,
    started_at: null,
    finished_at: null,
    created_at: iso(0, 1),
  },
  {
    id: "task-remote",
    product_id: "prod-satellite",
    name: "Remote Sensing 2025",
    topics: [],
    keywords: ["change detection", "Sentinel-2"],
    countries: [],
    year_from: 2025,
    year_to: 2026,
    max_papers: 250,
    sources: ["openalex"],
    status: "failed",
    progress: { stage: "fetching" },
    error: "BudgetError: OpenAlex daily page budget exhausted",
    started_at: iso(3),
    finished_at: iso(3),
    created_at: iso(3),
  },
];

// --- leads -----------------------------------------------------------------

function component(key, label, weight, value, evidenceIds, rationale, note) {
  const grounded = Boolean(evidenceIds && evidenceIds.length);
  return {
    key,
    label,
    weight,
    value: grounded ? value : 0,
    contribution: grounded ? Number((value * weight * 100).toFixed(2)) : 0,
    grounded,
    evidence_ids: evidenceIds || [],
    rationale: grounded ? rationale : null,
    note: grounded ? null : note || "no supporting evidence",
  };
}

const leadSeeds = [
  {
    id: "lead-smith",
    name: "John Smith",
    position: "Professor of Computer Science",
    institution: "Massachusetts Institute of Technology",
    department: "CSAIL",
    country: "US",
    seniority: "PI / senior",
    orcid: "0000-0002-1825-0097",
    email: "jsmith@csail.mit.edu",
    email_method: "published_affiliation",
    website: "https://people.csail.mit.edu/jsmith",
    scholar: "https://scholar.google.com/citations?user=abc123",
    github: "https://github.com/jsmith-lab",
    linkedin: null,
    paper_count: 24,
    recent_paper_count: 9,
    total_citations: 4820,
    first_year: 2018,
    last_year: 2026,
    score: 94.2,
    band: "High",
    confidence: 0.9,
    status: "New",
    interests: [
      "Computer Vision",
      "Long Video Understanding",
      "Multimodal AI",
      "Vision Language Models",
      "Temporal Reasoning",
    ],
    task_id: "task-vlm",
  },
  {
    id: "lead-chen",
    name: "Sarah Chen",
    position: "Associate Professor",
    institution: "Stanford University",
    department: "Department of Electrical Engineering",
    country: "US",
    seniority: "PI / senior",
    orcid: "0000-0001-5109-3700",
    email: "s.chen@stanford.edu",
    email_method: "published_affiliation",
    website: null,
    scholar: "https://scholar.google.com/citations?user=def456",
    github: null,
    linkedin: null,
    paper_count: 18,
    recent_paper_count: 7,
    total_citations: 3110,
    first_year: 2019,
    last_year: 2026,
    score: 88.5,
    band: "High",
    confidence: 0.75,
    status: "Reviewed",
    interests: ["Video Transformers", "Efficient Inference", "Computer Vision"],
    task_id: "task-vlm",
  },
  {
    id: "lead-okafor",
    name: "Adaeze Okafor",
    position: null,
    institution: "University of Oxford",
    department: null,
    country: "GB",
    seniority: "PI / senior",
    orcid: null,
    // No attributable address — the UI has to show this state without
    // implying the lead is unreachable-by-fault.
    email: null,
    email_method: null,
    website: null,
    scholar: null,
    github: null,
    linkedin: null,
    paper_count: 13,
    recent_paper_count: 5,
    total_citations: 1290,
    first_year: 2020,
    last_year: 2026,
    score: 71.4,
    band: "Medium",
    confidence: 0.55,
    status: "Qualified",
    interests: ["Robotics", "Embodied AI", "Video Perception"],
    task_id: "task-vlm",
  },
  {
    id: "lead-kumar",
    name: "David Kumar",
    position: "Research Scientist",
    institution: "Carnegie Mellon University",
    department: "Language Technologies Institute",
    country: "US",
    seniority: "unclear",
    orcid: null,
    email: null,
    email_method: null,
    website: null,
    scholar: null,
    github: null,
    linkedin: null,
    paper_count: 31,
    recent_paper_count: 4,
    total_citations: 5600,
    first_year: 2015,
    last_year: 2025,
    score: 58.0,
    band: "Medium",
    confidence: 0.35,
    status: "New",
    interests: ["NLP", "Speech", "Multimodal"],
    task_id: "task-vlm",
  },
  {
    id: "lead-mueller",
    name: "Lena Müller",
    position: "Postdoctoral Researcher",
    institution: "ETH Zürich",
    department: "Institute for Visual Computing",
    country: "CH",
    seniority: "student / postdoc",
    orcid: "0000-0003-4444-1111",
    email: null,
    email_method: null,
    website: null,
    scholar: null,
    github: null,
    linkedin: null,
    paper_count: 6,
    recent_paper_count: 6,
    total_citations: 210,
    first_year: 2024,
    last_year: 2026,
    score: 44.8,
    band: "Low",
    confidence: 0.45,
    status: "New",
    interests: ["Neural Rendering", "Video Synthesis"],
    task_id: "task-cv",
  },
  {
    id: "lead-tanaka",
    name: "Hiroshi Tanaka",
    position: null,
    institution: "University of Tokyo",
    department: null,
    country: "JP",
    seniority: "PI / senior",
    orcid: null,
    email: null,
    email_method: null,
    website: null,
    scholar: null,
    github: null,
    linkedin: null,
    paper_count: 11,
    recent_paper_count: 2,
    total_citations: 890,
    first_year: 2017,
    last_year: 2025,
    score: 22.1,
    band: "Not a fit",
    confidence: 0.2,
    status: "Not a Fit",
    interests: ["Medical Imaging", "Segmentation"],
    task_id: "task-cv",
  },
];

const papersByLead = {
  "lead-smith": [
    {
      id: "paper-1",
      external_id: "W4390001",
      title: "Long Video Understanding with Multimodal Models",
      doi: "10.1000/longvideo.2026",
      url: "https://doi.org/10.1000/longvideo.2026",
      publication_year: 2026,
      cited_by_count: 42,
      source_id: "src-1",
      product_relevance: 0.94,
      methods: [
        {
          value: "temporal chunking",
          quote: "we segment untrimmed video into overlapping temporal chunks",
        },
      ],
      datasets: [
        { value: "LVU", quote: "evaluated on the LVU benchmark" },
        { value: "EgoSchema", quote: "and on EgoSchema for long-form reasoning" },
      ],
      compute_signals: [
        {
          value: "64 A100 GPUs",
          quote: "training required 64 A100 GPUs for six days",
        },
      ],
      pain_points: [
        {
          value: "inference cost",
          quote:
            "inference cost remains the primary barrier to scaling to hour-long video",
        },
      ],
    },
    {
      id: "paper-2",
      external_id: "W4390002",
      title: "Efficient Video Reasoning with Large Vision Models",
      doi: "10.1000/efficient.2025",
      url: "https://doi.org/10.1000/efficient.2025",
      publication_year: 2025,
      cited_by_count: 118,
      source_id: "src-1",
      product_relevance: 0.81,
      methods: [
        { value: "KV-cache reuse", quote: "we reuse the KV cache across segments" },
      ],
      datasets: [],
      compute_signals: [
        { value: "8×H100", quote: "all experiments ran on a single 8×H100 node" },
      ],
      pain_points: [],
    },
    {
      id: "paper-3",
      external_id: "W4390003",
      title: "Temporal Grounding in Untrimmed Video",
      doi: null,
      url: null,
      publication_year: 2024,
      cited_by_count: 260,
      source_id: "src-1",
      product_relevance: 0.62,
      methods: [],
      datasets: [],
      compute_signals: [],
      pain_points: [],
    },
  ],
};

const evidenceByLead = {
  "lead-smith": [
    {
      id: "ev-1",
      kind: "FACT",
      category: "research_relevance",
      statement:
        "Publishes on long-video understanding with multimodal models.",
      quote: "we segment untrimmed video into overlapping temporal chunks",
      ref_type: "paper",
      ref_id: "paper-1",
      ref_field: "abstract",
      supported_by: [],
      confidence: null,
    },
    {
      id: "ev-2",
      kind: "FACT",
      category: "compute_footprint",
      statement: "Reports a substantial GPU training footprint.",
      quote: "training required 64 A100 GPUs for six days",
      ref_type: "paper",
      ref_id: "paper-1",
      ref_field: "abstract",
      supported_by: [],
      confidence: null,
    },
    {
      id: "ev-3",
      kind: "FACT",
      category: "stated_limitation",
      statement: "States inference cost as the barrier to scaling.",
      quote:
        "inference cost remains the primary barrier to scaling to hour-long video",
      ref_type: "paper",
      ref_id: "paper-1",
      ref_field: "abstract",
      supported_by: [],
      confidence: null,
    },
    {
      id: "ev-4",
      kind: "FACT",
      category: "technical_stack",
      statement: "Runs on NVIDIA H100 hardware.",
      quote: "all experiments ran on a single 8×H100 node",
      ref_type: "paper",
      ref_id: "paper-2",
      ref_field: "abstract",
      supported_by: [],
      confidence: null,
    },
    {
      id: "ev-5",
      kind: "INFERENCE",
      category: "problem_match",
      statement:
        "Likely to face rising inference cost as video length scales, which is the problem this product addresses.",
      quote: null,
      ref_type: null,
      ref_id: null,
      ref_field: null,
      supported_by: ["ev-2", "ev-3"],
      confidence: 0.8,
    },
    {
      id: "ev-6",
      kind: "INFERENCE",
      category: "technical_compatibility",
      statement:
        "Existing NVIDIA cluster is compatible with the product's deployment requirements.",
      quote: null,
      ref_type: null,
      ref_id: null,
      ref_field: null,
      supported_by: ["ev-4"],
      confidence: 0.7,
    },
  ],
};

const scoreByLead = {
  "lead-smith": {
    id: "score-1",
    analysis_run_id: "run-2",
    score: 94.2,
    band: "High",
    confidence: 0.9,
    components: {
      research_relevance: component(
        "research_relevance",
        "Research relevance",
        0.25,
        0.96,
        ["ev-1"],
        "Three of the last nine papers are directly on long-video understanding.",
      ),
      problem_match: component(
        "problem_match",
        "Problem / pain-point match",
        0.25,
        0.92,
        ["ev-3", "ev-5"],
        "Names inference cost at hour-scale as their limiting factor.",
      ),
      capability_fit: component(
        "capability_fit",
        "Product capability fit",
        0.2,
        0.95,
        ["ev-1", "ev-2"],
        "Chunked inference and GPU scheduling map onto their described workflow.",
      ),
      recent_activity: component(
        "recent_activity",
        "Recent activity",
        0.1,
        0.9,
        ["ev-1"],
        "Nine papers in the last 24 months, most recent 2026.",
      ),
      technical_compatibility: component(
        "technical_compatibility",
        "Technical compatibility",
        0.1,
        0.94,
        ["ev-4", "ev-6"],
        "Runs NVIDIA H100 on-premises, which the product targets.",
      ),
      // The honest one: nothing in the corpus evidences budget or purchase
      // intent, so it contributes zero and says so.
      purchase_signals: component(
        "purchase_signals",
        "Need / purchase signals",
        0.1,
        0,
        [],
        null,
        "no grant, tender or procurement record found in the scanned sources",
      ),
    },
    why_relevant:
      "Their recent publications focus on large-scale video understanding and multimodal inference, and they explicitly name inference cost at hour-scale as the limiting factor in their work — which is the problem this product exists to solve.",
    research_problems: [
      "Scaling vision-language inference to hour-long video",
      "Temporal grounding in untrimmed footage",
    ],
    likely_pain_points: [
      "Large inference requirements",
      "High GPU usage during evaluation",
      "Long-video processing cost",
      "Scaling multimodal inference across a shared cluster",
    ],
    matching_capabilities: [
      "Long-video chunked inference",
      "GPU scheduling",
      "Private deployment",
    ],
    technical_compatibility:
      "On-premises NVIDIA H100 cluster; containerised deployment is feasible.",
    objections: [
      "May already have in-house tooling built around vLLM",
      "Academic budget cycles are slow and grant-bound",
    ],
    missing_information: [
      "Need / purchase signals: no grant, tender or procurement record found in the scanned sources",
    ],
    recommended_action:
      "Contact with a technical evaluation focused on reducing large-scale VLM inference cost. Offer a benchmark against their reported 64×A100 training footprint.",
    outreach_angle:
      "Lead with the cost-per-hour-of-video comparison; they have already published the number you need to beat.",
    created_at: iso(1, 1),
  },
};

/** Product-match table (spec §21). Derived from the capability list and the
 *  evidence, never invented — an unmatched requirement says so. */
const productMatchByLead = {
  "lead-smith": [
    {
      requirement: "Long video processing",
      supported: true,
      capability: "Long-video chunked inference",
      evidence_id: "ev-1",
    },
    {
      requirement: "VLM inference",
      supported: true,
      capability: "Multimodal inference",
      evidence_id: "ev-1",
    },
    {
      requirement: "GPU optimisation",
      supported: true,
      capability: "GPU scheduling",
      evidence_id: "ev-2",
    },
    {
      requirement: "Private deployment",
      supported: true,
      capability: "Private deployment",
      evidence_id: "ev-4",
    },
    {
      requirement: "Medical imaging",
      supported: false,
      capability: null,
      evidence_id: null,
    },
  ],
};

const painPointsByLead = {
  "lead-smith": [
    {
      text: "Large inference requirements",
      inferred: false,
      evidence_id: "ev-2",
    },
    { text: "High GPU usage", inferred: false, evidence_id: "ev-4" },
    { text: "Long video processing cost", inferred: false, evidence_id: "ev-3" },
    { text: "Scaling multimodal inference", inferred: true, evidence_id: "ev-5" },
  ],
};

const summaryByLead = {
  "lead-smith":
    "Works on vision-language models applied to untrimmed, hour-scale video, with a recent emphasis on making inference tractable — temporal chunking, cache reuse across segments, and evaluation on long-form reasoning benchmarks.",
};

// Mutable stores so the UI's write paths are exercised in Stage 1.
const notes = {
  "lead-smith": [
    {
      id: "note-1",
      text: "Met this researcher at CVPR 2026 — mentioned the cluster is oversubscribed.",
      author: "You",
      created_at: iso(4),
    },
  ],
};

const activity = {
  "lead-smith": [
    { id: "act-1", kind: "analysis", text: "AI analysed lead — score 94.2", at: iso(1, 1) },
    { id: "act-2", kind: "note", text: "Note added", at: iso(4) },
    { id: "act-3", kind: "discovery", text: "Research task discovered author", at: iso(1, 3) },
    {
      id: "act-4",
      kind: "paper",
      text: 'Paper discovered: "Long Video Understanding with Multimodal Models"',
      at: iso(1, 3),
    },
    { id: "act-5", kind: "created", text: "Lead profile created", at: iso(1, 3) },
  ],
};

const statuses = Object.fromEntries(leadSeeds.map((l) => [l.id, l.status]));

// --- runs ------------------------------------------------------------------

const runs = [
  {
    id: "run-2",
    kind: "lead_analysis",
    provider: "anthropic",
    model: "claude-opus-5",
    prompt_version: "1.0.0",
    scoring_version: "1.0.0",
    status: "succeeded",
    stats: { leads: 93, scored: 93, failed: 0 },
    error: null,
    started_at: iso(1, 1.5),
    finished_at: iso(1, 1),
    task_id: "task-vlm",
  },
  {
    id: "run-1",
    kind: "paper_analysis",
    provider: "anthropic",
    model: "claude-opus-5",
    prompt_version: "1.0.0",
    scoring_version: "1.0.0",
    status: "succeeded",
    stats: {
      papers: 428,
      analyzed: 428,
      failed: 0,
      items_kept: 611,
      items_dropped_unverified: 4,
    },
    error: null,
    started_at: iso(1, 2),
    finished_at: iso(1, 1.6),
    task_id: "task-vlm",
  },
];

// --- row assembly ----------------------------------------------------------

function taskOf(id) {
  return tasks.find((t) => t.id === id);
}

function leadRow(seed) {
  const task = taskOf(seed.task_id);
  const product = products.find((p) => p.id === task?.product_id);
  return {
    id: seed.id,
    task_id: seed.task_id,
    task_name: task?.name ?? null,
    product_name: product?.name ?? null,
    name: seed.name,
    institution: seed.institution,
    department: seed.department,
    country: seed.country,
    seniority: seed.seniority,
    orcid: seed.orcid,
    email: seed.email,
    paper_count: seed.paper_count,
    recent_paper_count: seed.recent_paper_count,
    total_citations: seed.total_citations,
    first_year: seed.first_year,
    last_year: seed.last_year,
    score: seed.score,
    band: seed.band,
    confidence: seed.confidence,
    // UI-only, from the workflow endpoints
    status: statuses[seed.id],
    position: seed.position,
    interests: seed.interests,
  };
}

// --- exported fixture API --------------------------------------------------

export function health() {
  return {
    status: "ok",
    database: "sqlite",
    llm_provider: "mock",
    llm_model: "mock-1",
    embedding_provider: "tfidf",
    outbound_enabled: false,
  };
}

let llmSettings = {
  provider: "mock",
  model: "claude-opus-5",
  effort: "high",
  api_key_set: false,
  updated_at: null,
};

export function getLlmSettings() {
  return { ...llmSettings };
}

export function updateLlmSettings(payload) {
  if (payload.provider === "anthropic" && !payload.api_key && !llmSettings.api_key_set) {
    throw new Error("an API key is required to use the anthropic provider");
  }
  llmSettings = {
    ...llmSettings,
    ...(payload.provider !== undefined && payload.provider !== null ? { provider: payload.provider } : {}),
    ...(payload.model !== undefined && payload.model !== null ? { model: payload.model } : {}),
    ...(payload.effort !== undefined && payload.effort !== null ? { effort: payload.effort } : {}),
    api_key_set: payload.clear_api_key ? false : payload.api_key ? true : llmSettings.api_key_set,
    updated_at: new Date().toISOString(),
  };
  return { ...llmSettings };
}

export function dashboard() {
  return {
    products: products.length,
    tasks: tasks.length,
    papers: 2431,
    leads: leadSeeds.length === 6 ? 487 : leadSeeds.length,
    scored: 431,
    high_potential: 38,
    mean_confidence: 0.62,
    recent_tasks: tasks.slice(0, 4).map((t) => ({
      id: t.id,
      name: t.name,
      status: t.status,
      papers: t.progress?.papers ?? null,
      leads: t.progress?.leads ?? null,
      product_name: products.find((p) => p.id === t.product_id)?.name ?? null,
      created_at: t.created_at,
    })),
  };
}

export function listProducts() {
  return products.map((p) => ({ ...p }));
}

export function getProduct(id) {
  const found = products.find((p) => p.id === id);
  if (!found) throw new Error("product not found");
  return { ...found };
}

export function createProduct(payload) {
  const created = {
    id: uid("prod"),
    owner_id: "user-1",
    intelligence: null,
    intelligence_model: null,
    intelligence_generated_at: null,
    created_at: new Date().toISOString(),
    capabilities: [],
    ...payload,
  };
  products.unshift(created);
  return { ...created };
}

export function updateProduct(id, payload) {
  const found = products.find((p) => p.id === id);
  Object.assign(found, payload);
  return { ...found };
}

export function deleteProduct(id) {
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) throw new Error("product not found");
  products.splice(index, 1);
  return null;
}

export function generateIntelligence(id) {
  const found = products.find((p) => p.id === id);
  found.intelligence = products[0].intelligence;
  found.intelligence_model = "claude-opus-5";
  found.intelligence_generated_at = new Date().toISOString();
  return {
    id: uid("run"),
    kind: "product_intelligence",
    provider: "mock",
    model: "mock-1",
    prompt_version: "1.0.0",
    scoring_version: "1.0.0",
    status: "succeeded",
    stats: { capabilities: 3 },
    error: null,
    started_at: new Date().toISOString(),
    finished_at: new Date().toISOString(),
  };
}

export function listTasks({ product_id } = {}) {
  const rows = product_id
    ? tasks.filter((t) => t.product_id === product_id)
    : tasks;
  return rows.map((t) => ({
    ...t,
    product_name: products.find((p) => p.id === t.product_id)?.name ?? null,
  }));
}

export function getTask(id) {
  const found = tasks.find((t) => t.id === id);
  if (!found) throw new Error("task not found");
  return {
    ...found,
    product_name: products.find((p) => p.id === found.product_id)?.name ?? null,
  };
}

export function createTask(productId, payload) {
  const created = {
    id: uid("task"),
    product_id: productId,
    status: "pending",
    progress: null,
    error: null,
    started_at: null,
    finished_at: null,
    created_at: new Date().toISOString(),
    topics: [],
    keywords: [],
    countries: [],
    sources: ["openalex"],
    ...payload,
  };
  tasks.unshift(created);
  return { ...created };
}

export function updateTask(id, payload) {
  const found = tasks.find((t) => t.id === id);
  if (!found) throw new Error("task not found");
  if (found.status === "running")
    throw new Error("task is running; wait for it to finish");
  Object.assign(found, payload);
  return {
    ...found,
    product_name: products.find((p) => p.id === found.product_id)?.name ?? null,
  };
}

export function runTask(id) {
  const found = tasks.find((t) => t.id === id);
  found.status = "running";
  found.progress = { stage: "fetching", papers: 0 };
  found.started_at = new Date().toISOString();
  return { ...found };
}

export function getTaskOverview(id) {
  const task = tasks.find((t) => t.id === id);
  const leads = leadSeeds.filter((l) => l.task_id === id);
  const bands = { High: 0, Medium: 0, Low: 0, "Not a fit": 0 };
  leads.forEach((l) => {
    bands[l.band] += 1;
  });
  return {
    task_id: id,
    status: task?.status,
    papers: task?.progress?.papers ?? 0,
    leads: leads.length,
    scored: leads.length,
    unscored: 0,
    bands,
    with_email: leads.filter((l) => l.email).length,
    mean_confidence: leads.length
      ? Number(
          (
            leads.reduce((sum, l) => sum + l.confidence, 0) / leads.length
          ).toFixed(3),
        )
      : null,
    relevance: {
      papers: task?.progress?.papers ?? 0,
      analyzed: task?.progress?.papers ?? 0,
      threshold: 0.3,
      above_threshold: Math.round((task?.progress?.papers ?? 0) * 0.72),
      mean_relevance: 0.58,
      grounded_items: 611,
    },
  };
}

export function analyzePapers() {
  return runs[1];
}

export function analyzeLeads() {
  return runs[0];
}

export function listRuns(taskId) {
  return runs.filter((r) => !taskId || r.task_id === taskId);
}

export function deleteTask(id) {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) throw new Error("task not found");
  if (tasks[index].status === "running")
    throw new Error("task is running; wait for it to finish");
  tasks.splice(index, 1);
  return null;
}

export function listLeads(params = {}) {
  let rows = leadSeeds.map(leadRow);

  if (params.task_id) rows = rows.filter((r) => r.task_id === params.task_id);
  if (params.product_id) {
    const ids = tasks
      .filter((t) => t.product_id === params.product_id)
      .map((t) => t.id);
    rows = rows.filter((r) => ids.includes(r.task_id));
  }
  if (params.band) rows = rows.filter((r) => r.band === params.band);
  if (params.seniority)
    rows = rows.filter((r) => r.seniority === params.seniority);
  if (params.country)
    rows = rows.filter(
      (r) => (r.country || "").toUpperCase() === params.country.toUpperCase(),
    );
  if (params.status) rows = rows.filter((r) => r.status === params.status);
  if (params.min_score)
    rows = rows.filter((r) => (r.score ?? 0) >= Number(params.min_score));
  if (params.q) {
    const term = params.q.toLowerCase();
    rows = rows.filter((r) =>
      [r.name, r.institution, r.department, r.email, ...(r.interests || [])]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(term)),
    );
  }

  const sorters = {
    score: (a, b) => (b.score ?? -1) - (a.score ?? -1),
    papers: (a, b) => b.paper_count - a.paper_count,
    citations: (a, b) => b.total_citations - a.total_citations,
    name: (a, b) => a.name.localeCompare(b.name),
  };
  rows.sort(sorters[params.sort] || sorters.score);
  return rows.slice(0, Number(params.limit) || 200);
}

export function getLead(id) {
  const seed = leadSeeds.find((l) => l.id === id);
  if (!seed) throw new Error("lead not found");
  const row = leadRow(seed);
  return {
    ...row,
    website: seed.website,
    github: seed.github,
    linkedin: seed.linkedin,
    scholar: seed.scholar,
    email_method: seed.email_method,
    unattributed_contacts:
      id === "lead-okafor"
        ? [
            {
              email: "vision-lab@ox.ac.uk",
              reason:
                "a shared lab address, not a personal one — attributing it to this author would misdirect mail",
              ref_type: "paper",
              ref_id: "paper-9",
              ref_field: "affiliation",
              quote:
                "Department of Engineering Science, University of Oxford vision-lab@ox.ac.uk",
            },
          ]
        : [],
    latest_score: scoreByLead[id] || null,
    evidence: evidenceByLead[id] || [],
    papers: papersByLead[id] || [],
    signals: [],
    signal_classification:
      id === "lead-smith"
        ? {
            bucket: "greenfield",
            reason:
              "no product in your category named in the titles or abstracts scanned",
            terms: [],
            last_mention_year: null,
            confidence: "low",
            caveat:
              "Detection covers titles and abstracts only. Tooling names usually appear in Methods sections, which are frequently not indexed, so this lead may still use a competitor's product.",
          }
        : null,
    research_summary: summaryByLead[id] || null,
    research_interests: seed.interests || [],
    product_match: productMatchByLead[id] || [],
    pain_points: painPointsByLead[id] || [],
    status: statuses[id],
    position: seed.position,
  };
}

export function search(term) {
  const q = (term || "").toLowerCase().trim();
  if (!q) return { leads: [], papers: [], institutions: [] };

  const leads = leadSeeds
    .map(leadRow)
    .filter((r) =>
      [r.name, r.institution, r.department, r.email, ...(r.interests || [])]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(q)),
    );

  const papers = Object.entries(papersByLead)
    .flatMap(([leadId, list]) => list.map((p) => ({ ...p, lead_id: leadId })))
    .filter((p) => p.title.toLowerCase().includes(q));

  const institutions = [
    ...new Set(
      leadSeeds
        .map((l) => l.institution)
        .filter((i) => i && i.toLowerCase().includes(q)),
    ),
  ];

  return { leads, papers, institutions };
}

export function setLeadStatus(id, status) {
  statuses[id] = status;
  (activity[id] ||= []).unshift({
    id: uid("act"),
    kind: "status",
    text: `Status changed to ${status}`,
    at: new Date().toISOString(),
  });
  return { id, status };
}

export function listNotes(id) {
  return (notes[id] || []).map((n) => ({ ...n }));
}

export function addNote(id, text) {
  const note = {
    id: uid("note"),
    text,
    author: "You",
    created_at: new Date().toISOString(),
  };
  (notes[id] ||= []).unshift(note);
  (activity[id] ||= []).unshift({
    id: uid("act"),
    kind: "note",
    text: "Note added",
    at: note.created_at,
  });
  return note;
}

export function listActivity(id) {
  return (activity[id] || []).map((a) => ({ ...a }));
}

export function generateOutreachDraft(id) {
  const seed = leadSeeds.find((l) => l.id === id);
  const score = scoreByLead[id];
  return {
    lead_id: id,
    // Never sent. The MVP has no outbound path at all.
    sent: false,
    subject: `Cutting long-video inference cost at ${seed.institution}`,
    body: [
      `Dear Dr. ${seed.name.split(" ").slice(-1)[0]},`,
      "",
      score?.outreach_angle ||
        "I read your recent work on long-video understanding.",
      "",
      "Would a short technical evaluation be useful? Happy to benchmark against the setup described in your paper.",
      "",
      "Best regards,",
    ].join("\n"),
    grounded_on: (score?.components?.problem_match?.evidence_ids || []).slice(),
  };
}
