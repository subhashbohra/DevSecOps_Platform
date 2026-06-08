# 11 — GCP System Design

> GCP-specific architecture for the Google loop (`04`). Google interviewers respond well to candidates who understand GCP primitives *and* the Google-internal systems they descend from (Spanner, Bigtable, Colossus, Borg, Chubby). Know the mapping; it signals you think at Google's altitude. Your **GKE/GDC lakehouse** experience is a direct asset here.

---

## GCP ↔ Google-internal ↔ AWS mental map

| GCP service | Heritage / what it is | Rough AWS analogue |
|-------------|----------------------|--------------------|
| **Spanner** | Globally-distributed, strongly-consistent SQL (TrueTime) | (no true equal; Aurora/DynamoDB partial) |
| **Bigtable** | Wide-column NoSQL, low-latency, huge scale | DynamoDB / Cassandra |
| **Cloud Storage (GCS)** | Object storage on Colossus | S3 |
| **BigQuery** | Serverless columnar analytics warehouse (Dremel) | Redshift / Athena |
| **GKE** | Managed Kubernetes (Borg heritage) | EKS |
| **Pub/Sub** | Global managed messaging | SNS+SQS / Kinesis |
| **Dataflow** | Managed Apache Beam stream/batch | Kinesis Data Analytics / EMR |
| **Cloud Spanner/Firestore** | Strong SQL / serverless document | DynamoDB/RDS |
| **Cloud Run** | Serverless containers | Fargate / App Runner |
| **Cloud Functions** | FaaS | Lambda |
| **Memorystore** | Managed Redis/Memcached | ElastiCache |
| **Cloud Load Balancing** | Global anycast L7 LB | ALB/CloudFront (global) |
| **GDC (Distributed Cloud)** | GCP on-prem/air-gapped/edge | Outposts (loosely) |

> **High-signal fact:** Spanner gives external/strong consistency *globally* via TrueTime (GPS+atomic-clock bounded uncertainty). Mentioning the consistency/latency tradeoff Spanner makes is a strong Google-flavored answer.

---

## Design 1 — Global, strongly-consistent service on Spanner `[ ]`

**When:** You need horizontal scale *and* strong consistency / SQL / global transactions (financial ledgers, inventory).
**Pattern:** Global L7 LB → regional stateless services (GKE/Cloud Run) → **Spanner** (multi-region config) → Memorystore cache for reads.
**Tradeoffs:** Spanner gives strong consistency at the cost of write latency (cross-region commit) and price. Use it when correctness > cheap; otherwise Firestore/Bigtable.
**Discussion:** TrueTime, commit-wait, schema/interleaving for locality, hotspotting on monotonic keys (avoid sequential PKs — this is *the* Spanner gotcha).

## Design 2 — High-scale ingest + analytics (the Google data stack) `[ ]`

**Pattern:** Pub/Sub (durable global ingest) → **Dataflow** (Beam, stream + batch unified) → **BigQuery** (warehouse) and/or GCS (lake). Looker/BI on top.
**Tradeoffs:** Dataflow autoscaling + exactly-once vs operational simplicity; BigQuery serverless (pay per query/bytes scanned — partition + cluster to control cost) vs always-on. Beam's unified batch+stream model is a strong talking point.
**Discussion:** Windowing, watermarks, late data, exactly-once semantics. Your **Iceberg/Trino lakehouse** is the open-source analog — contrast open lakehouse vs BigQuery managed warehouse.

## Design 3 — Lakehouse on GKE / GDC (your real platform) `[ ]`

**Pattern:** Object storage (GCS / GDC storage) holding **Iceberg** tables → **Nessie** for catalog + git-like versioning → **Trino** for federated SQL → **Spark** (Spark Operator on GKE) for heavy ETL → **Airflow** for orchestration → all on **GKE/GDC**, air-gapped.
**Tradeoffs:** Open lakehouse (engine independence, no lock-in, format portability, ACID via Iceberg) vs managed BigQuery (zero-ops, tightly integrated, pay-per-scan). In a regulated/air-gapped bank, open + self-hosted wins on control & residency.
**Bottlenecks:** Trino coordinator scaling, Iceberg metadata/compaction, Spark resource contention on shared GKE, air-gapped image distribution.
**Discussion:** This *is* your day job — lead it with operational scars: why Iceberg over Delta/Hudi, Nessie branching for safe data changes, multi-tenant Trino, GDC air-gapped constraints. Strongest possible Google-loop design for you.

## Design 4 — Global container service on GKE `[ ]`

**Pattern:** Global HTTP(S) LB (anycast) → regional GKE clusters (multi-region) → Cloud SQL/Spanner → Memorystore; Workload Identity for pod→GCP auth (no keys); Artifact Registry; Config Sync/Argo CD for GitOps.
**Security:** Workload Identity over node SAs, private clusters, VPC-SC for data exfiltration control, Binary Authorization (only signed images), Policy Controller (OPA).
**Discussion:** GKE Autopilot (fully managed nodes) vs Standard; multi-cluster ingress; VPC Service Controls for regulated data perimeters (relevant to your context).

## Design 5 — Serverless event-driven on GCP `[ ]`

**Pattern:** Eventarc/Pub/Sub → Cloud Run / Cloud Functions → Firestore/Spanner; Workflows for orchestration; Cloud Tasks for deferred/throttled work.
**Tradeoffs:** Cloud Run (containers, request-driven autoscale to zero, flexible) vs Cloud Functions (lightweight FaaS). Mirror of the AWS serverless design (`10`/Design 2).

---

## GCP security & networking talking points

- **IAM:** roles/policies at org→folder→project hierarchy; least privilege; service accounts + **Workload Identity** (no static keys).
- **VPC Service Controls (VPC-SC):** data-exfiltration perimeter around services — important for regulated/air-gapped data. Strong Google-flavored security point.
- **Binary Authorization:** enforce only-signed/attested images — supply-chain security.
- **Encryption:** default at rest; CMEK/CSEK for customer-managed keys (residency/compliance).
- **Private Google Access / Private Service Connect** for private connectivity.

---

## Cost talking points

- BigQuery: partition + cluster + on-demand vs flat-rate slots; control bytes scanned.
- Committed-use discounts (CUDs) + sustained-use discounts; preemptible/Spot VMs for fault-tolerant work.
- GCS storage classes + lifecycle; network egress is the silent cost (keep in-region, use CDN).

---

## Practice checklist
- [ ] Can map GCP services to Google-internal heritage + AWS analogues
- [ ] Can explain Spanner's consistency/latency tradeoff (TrueTime)
- [ ] Can lead the Iceberg/Trino/Nessie/Spark/Airflow lakehouse on GKE/GDC cold (your edge)
- [ ] Can discuss VPC-SC + Workload Identity + Binary Authorization for regulated data
- [ ] Can contrast open lakehouse vs BigQuery warehouse with conviction

## Notes
```
GCP service to study deeper: ______
Google-heritage fact to memorize: ______
```
