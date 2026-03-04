#!/usr/bin/env node
/**
 * Demo seed script — populates a Focus account with realistic PM data.
 *
 * Usage:
 *   node scripts/seed-demo.mjs <API_URL>
 *
 * Example:
 *   node scripts/seed-demo.mjs https://airfocus-production.up.railway.app
 *
 * The script will create a new account, workspace, and populate it with
 * items, objectives, key results, and feedback entries.
 */

const API_URL = process.argv[2] || "http://localhost:3001";

// ── helpers ──────────────────────────────────────────────────────────
let sessionCookie = "";

async function rpc(path, input, isMutation = false) {
  const wrapped = { json: input ?? {} };

  const url = isMutation
    ? `${API_URL}/trpc/${path}`
    : `${API_URL}/trpc/${path}?input=${encodeURIComponent(JSON.stringify(wrapped))}`;

  const res = await fetch(url, {
    method: isMutation ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json",
      ...(sessionCookie ? { Cookie: sessionCookie } : {}),
    },
    body: isMutation ? JSON.stringify(wrapped) : undefined,
  });

  // Capture set-cookie
  const setCookie = res.headers.get("set-cookie");
  if (setCookie) {
    const match = setCookie.match(/session=([^;]+)/);
    if (match) sessionCookie = `session=${match[1]}`;
  }

  const json = await res.json();
  if (json.error) {
    throw new Error(`${path}: ${JSON.stringify(json.error)}`);
  }
  return json.result?.data?.json ?? json.result?.data;
}

function mut(path, input) {
  return rpc(path, input, true);
}

function query(path, input) {
  return rpc(path, input, false);
}

function randomDate(startDaysAgo, endDaysFromNow) {
  const now = Date.now();
  const start = now - startDaysAgo * 86400000;
  const end = now + endDaysFromNow * 86400000;
  return new Date(start + Math.random() * (end - start)).toISOString();
}

