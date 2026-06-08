# 01 — Career Strategy

> Before you solve a single LeetCode problem, get the strategy right. Most senior engineers fail interviews they were technically qualified for because they aimed at the wrong level, told the wrong story, or sequenced their applications badly.

---

## 1. Your positioning in one paragraph

You are a **platform engineering leader** who designs and ships production infrastructure at a regulated, global bank: a cloud-native data lakehouse (Iceberg/Trino/Nessie/Spark/Airflow on GKE/GDC), and an air-gapped AI RCA + anomaly-detection platform (Ollama/Gemma) that earned **Central Architecture Board approval for bank-wide adoption**. You lead a global team across London and India, you are a two-time **AWS Community Builder**, and you've won an **Engineering Excellence Award**. Your edge is *taking ambiguous, regulated, hard infra problems and turning them into reusable platforms other teams adopt.*

That paragraph is your spine. Every resume bullet, referral message, and interview answer should reinforce it.

---

## 2. Level calibration — the single most important decision

The biggest mistake is interviewing at the wrong level. Here is how the targets map.

| Target | Level | What they're really hiring for | Your fit signal |
|--------|-------|--------------------------------|-----------------|
| **Google L5** | Senior SWE/SRE | Strong IC, owns a system, mentors | Safe — likely under-leveled for you |
| **Google L6** | Staff | Owns a *problem space* across teams; org-level impact | Stretch-but-real — your CAB-approved bank-wide platform is the proof |
| **Atlassian Principal (P5/P6)** | Principal | Multi-team technical direction, "force multiplier" | Strong — platform reuse story fits perfectly |
| **Pure Storage Principal** | Principal | Deep systems + storage/infra expertise | Good — lean on Iceberg/lakehouse/storage internals |
| **NVIDIA Senior/Principal** | Senior→Principal | Systems + infra + increasingly AI infra | Good — Ollama/GPU-adjacent AI platform story |
| **AWS Principal SA** | Principal | Customer-facing architecture authority + thought leadership | Strong — Community Builder + public profile is *literally* the job's adjacent skill |
| **Deloitte Director/Sr Director** | Director | Delivery leadership, client trust, P&L-adjacent | Strong — your leadership + breadth is the fit; least coding-heavy |

**Decision rule:**
- If you want maximum probability of *an* offer in the band → AWS Principal SA + Deloitte Director are your highest-fit, lowest-coding-risk targets.
- If you want maximum *level + brand + comp ceiling* → Google L6 and Atlassian Principal, accepting heavier coding + system design prep.
- **Recommended sequence:** warm up on a lower-stakes target first; do not let your dream company be your first real loop in years.

> **Self-check:** Can you name three pieces of work where your impact crossed *team* boundaries? If yes, you're an L6/Principal candidate. If they're all within your own team, you're calibrated at L5/Senior and should target accordingly first.

- [ ] I have chosen a **primary** target: `__________`
- [ ] I have chosen a **backup** target: `__________`
- [ ] I have chosen a **warm-up** target (interview here first): `__________`

---

## 3. The IC vs management fork

You currently lead a team *and* do deep technical work. The targets split:

- **IC track (Google L6 Staff, Atlassian/Pure/NVIDIA Principal, AWS Principal SA):** You will be evaluated as a *technical* leader. Coding + system design still matter. Your management experience is a *bonus* for influence stories, not a substitute for technical depth.
- **Management/Director track (Deloitte):** People leadership, delivery, client outcomes. Far less coding. Different prep emphasis (see `12-STAR-Stories.md` and `14-Leadership-Principles.md`).

You can pursue both in parallel, but **prep differently**. Do not show up to a Google L6 loop expecting your team-leadership stories to carry a coding round.

- [ ] I know which track each of my targets is on.

---

## 4. The "scope narrative" — your 90-second pitch

At Staff/Principal, interviewers score *scope of influence*. Prepare a 90-second narrative you can deliver on demand. Structure:

1. **Context (10s):** Regulated global bank, platform/infra remit, global team.
2. **The hard problem (20s):** e.g., 50-pipeline Iceberg/Trino/Nessie migration; air-gapped AI RCA from scratch on GDC.
3. **The leverage move (30s):** You didn't just solve it — you turned it into a *config-driven framework* / *reusable platform* that other teams adopt. CAB approval. Award.
4. **The blast radius (20s):** Bank-wide adoption, productized for any team, organizational recognition.
5. **Why this role (10s):** You want to operate at this scope on a bigger surface area / better infra / open ecosystem.

- [ ] I can deliver this in 90 seconds without notes.
- [ ] I have a 30-second version for recruiter screens.

---

## 5. Resume positioning rules (for experienced engineers)

- **Lead every bullet with impact, not activity.** `Reduced X by Y%` / `Enabled N teams to Z`, then the how.
- **Quantify scope:** team size, number of pipelines, number of adopting teams, cost saved, latency cut, incidents reduced.
- **Show the multiplier.** Principal/Staff resumes read as "I made *other people and teams* more effective," not "I wrote a lot of code."
- **One page of recent + deep, not 20 years of everything.** Your QA/test-automation past (15+ years) is context, not the headline. Compress it ruthlessly; foreground the last ~5 years of platform/cloud/AI work.
- **Mirror the level's language.** L6/Principal JDs say "ambiguity," "cross-team," "technical strategy," "force multiplier." Use those words where they're true.

- [ ] My resume leads with impact and scope.
- [ ] My last 5 years take up 70%+ of the page.
- [ ] My QA past is compressed to 2–3 lines of credible context.

---

## 6. Common strategic mistakes (and the fix)

| Mistake | Why it kills you | Fix |
|---------|------------------|-----|
| Applying cold to all 6 companies at once | No referrals, weak signal, burns your "first impression" | Sequence; get referrals (`16-Referral-Strategy.md`) |
| Letting the dream company be your first loop | Rusty, nervous, you waste your best shot | Warm-up loop first |
| Prepping coding *or* system design, not both | Senior loops test both | Balance per `19-90-Day-Execution-Plan.md` |
| Telling 20-year war stories with no numbers | Reads as unfocused, un-Principal | STAR + quantify (`12-STAR-Stories.md`) |
| Under-leveling out of modesty | You leave ₹30–50L on the table | Calibrate honestly to L6/Principal where the evidence supports it |
| Negotiating only after the offer | You've lost leverage and information | Read `15-Salary-Negotiation.md` before the recruiter screen |

---

## 7. The compensation reality check

Your ₹1–1.5 Cr+ target is achievable but level-dependent:

- **Google L6 / Atlassian Principal / NVIDIA Principal:** comfortably in or above band (base + significant equity).
- **AWS Principal SA / Pure Principal:** in band, equity-heavy.
- **Google L5 / NVIDIA Senior:** *bottom* of the band or just under; this is why level calibration matters for comp.
- **Deloitte Director:** mostly cash + bonus, lower equity; can hit band on total cash but with a different shape.

Details and negotiation mechanics are in `15-Salary-Negotiation.md`. The point here: **your level decision is your comp decision.**

- [ ] My target band maps to at least 2 realistic targets at the right level.

---

## 8. 30 / 60 / 90 strategy checkpoints

- **Day 30:** Targets locked, story bank written, foundations rebuilt, first referrals out.
- **Day 60:** Interview-capable; mocks showing improvement; ≥2 referral pipelines live.
- **Day 90:** Interview-ready; loops scheduled/underway; negotiation rehearsed.

---

## Notes & decisions log

> Use this section to record strategic decisions and why you made them. Update weekly.

```
Date: __________
Decision: __________
Reasoning: __________

Date: __________
Decision: __________
Reasoning: __________
```
