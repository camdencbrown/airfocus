# PRD 08: Feedback & Insights
> Phase: 2 | Priority: P1
> Status: Draft | Date: 2026-03-03

---

## Problem Statement

Product teams receive feedback from dozens of sources — support tickets, sales calls, user interviews, surveys, social media. Without a centralized system, valuable insights get lost, patterns go unnoticed, and product decisions are made with incomplete data.

---

## Goals

1. Centralize feedback from all channels in one place
2. AI-powered analysis to surface patterns and sentiment
3. Link feedback directly to roadmap items for evidence-based prioritization
4. Enable teams to close the feedback loop with customers

---

## Detailed Requirements

### 1. Feedback Collection

**Sources:**
- Manual entry (team members paste/type feedback)
- Custom forms (embeddable, shareable feedback forms)
- Portal submissions (from branded portal)
- Integration imports (Intercom, Slack, MS Teams, Zendesk, Salesforce)
- Email forwarding (dedicated email → auto-creates feedback item)
- Chrome extension (capture from any webpage)
- API (programmatic submission)

**Feedback Item Fields:**
- `title` — short summary
- `description` — full feedback text (rich text)
- `source` — where it came from (manual, intercom, portal, etc.)
- `source_url` — original URL if applicable
- `customer_name` — who gave the feedback
- `customer_email` — contact info
- `customer_company` — organization
- `customer_segment` — enterprise, SMB, etc. (custom)
- `customer_revenue` — ARR for revenue-weighted scoring
- `sentiment` — positive/neutral/negative (AI-detected or manual)
- `tags` — categorization labels
- `status` — new, reviewed, linked, addressed, closed
- `linked_items` — roadmap items this feedback relates to
- `votes` — upvote count from portal/team
- `created_at`, `updated_at`

### 2. Inbox View

Dedicated view for processing incoming feedback:
- Stream/list of unprocessed feedback
- Quick actions: tag, link to item, change status, merge
- Bulk operations (select multiple → bulk tag/link/archive)
- Filter by source, date, sentiment, customer segment
- Sort by recency, votes, revenue impact

### 3. Insights Aggregation

Transform raw feedback into insights:
- **Insight** = a theme/pattern extracted from multiple feedback items
- Group related feedback under insights
- Each insight has:
  - Title, description
  - Linked feedback items (evidence)
  - Insight score (calculated from volume, revenue, sentiment)
  - Linked roadmap items
  - Status (open, planned, shipped)

### 4. AI Features

- **Auto-tagging** — AI categorizes feedback on arrival
- **Sentiment analysis** — positive/neutral/negative classification
- **Duplicate detection** — flag similar feedback for merging
- **Insight summaries** — AI summarizes clusters of related feedback
- **Theme extraction** — identify recurring patterns across feedback

### 5. Insight Scoring

Calculated score for each insight/feedback cluster:
- **Volume** — number of feedback items
- **Reach** — number of unique customers
- **Revenue** — total ARR of requesting customers
- **Sentiment** — average sentiment (negative feedback weighs more)
- **Recency** — recent feedback weighs more
- Configurable weights for each factor
- Score usable in prioritization formulas

### 6. Custom Forms

Build branded feedback collection forms:
- Drag-and-drop form builder
- Field types: text, textarea, select, rating, file upload
- Custom branding (logo, colors)
- Embeddable via iframe or standalone URL
- Submissions auto-create feedback items
- Optional fields for customer info
- Thank you / confirmation page

### 7. Voting & Reactions

- Team members and portal users can upvote feedback/insights
- Reaction options (e.g., thumbs up, important, me too)
- Vote count visible and usable in scoring
- De-duplicate votes per user

### 8. Feedback Loop

Close the loop with customers who gave feedback:
- Track which customers requested what
- When a linked item ships, notify relevant customers
- Status updates: "We heard you" → "We're working on it" → "It's live!"
- Manual or automated notifications

---

## User Flows

### Process Incoming Feedback
1. Open Inbox view
2. Review new feedback item
3. AI suggests tags and sentiment (accept/modify)
4. Link to existing roadmap item or create new one
5. Mark as "Reviewed"
6. Feedback now contributes to item's insight score

### Build a Feedback Form
1. Navigate to Forms section
2. Create new form
3. Add fields (drag-and-drop builder)
4. Customize branding
5. Publish form → get embeddable URL/code
6. Submissions appear in Inbox

---

## Technical Notes

- Feedback items stored in same `items` table with a special item type, or in a separate `feedback_items` table (TBD based on query patterns)
- AI features use background jobs (BullMQ) calling LLM APIs
- Sentiment analysis: batch process on new feedback, store result as field
- Insight score recalculated asynchronously when feedback changes
- Forms schema stored as JSON; rendered client-side dynamically
- Voting uses a `votes` table (user_id, entity_id, entity_type)

---

## Success Criteria

- [ ] Manual feedback entry and import from integrations
- [ ] Inbox view with bulk actions
- [ ] AI auto-tagging and sentiment analysis
- [ ] Insights aggregation (group feedback into themes)
- [ ] Insight scoring (volume, revenue, sentiment)
- [ ] Custom forms builder with embedding
- [ ] Voting and reactions
- [ ] Link feedback to roadmap items
- [ ] Feedback status tracking
