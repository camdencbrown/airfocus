# PRD 05: Views Engine
> Phase: 1 | Priority: P0
> Status: Draft | Date: 2026-03-03

---

## Problem Statement

Different stakeholders need different perspectives on the same data. Engineers want a Kanban board, PMs want a timeline, and executives want a high-level chart. The views engine is the core UI system that renders items in multiple configurable layouts.

---

## Goals

1. Build a generic, extensible views engine that can render any item set in multiple layouts
2. Support saving, sharing, and customizing views
3. Enable filtering, grouping, sorting, and field visibility per view
4. Provide the foundation for roadmapping, prioritization charts, and portfolio views

---

## Detailed Requirements

### 1. View Types

| View | Description | Phase |
|---|---|---|
| **Board** | Kanban-style columns (grouped by status, field, or custom) | 1 |
| **Table** | Spreadsheet-like grid with inline editing | 1 |
| **List** | Compact, collapsible list | 1 |
| **Timeline** | Horizontal time-based layout (requires date_range field) | 1 |
| **Gantt** | Timeline with dependencies, milestones, critical path | 2 |
| **Chart** | Scatter plot, bubble chart (for prioritization matrices) | 2 |
| **Document** | Rich text page with embedded item references | 2 |
| **Inbox** | Stream view for incoming feedback items | 2 |

### 2. View Configuration

Each saved view stores:
- `name`, `description`, `icon`
- `view_type` (board, table, list, etc.)
- `workspace_id` (belongs to workspace)
- `created_by` (owner)
- `is_private` (only visible to owner + explicitly shared)
- `filters` — JSON array of filter conditions
- `sort` — JSON array of sort rules
- `group_by` — field(s) to group items
- `sub_group_by` — secondary grouping (board swimlanes)
- `visible_fields` — which columns/fields to show
- `field_widths` — column width overrides (table view)
- `color_by` — field to derive item color
- `collapsed_groups` — which groups are collapsed by default

### 3. Filtering

Filters support:
- **Field-based:** any standard or custom field
- **Operators:** equals, not equals, contains, does not contain, is empty, is not empty, greater than, less than, between, in list
- **Combinators:** AND / OR groups
- **Saved filters:** stored as part of view config
- **Quick filters:** temporary, applied via toolbar

### 4. Sorting

- Sort by any field (ascending/descending)
- Multi-level sorting (sort by status, then by priority, then by date)
- Manual drag-to-reorder (overrides sort; stores custom position)

### 5. Grouping

- Group by any select/status/person/date field
- Collapsible groups
- Group counts
- Sub-grouping (swimlanes in board view)
- "No group" bucket for items without a value

### 6. Board View Specifics

- Columns defined by grouping field (default: status)
- Drag-and-drop between columns updates the grouping field value
- Swimlanes for secondary grouping
- Card content configurable (which fields show on card face)
- Column WIP limits (optional, visual indicator when exceeded)
- Column collapse/expand

### 7. Table View Specifics

- Inline editing of all field types
- Resizable columns
- Frozen columns (pin left)
- Row selection (multi-select for bulk actions)
- Bulk edit selected rows
- Export to CSV
- Virtual scrolling for large datasets (1000+ items)

### 8. Timeline View Specifics

- Horizontal time axis (day/week/month/quarter/year zoom)
- Items as bars (start date → end date)
- Drag to move/resize items (updates dates)
- Grouping by rows (by status, assignee, item type)
- Today line
- Milestones (diamond markers)

### 9. Gantt View Specifics (Phase 2)

- Everything from Timeline, plus:
- Dependency arrows between items
- Critical path highlighting
- Auto-scheduling (shift dependent items when parent moves)
- Baseline comparison
- Progress percentage display

### 10. Sharing

- **Share link** — generate a public URL for the view
  - Optional password protection
  - Optional expiry date
  - Read-only (viewers can't edit)
- **Embed** — iframe-embeddable version
- **PDF export** — render view as PDF
- **CSV export** — table/list data as CSV

---

## Technical Notes

- Views engine is a **client-side rendering system** with server-provided data
- Data fetching: tRPC query with filters/sort/pagination applied server-side
- Virtual scrolling for table (TanStack Virtual) and board (windowed columns)
- Drag-and-drop via dnd-kit
- View configurations stored as JSON in PostgreSQL
- URL state sync: view filters/sort reflected in URL query params for shareability
- Canvas/SVG rendering for Timeline and Gantt (better perf than DOM for 100+ items)

---

## Success Criteria

- [ ] Board view with drag-and-drop, grouping, swimlanes
- [ ] Table view with inline editing, virtual scrolling, bulk actions
- [ ] List view with collapsible groups
- [ ] Timeline view with drag-to-move/resize
- [ ] Filtering engine supports all field types and operators
- [ ] Multi-level sorting
- [ ] Grouping by any field
- [ ] View configs saved to database and loadable
- [ ] Share links with optional password
- [ ] CSV export from table view
- [ ] < 500ms render time for 500 items in any view
