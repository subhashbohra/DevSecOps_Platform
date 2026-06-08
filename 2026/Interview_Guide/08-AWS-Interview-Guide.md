# 08 — AWS Interview Guide (Principal Solutions Architect)

> AWS is **Leadership-Principles-driven to an extreme** — every round is also an LP evaluation, scored by a **Bar Raiser**. A Principal SA is a customer-facing technical authority and thought leader; your **AWS Community Builder** status and public profile are direct, relevant signals. The coding bar is lower than Google's, but architecture depth + LP stories are everything.

> ⚠️ Comp figures are indicative for India; verify on levels.fyi and with your recruiter.

---

## Hiring process

1. **Recruiter screen** — background, LP primer, level (Principal = L7).
2. **Hiring manager screen** — role fit + a couple of LP/behavioral probes.
3. **Onsite "loop"** — typically **5–6 rounds**, each mapped to **2–3 Leadership Principles**:
   - **Solution / architecture design** (customer scenario → design on AWS)
   - **Technical depth / past project** deep dive
   - **Behavioral / LP** rounds (multiple)
   - Possibly a **coding / technical** round (lighter than big-tech SWE, but real)
   - **Bar Raiser** round — an objective interviewer from outside the team who can veto.
4. **Debrief** — each interviewer writes detailed LP-anchored feedback; Bar Raiser drives consistency.
5. **Offer.**

> **The Bar Raiser** ensures you'd raise the average bar of the org. Treat every answer as evidence against the LPs.

---

## Amazon Leadership Principles (know all — see `14`)

Customer Obsession · Ownership · Invent and Simplify · Are Right, A Lot · Learn and Be Curious · Hire and Develop the Best · Insist on the Highest Standards · Think Big · Bias for Action · Frugality · Earn Trust · Dive Deep · Have Backbone; Disagree and Commit · Deliver Results · Strive to be Earth's Best Employer · Success and Scale Bring Broad Responsibility.

> **STAR + LP mapping is non-negotiable.** Every story in `12` must be tagged to 1–2 LPs. Interviewers literally ask "tell me about a time you [LP]."

---

## Coding expectations

- Lighter than Google: data structures, a medium problem, or applied scripting. Still: clarify, communicate, test (`02`).
- Don't under-prepare it just because it's "lighter" — a bad coding round still sinks you.

---

## System / solution design expectations

- **Customer-scenario architecture:** given a business problem, design on AWS — pick services, justify tradeoffs (cost, availability, security, operational excellence — the **Well-Architected** pillars).
- Principal SA must be **broad and deep across AWS** and able to articulate *why* this service over that. See `10-AWS-System-Design.md`.
- Frame designs through the **Well-Architected Framework**: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, Sustainability.

---

## Behavioral / LP expectations

- Multiple full rounds. Depth probing ("Dive Deep" — they'll drill 5 layers into your example).
- "Have Backbone; Disagree and Commit" and "Earn Trust" stories are frequently tested for senior levels.
- Quantify outcomes (Deliver Results) and show customer impact (Customer Obsession).

---

## Questions interviewers commonly ask

- "Tell me about a time you disagreed with a decision and what you did." (Backbone)
- "Describe the most complex technical problem you solved — go deep." (Dive Deep)
- "Tell me about a time you simplified something complex." (Invent and Simplify — your config-driven migration framework)
- "Design a solution for [customer scenario] on AWS." (Solution design)
- "Tell me about a time you made a decision others disagreed with that turned out right." (Are Right, A Lot)

## Questions you should ask

- "What does a Principal SA own that a Senior SA doesn't here?"
- "How does this role influence product/service roadmaps via customer feedback?"
- "What does technical thought leadership look like — conferences, content, internal docs?" (plays to your Community Builder strength)
- "How is success measured for a Principal SA in the first year?"

---

## Compensation (indicative, India, verify live)

- **Principal SA (L7):** total comp roughly **₹1.2 Cr – ₹2 Cr+**. Amazon's structure: relatively modest base (there's a regional base cap), large **RSU** grant front-loaded with a back-loaded vesting curve, plus **sign-on bonuses** (Year 1 & 2) to smooth early comp. Understand this shape before negotiating (`15`).

---

## Preparation roadmap (6–8 weeks)

- **Weeks 1–2:** Write 12–16 LP stories (2 per major LP) in STAR; tag each (`12`, `14`).
- **Weeks 2–5:** AWS solution-design reps via Well-Architected; `10-AWS-System-Design.md`. Refresh service breadth.
- **Weeks 3–6:** Light coding maintenance (`02` MUST subset).
- **Weeks 5–8:** Behavioral mocks with deep-dive follow-ups; rehearse the "Dive Deep" drill.
- **Leverage:** your Community Builder profile + public content *is* thought leadership — surface it.

---

## Common rejection reasons

| Reason | Fix |
|--------|-----|
| Weak/generic LP stories | 12–16 quantified, LP-tagged STARs |
| Can't go deep (Dive Deep fails) | Pick stories you can drill 5 layers into |
| Narrow AWS knowledge | Broaden service coverage + Well-Architected |
| No customer-impact framing | Reframe stories around customer/business outcomes |
| Bar Raiser unconvinced on level | Lead with Principal-scope evidence + thought leadership |

---

## Notes & debrief log

```
Round: ______  LPs tested: ______
Story used: ______  Deep-dive held up? ______
Improve: ______
```
