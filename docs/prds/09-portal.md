# PRD 09: Portal
> Phase: 2 | Priority: P1
> Status: Draft | Date: 2026-03-03

---

## Problem Statement

Product teams need to share roadmaps, collect feedback, and communicate plans with external stakeholders (customers, partners) and internal audiences (sales, support) without granting full platform access.

---

## Goals

1. Branded, external-facing portal for sharing roadmaps and collecting feedback
2. Configurable access (public, password-protected, SSO)
3. Interactive — users can vote, submit ideas, and track status

---

## Detailed Requirements

### 1. Portal Setup
- Custom branding (logo, colors, favicon, header text)
- Custom domain support (e.g., feedback.yourcompany.com)
- Welcome message / description
- Multiple portals per workspace (Pro: 2, Enterprise: unlimited)
- Remove platform branding (Enterprise)

### 2. Portal Content
- **Published roadmaps** — select which views to publish
- **Idea board** — users submit feature requests
- **Changelog** — announce releases/updates
- **Feedback forms** — embedded forms for structured input

### 3. Access Control
- Public (anyone with URL)
- Password-protected
- SSO-protected (Enterprise — login required)
- Guest accounts (email registration)

### 4. User Interaction
- Vote on ideas/items (upvote)
- Submit new ideas via form
- Comment on published items
- Subscribe to status updates on specific items
- Notification emails when status changes

### 5. Admin Controls
- Choose which items/views are visible on portal
- Moderate submissions (approve before publishing)
- Respond to feedback publicly or privately
- View analytics (votes, submissions, page views)

---

## Success Criteria
- [ ] Branded portal with custom domain
- [ ] Published roadmap views (read-only)
- [ ] Idea submission and voting
- [ ] Access control (public, password, SSO)
- [ ] Status update notifications to subscribers
- [ ] Admin moderation queue
