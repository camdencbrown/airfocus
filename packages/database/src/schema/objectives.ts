import { pgTable, text, timestamp, integer, real, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./organizations";
import { workspaces } from "./workspaces";
import { items } from "./items";
import { createId } from "../utils";

export const objectiveStatusEnum = pgEnum("objective_status", [
  "on_track",
  "at_risk",
  "behind",
  "completed",
  "cancelled",
]);

export const objectives = pgTable("objectives", {
  id: text("id").primaryKey().$defaultFn(createId),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  ownerId: text("owner_id").references(() => users.id),
  period: text("period"), // e.g. "Q1 2026", "2026 H1"
  status: objectiveStatusEnum("status").notNull().default("on_track"),
  progress: real("progress").notNull().default(0), // 0-100
  parentId: text("parent_id"), // for nested objectives
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const keyResults = pgTable("key_results", {
  id: text("id").primaryKey().$defaultFn(createId),
  objectiveId: text("objective_id")
    .notNull()
    .references(() => objectives.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  ownerId: text("owner_id").references(() => users.id),
  targetValue: real("target_value").notNull().default(100),
  currentValue: real("current_value").notNull().default(0),
  startValue: real("start_value").notNull().default(0),
  unit: text("unit").default("%"), // %, count, currency, etc.
  status: objectiveStatusEnum("status").notNull().default("on_track"),
  linkedItemId: text("linked_item_id").references(() => items.id),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- Relations ---

export const objectivesRelations = relations(objectives, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [objectives.workspaceId],
    references: [workspaces.id],
  }),
  owner: one(users, {
    fields: [objectives.ownerId],
    references: [users.id],
  }),
  keyResults: many(keyResults),
  parent: one(objectives, {
    fields: [objectives.parentId],
    references: [objectives.id],
    relationName: "parentChild",
  }),
  children: many(objectives, { relationName: "parentChild" }),
}));

export const keyResultsRelations = relations(keyResults, ({ one }) => ({
  objective: one(objectives, {
    fields: [keyResults.objectiveId],
    references: [objectives.id],
  }),
  owner: one(users, {
    fields: [keyResults.ownerId],
    references: [users.id],
  }),
  linkedItem: one(items, {
    fields: [keyResults.linkedItemId],
    references: [items.id],
  }),
}));
