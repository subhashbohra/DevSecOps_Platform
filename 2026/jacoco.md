Got it. You can absolutely replace SonarQube’s “quality gate” concept with a **GitHub-native, JaCoCo-first quality gate system** + a **central aggregator repo** that publishes an **org-wide HTML dashboard**.

Below is a **complete, implement-today blueprint** (repo structure + quality gates + workflows + Python scripts). You can copy/paste and adjust only a few repo-specific commands.

---

# 0) What your JaCoCo is telling you (why it’s urgent)

From the screenshot (JaCoCo package table), your **total** looks roughly like:

* **Instruction coverage**: **~39%**
* **Branch coverage**: **~4%** (very low)
* Many packages near **0%**, and one service package around **94%**.

This is typical when:

* tests run only for a small module,
* most logic is untested,
* or tests aren’t wired to execute the right modules.

**Fix approach (fast + practical):**

1. **Exclude non-valuable code** (config/DTO/generated) from coverage counting (so your % reflects real logic).
2. Add **targeted unit tests** for the **top missed packages** (controllers/service/domain).
3. Add **branch-focused tests** for if/else/switch and error paths (branch % is what quality gates often enforce).

But the bigger win is: **set up your quality gates system now** so this never becomes a “fix in 1 day” fire drill again.

---

# 1) What quality gates you can enforce without SonarQube

Since you’re retiring SonarQube, you can still implement equivalent gates using common OSS tooling:

## A) Coverage gates (JaCoCo) — your primary goal

* **Line coverage %**
* **Branch coverage %**
* **Method coverage %**
* Optional: “minimum per-package coverage” (later)

## B) Reliability gates (bug risk)

* **SpotBugs** (high confidence bug patterns)

  * Gate on: `HIGH` priority bug count = 0

## C) Maintainability gates (cleanliness)

* **PMD** or **Checkstyle**

  * Gate on: new violations or total violations under a threshold
* **Complexity** (Cyclomatic complexity)

  * Tool: `lizard` or `java-parser` based analyzer
  * Gate: max function complexity <= e.g. 15

## D) Security gates

* **CodeQL** findings (SARIF)

  * Gate: `error` / `high` severity = 0
* **Dependency vulnerabilities**

  * Tool: `osv-scanner` (fast)
  * Gate: `critical/high` = 0 (or allowlist with expiry)

## E) Duplication gates (optional but useful)

* `jscpd` (works for Java too)

  * Gate: duplication % < 3–5%

✅ This combination gives you “Sonar-like gates” without Sonar.

---

# 2) Your proposed architecture (good plan) — make it work in GitHub Actions

You proposed:

* Central repo: **`code-coverage-app`**
* Each microservice: a tiny scheduled workflow that calls the “parent” workflow
* Parent repo consolidates all reports and publishes one HTML dashboard

This is doable, but there’s an important GitHub Actions reality:

### Reality check

A **reusable workflow** runs in the **caller repo’s context** (the microservice repo), not inside the central repo.
So consolidation must happen by sending metrics **to the central repo** (or an external store) after each service job finishes.

**Best “implement today” option:**
Each microservice workflow:

1. runs tests + jacoco + codeql + scanners
2. produces a **single JSON** metrics file + an HTML snippet
3. **pushes the JSON into the central repo** (`code-coverage-app`) under `reports/<service>.json` using a PAT
   Central repo:

* nightly (or on push) reads all `reports/*.json` and generates `index.html` dashboard (GitHub Pages)

This is clean and scales to 80 services.

---

# 3) Create the central repo: `code-coverage-app`

## 3.1 Repo structure

```
code-coverage-app/
  quality-gates.yml
  scripts/
    parse_jacoco.py
    parse_sarif.py
    parse_osv.py
    gate_eval.py
    render_dashboard.py
  dashboards/
    (generated index.html lives in docs/ for GitHub Pages)
  docs/
    index.html   (generated)
  .github/
    workflows/
      build-dashboard.yml
```

---

## 3.2 Define your quality gates in `quality-gates.yml`

This is your single source of truth:

