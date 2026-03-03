# PRD 03: Workspaces & Hierarchy
> Phase: 1 | Priority: P0
> Status: Draft | Date: 2026-03-03

---

## Problem Statement

Different teams manage different products with different workflows. The platform needs isolated containers (workspaces) where each team can configure their own item types, fields, statuses, and views without affecting other teams.

---

## Goals

1. Workspace creation, configuration, and management
2. Custom item type hierarchies per workspace
3. Modular app/feature toggling per workspace
4. Workspace-level access control

---

## Detailed Requirements

### 1. Workspace Management
- Create workspace: name, description, icon, color
- Workspace settings: timezone, date format, enabled apps
- Workspace templates (pre-configured setups for common use cases)
- Archive/delete workspace
- Duplicate workspace (copy structure, not items)

### 2. Item Type Hierarchy
- Define custom item types per workspace (e.g., Initiative → Feature → Story)
- Each type: name, icon, color, level in hierarchy
- Configure which custom fields appear on each type
- Default hierarchy provided, fully editable
- Professional: max 3 levels; Enterprise: unlimited

### 3. Workspace Apps (Modules)
- Toggle apps on/off per workspace
- Available apps: Priority Ratings, Priority Poker, Feedback & Insights, Objectives, Capacity Planning, Item Mirror, Check-Ins, Portal
- Each app adds its own fields, views, or UI elements when enabled
- App settings configurable per workspace

### 4. Status Configuration
- Define custom statuses per workspace
- Each status: name, color, category (not_started, in_progress, done, archived)
- Reorder statuses
- Default statuses applied on workspace creation

### 5. Workspace Access
- Invite members by email (assign workspace role)
- Roles: Editor, Contributor, Viewer
- Bulk invite via CSV
- Remove members
- Guest access via share links (no account required)

---

## Success Criteria
- [ ] Workspace CRUD with settings
- [ ] Custom item type hierarchy (create, reorder, configure)
- [ ] App/module toggling per workspace
- [ ] Custom status definitions
- [ ] Workspace member management with roles
- [ ] Workspace templates for quick setup
