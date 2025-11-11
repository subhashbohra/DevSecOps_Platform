Got it. Below are **ready-to-run MySQL 8.0** queries you can plug into Grafana (table/transform panels). They assume you’re using **Apache DevLake’s domain tables** (stable across sources). If your dashboards point to the GitHub tool tables (`_tool_github_*`), I’ve added equivalents at the end.

Set your parameters (timezone, window, optional repo filter, copilot login pattern) at the top of each block.

---

# 0) Common params (set once per panel / query)

```sql
-- 🔧 Adjust as needed
SET @tz := '+05:30';                 -- Asia/Kolkata
SET @days_back := 30;                -- reporting window
SET @copilot_login := '%copilot%';   -- matches github-copilot, github-copilot[bot]
-- Optional: limit to specific repos (list ids) e.g. '1,2,3' or keep NULL for all
SET @repo_ids_csv := NULL;           -- NULL = all repos
```

If you want a repo filter, add this predicate inside queries:

```sql
AND ( @repo_ids_csv IS NULL OR FIND_IN_SET(pr.base_repo_id, @repo_ids_csv) )
```

---

# 1) Daily PRs raised (last N days)

```sql
SET @start := UTC_TIMESTAMP() - INTERVAL @days_back DAY;

SELECT
  DATE(CONVERT_TZ(pr.created_date, '+00:00', @tz)) AS day_local,
  COUNT(*) AS prs_raised
FROM pull_requests pr
WHERE pr.created_date >= @start
  AND ( @repo_ids_csv IS NULL OR FIND_IN_SET(pr.base_repo_id, @repo_ids_csv) )
GROUP BY day_local
ORDER BY day_local;
```

# 2) Weekly PRs raised (last 8 weeks, Mon–Sun)

```sql
SET @weeks_back := 8;
SET @start := UTC_TIMESTAMP() - INTERVAL @weeks_back WEEK;

SELECT
  YEARWEEK(CONVERT_TZ(pr.created_date,'+00:00',@tz), 1) AS yearweek_iso,
  CONCAT(STR_TO_DATE(CONCAT(YEARWEEK(CONVERT_TZ(pr.created_date,'+00:00',@tz),1),' Monday'), '%X%V %W'), ' → ',
         STR_TO_DATE(CONCAT(YEARWEEK(CONVERT_TZ(pr.created_date,'+00:00',@tz),1),' Sunday'), '%X%V %W')) AS week_range,
  COUNT(*) AS prs_raised
FROM pull_requests pr
WHERE pr.created_date >= @start
  AND ( @repo_ids_csv IS NULL OR FIND_IN_SET(pr.base_repo_id, @repo_ids_csv) )
GROUP BY yearweek_iso, week_range
ORDER BY yearweek_iso;
```

---

# 3) PRs with a **Copilot review** (coverage)

Counts distinct PRs that received at least one review authored by a Copilot bot.

```sql
SET @start := UTC_TIMESTAMP() - INTERVAL @days_back DAY;

-- Total PRs
WITH prs AS (
  SELECT pr.id
  FROM pull_requests pr
  WHERE pr.created_date >= @start
    AND ( @repo_ids_csv IS NULL OR FIND_IN_SET(pr.base_repo_id, @repo_ids_csv) )
),
copilot_prs AS (
  SELECT DISTINCT r.pull_request_id
  FROM pull_request_reviews r
  WHERE r.created_date >= @start
    AND (r.author_name LIKE @copilot_login OR r.author_username LIKE @copilot_login)
)
SELECT
  (SELECT COUNT(*) FROM prs) AS total_prs,
  (SELECT COUNT(*) FROM copilot_prs) AS prs_with_copilot_review,
  ROUND(100 * (SELECT COUNT(*) FROM copilot_prs) / NULLIF((SELECT COUNT(*) FROM prs),0), 1) AS copilot_coverage_pct;
```

---

# 4) Daily breakdown: PRs raised vs PRs with Copilot review

```sql
SET @start := UTC_TIMESTAMP() - INTERVAL @days_back DAY;

WITH prs AS (
  SELECT pr.id, DATE(CONVERT_TZ(pr.created_date,'+00:00',@tz)) AS day_local
  FROM pull_requests pr
  WHERE pr.created_date >= @start
    AND ( @repo_ids_csv IS NULL OR FIND_IN_SET(pr.base_repo_id, @repo_ids_csv) )
),
copilot_by_pr AS (
  SELECT DISTINCT r.pull_request_id
  FROM pull_request_reviews r
  WHERE r.created_date >= @start
    AND (r.author_name LIKE @copilot_login OR r.author_username LIKE @copilot_login)
)
SELECT
  p.day_local,
  COUNT(*) AS prs_raised,
  SUM(p.id IN (SELECT pull_request_id FROM copilot_by_pr)) AS prs_with_copilot
FROM prs p
GROUP BY p.day_local
ORDER BY p.day_local;
```

---

# 5) Copilot review **volume** and **states**

