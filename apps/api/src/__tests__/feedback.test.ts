import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createTestCaller, createTestUserWithOrg, cleanupIds } from "./helpers.js";

describe("Feedback Router", () => {
  let userId: string;
  let orgId: string;
  let workspaceId: string;
  let feedbackId: string;

  beforeAll(async () => {
    const { user, org } = await createTestUserWithOrg({ email: "feedback-test@test.com" });
    userId = user.id;
    orgId = org.id;

    const { caller } = createTestCaller(userId);
    const ws = await caller.workspace.create({
      organizationId: orgId,
      name: "Feedback Test Workspace",
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
    it("should create a feedback entry", async () => {
      const { caller } = createTestCaller(userId);
      const entry = await caller.feedback.create({
        workspaceId,
        title: "Need dark mode",
      });

      expect(entry).toBeDefined();
      expect(entry.title).toBe("Need dark mode");
      expect(entry.workspaceId).toBe(workspaceId);
      expect(entry.source).toBe("manual");
      expect(entry.status).toBe("new");
      expect(entry.votes).toBe(0);
      expect(entry.createdBy).toBe(userId);
      feedbackId = entry.id;
    });

    it("should create with all optional fields", async () => {
      const { caller } = createTestCaller(userId);
      const entry = await caller.feedback.create({
        workspaceId,
        title: "API Integration",
        description: "We need a REST API",
        submitterName: "John Doe",
        submitterEmail: "john@example.com",
        source: "email",
        tags: ["api", "integration"],
      });

      expect(entry.title).toBe("API Integration");
      expect(entry.description).toBe("We need a REST API");
      expect(entry.submitterName).toBe("John Doe");
      expect(entry.submitterEmail).toBe("john@example.com");
      expect(entry.source).toBe("email");
      expect(entry.tags).toEqual(["api", "integration"]);
    });

    it("should throw when not authenticated", async () => {
      const { caller } = createTestCaller(null);
      await expect(
        caller.feedback.create({ workspaceId, title: "Unauth" })
      ).rejects.toThrow();
    });
  });

  describe("list", () => {
    it("should list feedback for workspace", async () => {
      const { caller } = createTestCaller(userId);
      const result = await caller.feedback.list({ workspaceId });

      expect(result.entries.length).toBeGreaterThanOrEqual(2);
    });

    it("should filter by status", async () => {
      const { caller } = createTestCaller(userId);
      const result = await caller.feedback.list({ workspaceId, status: "new" });

      for (const entry of result.entries) {
        expect(entry.status).toBe("new");
      }
    });

    it("should support pagination", async () => {
      const { caller } = createTestCaller(userId);
      const result = await caller.feedback.list({ workspaceId, limit: 1 });

      expect(result.entries.length).toBe(1);
      // With 2+ entries, should have a nextCursor
      expect(result.nextCursor).toBeDefined();
    });

    it("should include creator relation", async () => {
      const { caller } = createTestCaller(userId);
      const result = await caller.feedback.list({ workspaceId });

      expect(result.entries[0]!.creator).toBeDefined();
    });
  });

  describe("getById", () => {
    it("should return feedback with relations", async () => {
      const { caller } = createTestCaller(userId);
      const entry = await caller.feedback.getById({ id: feedbackId });

      expect(entry.id).toBe(feedbackId);
      expect(entry.title).toBe("Need dark mode");
      expect(entry.creator).toBeDefined();
    });

    it("should throw for non-existent entry", async () => {
      const { caller } = createTestCaller(userId);
      await expect(
        caller.feedback.getById({ id: "nonexistent" })
      ).rejects.toThrow();
    });
  });

  describe("update", () => {
    it("should update feedback fields", async () => {
      const { caller } = createTestCaller(userId);
      const updated = await caller.feedback.update({
        id: feedbackId,
        data: {
          title: "Updated Feedback",
          status: "reviewed",
          importanceScore: 8,
          tags: ["ux", "design"],
        },
      });

      expect(updated!.title).toBe("Updated Feedback");
      expect(updated!.status).toBe("reviewed");
      expect(updated!.importanceScore).toBe(8);
      expect(updated!.tags).toEqual(["ux", "design"]);
    });

    it("should throw for non-existent entry", async () => {
      const { caller } = createTestCaller(userId);
      await expect(
        caller.feedback.update({ id: "nonexistent", data: { title: "x" } })
      ).rejects.toThrow();
    });
  });

  describe("vote", () => {
    it("should increment vote count", async () => {
      const { caller } = createTestCaller(userId);
      const before = await caller.feedback.getById({ id: feedbackId });
      const votesBefore = before.votes;

      const updated = await caller.feedback.vote({ id: feedbackId });
      expect(updated!.votes).toBe(votesBefore + 1);
    });

    it("should increment multiple times", async () => {
      const { caller } = createTestCaller(userId);
      await caller.feedback.vote({ id: feedbackId });
      const entry = await caller.feedback.getById({ id: feedbackId });

      // Started at 0, voted twice (once above, once here)
      expect(entry.votes).toBeGreaterThanOrEqual(2);
    });

    it("should throw for non-existent entry", async () => {
      const { caller } = createTestCaller(userId);
      await expect(
        caller.feedback.vote({ id: "nonexistent" })
      ).rejects.toThrow();
    });
  });

  describe("portal", () => {
    it("should return null when no portal exists", async () => {
      const { caller } = createTestCaller(userId);
      const portal = await caller.feedback.getPortal({ workspaceId });
      expect(portal).toBeNull();
    });

    it("should create a portal", async () => {
      const { caller } = createTestCaller(userId);
      const portal = await caller.feedback.createPortal({
        workspaceId,
        name: "Feature Requests",
        slug: `test-portal-${Date.now()}`,
        description: "Submit your ideas",
        isPublic: true,
        allowVoting: true,
        primaryColor: "#8b5cf6",
      });

      expect(portal).toBeDefined();
      expect(portal!.name).toBe("Feature Requests");
      expect(portal!.isPublic).toBe(true);
      expect(portal!.primaryColor).toBe("#8b5cf6");
    });

    it("should return existing portal", async () => {
      const { caller } = createTestCaller(userId);
      const portal = await caller.feedback.getPortal({ workspaceId });
      expect(portal).not.toBeNull();
      expect(portal!.name).toBe("Feature Requests");
    });

    it("should update existing portal on createPortal", async () => {
      const { caller } = createTestCaller(userId);
      const portal = await caller.feedback.createPortal({
        workspaceId,
        name: "Updated Portal",
        slug: `test-portal-updated-${Date.now()}`,
      });

      expect(portal!.name).toBe("Updated Portal");
    });
  });

  describe("delete", () => {
    it("should delete a feedback entry", async () => {
      const { caller } = createTestCaller(userId);
      const entry = await caller.feedback.create({
        workspaceId,
        title: "To Delete",
      });

      const result = await caller.feedback.delete({ id: entry.id });
      expect(result.success).toBe(true);

      await expect(
        caller.feedback.getById({ id: entry.id })
      ).rejects.toThrow();
    });

    it("should throw for non-existent entry", async () => {
      const { caller } = createTestCaller(userId);
      await expect(
        caller.feedback.delete({ id: "nonexistent" })
      ).rejects.toThrow();
    });
  });
});
