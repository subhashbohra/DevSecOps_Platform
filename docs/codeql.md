Great — I’ll give you a **Confluence-ready draft** you can paste directly into your company wiki. It’s structured, detailed, and non-marketing, so your managers, architects, and devs all get the big picture plus the implementation details you’ve worked through.

---

# 📘 CodeQL – Secure Development at PR and Main Branch

---

## 1. 🔎 What is CodeQL?

**CodeQL** is GitHub’s semantic code analysis engine.

* It treats code like data and runs queries against the codebase.
* Queries are written in a special query language (QL) and mapped to security rules.
* Each query represents a potential vulnerability or coding flaw (e.g., SQL Injection, XSS, CSRF).
* Output is stored in **SARIF (Static Analysis Results Interchange Format)**, which GitHub can display in the **Security → Code scanning alerts** tab.

**Key Features:**

* Detects vulnerabilities in **custom code**.
* Maps results to **CWE IDs** (industry-standard weakness categories).
* Provides **inline annotations in PRs** so developers fix issues before merging.
* Supports multiple languages (Java, Python, JavaScript/TS, C#, Go, C/C++, etc.).

---

## 2. 🏢 How We Use CodeQL in Our Company

We’ve set up CodeQL with **two scanning workflows**:

### **a. PR Workflow (Shift-Left)**

* Trigger: `pull_request` on `main` and `release/*` branches.
* Runs CodeQL as a job alongside CI build (Sonar, JFrog, etc.).
* Annotates PRs with security findings.
* Build **fails** if High/Critical issues (severity ≥7.0) are found.
* Developers fix before merging → *shift-left security*.

### **b. Main Workflow (Baseline Security)**

* Trigger: `push` to `main` (default branch) + scheduled weekly runs.
* Runs CodeQL and uploads SARIF results to **Security tab → Code scanning alerts**.
* Provides long-term visibility of vulnerabilities across the codebase.
* Security/Compliance teams use this as the **baseline dashboard**.

---

## 3. ⚙️ Setup in Our CI/CD

We use **reusable GitHub Actions workflows** stored in a central repo (`org/security-workflows`):

* `PR_Build.yml`

  * Job `continuous_integration`: build/test/sonar/jfrog.
  * Job `codeql`: checkout → init CodeQL → mvn build → analyze → upload SARIF → fail build if High/Critical.

* `codeql-main.yml`

  * Runs on `push: main` and weekly cron.
  * Uploads SARIF to Security tab.
  * Provides baseline reporting.

**Per repo integration:**

* Small wrapper workflow calls the central reusable workflows.
* Keeps consistency across ~80 repos.
* Any CodeQL logic change is updated once centrally.

---

## 4. 🏗️ CodeQL Architecture in Our Company

```
Developer PR --> GitHub Actions (PR_Build.yml)
    |--> Continuous Integration Job (build, sonar, jfrog)
    |--> CodeQL Job (init, analyze, upload)
           |--> SARIF Results
           |--> Shown in PR Checks (shift-left)

Merge to Main --> GitHub Actions (codeql-main.yml)
    |--> CodeQL Job (init, analyze, upload)
           |--> SARIF Results
           |--> Persisted in Security Tab (baseline)
```

---

## 5. 🛠️ Technology Stack

* **Source Control / CI**: GitHub + GitHub Actions
* **CodeQL Engine**: `github/codeql-action/init` + `analyze`
* **Build Tools**: Maven, JDK 8/17 (depending on repo)
* **SARIF Processing**: `jq` filters in pipeline to:

  * Count findings
  * Fail builds if severity ≥7.0
  * Print Rule ID, CWE, Severity, Message, File:Line in logs
* **Security Tab Integration**: `github/codeql-action/upload-sarif`
* **Complementary Tools**:

  * **RenovateBot** – dependency upgrade automation (SCA).
  * **Veracode** – binary/SCA scans for compliance and final checks.

---

## 6. 🔗 How CodeQL, Renovate, and Veracode Work Together

### **CodeQL (SAST)**

* Runs on **source code**.
* Finds vulnerabilities in **custom logic**.
* Integrated at PR time (shift-left).
* Results visible in PRs + Security tab (main branch).

### **RenovateBot (SCA)**

* Monitors **dependencies** (Maven, npm, etc.).
* Raises PRs automatically when a vulnerable dependency is detected.
* Keeps libraries patched → reduces CVEs from 3rd-party code.

### **Veracode**

* Scans **compiled binaries** (JARs, WARs).
* Strong at **compliance reporting** (PCI, ISO, HIPAA).
* Detects dependency issues + misconfigs at build stage.
* Feedback loop is slower than CodeQL.

---

## 7. 📊 CodeQL vs Renovate vs Veracode – Comparison

| Capability / Coverage                  | **CodeQL** 🟢     | **RenovateBot** 🟢 | **Veracode** 🟡        |
| -------------------------------------- | ----------------- | ------------------ | ---------------------- |
| **SAST (Static App Security Testing)** | ✅ Source analysis | ❌                  | ✅ Binary + some source |
| **SCA (Dependency CVEs)**              | ❌                 | ✅ Auto-updates     | ✅ CVE detection        |
| **Binary / Artifact Scanning**         | ❌                 | ❌                  | ✅ JAR/WAR/EXE          |
| **PR-time Feedback (Shift-Left)**      | ✅ Inline checks   | ✅ PRs for upgrades | ❌ Post-build           |
| **Compliance / Audit Reporting**       | ❌                 | ❌                  | ✅ Strong               |
| **Ease of Developer Use**              | ✅ In PR           | ✅ In PR            | ⚠️ External portal     |

**Key Takeaway:**

* **CodeQL + Renovate** cover ~70–80% of security issues *at PR time*.
* **Veracode** remains valuable for compliance and binary scanning.
* For developer security, CodeQL + Renovate enable real **shift-left vulnerability management**.

---

## 8. 🚀 Next Steps for Our Company

1. Roll out **PR_Build.yml** + **codeql-main.yml** to all repos.
2. Use RenovateBot across repos to automate dependency upgrades.
3. Compare CodeQL vs Veracode findings repo-by-repo (CWE mapping).
4. Decide whether Veracode can be reduced to compliance-only scope.

---

✅ This page will give leadership visibility into **why we’re investing in CodeQL**, how it complements our stack, and where it overlaps with Veracode.

---

👉 Do you want me to also design a **diagram (Confluence-ready PNG)** showing the pipeline flow (Dev → PR → CodeQL/Renovate → Main → Veracode) so the relationships are crystal clear visually?





Ah, good clarification 👍 — thanks for catching that. RenovateBot isn’t tied to PR workflows like CodeQL; it runs on its **own schedule** (e.g. weekly) and raises PRs for dependency bumps. Let’s fix the wording and diagram flow to match your actual setup:

---

## ✅ Corrected Flow

* **Devs raise a PR** → triggers **PR workflow**:

  * Runs **CodeQL** → inline PR feedback (security annotations, build fail on High/Critical).
  * Runs CI jobs (build, Sonar, JFrog, etc.).

* **RenovateBot** → runs on a **weekly schedule**, not per PR:

  * Scans dependencies.
  * Raises **automated PRs** with version upgrades for vulnerable/old packages.
  * Those PRs then go through the normal PR workflow (which includes CodeQL + CI).

* **Merge to main** → triggers **main workflow**:

  * Runs **CodeQL baseline scan**.
  * Uploads SARIF results to **Security tab (Code scanning alerts)** for long-term tracking.

* **Veracode** → runs later in the pipeline:

  * Scans **compiled binaries (JARs/WARs)**.
  * Provides **compliance dashboards** and coverage beyond GitHub.

---

## 📌 Updated Manager-Friendly Summary

* **CodeQL** → PR-time custom code security.
* **RenovateBot** → weekly dependency PRs (shift-left SCA).
* **Veracode** → post-build binary scans + compliance.

Together:
👉 CodeQL + Renovate shift ~70–80% of security checks left into PRs,
👉 Veracode remains for compliance and artifact-level coverage.

---

Would you like me to **regenerate the diagram** so Renovate is shown as a **weekly scheduled process raising PRs** (instead of running in each PR workflow)? That way the Confluence diagram exactly matches your company setup.

