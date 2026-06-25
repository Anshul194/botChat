# TENANT ISOLATION REPORT

**Project:** MegaDM SaaS Platform
**Date:** 2026-06-25
**Scope:** Multi-tenant data isolation, cross-tenant access, route security

---

## Architecture Overview

The platform uses **database-per-tenant** isolation via `stancl/tenancy`:
- Central database: users, plans, orders, settings
- Tenant database: bot replies, posts, contacts, broadcasts, etc.
- Tenant identified by `tenant_id` on User model + domain-based resolution

---

## Critical Isolation Issues

### T1. NULL-Plan Users Bypass All Restrictions
- **Severity:** CRITICAL
- **File:** `app/Services/PlanService.php:52-55, 73-76`
- **Details:**
  - `hasFeature()` returns `true` when `$plan` is null (no plan assigned)
  - `getLimit()` returns `-1` (unlimited) when `$plan` is null
  - `isExpired()` returns `false` when `plan_expired_date` is null
- **Impact:** Any user with `plan_id = NULL` gets ALL features enabled, unlimited usage, and is never considered expired. This applies to:
  - New users who haven't selected a plan
  - Users whose plan was deleted
  - Users manually set to free tier
- **Attack Vector:** If an attacker can set `plan_id = NULL` on their account (via mass assignment or API), they bypass all billing.
- **Fix:** `hasFeature()` should return `false` when no plan. `getLimit()` should return `0` when no plan.

### T2. is_suspended Not Enforced in Middleware
- **Severity:** CRITICAL
- **Details:** The `is_suspended` field exists on the User model but NO middleware checks it. Suspended users can:
  - Authenticate via Sanctum
  - Access all API endpoints
  - Use all features
  - Make payments
- **Attack Vector:** Admin suspends a user, but the user continues using the service.
- **Fix:** Create `CheckSuspended` middleware that blocks suspended users.

### T3. Cross-Tenant Data Access via Email Lookup
- **Severity:** HIGH
- **File:** `SubscriptionController.php:240-248`
- **Details:** Tenant sync uses `User::where('email', $user->email)->first()` within the tenant database. If email is not unique across tenants (possible with different tenant DBs), this could match the wrong user.
- **Impact:** Plan assignment could sync to wrong tenant user.
- **Fix:** Use `tenant_id` + `email` for lookup, or use user ID mapping.

---

## High Isolation Issues

### T4. Orders Not Filtered by Tenant
- **Severity:** HIGH
- **File:** `PaymentController.php`, `SubscriptionController.php`
- **Details:** The `orders` table is in the central database. Orders have `tenant_id` column but it's nullable. Queries like `Order::where('user_id', $id)` don't verify tenant context.
- **Impact:** In theory, if order IDs are sequential, a user could query other users' orders via the API. However, the API does filter by `user_id` in most cases.
- **Fix:** Add tenant_id filter to all order queries.

### T5. Feature Usages — Tenant ID Nullable
- **Severity:** HIGH
- **File:** `database/migrations/2026_06_24_000001_create_feature_usages_table.php:13`
- **Details:** `tenant_id` is nullable. Records can exist without tenant context.
- **Impact:** Usage records could leak between tenants if tenant_id is not set.
- **Fix:** Make tenant_id required or ensure it's always set.

### T6. User Deletion Doesn't Clean Up Related Records
- **Severity:** HIGH
- **File:** `app/Http/Controllers/Api/V1/Central/UserController.php:264-286`
- **Details:** `UserController::destroy()` deletes the user but doesn't clean up:
  - `orders` table (orphaned orders)
  - `feature_usages` table (orphaned usage)
  - `notifications` table (orphaned notifications)
  - `user_notification_preferences` (orphaned prefs)
- **Impact:** Orphaned records accumulate. Other users' queries may return stale data.
- **Fix:** Add cascade deletes or soft deletes with cleanup job.

### T7. PlanService Fallback to Admin User
- **Severity:** HIGH
- **File:** `app/Services/PlanService.php:181-186`
- **Details:** If a tenant user has no `plan_id`, the system falls back to the first Admin user's plan.
- **Impact:** Tenant users silently inherit Admin plan limits, which may be more permissive than intended.
- **Fix:** Remove fallback. Return null plan for users without plans.

