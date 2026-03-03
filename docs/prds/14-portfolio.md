# PRD 14: Portfolio Management
> Phase: 3 | Priority: P2
> Status: Draft | Date: 2026-03-03

---

## Problem Statement

Organizations with multiple products need a way to see the big picture across all teams and products. Leadership needs portfolio-level views without diving into each workspace's details.

---

## Goals

1. Aggregate items across workspaces into portfolio views
2. Cross-workspace item linking (mirrors)
3. Executive-level dashboards
4. Align multiple teams' roadmaps with organizational strategy

---

## Detailed Requirements

### 1. Item Mirrors
- Create a linked copy of an item in another workspace
- Mirror reflects source item's status, dates, and selected fields
- Changes sync bidirectionally (or one-way, configurable)
- Visual indicator that an item is a mirror

### 2. Portfolio Views
- Views that span multiple workspaces
- Filter by workspace, team, product, status, priority
- Aggregate timeline view (all products on one timeline)
- Summary cards per workspace (item count, progress, health)

### 3. Portfolio Dashboard
- High-level metrics across the organization
- Items by status distribution
- Progress by objective/team
- Risk items (overdue, blocked, at-risk)
- Capacity overview across teams

### 4. Custom Hierarchy (Unlimited)
- Enterprise: unlimited nesting levels
- Example: Portfolio → Product → Initiative → Feature → Story → Task
- Each level can have different field configurations
- Roll-up calculations (progress, dates, effort) at each level

---

## Success Criteria
- [ ] Item mirrors with bidirectional sync
- [ ] Cross-workspace portfolio views
- [ ] Portfolio dashboard with aggregate metrics
- [ ] Unlimited hierarchy levels (Enterprise)
- [ ] Roll-up calculations across hierarchy
