# PRD 11: Integrations Engine
> Phase: 2 | Priority: P1
> Status: Draft | Date: 2026-03-03

---

## Problem Statement

Product teams don't work in isolation — engineers use Jira/GitHub, sales uses Salesforce, support uses Zendesk, and everyone uses Slack. The platform must connect with these tools bidirectionally to be the single source of truth without requiring teams to abandon existing workflows.

---

## Goals

1. Build a generic integrations engine that supports two-way sync
2. Ship Jira as the first and most critical integration
3. Support one-way imports from feedback tools
4. Provide webhooks and API for custom integrations

---

## Detailed Requirements

### 1. Integration Engine (Generic)

A reusable framework for all integrations:

**Connection Management:**
- OAuth 2.0 flow for connecting external accounts
- Credential storage (encrypted at rest)
- Connection health monitoring (detect expired tokens, API errors)
- Per-workspace integration configuration

**Field Mapping:**
- Map external fields to internal fields (and vice versa)
- Default mappings provided, fully customizable
- Support for: text, number, select, date, person, status
- Transform rules (e.g., external status "In Dev" → internal "In Progress")

**Sync Engine:**
- **Real-time sync** — webhook listeners from external tools for instant updates
- **Polling sync** — periodic fetch for tools without webhooks
- **Manual sync** — user-triggered full resync
- Conflict resolution: configurable (last-write-wins, ours-wins, manual)
- Sync status per item (synced, pending, error, conflict)
- Sync history log (what changed, when, direction)
- Rate limiting per external API

**Filter Rules:**
- Define which external items to sync (e.g., Jira JQL filter)
- Define which internal items to push (e.g., items with status "Approved")
- Prevent sync loops (detect and skip echo updates)

### 2. Jira Integration (Priority #1)

**Capabilities:**
- Import Jira issues into workspace (filtered by JQL)
- Push items from workspace to Jira
- Two-way sync of mapped fields
- Jira Cloud + Jira Server support

**Field Mapping:**
- Standard: summary, description, status, assignee, priority, labels, epic
- Custom Jira fields → custom workspace fields
- Jira hierarchy: Epic → Story → Sub-task mapped to item type hierarchy

**Jira-Specific Features:**
- Custom JQL for import filtering
- Display priority score as a Jira custom field
- See parent-child relationships from Jira in workspace
- Sprint/iteration mapping
- Jira comment sync (optional)

### 3. Azure DevOps Integration

- Work item sync (two-way)
- Area path mapping (two-way)
- Iteration path mapping (two-way)
- Hierarchy mapping & sync
- Cloud + Server support (Server = Enterprise only)

### 4. Other Dev Tool Integrations

Each follows the same engine pattern:
- **GitHub** — Issues and Projects sync
- **Linear** — Issue sync with project mapping
- **Trello** — Card sync
- **Asana** — Task sync
- **Shortcut** — Story sync
- **Microsoft Planner** — Task sync

### 5. Feedback Tool Integrations (One-way import)

- **Intercom** — Conversations/messages → feedback items
- **Slack** — Messages from specific channels → feedback items
- **Microsoft Teams** — Messages → feedback items
- **Zendesk** — Tickets → feedback items
- **Salesforce** — Cases/opportunities → feedback items (Enterprise only)

### 6. Webhooks (Outbound)

Allow external systems to react to platform events:
- Configurable per workspace
- Events: item.created, item.updated, item.deleted, status.changed, comment.added
- HTTP POST to user-specified URL
- HMAC-SHA256 signature for verification
- Retry logic (exponential backoff, max 5 retries)
- Webhook delivery log (success/fail, response code)
- Payload includes full item data + change delta

### 7. Zapier Integration

- Platform registered as a Zapier app
- **Triggers:** item created, item updated, status changed, feedback received
- **Actions:** create item, update item, add feedback
- **Searches:** find item by field
- Enables 2000+ app connections via Zapier

### 8. Embedded Content

- Support embedding external content in items/documents:
  - Figma designs
  - Lucid charts
  - Miro boards
  - Google Docs/Sheets
  - YouTube videos
  - Generic iframe/oEmbed

---

## Technical Notes

- Integration engine is a **plugin system** — each integration implements a standard interface
- Sync jobs run as BullMQ background workers
- Each integration has its own job queue with rate limiting
- Credentials encrypted with AES-256-GCM, key in AWS KMS
- Webhook receiver endpoints per integration (e.g., `/api/webhooks/jira`)
- Sync state stored in `integration_sync_state` table (per item, per integration)
- Idempotency keys prevent duplicate processing

### Integration Interface
```typescript
interface Integration {
  id: string;
  name: string;
  connect(config: ConnectionConfig): Promise<Connection>;
  disconnect(connectionId: string): Promise<void>;
  getFieldMappingSchema(): FieldMappingSchema;
  importItems(connection: Connection, filter: FilterConfig): AsyncGenerator<ExternalItem>;
  pushItem(connection: Connection, item: InternalItem): Promise<ExternalItem>;
  syncItem(connection: Connection, item: SyncedItem, direction: 'in' | 'out'): Promise<SyncResult>;
  handleWebhook(payload: unknown): Promise<WebhookResult>;
}
```

---

## Success Criteria

- [ ] Generic integration engine with field mapping and two-way sync
- [ ] Jira Cloud integration (import, push, two-way sync, JQL, hierarchy)
- [ ] Azure DevOps Cloud integration
- [ ] At least 2 feedback tool integrations (Intercom, Slack)
- [ ] Outbound webhooks with HMAC signing and retry
- [ ] Zapier app (triggers + actions)
- [ ] Sync status tracking per item
- [ ] Conflict detection and resolution
- [ ] Integration health monitoring and error alerting
