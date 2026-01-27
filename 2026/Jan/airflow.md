

---

## 1️⃣ Start the meeting with the RIGHT framing (30 seconds)

Say something like this (calm, confident):

> “My goal is to deliver this Airflow + Spark POC end-to-end within the next two weeks and meet every acceptance criterion without rework.
> I’d like to clarify a few dependencies and standards today so we can move fast and avoid blockers later.”

This sets you up as **execution-focused**, not confused.

---

## 2️⃣ Questions to ask (these will save you DAYS)

### A. Environment & Access (ask FIRST)

These unblock everything else.

1. **Cluster & namespace**

* “Which GKE/GDC cluster and namespaces should I target for this POC?”
* “Can I create namespaces myself, or should I request them via platform?”

2. **Permissions**

* “Do I already have permission to deploy Helm charts and CRDs (for Spark Operator), or do I need platform help?”
* “Is there an existing service account pattern I must follow for Airflow and Spark?”

3. **Image registry**

* “Which container registry is approved for custom images?”
* “Is image scanning/signing required for POC, or can we keep it minimal?”

👉 *Why this matters:* Spark Operator needs CRDs + image pulls. If this isn’t clear, you’ll stall later.

---

### B. Logging & Observability (VERY important)

This is explicitly in acceptance criteria.

Ask **exactly**:

1. **Centralized logging**

* “What is the standard centralized logging system in GDC for Kubernetes workloads?”
* “Are pod stdout/stderr logs already collected by default?”

2. **Retention & access**

* “How long are logs retained for ephemeral pods?”
* “What is the recommended way for developers to query Spark driver/executor logs?”

3. **Spark-specific logs**

* “Is there an approved object store (GCS / equivalent) for Spark event logs?”
* “Is running a Spark History Server acceptable for this POC, or is log explorer sufficient?”

👉 *Why this matters:* This is usually where POCs fail acceptance.

---

### C. ArgoCD & GitOps (don’t assume anything)

Ask these **clearly**:

1. **Repo ownership**

* “Which platform-owned repositories should I use for Airflow, Spark, and test apps?”
* “Should I create new paths or reuse existing ones?”

2. **ArgoCD pattern**

* “Are we using app-of-apps, Helm directly, or Kustomize as the standard?”
* “Do you prefer one ArgoCD app per component or a single umbrella app?”

3. **Access**

* “Will I have write access to ArgoCD applications, or should I submit PRs only?”

👉 *Why this matters:* Avoids rework when someone says “this isn’t our GitOps standard”.

---

### D. Airflow standards (keep it simple but compliant)

Ask:

1. **Airflow flavor**

* “Do we already have a pre-packaged Airflow solution we must use, or can I deploy the official Helm chart for this POC?”

2. **Executor**

* “Is KubernetesExecutor acceptable for this POC?”

3. **Auth & exposure**

* “How should Airflow UI be exposed — internal ingress, gateway, or port-forward for POC?”

👉 *Why this matters:* Choosing the wrong executor or exposure method creates churn.

---

### E. Spark POC scope (lock this down early)

Ask:

1. **Job expectations**

* “Is a simple Spark job (pi / wordcount) sufficient as long as it runs with 2–3 executors?”

2. **Resource limits**

* “Are there quota limits I should stay within for driver/executor pods?”

3. **Ephemeral requirement**

* “Just to confirm — executor pods must terminate after job completion, correct?”

👉 *Why this matters:* Prevents “this is too basic” feedback later.

---

### F. Demo & Acceptance (THIS MAKES YOU LOOK SMART)

Ask this verbatim:

> “At the end of this POC, what would a *successful demo* look like from your perspective?”

Then follow with:

* “Is a live Airflow DAG trigger → Spark job → logs walkthrough sufficient?”
* “Who needs to sign off on acceptance?”

👉 *Why this matters:* You align delivery to **their mental picture of success**.

---

## 3️⃣ YES — You SHOULD log everything (this protects you)

### ✅ Best practice for your situation

Do **both**:

### 1) Daily or per-meeting **Minutes of Meeting (MoM)**

Send after **every discussion**, even short ones.

**MoM template (copy-paste):**

```
Meeting: Airflow & Spark POC – CLT-71116
Date:
Attendees:

Key Decisions:
- Logging solution:
- ArgoCD repo:
- Airflow deployment approach:
- Spark deployment approach:

Open Questions / Actions:
- [Name] – Action – Due date

Risks / Dependencies:
- e.g., CRD install permission pending
```

Send this by email or Teams — this creates an **audit trail**.

---

### 2) One **living Confluence page** (VERY IMPORTANT)

Create a page titled:

> **“Airflow & Spark POC on GDC – Execution & Status”**

Sections to include:

1. Scope & Acceptance Criteria (copy from Jira)
2. Architecture Diagram (simple box diagram is fine)
3. Jira Task Breakdown & Status
4. Decisions Log (date-wise)
5. Risks & Mitigations
6. Demo Plan
7. Links (repos, ArgoCD apps, Airflow UI)

👉 Update this daily or every 2 days.

This makes you look:

* Organized
* Transparent
* In control

And it **protects you** if someone later says “this wasn’t communicated”.

---

## 4️⃣ One POWER move before the meeting ends

Close the meeting with this line:

> “I’ll send today’s MoM and create a Confluence page capturing decisions, progress, and risks.
> Please let me know if anyone prefers updates in a different format.”

This subtly positions you as the **owner** of delivery.

---

## 5️⃣ What you should do immediately after TODAY’s meeting

1. Send MoM within **30–60 minutes**
2. Create Confluence page same day
3. Create Jira comments summarizing:

   * decisions
   * dependencies
   * next steps

---


