# Agentic Incident RCA Platform — Build Guide
**Phase 2 of the CAB-approved RCA platform · Incident-to-Requirement Traceability**

Stack: Python · Ollama + Gemma (air-gapped) · ServiceNow · Apache DevLake (GitHub + Jira) · Grafana · GKE

---

## 1. Control flow (end to end)

```
ServiceNow incident (P1/P2)
        │  ① webhook / 60s poller
        ▼
RCA Agent (Python orchestrator, GKE)
        │
        ├─② Service Catalog tool ──► service-catalog.yaml
        │      incident CI / alert source → microservice, Git repo, owning team
        │
        ├─③ Log Retriever tool ────► Airflow / app logs (Phase 1, reused)
        │      time-windowed logs → error signature, first-failure timestamp
        │
        ├─④ DevLake SQL tool ──────► DevLake MySQL (read-only)
        │      PRs + commits merged to repo in T-72h..T,
        │      with author and pre-linked Jira issue → story → epic
        │
        ├─⑤ Gemma via Ollama (reasoning)
        │      evidence bundle in → structured RCA JSON out:
        │      { root_cause, five_whys[], suspect_pr, author, jira_story,
        │        jira_epic, suggested_fix, prevention_actions[], confidence }
        │
        ├─⑥ Publish ───────────────► ServiceNow work note on the incident
        └─⑦ Publish ───────────────► rca_reports table in DevLake DB
                                      → rendered in Grafana beside DORA metrics
```

State machine per incident: `DETECTED → ENRICHED → EVIDENCE_GATHERED → RCA_DRAFTED → PUBLISHED → DONE` (with `FAILED/RETRY` on any step). Every tool call is written to an audit log — important for CAB review.

---

## 2. Repository structure

```
incident-rca-agent/
├── CLAUDE.md                      # architecture, constraints, conventions for Claude Code
├── README.md
├── config/
│   ├── settings.yaml              # endpoints, poll interval, change window (72h), model name
│   └── service_catalog.yaml       # alert source → service → repo → team mapping
├── src/
│   ├── main.py                    # entrypoint: poller loop / webhook listener
│   ├── orchestrator/
│   │   ├── agent.py               # state machine driving steps ①–⑦
│   │   └── state.py               # incident state + audit log
│   ├── tools/
│   │   ├── servicenow.py          # fetch incidents, post work notes (⑥)
│   │   ├── service_catalog.py     # ② lookup
│   │   ├── log_retriever.py       # ③ wraps Phase-1 RCA log access
│   │   ├── devlake_query.py       # ④ read-only SQL + ⑦ write rca_reports
│   │   └── __init__.py
│   ├── llm/
│   │   ├── ollama_client.py       # chat + tool-calling wrapper, JSON enforcement
│   │   └── schemas.py             # Pydantic: EvidenceBundle, RCAReport
│   └── prompts/
│       ├── rca_system.md          # role, evidence format, five-whys instructions
│       └── code_correlation.md    # diff + stacktrace → suspect PR reasoning
├── sql/
│   ├── change_window.sql          # PRs/commits + Jira joins for ④
│   └── rca_reports.ddl            # output table for ⑦
├── grafana/
│   └── rca_dashboard.json         # panel definitions reading rca_reports
├── tests/
│   ├── fixtures/                  # mock_incident.json, mock_devlake_rows.json, sample logs
│   ├── test_tools.py
│   └── test_agent_flow.py         # full pipeline against fixtures, no real systems
├── docker/
│   └── Dockerfile
└── deploy/
    └── k8s/                       # Deployment, ConfigMap, NetworkPolicy (read-only DB user)
```

---

## 3. Claude Code kickoff prompt

Paste this as your first message in Claude Code (after `git init incident-rca-agent`):

> I'm building **Phase 2 of an approved internal RCA platform**: an agentic incident-RCA service. Runtime LLM is **Gemma served by Ollama on an air-gapped GKE cluster** — never call external AI APIs in the application code. Tech: Python 3.11, Pydantic v2, plain `requests`/`mysql-connector`; no heavy agent frameworks (keep it reviewable — a simple state machine).
>
> **What it does:** watch a ServiceNow incident table for new P1/P2 incidents; map each incident to a microservice and Git repo via `config/service_catalog.yaml`; pull a time-windowed error signature via a log-retriever tool (stub it — I'll wire it to my existing Phase-1 RCA platform); query an **Apache DevLake MySQL database** (read-only) for PRs/commits merged to that repo in the prior 72 hours along with their pre-linked Jira issue → story → epic; send the evidence bundle to Gemma with a tool-calling/JSON-output prompt to produce a structured RCA (root cause, five-whys, suspect PR + author, linked epic, suggested fix, prevention actions, confidence); then post the RCA as a ServiceNow work note and insert a row into an `rca_reports` table in the DevLake DB so Grafana can chart it.
>
> **Build it in this order, with tests at each step using mock fixtures (no real systems):**
> 1. Scaffold the repo per the structure in CLAUDE.md; create `CLAUDE.md` capturing all constraints above.
> 2. `service_catalog.yaml` + lookup tool with 3 example services.
> 3. ServiceNow client (poll + post work note) against a mock JSON fixture.
> 4. DevLake SQL tool: introspect the standard DevLake domain-layer schema (`pull_requests`, `commits`, `issues`, `pull_request_issues`, `board_issues`) and write `sql/change_window.sql`; test against fixture rows in a local SQLite/MySQL container.
> 5. Ollama client with strict JSON output validated by a Pydantic `RCAReport` schema, plus the system prompt in `prompts/rca_system.md`.
> 6. The orchestrator state machine wiring steps 1–5, with retries, an audit log, and an end-to-end test on fixtures.
> 7. `rca_reports` DDL + a Grafana dashboard JSON with panels: RCAs over time, mean-time-to-RCA, top recurring root causes, RCAs by epic.
>
> Ask me for any internal endpoint/schema details rather than guessing. After each phase, show me how to run the tests.

---

## 4. Suggested 4-week build sequence

| Week | Milestone |
|---|---|
| 1 | Repo scaffold, service catalog, ServiceNow poller working against fixtures |
| 2 | DevLake SQL tool + change-window query validated against the real (read-only) DB |
| 3 | Gemma prompt + structured RCA on 5 historical incidents; tune until suspect-PR accuracy is credible |
| 4 | Publish paths (work note + Grafana), shadow-mode pilot on one service, demo to manager |

**Pitch line for the manager:** "Phase 1 told us *what broke* from the logs. Phase 2 tells us *which change broke it, who made it, which requirement it traces to, and how to prevent it* — automatically, inside the air-gap, on infrastructure we already run (DevLake, Grafana, Ollama)."
