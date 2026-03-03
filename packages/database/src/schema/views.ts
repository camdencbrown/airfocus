import { pgTable, text, timestamp, jsonb, boolean, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./organizations";
import { workspaces } from "./workspaces";
import { createId } from "../utils";

export const views = pgTable("views", {
  id: text("id").primaryKey().$defaultFn(createId),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  viewType: text("view_type").notNull(),
  config: jsonb("config").$type<{
    filters: unknown;
    sort: { fieldId: string; direction: "asc" | "desc" }[];
    groupBy: string | null;
    subGroupBy: string | null;
    visibleFields: string[];
    fieldWidths: Record<string, number>;
    colorBy: string | null;
    collapsedGroups: string[];
    cardFields: string[];
  }>().notNull().default({
    filters: null,
    sort: [],
    groupBy: null,
    subGroupBy: null,
    visibleFields: [],
    fieldWidths: {},
    colorBy: null,
    collapsedGroups: [],
    cardFields: [],
  }),
  isPrivate: boolean("is_private").notNull().default(false),
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- Share Links ---

export const shareLinks = pgTable("share_links", {
  id: text("id").primaryKey().$defaultFn(createId),
  viewId: text("view_id")
    .notNull()
    .references(() => views.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  password: text("password"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- Notifications ---

export const notifications = pgTable("notifications", {
  id: text("id").primaryKey().$defaultFn(createId),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  itemId: text("item_id"),
  workspaceId: text("workspace_id"),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- Relations ---

export const viewsRelations = relations(views, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [views.workspaceId],
    references: [workspaces.id],
  }),
  creator: one(users, {
    fields: [views.createdBy],
    references: [users.id],
  }),
  shareLinks: many(shareLinks),
}));

export const shareLinksRelations = relations(shareLinks, ({ one }) => ({
  view: one(views, {
    fields: [shareLinks.viewId],
    references: [views.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));
