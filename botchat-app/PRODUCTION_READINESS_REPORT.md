# PRODUCTION READINESS REPORT

**Project:** MegaDM SaaS Platform
**Date:** 2026-06-25
**Auditor:** Automated Production Audit

---

## Executive Summary

The platform has a solid architectural foundation with multi-tenancy, subscription billing, and feature gating. However, several critical security and billing issues must be resolved before production deployment.

---

## Scores

| Category | Score | Status |
|----------|-------|--------|
| Security | 4/10 | NOT READY |
| Billing | 5/10 | NOT READY |
| Subscription | 5/10 | NOT READY |
| Tenant Isolation | 7/10 | NEEDS WORK |
| Performance | 5/10 | NEEDS WORK |
| Frontend | 7/10 | ACCEPTABLE |
| APIs | 6/10 | NEEDS WORK |
| **Overall** | **5.6/10** | **NOT PRODUCTION READY** |

---

## CRITICAL — Must Fix Before Go-Live

### C1. Exposed Secrets in .env
- **File:** `.env:3,12,17`
- `APP_KEY`, `RESEND_API_KEY`, `OPENAI_API_KEY` committed to repo
- `DB_PASSWORD` is empty, `DB_USERNAME=root`
- **Impact:** Full system compromise if repo is public or leaked
- **Fix:** Rotate all keys, use environment variables, never commit .env

### C2. Unprotected Admin Endpoints
- **File:** `routes/api/v1/central.php:45-66`
- `GET /run-queue-jobs` — executes queue jobs, no auth
- `GET /clear-config` — clears cache/config, no auth
- **Impact:** Anyone can trigger queue processing or disrupt service
- **Fix:** Remove or wrap in auth:sanctum + api.superadmin middleware

### C3. Webhook Route Not Registered
- **File:** `PaymentController.php:180` vs `routes/api/v1/tenant.php:863-865`
- Razorpay webhook handler exists but has no route — dead code
- **Impact:** Payments confirmed only via client-side verify; browser close = lost payment
- **Fix:** Register the webhook route in central.php

### C4. is_suspended Not Enforced
- **File:** No middleware checks `is_suspended`
- Suspended users can still authenticate and access all endpoints
- **Fix:** Create `CheckSuspended` middleware, add to route groups

### C5. NULL-Plan Users Get All Features
- **File:** `PlanService.php:52-55, 73-76`
- `hasFeature()` returns `true` when no plan exists
- `getLimit()` returns `-1` (unlimited) when no plan exists
- **Impact:** Users without plans bypass all feature gates
- **Fix:** Return `false` from `hasFeature()` when plan is null

### C6. 50+ Routes Have Zero Plan Middleware
- **File:** `routes/api/v1/tenant.php:202-332, 359-373, 413-432, 472-473, 559-589, 707-738`
- Bot replies, action bots, persistent menus, posts, auto-reply templates, file links, event links — all unprotected
- **Fix:** Add `plan.active` + appropriate `plan.feature:*` middleware

### C7. 6 Feature Keys Missing from plan_features Seed
- `facebook`, `instagram`, `comment_automation`, `broadcast`, `social_posting`, `live_chat` used in middleware but never seeded
- **Impact:** `hasFeature()` returns `false` for all users on these features
- **Fix:** Seed these keys in plan_features migration

### C8. incrementUsage Never Called
- **File:** `PlanService.php:98` (defined, unused)
- Usage limits are checked but never incremented — always zero
- **Impact:** `connect_account` limit middleware is dead code
- **Fix:** Call `incrementUsage` in relevant controllers after resource creation

### C9. Generic Settings Endpoint Has No Validation
- **File:** `SettingsController.php:60-68`
- `PATCH /api/v1/settings` stores `$request->all()` with zero validation
- **Impact:** Attacker can overwrite APP_KEY, DB credentials, any setting
- **Fix:** Whitelist allowed keys, validate types

---

## HIGH — Fix Before Production

