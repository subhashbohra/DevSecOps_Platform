
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
