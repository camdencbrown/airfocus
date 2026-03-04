import { describe, it, expect, afterAll } from "vitest";
import { createTestCaller, createTestUserWithOrg, cleanupIds, getDb } from "./helpers.js";
import { users, organizations, organizationMembers, sessions } from "@airfocus/database";
import { eq } from "drizzle-orm";

describe("Auth Router", () => {
  const createdUserIds: string[] = [];
  const createdOrgIds: string[] = [];

  afterAll(async () => {
    const db = getDb();
    for (const uid of createdUserIds) {
      await db.delete(sessions).where(eq(sessions.userId, uid));
      await db.delete(organizationMembers).where(eq(organizationMembers.userId, uid));
    }
    for (const oid of createdOrgIds) {
      await db.delete(organizationMembers).where(eq(organizationMembers.organizationId, oid));
      await db.delete(organizations).where(eq(organizations.id, oid));
    }
    for (const uid of createdUserIds) {
      await db.delete(users).where(eq(users.id, uid));
    }
  });

  describe("signUp", () => {
    it("should create a new user with organization", async () => {
      const { caller } = createTestCaller();
      const result = await caller.auth.signUp({
        name: "Alice Auth",
        email: "alice-auth@test.com",
        password: "SecurePass123!",
      });

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe("alice-auth@test.com");
      expect(result.user.name).toBe("Alice Auth");
      createdUserIds.push(result.user.id);

      // Find the org that was auto-created
      const db = getDb();
      const memberships = await db.query.organizationMembers.findMany({
        where: eq(organizationMembers.userId, result.user.id),
      });
      for (const m of memberships) createdOrgIds.push(m.organizationId);
    });

    it("should reject duplicate emails", async () => {
      const { caller } = createTestCaller();
      await expect(
        caller.auth.signUp({
          name: "Alice Dup",
          email: "alice-auth@test.com",
          password: "SecurePass123!",
        })
      ).rejects.toThrow(/email already in use/i);
    });

    it("should lowercase email", async () => {
      const { caller } = createTestCaller();
      const result = await caller.auth.signUp({
        name: "Bob Auth",
        email: "BOB-AUTH@TEST.COM",
        password: "SecurePass123!",
      });

      expect(result.user.email).toBe("bob-auth@test.com");
      createdUserIds.push(result.user.id);

      const db = getDb();
      const memberships = await db.query.organizationMembers.findMany({
        where: eq(organizationMembers.userId, result.user.id),
      });
      for (const m of memberships) createdOrgIds.push(m.organizationId);
    });

    it("should reject short passwords", async () => {
      const { caller } = createTestCaller();
      await expect(
        caller.auth.signUp({
          name: "Short Pass",
          email: "short-pass-auth@test.com",
          password: "short",
        })
      ).rejects.toThrow();
    });
  });

  describe("signIn", () => {
    it("should authenticate with correct credentials", async () => {
      const { caller } = createTestCaller();
      const result = await caller.auth.signIn({
        email: "alice-auth@test.com",
        password: "SecurePass123!",
      });

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe("alice-auth@test.com");
    });

    it("should reject wrong password", async () => {
      const { caller } = createTestCaller();
      await expect(
        caller.auth.signIn({
          email: "alice-auth@test.com",
          password: "WrongPass999!",
        })
      ).rejects.toThrow(/invalid email or password/i);
    });

    it("should reject non-existent email", async () => {
      const { caller } = createTestCaller();
      await expect(
        caller.auth.signIn({
          email: "nonexistent-auth@test.com",
          password: "SomePass123!",
        })
      ).rejects.toThrow(/invalid email or password/i);
    });
  });

  describe("me", () => {
    it("should return user with organizations when authenticated", async () => {
      const userId = createdUserIds[0]!;
      const { caller } = createTestCaller(userId);
      const result = await caller.auth.me();

      expect(result.id).toBe(userId);
      expect(result.email).toBe("alice-auth@test.com");
      expect(result.organizations).toBeDefined();
      expect(result.organizations.length).toBeGreaterThanOrEqual(1);
      expect(result.defaultOrganizationId).toBeTruthy();
    });

    it("should throw when not authenticated", async () => {
      const { caller } = createTestCaller(null);
      await expect(caller.auth.me()).rejects.toThrow(/not authenticated/i);
    });
  });

  describe("signOut", () => {
    it("should succeed when authenticated", async () => {
      const userId = createdUserIds[0]!;
      const { caller } = createTestCaller(userId);
      const result = await caller.auth.signOut();
      expect(result.success).toBe(true);
    });

    it("should throw when not authenticated", async () => {
      const { caller } = createTestCaller(null);
      await expect(caller.auth.signOut()).rejects.toThrow();
    });
  });
});
