# PRD 07: Prioritization
> Phase: 2 | Priority: P1
> Status: Draft | Date: 2026-03-03

---

## Problem Statement

Product teams struggle to decide what to build next. Prioritization is often subjective, inconsistent, or driven by the loudest voice. Teams need structured frameworks that make prioritization objective, collaborative, and transparent.

---

## Goals

1. Provide built-in prioritization frameworks (RICE, MoSCoW, Kano, custom)
2. Enable collaborative prioritization via Priority Poker
3. Visualize priorities with interactive charts
4. Connect prioritization scores to roadmap ordering

---

## Detailed Requirements

### 1. Priority Ratings App

When enabled for a workspace, adds:
- Configurable scoring criteria (custom rating fields)
- Calculated priority score (formula-based)
- Chart view for visualization
- Sorting/filtering by priority score

### 2. Built-in Frameworks

**RICE Scoring:**
- Reach (number, est. users affected)
- Impact (select: minimal/low/medium/high/massive → 0.25/0.5/1/2/3)
- Confidence (percentage: 0-100%)
- Effort (number, person-months)
- Formula: `(Reach × Impact × Confidence) / Effort`

**Value vs. Effort:**
- Value (1-10 scale or custom)
- Effort (1-10 scale or custom)
- Chart view: scatter plot with quadrants
  - Quick Wins (high value, low effort)
  - Big Bets (high value, high effort)
  - Incremental (low value, low effort)
  - Money Pit (low value, high effort)

**MoSCoW:**
- Category field: Must Have, Should Have, Could Have, Won't Have
- Group/filter items by category
- Visual distribution chart

**Kano Model:**
- Category: Basic, Performance, Excitement, Indifferent, Reverse
- Two-question survey format (functional + dysfunctional)
- Kano analysis chart

**Weighted Scoring:**
- User-defined criteria (unlimited)
- Weight per criterion (percentage, must sum to 100%)
- Score per item per criterion (1-5 or 1-10)
- Weighted total = Σ(score × weight)

**Custom Framework:**
- Define any number of scoring fields
- Define a formula combining them
- Full control over the math

### 3. Priority Poker

Collaborative prioritization game:
- Facilitator selects items to evaluate
- Each participant independently scores an item on selected criteria
- Scores are hidden until all participants have submitted
- "Reveal" shows all scores simultaneously
- Discrepancies highlighted for discussion
- After discussion, facilitator sets final score or re-votes
- Sessions can be saved and resumed
- Results feed into the priority score

### 4. Chart View (Prioritization)

Interactive chart for visualizing priorities:
- **Scatter/bubble plot** — X/Y axes mapped to any numeric field, bubble size optional
- Quadrant labels (configurable)
- Click items on chart to view/edit details
- Drag items on chart to update their scores
- Filter by status, type, or any field
- Zoom and pan

### 5. Prioritize by Insights

- Connect feedback volume/sentiment to priority score
- "Insights score" — calculated from linked feedback items
  - Number of feedback items
  - Number of unique customers
  - Revenue impact (sum of linked customer ARR)
  - Average sentiment score
- Can be used as a factor in custom scoring formulas

---

## User Flows

### Set Up Prioritization
1. Enable "Priority Ratings" app for workspace
2. Choose a framework (RICE, custom, etc.) or create custom
3. Configure criteria, weights, and formula
4. Priority fields appear on all items

### Score Items
1. Open any item → see scoring section
2. Enter scores for each criterion
3. Calculated priority score updates automatically
4. All views can sort/filter by priority

### Run Priority Poker Session
1. Click "Start Priority Poker" from workspace
2. Select items to evaluate (or filter)
3. Invite participants
4. Each item shown one-at-a-time
5. Everyone votes independently
6. Reveal → discuss → finalize score
7. Move to next item
8. Export session results

---

## Technical Notes

- Scoring formulas parsed and evaluated safely (no `eval()`)
- Use a formula parser library (e.g., `mathjs` expression parser)
- Chart rendering via Recharts or Nivo (React-based)
- Priority Poker uses Socket.io rooms for real-time voting
- Scores stored in `custom_field_values` table (reuses custom field infrastructure)
- Insights score recalculated asynchronously when feedback changes (BullMQ job)

---

## Success Criteria

- [ ] RICE, Value vs Effort, MoSCoW, and Weighted Scoring frameworks
- [ ] Custom scoring framework builder
- [ ] Priority scores calculated automatically from formula
- [ ] Priority Poker with real-time multi-player voting
- [ ] Chart view (scatter/bubble) with interactive drag-to-score
- [ ] Prioritize by Insights score
- [ ] Sort/filter any view by priority score
- [ ] Framework templates (pre-configured scoring setups)
