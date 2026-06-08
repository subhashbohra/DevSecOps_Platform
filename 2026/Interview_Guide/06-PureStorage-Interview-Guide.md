# 06 — Pure Storage Interview Guide (Principal)

> Pure Storage is a **systems-engineering–heavy** shop. Expect strong CS fundamentals, low-level reasoning (memory, concurrency, data structures, OS/storage internals), and deep technical depth over breadth. Your **lakehouse / Iceberg / storage-format** experience is a strong angle.

> ⚠️ Comp figures are indicative for India; verify on levels.fyi and with your recruiter.

---

## Hiring process

1. **Recruiter screen** — background, level, role fit.
2. **Technical phone screen** — coding + fundamentals; sometimes systems/OS questions.
3. **Onsite loop** — typically **4–6 rounds**:
   - 2–3 **coding** (often language-agnostic / C++-friendly; data structures from scratch)
   - 1–2 **system design / systems architecture** (storage, distributed systems flavor)
   - 1 **deep technical / domain** round (OS, concurrency, storage internals, networking)
   - 1 **behavioral / leadership**
4. **Debrief & decision.**
5. **Team match + offer.**

---

## Coding expectations

- Solid DS&A, but expect a **lower-level / systems** flavor: implement a data structure, reason about memory layout, concurrency, pointers, performance.
- Cleanliness + correctness + efficiency. Discuss cache behavior, allocation, and complexity precisely.
- If you're rusty on C/C++, either brush it up or be explicit that you'll solve in your strongest language while demonstrating systems reasoning.

---

## System design / systems expectations

- Distributed systems and **storage** topics: replication, consistency, durability, data layout, compaction, write amplification, fault tolerance, RAID/erasure coding concepts.
- They love depth: pick a component and go *deep* on the mechanics.
- **Your edge:** Iceberg table format (metadata, snapshots, compaction), Trino query execution, columnar storage, partitioning — these are storage-systems topics. Bring them in.

---

## Deep technical / domain round

Be ready to discuss:
- Concurrency (locks, lock-free, memory models), processes/threads, scheduling.
- Memory hierarchy, caching, page cache, mmap.
- Filesystems, block vs object storage, durability/consistency of writes (fsync, journaling).
- Networking basics (TCP, latency, throughput).

---

## Behavioral / leadership expectations

- Principal: technical leadership, mentoring, driving hard technical decisions, cross-team influence.
- Standard STAR (`12`); they value engineers who raise the technical bar.

---

## Questions interviewers commonly ask

- "Implement an LRU cache / a thread-safe queue / a B-tree — and discuss tradeoffs."
- "How would you design a durable, highly available storage system? Discuss consistency and replication."
- "Explain write amplification and how you'd minimize it."
- "Tell me about the deepest technical problem you've personally debugged."
- "Describe how you've influenced a major technical decision."

## Questions you should ask

- "What does the Principal role own technically — which systems/domains?"
- "How does the team balance research-grade systems work with product delivery?"
- "What are the hardest open technical problems on this team right now?"
- "How is technical depth vs breadth valued for Principal here?"

---

## Compensation (indicative, India, verify live)

- **Principal Engineer:** total comp roughly **₹1.1 Cr – ₹1.7 Cr+**, equity-heavy (RSUs).
- Negotiate level + equity refreshers (`15`).

---

## Preparation roadmap (6–8 weeks)

- **Weeks 1–4:** MUST-60 + implement core data structures *from scratch* (LRU, heap, trie, B-tree, lock-free queue). Re-warm systems fundamentals.
- **Weeks 2–5:** Distributed systems + storage internals reading + design reps (replication, consistency, durability). Tie to Iceberg/Trino.
- **Weeks 4–8:** Mocks (coding + systems design); rehearse the deep-technical round.

---

## Common rejection reasons

| Reason | Fix |
|--------|-----|
| Weak systems/CS fundamentals | Drill OS/concurrency/storage internals |
| Surface-level design (no depth) | Pick one component, go 3+ layers deep |
| Couldn't implement DS from scratch | Practice from-scratch implementations |
| Breadth without depth | Lead with deep storage/format expertise (Iceberg) |

---

## Notes & debrief log

```
Topic tested: ______
Depth reached: ______
Gap to close: ______
```
