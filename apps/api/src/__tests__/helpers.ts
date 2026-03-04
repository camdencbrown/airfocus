/**
 * Test helpers — creates a tRPC caller with a real DB connection
 * for integration tests against the local PostgreSQL.
 */
import { createDb, type Database, users, organizations, organizationMembers, sessions, workspaces, workspaceMembers, items, statuses, itemTypes, views, customFieldDefinitions, customFieldValues, comments, activityLog, itemRelations, shareLinks, notifications } from "@airfocus/database";
import { appRouter } from "../routes/index.js";
import type { Context } from "../lib/context.js";

let db: Database;

export function getDb(): Database {
  if (!db) {
    db = createDb("postgresql://airfocus:airfocus@localhost:5432/airfocus");
  }
  return db;
}

/**
 * Create a tRPC caller with a mock context.
 * If userId is provided, the caller is authenticated.
 */
export function createTestCaller(userId: string | null = null) {
  const database = getDb();
  const cookies: Record<string, string> = {};

  const mockCtx: Context = {
    db: database,
    userId,
    req: {
      cookies: {},
    } as any,
    res: {
      setCookie: (name: string, value: string) => {
        cookies[name] = value;
      },
      clearCookie: () => {},
    } as any,
  };

  const caller = appRouter.createCaller(mockCtx);

  return { caller, db: database, cookies };
}

/**
 * Create a test user directly in the DB.
 */
export async function createTestUser(overrides: { email?: string; name?: string } = {}) {
  const database = getDb();
  const argon2 = await import("argon2");
  const passwordHash = await argon2.hash("TestPass123!", { type: 2 });

  const [user] = await database
    .insert(users)
    .values({
      email: overrides.email ?? `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`,
      name: overrides.name ?? "Test User",
      passwordHash,
    })
    .returning();

  return user!;
}

/**
 * Create a test user with organization (mimics what signUp does).
 */
export async function createTestUserWithOrg(overrides: { email?: string; name?: string } = {}) {
  const database = getDb();
  const user = await createTestUser(overrides);

  const [org] = await database
    .insert(organizations)
    .values({
      name: `${user.name}'s Org`,
      slug: `test-org-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      plan: "trial",
    })
    .returning();

  await database.insert(organizationMembers).values({
    organizationId: org!.id,
    userId: user.id,
    role: "owner",
  });

  return { user, org: org! };
}

/**
 * Delete specific test entities by ID. More targeted than wiping everything.
 */
export async function cleanupIds(opts: {
  userIds?: string[];
  orgIds?: string[];
  workspaceIds?: string[];
}) {
  const database = getDb();
  const { eq } = await import("drizzle-orm");

  // Clean workspaces first (cascades items, views, etc.)
  for (const id of opts.workspaceIds ?? []) {
    await database.delete(activityLog).where(eq(activityLog.workspaceId, id));
    await database.delete(views).where(eq(views.workspaceId, id));
    await database.delete(customFieldDefinitions).where(eq(customFieldDefinitions.workspaceId, id));
    await database.delete(workspaceMembers).where(eq(workspaceMembers.workspaceId, id));
    await database.delete(workspaces).where(eq(workspaces.id, id));
  }

  // Clean orgs
  for (const id of opts.orgIds ?? []) {
    await database.delete(organizationMembers).where(eq(organizationMembers.organizationId, id));
    await database.delete(organizations).where(eq(organizations.id, id));
  }

  // Clean users
  for (const id of opts.userIds ?? []) {
    await database.delete(sessions).where(eq(sessions.userId, id));
    await database.delete(users).where(eq(users.id, id));
  }
}