```yaml
version: 1

benchmarks:
  coverage:
    line_pct:
      warn: 70
      fail: 60
      target: 80
    branch_pct:
      warn: 60
      fail: 50
      target: 70
    method_pct:
      warn: 75
      fail: 65
      target: 85

  reliability:
    spotbugs_high: { fail: 0 }
    spotbugs_medium: { warn: 5, fail: 20 }

  security:
    codeql_errors: { fail: 0 }
    codeql_warnings: { warn: 5, fail: 20 }
    osv_critical: { fail: 0 }
    osv_high: { fail: 0 }
    osv_medium: { warn: 10, fail: 30 }

  maintainability:
    checkstyle_errors: { fail: 0 }
    checkstyle_warnings: { warn: 20, fail: 100 }
    pmd_priority1: { fail: 0 }
    pmd_priority2: { warn: 10, fail: 50 }
    max_cyclomatic_complexity: { warn: 15, fail: 25 }

  duplication:
    dup_pct:
      warn: 3
      fail: 5
      target: 2
```

You can tune thresholds later. Today, start realistic (your current repo at 39% needs incremental improvement).

---

# 4) Microservice “child workflow” (add to each repo)

Create in each microservice:

`.github/workflows/weekly-quality.yml`

This workflow:

* runs tests + generates JaCoCo XML
* runs CodeQL (optional weekly; can be heavy)
* runs osv-scanner
* parses all results into a single JSON
* evaluates gates (pass/warn/fail)
* pushes JSON to central repo

### 4.1 Example for **Gradle + Java + JaCoCo**

```yaml
name: Weekly Quality Gates

on:
  schedule:
    - cron: "30 2 * * 1"   # every Monday 02:30
  workflow_dispatch:

permissions:
  contents: read
  security-events: write  # for codeql upload if enabled

jobs:
  quality:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: "17"

      # ---- Build + Tests + JaCoCo ----
      - name: Run tests with JaCoCo
        run: |
          ./gradlew clean test jacocoTestReport

      # ---- (Optional) CodeQL weekly ----
      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: java

      - name: Autobuild
        uses: github/codeql-action/autobuild@v3

      - name: Analyze CodeQL
        uses: github/codeql-action/analyze@v3
        with:
          category: "/language:java"
          output: sarif
          upload: false

      # CodeQL action writes SARIF under results; we copy it to a known path
      - name: Collect SARIF
        run: |
          mkdir -p out
          # find sarif produced by codeql-action
          SARIF=$(find . -name "*.sarif" | head -n 1)
          if [ -n "$SARIF" ]; then cp "$SARIF" out/codeql.sarif; else echo "{}" > out/codeql.sarif; fi

      # ---- Dependency vuln scan (fast) ----
      - name: OSV-Scanner
        uses: google/osv-scanner-action@v1.7.0
        with:
          scan-args: |-
            --format=json
            --output=out/osv.json
            ./

      # ---- Bring in central scripts (no need to vendor them in 80 repos) ----
      - name: Checkout code-coverage-app scripts
        uses: actions/checkout@v4
        with:
          repository: YOUR_ORG/code-coverage-app
          path: code-coverage-app
          ref: main

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.11"

      - name: Install python deps
        run: |
          pip install pyyaml

      # ---- Parse + Evaluate Gates ----
      - name: Generate metrics JSON + evaluate quality gates
        env:
          SERVICE_NAME: ${{ github.repository }}
          COMMIT_SHA: ${{ github.sha }}
          BRANCH: ${{ github.ref_name }}
          RUN_URL: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
        run: |
          mkdir -p out

          python code-coverage-app/scripts/parse_jacoco.py \
            --xml "build/reports/jacoco/test/jacocoTestReport.xml" \
            --out out/jacoco.json

          python code-coverage-app/scripts/parse_sarif.py \
            --sarif out/codeql.sarif \
            --out out/codeql.json

          python code-coverage-app/scripts/parse_osv.py \
            --json out/osv.json \
            --out out/osv_parsed.json

          python code-coverage-app/scripts/gate_eval.py \
            --gates code-coverage-app/quality-gates.yml \
            --service "$SERVICE_NAME" \
            --commit "$COMMIT_SHA" \
            --branch "$BRANCH" \
            --run_url "$RUN_URL" \
            --jacoco out/jacoco.json \
            --codeql out/codeql.json \
            --osv out/osv_parsed.json \
            --out out/service-report.json

      # ---- Push JSON to central repo ----
      - name: Publish to central dashboard repo
        env:
          DASHBOARD_PAT: ${{ secrets.DASHBOARD_PAT }}
        run: |
          if [ -z "$DASHBOARD_PAT" ]; then
            echo "DASHBOARD_PAT not set. Add as repo secret."
            exit 1
          fi

          git config --global user.email "ci-bot@company.com"
          git config --global user.name "ci-bot"

          rm -rf dashboard_repo
          git clone https://x-access-token:${DASHBOARD_PAT}@github.com/YOUR_ORG/code-coverage-app.git dashboard_repo

          mkdir -p dashboard_repo/reports
          # repo name safe file name
          SAFE_NAME=$(echo "${{ github.repository }}" | tr '/' '__')
          cp out/service-report.json dashboard_repo/reports/${SAFE_NAME}.json

          cd dashboard_repo
          git add reports/${SAFE_NAME}.json
          git commit -m "Update quality report for ${SAFE_NAME}" || echo "No changes"
          git push
```

