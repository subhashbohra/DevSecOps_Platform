# 09 — Kubernetes / DevOps / Platform Engineering (100+ Q&A)

> Rapid-fire interview Q&A across Kubernetes, Helm, GitOps/ArgoCD, networking, security, observability, CI/CD, GitHub Actions, and platform engineering. Answers are interview-length: enough to demonstrate depth, short enough to say out loud. Drill until you can answer cold.

**How to use:** cover the answer, say yours aloud, then compare. Tick when fluent. Where it says *"(your experience)"*, anchor the answer in your real work.

---

## A. Kubernetes Core (1–25)

**1. What problem does Kubernetes solve?** `[ ]`
Declarative orchestration of containers across a cluster: scheduling, self-healing, scaling, service discovery, rollouts. You declare desired state; controllers continuously reconcile actual → desired.

**2. Explain the control plane components.** `[ ]`
**kube-apiserver** (the front door, all state goes through it), **etcd** (consistent KV store = cluster state), **scheduler** (assigns pods to nodes), **controller-manager** (runs reconciliation loops), **cloud-controller-manager** (cloud integrations).

**3. Node components?** `[ ]`
**kubelet** (runs pods, reports status), **kube-proxy** (service networking/iptables/IPVS), **container runtime** (containerd/CRI-O).

**4. What is etcd and why does it matter?** `[ ]`
The distributed, strongly-consistent (Raft) KV store holding *all* cluster state. It's the source of truth and a scaling/availability bottleneck — back it up, run odd-numbered HA members, watch object count.

**5. Pod vs Deployment vs ReplicaSet?** `[ ]`
Pod = smallest deployable unit (one or more co-located containers). ReplicaSet maintains N pod replicas. Deployment manages ReplicaSets to enable declarative rollouts/rollbacks.

**6. What is a StatefulSet and when do you use it?** `[ ]`
For stateful workloads needing stable network identity + stable storage + ordered deployment (databases, Kafka, ZooKeeper). Pods get stable names (pod-0, pod-1) and their own PVCs.

**7. DaemonSet?** `[ ]`
Runs one pod per node (or per matching node) — log/metrics agents, CNI, node exporters.

**8. Job vs CronJob?** `[ ]`
Job runs a pod to completion (batch). CronJob schedules Jobs on a cron expression.

**9. How does the scheduler place pods?** `[ ]`
Filtering (feasible nodes: resources, taints, affinity, nodeSelector) then scoring (best fit). Influenced by requests/limits, affinity/anti-affinity, taints/tolerations, topology spread.

**10. requests vs limits?** `[ ]`
Requests = guaranteed reserved resources (used for scheduling). Limits = hard cap (CPU throttled, memory OOM-killed). QoS class derives from these (Guaranteed/Burstable/BestEffort).

**11. What are taints and tolerations?** `[ ]`
Taints repel pods from nodes; tolerations let specific pods land there. Used to dedicate nodes (e.g., GPU nodes, system pods).

**12. Node affinity vs pod affinity/anti-affinity?** `[ ]`
Node affinity steers pods to nodes by labels. Pod affinity co-locates pods; anti-affinity spreads them (e.g., replicas across zones for HA).

**13. How do liveness, readiness, and startup probes differ?** `[ ]`
Liveness: restart if failing. Readiness: remove from Service endpoints if not ready (no restart). Startup: gate the other probes for slow-starting apps.

**14. How does a rolling update work? How do you roll back?** `[ ]`
Deployment creates a new ReplicaSet, scales it up while scaling the old down per `maxSurge`/`maxUnavailable`. Rollback: `kubectl rollout undo` reverts to the previous ReplicaSet.

**15. Blue-green vs canary in Kubernetes?** `[ ]`
Blue-green: run two full versions, switch traffic atomically. Canary: shift a small % of traffic to new version, increase gradually. Argo Rollouts / service mesh / ingress weighting implement these.

**16. What is a Service and its types?** `[ ]`
Stable virtual IP + DNS for a set of pods. **ClusterIP** (internal), **NodePort** (port on each node), **LoadBalancer** (cloud LB), **ExternalName** (DNS CNAME). Headless (clusterIP: None) for direct pod DNS.

**17. Ingress vs Service?** `[ ]`
Service = L4 in-cluster reachability. Ingress = L7 HTTP routing (host/path) via an ingress controller (NGINX, etc.). Gateway API is the newer, more expressive successor.

