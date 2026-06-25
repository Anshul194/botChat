# PERFORMANCE AUDIT REPORT

**Project:** MegaDM SaaS Platform
**Date:** 2026-06-25
**Scope:** Laravel API + Next.js Frontend

---

## Critical Performance Issues

### P1. calculateMRR() Loads All Active Users Into Memory
- **Severity:** HIGH
- **File:** `app/Http/Controllers/Api/V1/Central/SubscriptionController.php:754-762`
- **Details:**
  ```php
  $activeUsers = User::...->with('plan')->get(); // Loads ALL users
  foreach ($activeUsers as $user) { ... } // PHP iteration
  ```
- **Impact:** At 10K tenants, this loads 10K rows + plans into PHP memory. O(N) memory usage. Will cause OOM on shared hosting.
- **Fix:** Replace with single SQL aggregation:
  ```sql
  SELECT SUM(CASE WHEN duration_type IN ('month','months') THEN price/GREATEST(duration,1)
    WHEN duration_type IN ('year','years') THEN price/GREATEST(duration*12,1)
    ... END) as mrr
  FROM users JOIN plans ON users.plan_id = plans.id
  WHERE users.is_suspended = 0 AND users.plan_expired_date > NOW()
  ```

### P2. N+1 Queries in featureMatrix/usageMatrix
- **Severity:** HIGH
- **File:** `app/Services/PlanService.php:123-168`
- **Details:** For each feature key, `hasFeature()`, `getLimit()`, and `getUsage()` each call `getCurrentPlan()` which runs `Plan::find()`. For a plan with 15 features, this generates 15+ redundant queries.
- **Impact:** 15-30 queries per request instead of 2-3.
- **Fix:** Cache plan instance within the request. Batch usage queries.

### P3. Missing Database Indexes
- **Severity:** HIGH
- **Details:**

| Table | Column | Query Pattern | Index? |
|-------|--------|---------------|--------|
| `orders` | `user_id` | `WHERE user_id = ?` | **NO** |
| `orders` | `payment_status` | `WHERE payment_status = 'success'` | **NO** |
| `orders` | `created_at` | `WHERE created_at >= ?` | **NO** |
| `orders` | `razorpay_order_id` | `WHERE razorpay_order_id = ?` | **NO** |
| `users` | `plan_id` | `WHERE plan_id IS NOT NULL` | **NO** |
| `users` | `is_suspended` | `WHERE is_suspended = ?` | **NO** |
| `users` | `type` | `WHERE type != 'Super Admin'` | **NO** |

- **Impact:** Full table scans on every subscription query, payment verification, and revenue analytics.
- **Fix:** Add indexes via migration:
  ```php
  Schema::table('orders', function (Blueprint $table) {
      $table->index('user_id');
      $table->index('payment_status');
      $table->index(['payment_status', 'created_at']);
      $table->index('razorpay_order_id');
  });
  Schema::table('users', function (Blueprint $table) {
      $table->index('plan_id');
      $table->index('is_suspended');
      $table->index('type');
  });
  ```

---

## High Performance Issues

### P4. Revenue Queries — 4 Separate GROUP BY Scans
- **Severity:** HIGH
- **File:** `SubscriptionController.php:587-621`
- **Details:** `paymentAnalytics()` runs 4 separate GROUP BY queries on the orders table without indexes:
  1. GROUP BY `payment_status`
  2. GROUP BY `payment_type`
  3. GROUP BY `coupon_code`
  4. GROUP BY `DATE_FORMAT(created_at, '%Y-%m')`
- **Impact:** 4 full table scans per request. At 100K orders, each scan takes 1-3 seconds.
- **Fix:** Add composite index `(payment_status, created_at)`. Consider caching or a materialized summary table.

### P5. Revenue Trends — Full Table Scan with Date Fill
- **Severity:** HIGH
- **File:** `SubscriptionController.php:500-550`
- **Details:** Queries all successful orders, groups by date, then fills missing dates in PHP. For 365-day range with 100K orders, this is expensive.
- **Impact:** Slow dashboard load on large datasets.
- **Fix:** Add index `(payment_status, created_at)`. Use SQL date series generation instead of PHP fill.