### Secrets needed in each microservice repo

* `DASHBOARD_PAT`: a PAT (or GitHub App token) with **write access** to `code-coverage-app`.

---

# 5) Central repo workflow to consolidate 80 JSON files → one HTML dashboard

Create: `code-coverage-app/.github/workflows/build-dashboard.yml`

```yaml
name: Build Org Quality Dashboard

on:
  push:
    paths:
      - "reports/*.json"
  workflow_dispatch:
  schedule:
    - cron: "0 4 * * 1"   # weekly Monday 04:00

permissions:
  contents: write

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.11"

      - name: Install deps
        run: |
          pip install pyyaml

      - name: Render dashboard
        run: |
          python scripts/render_dashboard.py \
            --gates quality-gates.yml \
            --reports_dir reports \
            --out docs/index.html

      - name: Commit dashboard
        run: |
          git config user.email "ci-bot@company.com"
          git config user.name "ci-bot"
          git add docs/index.html
          git commit -m "Update dashboard" || echo "No changes"
          git push
```

### Enable GitHub Pages

* Repo Settings → Pages → Source: `main` branch, `/docs` folder
  Then you get a URL like:
  `https://YOUR_ORG.github.io/code-coverage-app/`

---

# 6) The scripts (copy into `code-coverage-app/scripts/`)

## 6.1 `parse_jacoco.py` (extract line/branch/method coverage)

```python
#!/usr/bin/env python3
import argparse, json
import xml.etree.ElementTree as ET

def pct(covered: int, missed: int) -> float:
  total = covered + missed
  return round((covered / total) * 100.0, 2) if total else 0.0

def main():
  ap = argparse.ArgumentParser()
  ap.add_argument("--xml", required=True)
  ap.add_argument("--out", required=True)
  args = ap.parse_args()

  tree = ET.parse(args.xml)
  root = tree.getroot()

  counters = {c.get("type"): c for c in root.findall(".//counter")}
  line = counters.get("LINE")
  branch = counters.get("BRANCH")
  method = counters.get("METHOD")

  result = {
    "line": {
      "covered": int(line.get("covered")) if line is not None else 0,
      "missed": int(line.get("missed")) if line is not None else 0,
    },
    "branch": {
      "covered": int(branch.get("covered")) if branch is not None else 0,
      "missed": int(branch.get("missed")) if branch is not None else 0,
    },
    "method": {
      "covered": int(method.get("covered")) if method is not None else 0,
      "missed": int(method.get("missed")) if method is not None else 0,
    }
  }

  result["line"]["pct"] = pct(result["line"]["covered"], result["line"]["missed"])
  result["branch"]["pct"] = pct(result["branch"]["covered"], result["branch"]["missed"])
  result["method"]["pct"] = pct(result["method"]["covered"], result["method"]["missed"])

  with open(args.out, "w", encoding="utf-8") as f:
    json.dump(result, f, indent=2)

if __name__ == "__main__":
  main()
```

## 6.2 `parse_sarif.py` (summarize CodeQL SARIF)

```python
#!/usr/bin/env python3
import argparse, json

def main():
  ap = argparse.ArgumentParser()
  ap.add_argument("--sarif", required=True)
  ap.add_argument("--out", required=True)
  args = ap.parse_args()

  try:
    sarif = json.load(open(args.sarif, "r", encoding="utf-8"))
  except Exception:
    sarif = {"runs": []}

  counts = {"error": 0, "warning": 0, "note": 0, "none": 0}
  results_out = []

  for run in sarif.get("runs", []):
    for r in run.get("results", []) or []:
      level = r.get("level", "none")
      if level not in counts:
        counts["none"] += 1
      else:
        counts[level] += 1

      msg = (r.get("message", {}) or {}).get("text", "")
      rule = r.get("ruleId", "")
      results_out.append({"ruleId": rule, "level": level, "message": msg[:220]})

  out = {"counts": counts, "sample": results_out[:25], "total": sum(counts.values())}
  with open(args.out, "w", encoding="utf-8") as f:
    json.dump(out, f, indent=2)

if __name__ == "__main__":
  main()
```

