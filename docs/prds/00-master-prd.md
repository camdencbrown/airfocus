# Master PRD: airfocus Replacement Platform
> Codename: **Focus** (working title)
> Version: 1.0 | Date: 2026-03-03
> Status: Draft

---

## Executive Summary

We are building a full replacement for airfocus, a modular product management platform. The platform enables product teams to manage strategy, prioritize work, build roadmaps, collect customer feedback, track OKRs, and plan capacity — all in one interconnected workspace.

This master PRD outlines the overall product vision, phased delivery plan, and links to detailed PRDs for each component.

---

## Vision

**A single source of truth for product teams** — from strategy to delivery.

Build a modular, AI-native product management platform that is:
- **Flexible** — adapts to any team's workflow (not the other way around)
- **Connected** — integrates deeply with dev tools (Jira, ADO, GitHub) and feedback channels
- **Intelligent** — AI assists with writing, prioritization, and insight discovery
- **Collaborative** — real-time, role-based, with portals for external stakeholders
- **Scalable** — from a single PM to enterprise portfolios with hundreds of products

---

## Component PRDs

Each major feature area has its own detailed PRD:

| # | Component | PRD File | Phase | Priority |
|---|---|---|---|---|
| 01 | Core Platform & Data Model | [01-core-platform.md](./01-core-platform.md) | 1 | P0 |
| 02 | Authentication & Authorization | [02-auth.md](./02-auth.md) | 1 | P0 |
| 03 | Workspaces & Hierarchy | [03-workspaces.md](./03-workspaces.md) | 1 | P0 |
| 04 | Items & Custom Fields | [04-items-custom-fields.md](./04-items-custom-fields.md) | 1 | P0 |
| 05 | Views Engine | [05-views-engine.md](./05-views-engine.md) | 1 | P0 |
| 06 | Roadmapping | [06-roadmapping.md](./06-roadmapping.md) | 1 | P0 |
| 07 | Prioritization | [07-prioritization.md](./07-prioritization.md) | 2 | P1 |
| 08 | Feedback & Insights | [08-feedback-insights.md](./08-feedback-insights.md) | 2 | P1 |
| 09 | Portal | [09-portal.md](./09-portal.md) | 2 | P1 |
| 10 | Objectives & OKRs | [10-okrs.md](./10-okrs.md) | 3 | P1 |
| 11 | Integrations Engine | [11-integrations.md](./11-integrations.md) | 2 | P1 |
| 12 | AI Features | [12-ai-features.md](./12-ai-features.md) | 3 | P2 |
| 13 | Capacity Planning | [13-capacity-planning.md](./13-capacity-planning.md) | 3 | P2 |
| 14 | Portfolio Management | [14-portfolio.md](./14-portfolio.md) | 3 | P2 |
| 15 | Collaboration & Real-time | [15-collaboration.md](./15-collaboration.md) | 1 | P0 |
| 16 | Reporting & Analytics | [16-reporting.md](./16-reporting.md) | 3 | P2 |
| 17 | Templates | [17-templates.md](./17-templates.md) | 2 | P1 |
| 18 | Security & Compliance | [18-security.md](./18-security.md) | 1 | P0 |
| 19 | Public API & Webhooks | [19-api-webhooks.md](./19-api-webhooks.md) | 2 | P1 |

---

## Phased Delivery Plan

### Phase 1: Foundation (Weeks 1-8)
**Goal:** Core platform that can create workspaces, define items with custom fields, and visualize them in multiple views.

**Components:**
- Core Platform & Data Model
- Authentication (email/password + OAuth)
- Workspaces & Hierarchy
- Items & Custom Fields
- Views Engine (Board, Table, List)
- Basic Roadmapping (Timeline view)
- Collaboration (comments, real-time updates)
- Security fundamentals (HTTPS, RLS, input validation)

**Milestone:** A user can sign up, create a workspace, define custom item types with fields, add items, and view them in Board/Table/Timeline views. Multiple users can collaborate in real-time.

---

### Phase 2: Product Management Core (Weeks 9-16)
**Goal:** Full prioritization, feedback management, and integrations turn this into a real PM tool.

**Components:**
- Prioritization (scoring frameworks, Priority Poker, charts)
- Feedback & Insights (collection, AI tagging, analysis)
- Portal (branded external-facing site)
- Integrations Engine + Jira integration
- Templates library
- Public API & Webhooks
- Gantt view with dependencies

**Milestone:** A PM can prioritize a backlog using RICE scoring, collect customer feedback via portal, sync items with Jira, and share a roadmap via public link.

---

### Phase 3: Enterprise & Intelligence (Weeks 17-24)
**Goal:** Enterprise features and AI intelligence make this a premium platform.

**Components:**
- Objectives & OKRs
- AI Features (writer, summarization, sentiment)
- Capacity Planning
- Portfolio Management
- Reporting & Analytics
- SAML SSO & SCIM
- Advanced integrations (Azure DevOps, Salesforce, etc.)

**Milestone:** An enterprise org can manage OKRs connected to roadmaps, plan capacity across teams, view portfolio-level dashboards, and use AI to write PRDs and analyze feedback sentiment.

---

### Phase 4: Scale & Polish (Weeks 25+)
**Goal:** Performance optimization, advanced features, and market readiness.

- Performance optimization and load testing
- Multi-region deployment (EU + US)
- Advanced search (Meilisearch)
- Mobile-responsive refinements
- Import/migration tools (from airfocus, Productboard, Aha!, etc.)
- Billing & subscription management
- Marketing site
- Documentation & help center

---

## Success Metrics

| Metric | Target |
|---|---|
| Core platform functional (Phase 1) | Week 8 |
| First internal dogfooding | Week 10 |
| Feature parity with airfocus Professional | Week 20 |
| Feature parity with airfocus Enterprise | Week 28 |
| Production-ready for external users | Week 30 |

---

## Key Decisions Required

1. **Product name** — "Focus" is a working title; need final branding
2. **Hosting strategy** — AWS vs. hybrid (Vercel + AWS)?
3. **AI provider** — OpenAI vs. Anthropic vs. multi-provider?
4. **Pricing model** — Mirror airfocus tiers or differentiate?
5. **Open source?** — Any components to open source?
