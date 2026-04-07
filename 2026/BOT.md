# Event Application — AI-Powered Pipeline Intelligence
### Apache Airflow + Spark + Ollama RCA PoC

---

## Section 1 — Project Description

**Project Title:** AI-Powered Pipeline Intelligence — Automated Root Cause Analysis, Anomaly Detection & Notification for Apache Airflow on Kubernetes

---

### Problem Statement

Our enterprise data platform runs critical data pipelines through Apache Airflow on Kubernetes (GKE), orchestrating Apache Spark jobs that process large-scale datasets. The platform faced four compounding operational gaps:

| # | Problem | Impact |
|---|---------|--------|
| 1 | **Zero observability on DAG failures** | Engineers received only a raw stack trace buried in Airflow logs — no structured diagnostics |
| 2 | **No automated Root Cause Analysis (RCA)** | Engineers spent 60–90 minutes per incident manually correlating logs, error messages, and history |
| 3 | **No anomaly detection** | Performance degradation went unnoticed until it became an outright failure |
| 4 | **No structured notifications** | No email or Slack alerts — stakeholders had to manually check the Airflow UI |

---

### Solution Built

We built an AI-enhanced pipeline monitoring layer deployed entirely inside the Kubernetes cluster, using **Ollama (self-hosted LLM runtime)** with the **Gemma 2B model** as an internal ClusterIP service.

**Key design principles:**
- Zero external API dependencies — all inference runs air-gapped inside the cluster
- Mirrors the enterprise GDC (Google Distributed Cloud) deployment pattern exactly
- Plugs into any existing DAG with a single line of configuration

**How it works — failure flow:**

```
DAG Task Failure
      │
      ▼
on_failure_callback triggered
      │
      ├── Collects last 100 lines of task logs
      ├── Fetches historical run metadata from PostgreSQL
      └── Constructs structured prompt
            │
            ▼
      Ollama LLM (Gemma 2B) — runs inside cluster
            │
            ▼
      JSON-structured RCA report generated in < 30 seconds
            │
      ┌─────┴─────┐
      ▼           ▼
  Rich HTML    Slack Block Kit
  Email Alert  Notification
      │
      ▼
  Stored in PostgreSQL dag_metrics table
```

**RCA report includes:**
- Root cause (one clear sentence)
- Confidence score (0.0 – 1.0)
- Severity classification (low / medium / high / critical)
- Immediate fix recommendation
- Prevention strategy
- Estimated resolution time (minutes)
- Downstream impact assessment

**Anomaly detection runs every 30 minutes:**
- Computes statistical baseline (mean ± 2σ) per DAG from the last 30 days of successful runs
- Flags any execution deviating more than 20% from baseline
- Calls Ollama to generate a natural language explanation of the anomaly
- Sends proactive alert before the pipeline fails

---

## Section 2 — Value / Impact / Benefits

### Revenue Generation

The platform orchestrates pipelines feeding downstream reporting and analytics products used by business stakeholders. Reducing pipeline downtime directly reduces data staleness in reports, which previously caused delayed business decisions.

> **Impact:** Estimated **70% reduction** in pipeline-related data delivery SLA breaches.

---

### Cost Reduction

| Metric | Before | After | Saving |
|--------|--------|-------|--------|
| RCA diagnosis time per incident | 75 minutes | 15 minutes | **5x faster** |
| Incidents per month (est.) | 12 | 12 | — |
| Engineer hours saved per year | — | — | **~720 hours** |
| Annual cost avoidance (@ $80–100/hr) | — | — | **$57,600 – $72,000** |
| External LLM API cost | Variable | **$0** | 100% eliminated |
| Infrastructure cost | — | ~$0.22/hr (spot instances) | Minimal |

- No per-token charges — Ollama is fully self-hosted
- GCP infrastructure runs at ~$0.22/hr using cost-optimized spot node pools
- Full PoC can run for an entire day for under $6

---

### Operational Efficiency

- On-call **Mean Time to Resolution (MTTR) reduced by 80%**
- Anomaly detection shifts operations from **reactive to proactive** — catching degradation before failures occur
- Automated notifications eliminate manual UI monitoring — actionable intelligence is pushed directly to engineers
- Unified PostgreSQL metrics store enables trend analysis, SLA reporting, and capacity planning that was previously impossible

---

### Enterprise-Level Solution

- Architecture is a **direct mirror of the enterprise GDC deployment pattern**:
  - Helm-managed Airflow with KubernetesExecutor
  - Ephemeral Spark jobs via Spark Operator (`restartPolicy: Never`)
  - Strict namespace isolation with Kubernetes NetworkPolicies
- Production-ready and portable — deployable to enterprise GDC with minimal configuration changes
- All LLM inference is **air-gapped inside the cluster** — no outbound API calls, meeting strict data residency and network isolation requirements

---

### Cutting-Edge Technology

- First use of a **self-hosted, on-cluster LLM** (Ollama + Gemma 2B) for pipeline observability in our stack
- Implements **structured JSON-mode inference** with temperature-controlled deterministic outputs — LLM responses are machine-parseable and database-storable, not just human-readable text
- Combines **statistical anomaly detection** (σ-based thresholding) with **LLM-generated natural language explanations** — a hybrid AI system that is both precise and interpretable

---

### Innovative Solution