## 6.3 `parse_osv.py` (summarize dependency vulns)

```python
#!/usr/bin/env python3
import argparse, json

def main():
  ap = argparse.ArgumentParser()
  ap.add_argument("--json", required=True)
  ap.add_argument("--out", required=True)
  args = ap.parse_args()

  data = json.load(open(args.json, "r", encoding="utf-8"))
  vulns = data.get("results", []) or []

  sev_counts = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0, "UNKNOWN": 0}

  # OSV output can vary; we keep it defensive
  sample = []
  for r in vulns:
    for pkg in r.get("packages", []) or []:
      for v in pkg.get("vulnerabilities", []) or []:
        sev = (v.get("severity") or "UNKNOWN").upper()
        if sev not in sev_counts:
          sev = "UNKNOWN"
        sev_counts[sev] += 1
        if len(sample) < 25:
          sample.append({
            "id": v.get("id", ""),
            "severity": sev,
            "summary": (v.get("summary") or "")[:220]
          })

  out = {"counts": sev_counts, "sample": sample}
  with open(args.out, "w", encoding="utf-8") as f:
    json.dump(out, f, indent=2)

if __name__ == "__main__":
  main()
```

## 6.4 `gate_eval.py` (apply your quality gates + produce a unified report)

```python
#!/usr/bin/env python3
import argparse, json, yaml, datetime

def status_from_threshold(value, warn=None, fail=None, target=None):
  # Returns PASS/WARN/FAIL based on fail first, then warn, then target as informational
  if fail is not None and value < fail:
    return "FAIL"
  if warn is not None and value < warn:
    return "WARN"
  return "PASS"

def main():
  ap = argparse.ArgumentParser()
  ap.add_argument("--gates", required=True)
  ap.add_argument("--service", required=True)
  ap.add_argument("--commit", required=True)
  ap.add_argument("--branch", required=True)
  ap.add_argument("--run_url", required=True)
  ap.add_argument("--jacoco", required=True)
  ap.add_argument("--codeql", required=True)
  ap.add_argument("--osv", required=True)
  ap.add_argument("--out", required=True)
  args = ap.parse_args()

  gates = yaml.safe_load(open(args.gates, "r", encoding="utf-8"))
  jacoco = json.load(open(args.jacoco, "r", encoding="utf-8"))
  codeql = json.load(open(args.codeql, "r", encoding="utf-8"))
  osv = json.load(open(args.osv, "r", encoding="utf-8"))

  b = gates["benchmarks"]

  metrics = {
    "coverage.line_pct": jacoco["line"]["pct"],
    "coverage.branch_pct": jacoco["branch"]["pct"],
    "coverage.method_pct": jacoco["method"]["pct"],
    "security.codeql_errors": codeql["counts"].get("error", 0),
    "security.codeql_warnings": codeql["counts"].get("warning", 0),
    "security.osv_critical": osv["counts"].get("CRITICAL", 0),
    "security.osv_high": osv["counts"].get("HIGH", 0),
    "security.osv_medium": osv["counts"].get("MEDIUM", 0),
  }

  # Gate evaluation
  gate_results = []

  # Coverage gates
  for k in ["line_pct", "branch_pct", "method_pct"]:
    cfg = b["coverage"][k]
    val = metrics[f"coverage.{k}"]
    gate_results.append({
      "metric": f"coverage.{k}",
      "value": val,
      "target": cfg.get("target"),
      "warn": cfg.get("warn"),
      "fail": cfg.get("fail"),
      "result": status_from_threshold(val, warn=cfg.get("warn"), fail=cfg.get("fail"))
    })

  # Security gates (counts must be <= fail thresholds; invert logic)
  def count_gate(metric_name, value, fail=None, warn=None):
    if fail is not None and value > fail:
      return "FAIL"
    if warn is not None and value > warn:
      return "WARN"
    return "PASS"

  sec = b["security"]
  gate_results.append({
    "metric": "security.codeql_errors",
    "value": metrics["security.codeql_errors"],
    "fail": sec["codeql_errors"]["fail"],
    "result": count_gate("security.codeql_errors", metrics["security.codeql_errors"], fail=sec["codeql_errors"]["fail"])
  })
  gate_results.append({
    "metric": "security.osv_critical",
    "value": metrics["security.osv_critical"],
    "fail": sec["osv_critical"]["fail"],
    "result": count_gate("security.osv_critical", metrics["security.osv_critical"], fail=sec["osv_critical"]["fail"])
  })
  gate_results.append({
    "metric": "security.osv_high",
    "value": metrics["security.osv_high"],
    "fail": sec["osv_high"]["fail"],
    "result": count_gate("security.osv_high", metrics["security.osv_high"], fail=sec["osv_high"]["fail"])
  })

  overall = "PASS"
  if any(g["result"] == "FAIL" for g in gate_results):
    overall = "FAIL"
  elif any(g["result"] == "WARN" for g in gate_results):
    overall = "WARN"

  out = {
    "service": args.service,
    "branch": args.branch,
    "commit": args.commit,
    "run_url": args.run_url,
    "generated_at": datetime.datetime.utcnow().isoformat() + "Z",
    "overall": overall,
    "metrics": metrics,
    "gates": gate_results,
    "samples": {
      "codeql": codeql.get("sample", []),
      "osv": osv.get("sample", [])
    }
  }

  with open(args.out, "w", encoding="utf-8") as f:
    json.dump(out, f, indent=2)

  # Fail the workflow if FAIL (optional: you can keep it non-blocking at first)
  if overall == "FAIL":
    print("QUALITY GATE: FAIL")
    raise SystemExit(2)
  print(f"QUALITY GATE: {overall}")

if __name__ == "__main__":
  main()
```

