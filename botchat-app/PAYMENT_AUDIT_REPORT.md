# PAYMENT AUDIT REPORT

**Project:** MegaDM SaaS Platform
**Date:** 2026-06-25
**Scope:** Razorpay integration, payment flow, order management

---

## Payment Flow Summary

```
1. Client → POST /payment/initiate { plan_id, coupon_code? }
2. Server → Creates Razorpay order + local Order record (status: pending)
3. Server → Returns { order_id, razorpay_key }
4. Client → Opens Razorpay checkout widget
5. User → Completes payment in Razorpay
6. Client → POST /payment/razorpay/verify { razorpay_payment_id, razorpay_order_id, razorpay_signature }
7. Server → Verifies signature → Marks order paid → Assigns plan
```

---

## Critical Findings

### PAY1. Webhook Route Not Registered — Dead Code
- **Severity:** CRITICAL
- **File:** `PaymentController.php:180` defines `webhook()` method
- **File:** `routes/api/v1/tenant.php:863-865` — only `initiate`, `verify`, `history` registered
- **Details:** The Razorpay webhook handler is fully implemented but has no route. Razorpay webhook notifications will return 404.
- **Impact:**
  - If user closes browser after payment but before `verify()` is called, payment is permanently lost
  - No server-side confirmation of payment
  - Single point of failure: client-side verify is the only path
- **Fix:** Register the webhook route in `routes/api/v1/central.php`:
  ```php
  Route::post('/payment/razorpay/webhook', [PaymentController::class, 'webhook'])
      ->withoutMiddleware([/* tenancy middleware */]);
  ```

### PAY2. Race Condition — Double Plan Assignment
- **Severity:** HIGH
- **File:** `PaymentController.php:107-153`
- **Details:**
  ```php
  $order = Order::where('razorpay_order_id', $razorpayOrderId)->first(); // Line 107
  if ($order->status === 1) return success; // Line 116-118
  // ... gap ...
  DB::beginTransaction(); // Line 141
  // Both concurrent requests can pass the status check before either commits
  ```
- **Impact:** Two concurrent verify requests for the same order can both:
  1. Pass the `status === 1` check
  2. Enter the transaction
  3. Both call `markOrderPaid()` and `assignPlan()`
  4. Result: Double plan assignment, double coupon usage
- **Fix:** Use `SELECT ... FOR UPDATE` on the order query:
  ```php
  $order = Order::where('razorpay_order_id', $razorpayOrderId)->lockForUpdate()->first();
  ```

### PAY3. Race Condition — Duplicate Coupon Usage
- **Severity:** HIGH
- **File:** `PlanSubscriptionService.php:35-37, 90-106`
- **Details:**
  ```php
  $usedCount = UserCoupon::where('coupon_id', $coupon->id)->count();
  if ($usedCount >= $coupon->limit) return error; // Line 35-37
  // ... gap ...
  UserCoupon::create([...]); // Line 90-106
  ```
- **Impact:** Concurrent requests can both pass the limit check and both record usage, exceeding the coupon limit.
- **Fix:** Use atomic increment or `SELECT ... FOR UPDATE` on coupon usage check.

---

## High Findings

### PAY4. No Amount Validation in verify()
- **Severity:** HIGH
- **File:** `PaymentController.php:99-175`
- **Details:** The `verify()` method validates the Razorpay signature but does NOT verify that the order amount matches the plan price. If the Razorpay order was created with a manipulated amount, the server would accept it.
- **Mitigation:** The `initiate()` method computes amount server-side from `$plan->price`, so the amount is correct at creation. However, there's no verification in `verify()` that the Razorpay-captured amount matches.
- **Fix:** Add amount verification:
  ```php
  $expectedAmount = $order->amount;
  // Verify against Razorpay API: $razorpay->orders->fetch($orderId)
  ```

### PAY5. No Plan Active Check Before Purchase
- **Severity:** HIGH
- **File:** `PaymentController.php:29-45`
- **Details:** `initiate()` validates the plan exists but doesn't check if the plan is active/enabled. A disabled plan can still be purchased.
- **Fix:** Add `$this->error('This plan is not available.')` if `$plan->status != 1`.

### PAY6. No Cleanup of Stale Pending Orders
- **Severity:** HIGH
- **File:** `app/Console/Kernel.php:19-33`
- **Details:** Orders created via `initiate()` remain in `pending` status forever if the user never completes payment. No cron job cleans them up.
- **Impact:**
  - Database bloat (unlimited pending orders)
  - No limit on how many pending orders a user can create
  - Razorpay orders expire after 15 minutes but local records persist
