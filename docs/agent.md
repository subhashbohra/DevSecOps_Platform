Build Error Agent (Agentic AI for CI/debugging)

This repository contains a minimal agentic AI scaffold that watches PRs (via GitHub Actions), reproduces build/test failures, analyzes logs, and produces debugging guidance. It's intended as a foundation for a more advanced SLM-driven solution.

Assumption: by "SLM" we mean a Self-Learning Module — a component that improves analysis over time by collecting labeled incidents and feedback. If you meant a different SLM, tell me and I'll adapt.

## Architecture

```mermaid
flowchart TD
  PR[Pull Request / Push]
  GHAction[GitHub Action]
  AgentAPI[Agent HTTP API]
  JobQueue[In-memory queue / DB]
  Worker[Job Worker (clone, reproduce, analyze)]
  ReproEnv[Docker / Sandbox]
  LLM[LLM + SLM]
  GitHub[GitHub API]
  Repo[Repo]

  PR --> GHAction --> AgentAPI
  AgentAPI --> JobQueue --> Worker
  Worker --> ReproEnv --> Repo
  Worker -->|logs| LLM
  LLM -->|analysis & suggested patch| Worker
  Worker --> GitHub
  LLM --> SLM[SLM: feedback store & retrainer]
  SLM --> LLM

  style SLM fill:#f9f,stroke:#333,stroke-width:1px
```

High level: when a PR opens, the GitHub Action posts the event to the Agent API. The agent enqueues a job, the worker clones the PR branch, runs the project's configured build/test commands in a sandbox (Docker recommended), captures logs, then runs a combination of heuristic analyzers and an LLM-based analyzer to produce a diagnosis and suggested fix. Optionally the agent can open a comment or a branch/PR with a patch.

## Files added
- `agent/main.py` - FastAPI webhook endpoint
- `agent/worker.py` - job execution: clone, reproduce, capture logs, analyze
- `agent/analyzers.py` - simple heuristics to parse logs
- `agent/llm_client.py` - LLM adapter (OpenAI placeholder)
- `agent/config.py` - environment-config helpers
- `Dockerfile` - container image
- `requirements.txt` - Python deps
- `.github/workflows/pr-trigger-agent.yml` - example workflow that posts PR events to the agent

## How to run (local quickstart)

- Install dependencies: python -m pip install -r requirements.txt
- Start the agent: uvicorn agent.main:app --host 0.0.0.0 --port 8080
- Set these secrets in your repo: `AGENT_URL` (public URL of the agent), `AGENT_SECRET` (shared secret), `GITHUB_TOKEN` (optional for outgoing GitHub API calls)

The GitHub Action example posts the raw event payload to the agent. The agent reads the payload, schedules a job, and returns 202.

## SLM (Self-Learning Module) notes

- Data to collect: build logs, stack traces, repo metadata, commands run, analysis output, whether developer accepted suggestions or their final fix.
- Training signal: when an automated suggestion is accepted / merged or annotated as helpful, store (log, suggestion, outcome) for retraining.
- Retrainer: periodic job that fine-tunes a prompt or a small classification model that maps log patterns -> suggested fixes.

## Security
- Run the agent behind TLS. Protect endpoints with `AGENT_SECRET` or GitHub App verification.
- Limit what builds can run (resource quotas, container timeouts) to avoid abuse.

## Next steps (suggested)

1. Deploy agent behind HTTPS (use Docker + cloud VM or serverless container).
2. Implement an auth layer (GitHub App verification using webhook signature).
3. Extend `analyzers.py` with project-specific heuristics.
4. Add a retraining pipeline for the SLM (store labeled examples to a DB and run scheduled training jobs).

If you want, I can scaffold a simple retrainer and storage (Postgres + small model) and wire it to the agent.

