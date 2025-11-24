Nice, this is exactly the right follow-up to make this “real” in your org. I’ll break it into two parts:

1. **How to keep exceptions (branches you want to retain >90 days)**
2. **A Trunk-Based Development (TBD) handbook + implementation plan**

---

## 1️⃣ How to handle exceptions for long-lived branches

You basically need **two layers of protection**:

1. **Convention** – so humans know what to keep
2. **Automation rules** – so scripts don’t delete the wrong thing

### A. Use clear naming conventions

Pick 1–2 prefixes for “do-not-delete” branches, e.g.:

* `keep/*` – permanent reference branches
* `release/*` – long-living release branches
* `support/*` – LTS / legacy maintenance

Then your cleanup logic becomes:

> "Delete branches older than 90 days **except**:
>
> * `main`, `master`, `develop`
> * branches starting with `keep/`, `release/`, `support/`
> * any branches explicitly allow-listed in config"

**Examples:**

* `keep/2024-q1-archived-feature-x`
* `release/2025.01`
* `support/v1.x`

If you want to keep a current random branch `feature/foo` as reference:

* Rename it once to `keep/feature-foo-2024-archive` and you’re done.

---

### B. Protect exception branches in GitHub

In **GitHub Branch Protection Rules**, add patterns like:

* `keep/*` → **Do not allow branch deletion**
* `release/*` → Protect from deletion + require checks (if needed)

This way, even if someone tries manual deletion, GitHub blocks it.

---

### C. Central allow-list config (YAML)

For extra control across many repos, maintain an **allow-list file** in a central repo, e.g. `branch-retention.yaml`:

```yaml
default:
  max_age_days: 90
  protected_patterns:
    - "^main$"
    - "^master$"
    - "^develop$"
    - "^keep/"
    - "^release/"
    - "^support/"

repos:
  my-critical-service:
    protected_branches:
      - "experiment-long-term-ml-poc"
      - "legacy-api-readonly"
    max_age_days: 180
```

Your cleanup script reads this file and skips:

* Any branch matching `protected_patterns`
* Any `protected_branches` for that repo

---

### D. Example cleanup logic (pseudo)

Using `gh` CLI (conceptual):

```bash
#!/usr/bin/env bash
ORG="my-org"
REPO="$1"
MAX_AGE_DAYS=90

# get branches and last commit date
gh api repos/$ORG/$REPO/branches --paginate \
  | jq -r '.[] | "\(.name) \(.commit.commit.author.date)"' |
while read BRANCH_NAME COMMIT_DATE; do
  # skip known safe branches
  if [[ "$BRANCH_NAME" =~ ^main$|^master$|^develop$ ]]; then
    continue
  fi
  if [[ "$BRANCH_NAME" =~ ^keep/|^release/|^support/ ]]; then
    continue
  fi

  BRANCH_AGE_DAYS=$(( ( $(date +%s) - $(date -d "$COMMIT_DATE" +%s) ) / 86400 ))

  if [ "$BRANCH_AGE_DAYS" -gt "$MAX_AGE_DAYS" ]; then
    echo "Deleting $BRANCH_NAME ($BRANCH_AGE_DAYS days old)"
    # dry run first:
    # gh api -X DELETE repos/$ORG/$REPO/git/refs/heads/$BRANCH_NAME
  fi
done
```

Run it initially as **dry-run**: only log branches → share with teams → then enable delete.

---

## 2️⃣ Trunk-Based Development (TBD) Handbook

You can paste this into Confluence as your **internal TBD handbook**.

---

### 2.1. Purpose

> Define a consistent Trunk-Based Development model for all teams to:
>
> * Reduce long-lived branches and merge conflicts
> * Increase deployment frequency and release reliability
> * Improve DORA metrics and enable AI-assisted DevOps

---

### 2.2. Core principles

1. **Single source of truth**:

   * `main` (or `trunk`) represents the latest, always-releasable code.

2. **Short-lived branches only**:

   * Feature branches live **1–7 days** max.
   * No “zombie” branches older than 14 days unless explicitly marked `keep/*` or `release/*`.

3. **Small, frequent commits**:

   * Prefer multiple small PRs over one huge PR.

4. **Mandatory CI & code quality checks**:

   * Every PR must pass unit tests, linting, security scans (CodeQL, SAST, etc.).

5. **Feature flags instead of long-lived branches**:

   * Incomplete features are hidden behind flags, not separate branches.

6. **Fast review & merge**:

   * Target PR cycle time: **<24 hours**.

7. **Release from trunk**:

   * Bi-weekly release tags or short-lived release branches derived from `main`.

---

### 2.3. Branch types & naming

**Allowed types:**

* `main` / `master` / `trunk` – production-ready branch
* `feature/<ticket-id>-<short-title>` – short-lived feature branches
* `bugfix/<ticket-id>-<short-title>` – bug fixes
* `hotfix/<ticket-id>-<short-title>` – urgent production issues
* `release/<version>` – short-lived (2–4 weeks max)
* `keep/<meaningful-name>` – archived references / exceptions

**Examples:**

* `feature/JIRA-1234-payment-timeout-handling`
* `bugfix/JIRA-5678-fix-npe-on-orders`
* `hotfix/INC-9999-high-latency`
* `release/2025.03`
* `keep/2024-q1-migration-archive`

---

### 2.4. Workflow: from idea to production

1. **Create ticket in Jira**

   * Requirement, bug, or spike.

