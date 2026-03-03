# Technical Architecture & Stack
> Version: 1.0 | Date: 2026-03-03

---

## Recommended Tech Stack

### Frontend
| Layer | Technology | Rationale |
|---|---|---|
| Framework | **Next.js 15 (App Router)** | SSR/SSG, file-based routing, React Server Components, excellent DX |
| Language | **TypeScript** | Type safety across the entire stack |
| UI Library | **React 19** | Component model, ecosystem, hiring pool |
| Styling | **Tailwind CSS 4** | Utility-first, rapid iteration, consistent design |
| Component Library | **shadcn/ui + Radix** | Accessible, unstyled primitives we fully own |
| State Management | **Zustand** (client) + **TanStack Query** (server) | Lightweight, no boilerplate, excellent cache/sync |
| Real-time | **Socket.io client** | WebSocket abstraction with fallbacks |
| Drag & Drop | **dnd-kit** | Accessible, performant, framework-agnostic |
| Charts/Viz | **Recharts** or **Nivo** | Composable React chart components |
| Gantt/Timeline | **Custom built** on Canvas/SVG | No good OSS gantt exists; we need full control |
| Rich Text Editor | **Tiptap** (ProseMirror) | Extensible, collaborative-ready, slash commands |
| Forms | **React Hook Form + Zod** | Performant forms with schema validation |
| Date Handling | **date-fns** | Tree-shakeable, immutable |
| Testing | **Vitest + Playwright** | Unit/integration + E2E |

### Backend
| Layer | Technology | Rationale |
|---|---|---|
| Runtime | **Node.js 22** | Same language as frontend, async-native |
| Framework | **Fastify** | Faster than Express, schema validation built-in, plugin architecture |
| Language | **TypeScript** | Shared types with frontend |
| API Style | **REST + tRPC** | REST for public API, tRPC for internal frontend-backend type safety |
| Auth | **Better Auth** or **Lucia** | Self-hosted auth, supports SSO/SAML/SCIM |
| Real-time | **Socket.io** | WebSocket server with rooms, namespaces |
| Job Queue | **BullMQ** (Redis-backed) | Background jobs, scheduled tasks, retries |
| Email | **Resend** | Developer-friendly transactional email |
| File Storage | **S3-compatible** (AWS S3 / MinIO) | Attachments, exports, uploads |
| PDF Generation | **Puppeteer** or **@react-pdf** | Export roadmaps to PDF |
| AI/LLM | **OpenAI API / Anthropic API** | AI writer, summarization, sentiment |
| Testing | **Vitest + Supertest** | Unit + API integration tests |

### Database
| Layer | Technology | Rationale |
|---|---|---|
| Primary DB | **PostgreSQL 16** | Relational, JSONB for flexible fields, proven at scale |
| ORM | **Drizzle ORM** | Type-safe, SQL-like, lightweight, great migrations |
| Cache | **Redis 7** | Session cache, real-time pub/sub, job queues |
| Search | **PostgreSQL full-text** → **Meilisearch** later | Start simple, add dedicated search when needed |

### Infrastructure
| Layer | Technology | Rationale |
|---|---|---|
| Hosting | **AWS** (or Vercel + AWS hybrid) | Enterprise-grade, EU/US region support |
| Containerization | **Docker** | Consistent environments |
| Orchestration | **AWS ECS** or **Kubernetes** (later) | Start with ECS, migrate to K8s at scale |
| CI/CD | **GitHub Actions** | Native to our Git workflow |
| Monitoring | **Sentry** (errors) + **Grafana/Prometheus** (metrics) | Observability |
| Logging | **Pino** (structured) → **CloudWatch** or **Loki** | Fast structured logging |
| CDN | **CloudFront** | Static assets, edge caching |
| DNS | **Route 53** | Reliable, integrates with AWS |
| SSL | **ACM** (AWS Certificate Manager) | Free, auto-renewing certs |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                       │
│  Next.js App (React) ← tRPC Client ← Socket.io Client   │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS / WSS
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   LOAD BALANCER (ALB)                     │
└────────────┬───────────────────────┬────────────────────┘
             │                       │
             ▼                       ▼
┌────────────────────┐  ┌────────────────────────────────┐
│   Next.js Server   │  │      Fastify API Server        │
│   (SSR + Static)   │  │  ┌──────────┐ ┌─────────────┐ │
│                    │  │  │ REST API │ │  tRPC Router │ │
│                    │  │  └──────────┘ └─────────────┘ │
│                    │  │  ┌──────────┐ ┌─────────────┐ │
│                    │  │  │Socket.io │ │  Webhooks    │ │
│                    │  │  └──────────┘ └─────────────┘ │
└────────────────────┘  └──────────┬─────────────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
             ┌──────────┐  ┌──────────┐  ┌──────────────┐
             │PostgreSQL│  │  Redis   │  │  S3 / MinIO  │
             │          │  │          │  │              │
             └──────────┘  └──────────┘  └──────────────┘
                                │
                                ▼
                        ┌──────────────┐
                        │   BullMQ     │
                        │  Workers     │
                        │ (Background) │
                        └──────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ Email    │ │ AI/LLM   │ │ External │
        │ (Resend) │ │ APIs     │ │ Integr.  │
        └──────────┘ └──────────┘ └──────────┘