| # | Finding | File |
|---|---------|------|
| H1 | Race condition: double plan assignment on concurrent verify | `PaymentController.php:107,116,141` |
| H2 | Race condition: duplicate coupon usage | `PlanSubscriptionService.php:35,90` |
| H3 | No cleanup of stale pending orders | `Kernel.php:19-33` |
| H4 | User model `$fillable` includes `id` — allows ID spoofing | `User.php:28` |
| H5 | User role injection via `$request->roles` | `UserController.php:183-185` |
| H6 | XSS via unescaped `{!! !!}` in Blade views | Multiple blade files |
| H7 | Orders table has no index on `user_id` | Migration 2021_09_29 |
| H8 | Users table has no index on `plan_id` | Migration 2021_09_29 |
| H9 | `calculateMRR()` loads all users into memory | `SubscriptionController.php:754` |
| H10 | `decrementUsage` never called — deleted items don't free quota | `PlanService.php:105` |
| H11 | Backend ignores tenant timezone setting | `config/app.php:72` |
| H12 | 7 superadmin components hardcode INR currency | Multiple files |
| H13 | User notification preferences never checked before sending email | All notification classes |
| H14 | No 401/403 interceptor in frontend API client | `lib/api.ts:53` |

---

## MEDIUM — Recommended Fixes

| # | Finding | File |
|---|---------|------|
| M1 | Coupon limit race condition | `PlanSubscriptionService.php:35` |
| M2 | No rate limiting on payment endpoints | `routes/api/v1/tenant.php:863` |
| M3 | Missing payment.refunded webhook handler | `PaymentController.php:208` |
| M4 | Feature usage never resets per period | `feature_usages` migration |
| M5 | `plan_expired_date` not cast as `date` | `User.php:57` |
| M6 | `subscriptionUser()` fallback to Admin plan | `PlanService.php:181` |
| M7 | 1-hour API timeout on frontend | `lib/api.ts:6` |
| M8 | Token stored in localStorage (XSS vulnerable) | `lib/api.ts:25` |
| M9 | No cascade deletes for orders/user on user deletion | `UserController.php:264` |
| M10 | `config('app.locale')` hardcoded, never tenant-aware | `config/app.php:85` |
| M11 | N+1 queries in featureMatrix/usageMatrix | `PlanService.php:123-168` |
| M12 | Revenue queries missing composite indexes | `orders` table |

---

## LOW — Nice-to-Have

| # | Finding |
|---|---------|
| L1 | No payment retry mechanism for failed payments |
| L2 | No nonce/timestamp on verify endpoint |
| L3 | No loading skeletons in FeatureGate components |
| L4 | Error state overwritten by last failure in subscriptionSlice |
| L5 | No skeleton/spinner in notification bell |
| L6 | Duplicate API call risk (no deduplication in fetchSubscription) |

---

## Go-Live Recommendation

### BLOCKER — Do Not Deploy Until Fixed

1. Rotate all exposed secrets (.env keys)
2. Remove unprotected `/run-queue-jobs` and `/clear-config` endpoints
3. Register Razorpay webhook route
4. Enforce `is_suspended` in middleware
5. Fix NULL-plan user bypass in PlanService
6. Add plan middleware to all unprotected routes
7. Seed missing feature keys
8. Validate settings update endpoint
9. Add database indexes on `orders.user_id`, `orders.payment_status`, `users.plan_id`

### RECOMMENDED — Fix Within First Sprint

1. Fix race conditions in payment verification (SELECT FOR UPDATE)
2. Add pending order cleanup cron
3. Remove `id` from User $fillable
4. Add 401/403 frontend interceptor
5. Fix currency/timezone inconsistencies

### NICE-TO-HAVE — Technical Debt

1. Call incrementUsage/decrementUsage in controllers
2. Add period-based usage reset
3. Cache calculateMRR()
4. Add loading skeletons to subscription components
5. Implement payment retry mechanism
