Great question — in DevLake/GitHub schemas the Copilot reviewer often isn’t a literal string in the review rows. You typically have to **join to the accounts table** (domain or tool) and/or look in **review comments / check runs**. Here’s a tight, do-this-next plan with copy-paste SQL.

---

# 1) Find how Copilot appears in *your* data (do this first)

### Domain tables (preferred)

```sql
-- Last 30 days: who authored PR REVIEWS?
SELECT a.id, a.username, a.name, a.type, a.is_bot, COUNT(*) AS reviews
FROM pull_request_reviews r
JOIN accounts a ON a.id = r.author_id
WHERE r.created_date >= NOW() - INTERVAL 30 DAY
GROUP BY a.id, a.username, a.name, a.type, a.is_bot
ORDER BY reviews DESC;
```

### Tool tables (if you’re using `_tool_github_*`)

```sql
-- Last 30 days: reviewers from tool tables
SELECT COALESCE(ga.login, grv.author_login) AS login,
       ga.type, ga.is_bot, COUNT(*) AS reviews
FROM _tool_github_pull_request_reviews grv
LEFT JOIN _tool_github_accounts ga ON ga.id = grv.reviewer_id
WHERE grv.submitted_at >= NOW() - INTERVAL 30 DAY
GROUP BY login, ga.type, ga.is_bot
ORDER BY reviews DESC;
```

> You’re looking for rows like **`github-copilot[bot]`**, **`github-copilot`**, **`GitHub Copilot`**, or an App account. Sometimes it’s stored only in **`accounts`** with `is_bot=1`.

If nothing obvious shows up, also check **review comments** and **check runs**:

```sql
-- PR REVIEW COMMENTS (domain)
SELECT a.username, a.name, a.is_bot, COUNT(*) comments
FROM pull_request_review_comments c
JOIN accounts a ON a.id = c.author_id
WHERE c.created_date >= NOW() - INTERVAL 30 DAY
GROUP BY a.username, a.name, a.is_bot
ORDER BY comments DESC;

-- GitHub Checks (tool), Copilot sometimes shows up here by name
SELECT cr.name, cr.conclusion, COUNT(*) cnt
FROM _tool_github_check_runs cr
WHERE cr.started_at >= NOW() - INTERVAL 30 DAY
  AND (cr.name LIKE '%Copilot%' OR cr.name LIKE '%AI%')
GROUP BY cr.name, cr.conclusion
ORDER BY cnt DESC;
```

---

# 2) Once you identify the Copilot actor, calculate **“PRs reviewed by Copilot”**

### Domain tables version (use the `accounts.id` you found)

```sql
-- Set your Copilot account ids (discover via Step 1)
SET @copilot_ids := '123,456';  -- comma-separated accounts.id for Copilot

-- PRs with at least one Copilot review in last 30 days
SELECT
  COUNT(DISTINCT r.pull_request_id) AS prs_with_copilot_review
FROM pull_request_reviews r
WHERE r.created_date >= NOW() - INTERVAL 30 DAY
  AND FIND_IN_SET(r.author_id, @copilot_ids);
```

Daily breakdown:

```sql
SELECT
  DATE(CONVERT_TZ(r.created_date,'+00:00','+05:30')) AS day_ist,
  COUNT(DISTINCT r.pull_request_id) AS prs_with_copilot_review
FROM pull_request_reviews r
WHERE r.created_date >= NOW() - INTERVAL 30 DAY
  AND FIND_IN_SET(r.author_id, @copilot_ids)
GROUP BY day_ist
ORDER BY day_ist;
```

### Tool tables version (use login you found)

```sql
SET @copilot_login := 'github-copilot[bot]';

SELECT
  COUNT(DISTINCT grv.pull_request_id) AS prs_with_copilot_review
FROM _tool_github_pull_request_reviews grv
WHERE grv.submitted_at >= NOW() - INTERVAL 30 DAY
  AND (grv.author_login = @copilot_login
       OR EXISTS (
         SELECT 1
         FROM _tool_github_accounts ga
         WHERE ga.id = grv.reviewer_id
           AND (ga.login = @copilot_login OR ga.name LIKE '%Copilot%')
       ));
```

---

# 3) “Accepted/Resolved” proxy (action taken after Copilot review)

```sql
-- DOMAIN tables: author commits within 24h after first Copilot review
WITH first_copilot AS (
  SELECT r.pull_request_id, MIN(r.created_date) AS first_copilot_ts
  FROM pull_request_reviews r
  WHERE FIND_IN_SET(r.author_id, @copilot_ids)
    AND r.created_date >= NOW() - INTERVAL 30 DAY
  GROUP BY r.pull_request_id
),
author_commit AS (
  SELECT prc.pull_request_id, MIN(prc.authored_date) AS first_author_commit_after
  FROM pull_request_commits prc
  JOIN pull_requests pr ON pr.id = prc.pull_request_id
  JOIN first_copilot fc ON fc.pull_request_id = prc.pull_request_id
  WHERE prc.authored_date > fc.first_copilot_ts
    AND TIMESTAMPDIFF(HOUR, fc.first_copilot_ts, prc.authored_date) <= 24
    AND prc.author_name = pr.author_name
  GROUP BY prc.pull_request_id
)
SELECT
  (SELECT COUNT(*) FROM first_copilot) AS prs_with_copilot_review,
  (SELECT COUNT(*) FROM author_commit) AS prs_with_action_24h,
  ROUND(100 * (SELECT COUNT(*) FROM author_commit) /
        NULLIF((SELECT COUNT(*) FROM first_copilot),0), 1) AS action_rate_24h_pct;
```

---

# 4) Total PRs vs Copilot-reviewed PRs (coverage)

```sql
WITH prs AS (
  SELECT id
  FROM pull_requests
  WHERE created_date >= NOW() - INTERVAL 30 DAY
),
copilot_prs AS (
  SELECT DISTINCT r.pull_request_id
  FROM pull_request_reviews r
  WHERE FIND_IN_SET(r.author_id, @copilot_ids)
    AND r.created_date >= NOW() - INTERVAL 30 DAY
)
SELECT
  (SELECT COUNT(*) FROM prs) AS total_prs,
  (SELECT COUNT(*) FROM copilot_prs) AS prs_with_copilot_review,
  ROUND(100 * (SELECT COUNT(*) FROM copilot_prs) / NULLIF((SELECT COUNT(*) FROM prs),0), 1) AS coverage_pct;
```

---

## Why you didn’t see “copilot” in review tables

* DevLake stores reviewer identity via **foreign key** → `accounts` (domain) or `_tool_github_accounts` (tool).
* The literal string may be blank in review rows; you must **join** to the accounts table, or match by account **id/login/name** discovered in Step 1.
* In some orgs, Copilot reviews appear as **review comments** or **check runs** (hence those extra discovery queries).

---

If you paste the **top discovery query results** (usernames/names that look like Copilot), I’ll plug them into a single consolidated SQL you can drop into Grafana and get all KPIs (daily PRs, Copilot-reviewed PRs, action-within-24h, state mix) in one go.