**18. ConfigMap vs Secret?** `[ ]`
Both inject config. Secrets are base64-encoded (not encrypted by default — enable encryption-at-rest for etcd) and intended for sensitive data; restrict RBAC and consider external secret managers.

**19. PV, PVC, StorageClass?** `[ ]`
PV = a piece of storage; PVC = a request/claim for storage; StorageClass = dynamic provisioning template. CSI drivers integrate external storage.

**20. What is the difference between HPA, VPA, and Cluster Autoscaler?** `[ ]`
HPA scales pod *replicas* on metrics. VPA adjusts pod *requests/limits*. Cluster Autoscaler adds/removes *nodes* (Karpenter is a faster, more flexible alternative on AWS).

**21. How does Kubernetes DNS work?** `[ ]`
CoreDNS resolves `service.namespace.svc.cluster.local`. Pods get DNS config pointing at the cluster DNS service.

**22. What is a namespace and when do you use multiple?** `[ ]`
Logical partition for scoping names, RBAC, quotas, network policy. Use per team/env for multi-tenancy isolation (`08`/Design 8).

**23. What's an Operator and the operator pattern?** `[ ]`
A custom controller + CRD encoding operational knowledge to manage a complex app declaratively (e.g., your Spark Operator, a `data-rca-operator`). It watches CRs and reconciles. *(your experience: you scoped a standalone `data-rca-operator`.)*

**24. What are CRDs?** `[ ]`
Custom Resource Definitions extend the K8s API with your own resource types, reconciled by custom controllers.

**25. How do you debug a CrashLoopBackOff?** `[ ]`
`kubectl describe pod` (events), `kubectl logs --previous`, check probes, resource limits (OOM?), image/entrypoint, config/secret mounts, dependencies not ready. Reproduce locally if needed.

---

## B. Helm & Packaging (26–34)

**26. What is Helm and why use it?** `[ ]`
A package manager for K8s. Charts template manifests with values, enabling reuse, versioning, and parameterization across environments.

**27. Chart vs Release vs Repository?** `[ ]`
Chart = the package (templates + default values). Release = an installed instance of a chart. Repository = where charts are hosted.

**28. How do you manage environment-specific config in Helm?** `[ ]`
Separate `values-<env>.yaml` files layered over chart defaults; `-f values-prod.yaml`. Keep secrets out of values (use external secrets / sealed secrets).

**29. Helm vs Kustomize?** `[ ]`
Helm = templating + packaging + lifecycle (releases, rollbacks). Kustomize = overlay/patch base manifests, no templating, built into kubectl. Many teams use Kustomize for env overlays and Helm for third-party packaging; they can combine.

**30. What are Helm hooks?** `[ ]`
Lifecycle hooks (pre-install, post-upgrade, etc.) to run Jobs at points in a release (migrations, backups).

**31. How do you roll back a Helm release?** `[ ]`
`helm rollback <release> <revision>` — Helm tracks revision history of releases.

**32. How do you test a Helm chart?** `[ ]`
`helm lint`, `helm template` (render + inspect), `helm test` (test hooks), and CI validation against a kind/minikube cluster.

**33. Risks of Helm at scale?** `[ ]`
Template complexity, hidden coupling in values, drift if changes are made out-of-band, secret handling. GitOps mitigates drift.

**34. What is an umbrella/parent chart?** `[ ]`
A chart that declares other charts as dependencies to deploy a whole app stack together.

---

## C. GitOps & ArgoCD (35–46)

**35. What is GitOps?** `[ ]`
Git is the single source of truth for declarative infra/app state; a controller continuously reconciles the cluster to match Git. Changes flow through PRs → auditable, revertable, reproducible.

**36. ArgoCD vs Flux?** `[ ]`
Both are GitOps controllers. ArgoCD has a rich UI, app-of-apps, and is application-centric. Flux is more modular/CLI-and-controller-centric. Pick based on UI needs and ecosystem.

**37. How does ArgoCD detect and handle drift?** `[ ]`
It compares live cluster state to the Git-desired state; shows OutOfSync; can auto-sync and self-heal (revert manual changes) or require manual sync.

**38. What is the app-of-apps pattern?** `[ ]`
A parent ArgoCD Application that points to a directory of child Application manifests — bootstraps and manages many apps declaratively.

