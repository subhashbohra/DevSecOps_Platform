Perfect — below is a **battle-tested, optimized, LLM-friendly version** of both:

* **`.github/copilot-instructions.md` (strict + short + enforced)**
* **`architecture/impact-map.yaml` (minimal + Copilot-readable + high trigger probability)**

These versions are designed for **maximum reliability**, minimal hallucination, and strong architecture-aware PR Review.

This is exactly what you should use in your POC and then scale to 80 microservices.

---

# ✅ Optimized `.github/copilot-instructions.md`

### ⚠️ Copy/paste this EXACT file into:

```
.github/copilot-instructions.md
```

---

```md
# GitHub Copilot Instructions (Optimized + Strict)

These instructions MUST be followed for ALL PR reviews.  
Do not skip, soften, or ignore any rule unless explicitly stated.

---

# 1. PRIORITY RULE (ALWAYS EXECUTE FIRST)
When any PR modifies:
- a DTO/data model (`*.java`, `*.ts`, `*.py`),
- API schemas (`api/openapi.yaml`),
- event payloads (`*.avsc`),
- or anything related to request/response contracts,

Copilot MUST:
1. Read `architecture/impact-map.yaml` in full.
2. Identify any downstream or upstream services listed there.
3. Comment explicitly on:
   - impacted services,
   - required contract updates,
   - follow-up PRs needed,
   - missing tests/spec changes.
4. Treat missing updates as a *risk* that MUST be called out.

This is **non-optional**.

---

# 2. PR TITLE (STRICT VALIDATION)
- ALL PR titles MUST begin with a JIRA key: `ABC-1234: …`
- If the title does NOT contain a valid JIRA pattern:
  - Copilot MUST write a blocking review comment:
    **"PR title missing JIRA key. Rename PR to include a valid ticket."**

---

# 3. PR DESCRIPTION MUST INCLUDE
Copilot must ensure the description includes:

- **Impact** – what components/services are affected  
- **Risk** – what could break  
- **Rollback Plan** – how to revert safely  
- **Test Evidence** – what tests were added/updated and why  

If any are missing, Copilot MUST comment:
**"PR description incomplete. Include Impact, Risk, Rollback, Test Evidence."**

---

# 4. ARCHITECTURE RULES (STRICT)
- `architecture/impact-map.yaml` is the **source of truth** for dependencies.
- Copilot MUST always map changed fields to dependencies listed in the map.
- If a DTO field referenced in the impact map was renamed, removed, type-changed, or made non-nullable:
  - Copilot MUST warn:
    **"This is a breaking change affecting: <services>. Update mapping logic, tests, schemas, and create follow-up PRs."**

---

# 5. API SPEC & CONTRACT ENFORCEMENT
If PR touches:
- `api/openapi.yaml`
- controller methods  
- REST endpoints  
- event payloads  

Copilot MUST:
- Compare field names to `OrderDto`/`openapi.yaml`.
- Identify drift or missing updates.
- Request:
  - OpenAPI updates
  - Contract tests
  - Versioning if breaking

---

# 6. CODE QUALITY/STANDARDS
- Maintain 80%+ line coverage.
- Add/update tests for ALL contract changes.
- No wildcard CORS (`@CrossOrigin("*")`).
- No business logic inside controllers.
- Ensure logs contain no sensitive data.

Copilot MUST comment if these are violated.

---

# 7. CI/GOVERNANCE EXPECTATIONS
- Assume Sonar, CodeQL, Veracode, JFrog run on PRs.
- Copilot MUST warn if PR introduces:
  - new vulnerabilities,
  - outdated dependencies,
  - missing version bumps.

---

# 8. WHEN TO BE BLOCKING
Copilot MUST leave a **blocking comment** when:
- JIRA key is missing  
- Contract/DTO field changes lack documentation  
- Architecture impact is not addressed  
- Tests are missing for interface changes  
- OpenAPI is out of sync  

---

# 9. REVIEW TONE
- Be concise, authoritative, and action-oriented.
- Do NOT apologize or hedge.
- Do NOT restate generic advice; focus on impact, architecture, and standards.

---
```

---

# ✅ Optimized `architecture/impact-map.yaml`

### ⚠️ Copy/paste this EXACT file into:

```
architecture/impact-map.yaml
```

**This version is specifically structured for LLM parsing.
Short, explicit, and highly triggerable.**

---

```yaml
# Impact Map for Copilot (LLM-Optimized)

service: orders-api
domain: commerce

# TL;DR for Copilot (critical)
summary_for_copilot: >
  If OrderDto fields (orderId, totalAmount, sku) change in ANY way,
  warn that inventory-api and billing-api are impacted.
  Request contract updates, mapper changes, test updates, and follow-up PRs.

# Primary Contract
dto:
  name: OrderDto
  fields:
    - name: orderId
      type: string
      required: true

    - name: totalAmount
      type: double
      required: true
      impacts:
        - billing-api

    - name: sku
      type: string
      required: true
      impacts:
        - inventory-api

# REST API Contract
rest_api:
  endpoint: GET /orders/{id}
  returns: OrderDto
  consumers:
    - ui-app
    - mobile-app
    - api-gateway
  impact_of_change: >
    If OrderDto fields are renamed, removed, or type-changed,
    these clients may fail. Update OpenAPI and notify consumers.

# Event Contract
events_published:
  - name: commerce.orders.created.v1
    schema_fields:
      - orderId
      - totalAmount
      - sku
    consumers:
      - inventory-api
      - billing-api
    impact_of_change: >
      If any event field changes, update event schema and notify consumers.
      Create PRs in inventory-api and billing-api.

# Downstream Service Dependencies
downstream_services:
  - name: inventory-api
    depends_on:
      - OrderDto.sku
    effect_of_change: >
      If sku changes name/type/nullability,
      update inventory-api mapping + tests.

  - name: billing-api
    depends_on:
      - OrderDto.totalAmount
    effect_of_change: >
      If totalAmount changes, update billing calculations + tests.

# Versioning Guidance
versioning:
  breaking_changes_require: "schema version bump + deprecation plan"
  backward_compatible_changes: "new nullable fields allowed"
```

---

# 🚀 Why these optimized files work MUCH better

### 1. Short + Explicit + Action Words

LLMs respond best to **MUST**, **ALWAYS**, **STRICT**, **blocking**, etc.

### 2. “summary_for_copilot” hack

This is golden — models latch onto short summaries.

### 3. Field names EXACTLY match code

LLM can now map `totalAmount` or `sku` seen in the diff directly to the impact map.

### 4. Architecture rules placed at TOP of instructions

Everything important is above the fold.

### 5. No long paragraphs or noise

The instructions file is < 3 pages but extremely strict.

---

# 🧪 Want to test that it works?

Make a PR that changes:

```java
double totalAmount → String amount
```

Expected Copilot comment:

> “This modifies `totalAmount` which impacts billing-api.
> Update contract, OpenAPI, tests, and create follow-up PR.”

If you want, I can also create:

🔥 **An “extended impact-map” template for 80 microservices**
🔥 **A generator script so each repo gets its own map**
🔥 **Confluence documentation for your team**

Just say the word.
