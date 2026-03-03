// Shared validation schemas using Zod
// These are used by both the API (request validation) and the frontend (form validation)

import { z } from "zod";

// --- Organization ---

export const createOrgSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
});

export const updateOrgSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  logoUrl: z.string().url().nullable().optional(),
});

// --- Workspace ---

export const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).nullable().optional(),
  icon: z.string().max(50).nullable().optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .nullable()
    .optional(),
});

export const updateWorkspaceSchema = createWorkspaceSchema.partial();

// --- Item ---

export const createItemSchema = z.object({
  itemTypeId: z.string().min(1),
  title: z.string().min(1).max(500),
  description: z.string().nullable().optional(),
  statusId: z.string().min(1).nullable().optional(),
  assigneeId: z.string().min(1).nullable().optional(),
  parentId: z.string().min(1).nullable().optional(),
  startDate: z.string().datetime().nullable().optional(),
  endDate: z.string().datetime().nullable().optional(),
  customFields: z.record(z.unknown()).optional(),
});

export const updateItemSchema = createItemSchema.partial();

export const bulkUpdateItemsSchema = z.object({
  itemIds: z.array(z.string().min(1)).min(1).max(100),
  updates: updateItemSchema,
});

// --- Custom Field Definition ---

export const fieldTypeSchema = z.enum([
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

export const fieldOptionSchema = z.object({
  id: z.string(),
  label: z.string().min(1).max(100),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .nullable(),
});

export const createFieldSchema = z.object({
  name: z.string().min(1).max(100),
  type: fieldTypeSchema,
  description: z.string().max(500).nullable().optional(),
  required: z.boolean().default(false),
  defaultValue: z.unknown().optional(),
  options: z.array(fieldOptionSchema).nullable().optional(),
  config: z.record(z.unknown()).optional(),
  scope: z.array(z.string().min(1)).nullable().optional(),
});

// --- Status ---

export const statusCategorySchema = z.enum(["not_started", "in_progress", "done", "archived"]);

export const createStatusSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  category: statusCategorySchema,
});

// --- View ---

export const viewTypeSchema = z.enum([
  "board",
  "table",
  "list",
  "timeline",
  "gantt",
  "chart",
  "document",
  "inbox",
]);

export const createViewSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).nullable().optional(),
  icon: z.string().max(50).nullable().optional(),
  viewType: viewTypeSchema,
  config: z.record(z.unknown()).optional(),
  isPrivate: z.boolean().default(false),
});

// --- Comment ---

export const createCommentSchema = z.object({
  itemId: z.string().min(1),
  content: z.string().min(1).max(10000),
  parentCommentId: z.string().min(1).nullable().optional(),
});

// --- Auth ---

export const signUpSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "member"]),
});

export const inviteWorkspaceMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["editor", "contributor", "viewer"]),
});
