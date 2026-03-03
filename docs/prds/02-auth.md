# PRD 02: Authentication & Authorization
> Phase: 1 | Priority: P0
> Status: Draft | Date: 2026-03-03

---

## Problem Statement

The platform must support individual users, team collaboration, and enterprise-grade security. We need a flexible auth system that scales from email/password for small teams to SAML SSO + SCIM for large organizations.

---

## Goals

1. Secure, standards-compliant authentication
2. Granular role-based and resource-based authorization
3. SSO support for enterprise customers
4. Self-service user management

---

## Detailed Requirements

### 1. Authentication Methods

**Phase 1:**
- Email + password (Argon2id hashing)
- OAuth 2.0: Google, Microsoft
- Email verification flow
- Password reset flow
- Remember me (extended sessions)

**Phase 3 (Enterprise):**
- SAML 2.0 SSO (Okta, Azure AD, OneLogin, generic)
- SCIM 2.0 user/group provisioning
- MFA/2FA (TOTP authenticator apps)

### 2. Sessions

- Server-side sessions stored in Redis
- Secure HTTP-only cookies (SameSite=Lax)
- Session expiry: 30 days (remember me) / 24 hours (default)
- Concurrent session management (view/revoke active sessions)
- CSRF protection via double-submit cookie pattern

### 3. Organization Roles

| Role | Capabilities |
|---|---|
| **Owner** | Full control, billing, delete org, transfer ownership |
| **Admin** | Manage members, workspaces, integrations, settings |
| **Member** | Access workspaces they're assigned to |

### 4. Workspace Roles

| Role | Capabilities |
|---|---|
| **Editor** | Full CRUD on items, views, settings (paid seat) |
| **Contributor** | Add feedback, comment, vote, limited editing (free) |
| **Viewer** | Read-only access to shared content (free) |

### 5. Resource-Level Permissions

- **Private views** — only creator and explicitly shared users can access
- **Workspace access** — users must be granted access to each workspace
- **Portal access** — configurable per portal (public, password, SSO)
- **Share links** — optional password protection, expiry dates
- **Share link creation restriction** — admins can restrict who creates share links

### 6. API Authentication

- API keys (per organization, with scopes)
- Bearer tokens for OAuth flows
- Webhook signing (HMAC-SHA256)

### 7. Security Controls (Enterprise)

- IP address whitelisting
- Session policies (max duration, force re-auth)
- Audit log of all auth events (login, logout, failed attempts, role changes)
- Account lockout after failed attempts

---

## User Flows

### Sign Up
1. Enter name, email, password
2. Receive verification email
3. Click verification link
4. Create or join organization
5. Land on workspace creation / onboarding

### Sign In
1. Enter email + password (or click OAuth provider)
2. If SAML configured for email domain → redirect to IdP
3. If MFA enabled → prompt for TOTP code
4. Create session → redirect to last workspace

### Invite User
1. Admin enters email + role
2. System sends invite email
3. New user signs up (pre-assigned to org + role)
4. Existing user sees org in their account

---

## Technical Notes

- Use a proven auth library (Better Auth or Lucia) rather than rolling our own
- Store sessions in Redis for fast lookup and easy invalidation
- SAML implementation via `saml2-js` or `passport-saml`
- SCIM endpoints conform to RFC 7643/7644
- All passwords hashed with Argon2id (memory: 64MB, iterations: 3)
- Rate limit auth endpoints (10 attempts per minute per IP)

---

## Success Criteria

- [ ] Email/password registration and login
- [ ] Google and Microsoft OAuth login
- [ ] Email verification and password reset
- [ ] Organization and workspace role management
- [ ] Resource-level permissions (private views, workspace access)
- [ ] API key generation and authentication
- [ ] Rate limiting on auth endpoints
- [ ] All auth events logged to audit trail
