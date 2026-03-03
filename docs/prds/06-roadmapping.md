# PRD 06: Roadmapping
> Phase: 1 | Priority: P0
> Status: Draft | Date: 2026-03-03

---

## Problem Statement

Product teams need to visualize their plans and communicate strategy to stakeholders. Roadmaps must be dynamic (not static slides), support multiple audiences (engineers vs. executives), and stay connected to the underlying data.

---

## Goals

1. Enable teams to build and share beautiful, dynamic roadmaps
2. Support multiple visualization formats for different audiences
3. Keep roadmaps as live views of real data (not separate artifacts)
4. Make roadmap creation fast with templates and drag-and-drop

---

## Detailed Requirements

### 1. Roadmap as a View

A roadmap is fundamentally a **saved view** with timeline/board/gantt visualization. This means:
- All items in the roadmap come from the workspace item database
- Filters determine which items appear on the roadmap
- The roadmap updates automatically as items change
- Multiple roadmaps can exist per workspace (different audiences/scopes)

### 2. Roadmap-Specific Features

**Item Planning:**
- Assign date ranges to items (planned start → planned end)
- Drag items on timeline to adjust dates
- Resize item bars to change duration
- Set milestones (fixed-date markers)
- Dependencies between items (finish-to-start)
- Color coding by status, priority, item type, or any field

**Hierarchy in Roadmaps:**
- Show parent items with expandable children
- Roll-up: parent date range auto-calculated from children
- Progress: parent progress derived from child status distribution

**Swimlanes & Grouping:**
- Group by team, product area, objective, status, or any field
- Collapsible swimlane rows
- Swimlane summaries (item count, progress)

### 3. Roadmap Templates

Pre-built configurations users can start from:
- **Product Roadmap** — Timeline grouped by product area, items are features
- **Technology Roadmap** — Timeline grouped by system/platform
- **Release Plan** — Gantt with dependencies, grouped by release
- **Now/Next/Later** — Board with 3 columns, no dates required
- **Sprint Roadmap** — Timeline grouped by sprint/iteration
- **Objective-led Roadmap** — Items grouped under OKR objectives

### 4. Sharing & Communication

- **Share link** — read-only public URL with optional password
- **Embed** — embeddable iframe for wikis, Notion, Confluence
- **PDF export** — print-quality roadmap export
- **Presentation mode** — full-screen, clean view for meetings
- **Remove branding** — Enterprise feature for white-label shares

### 5. Now/Next/Later Roadmap (Board-based)

An alternative to timeline-based roadmaps:
- Three columns: Now, Next, Later
- No specific dates (reduces commitment anxiety)
- Items ranked within each column
- Great for communicating strategy without date pressure

---

## User Flows

### Create a Roadmap
1. Click "+" in workspace sidebar → "New View"
2. Select view type (Timeline, Board, Gantt)
3. Choose a template or start blank
4. Configure filters (which items to include)
5. Set grouping (swimlanes)
6. Roadmap is live and auto-updates

### Share a Roadmap
1. Click "Share" on any roadmap view
2. Generate share link (copies to clipboard)
3. Optionally set password, expiry
4. Send link to stakeholders
5. Stakeholders see read-only, always-up-to-date roadmap

### Plan Work on Roadmap
1. Open Timeline/Gantt view
2. Drag an item to set its date range
3. Resize to adjust duration
4. Draw dependency arrow between items
5. Changes immediately reflected in all views

---

## Technical Notes

- Timeline/Gantt rendering on HTML Canvas or SVG for performance
- Virtual rendering for roadmaps with 200+ items
- Dependency arrows use path-finding algorithm (avoid overlaps)
- Date calculations use workspace timezone
- Share links served via separate lightweight route (no auth required, SSR'd)
- PDF export via headless browser (Puppeteer) rendering the share view

---

## Success Criteria

- [ ] Timeline roadmap with drag-to-plan and resize
- [ ] Board roadmap (Now/Next/Later style)
- [ ] Grouping/swimlanes by any field
- [ ] Dependencies (visual arrows + data model)
- [ ] Milestones
- [ ] At least 3 roadmap templates available
- [ ] Share links (public, optional password)
- [ ] PDF export
- [ ] Presentation mode
- [ ] Roadmap renders smoothly with 200+ items