```

---

## Multi-Tenancy Strategy

**Approach: Shared database with tenant isolation via `workspace_id`**

- Every table has a `workspace_id` column
- Row-Level Security (RLS) in PostgreSQL enforces tenant isolation
- Application-level middleware sets tenant context per request
- Allows efficient resource usage while maintaining data isolation

---

## Database Design Principles

### Core Entities
```
Organization (tenant)
  └── Workspace(s)
       ├── App/Module configs (which building blocks are enabled)
       ├── Item Types (custom hierarchy definition)
       │    └── Items (the actual roadmap items, features, etc.)
       │         ├── Custom Field Values
       │         ├── Comments
       │         ├── Attachments
       │         ├── Priority Scores
       │         ├── Status History
       │         └── Relationships (dependencies, mirrors, parent/child)
       ├── Views (saved configurations)
       ├── Objectives / OKRs
       │    └── Key Results
       ├── Insights (feedback items)
       │    ├── Tags
       │    ├── Votes
       │    └── Linked Items
       ├── Portal(s)
       ├── Integrations (Jira, ADO, etc.)
       └── Forms (feedback collection)

User
  ├── Organization Memberships (with roles)
  └── Workspace Memberships (with permissions)
```

### Custom Fields Strategy
- Use a **EAV (Entity-Attribute-Value)** pattern combined with **JSONB columns**
- Field definitions stored in a `custom_field_definitions` table per workspace
- Field values stored in a `custom_field_values` table (item_id + field_id + value)
- JSONB column on items for denormalized quick access
- Index JSONB paths for common query patterns

---

## API Design

### Public REST API
- Versioned: `/api/v1/...`
- Standard REST conventions
- API key authentication
- Rate limiting per tenant
- Webhook subscriptions for events
- Used by: external integrations, Zapier, customer scripts

### Internal tRPC API
- Type-safe frontend ↔ backend communication
- Automatic TypeScript inference
- Used by: our Next.js frontend only
- Procedures organized by domain (items, views, insights, etc.)

---

## Authentication & Authorization

### Authentication
- Email/password with secure hashing (Argon2)
- OAuth 2.0 (Google, Microsoft)
- SAML 2.0 SSO (Okta, Azure AD, etc.)
- SCIM 2.0 provisioning (auto user/group sync)
- Session-based with secure HTTP-only cookies
- 2FA/MFA support

### Authorization
- Role-based (Organization Admin, Workspace Editor, Contributor, Viewer)
- Resource-level permissions (workspace, view, item)
- Row-Level Security in PostgreSQL as safety net
- Permission checks in application middleware

---

## Real-time Architecture

- **Socket.io** with Redis adapter for horizontal scaling
- Rooms per workspace/view for efficient broadcasting
- Events: item updates, comments, status changes, cursor positions
- Optimistic UI updates with server reconciliation
- Presence indicators (who's online, who's viewing what)

---

## Integration Architecture

### Sync Engine
- **Two-way sync** via background jobs (BullMQ)
- Configurable field mapping (stored per integration)
- Conflict resolution strategy: last-write-wins with user notification
- Webhook listeners for real-time updates from external tools
- Rate limiting and retry logic per integration
- Sync status tracking and error reporting

### Supported Integration Patterns
1. **Dev tools** (Jira, ADO, etc.) — Two-way item sync with field mapping
2. **Feedback tools** (Intercom, Slack, etc.) — One-way import of messages as feedback
3. **Webhooks** — Outbound event notifications
4. **Zapier** — Via REST API triggers/actions
5. **Embedded content** — iframe/embed support for Figma, Lucid, etc.

---

## Scalability Considerations

### Phase 1 (MVP → 100 teams)
- Single region deployment
- PostgreSQL + Redis on managed services
- Vertical scaling sufficient

### Phase 2 (100 → 1,000 teams)
- Read replicas for PostgreSQL
- Redis cluster
- CDN for static assets
- Background job workers scaled independently

### Phase 3 (1,000+ teams)
- Multi-region deployment (EU + US)
- Database sharding by organization if needed
- Dedicated search infrastructure (Meilisearch)
- Kubernetes for orchestration
- Event-driven architecture for cross-service communication
