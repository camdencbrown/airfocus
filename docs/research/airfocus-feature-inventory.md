# airfocus - Complete Feature Inventory
> Research compiled: 2026-03-03
> Purpose: Feature-complete reference for building an airfocus replacement

---

## Platform Overview

airfocus is a modular, AI-powered product management platform used by 7,000+ global customers (including Ricoh, Goodyear, Siemens Healthineers, CAT, WAGO, SNP). It's now owned by Lucid Software. The platform covers the full product management lifecycle: strategy → prioritization → roadmapping → delivery tracking.

**Core philosophy:** Modular "building blocks" — teams pick the apps/modules they need rather than getting a monolithic tool. Everything is customizable.

---

## 1. ROADMAPPING

### Views
- **Board view** (Kanban) — drag-and-drop cards between swimlanes
- **Timeline view** — horizontal time-based layout for items
- **Gantt view** — with dependencies, milestones, drag-to-resize
- **Table view** — spreadsheet-like grid with inline editing
- **List view** — compact list format
- **Chart view** — used primarily with prioritization (scatter plots, matrices)
- **Document view** — rich text documents embedded within workspace
- **Inbox view** — for managing incoming feedback items

### Capabilities
- Drag-and-drop card/item management
- Custom views (create/save/share filtered views)
- Private views (restricted access)
- Dependencies between items
- Milestones
- Swimlanes and grouping
- Share links (with optional password protection)
- PDF & CSV export
- Real-time collaboration
- Templates (product roadmap, technology roadmap, agile sprint, feature roadmap, objective-led roadmap, etc.)
- Unlimited workspaces

---

## 2. PRIORITIZATION

