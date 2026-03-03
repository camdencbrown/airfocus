# Implementation Roadmap
> Version: 1.0 | Date: 2026-03-03

---

## Phase 1: Foundation (Weeks 1-8)
> Goal: Core platform that can create workspaces, manage items, and visualize them

### Week 1-2: Project Setup & Core Infrastructure
- [ ] Initialize monorepo (Next.js + Fastify + shared types)
- [ ] Set up PostgreSQL database with Drizzle ORM
- [ ] Set up Redis
- [ ] Configure Docker development environment
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Implement database schema: organizations, users, workspaces
- [ ] Row-Level Security policies
- [ ] Authentication: email/password + OAuth (Google, Microsoft)
- [ ] Session management (Redis-backed)

### Week 3-4: Items & Custom Fields
- [ ] Database schema: items, item_types, custom_field_definitions, custom_field_values
- [ ] Item CRUD API (tRPC routes)
- [ ] Custom field definition management
- [ ] Custom field value storage (EAV + JSONB)
- [ ] Item relationships: parent/child, dependencies
- [ ] Status management (custom statuses per workspace)
- [ ] Activity log system
- [ ] Basic search (PostgreSQL full-text)

### Week 5-6: Views Engine & UI
- [ ] Views engine architecture (generic filter/sort/group engine)
- [ ] Board view (Kanban) with drag-and-drop
- [ ] Table view with inline editing and virtual scrolling
- [ ] List view with collapsible groups
- [ ] Timeline view (Canvas/SVG based)
- [ ] Filter builder UI
- [ ] View configuration save/load
- [ ] Item detail panel (slide-over)

### Week 7-8: Collaboration & Polish
- [ ] Socket.io real-time infrastructure
- [ ] Real-time item updates across clients
- [ ] Comments system (threaded, @mentions)
- [ ] Notification system (in-app + email)
- [ ] Workspace onboarding flow
- [ ] Workspace templates (3 templates minimum)
- [ ] Share links (public URL for views)
- [ ] CSV import/export
- [ ] Phase 1 testing and bug fixes

### Phase 1 Milestone Checklist
- [ ] User can sign up, create org, create workspace
- [ ] Custom item types and hierarchy configurable
- [ ] Custom fields (10+ types) working
- [ ] Board, Table, List, Timeline views functional
- [ ] Drag-and-drop in Board and Timeline
- [ ] Real-time updates between multiple users
- [ ] Comments and notifications working
- [ ] Share links for views

---

## Phase 2: Product Management Core (Weeks 9-16)
> Goal: Prioritization, feedback, integrations, and portal make this a real PM tool

### Week 9-10: Prioritization
- [ ] Priority Ratings app (enable/disable per workspace)
- [ ] Scoring framework builder (custom criteria + weights + formula)
- [ ] RICE, MoSCoW, Value vs Effort preset frameworks
- [ ] Chart view (scatter/bubble plot)
- [ ] Priority Poker (real-time collaborative voting)
- [ ] Sort/filter by priority score in all views

### Week 11-12: Feedback & Insights
- [ ] Feedback item model and CRUD
- [ ] Inbox view for processing feedback
- [ ] Custom form builder
- [ ] AI auto-tagging (LLM integration)
- [ ] Sentiment analysis
- [ ] Insights aggregation (group feedback into themes)
- [ ] Insight scoring (volume, revenue, sentiment)
- [ ] Link feedback to roadmap items
- [ ] Voting and reactions

### Week 13-14: Integrations
- [ ] Integration engine framework (plugin architecture)
- [ ] Jira Cloud integration (full: import, push, two-way sync, JQL)
- [ ] Field mapping UI
- [ ] Sync status tracking
- [ ] Outbound webhooks (event system + delivery)
- [ ] Slack integration (feedback import)
- [ ] Intercom integration (feedback import)

### Week 15-16: Portal, Templates & API
- [ ] Portal infrastructure (branded subdomain/custom domain)
- [ ] Published roadmap views on portal
- [ ] Idea submission and voting
- [ ] Portal access control (public, password, SSO)
- [ ] Template library (10+ templates)
- [ ] Custom template creation (save workspace as template)
- [ ] Public REST API (items, workspaces, views, feedback)
- [ ] API documentation (OpenAPI + interactive explorer)
- [ ] Gantt view with dependencies
- [ ] Phase 2 testing and bug fixes

### Phase 2 Milestone Checklist
- [ ] PM can score backlog with RICE and see chart
- [ ] Priority Poker session works with 5+ participants
- [ ] Feedback flows in from Slack, forms, and manual entry
- [ ] AI auto-tags and analyzes sentiment
- [ ] Jira two-way sync working
- [ ] Portal live with public roadmap and idea voting
- [ ] REST API documented and functional

---

## Phase 3: Enterprise & Intelligence (Weeks 17-24)
> Goal: Enterprise features and AI intelligence for premium offering

### Week 17-18: OKRs & Strategy
- [ ] Objectives CRUD with hierarchy
- [ ] Key Results with progress tracking
- [ ] OKR ↔ roadmap item linking
- [ ] OKR tree view and progress dashboard
- [ ] Check-in workflow
- [ ] Auto-progress from linked items

