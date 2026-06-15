Yes — and it's actually a significant simplification. Apache DevLake already does the hard correlation work you'd otherwise build by hand: it ingests GitHub and Jira into one database (MySQL/PostgreSQL) with a unified domain schema, including cross-link tables that map PRs ↔ commits ↔ Jira issues (e.g., `pull_requests`, `commits`, `issues`, and mapping tables like `pull_request_issues`). Grafana is just reading that DB.

So instead of your agent calling the GitHub API and Jira API separately (tools 4 and 5 from before), give it **one SQL tool against the DevLake database**. The flow becomes:

1. Incident fires → agent identifies service + time window from logs (your existing RCA).
2. Agent runs a DevLake query: "PRs merged to repo X between T-72h and T, with author, linked Jira issue, and epic." One join, pre-correlated, no API rate limits, no auth juggling.
3. Gemma reasons over the diff + error signature to pick the suspect change, and the Jira epic/requirement comes free from the same row.

This improves accuracy too — DevLake has already resolved the messy commit-message/branch-name parsing to link code to Jira keys, so your agent isn't doing fragile regex extraction at runtime.

Two bonus wins: you can write the agent's RCA output *back* into a table DevLake's Grafana reads, so RCA reports appear as a dashboard panel next to the DORA/PR metrics leadership already looks at. And architecturally it's a cleaner story for CAB review — the agent only needs read access to one internal database rather than credentials for GitHub and Jira.

In your Claude Code build plan, this just replaces phases 3–4 with "DevLake SQL query tool" — have Claude Code introspect the DevLake schema first (the domain layer docs are on devlake.apache.org) and generate the queries with mock data before pointing at the real DB.


This is a natural extension of your CAB-approved RCA platform — you're essentially going from "log-triggered RCA" to a full agentic incident intelligence pipeline. Here's how I'd architect it:

**Architecture (agent with tools, not a single prompt)**

The core shift: instead of one LLM call on a log file, build an orchestrator where Gemma (via Ollama) acts as the reasoning engine that calls tools in a loop:

1. **Ingestion** — Poll or webhook from the incident portal (ServiceNow REST API if that's what DB uses). New P1/P2 incident → trigger the agent.
2. **Service mapping tool** — Maintain a service catalog (YAML/DB) mapping alert sources, namespaces, and log paths to microservices and their Git repos. This is how the agent answers "which microservice."
3. **Log/metrics tool** — Reuse your existing Airflow RCA logic as a callable tool: given service + time window, fetch logs and return the error signature.
4. **Code correlation tool** — Query GitHub API for commits/PRs merged to that service's repo in the 24–72h before the incident. Diff + error stack trace → Gemma identifies the likely offending change.
5. **Jira linkage tool** — From the suspect commit/PR, extract the Jira key (branch name or commit message convention like `PROJ-1234`), then walk up via Jira API: story → epic → requirement.
6. **Output** — Structured RCA report (root cause, 5-whys, affected code, linked Jira epic, suggested fix, prevention actions) posted back as a work note on the incident.

The orchestration loop itself can be plain Python with function calling (Ollama supports tool calling with Gemma 2/3), or LangGraph if you want retries and state. Given the air-gap constraint, keep it simple — a Python state machine is easier to get past review than a framework.

**Building it with Claude Code**

Claude Code is your dev tool here; Gemma stays as the runtime brain. Practical approach:

- Start a repo and write a `CLAUDE.md` describing the architecture above, your existing RCA platform's interfaces, and bank constraints (air-gapped, internal LLM only).
- Have Claude Code build it in phases: (1) incident poller + service catalog, (2) wrap your existing RCA as a tool, (3) GitHub commit-correlation tool, (4) Jira traversal tool, (5) the orchestrator loop with structured JSON output.
- Use mock fixtures (sample incidents, fake Jira responses) so Claude Code can test everything locally before you wire it to real internal APIs at work.

One strategic note: since this builds directly on the CAB-approved platform, frame it internally as "Phase 2: incident-to-requirement traceability" — that lineage makes approval and adoption much easier, and it strengthens the same narrative you're using for your check-in and award case.

Want me to draft the `CLAUDE.md` and phased task breakdown you'd feed into Claude Code?


This is a natural extension of your 
CAB-approved RCA platform — you're essentially going from "log-triggered RCA" to a full agentic incident intelligence pipeline. Here's how I'd architect it:

**Architecture (agent with tools, not a single prompt)**

The core shift: instead of one LLM call on a log file, build an orchestrator where Gemma (via Ollama) acts as the reasoning engine that calls tools in a loop:

1. **Ingestion** — Poll or webhook from the incident portal (ServiceNow REST API if that's what DB uses). New P1/P2 incident → trigger the agent.
2. **Service mapping tool** — Maintain a service catalog (YAML/DB) mapping alert sources, namespaces, and log paths to microservices and their Git repos. This is how the agent answers "which microservice."
3. **Log/metrics tool** — Reuse your existing Airflow RCA logic as a callable tool: given service + time window, fetch logs and return the error signature.
4. **Code correlation tool** — Query GitHub API for commits/PRs merged to that service's repo in the 24–72h before the incident. Diff + error stack trace → Gemma identifies the likely offending change.
5. **Jira linkage tool** — From the suspect commit/PR, extract the Jira key (branch name or commit message convention like `PROJ-1234`), then walk up via Jira API: story → epic → requirement.
6. **Output** — Structured RCA report (root cause, 5-whys, affected code, linked Jira epic, suggested fix, prevention actions) posted back as a work note on the incident.

The orchestration loop itself can be plain Python with function calling (Ollama supports tool calling with Gemma 2/3), or LangGraph if you want retries and state. Given the air-gap constraint, keep it simple — a Python state machine is easier to get past review than a framework.

**Building it with Claude Code**

Claude Code is your dev tool here; Gemma stays as the runtime brain. Practical approach:

- Start a repo and write a `CLAUDE.md` describing the architecture above, your existing RCA platform's interfaces, and bank constraints (air-gapped, internal LLM only).
- Have Claude Code build it in phases: (1) incident poller + service catalog, (2) wrap your existing RCA as a tool, (3) GitHub commit-correlation tool, (4) Jira traversal tool, (5) the orchestrator loop with structured JSON output.
- Use mock fixtures (sample incidents, fake Jira responses) so Claude Code can test everything locally before you wire it to real internal APIs at work.

One strategic note: since this builds directly on the CAB-approved platform, frame it internally as "Phase 2: incident-to-requirement traceability" — that lineage makes approval and adoption much easier, and it strengthens the same narrative you're using for your check-in and award case.

Want me to draft the `CLAUDE.md` and phased task breakdown you'd feed into Claude Code?
