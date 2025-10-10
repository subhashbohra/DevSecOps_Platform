Excellent — you’re thinking exactly like an enterprise DevSecOps architect.
✅ Let’s design this properly: you want to **retire SonarQube**, keep **CodeQL** for security scanning, and use **JaCoCo** (or similar) for **code coverage + quality metrics**, all running **inside enterprise GitHub Actions / on-prem runners (no public images)**.

---

## 🎯 Goal of the POC

> Replace SonarQube with a combo of **CodeQL (for security)** and **JaCoCo + custom quality gate logic (for code coverage & quality)** — entirely via GitHub Actions workflows (no external images or SaaS).

---

## 🧩 Architecture Overview

### 1. **Static Security Scan**

* Use **CodeQL** (GitHub Advanced Security) to run SAST on Java code.
* Output: SARIF report + summary table.
* Runs on every PR / nightly / release build.

### 2. **Test Coverage & Quality Metrics**

* Use **JaCoCo** Maven/Gradle plugin to generate `.exec` and `jacoco.xml`.
* Parse XML → coverage % (line, branch, class).
* Evaluate thresholds (“quality gates”) inside workflow (e.g. fail if coverage < 80%).

### 3. **Unified Report**

* Combine CodeQL findings + coverage summary + thresholds into Markdown or PDF artifact.
* Optionally upload SARIF + HTML reports for both.

---

## 🛠️ Step-by-Step Implementation (POC Workflow)

Below is a **sample GitHub Actions workflow YAML** designed for enterprise setups (no public image pulls, no internet access).

---

```yaml
name: Build-Test-CodeQL-Coverage

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  actions: read
  contents: read
  security-events: write

jobs:
  build-test-analyze:
    runs-on: [self-hosted, linux, x64] # Enterprise runner

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      # 1️⃣ Set up JDK
      - name: Setup JDK
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      # 2️⃣ Initialize CodeQL
      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: java
          queries: security-extended

      # 3️⃣ Build & run unit tests with JaCoCo
      - name: Build with Maven + JaCoCo
        run: |
          mvn clean verify \
            -DskipITs=false \
            -Pcoverage

      # 4️⃣ Upload JaCoCo report as artifact
      - name: Upload coverage report
        uses: actions/upload-artifact@v4
        with:
          name: jacoco-report
          path: target/site/jacoco/

      # 5️⃣ Extract coverage % for Quality Gate
      - name: Evaluate Coverage Quality Gate
        id: coverage
        run: |
          coverage=$(grep -oPm1 "(?<=<counter type=\"LINE\" missed=\")[^\"]+" target/site/jacoco/jacoco.xml | awk '{missed=$1}')
          total=$(grep -oPm1 "(?<=<counter type=\"LINE\" covered=\")[^\"]+" target/site/jacoco/jacoco.xml | awk '{covered=$1}')
          pct=$(awk "BEGIN {print ($covered/($missed+$covered))*100}")
          echo "Coverage: $pct%"
          threshold=80
          if (( $(echo "$pct < $threshold" | bc -l) )); then
            echo "::error ::Code coverage below $threshold% ($pct%)"
            exit 1
          fi
          echo "Coverage is acceptable ($pct%)"

      # 6️⃣ Perform CodeQL analysis
      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
        with:
          category: "security"

      # 7️⃣ Generate consolidated report (optional)
      - name: Consolidate Reports
        run: |
          mkdir report
          echo "## CodeQL & Coverage Summary" > report/summary.md
          echo "**Coverage:** $pct%" >> report/summary.md
          echo "**CodeQL Findings:**" >> report/summary.md
          cat ./codeql-results.sarif >> report/summary.md

      # 8️⃣ Upload combined report artifact
      - name: Upload combined report
        uses: actions/upload-artifact@v4
        with:
          name: combined-report
          path: report/
```

---

## 🔒 Notes for Enterprise Setup

* **No public image pulls:**
  Ensure all `uses:` actions are mirrored into your **GitHub Enterprise Action Cache** (your DevOps admin can mirror official actions like `codeql-action`, `setup-java`, `checkout` into your internal registry).

* **Offline dependencies:**
  Maven/Gradle should use your internal Nexus/Artifactory proxy (no external downloads).

* **Security events permissions:**
  `security-events: write` allows uploading CodeQL results to the enterprise dashboard (GHAS).

* **Jacoco thresholds:**
  You can parameterize thresholds per repo in a `.yaml` file and read it via script (e.g. `threshold: 75`).

* **Reporting:**
  Optionally add a step to generate a **PDF report** combining CodeQL summary + coverage metrics (I can help with that later if needed).

---

## 📈 Quality Gates with JaCoCo

Since JaCoCo doesn’t provide “gates” like SonarQube natively, you enforce gates manually:

* Set thresholds (line, branch, complexity).
* Parse XML → fail build if below target.
* You can extend this with a Python or Node script to visualize trends over time.

Alternatively, tools like **ReportGenerator** (open-source) can convert JaCoCo XML → HTML/PDF summary, also offline-compatible.

---

## 🧠 Optional Enhancements (Phase 2)

1. **Add CodeQL + JaCoCo summary to PR comment**

   * Use GitHub CLI to post a PR comment summarizing CodeQL issues and coverage %.

2. **Trend tracking**

   * Store coverage metrics in internal Prometheus or S3 to plot historical graphs.

3. **Enterprise dashboard**

   * Combine results for multiple microservices (like your 80-service setup) into one summary dashboard (I can help you with a sample JSON schema).

---

## 🚀 Deliverables for POC

✅ Workflow YAML (as above)
✅ JaCoCo XML → coverage % extraction
✅ CodeQL SARIF → vulnerability summary
✅ Unified Markdown/PDF report
✅ Quality gate enforcement (fail build on low coverage)

---

If you’d like, I can now:

* 🧾 Create a **PDF or HTML report template** that merges CodeQL + JaCoCo output,
* 🧰 Or show how to **aggregate coverage + vulnerabilities for all 80 microservices** in one dashboard using a workflow job.

Which one would you like me to show next — **the unified report generator** or **multi-repo aggregation dashboard**?