### Frameworks (Built-in)
- **RICE scoring** (Reach, Impact, Confidence, Effort)
- **MoSCoW** (Must, Should, Could, Won't)
- **Kano model** (Basic, Performance, Excitement)
- **Weighted scoring** (custom criteria with weights)
- **Value vs. Effort** matrix
- **Custom scoring frameworks** — define your own criteria, weights, and formulas

### Features
- **Priority Ratings app** — advanced scoring with visual ratings
- **Custom prioritization formula** — define calculated scores
- **Priority Poker** — collaborative prioritization game where team members independently rate items, then reveal/discuss discrepancies
- **Chart view** — scatter plots, bubble charts for visualizing priorities
- **Prioritize by Insights score** — use feedback/customer data to inform priorities
- Drag-and-drop priority ordering

---

## 3. OBJECTIVES & OKRs

### Features
- OKR management app (add-on for Professional, included in Enterprise)
- Define company, team, and product-level objectives
- Key results with progress tracking
- Connect OKRs directly to roadmap items
- Track progress from user stories → initiatives → objectives
- Multiple team progress tracking in one view
- Now-Next-Later alignment with objectives

---

## 4. FEEDBACK & INSIGHTS

### Collection
- **Inbox view** — incoming feedback stream
- **Custom forms** — branded feedback forms embeddable anywhere
- **Import from integrations** — Intercom, Salesforce, Slack, Microsoft Teams, Zendesk
- **Portal submissions** — users submit directly via branded portal
- **Chrome extension** — capture feedback from any webpage
- **Manual entry** — team members add feedback directly

### Processing
- **AI-powered tagging** — auto-categorize feedback
- **AI insights summaries** — summarize large volumes of feedback
- **Sentiment analysis** — understand tone/satisfaction
- **Insight scoring** — weight feedback by importance, customer segment, revenue, etc.
- **Segmentation** — filter by criteria (customer, product, date, etc.)
- **Duplicate detection/merging** — combine similar feedback
- **Link feedback to items** — connect feedback to roadmap items/initiatives
- **Voting & reactions** — allow team/stakeholders to vote on feedback

---

## 5. PORTAL

### Features
- **Branded customer/stakeholder portal** — fully customizable look and feel
- Share roadmaps, ideas, plans, launches publicly or to specific audiences
- Gather feedback seamlessly
- Validate ideas and concepts
- **Password protection** (Professional+)
- **SSO protection / login protection** (Enterprise)
- **Remove airfocus branding** (Enterprise)
- 2 portals on Professional, unlimited on Enterprise
- Custom domain support

---

## 6. CAPACITY PLANNING (Enterprise only)

### Features
- Visual capacity management per team
- Scenario planning — model different allocation scenarios
- Resource allocation across products/initiatives
- View capacity vs. demand
- Align resource planning with priorities and strategy
- Team-level capacity configuration

---

## 7. PORTFOLIO MANAGEMENT

### Features
- **Item Mirror app** — create linked copies of items across workspaces
- Roll up multiple roadmaps into portfolio views
- Cross-team visibility and alignment
- **Custom product & item hierarchy:**
  - Professional: 3-level hierarchy
  - Enterprise: Unlimited levels
- Strategic-level views for leadership
- Filter and group across the portfolio

---

## 8. COLLABORATION & USERS

### User Roles
- **Editor** — full access, creates/edits content (paid seat)
- **Contributor** — can add feedback, comment, vote (unlimited, free)
- **Viewer** — read-only access (unlimited, free)
- **Advanced permission management** — granular access control

### Features
- Real-time editing
- Comments on items
- @mentions and notifications
- Status tracking (customizable statuses)
- Check-Ins app — recurring status updates
- Activity feed
- Share link creation restriction
- Team workspaces

---

## 9. AI FEATURES (Enterprise only for full access)

### Slash Commands
- `/write-prd` — Generate a product requirements document
- `/write-user-story` — Generate user stories
- `/make-non-technical` — Simplify technical content
- `/show-value` — Articulate business value
- `/analyze-sentiment` — Analyze sentiment of feedback
- `/summarize` — Summarize long content

### Capabilities
- **Writer** — prompts and editing suggestions inline
- **AI insights summaries** — auto-summarize feedback clusters
- **AI-powered tagging** — auto-categorize and tag items

---

## 10. INTEGRATIONS

### Dev Tool Integrations (Two-way sync)
| Integration | Professional | Enterprise |
|---|---|---|
| Jira Cloud | Yes | Yes |
| Jira Server | No | Yes |
| Azure DevOps Cloud | Yes | Yes |
| Azure DevOps Server | No | Yes |
| Trello | Yes | Yes |
| Asana | Yes | Yes |
| Shortcut | Yes | Yes |
| Microsoft Planner | Yes | Yes |
| GitHub | Yes | Yes |
| Linear | Yes | Yes |

### Jira-Specific Features
- Custom JQL filtering
- Flexible field mapping (including custom fields)
- Hierarchy mapping & sync (epics → stories → subtasks)
- Display airfocus priority score in Jira
- Parent-child relationship visibility
- Two-way status sync

### Azure DevOps-Specific Features
- Area path mapping (two-way)
- Area name mapping (one-way)
- Iteration path mapping (two-way)
- Hierarchy mapping & sync

### Feedback Tool Integrations
| Integration | Professional | Enterprise |
|---|---|---|
| Intercom | Yes | Yes |
| Slack | Yes | Yes |
| Microsoft Teams | Yes | Yes |
| Zendesk | Yes | Yes |
| Salesforce | No | Yes |

### Automation & Other
- **Webhooks** — real-time event notifications to external systems
- **Zapier** — connect with 2,000+ apps
- **Embedded collaborative media** — Lucid, Figma, Miro, etc.
- **Chrome extension** — feedback capture

---

## 11. SECURITY & COMPLIANCE

| Feature | Professional | Enterprise |
|---|---|---|
| GDPR compliant | Yes | Yes |
| SOC 2 certified | Yes | Yes |
| ISO 27001:2022 | Yes | Yes |
| CCPA ready | Yes | Yes |
| SAML SSO | Add-on | Included |
| SCIM provisioning | No | Yes |
| IP address whitelisting | No | Yes |
| EU/US server hosting | Yes | Yes |
| Portal SSO protection | No | Yes |
| Password-protected shares | Yes | Yes |
| Remove branding | No | Yes |

---

## 12. REPORTING & ANALYTICS

- Status tracking across all items
- Activity & progress reporting (Enterprise)
- PDF & CSV export
- Custom filtered views as "reports"
- Share link creation restriction
- Check-Ins for recurring status updates

---

## 13. CUSTOMIZATION

- **Custom fields** — text, number, select, multi-select, date, people, etc.
- **Team fields** — fields specific to teams
- **Custom views** — filtered, grouped, sorted views
- **Custom statuses** — define workflow stages
- **Custom product hierarchy** — define your own item types and levels
- **Custom scoring frameworks** — define criteria, weights, formulas
- **Templates** — pre-built configurations for different use cases
- **Modular architecture** — add/remove "apps" (building blocks) per workspace

---

## 14. PRICING (Current as of 2026)

### Professional Plan
- Custom pricing (historically ~$59/editor/month)
- Unlimited free contributors & workspaces
- All view types
- 3-level custom hierarchy
- Core integrations (Jira Cloud, Azure DevOps Cloud, etc.)
- Feedback & Insights management
- Branded portal (2)
- Priority Ratings & Priority Poker
- OKRs available as add-on
- SAML SSO as add-on

### Enterprise Plan
- Custom pricing
- Everything in Professional, plus:
- Objectives & OKRs included
- Capacity Planning
- Activity & progress reporting
- Unlimited hierarchy levels
- Jira Server & Azure DevOps Server
- Salesforce integration
- airfocus AI (full)
- Portal SSO protection
- IP address whitelisting
- SAML SSO included
- SCIM provisioning
- Remove branding
- Dedicated CSM & priority support
- Enterprise onboarding & training

---

## 15. TEMPLATES LIBRARY

Categories of templates available:
- Product roadmap
- Technology roadmap
- Objective-led roadmap (Now/Next/Later)
- Feature roadmap
- Agile sprint planning
- RICE scoring
- Value vs. Effort prioritization
- MoSCoW prioritization
- Kano model
- Product management essentials
- Full product management workflow
- Feedback & Insights
- Custom (user-created)

---

## 16. PLATFORM CHARACTERISTICS

- **SaaS-only** (no self-hosted option)
- **Multi-tenant** architecture
- **Web-based** (browser application)
- **Mobile-compatible** (Android & iOS — likely responsive web, not native apps)
- **Real-time** collaboration
- **Modular** — apps/building blocks can be added per workspace
- **Part of Lucid Software** ecosystem (acquired)
