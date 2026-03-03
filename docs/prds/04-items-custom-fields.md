# PRD 04: Items & Custom Fields
> Phase: 1 | Priority: P0
> Status: Draft | Date: 2026-03-03

---

## Problem Statement

Items are the fundamental unit of work in the platform. Every roadmap entry, feature request, initiative, and task is an item. Teams need the flexibility to define exactly what data each item carries through custom fields, while maintaining consistency and queryability.

---

## Goals

1. Flexible item model with standard + custom fields
2. Full CRUD with bulk operations
3. Custom field system supporting 15+ field types
4. Item relationships (parent/child, dependencies, links)

---

## Detailed Requirements

### 1. Item CRUD
- Create item (with required fields validation)
- Edit item (inline in views or detail panel)
- Delete item (soft delete, recoverable)
- Duplicate item
- Bulk operations: update field, change status, delete, move

### 2. Item Detail Panel
- Slide-over panel (right side) showing full item details
- All fields editable inline
- Description: rich text editor (Tiptap)
- Comments section
- Activity log (change history)
- Linked items (dependencies, mirrors, feedback)
- Attachments (file upload)

### 3. Custom Fields
(See PRD 01 for field type list)
- Create/edit/delete field definitions per workspace
- Scope fields to specific item types
- Set default values
- Mark fields as required
- Reorder fields
- Field groups (organize fields into sections)

### 4. Item Relationships
- **Parent/child** — hierarchical tree structure
- **Dependencies** — blocks / blocked by (with optional date impact)
- **Mirrors** — linked copies across workspaces
- **Related items** — loose associations
- **Feedback links** — feedback items linked as evidence

### 5. Bulk Operations
- Select multiple items in any view
- Bulk update any field
- Bulk change status
- Bulk assign
- Bulk delete/archive
- Bulk move to different parent/type

### 6. Import/Export
- CSV import (map columns to fields)
- CSV export (current view)
- Copy/paste from spreadsheet (table view)

---

## Success Criteria
- [ ] Item CRUD with validation
- [ ] Detail panel with all fields, comments, activity
- [ ] 15+ custom field types working
- [ ] Parent/child hierarchy
- [ ] Dependencies (blocks/blocked-by)
- [ ] Bulk operations (update, status, delete)
- [ ] CSV import and export
- [ ] File attachments on items
