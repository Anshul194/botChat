# SECURITY AUDIT REPORT

**Project:** MegaDM SaaS Platform
**Date:** 2026-06-25
**Scope:** Laravel API + Next.js Frontend

---

## Critical Findings

### S1. Exposed Secrets in Version Control
- **Severity:** CRITICAL
- **Files:** `.env:3,12,17,34-35,86-88,100`
- **Details:**
  - `APP_KEY=base64:xKeWQ4B8PgYuint26P8j4KWmpqwKM6qDQJ4f75GP12A=`
  - `RESEND_API_KEY=re_bWfMRj2w_JDhDcNGAhduuFBkFDtuZ1wvb`
  - `OPENAI_API_KEY=sk-proj-gGXkbKcqYuWZd5OGiGpRdGA6bazGrM4Xb6mB-3R-9SqOV...`
  - `DB_USERNAME=root`, `DB_PASSWORD=` (empty)
  - `REVERB_APP_KEY=smart_inbox_key`, `SOCKET_SECRET=TESTSOCKET`
- **Impact:** Full system compromise. Database access, email sending, AI API abuse.
- **Remediation:** Rotate all keys immediately. Add `.env` to `.gitignore`. Use CI/CD environment variables.

### S2. Unprotected Dangerous Endpoints
- **Severity:** CRITICAL
- **File:** `routes/api/v1/central.php:45-66`
- **Details:**
  - `GET /api/v1/run-queue-jobs` — Executes Artisan `queue:work` with no authentication
  - `GET /api/v1/clear-config` — Clears config and cache with no authentication
- **Impact:** Anyone can trigger queue processing or cause service disruption.
- **Remediation:** Remove both endpoints or wrap in `auth:sanctum` + `api.superadmin` middleware.

### S3. Generic Settings Endpoint — No Validation
- **Severity:** CRITICAL
- **File:** `app/Http/Controllers/Api/V1/Central/SettingsController.php:60-68`
- **Details:**
  ```php
  public function update(Request $request) {
      foreach ($request->all() as $key => $value) {
          Setting::updateOrCreate(['key' => $key], ['value' => $value]);
      }
  }
  ```
- **Impact:** Attacker can overwrite `APP_KEY`, `DB_PASSWORD`, `MAIL_PASSWORD`, `RAZORPAY_SECRET`, or any system setting.
- **Remediation:** Whitelist allowed keys. Validate types. Add authorization check.

### S4. Mass Assignment — User ID Spoofing
- **Severity:** CRITICAL
- **File:** `app/Models/User.php:28-50`
- **Details:** `$fillable` includes `id`, `type`, `plan_id`, `tenant_id`, `active_status`, `is_suspended`
- **Impact:** If any controller passes unfiltered request data to `User::create()` or `$user->update()`, attacker can:
  - Set `id` to any value (ID spoofing)
  - Set `type` to `Super Admin` (privilege escalation)
  - Set `is_suspended = false` (bypass suspension)
- **Remediation:** Remove `id` from `$fillable`. Use Form Request classes. Validate `type` field.

### S5. Role Injection via UserController
- **Severity:** CRITICAL
- **File:** `app/Http/Controllers/Api/V1/Central/UserController.php:157-258`
- **Details:**
  - Line 183: `$user->type = $request->type;` — no validation that type is valid
  - Line 185: `$user->assignRole($request->roles)` — no validation that role exists
- **Impact:** Attacker can assign `SuperAdmin` role to any user.
- **Remediation:** Validate `type` against allowed values. Validate roles exist before assigning.

---

## High Findings

### S6. XSS via Unescaped Blade Output
- **Severity:** HIGH
- **Files:** Multiple blade templates using `{!! !!}`
- **Details:** 1284 instances of unescaped output. While most are Form helpers (auto-escape), settings values like `app_name` are rendered via `{!! Form::text('app_name', Utility::getsettings('app_name')) !!}`.
- **Impact:** Stored XSS if attacker overwrites `app_name` via the generic settings endpoint.
- **Remediation:** Fix S3 (settings validation). Use `{{ }}` instead of `{!! !!}` where possible.

### S7. Unprotected Route — /run-queue-jobs
- **Severity:** HIGH (duplicate of S2, listed for completeness)
- Same as S2.

