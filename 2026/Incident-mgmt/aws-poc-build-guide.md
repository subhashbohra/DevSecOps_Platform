# AWS POC — Agentic Incident RCA Platform (Working Demo)

Goal: a fully working end-to-end demo on your personal AWS, no bank restrictions, using a **higher Gemma model** and **real DevLake** ingesting **real GitHub + real (free) Jira**. Only the incident portal is mocked.

Budget: comfortably under ~$200 of your $700 if you stop the GPU instance when idle.

---

## 1. What we mock vs. what's real

| Bank system | POC equivalent | Why |
|---|---|---|
| ServiceNow | FastAPI **mock incident portal** (seeded incidents + work-note endpoint + simple HTML page) | ServiceNow is heavy; the agent only needs "list new incidents" + "post work note" |
| GitHub | **Real** public repos in *your* GitHub account | DevLake ingests them for real — genuine PR/commit data |
| Jira | **Free Atlassian Jira Cloud** (free tier, ≤10 users) | Real epics/stories so traceability is genuine |
| DevLake | The real Apache DevLake (docker-compose) | Does the PR ↔ commit ↔ Jira ↔ epic correlation for real |
| Gemma (Ollama) | Same Ollama, but a **bigger** Gemma 4 model | No air-gap limits → showcase quality |

**The only faked part is the incident portal.** Everything downstream is a real working pipeline.

---

## 2. AWS infrastructure

**Instance:** `g5.2xlarge` — 1× A10G (24 GB VRAM), 8 vCPU, 32 GB RAM, ~$1.21/hr on-demand.
- Cheaper alt: `g6.2xlarge` (L4, better inference/$), or `g5.xlarge` (16 GB RAM — works but tight with DevLake).
- AMI: Ubuntu 22.04 + NVIDIA drivers (use the **AWS Deep Learning AMI (Ubuntu)** to skip driver setup).
- Storage: 120 GB gp3.
- Security group: open 22 (SSH, your IP only). Tunnel everything else over SSH — do **not** expose DevLake/Grafana/Ollama publicly.

**Cost discipline (do this first):**
1. AWS Budgets → create a $150 budget with email alert at 50/80/100%.
2. **Stop** (not terminate) the instance whenever you're not working — GPU $/hr is the whole cost. EBS persists, so you resume where you left off.
3. Optional: a cron/Lambda that auto-stops the instance nightly.

Estimate: ~100 active hours × $1.21 ≈ $121 + ~$10 EBS ≈ **~$130 total**.

---

## 3. Stack layout (all on the one box)

```
g5.2xlarge
├── Ollama + Gemma 4 26B A4B        # GPU, port 11434
├── DevLake (docker-compose)        # mysql, grafana:3000, devlake, config-ui:4000
├── mock-incident-portal (FastAPI)  # port 8080
└── incident-rca-agent              # the Phase-2 Python agent
        ↑ ingests from ↑
   real GitHub repos  +  free Jira Cloud
```

Access Grafana / config-ui / portal from your laptop via SSH tunnel:
`ssh -L 3000:localhost:3000 -L 4000:localhost:4000 -L 8080:localhost:8080 ubuntu@<EC2_IP>`

---

## 4. Setup steps (in order)

### 4.1 Ollama + Gemma 4
```bash
curl -fsSL https://ollama.com/install.sh | sh
# Confirm the exact tag at ollama.com/library/gemma4. Likely:
ollama pull gemma4:26b        # 26B A4B MoE — best for agentic/tool use
# (or gemma4:31b for max quality; e4b for a tiny fallback)
ollama run gemma4:26b "Reply with OK if tool calling works."
```

### 4.2 DevLake
```bash
# Get the latest docker-compose from the DevLake release page (devlake.apache.org)
mkdir devlake && cd devlake
curl -L -O https://github.com/apache/incubator-devlake/releases/latest/download/docker-compose.yml
curl -L -O https://github.com/apache/incubator-devlake/releases/latest/download/env.example
mv env.example .env
# set ENCRYPTION_SECRET in .env (any random 128-char hex)
docker compose up -d
```
- Open config-ui (`localhost:4000`) → add a **GitHub** connection (PAT) and a **Jira** connection (Jira Cloud email + API token).
- Create a **Blueprint** that syncs your repos + Jira project, run it once. Verify rows land in MySQL.

