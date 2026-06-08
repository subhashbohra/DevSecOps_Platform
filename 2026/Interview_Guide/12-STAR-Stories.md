# 12 — STAR Stories

> Your behavioral story bank. Written from your real work, polished to interview-ready form. **One rule:** anywhere you see `[insert: ...]`, replace it with a real number you can defend — never quote a metric you can't back up under "Dive Deep" pressure.

**How to use:**
- Each story is tagged with the **Amazon LPs** (`14`) and **Googleyness** themes (`13`) it best serves.
- Keep answers ~2 minutes. Lead with **scope** (the Principal/Staff signal), land the **quantified result**.
- The "Scope framing" line is how you elevate each story to Principal/L6 altitude — practice saying it.
- Rehearse the **3 likely follow-ups** under each story; senior interviewers drill.

> **Universal opener:** "I lead platform engineering at a global, regulated bank — a small global team across London and India. Let me give you a specific example…"

---

## 1. GitHub Migration

**Tags:** Ownership · Bias for Action · Insist on Highest Standards · Deliver Results · (Googleyness: navigating ambiguity)

- **Situation:** We needed to migrate our source control and CI workflows to GitHub [insert: from what — e.g., from a legacy/self-hosted system], in a regulated environment with strict security, audit, and zero-tolerance for losing history.
- **Task:** Own the migration end-to-end with minimal disruption to engineering teams, while meeting the bank's security and compliance bar (no plaintext secrets, auditable change control, controlled runners).
- **Action:** I inventoried repos, pipelines, and secrets; designed a phased cutover with parallel running and rollback; standardized CI on GitHub Actions with OIDC-based cloud auth (no static keys), SHA-pinned actions, least-privilege tokens, and self-hosted runners for internal network access. I built a build-failure RCA capability hooked into Actions to shorten debugging. I communicated timelines and ran the migration team-by-team.
- **Result:** Migrated [insert: N repos / N pipelines] with [insert: zero/near-zero] disruption, improved pipeline security posture (OIDC, pinned actions), and reduced build-failure triage time via the RCA hook by [insert: %]. The pattern became reusable for later teams.

**Scope framing:** *"I didn't just migrate my team — I created the secure CI pattern and tooling other teams then adopted."*

**Likely follow-ups:** How did you handle secrets safely? · What broke and how did you roll back? · How did you get teams to adopt the new workflow?

---

## 2. OpenShift → GCP Migration

**Tags:** Invent and Simplify · Think Big · Ownership · Dive Deep · (Googleyness: technical leadership under ambiguity)

- **Situation:** Our platform workloads needed to move from OpenShift to GCP (GKE/GDC), in an air-gapped, regulated context — no public registries, strict data residency.
- **Task:** Re-platform without disrupting production data pipelines, while meeting air-gapped/compliance constraints.
- **Action:** I designed the target GKE/GDC architecture (private clusters, air-gapped image distribution, Workload Identity, policy-as-code), mapped dependencies, and ran a phased migration with validation gates and rollback. I addressed the air-gapped constraints directly (internal registry, controlled egress) and standardized GitOps for reproducible, auditable deploys.
- **Result:** Completed the migration with [insert: outcome — e.g., no data loss, X% better resource utilization / cost], on a platform that's now the standard substrate for [insert: which workloads]. Improved security posture and operability.

**Scope framing:** *"This wasn't a lift-and-shift — I set the platform standard for how regulated workloads run on GCP here."*

**Likely follow-ups:** How did air-gapping change your design? · What was the hardest dependency to migrate? · How did you validate correctness during cutover?

---

## 3. Engineering Excellence Award

**Tags:** Deliver Results · Insist on Highest Standards · Earn Trust · (Googleyness: impact + humility)