---

## Medium Isolation Issues

### T8. No CSRF on API Routes (Expected)
- **Severity:** MEDIUM (Informational)
- **Details:** API routes use Sanctum token auth, not session-based CSRF. This is correct for API usage but verify SPA mode configuration.

### T9. Sanctum SPA Mode Configuration
- **Severity:** MEDIUM
- **Details:** If Sanctum is configured for SPA mode (cookie-based), cross-origin requests could be vulnerable. Verify `config/sanctum.php` uses `stateful` domains correctly.

### T10. Tenant Database Provisioning
- **Severity:** MEDIUM
- **File:** `app/Jobs/CreateDatabase.php`
- **Details:** Tenant databases are created via Artisan command. If the provisioning job fails midway, partial databases could exist.
- **Fix:** Add rollback logic on provisioning failure.

---

## Route Security Analysis

### Dashboard Guards (Next.js)
- **File:** `app/dashboard/layout.tsx:167-179`
- **Route mapping:** Routes are mapped to feature keys via `getRouteFeature()`
- **Guard logic:** `canAccess(routeFeature)` is checked; if false, redirects to `/dashboard/billing`
- **Expired guard:** Users with expired plans are blocked from all routes except billing/profile
- **Assessment:** WORKING — but only covers routes in the map. New routes added without updating the map bypass the guard.

### Billing Guards
- **File:** `app/dashboard/layout.tsx:13`
- **Details:** `EXPIRED_ALLOWED_PATHS = ["/dashboard/billing", "/dashboard/profile"]`
- **Assessment:** WORKING — expired users can access billing.

### Feature Gates
- **File:** `components/subscription/FeatureGate.tsx`
- **Details:** Wraps content, checks `canAccess(feature)`. During loading, returns `null`.
- **Assessment:** WORKING — but no retry on API failure.

### Sidebar Permissions
- **File:** `components/layout/Sidebar.tsx`
- **Details:** Nav items use `canAccess()` and `canShow()` to conditionally render.
- **Assessment:** WORKING — but only controls visibility, not URL access.

### Direct URL Access Attempt
- **Test:** Access `/dashboard/broadcasts` when `broadcast` feature is disabled
- **Result:** Layout guard redirects to `/dashboard/billing` ✅
- **Test:** Access `/dashboard/billing` when plan is expired
- **Result:** Page loads correctly ✅
- **Test:** Access `/dashboard/superadmin/subscriptions` as non-superadmin
- **Result:** NOT TESTED — no middleware on frontend routes for role check (relies on API returning 403)

---

## Cross-Tenant Access Attempt Analysis

### ID Tampering
- **Scenario:** User changes `user_id` in API request body
- **Protection:** Most endpoints use `$request->user()->id` from auth token, not request body
- **Vulnerable endpoints:** Any endpoint that accepts `user_id` from request body instead of auth token
- **Assessment:** LOW RISK — auth token is primary identity source

### Route Tampering
- **Scenario:** User accesses `/api/v1/subscriptions/{otherUserId}`
- **Protection:** SubscriptionController checks ownership in some methods but not all
- **Vulnerable:** `show()`, `paymentHistory()`, `usageReport()`, `timeline()` accept any ID
- **Assessment:** MEDIUM RISK — these endpoints return data for any user ID, not just the authenticated user

### Tenant ID Tampering
- **Scenario:** User modifies `tenant_id` in request
- **Protection:** Tenant is resolved from domain, not request body
- **Assessment:** LOW RISK — domain-based tenant resolution is secure

---

## Isolation Score

| Area | Score |
|------|-------|
| Data Isolation | 6/10 |
| Authentication | 7/10 |
| Authorization | 4/10 |
| Route Protection | 6/10 |
| Cross-Tenant Prevention | 5/10 |
| **Overall** | **5.6/10** |

---

## Priority Fixes

1. **Immediate:** Fix NULL-plan bypass (T1)
2. **Immediate:** Enforce is_suspended in middleware (T2)
3. **This week:** Fix PlanService fallback (T7)
4. **This week:** Add tenant_id to feature_usages as required (T5)
5. **This sprint:** Clean up orphaned records on user deletion (T6)
6. **This sprint:** Add ownership checks to subscription endpoints (Route Tampering)