### 4.3 Real GitHub repos (the data)
Create 2-3 small repos, e.g. `payment-service`, `order-service`. Give each a believable commit history. Then plant **one** bad change:
- Branch: `fix/PAY-417-retry-timeout`
- A commit that introduces the failure (e.g. drops a null check / shrinks a timeout)
- Commit message: `PAY-417: tighten retry timeout` ← Jira key links it in DevLake
- Merge it via a real PR with a real author (you).

### 4.4 Free Jira Cloud (the traceability)
- Sign up for free Jira Cloud, create project key `PAY`.
- Make an **Epic** "Payments resilience", a **Story** `PAY-417` under it.
- DevLake's Jira plugin + the `PAY-417` commit reference give you the full PR → story → epic chain automatically.

### 4.5 Mock incident portal
A small FastAPI app with:
- `GET /api/incidents?status=new` → returns seeded incidents
- `POST /api/incidents/{id}/worknotes` → appends the RCA (the "publish" target)
- `GET /` → a basic HTML table so it looks like a portal on screen

Seed one incident that points at `payment-service` with a timestamp **just after** the bad PR merged, so the agent's change-window query surfaces `PAY-417`.

### 4.6 The agent
Reuse the Phase-2 `incident-rca-agent` from the architecture doc, with two swaps:
- `tools/servicenow.py` → `tools/mock_portal.py` (same interface: list incidents, post work note)
- `tools/devlake_query.py` → point at the local DevLake MySQL (read-only user)
- `llm/ollama_client.py` → model `gemma4:26b`, enforce JSON, use Gemma 4 tool calling

Add a `grafana/` panel reading the `rca_reports` table so the RCA shows up next to DORA metrics.

---

## 5. Demo narrative (the money shot)

1. Show the incident portal — a fresh P1 on `payment-service`.
2. Run the agent.
3. It maps the incident → service → repo, pulls the error signature, queries DevLake for changes in the window.
4. Gemma identifies **PAY-417** as the suspect PR, names **the author**, traces it to **Story PAY-417 → Epic "Payments resilience"**, and writes a root cause + fix + prevention.
5. The RCA appears as a **work note on the incident** *and* as a **panel in Grafana**.

You demonstrated: incident → exact change → who made it → which requirement → how to fix and prevent, automatically, with an open local LLM.

---

## 6. Revised Claude Code kickoff prompt (AWS POC)

> I'm building a **working POC on AWS** of an agentic incident-RCA platform. Single Ubuntu GPU box. Components, all local: **Ollama serving `gemma4:26b`** (tool calling + JSON output), **Apache DevLake** (docker-compose, already ingesting two real GitHub repos and a real Jira Cloud project into its MySQL), a **FastAPI mock incident portal**, and the **Python RCA agent**.
>
> Build these, each with tests against fixtures (no live calls in tests):
> 1. `mock-incident-portal`: FastAPI app — `GET /api/incidents?status=new`, `POST /api/incidents/{id}/worknotes`, `GET /` HTML table. Seed from `incidents.json` (include one P1 on `payment-service`).
> 2. `incident-rca-agent` with tools: `mock_portal` (list + post work note), `service_catalog` (yaml lookup), `log_retriever` (stub returning a seeded error signature), `devlake_query` (read-only SQL: PRs/commits merged to a repo in a time window + linked Jira issue → epic; introspect DevLake domain tables `pull_requests`, `commits`, `pull_request_issues`, `issues`, `board_issues`).
> 3. `ollama_client` calling `gemma4:26b` with a system prompt that takes an evidence bundle and returns a Pydantic-validated `RCAReport` (root_cause, five_whys, suspect_pr, author, jira_story, jira_epic, suggested_fix, prevention_actions, confidence).
> 4. Orchestrator state machine wiring it all, with an audit log, plus an end-to-end test on fixtures.
> 5. A `rca_reports` table DDL + a Grafana dashboard JSON (RCAs over time, suspect PRs, RCAs by epic) reading the same DevLake MySQL.
> 6. A `Makefile` / README with the exact run order and the SSH-tunnel commands.
>
> Keep it simple and reviewable — plain Python, requests, mysql-connector, Pydantic v2; no heavy agent frameworks. Ask me for the DevLake schema details or connection info rather than guessing.

---

## 7. Teardown / cost checklist
- [ ] AWS Budget alert set ($150)
- [ ] Instance **stopped** after every session
- [ ] Nothing but SSH exposed publicly
- [ ] When fully done: snapshot if you want to keep it, then terminate + delete EBS