How many Copilot reviews, and their states (commented/approved/changes_requested).

```sql
SET @start := UTC_TIMESTAMP() - INTERVAL @days_back DAY;

SELECT
  DATE(CONVERT_TZ(r.created_date,'+00:00',@tz)) AS day_local,
  r.state,
  COUNT(*) AS copilot_reviews
FROM pull_request_reviews r
JOIN pull_requests pr ON pr.id = r.pull_request_id
WHERE r.created_date >= @start
  AND (r.author_name LIKE @copilot_login OR r.author_username LIKE @copilot_login)
  AND ( @repo_ids_csv IS NULL OR FIND_IN_SET(pr.base_repo_id, @repo_ids_csv) )
GROUP BY day_local, r.state
ORDER BY day_local, r.state;
```

---

# 6) “Accepted/Resolved” **proxy** (action taken after Copilot review)

GitHub’s “resolved” flag on review threads usually isn’t available in domain tables. A reliable proxy is:
**PRs where a Copilot review was followed by a new commit by the PR author within 24 hours.**

```sql
SET @start := UTC_TIMESTAMP() - INTERVAL @days_back DAY;

WITH copilot_reviews AS (
  SELECT r.pull_request_id, MIN(r.created_date) AS first_copilot_review_at
  FROM pull_request_reviews r
  WHERE r.created_date >= @start
    AND (r.author_name LIKE @copilot_login OR r.author_username LIKE @copilot_login)
  GROUP BY r.pull_request_id
),
author_commits_after AS (
  SELECT
    prc.pull_request_id,
    MIN(prc.authored_date) AS first_author_commit_after
  FROM pull_request_commits prc
  JOIN pull_requests pr ON pr.id = prc.pull_request_id
  JOIN copilot_reviews cr ON cr.pull_request_id = prc.pull_request_id
  WHERE prc.authored_date > cr.first_copilot_review_at
    AND TIMESTAMPDIFF(HOUR, cr.first_copilot_review_at, prc.authored_date) <= 24
    AND prc.author_name = pr.author_name  -- commit by PR author
    AND ( @repo_ids_csv IS NULL OR FIND_IN_SET(pr.base_repo_id, @repo_ids_csv) )
  GROUP BY prc.pull_request_id
)
SELECT
  (SELECT COUNT(DISTINCT pull_request_id) FROM copilot_reviews) AS prs_with_copilot_review,
  (SELECT COUNT(DISTINCT pull_request_id) FROM author_commits_after) AS prs_with_action_within_24h,
  ROUND(100 * (SELECT COUNT(DISTINCT pull_request_id) FROM author_commits_after)
      / NULLIF((SELECT COUNT(DISTINCT pull_request_id) FROM copilot_reviews),0), 1) AS action_rate_24h_pct;
```

> If you prefer a **12h** window, change `<= 24` to `<= 12`.

---

# 7) Time-to-first-feedback (Copilot vs Human)

Median time from PR creation to *first* review; split Copilot vs non-Copilot.

```sql
SET @start := UTC_TIMESTAMP() - INTERVAL @days_back DAY;

WITH first_review AS (
  SELECT
    r.pull_request_id,
    MIN(r.created_date) AS first_review_at,
    MAX(r.author_username LIKE @copilot_login OR r.author_name LIKE @copilot_login) AS is_copilot_first  -- 1 if Copilot is first reviewer
  FROM pull_request_reviews r
  JOIN pull_requests pr ON pr.id = r.pull_request_id
  WHERE pr.created_date >= @start
    AND ( @repo_ids_csv IS NULL OR FIND_IN_SET(pr.base_repo_id, @repo_ids_csv) )
  GROUP BY r.pull_request_id
),
diffs AS (
  SELECT
    pr.id AS pull_request_id,
    TIMESTAMPDIFF(MINUTE, pr.created_date, fr.first_review_at) AS minutes_to_first_review,
    CASE WHEN fr.is_copilot_first = 1 THEN 'Copilot-first' ELSE 'Human-first' END AS first_reviewer_type
  FROM pull_requests pr
  JOIN first_review fr ON fr.pull_request_id = pr.id
  WHERE pr.created_date >= @start
)
SELECT
  first_reviewer_type,
  ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY minutes_to_first_review), 1) AS p50_min,
  ROUND(PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY minutes_to_first_review), 1) AS p90_min,
  COUNT(*) AS pr_count
FROM diffs
GROUP BY first_reviewer_type;
```

---

# 8) Top repositories by Copilot participation