// ── main ─────────────────────────────────────────────────────────────
async function main() {
  console.log(`Seeding demo data on ${API_URL}...\n`);

  // 1. Sign up
  console.log("1. Creating demo account...");
  const { user } = await mut("auth.signUp", {
    name: "Alex Morgan",
    email: "alex@focuspm.io",
    password: "Demo2026!secure",
  });
  console.log(`   Created user: ${user.name} (${user.email})`);

  // 2. Get org
  const me = await query("auth.me");
  const orgId = me.defaultOrganizationId;
  console.log(`   Org ID: ${orgId}`);

  // 3. Create workspace
  console.log("\n2. Creating workspace...");
  const workspace = await mut("workspace.create", {
    organizationId: orgId,
    name: "Focus Product Roadmap",
    description: "Q2 2026 product planning and execution",
  });
  const wsId = workspace.id;
  console.log(`   Workspace: ${workspace.name}`);

  // Get statuses and item types
  const wsData = await query("workspace.getById", { id: wsId });
  const statuses = wsData.statuses;
  const itemTypes = wsData.itemTypes;

  const statusByName = {};
  for (const s of statuses) statusByName[s.name.toLowerCase()] = s;

  const typeByName = {};
  for (const t of itemTypes) typeByName[t.name.toLowerCase()] = t;

  const backlog = statusByName["backlog"] || statuses.find(s => s.category === "not_started");
  const todo = statusByName["to do"] || statuses.find(s => s.category === "not_started");
  const inProgress = statusByName["in progress"] || statuses.find(s => s.category === "in_progress");
  const inReview = statusByName["in review"] || statuses.find(s => s.category === "in_progress");
  const done = statusByName["done"] || statuses.find(s => s.category === "done");

  const initiative = typeByName["initiative"] || itemTypes[0];
  const feature = typeByName["feature"] || itemTypes[1] || itemTypes[0];
  const story = typeByName["story"] || itemTypes[2] || itemTypes[0];

  console.log(`   Statuses: ${statuses.map(s => s.name).join(", ")}`);
  console.log(`   Types: ${itemTypes.map(t => t.name).join(", ")}`);

  // 4. Create items
  console.log("\n3. Creating items...");
  const items = [
    // Initiatives
    { title: "User Onboarding Revamp", description: "Redesign the first-time user experience to reduce time-to-value from 15 minutes to under 3 minutes. Includes new wizard, contextual tooltips, and sample data.", type: initiative, status: inProgress, startDate: -14, endDate: 30, scores: { impact: 9, effort: 7, confidence: 8, reach: 8 } },
    { title: "Enterprise SSO & Permissions", description: "Add SAML/OIDC SSO support, role-based access control, and audit logging for enterprise customers. Critical for closing Q2 enterprise deals.", type: initiative, status: todo, startDate: 5, endDate: 60, scores: { impact: 10, effort: 9, confidence: 7, reach: 6 } },
    { title: "Mobile App (iOS + Android)", description: "Native mobile companion app for reviewing roadmaps, approving items, and receiving push notifications on the go.", type: initiative, status: backlog, startDate: 30, endDate: 120, scores: { impact: 7, effort: 10, confidence: 5, reach: 9 } },

    // Features — Onboarding
    { title: "Interactive workspace setup wizard", description: "Step-by-step guide that creates a workspace with sample items, custom fields, and a default board view.", type: feature, status: inReview, startDate: -14, endDate: 2, scores: { impact: 8, effort: 4, confidence: 9, reach: 8 } },
    { title: "Contextual help tooltips", description: "Smart tooltips that appear when users hover over UI elements for the first time. Dismissible and resettable from settings.", type: feature, status: inProgress, startDate: -7, endDate: 7, scores: { impact: 6, effort: 3, confidence: 9, reach: 8 } },
    { title: "Sample data template packs", description: "Pre-built templates: SaaS Roadmap, Mobile App, Marketing Campaign, Agency Projects. Users pick one during onboarding.", type: feature, status: todo, startDate: 3, endDate: 18, scores: { impact: 7, effort: 5, confidence: 8, reach: 7 } },

    // Features — Core
    { title: "Drag-and-drop timeline view", description: "Allow users to drag item start/end dates directly on the timeline. Snap to week boundaries with shift key for precise control.", type: feature, status: done, startDate: -30, endDate: -5, scores: { impact: 8, effort: 6, confidence: 10, reach: 7 } },
    { title: "Custom field formulas", description: "Calculated fields that derive values from other fields. Support basic math, conditionals, and date diff operations.", type: feature, status: inProgress, startDate: -10, endDate: 14, scores: { impact: 7, effort: 8, confidence: 6, reach: 5 } },
    { title: "Bulk item operations", description: "Multi-select items in any view and apply bulk actions: change status, assign, set dates, move to workspace, archive, or delete.", type: feature, status: todo, startDate: 7, endDate: 21, scores: { impact: 8, effort: 5, confidence: 8, reach: 9 } },
    { title: "CSV import/export", description: "Import items from CSV with smart column mapping. Export any view to CSV with configurable columns.", type: feature, status: backlog, startDate: null, endDate: null, scores: { impact: 6, effort: 4, confidence: 9, reach: 6 } },
    { title: "Real-time collaboration indicators", description: "Show live cursors and who's viewing/editing an item. Prevent conflicting edits with optimistic locking.", type: feature, status: backlog, startDate: null, endDate: null, scores: { impact: 5, effort: 7, confidence: 5, reach: 8 } },

    // Features — Integrations
    { title: "Jira two-way sync", description: "Sync epics and stories between Focus and Jira. Map custom fields, sync status changes, and handle conflicts gracefully.", type: feature, status: todo, startDate: 14, endDate: 45, scores: { impact: 9, effort: 9, confidence: 6, reach: 7 } },
    { title: "Slack notifications & feedback bot", description: "Post updates to Slack channels. Collect feedback via a /focus slash command that creates feedback entries.", type: feature, status: inProgress, startDate: -5, endDate: 10, scores: { impact: 7, effort: 5, confidence: 8, reach: 8 } },
    { title: "GitHub issue sync", description: "Bidirectional sync between Focus items and GitHub issues. Auto-link PRs to items.", type: feature, status: backlog, startDate: null, endDate: null, scores: { impact: 6, effort: 6, confidence: 7, reach: 5 } },

    // Stories
    { title: "Add progress bar to item cards", description: "Show a small progress indicator on board cards when sub-items exist. Color-coded by completion percentage.", type: story, status: done, startDate: -20, endDate: -12, scores: { impact: 4, effort: 2, confidence: 10, reach: 7 } },
    { title: "Keyboard shortcuts for power users", description: "Implement vim-style navigation: j/k to move, enter to open, c to create, / to search, ? to show help overlay.", type: story, status: inProgress, startDate: -3, endDate: 5, scores: { impact: 5, effort: 3, confidence: 9, reach: 4 } },
    { title: "Dark mode polish pass", description: "Fix contrast issues in dark mode: low-contrast borders, unreadable badges, timeline grid lines, and priority score colors.", type: story, status: done, startDate: -10, endDate: -3, scores: { impact: 3, effort: 2, confidence: 10, reach: 8 } },
    { title: "Notification preferences page", description: "Let users configure which events trigger email and in-app notifications. Per-workspace granularity.", type: story, status: todo, startDate: 10, endDate: 17, scores: { impact: 5, effort: 4, confidence: 8, reach: 6 } },
  ];

  const createdItems = [];
  for (const item of items) {
    const now = new Date();
    const created = await mut("item.create", {
      workspaceId: wsId,
      title: item.title,
      description: item.description,
      itemTypeId: item.type?.id ?? feature.id,
      statusId: item.status?.id ?? backlog.id,
      ...(item.startDate != null ? { startDate: new Date(now.getTime() + item.startDate * 86400000).toISOString() } : {}),
      ...(item.endDate != null ? { endDate: new Date(now.getTime() + item.endDate * 86400000).toISOString() } : {}),
    });

    // Set priority scores via update
    if (item.scores) {
      await mut("item.update", {
        id: created.id,
        data: {
          customFields: { priorityScores: item.scores },
        },
      });
    }

    createdItems.push(created);
    console.log(`   [${item.status?.name ?? "?"}] ${item.title}`);
  }

  // 5. Create objectives
  console.log("\n4. Creating OKRs...");
  const objectives = [
    {
      title: "Accelerate user activation",
      description: "Get new users to their 'aha moment' faster by streamlining onboarding and reducing friction.",
      period: "Q2 2026",
      status: "on_track",
      progress: 45,
      keyResults: [
        { title: "Reduce median time-to-first-item from 12min to 3min", targetValue: 3, currentValue: 6, startValue: 12, unit: "minutes" },
        { title: "Increase Day-7 retention from 35% to 55%", targetValue: 55, currentValue: 42, startValue: 35, unit: "%" },
        { title: "Achieve 4.5+ onboarding satisfaction score", targetValue: 4.5, currentValue: 4.1, startValue: 3.8, unit: "/ 5" },
      ],
    },
    {
      title: "Win 5 enterprise accounts",
      description: "Close enterprise deals by shipping SSO, audit logs, and advanced permissions.",
      period: "Q2 2026",
      status: "at_risk",
      progress: 20,
      keyResults: [
        { title: "Ship SSO (SAML + OIDC) to production", targetValue: 100, currentValue: 30, startValue: 0, unit: "%" },
        { title: "Close 5 enterprise contracts ($50k+ ARR each)", targetValue: 5, currentValue: 1, startValue: 0, unit: "deals" },
        { title: "Achieve SOC 2 Type II certification", targetValue: 100, currentValue: 15, startValue: 0, unit: "%" },
      ],
    },
    {
      title: "Build a feedback-driven culture",
      description: "Create a tight loop between customer feedback and product decisions.",
      period: "Q2 2026",
      status: "on_track",
      progress: 60,
      keyResults: [
        { title: "Process 500+ feedback entries per month", targetValue: 500, currentValue: 320, startValue: 80, unit: "entries" },
        { title: "Link 80% of shipped features to customer feedback", targetValue: 80, currentValue: 55, startValue: 25, unit: "%" },
        { title: "Launch public feedback portal with 200+ voters", targetValue: 200, currentValue: 85, startValue: 0, unit: "voters" },
      ],
    },
    {
      title: "Achieve product-market fit metrics",
      description: "Hit the benchmarks that indicate strong product-market fit.",
      period: "Q2 2026",
      status: "on_track",
      progress: 55,
      keyResults: [
        { title: "Reach 40% 'very disappointed' on PMF survey", targetValue: 40, currentValue: 33, startValue: 22, unit: "%" },
        { title: "Grow WAU to 2,000", targetValue: 2000, currentValue: 1400, startValue: 800, unit: "users" },
        { title: "Net revenue retention above 110%", targetValue: 110, currentValue: 105, startValue: 95, unit: "%" },
      ],
    },
  ];

  for (const obj of objectives) {
    const created = await mut("objective.create", {
      workspaceId: wsId,
      title: obj.title,
      description: obj.description,
      period: obj.period,
      status: obj.status,
    });

    // Update progress
    await mut("objective.update", {
      id: created.id,
      data: { progress: obj.progress },
    });

    console.log(`   [${obj.status}] ${obj.title} (${obj.progress}%)`);

    // Add key results
    for (const kr of obj.keyResults) {
      const createdKr = await mut("objective.createKeyResult", {
        objectiveId: created.id,
        title: kr.title,
        targetValue: kr.targetValue,
        unit: kr.unit,
      });

      await mut("objective.updateKeyResult", {
        id: createdKr.id,
        data: {
          currentValue: kr.currentValue,
          startValue: kr.startValue,
        },
      });

      console.log(`     KR: ${kr.title} (${kr.currentValue}/${kr.targetValue} ${kr.unit})`);
    }
  }

  // 6. Create feedback entries
  console.log("\n5. Creating feedback entries...");
  const feedbackEntries = [
    { title: "Need ability to export roadmap as PDF", description: "Our stakeholders want a printable version of the roadmap for board meetings. Currently we have to screenshot.", source: "intercom", status: "planned", votes: 24, submitterName: "Sarah Chen", submitterEmail: "sarah@acmecorp.com", tags: ["export", "roadmap"] },
    { title: "Integrate with Linear for eng team", description: "Our engineering team uses Linear and we need items to sync between Focus and Linear automatically.", source: "email", status: "reviewed", votes: 18, submitterName: "Marcus Johnson", submitterEmail: "marcus@techstart.io", tags: ["integration", "linear"] },
    { title: "Custom color themes for workspaces", description: "Would love to color-code different workspaces so I can quickly identify which product I'm working on.", source: "portal", status: "new", votes: 31, submitterName: "Priya Patel", submitterEmail: "priya@designhub.co", tags: ["ux", "customization"] },
    { title: "API rate limit is too low", description: "We're hitting the 600 req/min limit when doing bulk imports. Need at least 2000 req/min for our use case.", source: "api", status: "reviewed", votes: 8, submitterName: "DevOps Team", submitterEmail: "ops@bigcorp.com", tags: ["api", "performance"] },
    { title: "Love the priority scoring! Can we add custom formulas?", description: "RICE is great but we want to add a 'strategic alignment' factor. Custom formula support would be amazing.", source: "slack", status: "planned", votes: 42, submitterName: "Jordan Lee", submitterEmail: "jordan@prodmgmt.com", tags: ["prioritization", "feature-request"] },
    { title: "Board view cards should show assignee avatar", description: "Hard to tell at a glance who owns what. A small avatar in the corner of each card would help a lot.", source: "portal", status: "in_progress", votes: 15, submitterName: "Emma Wilson", submitterEmail: "emma@startupxyz.com", tags: ["ux", "board-view"] },
    { title: "Gantt chart with dependency arrows", description: "We need to visualize blockers and dependencies on the timeline. Critical for sprint planning.", source: "intercom", status: "planned", votes: 37, submitterName: "Tom Baker", submitterEmail: "tom@agencyplus.com", tags: ["timeline", "dependencies"] },
    { title: "Slack bot for quick item creation", description: "Want to type /focus create 'Bug: login broken' and have it create an item directly. Our team lives in Slack.", source: "slack", status: "new", votes: 22, submitterName: "Nina Rodriguez", submitterEmail: "nina@remotefirst.io", tags: ["integration", "slack"] },
    { title: "Multi-language support", description: "Our team is global. Would love to have the UI in German, French, and Japanese at minimum.", source: "email", status: "new", votes: 11, submitterName: "Kenji Tanaka", submitterEmail: "kenji@globaltech.jp", tags: ["i18n", "enterprise"] },
    { title: "Absolutely love this tool - replaced 3 others for us", description: "Just wanted to say Focus replaced Jira, Productboard, and Notion for our PM workflow. The priority scoring is chef's kiss.", source: "portal", status: "completed", votes: 56, submitterName: "Alex Rivera", submitterEmail: "alex@happycustomer.com", tags: ["testimonial", "positive"] },
  ];

  for (const fb of feedbackEntries) {
    const created = await mut("feedback.create", {
      workspaceId: wsId,
      title: fb.title,
      description: fb.description,
      source: fb.source,
      submitterName: fb.submitterName,
      submitterEmail: fb.submitterEmail,
      tags: fb.tags,
    });

    // Update status
    if (fb.status !== "new") {
      await mut("feedback.update", {
        id: created.id,
        data: { status: fb.status },
      });
    }

    // Add votes
    for (let i = 0; i < fb.votes; i++) {
      await mut("feedback.vote", { id: created.id });
    }

    console.log(`   [${fb.votes} votes] ${fb.title}`);
  }

  // 7. Add some comments to items
  console.log("\n6. Adding comments...");
  const commentTargets = [
    { idx: 0, text: "Spoke with 5 churned users last week — all mentioned onboarding complexity as the #1 reason they left. This is our highest-leverage initiative." },
    { idx: 0, text: "Design team has the new wizard mockups ready. Moving to eng sprint next week." },
    { idx: 3, text: "Prototype is looking great! Testing with 3 beta users tomorrow. Initial feedback is very positive." },
    { idx: 6, text: "Shipped! Timeline drag-and-drop is live. Already seeing 40% more items with dates set." },
    { idx: 7, text: "The formula parser is trickier than expected. Might need an extra sprint for edge cases with date calculations." },
    { idx: 11, text: "Had a great call with Atlassian's partnership team. They're supportive of the integration — will share their sandbox credentials." },
    { idx: 12, text: "Slack app is approved for their marketplace! Just finishing up the OAuth flow." },
  ];

  for (const c of commentTargets) {
    if (createdItems[c.idx]) {
      await mut("item.addComment", {
        itemId: createdItems[c.idx].id,
        content: c.text,
      });
      console.log(`   Comment on: ${createdItems[c.idx].title.slice(0, 50)}...`);
    }
  }

  console.log("\n========================================");
  console.log("Demo data seeded successfully!");
  console.log("========================================");
  console.log(`\nLogin credentials:`);
  console.log(`  Email:    alex@focuspm.io`);
  console.log(`  Password: Demo2026!secure`);
  console.log(`\nWorkspace: Focus Product Roadmap`);
  console.log(`  - ${createdItems.length} items across all views`);
  console.log(`  - ${objectives.length} objectives with ${objectives.reduce((s, o) => s + o.keyResults.length, 0)} key results`);
  console.log(`  - ${feedbackEntries.length} feedback entries`);
  console.log(`  - ${commentTargets.length} comments`);
}

main().catch((err) => {
  console.error("\nSeed failed:", err.message);
  process.exit(1);
});
