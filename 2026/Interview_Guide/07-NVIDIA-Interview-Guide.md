# 07 — NVIDIA Interview Guide (Senior / Principal)

> NVIDIA spans many orgs (driver/systems, cloud/infra, AI/ML platform, DGX/data center). For an infra/platform profile like yours, target **AI infrastructure / cloud / platform** teams where your Kubernetes + GPU-adjacent + AI-platform (Ollama/Gemma) experience is the strongest fit. Interviews mix solid CS fundamentals with domain depth.

> ⚠️ Comp figures are indicative for India; verify on levels.fyi and with your recruiter.

---

## Hiring process

1. **Recruiter screen** — background, team/role fit (NVIDIA is team-specific; the team matters a lot).
2. **Hiring manager screen** — technical + motivation + domain fit.
3. **Technical phone screen** — coding + fundamentals.
4. **Onsite loop** — typically **4–6 rounds**:
   - 2–3 **coding** (CS fundamentals; can be C/C++ or Python depending on team)
   - 1–2 **system design / domain architecture** (infra, distributed systems, ML/GPU platform)
   - 1 **deep domain** round (depends on team — could be K8s/cloud, performance, or ML infra)
   - 1 **behavioral / leadership**
5. **Debrief & decision; offer.**

> NVIDIA hiring is **team-driven** — the manager and team have heavy influence. A warm intro / referral to the right team is disproportionately valuable here (`16`).

---

## Coding expectations

- Strong fundamentals; expect DS&A with possible systems/performance flavor.
- Language depends on team (systems teams lean C/C++; platform/ML-infra teams accept Python/Go).
- Clean, correct, efficient; discuss complexity and, where relevant, performance/parallelism.

---

## System design / domain expectations

- For platform/infra roles: distributed systems, Kubernetes at scale, GPU scheduling, multi-tenant compute, data/ML pipelines.
- AI-infra angle: model serving, inference at scale, GPU utilization, batching, the kind of **AI gateway / LLM-serving** design in `03` (Design 9) — *strong fit with your Ollama/Gemma platform*.
- Show you understand the resource that matters at NVIDIA: **GPUs** — utilization, scheduling (e.g., K8s device plugins, MIG, time-slicing), and the economics of expensive accelerators.

---

## Behavioral / leadership expectations

- Senior/Principal: technical depth + leadership + ability to operate in a fast, ambiguous, deeply technical environment.
- Standard STAR (`12`); emphasize building platforms others depend on.

---

## Questions interviewers commonly ask

- "Design a system to serve ML models at scale with high GPU utilization."
- "How would you schedule GPU workloads across a multi-tenant cluster?"
- Coding: data structures, string/array/graph problems, sometimes performance-oriented.
- "Tell me about a complex infrastructure platform you built and operated."
- "How do you keep expensive resources highly utilized?"

## Questions you should ask

- "Which org/team is this role in, and what does it own?" (critical at NVIDIA)
- "How does this team interact with the hardware/driver side vs the cloud/platform side?"
- "What are the biggest scaling challenges for GPU infrastructure here?"
- "What does Principal-level impact look like on this team?"

---

## Compensation (indicative, India, verify live)

- **Senior:** total comp roughly **₹70L – ₹1.2 Cr**.
- **Principal:** total comp roughly **₹1.2 Cr – ₹2 Cr+**, equity meaningful (NVIDIA RSUs have historically appreciated significantly — equity is a big component; weigh it in `15`).

---

## Preparation roadmap (6–8 weeks)

- **Weeks 1–4:** MUST-60 coding; brush up systems/performance fundamentals.
- **Weeks 2–5:** AI-infra / GPU-platform / K8s-at-scale design reps; lean on your Ollama/Gemma + GKE/GDC experience.
- **Weeks 3–6:** Learn GPU-scheduling specifics (device plugins, MIG, time-slicing, inference batching) to a credible depth.
- **Weeks 5–8:** Mocks; target the right team via referral.

---

## Common rejection reasons

| Reason | Fix |
|--------|-----|
| Wrong team fit | Use referral to target the right org |
| No GPU/accelerator awareness | Learn GPU scheduling + serving economics |
| Fundamentals rusty | MUST-60 + systems brush-up |
| Generic infra answers | Anchor in AI-platform + GPU-aware specifics |

---

## Notes & debrief log

```
Team/org: ______
Domain depth tested: ______
GPU/AI-infra gap: ______
```
