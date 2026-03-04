import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createTestCaller, createTestUserWithOrg, cleanupIds } from "./helpers.js";

describe("View Router", () => {
  let userId: string;
  let orgId: string;
  let workspaceId: string;
  let viewId: string;
  const extraWsIds: string[] = [];

  beforeAll(async () => {
    const { user, org } = await createTestUserWithOrg({ email: "views-test@test.com" });
    userId = user.id;
    orgId = org.id;

    const { caller } = createTestCaller(userId);
    const ws = await caller.workspace.create({
      organizationId: orgId,
      name: "Views Test Workspace",
    });
    workspaceId = ws.id;
  });

  afterAll(async () => {
    await cleanupIds({
      workspaceIds: [workspaceId, ...extraWsIds],
      orgIds: [orgId],
      userIds: [userId],
    });
  });

  describe("create", () => {
    it("should create a board view", async () => {
      const { caller } = createTestCaller(userId);
      const view = await caller.view.create({
        workspaceId,
        name: "My Board",
        viewType: "board",
      });

      expect(view).toBeDefined();
      expect(view.name).toBe("My Board");
      expect(view.viewType).toBe("board");
      expect(view.workspaceId).toBe(workspaceId);
      expect(view.createdBy).toBe(userId);
      viewId = view.id;
    });

    it("should create a table view", async () => {
      const { caller } = createTestCaller(userId);
      const view = await caller.view.create({
        workspaceId,
        name: "My Table",
        viewType: "table",
        description: "Table view for tracking",
      });

      expect(view.viewType).toBe("table");
      expect(view.description).toBe("Table view for tracking");
    });

    it("should create a timeline view", async () => {
      const { caller } = createTestCaller(userId);
      const view = await caller.view.create({
        workspaceId,
        name: "Roadmap Timeline",
        viewType: "timeline",
        isPrivate: true,
      });

      expect(view.viewType).toBe("timeline");
      expect(view.isPrivate).toBe(true);
    });

    it("should throw when not authenticated", async () => {
      const { caller } = createTestCaller(null);
      await expect(
        caller.view.create({
          workspaceId,
          name: "Unauth View",
          viewType: "board",
        })
      ).rejects.toThrow();
    });
  });

  describe("list", () => {
    it("should return views for a workspace", async () => {
      const { caller } = createTestCaller(userId);
      const views = await caller.view.list({ workspaceId });

      expect(views.length).toBeGreaterThanOrEqual(3);
      expect(views.map((v) => v.name)).toContain("My Board");
      expect(views.map((v) => v.name)).toContain("My Table");
    });

    it("should return empty list for workspace with no views", async () => {
      const { caller } = createTestCaller(userId);
      const ws = await caller.workspace.create({
        organizationId: orgId,
        name: "Empty Views WS",
      });
      extraWsIds.push(ws.id);

      const views = await caller.view.list({ workspaceId: ws.id });
      expect(views.length).toBe(0);
    });
  });

  describe("getById", () => {
    it("should return view with creator", async () => {
      const { caller } = createTestCaller(userId);
      const view = await caller.view.getById({ id: viewId });

      expect(view.id).toBe(viewId);
      expect(view.name).toBe("My Board");
      expect(view.creator).toBeDefined();
    });

    it("should throw for non-existent view", async () => {
      const { caller } = createTestCaller(userId);
      await expect(
        caller.view.getById({ id: "nonexistent-view-id" })
      ).rejects.toThrow(/not found/i);
    });
  });

  describe("update", () => {
    it("should update view name", async () => {
      const { caller } = createTestCaller(userId);
      const updated = await caller.view.update({
        id: viewId,
        data: { name: "Renamed Board" },
      });

      expect(updated!.name).toBe("Renamed Board");
    });
  });

  describe("reorder", () => {
    it("should update view position", async () => {
      const { caller } = createTestCaller(userId);
      const updated = await caller.view.reorder({ id: viewId, position: 5 });
      expect(updated.position).toBe(5);
    });
  });

  describe("delete", () => {
    it("should delete a view", async () => {
      const { caller } = createTestCaller(userId);

      const view = await caller.view.create({
        workspaceId,
        name: "To Delete",
        viewType: "list",
      });

      const result = await caller.view.delete({ id: view.id });
      expect(result.success).toBe(true);

      await expect(
        caller.view.getById({ id: view.id })
      ).rejects.toThrow(/not found/i);
    });

    it("should throw for non-existent view", async () => {
      const { caller } = createTestCaller(userId);
      await expect(
        caller.view.delete({ id: "nonexistent-view-delete" })
      ).rejects.toThrow(/not found/i);
    });
  });
});
