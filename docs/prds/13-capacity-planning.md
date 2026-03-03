# PRD 13: Capacity Planning
> Phase: 3 | Priority: P2
> Status: Draft | Date: 2026-03-03

---

## Problem Statement

Product teams often overcommit because they don't have visibility into team capacity. They need to see how much work teams can handle, model different allocation scenarios, and make trade-off decisions informed by real resource constraints.

---

## Goals

1. Define team capacity (available hours/points per time period)
2. Visualize demand vs. capacity
3. Scenario planning for "what if" allocation changes
4. Align capacity with roadmap priorities

---

## Detailed Requirements

### 1. Team Setup
- Define teams with members
- Set capacity per team per time period (sprint, month, quarter)
- Capacity units: hours, story points, or custom

### 2. Demand Calculation
- Each item has an effort/estimate field
- Demand = sum of effort for items assigned to a team in a time period
- Automatically calculated from roadmap items

### 3. Capacity View
- Visual bar chart: capacity vs. demand per team per period
- Color coding: green (under), yellow (near), red (over)
- Drill down: see which items consume capacity
- Timeline: see capacity across multiple periods

### 4. Scenario Planning
- Create named scenarios (e.g., "If we add 2 engineers", "If we cut Feature X")
- Adjust team capacity or item assignments per scenario
- Compare scenarios side-by-side
- Promote scenario to actual plan

### 5. Integration with Roadmap
- Items on timeline show capacity impact
- Warning when dragging items creates over-allocation
- Filter roadmap by team capacity status

---

## Success Criteria
- [ ] Team capacity definition and management
- [ ] Demand calculation from item effort estimates
- [ ] Capacity vs. demand visualization
- [ ] Scenario planning with comparison
- [ ] Over-allocation warnings on roadmap
