import { pgTable, text, timestamp, jsonb, pgEnum, boolean, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { organizations, users } from "./organizations";
import { createId } from "../utils";

export const workspaceRoleEnum = pgEnum("workspace_role", ["editor", "contributor", "viewer"]);

export const workspaces = pgTable("workspaces", {
  id: text("id").primaryKey().$defaultFn(createId),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  color: text("color"),
  settings: jsonb("settings").notNull().$type<{
    enabledApps: string[];
    timezone: string;
    dateFormat: string;
  }>().default({
    enabledApps: ["roadmap"],
    timezone: "UTC",
    dateFormat: "YYYY-MM-DD",
  }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const workspaceMembers = pgTable("workspace_members", {
  id: text("id").primaryKey().$defaultFn(createId),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: workspaceRoleEnum("role").notNull().default("editor"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- Item Types (hierarchy definition) ---

export const itemTypes = pgTable("item_types", {
  id: text("id").primaryKey().$defaultFn(createId),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  icon: text("icon"),
  color: text("color"),
  level: integer("level").notNull().default(0),
  parentTypeId: text("parent_type_id"),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- Statuses ---

export const statusCategoryEnum = pgEnum("status_category", [
  "not_started",
  "in_progress",
  "done",
  "archived",
]);

export const statuses = pgTable("statuses", {
  id: text("id").primaryKey().$defaultFn(createId),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  color: text("color").notNull(),
  category: statusCategoryEnum("category").notNull(),
  position: integer("position").notNull().default(0),
});

// --- Custom Field Definitions ---

export const fieldTypeEnum = pgEnum("field_type", [
  "text",
  "rich_text",
  "number",
  "select",
  "multi_select",
  "date",
  "date_range",
  "person",
  "multi_person",
  "url",
  "email",
  "checkbox",
  "rating",
  "formula",
  "relation",
  "team",
]);

export const customFieldDefinitions = pgTable("custom_field_definitions", {
  id: text("id").primaryKey().$defaultFn(createId),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: fieldTypeEnum("type").notNull(),
  description: text("description"),
  required: boolean("required").notNull().default(false),
  defaultValue: jsonb("default_value"),
  options: jsonb("options").$type<{ id: string; label: string; color: string | null }[]>(),
  config: jsonb("config").$type<Record<string, unknown>>().default({}),
  scope: jsonb("scope").$type<string[]>(),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- Relations ---

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [workspaces.organizationId],
    references: [organizations.id],
  }),
  members: many(workspaceMembers),
  itemTypes: many(itemTypes),
  statuses: many(statuses),
  customFields: many(customFieldDefinitions),
}));

export const workspaceMembersRelations = relations(workspaceMembers, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [workspaceMembers.workspaceId],
    references: [workspaces.id],
  }),
  user: one(users, {
    fields: [workspaceMembers.userId],
    references: [users.id],
  }),
}));

export const itemTypesRelations = relations(itemTypes, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [itemTypes.workspaceId],
    references: [workspaces.id],
  }),
}));

export const statusesRelations = relations(statuses, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [statuses.workspaceId],
    references: [workspaces.id],
  }),
}));

export const customFieldDefinitionsRelations = relations(customFieldDefinitions, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [customFieldDefinitions.workspaceId],
    references: [workspaces.id],
  }),
}));
