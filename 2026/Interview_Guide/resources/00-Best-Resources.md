# Best Resources — DSA, System Design & Behavioral

> Curated, opinionated resource list for a senior/principal candidate. You already have Udemy courses — use those for *structured learning*, and use the picks below for **interview-specific** practice and depth. Don't collect resources; pick one per category and finish it.

> ⚠️ Availability, pricing, and exact course names change over time — verify the current version/link before buying.

---

## How to use resources at YOUR level

You don't need a from-zero CS course. You need: (1) **pattern fluency** for coding, (2) **tradeoff vocabulary + reps** for system design, (3) **structured stories** for behavioral. Map each resource to one of those three jobs.

- [ ] I picked ONE primary DSA resource and ONE primary system-design resource — and I'm finishing them, not sampling ten.

---

## DSA — coding interview

**Primary picks (do one, deeply):**

- **NeetCode (neetcode.io) — the "NeetCode 150" / "Blind 75."** The single best free roadmap of must-know patterns with clean video explanations. *This maps almost 1:1 to the MUST-60 in `02-DSA-Roadmap.md`.* Start here.
- **Grokking the Coding Interview (Educative)** — pattern-first, exactly the mental model in `02`. Excellent if you prefer reading + structured patterns over videos. (Paid/subscription.)
- **LeetCode (leetcode.com)** — the actual practice platform. Use **Top Interview 150** and company-tagged lists. LeetCode Premium unlocks company-specific frequency + sorted questions (worth it for the 2–3 months around your loops).

**Supplementary:**
- **AlgoMonster** — pattern-recognition decision-tree approach; good for "which pattern is this?" speed.
- **Cracking the Coding Interview (book, McDowell)** — classic; good for fundamentals refresh, slightly dated for FAANG-current.
- **Your Udemy DSA course** — use for the *teaching* of each data structure; then drill on LeetCode/NeetCode for interview reps.

**Recommendation for you:** NeetCode 150 (free) as the spine + LeetCode Premium for company lists in the run-up to loops. Use Udemy for any topic where you want a slower teach.

---

## System Design

**Primary picks:**

- **"Designing Data-Intensive Applications" by Martin Kleppmann (DDIA)** — *the* book for principal-level depth: replication, partitioning, consistency, consensus, batch/stream. If you read one thing, read this. It gives you the *vocabulary* interviewers score.
- **"System Design Interview – An Insider's Guide" Vol 1 & 2 by Alex Xu (ByteByteGo)** — interview-shaped walkthroughs of common designs. Vol 2 covers more advanced systems. Pairs perfectly with `03-System-Design.md`.
- **Grokking the System Design Interview / Grokking the Modern System Design Interview (Educative)** — structured design walkthroughs; good for breadth and a repeatable framework.

**Video / free:**
- **ByteByteGo (YouTube + newsletter)** — Alex Xu's channel; excellent visual explanations of real systems.
- **Gaurav Sen (YouTube)** — solid system-design fundamentals, India-friendly pacing.
- **System Design Primer (GitHub: donnemartin/system-design-primer)** — free, comprehensive reference + flashcards. Great for the estimation numbers and the "anatomy of a design."
- **Hello Interview (hellointerview.com)** — strong, recent interview-focused system-design content and a clear delivery framework (especially good for the "how to run the 45 minutes" mechanics).

**Principal-specific depth (your differentiator):**
- **"Database Internals" by Alex Petrov** — for storage/Pure-Storage depth (B-trees, LSM, replication).
- **Google SRE Book + SRE Workbook (free online: sre.google/books)** — reliability, SLOs, error budgets; exactly the operability language Google/Staff interviews reward.
- Read engineering blogs in your domain: **Netflix, Uber, Dropbox, Cloudflare, Discord** tech blogs; **AWS Well-Architected** docs for the AWS loop; **GCP architecture center** for the Google loop.

**Recommendation for you:** DDIA (depth) + Alex Xu Vol 1&2 (interview shape) + Hello Interview (delivery mechanics) + `03-System-Design.md` for reps. You already *operate* most of these systems — your job is to package that into the interview framework, not learn the systems from scratch.

---

## Behavioral / Leadership (Staff/Principal-critical)

- **"Staff Engineer: Leadership Beyond the Management Track" by Will Larson** — defines what Staff/Principal *is*; reframes your stories at the right altitude. High-leverage for your level calibration.
- **"The Software Engineer's Guidebook" by Gergely Orosz** + his **Pragmatic Engineer** newsletter — senior+ career and interview reality.
- **Amazon Leadership Principles** (official) — memorize for the AWS loop (`14-Leadership-Principles.md`).
- **`12-STAR-Stories.md` + `13-Googleyness.md`** in this repo — your actual story bank.
- **Mocks:** Pramp (free peer), interviewing.io (paid, real FAANG interviewers, anonymous), or a senior peer. Logged in `17-Mock-Interview-Tracker.md`. **At your level, system-design + behavioral mocks matter more than coding mocks.**

---

## Comp & negotiation

- **levels.fyi** — the source of truth for level + comp by company/location. Verify every number against this.
- **Glassdoor / Blind** — directional, noisier; use for sentiment and recent data points.
- **`15-Salary-Negotiation.md`** — per-company strategy and offer comparison.

---

## A realistic 90-day resource plan

| Phase | DSA | System Design | Behavioral |
|-------|-----|---------------|------------|
| Days 1–30 | NeetCode 150 (MUST-60) | DDIA ch. 1–6 + `03` designs 1–4 | Write all 9 STARs (`12`) |
| Days 31–60 | LeetCode company lists | Alex Xu Vol 1 + `03` designs 5–8 | LP/Googleyness mapping (`13`,`14`) |
| Days 61–90 | Re-solve + STRETCH | Alex Xu Vol 2 + Hello Interview + designs 9–11 | Mocks (interviewing.io) |

---

## Resource discipline checklist

- [ ] One primary DSA resource chosen and being finished
- [ ] DDIA started (the single highest-leverage read)
- [ ] One primary system-design interview resource chosen
- [ ] LeetCode Premium considered for the loop run-up
- [ ] Mock platform/partner lined up by Week 4
- [ ] levels.fyi bookmarked for every target company
