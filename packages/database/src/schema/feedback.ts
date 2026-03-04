import { pgTable, text, timestamp, integer, pgEnum, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./organizations";
import { workspaces } from "./workspaces";
import { items } from "./items";
import { createId } from "../utils";

export const feedbackSourceEnum = pgEnum("feedback_source", [
  "portal",
  "email",
  "slack",
  "intercom",
  "manual",
  "api",
]);

export const feedbackStatusEnum = pgEnum("feedback_status", [
  "new",
  "reviewed",
  "planned",
  "in_progress",
  "completed",
  "archived",
]);

export const feedbackEntries = pgTable("feedback_entries", {
  id: text("id").primaryKey().$defaultFn(createId),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  submitterName: text("submitter_name"),
  submitterEmail: text("submitter_email"),
  source: feedbackSourceEnum("source").notNull().default("manual"),
  status: feedbackStatusEnum("status").notNull().default("new"),
  votes: integer("votes").notNull().default(0),
  linkedItemId: text("linked_item_id").references(() => items.id),
  tags: text("tags").array(),
  importanceScore: integer("importance_score"),
  createdBy: text("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Feedback portal configuration
export const feedbackPortals = pgTable("feedback_portals", {
  id: text("id").primaryKey().$defaultFn(createId),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  isPublic: boolean("is_public").notNull().default(true),
  allowVoting: boolean("allow_voting").notNull().default(true),
  primaryColor: text("primary_color").default("#3b82f6"),
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- Relations ---

export const feedbackEntriesRelations = relations(feedbackEntries, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [feedbackEntries.workspaceId],
    references: [workspaces.id],
  }),
  linkedItem: one(items, {
    fields: [feedbackEntries.linkedItemId],
    references: [items.id],
  }),
  creator: one(users, {
    fields: [feedbackEntries.createdBy],
    references: [users.id],
  }),
}));

export const feedbackPortalsRelations = relations(feedbackPortals, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [feedbackPortals.workspaceId],
    references: [workspaces.id],
  }),
}));