2. **Create short-lived branch**

   * From `main`
   * Using naming convention `feature/JIRA-1234-…`

3. **Develop with CI running on every push**

   * Unit tests, static checks, security scans.

4. **Open PR early (WIP allowed)**

   * Enables early feedback & Copilot PR review.

5. **Code Review & Quality Gates**

   * PR must have:

     * ✅ At least 1–2 approvals
     * ✅ CI green
     * ✅ CodeQL / security checks green
     * ✅ Linked Jira issue

6. **Merge to `main`**

   * Use **Squash** or **Rebase & merge** to keep history clean.

7. **Delete branch after merge**

   * GitHub setting: “Delete branch after merge” → enabled.

8. **Release**

   * Tag from `main` or create short-lived `release/<version>` branch
   * Apply release checklist & deployment.

---

### 2.5. Release & hotfix strategy (for your 2-week cycle)

**Normal path:**

* Every 2 weeks:

  * Tag `main` → `vYYYY.MM.DD`
  * Optionally create `release/2025.02` for stabilization only.

**Hotfix:**

1. Branch from `main` → `hotfix/INC-1234-…`
2. Fix, PR, merge back to `main`
3. Cherry-pick or tag a new hotfix release from `main`.

No long-living “parallel” branches.

---

### 2.6. Quality & governance rules

* **Required on every PR**:

  * Build + unit tests
  * Linting
  * CodeQL/SAST scan
  * Test coverage threshold (e.g., >70% or team-defined)

* **Branch age policy**:

  * Warning if branch > 7 days (bot comment / Slack)
  * Candidate for deletion if > 14 or 30 days (depending on team)

* **Branch protection**:

  * `main`: protected, no force pushes, PR approval required
  * `release/*`: protected, no direct commits
  * `keep/*`: protected from deletion

---

### 2.7. Metrics to track (DevLake / Grafana)

To prove TBD is working, track:

* Average **branch age**
* Number of **branches > 30/60/90 days**
* **PR cycle time** (open → merged)
* **Deployment frequency**
* **Change failure rate**
* **MTTR** for prod incidents

Put this into a **“Branch Hygiene + TBD adoption”** dashboard.

---

## 3️⃣ Implementation Plan – Where to start (step-by-step)

### Phase 0 – Baseline & buy-in (1–2 weeks)

1. Use DevLake to generate:

   * Branch count, age distribution
   * PR cycle time
   * Deployment frequency (DORA)

2. Prepare a **short deck**:

   * Current problem (7k+ stale branches)
   * Risk, complexity, costs, productivity loss
   * Proposal: branch cleanup + TBD

3. Align with:

   * Dev leads / EMs
   * DevOps/Platform team
   * Security & compliance (if needed)

---

### Phase 1 – Design the model (1 week)

1. Finalize:

   * Branch naming convention
   * Branch types allowed
   * Exception rules (`keep/*`, `release/*`, allow-list)
   * Max branch age policy (7 days soft, 14 days hard, 90 days cleanup threshold)

2. Publish the **TBD Handbook** (above) in Confluence:

   * Add diagrams: branch flows, release flow, hotfix flow
   * Add FAQ (e.g., long-running features, big refactors)

---

### Phase 2 – Tooling & automation (2–3 weeks)

1. **GitHub settings**:

   * Enable branch protection:

     * `main`, `release/*`, `keep/*`
   * Turn on “Delete branch on merge” for all repos.

2. **Create cleanup job** (per earlier script):

   * Runs weekly via GitHub Actions / Jenkins
   * Dry run first: write branch deletion candidates to a file or Slack/Teams channel
   * After 2–3 weeks of observation → enable actual deletion

3. **Add bots for “age warnings”**:

   * Comment on branches older than N days
   * Or post a weekly report in a channel:
     “These branches are older than 14 days and not protected…”

4. **Feature flags**:

   * Introduce a feature flag framework/logical pattern so teams don’t rely on long-lived branches.

---

### Phase 3 – Pilot TBD (3–4 sprints)

1. Choose **2–3 willing teams / 5–10 repos** as pilot.

2. Enforce:

   * Short-lived branches
   * Mandatory PR checks
   * Trunk-based release flow

3. Track metrics:

   * Branch age reduction
   * PR cycle time
   * Deployment frequency

4. Get feedback:

   * What changed in their day-to-day?
   * What friction they faced?
   * Adjust handbook if needed.

---

### Phase 4 – Org-wide rollout (4–8 weeks)

1. Announce:

   * Fixed date after which TBD + branch cleanup is enforced
   * Provide “Before & After” metrics from pilot teams

2. Apply:

   * Branch protection + settings to all repos
   * Cleanup jobs across all repos (with exceptions via `keep/*` and YAML allow-list)

3. Training:

   * Short sessions on:

     * How to work with small PRs
     * How to use feature flags
     * How TBD interacts with Copilot & PR reviews

---

### Phase 5 – Continuous improvement

* Review dashboards monthly:

  * Branch age, DORA metrics, TBD adoption
* Tune:

  * Age thresholds
  * Exception patterns
  * Cleanup frequency
* Celebrate:

  * Share success stories:
    “Team X reduced branch age by 80%, improved PR cycle time from 3 days → 0.8 days”

---

If you’d like, next step I can:

* Turn this into a **Confluence-ready page** (with headings, bullets, and example diagrams), and/or
* Write a **Gamma.app prompt** that will auto-generate leadership slides for:

  * Branch cleanup
  * TBD adoption roadmap
  * Expected cost & productivity benefits.
