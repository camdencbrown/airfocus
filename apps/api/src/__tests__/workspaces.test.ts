import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createTestCaller, createTestUserWithOrg, cleanupIds } from "./helpers.js";

describe("Workspace Router", () => {
  let userId: string;
  let orgId: string;
  let workspaceId: string;
  const extraUserIds: string[] = [];
  const extraOrgIds: string[] = [];
  const extraWsIds: string[] = [];

  beforeAll(async () => {
    const { user, org } = await createTestUserWithOrg({ email: "ws-test@test.com" });
    userId = user.id;
    orgId = org.id;
  });

  afterAll(async () => {
    await cleanupIds({
      workspaceIds: [workspaceId, ...extraWsIds].filter(Boolean),
      orgIds: [orgId, ...extraOrgIds],
      userIds: [userId, ...extraUserIds],
    });
  });

  describe("create", () => {
    it("should create a workspace with default statuses and item types", async () => {
      const { caller } = createTestCaller(userId);
      const ws = await caller.workspace.create({
        organizationId: orgId,
        name: "Test Workspace",
        description: "A workspace for testing",
      });

      expect(ws).toBeDefined();
      expect(ws.name).toBe("Test Workspace");
      expect(ws.description).toBe("A workspace for testing");
      expect(ws.organizationId).toBe(orgId);
      workspaceId = ws.id;
    });

    it("should reject if user is not org member", async () => {
      const { user: otherUser, org: otherOrg } = await createTestUserWithOrg({
        email: "other-ws@test.com",
      });
      extraUserIds.push(otherUser.id);
      extraOrgIds.push(otherOrg.id);

      const { caller } = createTestCaller(otherUser.id);
      await expect(
        caller.workspace.create({
          organizationId: orgId,
          name: "Unauthorized WS",
        })
      ).rejects.toThrow(/not a member/i);
    });

    it("should throw when not authenticated", async () => {
      const { caller } = createTestCaller(null);
      await expect(
        caller.workspace.create({
          organizationId: orgId,
          name: "Unauth WS",
        })
      ).rejects.toThrow();
    });
  });

  describe("list", () => {
    it("should return workspaces the user is a member of", async () => {
      const { caller } = createTestCaller(userId);
      const list = await caller.workspace.list({ organizationId: orgId });

      expect(list.length).toBeGreaterThanOrEqual(1);
      const found = list.find((w) => w.id === workspaceId);
      expect(found).toBeDefined();
      expect(found!.name).toBe("Test Workspace");
      expect(found!.role).toBe("editor");
    });

    it("should return empty list for non-member", async () => {
      const { user: other, org: otherOrg } = await createTestUserWithOrg({
        email: "nomember-ws@test.com",
      });
      extraUserIds.push(other.id);
      extraOrgIds.push(otherOrg.id);

      const { caller } = createTestCaller(other.id);
      const list = await caller.workspace.list({ organizationId: orgId });
      expect(list.length).toBe(0);
    });
  });

  describe("getById", () => {
    it("should return workspace with statuses, item types, and members", async () => {
      const { caller } = createTestCaller(userId);
      const ws = await caller.workspace.getById({ id: workspaceId });

      expect(ws.id).toBe(workspaceId);
      expect(ws.name).toBe("Test Workspace");

      // Default statuses
      expect(ws.statuses.length).toBeGreaterThanOrEqual(5);
      expect(ws.statuses.map((s) => s.name)).toContain("Backlog");
      expect(ws.statuses.map((s) => s.name)).toContain("In Progress");
      expect(ws.statuses.map((s) => s.name)).toContain("Done");

      // Default item types
      expect(ws.itemTypes.length).toBeGreaterThanOrEqual(3);
      expect(ws.itemTypes.map((t) => t.name)).toContain("Initiative");
      expect(ws.itemTypes.map((t) => t.name)).toContain("Feature");

      // Members
      expect(ws.members.length).toBeGreaterThanOrEqual(1);
    });

    it("should throw for non-existent workspace", async () => {
      const { caller } = createTestCaller(userId);
      await expect(
        caller.workspace.getById({ id: "nonexistent-ws-id" })
      ).rejects.toThrow(/not found/i);
    });
  });

  describe("update", () => {
    it("should update workspace name and description", async () => {
      const { caller } = createTestCaller(userId);
      const updated = await caller.workspace.update({
        id: workspaceId,
        data: { name: "Updated Workspace", description: "New description" },
      });

      expect(updated.name).toBe("Updated Workspace");
      expect(updated.description).toBe("New description");
    });
  });

  describe("delete", () => {
    it("should delete a workspace", async () => {
      const { caller } = createTestCaller(userId);

      // Create a throwaway workspace
      const ws = await caller.workspace.create({
        organizationId: orgId,
        name: "To Delete",
      });
      extraWsIds.push(ws.id);

      const result = await caller.workspace.delete({ id: ws.id });
      expect(result.success).toBe(true);

      await expect(
        caller.workspace.getById({ id: ws.id })
      ).rejects.toThrow(/not found/i);
    });
  });
});