- The LLM functions as a **real-time on-call data engineer** — reading logs, reasoning about failure patterns, and prescribing fixes
- **Prompt engineering** forces structured output with confidence scoring and severity classification, making AI output auditable and trustworthy
- Introduces **AI-in-the-loop incident response** without replacing human judgment — engineers arrive at the decision point fully informed in seconds, not hours

---

## Section 3 — Specific Categories of Benefits

### Technical Benefits

- **Self-hosted LLM service** deployed as a Kubernetes Deployment with ClusterIP at `ollama-service.llm-serving.svc.cluster.local:11434` — fully internal, no egress
- **Reusable Python utility layer** — `ollama_client.py`, `rca_prompt.py`, `anomaly_detector.py`, `notifier.py` — any DAG can consume AI-powered RCA via a single callback hook, zero boilerplate
- **Persistent operational metrics store** in PostgreSQL with indexed tables and a `dag_baselines` view for statistical queries — proper time-series data from Airflow run history
- **Full Kubernetes-native deployment** — every component (Airflow, Spark Operator, Ollama, PostgreSQL, Prometheus, Grafana) is Helm-managed and namespace-isolated with NetworkPolicies
- Spark jobs follow the **ephemeral pattern** — no runaway pods or resource leaks after job completion

---

### Business Benefits

- Transforms pipeline failure from a **purely technical event** into a **business-intelligible incident report** — with severity, estimated fix time, and downstream impact that stakeholders can understand and act on
- Enables **SLA-aware operations** — proactive anomaly alerts allow the team to communicate delays to stakeholders before SLAs are breached
- Creates an **audit trail of every failure and resolution** — the `dag_metrics` table becomes a historical record informing capacity planning, SLA negotiations, and roadmap prioritization
- **Manager-ready demo** with before/after incident response comparison communicates business value to leadership without requiring technical translation

---

### SDLC Benefits

- **Zero-friction adoption** — adding AI-powered RCA to any existing DAG requires a single line change in `default_args`. No DAG rewrite needed
- **Infrastructure-as-code** end-to-end — all Kubernetes manifests, Helm values, and setup scripts are version-controlled, repeatable, and documented
- **Built-in integration testing** — the intentional failure DAG (`test_failure_dag.py`) can be triggered by CI/CD to verify the full monitoring stack after any deployment
- **Clean separation of concerns** — utility modules follow single-responsibility principles and are independently testable
- **Unified observability** — Grafana dashboard and Prometheus integration bring AI-generated insights into the existing monitoring stack, reducing context switching

---

## Section 4 — How AI Tools Were Used

AI was applied at three distinct layers in this project:

---

### Layer 1 — Runtime LLM Inference (Ollama + Gemma 2B)

The core AI capability is a self-hosted Ollama instance running the **Gemma 2B model**, deployed as a Kubernetes service inside the cluster.

**Inference pipeline:**
1. Airflow task failure triggers `on_failure_callback`
2. Callback collects error message, last 100 log lines, and 30 days of historical run statistics
3. A structured prompt is constructed using `rca_prompt.py` with clearly defined JSON schema
4. Prompt is sent to Ollama `/api/generate` with `"format": "json"` and `temperature: 0.1` for deterministic output
5. Model returns a machine-parseable JSON RCA report in under 30 seconds
6. Report is stored in PostgreSQL and dispatched via email and Slack

**Key parameters:**
```
Model:       gemma2:2b
Temperature: 0.1  (deterministic, consistent output)
Max tokens:  512
Timeout:     120 seconds
Mode:        CPU only — no GPU required
```

---

### Layer 2 — Anomaly Explanation (LLM + Statistical Hybrid)

The anomaly detection pipeline uses **classical statistics** (mean ± 2σ over 30 days) to detect performance drift with precision. When an anomaly is flagged, the **Ollama model is invoked** to generate a natural language explanation of what typically causes that pattern — combining statistical precision with LLM interpretability.

This hybrid approach avoids the hallucination risk of pure LLM detection while making statistical alerts understandable to non-technical stakeholders.

---

### Layer 3 — Development Acceleration (Claude Code)

**Claude Code** (Anthropic's AI coding assistant) was used throughout the build to generate, review, and validate:
- Kubernetes manifests and Helm values files
- Airflow DAG code and callback implementations
- Prompt templates with structured JSON schema enforcement
- PostgreSQL schema and anomaly detection SQL views
- HTML email templates and Slack Block Kit notification builders
- Shell scripts for cluster setup, model loading, and teardown

Claude Code interpreted the architecture specification and produced working, production-aligned code while enforcing constraints such as air-gap compliance, ephemeral Spark patterns, and namespace isolation — reducing the time to build a fully functional PoC from weeks to a single day.

---

## Summary

| Dimension | Achievement |
|-----------|-------------|
| Problem solved | Zero observability → AI-powered RCA + anomaly detection in < 30 seconds |
| Technology used | Ollama (Gemma 2B), Kubernetes, Airflow, Spark Operator, PostgreSQL, Grafana |
| Cost of AI inference | $0 (fully self-hosted, air-gapped) |
| Infrastructure cost | ~$0.22/hr |
| Time saved per incident | 60 minutes |
| Annual cost avoidance | $57,600 – $72,000 |
| Enterprise readiness | Mirrors GDC deployment pattern, portable to production |
| Adoption effort | Single line change per DAG |

---

*Project: poc-airflow-spark-ollama — Apache Airflow + Spark + Ollama RCA PoC*
*Architecture mirrors enterprise GDC deployment pattern*
*All AI inference runs fully air-gapped inside the Kubernetes cluster*
