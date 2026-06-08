# 10 — AWS System Design

> AWS-specific architecture, framed for the AWS Principal SA loop (`08`) but useful anywhere you'll design on AWS. Lead with the **Well-Architected Framework** and *justify every service choice*. The signal at Principal is service breadth + tradeoff judgment + cost/security awareness.

---

## The Well-Architected lens (use it to structure every answer)

| Pillar | The question you must answer |
|--------|------------------------------|
| **Operational Excellence** | How do you run, observe, and evolve this? IaC, automation, runbooks. |
| **Security** | AuthN/Z, encryption, least privilege, network isolation, audit. |
| **Reliability** | Multi-AZ/region, failover, backups, RPO/RTO, graceful degradation. |
| **Performance Efficiency** | Right service/instance, caching, async, scaling. |
| **Cost Optimization** | Right-sizing, spot, serverless, storage tiers, data transfer. |
| **Sustainability** | Efficient resource use, managed/serverless to improve utilization. |

> Say "let me frame this through Well-Architected" early — it signals you think like an SA, not just a coder.

---

## Core AWS service cheat-sheet (know when to reach for each)

- **Compute:** EC2 (full control), ECS/EKS (containers), Lambda (event-driven serverless), Fargate (serverless containers), Batch.
- **Storage:** S3 (object, 11 nines durability, tiers), EBS (block), EFS (shared file), FSx; Glacier for archive.
- **Databases:** RDS/Aurora (relational; Aurora = cloud-native, autoscaling storage), DynamoDB (KV/wide-column, single-digit-ms, serverless scale), ElastiCache (Redis/Memcached), Redshift (warehouse), Neptune (graph), Timestream (time series), OpenSearch.
- **Messaging/streaming:** SQS (queue), SNS (pub/sub fan-out), EventBridge (event bus/routing), Kinesis/MSK (streaming), Step Functions (orchestration).
- **Networking:** VPC, subnets, security groups (stateful), NACLs (stateless), ALB/NLB, Route 53 (DNS), CloudFront (CDN), PrivateLink, Transit Gateway, Direct Connect.
- **Security/identity:** IAM, STS, KMS, Secrets Manager, Cognito, WAF, Shield, GuardDuty, Security Hub.
- **Observability:** CloudWatch (metrics/logs/alarms), X-Ray (tracing), CloudTrail (API audit).
- **IaC/DevOps:** CloudFormation/CDK, CodePipeline/CodeBuild, Systems Manager.

---

## Design 1 — Scalable web application (3-tier, HA) `[ ]`

**Pattern:** Route 53 → CloudFront (static/cache) → ALB → stateless app tier (ECS/EKS/Lambda) in an Auto Scaling Group across **≥2 AZs** → Aurora (Multi-AZ) + ElastiCache + S3 for assets.
**Reliability:** Multi-AZ everywhere; Aurora failover; health checks; ASG self-healing.
**Security:** Public ALB in public subnets, app + DB in private subnets, security groups least-privilege, KMS encryption, WAF on CloudFront, secrets in Secrets Manager.
**Cost:** Right-size + autoscale; CloudFront cuts origin load; consider Savings Plans / Spot for stateless tier.
**Discussion:** When to go serverless (Lambda+API GW+DynamoDB) vs containers (EKS/ECS) — bursty/event-driven & low-ops → serverless; steady high-throughput or complex runtime → containers.

## Design 2 — Event-driven serverless pipeline `[ ]`

**Pattern:** API Gateway → Lambda → DynamoDB; async fan-out via SNS/EventBridge; SQS buffers for resilience; Step Functions for multi-step orchestration; DLQs for failures.
**Tradeoffs:** Serverless = no servers, pay-per-use, auto-scale, but cold starts, execution limits, and harder local testing. DynamoDB single-table design around access patterns; beware hot partitions.
**Reliability:** SQS + DLQ + idempotent Lambdas + retries with backoff.
**Discussion:** When *not* to go serverless (sustained high throughput where it gets expensive; long-running jobs; heavy stateful processing).

## Design 3 — Data lake / analytics on AWS `[ ]`

**Pattern:** Ingest (Kinesis/DMS/Glue) → **S3 data lake** (raw/curated zones, often **Apache Iceberg** tables) → catalog (Glue Data Catalog) → query (Athena/Trino, Redshift Spectrum, EMR/Spark) → BI.
**Tradeoffs:** Open table format (Iceberg) for ACID, schema evolution, time travel, engine independence — *exactly your lakehouse expertise; bring it in.* Athena (serverless, pay-per-scan; partition + columnar Parquet to control cost) vs Redshift (provisioned warehouse, predictable heavy BI).
**Cost/Perf:** Partitioning, compaction, Parquet/ORC, S3 storage tiers, lifecycle policies.
**Discussion:** Lakehouse vs warehouse; governance (Lake Formation); your GCP equivalent in `11`.

## Design 4 — Multi-region active-active for DR `[ ]`

**Pattern:** Route 53 latency/failover routing → regional stacks → DynamoDB Global Tables or Aurora Global Database for cross-region data → S3 Cross-Region Replication.
**Tradeoffs:** Active-active (low RTO/RPO, cost + conflict handling) vs active-passive (cheaper, higher RTO). Define **RPO/RTO** explicitly and design to them.
**Discussion:** Data sovereignty/residency, replication lag, split-brain, cost of running 2 regions hot. Failover testing (game days).

## Design 5 — Container platform on EKS `[ ]`

**Pattern:** EKS control plane + managed node groups / **Karpenter** autoscaling + Fargate for bursty pods; ALB Ingress Controller; IRSA (IAM Roles for Service Accounts) for least-privilege pod identity; ECR for images; GitOps via Argo CD.
**Security:** IRSA over node IAM, private subnets, security groups for pods, image scanning, OPA/Kyverno admission.
**Cost:** Karpenter for fast, bin-packed, spot-friendly scaling; right-size requests.
**Discussion:** EKS vs ECS vs self-managed; Karpenter vs Cluster Autoscaler; ties to `09` and `03`/Design 8.

---

## Cost optimization talking points (Principal SA gold)

- Compute: Savings Plans/Reserved for steady, **Spot** for fault-tolerant, serverless for spiky.
- Storage: S3 Intelligent-Tiering / lifecycle to Glacier; delete orphaned EBS/snapshots.
- Data transfer: keep traffic in-region/in-VPC; CloudFront to cut egress; VPC endpoints to avoid NAT costs.
- Visibility: Cost Explorer, budgets, tagging for showback, Compute Optimizer.
- *(Anchor in your real cost-savings story — `12`.)*

---

## Security talking points

- IAM least privilege, roles over keys, **OIDC federation** (no static creds), MFA, SCPs at org level.
- Encryption everywhere (KMS), Secrets Manager, no plaintext.
- Network: private subnets, security groups (stateful) vs NACLs (stateless), PrivateLink, WAF/Shield.
- Detection: GuardDuty, Security Hub, CloudTrail (immutable audit), Config for compliance drift.

---

## Practice checklist
- [ ] Can frame any design via Well-Architected pillars
- [ ] Can justify serverless vs containers vs EC2 on demand
- [ ] Can design multi-AZ and multi-region with explicit RPO/RTO
- [ ] Can talk cost optimization across compute/storage/transfer
- [ ] Can lead the lakehouse/analytics design using Iceberg (your edge)

## Notes
```
Service I need to learn deeper: ______
Tradeoff I fumbled: ______
```