## 6.5 `render_dashboard.py` (build the org-wide HTML)

```python
#!/usr/bin/env python3
import argparse, json, os, yaml
from datetime import datetime

def badge(status):
  if status == "PASS":
    return '<span style="padding:2px 8px;border-radius:10px;background:#d4edda;color:#155724;">PASS</span>'
  if status == "WARN":
    return '<span style="padding:2px 8px;border-radius:10px;background:#fff3cd;color:#856404;">WARN</span>'
  return '<span style="padding:2px 8px;border-radius:10px;background:#f8d7da;color:#721c24;">FAIL</span>'

def main():
  ap = argparse.ArgumentParser()
  ap.add_argument("--gates", required=True)
  ap.add_argument("--reports_dir", required=True)
  ap.add_argument("--out", required=True)
  args = ap.parse_args()

  gates_cfg = yaml.safe_load(open(args.gates, "r", encoding="utf-8"))

  reports = []
  for fn in sorted(os.listdir(args.reports_dir)):
    if not fn.endswith(".json"):
      continue
    path = os.path.join(args.reports_dir, fn)
    try:
      reports.append(json.load(open(path, "r", encoding="utf-8")))
    except Exception:
      pass

  # Summaries
  total = len(reports)
  pass_n = sum(1 for r in reports if r.get("overall") == "PASS")
  warn_n = sum(1 for r in reports if r.get("overall") == "WARN")
  fail_n = sum(1 for r in reports if r.get("overall") == "FAIL")

  # Compute averages for key coverage metrics
  def avg(key):
    vals = [r.get("metrics", {}).get(key) for r in reports]
    vals = [v for v in vals if isinstance(v, (int, float))]
    return round(sum(vals) / len(vals), 2) if vals else 0.0

  avg_line = avg("coverage.line_pct")
  avg_branch = avg("coverage.branch_pct")
  avg_method = avg("coverage.method_pct")

  html = []
  html.append("<html><head><meta charset='utf-8'/>")
  html.append("<title>Org Quality Dashboard</title></head>")
  html.append("<body style='font-family:Arial, sans-serif; margin:24px;'>")
  html.append("<h1>Organization Quality Gates Dashboard</h1>")
  html.append(f"<p>Generated: <b>{datetime.utcnow().isoformat()}Z</b></p>")

  html.append("<h2>Summary</h2>")
  html.append("<ul>")
  html.append(f"<li>Total services: <b>{total}</b></li>")
  html.append(f"<li>PASS: <b>{pass_n}</b> | WARN: <b>{warn_n}</b> | FAIL: <b>{fail_n}</b></li>")
  html.append(f"<li>Avg Line Coverage: <b>{avg_line}%</b> | Avg Branch: <b>{avg_branch}%</b> | Avg Method: <b>{avg_method}%</b></li>")
  html.append("</ul>")

  html.append("<h2>Services</h2>")
  html.append("<table border='1' cellpadding='8' cellspacing='0' style='border-collapse:collapse;width:100%;'>")
  html.append("<tr style='background:#f2f2f2;'>"
              "<th>Service</th><th>Overall</th>"
              "<th>Line %</th><th>Branch %</th><th>Method %</th>"
              "<th>CodeQL Errors</th><th>OSV Critical</th><th>OSV High</th>"
              "<th>Run</th></tr>")

  for r in reports:
    m = r.get("metrics", {})
    html.append("<tr>"
      f"<td>{r.get('service','')}</td>"
      f"<td>{badge(r.get('overall','FAIL'))}</td>"
      f"<td>{m.get('coverage.line_pct','')}</td>"
      f"<td>{m.get('coverage.branch_pct','')}</td>"
      f"<td>{m.get('coverage.method_pct','')}</td>"
      f"<td>{m.get('security.codeql_errors','')}</td>"
      f"<td>{m.get('security.osv_critical','')}</td>"
      f"<td>{m.get('security.osv_high','')}</td>"
      f"<td><a href='{r.get('run_url','')}' target='_blank'>CI Run</a></td>"
      "</tr>"
    )

  html.append("</table>")
  html.append("<hr/>")
  html.append("<p style='color:#666'>Benchmarks are defined in <code>quality-gates.yml</code>.</p>")
  html.append("</body></html>")

  os.makedirs(os.path.dirname(args.out), exist_ok=True)
  with open(args.out, "w", encoding="utf-8") as f:
    f.write("\n".join(html))

if __name__ == "__main__":
  main()
```

