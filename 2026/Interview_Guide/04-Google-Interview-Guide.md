# 04 — Google Interview Guide (L5 / L6)

> Google hires for *generalizable problem-solving*, not for what you already know. The bar is high on coding even at senior levels, and L6 adds a real "scope of impact" gate. Calibrate honestly (see `01-Career-Strategy.md`).

> ⚠️ **Comp note:** All compensation figures below are *indicative ranges for India* and move constantly. Always verify live on levels.fyi and your recruiter's numbers before negotiating (`15-Salary-Negotiation.md`).

---

## Hiring process

1. **Recruiter screen** — background, level calibration, role fit, logistics.
2. **Technical phone screen** — 1 coding round (45 min), shared doc, no autocomplete.
3. **Onsite loop ("the loop")** — typically **4–5 rounds**:
   - 2–3 **coding** (DS&A)
   - 1 **system design** (mandatory and heavily weighted at L5+)
   - 1 **behavioral / "Googleyness & Leadership"**
   - (For SRE/infra roles, expect a Linux/systems/networking round in place of one coding.)
4. **Hiring Committee (HC)** — independent committee reviews packets; *interviewers recommend, HC decides*. This is why consistent written feedback matters.
5. **Team match** — you match with a team (can happen before or after HC depending on path).
6. **Offer & comp committee** — level + comp finalized.

> **Key mental model:** Your interviewers don't hire you — they write evidence. The HC and committees decide. So give every interviewer *quotable, specific* evidence of your ability and level.

---

## Typical rounds & what they score

| Round | What they probe | Your prep file |
|-------|-----------------|----------------|
| Coding ×2–3 | Problem-solving, clean code, communication, DS&A | `02-DSA-Roadmap.md` |
| System Design ×1 | Scope, tradeoffs, scale, depth (L6: cross-system) | `03`, `11-GCP-System-Design.md` |
| Behavioral / GCA | Leadership, ambiguity, collaboration, "Googleyness" | `12-STAR-Stories.md`, `13-Googleyness.md` |

---

## Coding expectations

- ~2 mediums or 1 hard per 45-min round. **Optimal + clean + tested** is the target.
- Plain editor (Google Docs / CoderPad). No IDE help. Re-warm your syntax.
- They score *how you think*: clarify → approach → complexity → code → test (the `02` framework).
- **L6 nuance:** same problems, but they look for design sense, edge-case discipline, and the maturity to discuss extension/productionization.

**Common rejection reason:** correct but silent, or buggy because untested, or jumped to code without clarifying.

---

## System design expectations

- L5: design a non-trivial system end-to-end; sensible tradeoffs; handle scale.
- L6: **drive** an ambiguous problem; reason across systems; discuss org-level impact, migration, operability. Show you've *run* things.
- Google-flavored: expect Spanner/Bigtable/Colossus/Borg-style primitives to come up — know the GCP analogues (`11-GCP-System-Design.md`).

---

## Behavioral / Googleyness & Leadership

- "GCA" (General Cognitive Ability) shows up in *how* you reason through behavioral and design too.
- They probe: navigating ambiguity, collaboration over ego, user focus, doing the right thing, learning from failure.
- See `13-Googleyness.md` for 50 questions + frameworks.

---

## Questions interviewers commonly ask

- "Tell me about a time you had to make a decision with incomplete information."
- "Describe a technically ambiguous project you drove end-to-end." *(Your lakehouse migration / air-gapped RCA platform.)*
- "Tell me about a disagreement with a senior stakeholder and how you resolved it."
- "What's a system you designed that had to scale — what broke and what did you do?"
- "Tell me about a time you influenced without authority across teams." *(CAB approval / bank-wide adoption.)*

## Questions you should ask them

- "What does an L6 own here that an L5 doesn't — concretely?" (forces level clarity)
- "How is technical strategy set across teams, and how does this role contribute?"
- "What's the on-call and operational load for this team?"
- "What does success look like in the first 6–12 months?"
- "How does the team work with SRE / platform / data infra?"

---

## Compensation (indicative, India, verify live)

- **L5 (Senior):** total comp roughly **₹70L – ₹1.1 Cr** (base + RSUs + bonus).
- **L6 (Staff):** total comp roughly **₹1.1 Cr – ₹1.8 Cr+**, equity-heavy and refresher-dependent.
- The **level decision is the comp decision** — pushing L5→L6 is the single biggest lever. Negotiate level, not just numbers.

---

## Preparation roadmap (8–10 weeks to a Google loop)

- **Weeks 1–4:** MUST-60 coding + 14-day pattern sprint (`02`). Re-warm one language to fluency.
- **Weeks 3–6:** System design reps incl. GCP-flavored designs; 2 system-design mocks.
- **Weeks 4–8:** GCA/Googleyness stories polished (`13`); 2 behavioral mocks.
- **Weeks 6–10:** GOOD-40 coding; full mock loops; tighten the L6 scope narrative.
- **Throughout:** referrals via `16-Referral-Strategy.md` (you have a Google Partner Engineer contact noted — Vikas Purohit; GCP Pro Data Engineer cert strengthens the L6 case).

---

## Common rejection reasons (and the fix)

| Reason | Fix |
|--------|-----|
| Rusty coding / bugs | Daily MUST-60 reps + always test |
| Silent solving | Narrate via the `02` framework |
| Under-leveled story (L6 expected, L5 delivered) | Sharpen cross-team impact narrative (`01`) |
| Weak system design depth | One design/weekend out loud; go 3 layers deep |
| Generic behavioral answers | Quantified STAR (`12`) |
| No referral / cold packet | Get a referral *before* applying |

---

## Notes & debrief log

```
Round: ______  Date: ______  Interviewer focus: ______
What went well: ______
What I fumbled: ______
Follow-up to fix: ______
```
