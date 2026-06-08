# 03 — System Design (Staff / Principal Handbook)

> At Staff/Principal, system design is the round that decides your level. They're not checking whether you know what a load balancer is — they're checking whether you can drive an ambiguous design, make and defend tradeoffs, and reason about failure, scale, and cost like someone who has run things in production. You have. Make it show.

---

## Part A — Fundamentals

### The 6-step interview flow

```
1. REQUIREMENTS   — functional + non-functional; clarify scope; pick what to build
2. ESTIMATION     — scale numbers: QPS, storage, bandwidth (order of magnitude)
3. API / DATA     — core APIs + data model
4. HIGH-LEVEL     — boxes & arrows; the happy path end-to-end
5. DEEP DIVE      — the interviewer picks (or you steer to) 1–2 components; go deep
6. TRADEOFFS      — bottlenecks, failure modes, scaling, cost, what you'd do next
```

**Principal-level differentiator:** you *drive* step 1 (you decide what's worth building given the constraints), and in step 6 you discuss *organizational* consequences — operability, on-call burden, migration path, cost-to-serve — not just throughput.

### 1. Requirements gathering

- Separate **functional** (what it does) from **non-functional** (how well: latency, availability, consistency, durability, scale).
- Ask: read/write ratio? consistency needs? latency SLO? availability target (how many nines)? data retention? multi-region? compliance?
- **Scope down explicitly:** "I'll focus on X and Y; I'll treat Z as out of scope unless you want it." This is leadership signal.

### 2. Capacity estimation (the numbers to keep in your head)

- 1 day ≈ **86,400 s** (≈ 10^5). So *X per day* ÷ 10^5 ≈ *X QPS*.
- Peak ≈ **2–10×** average. State your multiplier.
- A char ≈ 1 byte; a typical row/record often **0.5–2 KB**.
- One commodity server: ~**1k–10k QPS** for simple work; a single SSD: ~**hundreds of MB/s**, tens of k IOPS.
- Memory rule: keep the **hot set** (often ~20% driving 80% of traffic) in cache.

> Worked example: 100M daily active users, each 10 reads/day → 1B reads/day → 1B / 10^5 ≈ **10k QPS** average, **~50k QPS** peak (5×). Plan around peak.

### 3. APIs

- Prefer **idempotent** writes (use client-supplied request IDs) so retries are safe.
- Paginate reads (cursor > offset at scale). Version your APIs.
- Choose REST vs gRPC vs async/event: gRPC for internal high-throughput, events for decoupling and spikes.

### 4. Databases

- **SQL (Postgres/MySQL):** strong consistency, transactions, joins, secondary indexes. Default unless you have a reason not to.
- **NoSQL KV/wide-column (DynamoDB/Cassandra/Bigtable):** massive write scale, predictable latency, horizontal partitioning; you give up joins and ad-hoc queries; design around access patterns.
- **Document (MongoDB):** flexible schema, good for aggregates owned together.
- **Sharding:** by hash (even spread, no range scans) vs range (range scans, hotspot risk). Pick a key that spreads load and matches access patterns.
- **Replication:** leader-follower (read scaling, eventual on followers) vs multi-leader/leaderless (write availability, conflict resolution).

### 5. Caching

- **Where:** client, CDN (static/edge), application (Redis/Memcached), DB buffer pool.
- **Patterns:** cache-aside (most common), read-through, write-through, write-back.
- **Invalidation:** TTL + explicit invalidation on write. "There are only two hard things…" — name the consistency tradeoff out loud.
- **Hazards:** thundering herd (use request coalescing / locks), hot keys (replicate/shard the key), stale reads.

### 6. Scaling

- **Vertical** (bigger box) first for simplicity; **horizontal** (more boxes) for real scale — requires statelessness + a partitioning strategy.
- **Stateless services** behind a load balancer scale trivially; push state to data stores/caches.
- **Async + queues** (Kafka/SQS) to absorb spikes, decouple producers/consumers, and smooth load.
- **Backpressure, rate limiting, circuit breakers, bulkheads** — name these; they're what separate an architect from a diagram-drawer.

### 7. Tradeoffs (the language of Principal interviews)

- **CAP / PACELC:** under partition, choose consistency or availability; even without partition, latency vs consistency.
- **Consistency spectrum:** strong → causal → read-your-writes → eventual. Pick the *weakest* that satisfies the requirement.
- **Latency vs throughput vs cost vs operability** — you almost never optimize all four; state which you're trading and why.
- **Build vs buy:** a Principal explicitly considers managed services and the total cost of ownership, not just the elegant DIY design.

---

## Part B — The 11 Designs

> For each: **Requirements → Architecture → Bottlenecks → Tradeoffs → Interview discussion points.** Practice each *out loud* on a whiteboard. Tick when you can lead it cold.

---

### Design 1 — URL Shortener  `[ ]`

**Requirements.** Functional: shorten a long URL → short code; redirect short code → long URL; optional custom alias; optional expiry; click analytics. Non-functional: very read-heavy (~100:1), low-latency redirects (<50 ms), high availability, short codes globally unique.

**Estimation.** Say 100M new URLs/month → ~40 writes/s; reads at 100× → ~4k reads/s (peak ~20k). 100M/mo × 5 yr × ~500 B ≈ low TBs — small; the *read path* is the design.

**Architecture.**
- **Code generation:** base62 of a unique 64-bit ID. Get IDs from a distributed counter / range-allocated blocks (e.g., a ticket server handing out ranges) or hash-then-collision-check. Avoid sequential codes if guessability matters.
- **Store:** KV (`code → longURL`, metadata) in DynamoDB/Bigtable — perfect access pattern.
- **Redirect path:** edge cache / CDN + Redis in front of the KV store; redirect = single cache hit → 301/302.
- **Analytics:** fire-and-forget event to a queue → async aggregation; never block the redirect.

**Bottlenecks.** Read hot keys (viral links) → cache + replicate the key. ID generation contention → range allocation. Cache misses cascading to DB → request coalescing.

**Tradeoffs.** 301 (permanent, cacheable, loses per-click analytics) vs 302 (every click hits you — analytics, but more load). Hash-based codes (stateless but collisions) vs counter-based (no collisions but needs a coordinated counter). Strong vs eventual consistency on creation (eventual is fine; a 1-second delay before a new link works is acceptable).

**Discussion points.** Custom alias collision handling; abuse/malware scanning; rate limiting per user; expiry & GC; multi-region active-active with conflict-free code ranges per region.

---

### Design 2 — Notification Service  `[ ]`

**Requirements.** Functional: send notifications across channels (push, email, SMS, in-app); templating; user preferences/opt-out; scheduling; dedup. Non-functional: high throughput, at-least-once delivery, channel failure isolation, respect rate limits of downstream providers (APNs, FCM, SES, Twilio).

**Estimation.** 50M users, avg 5 notifications/day → 250M/day ≈ 3k/s avg, 15k+/s peak (campaign bursts much higher → queue absorbs).

**Architecture.**
- **Ingress API** → validate → enqueue (Kafka topic per priority).
- **Preference & dedup service** filters opt-outs and duplicate sends (idempotency key = user+template+window).
- **Channel workers** (one consumer group per channel) call provider adapters; **per-provider rate limiters** and **circuit breakers**.
- **Template service** renders content; **scheduler** (delay queue / time-wheel) for future/throttled sends.
- **Delivery tracking** store + retry with exponential backoff + dead-letter queue.

**Bottlenecks.** Downstream provider limits/outages (isolate per channel; backpressure into the queue). Fan-out for broadcast campaigns (pre-segment + batch). Dedup state at scale (TTL'd KV).

**Tradeoffs.** At-least-once (retries → possible duplicates, mitigated by idempotency keys) vs exactly-once (expensive, usually not worth it). Push vs pull for in-app. Synchronous send vs queue-everything (queue wins for resilience at the cost of added latency).

**Discussion points.** Priority lanes (OTP must beat marketing); quiet hours/timezone; preference center as source of truth; observability (delivery rates per channel/provider); GDPR/consent.

---

### Design 3 — Distributed Logging Platform  `[ ]`

**Requirements.** Functional: ingest logs from thousands of services/hosts; index for search; retention tiers; alerting on patterns; dashboards. Non-functional: massive write throughput, bounded ingest latency, durable, cost-controlled (logs are huge), multi-tenant.

**Estimation.** 5,000 hosts × 1,000 lines/s × 300 B ≈ **1.5 GB/s** ≈ ~130 TB/day raw. Compression ~5–10×. The design problem is **cost and write throughput**, not cleverness.

**Architecture.**
- **Agents** (Fluent Bit/Vector) on hosts → batch, compress, ship.
- **Ingest tier** (stateless collectors) → **Kafka** as the durable buffer (decouples spikes, enables replay).
- **Processing** (stream consumers): parse, enrich, sample, route by tenant.
- **Storage tiers:** hot (last N days) in a search store (OpenSearch/Loki); warm/cold in object storage (S3) with index; query federation across tiers.
- **Query/alert layer** + dashboards; alerting via streaming rules on Kafka.

**Bottlenecks.** Index write amplification (full-text indexing is expensive — index selectively / use label-based indexing like Loki). Cardinality explosion in labels. Query fan-out over cold storage. Kafka partition hot-spotting per noisy tenant.

**Tradeoffs.** Full-text index (rich search, costly) vs label-index + grep on object store (cheap, slower search) — Loki vs Elasticsearch is exactly this tradeoff; name it. Sampling/aggregation (lose detail, save cost) vs keep-everything. Hot retention window vs storage cost.

**Discussion points.** Multi-tenancy isolation & quotas; backpressure when storage can't keep up (drop vs delay — and *which* logs to drop); PII scrubbing at ingest; exactly the tradeoffs behind your own observability work — tie it to experience.

---

### Design 4 — GitHub Actions–style CI/CD Platform  `[ ]`

**Requirements.** Functional: run workflows on events (push/PR/schedule); isolated ephemeral runners; matrix/parallel jobs; caching; secrets; artifacts; logs. Non-functional: secure multi-tenant isolation, elastic scale (bursty), fairness across tenants, fast queue→start time.

**Estimation.** 100k jobs/day → ~1.2/s avg but extremely bursty (post-merge storms); plan for 10–50× peaks via autoscaling runner pools.

**Architecture.**
- **Event ingress** (webhooks) → **workflow parser** (YAML → DAG of jobs with dependencies).
- **Scheduler/orchestrator** resolves the DAG, enqueues runnable jobs respecting concurrency limits & dependencies.
- **Runner pool:** ephemeral VMs/containers (one job = fresh sandbox) on autoscaling infra (K8s + Karpenter, or Firecracker microVMs for stronger isolation).
- **Cache service** (deps) + **artifact store** (object storage) + **secrets** (KMS-backed, injected at runtime, never logged).
- **Log streaming** (live tail via WebSocket; persisted to object store).

**Bottlenecks.** Cold-start of runners (warm pools / pre-pulled images). Noisy-neighbor & fairness (per-tenant concurrency quotas + scheduling weights). DAG scheduling at scale. Cache stampede on popular dependencies.

**Tradeoffs.** Container isolation (fast, weaker boundary) vs microVM (Firecracker — stronger isolation, slower start). Warm pools (fast start, idle cost) vs pure on-demand (cheap, slow). Centralized scheduler (simpler) vs sharded (scales, more complex).

**Discussion points.** Security model is the heart of this (untrusted code runs on your infra — sandboxing, egress control, secret leakage). Tie directly to your **GitHub migration** and **build-RCA agent** experience — you've operated this. Fairness/quotas; reproducibility; self-hosted vs hosted runners.

---

### Design 5 — Artifact Repository (Nexus/Artifactory-style)  `[ ]`

**Requirements.** Functional: store/serve build artifacts (Docker images, Maven/npm/PyPI packages); versioning & immutability; proxy/cache upstream registries; access control; retention/cleanup. Non-functional: high read throughput, durability, low-latency pulls (esp. for CI), dedup to save storage.

**Estimation.** Image layers are large (10s–100s MB); CI pulls dominate. Read-heavy; storage grows fast → dedup + retention are central.

**Architecture.**
- **Metadata DB** (artifact coordinates, versions, checksums, permissions) — SQL.
- **Blob store** (S3/GCS) for actual bytes; **content-addressable** storage (key = digest) → automatic dedup of identical layers.
- **Edge cache/CDN** + regional mirrors for pull latency.
- **Proxy/remote repos** cache upstream (Docker Hub, Maven Central) → resilience + speed.
- **GC service** for unreferenced blobs (mark-and-sweep against metadata) and retention policies.

**Bottlenecks.** Large blob transfer (chunked + resumable uploads; range reads). GC correctness under concurrent writes (reference counting / two-phase). Hot images on release day (CDN + replication).

**Tradeoffs.** Content-addressable dedup (storage savings, GC complexity) vs naive storage. Strong consistency on metadata (you must not serve a half-written artifact) vs eventual on cache. Immutability (reproducible builds) vs allowing overwrites (convenience, danger).

**Discussion points.** Supply-chain security (signing/SBOM/provenance — Sigstore/cosign); vulnerability scanning on push; multi-region replication; quota per team. Tie to your platform-engineering remit.

---

### Design 6 — Airflow / Workflow Orchestration Platform  `[ ]`

**Requirements.** Functional: define DAGs of tasks with dependencies; schedule (cron + event); retries/backfills; SLAs; observability; many teams/tenants. Non-functional: reliable scheduling (no missed/double runs), scalable to tens of thousands of tasks, isolation between DAGs.

**Estimation.** 10k DAGs, avg 20 tasks, varied schedules → tens of thousands of task instances/hour at peak. The scheduler is the contention point.

**Architecture.**
- **Metadata DB** (DAG defs, task state, runs) — the source of truth; *the* scaling bottleneck.
- **Scheduler** parses DAGs, computes runnable tasks (dependencies + schedule), enqueues to executor. Needs leader election / HA (active-active schedulers with row-level locking, as modern Airflow does).
- **Executor + workers** (Celery/Kubernetes executor) run tasks in isolated pods.
- **Web UI / API** for monitoring & triggering; **queue** between scheduler and workers.

**Bottlenecks.** Scheduler throughput (DAG parsing cost, DB contention on task-state updates). Worker resource isolation. Backfill storms. Metadata DB write hotspots.

**Tradeoffs.** Centralized scheduler (simple, bottleneck) vs sharded schedulers by DAG (scales, complex). Pull-based workers (Celery) vs pod-per-task (Kubernetes executor — clean isolation, pod-creation overhead). Push (event-driven) vs poll (cron) triggering.

**Discussion points.** Exactly-once task semantics & idempotency (tasks *will* retry). DAG-as-code vs config-driven (you built a **config-driven migration framework** — bring it in). Multi-tenancy & resource quotas; SLA misses & alerting; data lineage. This is your home turf — **Airflow + Iceberg/Trino lakehouse** — anchor answers in real operational scars.

---

### Design 7 — Internal Developer Platform (IDP)  `[ ]`

**Requirements.** Functional: self-service for developers — provision environments, deploy services, manage configs/secrets, golden paths/templates, observability built-in. Non-functional: reduce cognitive load, enforce standards/compliance by default, multi-team, safe-by-default.

**Architecture.**
- **Developer portal** (Backstage-style) — service catalog, software templates ("create a new service" scaffolds repo + pipeline + infra + dashboards).
- **Platform API / control plane** abstracts the underlying infra (K8s, cloud, CI). Developers declare intent; the platform reconciles.
- **GitOps** as the deployment substrate (Argo CD): desired state in Git, controllers reconcile.
- **Paved roads:** opinionated, pre-wired templates (security, observability, networking baked in).
- **Policy as code** (OPA/Kyverno) to enforce guardrails without blocking.

**Bottlenecks.** The platform team becoming a bottleneck (anti-pattern: every request a ticket). Abstraction leakage (when the golden path doesn't fit, escape hatches needed). Multi-cluster/multi-cloud config sprawl.

**Tradeoffs.** Abstraction vs flexibility (golden paths speed up the 80%, frustrate the 20% — provide escape hatches). Self-service autonomy vs centralized control/compliance. Build (Backstage + custom) vs buy (Humanitec, etc.).

**Discussion points.** **Platform as a product** — measure adoption, DX, lead time; treat developers as customers. This is *the* Principal Platform Engineer narrative and directly maps to your "productize the RCA platform so any team can adopt it / CAB-approved bank-wide" story. Team Topologies (platform team enabling stream-aligned teams). Cite Backstage + Argo CD + OPA explicitly.

---

### Design 8 — Multi-Tenant Kubernetes Platform  `[ ]`

**Requirements.** Functional: run many teams' workloads on shared clusters; isolation; quotas; networking; ingress; secrets; autoscaling; self-service namespaces. Non-functional: strong tenant isolation (esp. regulated env), high availability, cost efficiency via bin-packing, operability at fleet scale.

**Architecture.**
- **Cluster topology:** namespaces-per-tenant on shared clusters (cost-efficient) vs cluster-per-tenant (stronger isolation, costly) — often a hybrid: shared for non-sensitive, dedicated for sensitive/regulated.
- **Isolation:** RBAC, NetworkPolicies, ResourceQuotas/LimitRanges, PodSecurity standards, separate node pools (taints/affinity), possibly gVisor/Kata for hard isolation.
- **Networking:** CNI (Calico/Cilium), ingress controller, service mesh (Istio/Linkerd) for mTLS + traffic policy.
- **Platform services:** GitOps (Argo CD), policy (OPA Gatekeeper/Kyverno), secrets (External Secrets + Vault/KMS), autoscaling (HPA/VPA/Karpenter), observability stack.
- **Fleet management:** Cluster API / fleet controllers for managing many clusters consistently.

**Bottlenecks.** etcd scaling limits (object count, watch load) → shard via multiple clusters. Noisy neighbors (CPU/mem/network/IOPS — enforce quotas + limits). Control-plane scaling. Cross-tenant blast radius.

**Tradeoffs.** Shared (cheap, weaker isolation) vs dedicated (strong, expensive). Service mesh (mTLS, observability, policy — operational complexity & overhead) vs none. Manual node pools vs Karpenter autoscaling.

**Discussion points.** Your **GDC/GKE air-gapped, regulated-bank** experience is gold here — air-gapped image distribution, no public registries, compliance constraints, supply-chain control. Multi-region/DR; upgrade strategy across a fleet; cost allocation/showback per tenant.

---

### Design 9 — AI Gateway (LLM proxy/routing layer)  `[ ]`

**Requirements.** Functional: single entry point for app→LLM calls; route across providers/models; auth & per-team quotas; rate limiting; caching; prompt/response logging; cost tracking; guardrails (PII redaction, content filtering); fallback/retry. Non-functional: low added latency, high availability, observability, cost control.

**Estimation.** Token-based cost is the dominant axis — track tokens per team/model; LLM latency is seconds, so streaming matters.

**Architecture.**
- **Gateway service** (stateless) in front of providers (OpenAI/Anthropic/Bedrock/Vertex + self-hosted like your **Ollama/Gemma**).
- **Routing layer:** model selection by policy (cost/quality/latency), provider failover, A/B and canary of models.
- **Controls:** API-key/identity auth, per-team token & request quotas, rate limiting, **semantic cache** (embedding-keyed) for repeat queries.
- **Guardrails:** input PII redaction, prompt-injection filters, output moderation, schema validation.
- **Observability:** token/cost accounting, latency, error rates, prompt/response logging (with redaction) for audit.
- **Streaming** (SSE) passthrough to keep TTFT low.

**Bottlenecks.** Provider rate limits & outages (failover + queueing). Long-lived streaming connections (connection management). Semantic-cache hit-rate vs staleness. Logging volume (prompts/responses are large).

**Tradeoffs.** Self-hosted (data control, fixed cost, ops burden — your air-gapped reality) vs API providers (no ops, per-token cost, data leaves). Caching (cost/latency win, staleness/privacy risk). Strict guardrails (safety, added latency/false positives) vs permissive.

**Discussion points.** This is *directly* your **Ollama/Gemma RCA platform productized for any team** — frame the gateway as how you'd let every team consume the internal LLM safely. Regulated-bank constraints: data residency, audit, no egress. Cost governance is the executive-facing win.

---

### Design 10 — Enterprise Copilot (internal developer copilot / RAG assistant)  `[ ]`

**Requirements.** Functional: answer questions over internal knowledge (code, docs, runbooks, tickets); assist with PR review/code; cite sources; respect access control (a user only sees what they're allowed to). Non-functional: relevance/quality, freshness of the index, security (no data leakage across permission boundaries), acceptable latency.

**Architecture.**
- **Ingestion pipeline:** crawl sources (repos, wikis, tickets) → chunk → embed → store in a **vector DB** + metadata (incl. ACLs per chunk).
- **Retrieval:** query → embed → vector search (+ keyword/BM25 hybrid) → **permission filter** → rerank → top-k.
- **Generation:** RAG prompt to the LLM (via the **AI Gateway** above) with retrieved context; return answer + citations.
- **Feedback loop:** thumbs up/down → tune retrieval/reranking; eval harness for regression.
- **PR-review mode:** trigger on PR event → retrieve repo conventions + diff context → generate review comments via internal LLM.

**Bottlenecks.** Retrieval quality (chunking strategy, hybrid search, reranking — the real determinant of usefulness). Index freshness (incremental re-embedding on change). ACL enforcement at retrieval time (must filter *before* generation — never leak). Hallucination (mitigate with citations + grounding + "I don't know").

**Tradeoffs.** RAG (fresh, cheaper, grounded, citable) vs fine-tuning (bakes knowledge in, stale, costly). Chunk size (small = precise but fragmented; large = context but noisy). Latency vs retrieval depth (more candidates + rerank = better but slower).

**Discussion points.** Maps exactly to your **CAB-approved RCA platform extended into a PR-review developer copilot on the bank's internal LLM**. Security/ACL is the make-or-break in a regulated enterprise — lead with it. Evaluation (how do you *prove* it's good? — golden-set evals, human review). Build on the AI Gateway (Design 9) for governance.

---

### Design 11 — Observability Platform (metrics + traces + logs)  `[ ]`

**Requirements.** Functional: ingest metrics, traces, logs ("three pillars"); dashboards; alerting; SLO tracking; correlation across signals; multi-tenant. Non-functional: high-cardinality write throughput, fast queries on recent data, cost-controlled retention, reliability (must work when everything else is on fire).

**Estimation.** Metrics: millions of active time series; traces: sampled spans at high volume; logs (see Design 3). High cardinality is the recurring enemy.

**Architecture.**
- **Metrics:** Prometheus/OpenTelemetry collectors → remote-write to a scalable TSDB (Thanos/Mimir/Cortex) with object-storage backend + downsampling for long retention.
- **Traces:** OTel SDKs → collector → tail/head sampling → trace store (Tempo/Jaeger); trace-ID links logs↔traces↔metrics.
- **Logs:** as in Design 3 (Loki/OpenSearch).
- **Query/alert:** unified query layer; Alertmanager; SLO/error-budget engine.
- **Standardize on OpenTelemetry** for vendor-neutral instrumentation.

**Bottlenecks.** Metric cardinality explosion (label discipline, limits, drop rules — the #1 cost & stability issue). Long-retention storage cost (downsampling + object storage). Query fan-out across shards/tiers. Reliability of the platform itself (it must survive the outages it observes — run it isolated/HA).

**Tradeoffs.** Head sampling (cheap, may miss rare errors) vs tail sampling (keeps interesting traces, needs buffering). Metric resolution/retention vs cost. Pull (Prometheus scrape) vs push (remote-write/OTLP). Build (Prometheus + Thanos + Loki + Tempo) vs buy (Datadog — fast, expensive at scale).

**Discussion points.** Tie to your **AI RCA + anomaly detection** work — observability data is the *input* to RCA; discuss how anomaly detection consumes these signals and closes the loop to your platform. SLOs/error budgets as an org practice; on-call & alert fatigue (alert on symptoms/SLOs, not causes); cost governance.

---

## Part C — Cross-cutting interview discussion bank

Have crisp opinions ready on:

- [ ] **Consistency model choice** — when eventual is fine, when it isn't (money, auth, inventory).
- [ ] **Idempotency** — how you make writes safe under retries.
- [ ] **Backpressure & load shedding** — what to drop first under overload.
- [ ] **Failure modes** — what happens when component X dies; degrade gracefully.
- [ ] **Multi-region / DR** — RPO/RTO, active-active vs active-passive, data residency.
- [ ] **Security** — authn/authz, secrets, tenant isolation, supply chain, audit (you operate in a regulated bank — lean in).
- [ ] **Cost-to-serve** — the Principal lens executives care about.
- [ ] **Operability** — on-call burden, runbooks, the human cost of a design.

---

## Part D — Practice tracker

| Design | Practiced out loud | Can lead cold | Mock'd | Notes |
|--------|:------------------:|:-------------:|:------:|-------|
| URL Shortener | [ ] | [ ] | [ ] | |
| Notification Service | [ ] | [ ] | [ ] | |
| Distributed Logging | [ ] | [ ] | [ ] | |
| CI/CD Platform | [ ] | [ ] | [ ] | |
| Artifact Repository | [ ] | [ ] | [ ] | |
| Airflow Platform | [ ] | [ ] | [ ] | |
| Internal Dev Platform | [ ] | [ ] | [ ] | |
| Kubernetes Platform | [ ] | [ ] | [ ] | |
| AI Gateway | [ ] | [ ] | [ ] | |
| Enterprise Copilot | [ ] | [ ] | [ ] | |
| Observability Platform | [ ] | [ ] | [ ] | |

> **Your unfair advantage:** Designs 4–11 are *your day job*. Where most candidates recite blog posts, you can say "here's what actually broke when we ran this." Use that relentlessly — it's the clearest Principal/Staff signal you have.
