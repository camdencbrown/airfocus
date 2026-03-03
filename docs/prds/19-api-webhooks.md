# PRD 19: Public API & Webhooks
> Phase: 2 | Priority: P1
> Status: Draft | Date: 2026-03-03

---

## Problem Statement

Customers need to build custom integrations, automate workflows, and extract data programmatically. A well-documented REST API and webhook system is essential for platform adoption in technical organizations.

---

## Goals

1. Comprehensive REST API covering all platform entities
2. Outbound webhooks for event-driven integrations
3. API documentation with interactive explorer
4. Rate limiting and authentication per API key

---

## Detailed Requirements

### 1. REST API
- Base URL: `https://api.{domain}/v1/`
- Resources: organizations, workspaces, items, views, comments, feedback, objectives, integrations
- Standard operations: GET (list/detail), POST (create), PATCH (update), DELETE
- Filtering, sorting, pagination (cursor-based)
- Field selection (sparse fieldsets)
- Nested includes (e.g., `?include=customFields,comments`)

### 2. Authentication
- API keys (per organization)
- Scoped keys: read-only, read-write, admin
- Bearer token in Authorization header
- Key rotation support

### 3. Webhooks
- Subscribe to events per workspace
- Events: item.created, item.updated, item.deleted, item.status_changed, comment.created, feedback.created
- HMAC-SHA256 payload signing
- Retry with exponential backoff
- Delivery log with status codes
- Webhook testing (send test event)

### 4. Rate Limiting
- Per API key: 100 requests/minute (default)
- Higher limits for Enterprise
- Rate limit headers in responses (X-RateLimit-*)
- 429 response with retry-after

### 5. Documentation
- OpenAPI 3.1 specification
- Interactive API explorer (Swagger UI or Redoc)
- Code examples (cURL, JavaScript, Python)
- Changelog for API versions

---

## Success Criteria
- [ ] REST API covering items, views, workspaces, feedback
- [ ] API key authentication with scopes
- [ ] Outbound webhooks with HMAC signing
- [ ] Rate limiting with proper headers
- [ ] OpenAPI spec and interactive docs
- [ ] Zapier app published