### S8. No 401/403 Handling in Frontend
- **Severity:** HIGH
- **File:** `lib/api.ts:53-54`
- **Details:** Error interceptor just rejects the promise. No redirect to login on 401. No token refresh.
- **Impact:** Expired tokens cause silent failures. Users see raw errors.
- **Remediation:** Add 401 interceptor that redirects to `/auth/sign-in`. Add token refresh logic.

### S9. XSS in Blade Views — Admin Settings
- **Severity:** HIGH
- **File:** `resources/views/admin/settings/index.blade.php:210`
- **Details:** `{!! Form::text('app_name', Utility::getsettings('app_name'), ...) !!}`
- **Impact:** If `app_name` contains `<script>alert(1)</script>`, it executes in admin browser.
- **Remediation:** Sanitize all settings output. Use `e()` helper or `{{ }}` syntax.

### S10. SQL Injection Pattern (Not Exploitable)
- **Severity:** HIGH (pattern is dangerous, current usage is safe)
- **File:** `app/Http/Controllers/Admin/EventController.php:41`
- **Details:** `->whereRaw('MONTH(start_date)=' . $todayDate)` — string concatenation in raw query.
- **Impact:** Currently safe because `$todayDate` is server-generated. But pattern is fragile.
- **Remediation:** Use parameterized queries: `->whereRaw('MONTH(start_date) = ?', [$todayDate])`

---

## Medium Findings

### S11. Token Storage in localStorage
- **Severity:** MEDIUM
- **File:** `lib/api.ts:25`
- **Details:** `localStorage.getItem('token')` — tokens vulnerable to XSS.
- **Impact:** If any XSS exists, attacker can steal auth token.
- **Remediation:** Use httpOnly cookies or memory-only storage.

### S12. Excessive API Timeout
- **Severity:** MEDIUM
- **File:** `lib/api.ts:6`
- **Details:** `timeout: 3600000` (1 hour)
- **Impact:** Server hangs cause client to wait an hour before failing.
- **Remediation:** Set timeout to 30-60 seconds.

### S13. DB::statement DDL Execution
- **Severity:** MEDIUM
- **File:** `SettingsController.php:189-194`
- **Details:** `DB::statement('create database test_db')` / `DB::statement('drop database test_db')`
- **Impact:** Can be abused for database resource exhaustion.
- **Remediation:** Remove or add rate limiting.

### S14. No CORS Configuration Audited
- **Severity:** MEDIUM
- **Details:** CORS config not verified in this audit. Default Laravel allows all origins.
- **Remediation:** Verify `config/cors.php` restricts to known domains.

### S15. No CSRF Protection on API Routes
- **Severity:** MEDIUM (expected for API)
- **Details:** API routes use Sanctum token auth, not session-based CSRF. This is correct for API but verify Sanctum SPA mode is not enabled incorrectly.

---

## Low Findings

### S16. No Security Headers
- **Severity:** LOW
- **Details:** No Content-Security-Policy, X-Frame-Options, X-Content-Type-Options headers configured.
- **Remediation:** Add security headers middleware.

### S17. No Rate Limiting on Auth Endpoints
- **Severity:** LOW
- **Details:** Login/register endpoints may not have specific rate limiting beyond global middleware.
- **Remediation:** Add throttle middleware to auth routes.

### S18. Debug Mode in Production
- **Severity:** LOW
- **File:** `.env:5` — `APP_DEBUG=true`
- **Details:** Stack traces exposed to users on errors.
- **Remediation:** Set `APP_DEBUG=false` in production.

---

## Security Score

| Category | Score |
|----------|-------|
| Authentication | 7/10 |
| Authorization | 3/10 |
| Input Validation | 4/10 |
| Secrets Management | 1/10 |
| XSS Prevention | 5/10 |
| SQL Injection | 8/10 |
| CSRF | 7/10 |
| **Overall Security** | **4.3/10** |

---

## Priority Remediation

1. **Immediate:** Rotate all secrets, remove .env from repo
2. **Immediate:** Remove /run-queue-jobs and /clear-config
3. **Immediate:** Fix settings endpoint validation
4. **Immediate:** Fix mass assignment (remove `id` from fillable)
5. **This week:** Fix role injection in UserController
6. **This week:** Add 401/403 frontend interceptor
7. **This sprint:** Sanitize Blade output
8. **This sprint:** Add security headers