- **Situation:** [insert: the specific body of work that won the award — likely the config-driven migration framework and/or the AI RCA platform].
- **Task:** Deliver a hard platform outcome that raised the bar for the org, not just my team.
- **Action:** [insert: the core of what you did — e.g., turned a 50-pipeline Iceberg/Trino/Nessie migration into a config-driven framework so it became a repeatable functional-knowledge problem rather than a bespoke engineering effort per pipeline; built and shipped the AI RCA platform from PoC to production].
- **Result:** Recognized with the Engineering Excellence Award for [insert: the specific impact — effort reduction, adoption, reliability]. Quantify: reduced migration effort from [insert: before] to [insert: after]; adopted by [insert: teams].

**Scope framing:** *"The award was for turning a one-off hard problem into reusable leverage other teams now benefit from."*

**Likely follow-ups:** What specifically did the framework abstract away? · How did you measure the impact? · What would you do differently?

---

## 4. AWS Community Builder

**Tags:** Learn and Be Curious · Hire and Develop the Best · Earn Trust · (Googleyness: growth, community, thought leadership)

- **Situation:** I wanted to grow as a cloud technologist beyond my day job and contribute to the broader community.
- **Task:** Build genuine technical thought leadership and help others learn.
- **Action:** Earned **AWS Community Builder** status (now [insert: 2nd] consecutive year). I build in public — acloudresume.com on a fully serverless AWS stack, an AWS Weekly newsletter via a multi-agent pipeline, a multi-source cloud/AI news digest pipeline, and content/talks (submitted to AWS Community Day Bangalore). I mentor others, including supporting a family member's cybersecurity channel launch.
- **Result:** Sustained Community Builder recognition, a growing public profile/newsletter, and a habit of learning-in-public that feeds directly back into my engineering judgment and team's currency on the latest cloud/AI developments.

**Scope framing:** *"This is how I stay ahead of the industry and bring it back to my org — and it's exactly the thought-leadership a Principal SA role is built on."*

**Likely follow-ups:** What's the most-read thing you've published? · How do you keep current? · How has this helped your team?

---

## 5. AI Platform (Ollama/Gemma RCA)

**Tags:** Think Big · Invent and Simplify · Ownership · Dive Deep · Deliver Results · (Googleyness: ambitious, scoped, cross-team impact)

- **Situation:** Root-cause analysis and anomaly detection across our platform was slow and manual, and in a regulated bank we couldn't send data to external LLM APIs.
- **Task:** Build an AI-driven RCA + anomaly-detection capability that respects air-gapped/data-residency constraints.
- **Action:** I designed and shipped an **air-gapped RCA platform** on GDC Kubernetes using **Ollama/Gemma** — from PoC through production. Full architecture, Helm/K8s manifests, prompt engineering for structured JSON RCA output, and a Claude-Code-driven build approach. I then drove it through the **Central Architecture Board**, getting approval for **bank-wide adoption**, and productized it so any team can consume it as a platform.
- **Result:** CAB-approved for bank-wide use; being productized for any team [insert: + adoption numbers / time-to-RCA improvement]; [insert: organizational award pending]. Extending it into a developer copilot for PR review on the bank's internal LLM.

**Scope framing:** *"This started as my team's tool and became an org-wide, architecture-board-approved platform — that's the multiplier I want to operate at."*

**Likely follow-ups:** How did you get CAB approval — who pushed back and why? · How do you keep the LLM output reliable/safe? · How do you measure RCA quality?

---

## 6. Cost Savings

**Tags:** Frugality · Ownership · Dive Deep · Deliver Results · (Googleyness: judgment, doing the right thing)

- **Situation:** [insert: where the cost problem was — e.g., over-provisioned compute / inefficient storage / data transfer on the lakehouse or clusters].
- **Task:** Reduce cost-to-serve without hurting reliability or developer experience.
- **Action:** [insert: what you did — e.g., right-sized requests/limits, introduced autoscaling/Karpenter-style bin-packing, storage tiering/lifecycle, Iceberg compaction + partitioning to cut scan cost, showback per tenant to drive accountability].
- **Result:** Reduced [insert: cost metric] by [insert: % / amount], while maintaining [insert: SLO]. Built ongoing cost visibility so the savings stuck.

**Scope framing:** *"I treated cost as a first-class platform feature with visibility and accountability, not a one-time cleanup."*

