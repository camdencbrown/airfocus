# PRD 15: Collaboration & Real-time
> Phase: 1 | Priority: P0
> Status: Draft | Date: 2026-03-03

---

## Problem Statement

Product management is a team sport. Multiple people edit items, comment on decisions, and need to see each other's changes instantly. Without real-time collaboration, teams face stale data, conflicts, and communication gaps.

---

## Goals

1. Real-time updates across all views (see changes instantly)
2. Rich commenting and discussion system
3. Notifications that keep people informed without overwhelming them
4. Presence awareness (who's online, who's looking at what)

---

## Detailed Requirements

### 1. Real-time Updates
- All item changes broadcast to connected users in the same workspace
- Optimistic UI updates (instant local, reconcile with server)
- View-level subscriptions (only receive updates for visible items)
- Conflict handling: last-write-wins with visual indication

### 2. Comments
- Threaded comments on any item
- Rich text (formatting, links, @mentions)
- @mention users → notification
- Edit/delete own comments
- Reactions on comments (emoji)
- Activity stream: comments mixed with status changes

### 3. Notifications
- In-app notification center
- Email notifications (configurable)
- Notification triggers:
  - @mentioned in comment
  - Item you own/follow is updated
  - Status change on followed items
  - New feedback linked to your items
  - Assignment changes
- Notification preferences per user (per trigger type: in-app, email, off)
- "Follow" any item to receive updates

### 4. Presence
- Online indicators on user avatars
- "Currently viewing" indicators on items/views
- Cursor/selection awareness in collaborative editing (Phase 3)

### 5. Activity Feed
- Per-item: complete history of changes, comments, status updates
- Per-workspace: stream of recent activity across all items
- Filterable by type (comments, status changes, field updates)

---

## Technical Notes
- Socket.io with Redis adapter for pub/sub across server instances
- Room-based subscriptions: one room per workspace, one per open view
- Presence tracked in Redis with TTL (auto-expire on disconnect)
- Notifications stored in `notifications` table, delivered via SSE or polling
- Email notifications batched (digest mode: instant, hourly, daily)

---

## Success Criteria
- [ ] Real-time item updates across all connected clients
- [ ] Threaded comments with @mentions
- [ ] In-app notification center
- [ ] Email notifications with configurable preferences
- [ ] Presence indicators (online, viewing)
- [ ] Activity feed per item and per workspace
