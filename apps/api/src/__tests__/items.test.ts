import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createTestCaller, createTestUserWithOrg, cleanupIds } from "./helpers.js";

describe("Item Router", () => {
  let userId: string;
  let orgId: string;
  let workspaceId: string;
  let itemTypeId: string;
  let statusId: string;
  let itemId: string;

  beforeAll(async () => {
    const { user, org } = await createTestUserWithOrg({ email: "items-test@test.com" });
    userId = user.id;
    orgId = org.id;

    const { caller } = createTestCaller(userId);
    const ws = await caller.workspace.create({
      organizationId: orgId,
      name: "Items Test Workspace",
    });
    workspaceId = ws.id;

    const fullWs = await caller.workspace.getById({ id: workspaceId });
    itemTypeId = fullWs.itemTypes[0]!.id;
    statusId = fullWs.statuses.find((s) => s.category === "not_started")!.id;
  });

  afterAll(async () => {
    await cleanupIds({
      workspaceIds: [workspaceId],
      orgIds: [orgId],
      userIds: [userId],
    });
  });

  describe("create", () => {
    it("should create an item", async () => {
      const { caller } = createTestCaller(userId);
      const item = await caller.item.create({
        workspaceId,
        title: "Test Item",
        itemTypeId,
        statusId,
      });

      expect(item).toBeDefined();
      expect(item.title).toBe("Test Item");
      expect(item.workspaceId).toBe(workspaceId);
      expect(item.itemTypeId).toBe(itemTypeId);
      expect(item.statusId).toBe(statusId);
      expect(item.createdBy).toBe(userId);
      itemId = item.id;
    });

    it("should create an item with description and custom fields", async () => {
      const { caller } = createTestCaller(userId);
      const item = await caller.item.create({
        workspaceId,
        title: "Item With Details",
        itemTypeId,
        statusId,
        description: "A detailed description",
        customFields: { priority: "high", effort: 5 },
      });

      expect(item.title).toBe("Item With Details");
      expect(item.description).toBe("A detailed description");
      expect((item.customFields as any).priority).toBe("high");
    });

    it("should create an item with dates", async () => {
      const { caller } = createTestCaller(userId);
      const item = await caller.item.create({
        workspaceId,
        title: "Dated Item",
        itemTypeId,
        statusId,
        startDate: new Date("2026-04-01").toISOString(),
        endDate: new Date("2026-04-30").toISOString(),
      });

      expect(item.startDate).toBeTruthy();
      expect(item.endDate).toBeTruthy();
    });

    it("should throw when not authenticated", async () => {
      const { caller } = createTestCaller(null);
      await expect(
        caller.item.create({
          workspaceId,
          title: "Unauth Item",
          itemTypeId,
          statusId,
        })
      ).rejects.toThrow();
    });
  });

  describe("list", () => {
    it("should list items in workspace", async () => {
      const { caller } = createTestCaller(userId);
      const result = await caller.item.list({ workspaceId });

      expect(result.items).toBeDefined();
      expect(result.items.length).toBeGreaterThanOrEqual(1);
    });

    it("should not include archived items", async () => {
      const { caller } = createTestCaller(userId);

      const item = await caller.item.create({
        workspaceId,
        title: "To Archive",
        itemTypeId,
        statusId,
      });
      await caller.item.delete({ id: item.id });

      const result = await caller.item.list({ workspaceId });
      expect(result.items.find((i: any) => i.id === item.id)).toBeUndefined();
    });

    it("should include status and itemType relations", async () => {
      const { caller } = createTestCaller(userId);
      const result = await caller.item.list({ workspaceId });

      const item = result.items[0]!;
      expect(item.status).toBeDefined();
      expect(item.status!.name).toBeTruthy();
      expect(item.itemType).toBeDefined();
      expect(item.itemType!.name).toBeTruthy();
    });

    it("should filter by statusId", async () => {
      const { caller } = createTestCaller(userId);
      const result = await caller.item.list({ workspaceId, statusId });

      for (const item of result.items) {
        expect(item.statusId).toBe(statusId);
      }
    });
  });

  describe("getById", () => {
    it("should return full item with relations", async () => {
      const { caller } = createTestCaller(userId);
      const item = await caller.item.getById({ id: itemId });

      expect(item.id).toBe(itemId);
      expect(item.title).toBe("Test Item");
      expect(item.status).toBeDefined();
      expect(item.itemType).toBeDefined();
      expect(item.creator).toBeDefined();
      expect(item.comments).toBeDefined();
      expect(item.fieldValues).toBeDefined();
    });

    it("should throw for non-existent item", async () => {
      const { caller } = createTestCaller(userId);
      await expect(
        caller.item.getById({ id: "nonexistent-item-id" })
      ).rejects.toThrow(/not found/i);
    });
  });

  describe("update", () => {
    it("should update item title and description", async () => {
      const { caller } = createTestCaller(userId);
      const updated = await caller.item.update({
        id: itemId,
        data: { title: "Updated Title", description: "Updated desc" },
      });

      expect(updated!.title).toBe("Updated Title");
      expect(updated!.description).toBe("Updated desc");
    });

    it("should update item status", async () => {
      const { caller } = createTestCaller(userId);
      const ws = await caller.workspace.getById({ id: workspaceId });
      const inProgressStatus = ws.statuses.find((s) => s.category === "in_progress")!;

      const updated = await caller.item.update({
        id: itemId,
        data: { statusId: inProgressStatus.id },
      });

      expect(updated!.statusId).toBe(inProgressStatus.id);
    });

    it("should merge custom fields", async () => {
      const { caller } = createTestCaller(userId);

      await caller.item.update({
        id: itemId,
        data: { customFields: { fieldA: "hello" } },
      });

      const updated = await caller.item.update({
        id: itemId,
        data: { customFields: { fieldB: "world" } },
      });

      const cf = updated!.customFields as Record<string, unknown>;
      expect(cf.fieldA).toBe("hello");
      expect(cf.fieldB).toBe("world");
    });
  });

  describe("reorder", () => {
    it("should update item position", async () => {
      const { caller } = createTestCaller(userId);
      const updated = await caller.item.reorder({ id: itemId, position: 99 });
      expect(updated!.position).toBe(99);
    });

    it("should update position with status change (drag to column)", async () => {
      const { caller } = createTestCaller(userId);
      const ws = await caller.workspace.getById({ id: workspaceId });
      const doneStatus = ws.statuses.find((s) => s.category === "done")!;

      const updated = await caller.item.reorder({
        id: itemId,
        position: 0,
        statusId: doneStatus.id,
      });

      expect(updated!.position).toBe(0);
      expect(updated!.statusId).toBe(doneStatus.id);
    });
  });

  describe("comments", () => {
    it("should add a comment to an item", async () => {
      const { caller } = createTestCaller(userId);
      const comment = await caller.item.addComment({
        itemId,
        content: "This is a test comment",
      });

      expect(comment).toBeDefined();
      expect(comment!.content).toBe("This is a test comment");
      expect(comment!.authorId).toBe(userId);
    });

    it("should show comments in getById", async () => {
      const { caller } = createTestCaller(userId);
      const item = await caller.item.getById({ id: itemId });

      expect(item.comments.length).toBeGreaterThanOrEqual(1);
      expect(item.comments[0]!.content).toBe("This is a test comment");
    });
  });

  describe("activity", () => {
    it("should return activity log for an item", async () => {
      const { caller } = createTestCaller(userId);
      const activities = await caller.item.getActivity({ itemId });

      expect(activities.length).toBeGreaterThanOrEqual(1);
      expect(activities.map((a) => a.action)).toContain("created");
    });

    it("should return activity log for workspace", async () => {
      const { caller } = createTestCaller(userId);
      const activities = await caller.item.getActivity({ workspaceId });
      expect(activities.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("delete", () => {
    it("should soft-delete an item (archive)", async () => {
      const { caller } = createTestCaller(userId);

      const item = await caller.item.create({
        workspaceId,
        title: "Delete Me",
        itemTypeId,
        statusId,
      });

      const result = await caller.item.delete({ id: item.id });
      expect(result.success).toBe(true);

      const list = await caller.item.list({ workspaceId });
      expect(list.items.find((i: any) => i.id === item.id)).toBeUndefined();
    });

    it("should throw for non-existent item", async () => {
      const { caller } = createTestCaller(userId);
      await expect(
        caller.item.delete({ id: "nonexistent-item-delete" })
      ).rejects.toThrow();
    });
  });
});