**Likely follow-ups:** How did you avoid hurting performance? · How did you make the savings durable? · How did you get teams to care about cost?

---

## 7. Production Incident

**Tags:** Ownership · Bias for Action · Dive Deep · Earn Trust · (Googleyness: calm under pressure, learning from failure)

- **Situation:** [insert: the incident — e.g., a pipeline/platform outage affecting downstream consumers].
- **Task:** Restore service fast, then prevent recurrence.
- **Action:** I led the response — [insert: triage steps, how you localized the cause using observability/RCA, what you mitigated first]. I communicated status to stakeholders throughout, restored service, then ran a **blameless postmortem** and drove the follow-up actions (monitoring/alerting/guardrails) to closure.
- **Result:** Restored within [insert: time], prevented recurrence via [insert: specific fixes], and [insert: improved MTTR / added the failure mode to the RCA system].

**Scope framing:** *"I focus on the systemic fix and the prevention loop, not just the immediate firefight."*

**Likely follow-ups:** What was the actual root cause? · What did the postmortem change? · How do you balance speed of mitigation vs understanding the cause?

---

## 8. Stakeholder Conflict

**Tags:** Have Backbone; Disagree and Commit · Earn Trust · Are Right, A Lot · (Googleyness: collaboration, ego-less, doing the right thing)

- **Situation:** [insert: a real disagreement — e.g., a senior stakeholder favored a faster/expedient approach (or a different tech choice) than what I believed was right for reliability/security/long-term cost].
- **Task:** Advocate for the right technical decision while preserving the relationship and momentum.
- **Action:** I made my case with data and a clear articulation of the tradeoffs and risks, listened to their constraints, and proposed [insert: the path / compromise]. Where we still differed, I disagreed openly but committed to the agreed decision and made it succeed.
- **Result:** [insert: outcome — e.g., we adopted the more durable approach, or we proceeded their way and I de-risked it; relationship strengthened by the candor].

**Scope framing:** *"I can hold a strong technical position with senior stakeholders without it becoming personal — backbone plus trust."*

**Likely follow-ups:** What if you'd been overruled and been right? · How did you keep it from damaging the relationship? · Tell me about a time you were the one who was wrong.

---

## 9. Mentoring Engineers

**Tags:** Hire and Develop the Best · Earn Trust · (Googleyness: lifting others, team-first)

- **Situation:** I was assigned a [insert: newly-formed five-person] team across London and India, with a heavy migration plus net-new platform mandate.
- **Task:** Grow the team's capability while delivering, and develop individuals.
- **Action:** I split ownership deliberately — some engineers owned functional migration areas, others net-new platform capabilities — so each had stretch and clarity. I mentored through architecture/design reviews and the config-driven framework that made the work a functional-knowledge problem they could own. Beyond work, I mentor more widely (e.g., supporting a family member's cybersecurity channel, advising on a family business).
- **Result:** [insert: team outcome — e.g., delivered the migration + platform on time; individuals grew into owning X]. The framework let a single engineer own what previously needed bespoke effort per pipeline.

**Scope framing:** *"My measure of success is the team's capability and ownership, not my own output — that's the shift from senior IC to Principal/lead."*

**Likely follow-ups:** Tell me about a struggling engineer you helped. · How do you give difficult feedback? · How do you decide who owns what?

---

## Story-to-question quick map

| If asked about… | Use story |
|-----------------|-----------|
| Driving ambiguity / big technical project | 2, 5 |
| Influence without authority / cross-team | 1, 5 |
| Disagreement / backbone | 8 |
| Failure / learning | 7 |
| Simplifying complexity | 3, 5 |
| Cost / frugality / judgment | 6 |
| Developing people | 9 |
| Curiosity / staying current / thought leadership | 4 |
| Delivering under pressure | 7, 1 |

## Polish checklist (per story)
- [ ] Under 2 minutes spoken
- [ ] Real, defensible numbers in every `[insert: ...]`
- [ ] Scope-framing line rehearsed
- [ ] 3 follow-ups answerable without scrambling
- [ ] Tagged to the LPs/Googleyness it serves