### Week 19-20: AI Features
- [ ] AI writer with slash commands (Tiptap integration)
- [ ] PRD and user story generation
- [ ] Content summarization and simplification
- [ ] Feedback insight summaries (AI-generated)
- [ ] Enhanced sentiment analysis
- [ ] Streaming responses in editor

### Week 21-22: Capacity Planning & Portfolio
- [ ] Team capacity definition
- [ ] Demand calculation from items
- [ ] Capacity vs demand visualization
- [ ] Scenario planning
- [ ] Item mirrors (cross-workspace linking)
- [ ] Portfolio views (cross-workspace aggregation)
- [ ] Portfolio dashboard

### Week 23-24: Enterprise Security & Advanced Integrations
- [ ] SAML SSO implementation
- [ ] SCIM 2.0 provisioning
- [ ] IP whitelisting
- [ ] Azure DevOps integration (Cloud + Server)
- [ ] Salesforce integration
- [ ] Advanced reporting (custom report builder)
- [ ] Scheduled report delivery
- [ ] Audit log export
- [ ] Phase 3 testing and bug fixes

### Phase 3 Milestone Checklist
- [ ] OKRs connected to roadmap with progress tracking
- [ ] AI slash commands working in editor
- [ ] AI summarizes feedback clusters
- [ ] Capacity planning with scenario comparison
- [ ] Portfolio view across workspaces
- [ ] SAML SSO and SCIM working
- [ ] Azure DevOps and Salesforce integrations

---

## Phase 4: Scale & Polish (Weeks 25+)
> Goal: Production hardening, performance, and market readiness

### Week 25-26: Performance & Scale
- [ ] Load testing (simulate 1000 concurrent users)
- [ ] Performance optimization (query tuning, caching, lazy loading)
- [ ] CDN configuration for static assets
- [ ] Database read replicas
- [ ] Virtual scrolling refinement for large datasets

### Week 27-28: Additional Integrations & Migration
- [ ] Trello, Asana, Shortcut, GitHub, Linear integrations
- [ ] Microsoft Teams, Zendesk feedback integrations
- [ ] Zapier app (publish to Zapier marketplace)
- [ ] Import tools (migrate from airfocus, Productboard, Aha!)
- [ ] Microsoft Planner integration

### Week 29-30: Polish & Launch Prep
- [ ] Mobile-responsive refinement
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Multi-language support (i18n framework)
- [ ] Billing & subscription management (Stripe)
- [ ] Marketing site
- [ ] Help center / documentation site
- [ ] Onboarding tours and tooltips
- [ ] Security audit / penetration test
- [ ] Production deployment (EU + US regions)

---

## Resource Estimates

### Minimum Team
| Role | Count | Notes |
|---|---|---|
| Full-stack engineers | 3-4 | TypeScript, React, Node.js |
| Frontend specialist | 1 | Canvas/SVG for timeline/gantt, complex drag-and-drop |
| Backend/infra engineer | 1 | Database, auth, integrations, security |
| Designer | 1 | UI/UX, design system |
| PM / Tech lead | 1 | Architecture decisions, prioritization |

### With AI-assisted Development
Given we're using Claude and other AI tools for code generation:
- **Effective velocity increase:** ~2-3x for boilerplate, CRUD, and standard patterns
- **Realistic timeline:** The 30-week roadmap could compress to 20-24 weeks
- **Key bottleneck:** Complex UI components (gantt, real-time, drag-and-drop) require careful human design

---

## Risk Register

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Timeline/Gantt view complexity | High | High | Allocate extra time, consider OSS base |
| Real-time sync conflicts | Medium | Medium | Implement CRDT or OT for rich text, last-write-wins for fields |
| Jira API complexity | High | High | Start integration early, handle edge cases iteratively |
| SAML/SCIM complexity | Medium | Medium | Use proven library (passport-saml, scim2-server) |
| Performance at scale | High | Medium | Load test early, design for horizontal scaling |
| Security compliance timeline | Medium | Low | Build security in from day 1, not as afterthought |

---

## Decision Log

| Decision | Options Considered | Chosen | Rationale |
|---|---|---|---|
| Frontend framework | Next.js, Remix, Vite SPA | Next.js 15 | Best ecosystem, SSR for share links, RSC support |
| Backend framework | Express, Fastify, NestJS | Fastify | Performance, schema validation, plugin system |
| Database | PostgreSQL, MySQL, MongoDB | PostgreSQL | JSONB for custom fields, RLS, proven at scale |
| ORM | Prisma, Drizzle, TypeORM | Drizzle | Lightweight, SQL-like, best TypeScript inference |
| API style | REST, GraphQL, tRPC | REST + tRPC | REST for public API, tRPC for internal type safety |
| Real-time | Socket.io, ws, SSE | Socket.io | Fallback support, rooms, Redis adapter |
| Auth | NextAuth, Lucia, Better Auth | TBD | Evaluate during Phase 1 Week 1 |
