Perfect — you’re now thinking like a **DevSecOps engineer**:
you already have CodeQL (for static code analysis), JaCoCo (for code coverage), and a custom release report that links coverage to JIRA stories — and you want to integrate them all into **one automated PDF report per PR or release build**.

Let’s break this into a practical, phased plan with **architecture + workflow YAML design + report generation logic**.

---

## 🧩 1. **Objective**

You want to automatically generate and archive a single **PDF report** that includes:

1. ✅ **JaCoCo Code Coverage** (unit/integration coverage %)
2. ✅ **Test Coverage / Release Report** (stories covered, passed tests)
3. ✅ **CodeQL Vulnerabilities Summary** (with CVEs, severity, fixes)
4. ✅ **Metadata** (build number, branch, PR, date, commit ID)

This PDF should be created automatically in your **GitHub Enterprise CI workflow** on every PR build or release tag.

---

## ⚙️ 2. **Workflow Architecture Overview**

**Workflow Name:** `generate-release-report.yml`
**Trigger:** On PR build or release tag
**Tools Used:**

* **JaCoCo** → generates `jacoco.xml` coverage report
* **CodeQL** → generates `codeql-results.sarif` (security report)
* **Custom Release Script** → extracts JIRA links and test coverage JSON
* **Python or Node script** → merges these and generates PDF
* **Artifact Upload** → stores `release_report.pdf` as CI artifact

---

## 🏗️ 3. **Workflow YAML (Simplified Template)**

Here’s a **GitHub Actions workflow** you can adapt to OpenShift or Jenkins easily.

```yaml
name: Generate Release PDF Report

on:
  workflow_dispatch:
  pull_request:
    types: [opened, synchronize, reopened]
  push:
    tags:
      - 'v*.*.*'

jobs:
  build-and-analyze:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@v4

      # 🧪 Run Tests + JaCoCo Coverage
      - name: Run Unit Tests with JaCoCo
        run: |
          ./gradlew clean test jacocoTestReport
        continue-on-error: false

      - name: Upload JaCoCo XML report
        uses: actions/upload-artifact@v4
        with:
          name: jacoco-report
          path: build/reports/jacoco/test/jacocoTestReport.xml

      # 🔍 Run CodeQL Analysis
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

      - name: Upload CodeQL SARIF
        uses: actions/upload-artifact@v4
        with:
          name: codeql-sarif
          path: ./codeql-results.sarif

      # 📋 Fetch Release Report (test coverage + Jira links)
      - name: Fetch Release Report JSON
        run: |
          curl -o release_report.json ${{ secrets.RELEASE_REPORT_API }}

      # 🧾 Merge All Reports into PDF
      - name: Merge Reports and Generate PDF
        run: |
          pip install reportlab pyyaml lxml
          python3 .github/scripts/generate_pdf_report.py \
            --jacoco build/reports/jacoco/test/jacocoTestReport.xml \
            --codeql codeql-results.sarif \
            --release release_report.json \
            --output release_summary.pdf

      - name: Upload Final PDF
        uses: actions/upload-artifact@v4
        with:
          name: release-summary
          path: release_summary.pdf
```

---

## 🧠 4. **The `generate_pdf_report.py` (Python) Logic**

Here’s pseudocode to merge and format data beautifully:

```python
import json, xml.etree.ElementTree as ET
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from datetime import datetime

def parse_jacoco(xml_path):
    tree = ET.parse(xml_path)
    counters = tree.findall(".//counter")
    coverage = {c.get("type"): c.get("covered") for c in counters}
    return coverage

def parse_codeql(sarif_path):
    with open(sarif_path) as f:
        sarif = json.load(f)
    vulns = []
    for run in sarif["runs"]:
        for res in run["results"]:
            vulns.append({
                "rule": res["ruleId"],
                "severity": res.get("level"),
                "message": res["message"]["text"]
            })
    return vulns

def parse_release(json_path):
    with open(json_path) as f:
        return json.load(f)

def generate_pdf(jacoco, codeql, release, output):
    doc = SimpleDocTemplate(output)
    styles = getSampleStyleSheet()
    story = []
    story.append(Paragraph(f"<b>Release Report - {datetime.now().strftime('%Y-%m-%d')}</b>", styles['Title']))
    story.append(Spacer(1,12))

    story.append(Paragraph("<b>Code Coverage</b>", styles['Heading2']))
    for k,v in jacoco.items():
        story.append(Paragraph(f"{k}: {v}", styles['Normal']))
    story.append(Spacer(1,12))

    story.append(Paragraph("<b>Vulnerabilities (CodeQL)</b>", styles['Heading2']))
    data = [["Rule ID", "Severity", "Message"]] + [[v['rule'], v['severity'], v['message']] for v in codeql]
    story.append(Table(data))
    story.append(Spacer(1,12))

    story.append(Paragraph("<b>Test Coverage & JIRA Stories</b>", styles['Heading2']))
    for story_item in release.get("stories", []):
        story.append(Paragraph(f"{story_item['id']} - {story_item['status']} ({story_item['coverage']}%)", styles['Normal']))

    doc.build(story)
    print(f"✅ Generated {output}")

if __name__ == "__main__":
    # parse arguments, call above functions
    ...
```

This script combines all three reports → outputs a clean, stylized PDF.

---

## 📦 5. **Output Example**

Generated file: `release_summary.pdf`

**Sections:**

1. **Header:** Repo name, branch, build ID, timestamp
2. **Code Coverage Summary:** Line, branch, method coverage %
3. **CodeQL Findings:** Table with Severity, File, Description
4. **Test Coverage & JIRA Stories:** Each story, test %
5. **Footer:** Build URL, commit hash, CI pipeline status

---

## 🧩 6. **Optional Enhancements**

* 📧 Email or Slack the PDF link to the team (using `actions-slack` or `smtp-email` step)
* 🏷️ Tag build with “Quality Gate: Passed/Failed”
* 📊 Push metrics to **Grafana** or **SonarQube dashboard**
* 🧠 Add **AI summary (OpenAI or Bedrock Titan)** section summarizing vulnerabilities and key metrics in human language.

---

Would you like me to generate the **complete working version** of the `generate_pdf_report.py` script (ready-to-run with argument parsing and formatting), so you can directly plug it into your workflow?