---

# 7) Step-by-step implementation checklist (do this today)

## Step 1 — Create central repo

1. Create `code-coverage-app`
2. Add:

   * `quality-gates.yml`
   * `scripts/*` from above
   * workflow `build-dashboard.yml`
3. Enable GitHub Pages from `/docs`.

## Step 2 — Create a PAT / GitHub App token

* Create `DASHBOARD_PAT` with permission to push to `code-coverage-app`
* Store the PAT as a secret in each microservice repo (or org-level secret if available).

## Step 3 — Add child workflow to 1 microservice (pilot)

* Add `.github/workflows/weekly-quality.yml`
* Adjust:

  * build command (`./gradlew ...` vs `mvn ...`)
  * jacoco xml path

Run it manually using `workflow_dispatch`.
Confirm you see `reports/<service>.json` appear in central repo.

## Step 4 — Confirm dashboard generates

* Central workflow triggers on push to `reports/*.json`
* `docs/index.html` gets updated
* GitHub Pages URL shows the service row + pass/fail badges.

## Step 5 — Roll out to all 80

* Copy workflow into each repo
* Or automate via script/templating.

---

# 8) What to tell your manager (clear narrative)

* “We’re retiring SonarQube, but we’ll keep the same governance model using GitHub Actions quality gates.”
* “JaCoCo will be source of truth for coverage; CodeQL + OSV ensure security; reliability/maintainability gates can be added incrementally.”
* “We will have an org-wide HTML dashboard aggregating all 80 services weekly.”

---

# 9) Fast coverage improvement plan for the specific repo (next 1 day)

To quickly lift coverage from ~39%:

1. **Exclude noise** from coverage counts:

   * `configuration/*`, `dto/*`, `model/*`, generated sources, exception classes, main application bootstrap.
2. Add tests for **service + domain logic first** (highest value).
3. Add **branch tests**:

   * error handling paths, validations, if/else paths.
4. Ensure tests actually run in CI:

   * correct test task (`test` vs `integrationTest`)
   * jacoco report generated after tests.

If you want, paste your repo’s build tool (Gradle/Maven) and your current JaCoCo config block, and I’ll give you the exact exclude patterns and the smallest set of tests that will move branch coverage up quickly.

---

If you implement exactly what’s above, you’ll have:

* per-service weekly quality gates
* a consolidated org dashboard for all 80 services
* and a SonarQube-like governance story—without SonarQube.