```sql
SET @start := UTC_TIMESTAMP() - INTERVAL @days_back DAY;

WITH copilot_prs AS (
  SELECT DISTINCT r.pull_request_id
  FROM pull_request_reviews r
  WHERE r.created_date >= @start
    AND (r.author_name LIKE @copilot_login OR r.author_username LIKE @copilot_login)
),
agg AS (
  SELECT
    pr.base_repo_id AS repo_id,
    COUNT(*) AS prs_total,
    SUM(pr.id IN (SELECT pull_request_id FROM copilot_prs)) AS prs_with_copilot
  FROM pull_requests pr
  WHERE pr.created_date >= @start
  GROUP BY pr.base_repo_id
)
SELECT
  repo_id,
  prs_total,
  prs_with_copilot,
  ROUND(100 * prs_with_copilot / NULLIF(prs_total,0), 1) AS copilot_coverage_pct
FROM agg
ORDER BY prs_with_copilot DESC
LIMIT 20;
```

---

## If you’re using **GitHub tool tables** (`_tool_github_*`)

Change the joins and field names accordingly. Common ones:

* `_tool_github_pull_requests` (alias `gpr`): `id` (domain id) or `github_id` (native), `repo_id`, `created_at`
* `_tool_github_pull_request_reviews` (alias `grv`): `pull_request_id` (likely **domain id**), `author_login`, `state`, `submitted_at`
* `_tool_github_pull_request_commits` (alias `gpc`): `pull_request_id`, `author_name`, `authored_date`

Example for **Copilot coverage** with tool tables:

```sql
SET @tz := '+05:30';
SET @days_back := 30;
SET @start := UTC_TIMESTAMP() - INTERVAL @days_back DAY;
SET @copilot_login := '%copilot%';

WITH prs AS (
  SELECT gpr.id AS pull_request_id
  FROM _tool_github_pull_requests gpr
  WHERE gpr.created_at >= @start
),
copilot_prs AS (
  SELECT DISTINCT grv.pull_request_id
  FROM _tool_github_pull_request_reviews grv
  WHERE grv.submitted_at >= @start
    AND grv.author_login LIKE @copilot_login
)
SELECT
  (SELECT COUNT(*) FROM prs) AS total_prs,
  (SELECT COUNT(*) FROM copilot_prs) AS prs_with_copilot_review,
  ROUND(100 * (SELECT COUNT(*) FROM copilot_prs) / NULLIF((SELECT COUNT(*) FROM prs),0), 1) AS copilot_coverage_pct;
```

And the **accepted/resolved proxy** using tool tables:

```sql
WITH first_copilot_review AS (
  SELECT grv.pull_request_id, MIN(grv.submitted_at) AS first_copilot_review_at
  FROM _tool_github_pull_request_reviews grv
  WHERE grv.author_login LIKE @copilot_login
  GROUP BY grv.pull_request_id
),
author_commit_after AS (
  SELECT gpc.pull_request_id, MIN(gpc.authored_date) AS first_author_commit_after
  FROM _tool_github_pull_request_commits gpc
  JOIN first_copilot_review fcr ON fcr.pull_request_id = gpc.pull_request_id
  JOIN _tool_github_pull_requests gpr ON gpr.id = gpc.pull_request_id
  WHERE gpc.authored_date > fcr.first_copilot_review_at
    AND TIMESTAMPDIFF(HOUR, fcr.first_copilot_review_at, gpc.authored_date) <= 24
    AND gpc.author_name = gpr.author_name
  GROUP BY gpc.pull_request_id
)
SELECT
  (SELECT COUNT(*) FROM first_copilot_review) AS prs_with_copilot_review,
  (SELECT COUNT(*) FROM author_commit_after) AS prs_with_action_within_24h,
  ROUND(100 * (SELECT COUNT(*) FROM author_commit_after)
        / NULLIF((SELECT COUNT(*) FROM first_copilot_review),0), 1) AS action_rate_24h_pct;
```

---

## Strategic KPIs to show leadership (and how to compute them)

* **Coverage %** = PRs with Copilot review ÷ total PRs (Query #3/#4)
* **Acceptance/Action rate (24h)** = PRs where author commits within 24h after Copilot review ÷ PRs with Copilot review (Query #6)
* **Time-to-first-feedback** (P50/P90) Copilot-first vs Human-first (Query #7)
* **Review state mix**: % commented / % changes_requested / % approved (Query #5)
* **Top repos & teams** by Copilot participation (Query #8)
* **Before/After** (optional): run #7 over two windows (pre-enablement vs post-enablement) to show % reduction in minutes-to-first-review.

---

### Notes & tips

* **Identify Copilot reliably**: If your bot login is custom, replace `@copilot_login` with the exact value (e.g., `'github-copilot[bot]'`). You can **discover** it quickly:

  ```sql
  SELECT DISTINCT author_username, author_name
  FROM pull_request_reviews
  WHERE author_username LIKE '%bot%' OR author_name LIKE '%copilot%';
  ```
* **Timezone**: All queries convert from UTC to IST for grouping.
* **Grafana panels**: Use a **stat** panel for coverage %, **bar** for daily/weekly PRs, **pie** for review states, **table** for top repos.

If you share which exact tables/columns your Grafana datasource is using (domain vs `_tool_github_`), I’ll tailor these to your schema 1:1 and add a **single “All-in-one” SQL** view you can reuse across panels.
