# PRD 01: Core Platform & Data Model
> Phase: 1 | Priority: P0
> Status: Draft | Date: 2026-03-03

---

## Problem Statement

Product teams need a flexible platform that can model any product management workflow. Unlike rigid tools that force a specific hierarchy (e.g., Epic → Story → Task), the platform must allow teams to define their own item types, relationships, and workflows.

---

## Goals

1. Build a multi-tenant SaaS platform with organization and workspace management
2. Implement a flexible data model that supports custom item types and hierarchies
3. Provide the foundational CRUD APIs that all other features build upon
4. Ensure data isolation, performance, and extensibility from day one

---

## Detailed Requirements

### 1. Organizations (Tenants)

An Organization is the top-level tenant:
- Name, slug (URL-friendly identifier), logo
- Billing plan (free trial → Professional → Enterprise)
- Settings: default timezone, date format, language
- Member management (invite, remove, roles)
- Organization-level roles: Owner, Admin, Member

### 2. Workspaces

A Workspace is a container for a team's product work:
- Belongs to one Organization
- Has a name, description, icon/color
- Contains: Items, Views, Apps/Modules, Integrations
- Independent configuration (enabled apps, custom fields, statuses)
- Access control: workspace-level permissions per user

### 3. Apps / Building Blocks (Modular System)

The platform is modular — workspaces enable specific "apps":
- **Roadmap** (default, always on)
- **Priority Ratings** — scoring frameworks
- **Priority Poker** — collaborative prioritization
- **Feedback & Insights** — feedback collection/analysis
- **Objectives** — OKR management
- **Capacity Planning** — resource management
- **Item Mirror** — cross-workspace item linking
- **Check-Ins** — recurring status updates
- **Portal** — external-facing site

Each app:
- Can be enabled/disabled per workspace
- May add custom field types, views, or UI elements
- Has its own settings when enabled

### 4. Items (Core Entity)

Items are the fundamental data unit (features, initiatives, tasks, etc.):

**Standard Fields:**
- `id` (UUID)
- `workspace_id` (FK)
- `item_type_id` (FK — defines what "kind" of item this is)
- `title` (string, required)
- `description` (rich text / markdown)
- `status_id` (FK — customizable statuses)
- `assignee_id` (FK → User, nullable)
- `parent_id` (FK → Item, nullable — for hierarchy)
- `position` (float — ordering within lists/boards)
- `created_by` (FK → User)
- `created_at`, `updated_at` (timestamps)
- `archived_at` (soft delete)

**Custom Field Values:**
- Stored in a related `custom_field_values` table
- Also denormalized in a JSONB column for query performance

**Relationships:**
- Parent/child (tree hierarchy)
- Dependencies (blocks/blocked-by)
- Mirrors (linked copies across workspaces)
- Feedback links (insights → items)
- OKR links (items → key results)

### 5. Item Types (Custom Hierarchy)

Define the hierarchy for a workspace:
- Example: Initiative → Feature → Story
- Each type has: name, icon, color, level (depth in hierarchy)
- Professional: up to 3 levels; Enterprise: unlimited
- Items are created under a specific type
- Types determine which fields are visible/required

### 6. Custom Fields

Field definition per workspace:
- `name`, `type`, `description`, `required`, `default_value`
- `scope` — which item types this field appears on
- `position` — ordering in forms/views

Supported field types:
| Type | Description |
|---|---|
| `text` | Single-line text |
| `rich_text` | Multi-line with formatting |
| `number` | Integer or decimal |
| `select` | Single choice from options |
| `multi_select` | Multiple choices |
| `date` | Date picker |
| `date_range` | Start + end date |
| `person` | User reference |
| `multi_person` | Multiple user references |
| `url` | URL with optional title |
| `email` | Email address |
| `checkbox` | Boolean |
| `rating` | Numeric rating (1-5, 1-10, etc.) |
| `formula` | Calculated from other fields |
| `relation` | Reference to items in same/other workspace |
| `team` | Team reference |

### 7. Statuses

Customizable per workspace:
- Each status has: name, color, category
- Categories: `not_started`, `in_progress`, `done`, `archived`
- Default statuses provided but fully editable
- Status transitions optionally enforced

### 8. Activity Log

Every entity change is tracked:
- Who changed what, when, old value → new value
- Used for: activity feeds, audit trails, undo
- Stored in an append-only `activity_log` table

---

## Technical Notes

- All tables include `workspace_id` for RLS enforcement
- UUIDs for all primary keys (no sequential IDs exposed)
- Soft deletes via `archived_at` timestamp
- Position fields use fractional indexing for efficient reordering
- Full-text search on item title + description via PostgreSQL `tsvector`

---

## Success Criteria

- [ ] Organization CRUD with member management
- [ ] Workspace CRUD with app/module toggling
- [ ] Item CRUD with full custom field support
- [ ] Custom hierarchy (item types) configurable per workspace
- [ ] Status management with categories
- [ ] Activity log records all changes
- [ ] RLS enforces tenant isolation at the database level
- [ ] API response times < 200ms for standard CRUD operations