**39. How do you do progressive delivery with GitOps?** `[ ]`
Argo Rollouts (canary/blue-green) + metric analysis; or Flagger with a service mesh. The rollout strategy itself is declarative in Git.

**40. How do you manage secrets in GitOps (you can't commit plaintext)?** `[ ]`
Sealed Secrets (encrypt to a cluster-specific key, safe to commit), External Secrets Operator (pull from Vault/cloud secret manager), or SOPS-encrypted files. Never commit plaintext secrets.

**41. Push vs pull deployment model — why does GitOps prefer pull?** `[ ]`
Pull (controller in-cluster reconciles from Git) keeps credentials inside the cluster, reduces external attack surface, and continuously corrects drift — vs push CI needing cluster creds.

**42. How do you promote across environments in GitOps?** `[ ]`
Separate Git paths/branches/repos per env; promotion = a PR that updates the image tag/values in the next env's path. Often automated by a CI step that opens the PR.

**43. What are the failure modes of GitOps?** `[ ]`
Git outage blocks deploys (mitigate with HA Git + caching), bad commit propagates fast (use PR review + progressive delivery), drift if someone bypasses Git (enforce via auto-heal + RBAC).

**44. How does ArgoCD handle multi-cluster?** `[ ]`
One ArgoCD can manage many registered clusters; ApplicationSets template Applications across clusters/environments from a generator.

**45. What is an ApplicationSet?** `[ ]`
A generator that produces many ArgoCD Applications from a template (per cluster, per env, per Git directory) — DRY multi-cluster/multi-env management.

**46. How do you audit who changed what in GitOps?** `[ ]`
Git history (commits/PRs) is the audit log — every change is attributable, reviewed, and revertable. This is a major compliance win in regulated environments *(your experience).*

---

## D. Networking (47–58)

**47. What is a CNI? Name some.** `[ ]`
Container Network Interface — plugin standard for pod networking. Calico, Cilium, Flannel, Weave, AWS VPC CNI. Cilium uses eBPF for performance + network policy + observability.

**48. How do pods communicate across nodes?** `[ ]`
Flat pod network: every pod gets a routable IP; CNI handles cross-node routing (overlay like VXLAN, or native routing). No NAT between pods.

**49. What is a NetworkPolicy?** `[ ]`
Declarative L3/L4 firewall rules for pod traffic (ingress/egress by label/namespace/CIDR). Default is allow-all until a policy selects a pod; enforced by the CNI (e.g., Calico/Cilium).

**50. How does kube-proxy implement Services?** `[ ]`
Programs iptables or IPVS rules to load-balance Service VIP traffic to backend pod IPs. IPVS scales better for many services.

**51. ClusterIP vs LoadBalancer vs Ingress for exposing apps?** `[ ]`
ClusterIP = internal only. LoadBalancer = one cloud LB per service (costly at scale). Ingress = one LB fronting many HTTP routes (efficient). Gateway API generalizes this.

**52. What is a service mesh and what does it give you?** `[ ]`
A sidecar (or eBPF) data plane (Envoy) + control plane (Istio/Linkerd) providing mTLS, traffic management (canary, retries, timeouts), and observability — without app changes. Cost: complexity + latency/resource overhead.

**53. mTLS — why and how in a mesh?** `[ ]`
Mutual TLS authenticates *both* sides and encrypts service-to-service traffic; the mesh auto-issues/rotates certs. Critical in zero-trust / regulated networks *(your experience).*

**54. East-west vs north-south traffic?** `[ ]`
East-west = service-to-service inside the cluster. North-south = traffic in/out of the cluster (ingress/egress). Mesh handles east-west; ingress/gateway handles north-south.

**55. How do you control egress from a cluster?** `[ ]`
Egress NetworkPolicies, egress gateways, NAT with allow-lists. Essential in air-gapped/regulated setups to prevent exfiltration *(your experience).*

**56. What is the Gateway API and why is it replacing Ingress?** `[ ]`
A more expressive, role-oriented, extensible standard for L4/L7 routing (Gateway, HTTPRoute, etc.) that fixes Ingress's limitations (vendor annotations, weak multi-team support).

**57. How does DNS-based service discovery scale issues arise?** `[ ]`
CoreDNS load, ndots search-domain query amplification, caching. Tune ndots, enable NodeLocal DNSCache, scale CoreDNS.

**58. How would you debug "service A can't reach service B"?** `[ ]`
Check endpoints (`kubectl get endpoints`), readiness probes, NetworkPolicies, DNS resolution, kube-proxy rules, mesh authz policies, and node-level connectivity. Bisect L3→L4→L7.

---

## E. Security (59–72)

**59. What is RBAC in Kubernetes?** `[ ]`
Role/ClusterRole (permissions) bound via RoleBinding/ClusterRoleBinding to subjects (users, groups, ServiceAccounts). Least privilege; avoid cluster-admin.

**60. What is a ServiceAccount and how do pods use it?** `[ ]`
An identity for in-cluster processes; pods get a token (projected) to call the API. Scope its RBAC tightly; disable automounting where not needed.

**61. Pod Security Standards / admission?** `[ ]`
PSA enforces baseline/restricted policies (no privileged, no host namespaces, drop capabilities) at namespace level via admission. Replaced PodSecurityPolicy.

**62. What is admission control? Mutating vs validating webhooks?** `[ ]`
Admission controllers intercept API requests after authn/authz. Mutating webhooks modify objects (inject sidecars/defaults); validating webhooks accept/reject (policy). OPA Gatekeeper/Kyverno implement policy-as-code here.

**63. How do you enforce policy as code?** `[ ]`
OPA Gatekeeper (Rego constraints) or Kyverno (YAML policies) as validating/mutating admission — e.g., "no public LB," "images must be from internal registry," "must have resource limits."

**64. How do you secure the supply chain?** `[ ]`
Image signing (cosign/Sigstore), SBOMs, provenance (SLSA), vulnerability scanning (Trivy/Grype) in CI and at admission, pin digests, use trusted base images, internal registry only. *(Critical in your regulated bank context.)*

**65. How do you secure secrets in K8s?** `[ ]`
Encrypt etcd at rest, RBAC-restrict Secret access, use External Secrets/Vault, avoid env-var leakage in logs, rotate regularly. Don't treat base64 as security.

**66. What is the principle of least privilege applied to a cluster?** `[ ]`
Minimal RBAC, scoped ServiceAccounts, NetworkPolicies default-deny, no privileged containers, dedicated node pools, namespace isolation, admission policies.

**67. Container escape risks and mitigations?** `[ ]`
Privileged containers, host mounts, hostPID/Network, kernel vulns. Mitigate: drop capabilities, read-only rootfs, non-root user, seccomp/AppArmor, and stronger isolation (gVisor/Kata) for untrusted workloads.

**68. How do you handle multi-tenant isolation securely?** `[ ]`
Namespaces + RBAC + quotas + NetworkPolicies + PSA + separate node pools; for hard isolation, separate clusters or sandboxed runtimes (`08`/Design 8).

**69. What is image scanning and where in the pipeline?** `[ ]`
Scan in CI (fail builds on critical CVEs), in the registry (continuous), and at admission (block unscanned/vulnerable images). Trivy/Grype/registry-native scanners.

**70. How do you do zero-trust networking in K8s?** `[ ]`
Default-deny NetworkPolicies, mTLS everywhere (mesh), authz policies per service, short-lived identities, egress control. Never trust by network location.

**71. How do you rotate credentials/certs at scale?** `[ ]`
Automated cert management (cert-manager, mesh-issued certs with short TTLs), External Secrets with rotation, ServiceAccount token rotation. Short-lived > long-lived.

**72. What's the risk of `kubectl exec` in prod and how do you govern it?** `[ ]`
Bypasses change control, can leak data, hard to audit. Govern via RBAC restriction, audit logging, break-glass procedures, and preferring debug containers + observability over shelling in.

---

## F. Observability (73–82)

**73. The three pillars of observability?** `[ ]`
Metrics (aggregates/trends), logs (discrete events), traces (request flow across services). Correlate via trace IDs. (`03`/Design 11.)

**74. Metrics vs monitoring vs observability?** `[ ]`
Monitoring = watching known signals/alerting on known failure modes. Observability = ability to ask new questions about *unknown* failures from the data. You need both.

**75. What is Prometheus and how does it scrape?** `[ ]`
Pull-based TSDB; scrapes `/metrics` endpoints on a schedule, stores time series, queried with PromQL. Service discovery finds targets.

**76. How do you scale Prometheus for long retention/HA?** `[ ]`
Thanos / Mimir / Cortex: remote-write to object storage, global query view, downsampling, HA pairs. Single Prometheus doesn't scale for fleet-wide long retention.

**77. What is high cardinality and why is it dangerous?** `[ ]`
Too many unique label combinations (e.g., user_id as a label) explodes series count → memory/cost/instability. Control with label discipline and limits — the #1 observability cost problem.

**78. What are SLI, SLO, SLA, error budget?** `[ ]`
SLI = a measured indicator (e.g., success rate). SLO = target for the SLI. SLA = contractual promise (with penalties). Error budget = 1 − SLO; how much unreliability you can spend. Drives release decisions.

**79. Head vs tail sampling for traces?** `[ ]`
Head: decide to keep at request start (cheap, may miss rare errors). Tail: decide after seeing the whole trace (keeps interesting/erroring traces, needs buffering).

**80. What is OpenTelemetry and why standardize on it?** `[ ]`
Vendor-neutral instrumentation standard (SDKs + collector) for metrics/traces/logs. Avoids vendor lock-in; instrument once, export anywhere.

**81. How do you alert without alert fatigue?** `[ ]`
Alert on symptoms/SLO burn (user-impacting), not every cause; use multi-window burn-rate alerts; route by severity; review and prune noisy alerts regularly.

**82. How does observability feed automated RCA / anomaly detection?** `[ ]`
Metrics/logs/traces are the signal inputs; anomaly detection flags deviations; an RCA system correlates signals + topology to localize cause. *(your Ollama/Gemma RCA platform — close the loop.)*

---

## G. CI/CD & GitHub Actions (83–94)

**83. CI vs CD vs Continuous Deployment?** `[ ]`
CI = integrate + build + test on every change. Continuous Delivery = always deployable, deploy on a button. Continuous Deployment = auto-deploy every passing change to prod.

**84. What makes a good CI pipeline?** `[ ]`
Fast feedback, deterministic/reproducible, fail-fast, caching, parallelism, secure secret handling, artifact immutability, and quality gates (tests, lint, scan).

**85. How do GitHub Actions work (core concepts)?** `[ ]`
Workflows (YAML) triggered by events run Jobs (on runners) made of Steps (actions or commands). Jobs can depend on each other, run in a matrix, and share artifacts/caches.

**86. Self-hosted vs GitHub-hosted runners — tradeoffs?** `[ ]`
Hosted: zero maintenance, clean ephemeral envs, per-minute cost. Self-hosted: control, custom hardware (GPUs), network access to internal systems, but you own security/maintenance/isolation. *(your GitHub migration experience.)*

**87. How do you secure GitHub Actions?** `[ ]`
Least-privilege `GITHUB_TOKEN` permissions, OIDC for cloud auth (no long-lived keys), pin actions to SHA, restrict who can run workflows, protect secrets, review third-party actions, environment protection rules.

**88. What is OIDC-based auth from Actions to a cloud?** `[ ]`
The workflow gets a short-lived OIDC token the cloud trusts (via a federated identity provider) → no static cloud credentials stored in GitHub. Major security improvement.

**89. How do you speed up pipelines?** `[ ]`
Caching (deps, layers), parallel/matrix jobs, test splitting, build once-promote-many (don't rebuild per env), incremental builds, right-sized runners, fail-fast ordering.

**90. How do you handle secrets across environments in CI/CD?** `[ ]`
Scoped secrets per environment, OIDC for cloud, external secret managers, never echo secrets to logs, mask values, rotate. Promote artifacts, not secrets.

**91. Build-once, deploy-many — why?** `[ ]`
Build a single immutable artifact, promote the *same* artifact through envs. Guarantees what you tested is what you ship; avoids env-specific build drift.

**92. How do you implement a deployment gate / approval?** `[ ]`
Environment protection rules / manual approvals, automated quality gates (tests, scans, SLO checks), progressive delivery with automated rollback on metric regression.

**93. How would you design a build-failure RCA bot in CI?** `[ ]`
Hook the workflow failure event → collect logs/diff/context → feed to an LLM with structured prompts → return likely cause + fix suggestion as a PR comment. *(your build-RCA agent + GitHub Actions experience.)*

**94. How do you achieve reproducible builds?** `[ ]`
Pin dependencies + base image digests, hermetic builds, lockfiles, deterministic ordering, content-addressable caching, isolated build environments.

---

## H. Platform Engineering (95–110)

**95. What is platform engineering and how does it differ from DevOps?** `[ ]`
Platform engineering builds an *internal product* (the IDP) that provides self-service paved roads, reducing cognitive load for stream-aligned teams. DevOps is a culture/practice; platform engineering operationalizes it as a product with a dedicated team. (`03`/Design 7.)

**96. What is an Internal Developer Platform (IDP)?** `[ ]`
A curated set of self-service tools/workflows (portal, golden templates, GitOps, observability, guardrails) that lets developers ship without deep infra knowledge. Backstage is a common portal.

**97. What does "platform as a product" mean?** `[ ]`
Treat developers as customers: measure adoption, DX, lead time; gather feedback; roadmap; don't force adoption — earn it by being better than the alternative. *(your "productize the RCA platform so any team adopts it" story.)*

**98. What are "golden paths" / paved roads?** `[ ]`
Opinionated, pre-wired, supported defaults for the common case (security/observability/CI baked in). Speed up the 80%; provide escape hatches for the 20%.

**99. Team Topologies — how does it apply?** `[ ]`
Stream-aligned teams deliver value; platform teams reduce their cognitive load; enabling teams uplift skills; complicated-subsystem teams own deep specialties. Platform engineering = the platform team.

**100. How do you measure platform/DevOps success (DORA)?** `[ ]`
DORA metrics: deployment frequency, lead time for changes, change failure rate, time to restore. Plus adoption, developer satisfaction, and cost-to-serve.

**101. How do you drive adoption of an internal platform?** `[ ]`
Make it genuinely easier than the alternative, seed with lighthouse teams, great docs/onboarding, measure & show wins, executive sponsorship, and treat feedback as a product backlog. *(CAB approval + bank-wide adoption is exactly this.)*

**102. How do you balance standardization vs team autonomy?** `[ ]`
Golden paths for consistency + escape hatches for edge cases; enforce non-negotiables (security/compliance) via policy-as-code, leave the rest opinionated-but-optional.

**103. How do you handle the "platform team becomes a ticket queue" anti-pattern?** `[ ]`
Self-service automation over manual fulfillment; APIs/portals instead of tickets; invest in docs and templates so teams are autonomous.

**104. Build vs buy for platform capabilities?** `[ ]`
Buy/adopt OSS for undifferentiated heavy lifting (Argo CD, Backstage, Prometheus); build only what's differentiating or specific to your constraints (e.g., air-gapped/regulated needs). Consider TCO, not just license cost.

**105. How do you do capacity planning / cost governance on a platform?** `[ ]`
Showback/chargeback per tenant, quotas, right-sizing (VPA/recommendations), autoscaling, spot/preemptible where safe, and visibility dashboards. Cost is a first-class platform feature. *(your cost-savings story.)*

**106. How do you roll out a breaking platform change safely?** `[ ]`
Versioned APIs, deprecation policy with timelines, migration tooling/automation, communication, dual-running, and progressive rollout. Never break tenants silently.

**107. What's your approach to multi-cloud / hybrid platform consistency?** `[ ]`
Abstract via a control plane + GitOps + policy-as-code; standardize on portable primitives (K8s, OpenTelemetry); accept that full portability has a cost — abstract pragmatically, not religiously.

**108. How do you make a platform reliable enough to be trusted?** `[ ]`
Run it with SLOs, on-call, runbooks, blameless postmortems; the platform's own reliability budget; dogfood it; treat platform outages as P1 because they block everyone.

**109. How would you introduce an AI capability as a platform service?** `[ ]`
Expose it behind an AI Gateway (governance, quotas, audit, guardrails), provide self-service templates, ensure data residency/compliance, measure adoption and quality. *(your Ollama/Gemma platform + AI Gateway design, `03`/Design 9.)*

**110. How do you migrate a large estate (e.g., OpenShift→GCP, or N pipelines) with minimal disruption?** `[ ]`
Inventory + dependency mapping, a config-driven/automated migration framework to turn it into a repeatable functional problem, phased cutover with rollback, parallel running, validation gates, and clear comms. *(your OpenShift→GCP + 50-pipeline config-driven migration framework — your single strongest platform story.)*

---

## Progress

Core `__/25` · Helm `__/9` · GitOps `__/12` · Networking `__/12` · Security `__/14` · Observability `__/10` · CI/CD `__/12` · Platform `__/16`

## Weak-spot log
```
Topic I keep fumbling: __________
Re-drill date: __________
```
