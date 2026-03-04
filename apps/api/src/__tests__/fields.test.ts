import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createTestCaller, createTestUserWithOrg, cleanupIds } from "./helpers.js";

describe("Field Router", () => {
  let userId: string;
  let orgId: string;
  let workspaceId: string;
  let itemTypeId: string;
  let statusId: string;
  let fieldId: string;
  let itemId: string;

  beforeAll(async () => {
    const { user, org } = await createTestUserWithOrg({ email: "fields-test@test.com" });
    userId = user.id;
    orgId = org.id;

    const { caller } = createTestCaller(userId);
    const ws = await caller.workspace.create({
      organizationId: orgId,
      name: "Fields Test Workspace",
    });
    workspaceId = ws.id;

    const fullWs = await caller.workspace.getById({ id: workspaceId });
    itemTypeId = fullWs.itemTypes[0]!.id;
    statusId = fullWs.statuses.find((s) => s.category === "not_started")!.id;

    const item = await caller.item.create({
      workspaceId,
      title: "Field Test Item",
      itemTypeId,
      statusId,
    });
    itemId = item.id;
  });

  afterAll(async () => {
    await cleanupIds({
      workspaceIds: [workspaceId],
      orgIds: [orgId],
      userIds: [userId],
    });
  });

  describe("create", () => {
    it("should create a text field", async () => {
      const { caller } = createTestCaller(userId);
      const field = await caller.field.create({
        workspaceId,
        name: "Description Field",
        type: "text",
      });

      expect(field).toBeDefined();
      expect(field.name).toBe("Description Field");
      expect(field.type).toBe("text");
      expect(field.workspaceId).toBe(workspaceId);
      fieldId = field.id;
    });

    it("should create a number field", async () => {
      const { caller } = createTestCaller(userId);
      const field = await caller.field.create({
        workspaceId,
        name: "Story Points",
        type: "number",
        required: true,
      });

      expect(field.name).toBe("Story Points");
      expect(field.type).toBe("number");
      expect(field.required).toBe(true);
    });

    it("should create a select field with options", async () => {
      const { caller } = createTestCaller(userId);
      const field = await caller.field.create({
        workspaceId,
        name: "Priority",
        type: "select",
        options: [
          { id: "low", label: "Low", color: "#22c55e" },
          { id: "medium", label: "Medium", color: "#eab308" },
          { id: "high", label: "High", color: "#ef4444" },
        ],
      });

      expect(field.name).toBe("Priority");
      expect(field.type).toBe("select");
      expect(field.options).toHaveLength(3);
    });

    it("should create a date field", async () => {
      const { caller } = createTestCaller(userId);
      const field = await caller.field.create({
        workspaceId,
        name: "Due Date",
        type: "date",
      });
      expect(field.type).toBe("date");
    });

    it("should create a checkbox field", async () => {
      const { caller } = createTestCaller(userId);
      const field = await caller.field.create({
        workspaceId,
        name: "Reviewed",
        type: "checkbox",
      });
      expect(field.type).toBe("checkbox");
    });

    it("should throw when not authenticated", async () => {
      const { caller } = createTestCaller(null);
      await expect(
        caller.field.create({
          workspaceId,
          name: "Unauth Field",
          type: "text",
        })
      ).rejects.toThrow();
    });
  });

  describe("list", () => {
    it("should return all fields for a workspace", async () => {
      const { caller } = createTestCaller(userId);
      const fields = await caller.field.list({ workspaceId });

      expect(fields.length).toBeGreaterThanOrEqual(5);
      expect(fields.map((f: any) => f.name)).toContain("Description Field");
      expect(fields.map((f: any) => f.name)).toContain("Story Points");
      expect(fields.map((f: any) => f.name)).toContain("Priority");
    });
  });

  describe("getById", () => {
    it("should return a single field", async () => {
      const { caller } = createTestCaller(userId);
      const field = await caller.field.getById({ id: fieldId });

      expect(field.id).toBe(fieldId);
      expect(field.name).toBe("Description Field");
    });

    it("should throw for non-existent field", async () => {
      const { caller } = createTestCaller(userId);
      await expect(
        caller.field.getById({ id: "nonexistent-field" })
      ).rejects.toThrow(/not found/i);
    });
  });

  describe("update", () => {
    it("should update field name", async () => {
      const { caller } = createTestCaller(userId);
      const updated = await caller.field.update({
        id: fieldId,
        data: { name: "Renamed Field" },
      });

      expect(updated!.name).toBe("Renamed Field");
    });
  });

  describe("updateValue", () => {
    it("should set a custom field value on an item", async () => {
      const { caller } = createTestCaller(userId);
      const result = await caller.field.updateValue({
        itemId,
        fieldId,
        value: "Hello World",
      });

      expect(result).toBeDefined();
      expect(result!.value).toBe("Hello World");
    });

    it("should update an existing field value", async () => {
      const { caller } = createTestCaller(userId);
      const result = await caller.field.updateValue({
        itemId,
        fieldId,
        value: "Updated Value",
      });

      expect(result!.value).toBe("Updated Value");
    });
  });

  describe("delete", () => {
    it("should delete a field definition", async () => {
      const { caller } = createTestCaller(userId);

      const field = await caller.field.create({
        workspaceId,
        name: "Temp Field",
        type: "text",
      });

      const result = await caller.field.delete({ id: field.id });
      expect(result.success).toBe(true);

      await expect(
        caller.field.getById({ id: field.id })
      ).rejects.toThrow(/not found/i);
    });
  });
});
