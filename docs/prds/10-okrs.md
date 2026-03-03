# PRD 10: Objectives & OKRs
> Phase: 3 | Priority: P1
> Status: Draft | Date: 2026-03-03

---

## Problem Statement

Product strategy often lives in slide decks disconnected from day-to-day execution. Teams need a way to define objectives, track key results, and connect them directly to roadmap items so everyone can see how daily work ladders up to strategic goals.

---

## Goals

1. Define hierarchical objectives (company → team → product)
2. Track key results with measurable progress
3. Link objectives/key results to roadmap items
4. Visualize progress across teams and objectives

---

## Detailed Requirements

### 1. Objectives
- Title, description, owner, time period (quarter/custom)
- Hierarchy: Company → Team → Product objectives
- Status: on track, at risk, off track, achieved
- Progress: auto-calculated from key results

### 2. Key Results
- Belong to an objective
- Title, target value, current value, unit
- Type: numeric (0-100), percentage, currency, binary (done/not done)
- Owner (assignee)
- Progress: current / target
- Linked roadmap items (contributing work)
- Auto-progress: optionally calculated from linked item statuses

### 3. OKR ↔ Roadmap Connection
- Link items to key results ("this feature contributes to this KR")
- View all items contributing to an objective
- Filter roadmap views by objective
- Progress roll-up: item completion → KR progress → objective progress

### 4. OKR Views
- **Tree view** — hierarchical view of all objectives, KRs, linked items
- **Progress dashboard** — visual progress bars per objective/KR
- **Timeline view** — objectives on timeline aligned with roadmap
- **Check-in view** — recurring status updates on OKR progress

### 5. Check-Ins
- Recurring status updates (weekly/biweekly)
- Update KR progress values
- Add qualitative notes
- Flag risks or blockers
- Check-in history visible on each OKR

---

## Success Criteria
- [ ] Objective CRUD with hierarchy (company → team → product)
- [ ] Key Result tracking with progress metrics
- [ ] Link KRs to roadmap items
- [ ] Auto-progress calculation from linked items
- [ ] OKR tree view and progress dashboard
- [ ] Check-in workflow with history