- **Fix:** Add scheduled job:
  ```php
  Schedule::command('orders:cleanup-stale')->daily();
  ```

### PAY7. No Rate Limiting on Payment Endpoints
- **Severity:** MEDIUM
- **File:** `routes/api/v1/tenant.php:863-865`
- **Details:** Payment routes have no specific rate limiting beyond global 120 req/min.
- **Impact:**
  - `initiate()` can create 120 pending orders per minute (resource exhaustion)
  - `verify()` can be called 120 times per minute
- **Fix:** Add `throttle:5,1` (5 requests per minute) to payment routes.

---

## Medium Findings

### PAY8. Missing payment.refunded Webhook Handler
- **Severity:** MEDIUM
- **File:** `PaymentController.php:208,252-257`
- **Details:** Only `payment.captured`, `order.paid`, and `payment.failed` are handled. `payment.refunded` is not handled.
- **Impact:** Refunds don't revoke plan access. User keeps the plan after refund.
- **Fix:** Add refund handler that downgrades or suspends the user's plan.

### PAY9. No Payment Retry Mechanism
- **Severity:** MEDIUM
- **File:** `PaymentController.php:252-257`
- **Details:** When `payment.failed` is received, the order is marked as failed. No retry, no notification, no follow-up.
- **Impact:** Revenue loss from abandoned failed payments.
- **Fix:** Send failure notification (already implemented in Phase 11). Add retry button in frontend.

### PAY10. Order Status Field Redundancy
- **Severity:** MEDIUM
- **File:** `orders` table
- **Details:** Orders have both `status` (integer) and `payment_status` (string) fields. `status` is set to `1` on success, but `payment_status` is the primary field used in queries.
- **Impact:** Confusion about which field to check. Some queries use `status`, others use `payment_status`.
- **Fix:** Standardize on `payment_status` and deprecate `status` field.

### PAY11. Coupon Validation — No Active Check
- **Severity:** MEDIUM
- **File:** `PlanSubscriptionService.php:28-33`
- **Details:** Coupon is fetched but there's no check if `$coupon->status == 1` (active). A disabled coupon can still be applied.
- **Fix:** Add status check.

---

## Low Findings

### PAY12. No Nonce/Timestamp on verify Endpoint
- **Severity:** LOW
- **Details:** No nonce or timestamp to prevent replay attacks. Razorpay signatures are unique per payment, providing some protection.
- **Fix:** Add request nonce for defense-in-depth.

### PAY13. No Idempotency Key in initiate
- **Severity:** LOW
- **Details:** Calling `initiate()` twice with the same `plan_id` creates two separate orders. This is expected behavior but could confuse users.
- **Fix:** Consider idempotency key for order creation.

---

## Razorpay Integration Audit

| Check | Status | Notes |
|-------|--------|-------|
| Signature verification | ✅ PASS | Properly uses Razorpay SDK |
| Webhook route registered | ❌ FAIL | Route missing — dead code |
| Webhook signature verification | ✅ PASS | Properly implemented (but unreachable) |
| Payment failure handling | ⚠️ PARTIAL | Only marks as failed, no retry |
| Refund handling | ❌ FAIL | Not implemented |
| Amount verification | ⚠️ PARTIAL | Server computes amount but doesn't verify in verify() |
| Order status check | ✅ PASS | Checks status before processing |
| Rate limiting | ❌ FAIL | No specific rate limiting |
| Pending order cleanup | ❌ FAIL | No cleanup mechanism |

---

## Payment Security Score

| Area | Score |
|------|-------|
| Signature Verification | 9/10 |
| Idempotency | 4/10 |
| Amount Validation | 6/10 |
| Race Condition Protection | 3/10 |
| Webhook Handling | 2/10 |
| Error Recovery | 4/10 |
| **Overall** | **4.7/10** |

---

## Priority Fixes

1. **Immediate:** Register webhook route (PAY1)
2. **Immediate:** Fix race conditions with SELECT FOR UPDATE (PAY2, PAY3)
3. **This week:** Add pending order cleanup cron (PAY6)
4. **This week:** Add amount verification in verify() (PAY4)
5. **This week:** Add rate limiting to payment routes (PAY7)
6. **This sprint:** Add refund webhook handler (PAY8)
7. **This sprint:** Add plan active check before purchase (PAY5)
