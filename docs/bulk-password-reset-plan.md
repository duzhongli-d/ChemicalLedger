# Bulk Password Reset Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reset all user passwords to `Admin123!`, then verify login works in the browser.

**Architecture:** Use existing `bulk_reset_passwords.py` script which uses SQLAlchemy + passlib/bcrypt to update all user `password_hash` fields atomically.

**Tech Stack:** Python, SQLAlchemy, passlib/bcrypt, FastAPI backend, Next.js frontend + Playwright for browser verification.

---

## Context

The codebase already has a bulk password reset script at `apps/api/scripts/bulk_reset_passwords.py` that was added in commit `c4c2e36`. It queries all users, hashes the new password using the existing `hash_password()` utility (bcrypt via passlib), and commits atomically. The web frontend uses email or username + password login via `LoginModal.tsx`.

---

## Tasks

### Task 1: Run Bulk Password Reset Script

**File:** `apps/api/scripts/bulk_reset_passwords.py`

**Step 1: Run the script**

```bash
cd apps/api && python -m scripts.bulk_reset_passwords
```

Expected output: `Updated N users.`

**Step 2: Verify no errors**

If any errors occur (e.g., database connection issues), they will be printed to stderr.

---

### Task 2: Browser Verification with Playwright

**Files:** Browser-based login modal at `apps/web/src/components/auth/LoginModal.tsx`

**Step 1: Navigate to the web app login page**

Open `http://localhost:3000` (or the running dev server URL).

**Step 2: Attempt login**

Use one of the known user accounts to login:
- Email: `admin@abachem.com` (admin user)
- Password: `Admin123!`

Or any non-admin user with their email + `Admin123!`.

**Step 3: Verify login success**

Successful login should redirect to `/admin/dashboard` for admin users, or `/` for regular users. No error message should appear.

---

## Critical Files

| File | Purpose |
|------|---------|
| `apps/api/scripts/bulk_reset_passwords.py` | Bulk password reset script (already exists) |
| `apps/api/app/core/security.py` | `hash_password()` using bcrypt/passlib |
| `apps/api/app/db/models.py` | User model with `password_hash` field |
| `apps/api/app/db/session.py` | SQLAlchemy `SessionLocal` |
| `apps/web/src/components/auth/LoginModal.tsx` | Login UI component |
| `apps/web/.env` | Web app configuration (API URL) |

---

## Verification

1. **API Verification:** Run the script — confirms all users updated successfully
2. **Browser Verification:** Use Playwright to open login page, fill credentials `Admin123!`, submit, and confirm redirect without error — confirms password hashing is consistent between API and database

---

## Implementation Notes (2026-05-27)

### Issue: API Server Was Not Connecting to Updated Database

During implementation, login failed with 401 even after password reset. Root cause:

- The running API server (PID 28376 on port 8000) was using a **different database** than the one being updated by the bulk reset script
- The bulk reset script was updating the local PostgreSQL at `localhost:5432`
- The running API server was connecting to a different database instance

**Solution:** Restarted the API server to ensure it connects to the same database being updated by the bulk reset script.

### Commands Used

```bash
# Run bulk password reset
cd apps/api && python -m scripts.bulk_reset_passwords

# Restart API server
cd apps/api && uvicorn app.main:app --host 127.0.0.1 --port 8000 &

# Verify login via API
python -c "import requests; resp = requests.post('http://localhost:8000/api/v1/auth/login', json={'email':'admin@abachem.com','password':'Admin123!'}); print(resp.status_code, resp.text)"
```

### Users Found (19 total)

All 19 users now have password `Admin123!`:
- admin@abachem.com (admin)
- admin@test.com (admin)
- test@test.com (user)
- logintest@example.com (user)
- Plus 15 test users with emails like testuser_NNNN@abachem.com