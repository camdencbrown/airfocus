import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createTestCaller, createTestUserWithOrg, cleanupIds } from "./helpers.js";

describe("Objective Router", () => {
  let userId: string;
  let orgId: string;
  let workspaceId: string;
  let objectiveId: string;
  let keyResultId: string;

  beforeAll(async () => {
    const { user, org } = await createTestUserWithOrg({ email: "objectives-test@test.com" });
    userId = user.id;
    orgId = org.id;

    const { caller } = createTestCaller(userId);
    const ws = await caller.workspace.create({
      organizationId: orgId,
      name: "Objectives Test Workspace",
    });
    workspaceId = ws.id;
  });

  afterAll(async () => {
    await cleanupIds({
      workspaceIds: [workspaceId],
      orgIds: [orgId],
      userIds: [userId],
    });
  });

  describe("create", () => {
    it("should create an objective", async () => {
      const { caller } = createTestCaller(userId);
      const objective = await caller.objective.create({
        workspaceId,
        title: "Increase User Retention",
      });

      expect(objective).toBeDefined();
      expect(objective.title).toBe("Increase User Retention");
      expect(objective.workspaceId).toBe(workspaceId);
      expect(objective.status).toBe("on_track");
      expect(objective.progress).toBe(0);
      objectiveId = objective.id;
    });

    it("should create an objective with all fields", async () => {
      const { caller } = createTestCaller(userId);
      const objective = await caller.objective.create({
        workspaceId,
        title: "Launch V2",
        description: "Ship the next version",
        period: "Q2 2026",
        status: "at_risk",
        ownerId: userId,
      });

      expect(objective.title).toBe("Launch V2");
      expect(objective.description).toBe("Ship the next version");
      expect(objective.period).toBe("Q2 2026");
      expect(objective.status).toBe("at_risk");
      expect(objective.ownerId).toBe(userId);
    });

    it("should throw when not authenticated", async () => {
      const { caller } = createTestCaller(null);
      await expect(
        caller.objective.create({ workspaceId, title: "Unauth" })
      ).rejects.toThrow();
    });
  });

  describe("list", () => {
    it("should list objectives for workspace", async () => {
      const { caller } = createTestCaller(userId);
      const result = await caller.objective.list({ workspaceId });

      expect(result.length).toBeGreaterThanOrEqual(2);
    });

    it("should filter by period", async () => {
      const { caller } = createTestCaller(userId);
      const result = await caller.objective.list({ workspaceId, period: "Q2 2026" });

      expect(result.length).toBe(1);
      expect(result[0]!.period).toBe("Q2 2026");
    });

    it("should include key results", async () => {
      const { caller } = createTestCaller(userId);
      const result = await caller.objective.list({ workspaceId });

      expect(result[0]!.keyResults).toBeDefined();
    });
  });

  describe("getById", () => {
    it("should return objective with relations", async () => {
      const { caller } = createTestCaller(userId);
      const objective = await caller.objective.getById({ id: objectiveId });

      expect(objective.id).toBe(objectiveId);
      expect(objective.title).toBe("Increase User Retention");
      expect(objective.keyResults).toBeDefined();
    });

    it("should throw for non-existent objective", async () => {
      const { caller } = createTestCaller(userId);
      await expect(
        caller.objective.getById({ id: "nonexistent" })
      ).rejects.toThrow();
    });
  });

  describe("update", () => {
    it("should update objective fields", async () => {
      const { caller } = createTestCaller(userId);
      const updated = await caller.objective.update({
        id: objectiveId,
        data: { title: "Updated Objective", progress: 50, status: "behind" },
      });

      expect(updated!.title).toBe("Updated Objective");
      expect(updated!.progress).toBe(50);
      expect(updated!.status).toBe("behind");
    });

    it("should throw for non-existent objective", async () => {
      const { caller } = createTestCaller(userId);
      await expect(
        caller.objective.update({ id: "nonexistent", data: { title: "x" } })
      ).rejects.toThrow();
    });
  });

  describe("key results", () => {
    it("should create a key result", async () => {
      const { caller } = createTestCaller(userId);
      const kr = await caller.objective.createKeyResult({
        objectiveId,
        title: "Reduce churn by 10%",
        targetValue: 10,
        unit: "%",
      });

      expect(kr).toBeDefined();
      expect(kr.title).toBe("Reduce churn by 10%");
      expect(kr.objectiveId).toBe(objectiveId);
      expect(kr.targetValue).toBe(10);
      expect(kr.currentValue).toBe(0);
      keyResultId = kr.id;
    });

    it("should create a key result with defaults", async () => {
      const { caller } = createTestCaller(userId);
      const kr = await caller.objective.createKeyResult({
        objectiveId,
        title: "Basic KR",
      });

      expect(kr.targetValue).toBe(100);
      expect(kr.unit).toBe("%");
    });

    it("should throw when objective doesn't exist", async () => {
      const { caller } = createTestCaller(userId);
      await expect(
        caller.objective.createKeyResult({ objectiveId: "nonexistent", title: "x" })
      ).rejects.toThrow();
    });

    it("should update a key result", async () => {
      const { caller } = createTestCaller(userId);
      const updated = await caller.objective.updateKeyResult({
        id: keyResultId,
        data: { currentValue: 5, status: "on_track" },
      });

      expect(updated!.currentValue).toBe(5);
      expect(updated!.status).toBe("on_track");
    });

    it("should show key results in getById", async () => {
      const { caller } = createTestCaller(userId);
      const objective = await caller.objective.getById({ id: objectiveId });

      expect(objective.keyResults.length).toBeGreaterThanOrEqual(1);
      expect(objective.keyResults.map((kr: any) => kr.title)).toContain("Reduce churn by 10%");
    });

    it("should delete a key result", async () => {
      const { caller } = createTestCaller(userId);
      const kr = await caller.objective.createKeyResult({
        objectiveId,
        title: "Temp KR",
      });

      const result = await caller.objective.deleteKeyResult({ id: kr.id });
      expect(result.success).toBe(true);
    });

    it("should throw deleting non-existent key result", async () => {
      const { caller } = createTestCaller(userId);
      await expect(
        caller.objective.deleteKeyResult({ id: "nonexistent" })
      ).rejects.toThrow();
    });
  });

  describe("delete", () => {
    it("should delete an objective and cascade key results", async () => {
      const { caller } = createTestCaller(userId);

      const obj = await caller.objective.create({
        workspaceId,
        title: "To Delete",
      });
      await caller.objective.createKeyResult({
        objectiveId: obj.id,
        title: "Will cascade delete",
      });

      const result = await caller.objective.delete({ id: obj.id });
      expect(result.success).toBe(true);

      await expect(
        caller.objective.getById({ id: obj.id })
      ).rejects.toThrow();
    });

    it("should throw for non-existent objective", async () => {
      const { caller } = createTestCaller(userId);
      await expect(
        caller.objective.delete({ id: "nonexistent" })
      ).rejects.toThrow();
    });
  });
});