### P6. Stats Endpoint — Multiple Heavy Queries
- **Severity:** HIGH
- **File:** `SubscriptionController.php:86-143`
- **Details:** `stats()` runs 7 separate queries:
  1. Count all tenants
  2. Count active tenants
  3. Count expired tenants
  4. Count suspended tenants
  5. Count free tenants
  6. Revenue by plan (JOIN + GROUP BY)
  7. Recent revenue (SUM with date filter)
- **Impact:** 7 queries per dashboard load, some without indexes.
- **Fix:** Combine tenant counts into single query with CASE. Add indexes.

### P7. Feature Usage — Redundant Queries Per Feature
- **Severity:** MEDIUM
- **File:** `PlanService.php:107-119`
- **Details:** `getUsage('team_member')` runs `User::where('type', '!=', 'Admin')->count()`. `getUsage('connect_account')` runs 2 separate COUNT queries. These run per-request.
- **Impact:** 3 extra queries per feature check.
- **Fix:** Cache usage counts. Batch aggregate.

### P8. Expiring Soon Query — No Limit Optimization
- **Severity:** MEDIUM
- **File:** `SubscriptionController.php:643-670`
- **Details:** `expiringSoon()` loads all users expiring within N days with `with('plan')`. No limit on result set.
- **Impact:** If 500 tenants expire in 30 days, all 500 are loaded.
- **Fix:** Add `->limit(50)` and pagination.

### P9. Top Tenants — JOIN Without Index
- **Severity:** MEDIUM
- **File:** `SubscriptionController.php:676-710`
- **Details:** `topTenants()` joins orders + users + plans, groups by user. Without indexes on `orders.user_id`, this is a full scan.
- **Impact:** Slow on large order tables.
- **Fix:** Add `orders.user_id` index.

---

## Medium Performance Issues

### P10. No Query Caching
- **Severity:** MEDIUM
- **Details:** No Redis/file caching for expensive queries (MRR, revenue stats, feature matrix). Every request recomputes.
- **Fix:** Cache MRR/stats for 5-10 minutes. Cache feature matrix per plan.

### P11. No Pagination on Some Endpoints
- **Severity:** MEDIUM
- **File:** `SubscriptionController.php:643` (expiringSoon)
- **Details:** Returns all matching records without pagination.
- **Fix:** Add limit and pagination.

### P12. Eloquent vs Query Builder
- **Severity:** LOW
- **Details:** Some heavy queries use Eloquent ORM instead of Query Builder. Eloquent adds overhead for hydration.
- **Fix:** Use `select()` + `get()` for analytics queries instead of full model hydration.

### P13. No Database Connection Pooling
- **Severity:** LOW
- **Details:** Each request opens a new DB connection. No persistent connections configured.
- **Fix:** Enable persistent connections in MySQL config.

---

## Frontend Performance

### F1. No Loading Skeletons
- **Severity:** MEDIUM
- **Files:** `FeatureGate.tsx`, `PlanExpiredBanner.tsx`, `UsageCard.tsx`
- **Details:** Components return `null` during loading, causing layout shifts.
- **Fix:** Add skeleton placeholders.

### F2. 1-Hour API Timeout
- **Severity:** MEDIUM
- **File:** `lib/api.ts:6`
- **Details:** `timeout: 3600000` — client waits an hour on server hang.
- **Fix:** Set to 30 seconds.

### F3. No Request Deduplication
- **Severity:** LOW
- **File:** `store/slices/subscriptionSlice.ts:100-117`
- **Details:** `fetchSubscription` can be called multiple times rapidly without deduplication.
- **Fix:** Add request deduplication middleware.

---

## Performance Score

| Area | Score |
|------|-------|
| Database Queries | 4/10 |
| Indexing | 2/10 |
| Caching | 1/10 |
| Memory Usage | 5/10 |
| Frontend Loading | 6/10 |
| API Response Time | 5/10 |
| **Overall** | **3.8/10** |

---

## Priority Fixes

1. **Immediate:** Add missing database indexes (P3)
2. **Immediate:** Rewrite calculateMRR() to SQL (P1)
3. **This week:** Fix N+1 in featureMatrix (P2)
4. **This week:** Add composite indexes for revenue queries (P4, P5)
5. **This sprint:** Add query caching for expensive endpoints (P10)
6. **This sprint:** Combine stats queries (P6)
