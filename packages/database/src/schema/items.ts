import { pgTable, text, timestamp, jsonb, real, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./organizations";
import { workspaces, itemTypes, statuses } from "./workspaces";
import { createId } from "../utils";

// --- Items (core entity) ---

export const items = pgTable(
  "items",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    itemTypeId: text("item_type_id")
      .notNull()
      .references(() => itemTypes.id),
    title: text("title").notNull(),
    description: text("description"),
    statusId: text("status_id").references(() => statuses.id),
    assigneeId: text("assignee_id").references(() => users.id),
    parentId: text("parent_id"),
    position: real("position").notNull().default(0),
    customFields: jsonb("custom_fields").$type<Record<string, unknown>>().default({}),
    startDate: timestamp("start_date", { withTimezone: true }),
    endDate: timestamp("end_date", { withTimezone: true }),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdBy: text("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("items_workspace_idx").on(table.workspaceId),
    index("items_parent_idx").on(table.parentId),
    index("items_status_idx").on(table.statusId),
    index("items_assignee_idx").on(table.assigneeId),
    index("items_type_idx").on(table.itemTypeId),
    index("items_workspace_position_idx").on(table.workspaceId, table.position),
  ]
);

// --- Custom Field Values (EAV pattern) ---

export const customFieldValues = pgTable(
  "custom_field_values",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    itemId: text("item_id")
      .notNull()
      .references(() => items.id, { onDelete: "cascade" }),
    fieldId: text("field_id").notNull(),
    value: jsonb("value"),
  },
  (table) => [
    index("cfv_item_idx").on(table.itemId),
    index("cfv_field_idx").on(table.fieldId),
    index("cfv_item_field_idx").on(table.itemId, table.fieldId),
  ]
);

// --- Item Relations (dependencies, mirrors, links) ---

export const relationTypeEnum = ["parent", "blocks", "blocked_by", "related", "mirror", "feedback_link", "okr_link"] as const;

export const itemRelations = pgTable(
  "item_relations",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    sourceItemId: text("source_item_id")
      .notNull()
      .references(() => items.id, { onDelete: "cascade" }),
    targetItemId: text("target_item_id")
      .notNull()
      .references(() => items.id, { onDelete: "cascade" }),
    relationType: text("relation_type").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("relations_source_idx").on(table.sourceItemId),
    index("relations_target_idx").on(table.targetItemId),
  ]
);

// --- Comments ---

export const comments = pgTable(
  "comments",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    itemId: text("item_id")
      .notNull()
      .references(() => items.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id),
    content: text("content").notNull(),
    parentCommentId: text("parent_comment_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("comments_item_idx").on(table.itemId),
  ]
);

// --- Activity Log ---

export const activityLog = pgTable(
  "activity_log",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    itemId: text("item_id"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    changes: jsonb("changes").$type<Record<string, { old: unknown; new: unknown }>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("activity_workspace_idx").on(table.workspaceId),
    index("activity_item_idx").on(table.itemId),
    index("activity_created_idx").on(table.createdAt),
  ]
);

// --- Relations ---

export const itemsRelations = relations(items, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [items.workspaceId],
    references: [workspaces.id],
  }),
  itemType: one(itemTypes, {
    fields: [items.itemTypeId],
    references: [itemTypes.id],
  }),
  status: one(statuses, {
    fields: [items.statusId],
    references: [statuses.id],
  }),
  assignee: one(users, {
    fields: [items.assigneeId],
    references: [users.id],
    relationName: "assignee",
  }),
  creator: one(users, {
    fields: [items.createdBy],
    references: [users.id],
    relationName: "creator",
  }),
  parent: one(items, {
    fields: [items.parentId],
    references: [items.id],
    relationName: "parentChild",
  }),
  children: many(items, { relationName: "parentChild" }),
  comments: many(comments),
  fieldValues: many(customFieldValues),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  item: one(items, {
    fields: [comments.itemId],
    references: [items.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
}));

export const customFieldValuesRelations = relations(customFieldValues, ({ one }) => ({
  item: one(items, {
    fields: [customFieldValues.itemId],
    references: [items.id],
  }),
}));
