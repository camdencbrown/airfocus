import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and } from "drizzle-orm";
import { router, protectedProcedure } from "../lib/trpc.js";
import {
  workspaces,
  workspaceMembers,
  organizationMembers,
  itemTypes,
  statuses,
} from "@airfocus/database";
import { createWorkspaceSchema, updateWorkspaceSchema } from "@airfocus/shared";
import { DEFAULT_STATUSES, DEFAULT_ITEM_TYPES, DEFAULT_APPS } from "@airfocus/shared/constants";

export const workspaceRouter = router({
  list: protectedProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Get workspaces where user is a member
      const memberOf = await ctx.db.query.workspaceMembers.findMany({
        where: eq(workspaceMembers.userId, ctx.userId),
        with: {
          workspace: true,
        },
      });

      return memberOf
        .filter((m) => m.workspace.organizationId === input.organizationId)
        .map((m) => ({
          ...m.workspace,
          role: m.role,
        }));
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const workspace = await ctx.db.query.workspaces.findFirst({
        where: eq(workspaces.id, input.id),
        with: {
          itemTypes: true,
          statuses: true,
          customFields: true,
          members: { with: { user: true } },
        },
      });

      if (!workspace) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" });
      }

      return workspace;
    }),

  create: protectedProcedure
    .input(
      createWorkspaceSchema.extend({
        organizationId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { organizationId, ...data } = input;

      // Verify user is org member
      const membership = await ctx.db.query.organizationMembers.findFirst({
        where: and(
          eq(organizationMembers.organizationId, organizationId),
          eq(organizationMembers.userId, ctx.userId)
        ),
      });

      if (!membership) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not a member of this organization" });
      }

      // Create workspace
      const [workspace] = await ctx.db
        .insert(workspaces)
        .values({
          ...data,
          organizationId,
          settings: {
            enabledApps: [...DEFAULT_APPS],
            timezone: "UTC",
            dateFormat: "YYYY-MM-DD",
          },
        })
        .returning();

      if (!workspace) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      // Add creator as editor
      await ctx.db.insert(workspaceMembers).values({
        workspaceId: workspace.id,
        userId: ctx.userId,
        role: "editor",
      });

      // Create default statuses
      await ctx.db.insert(statuses).values(
        DEFAULT_STATUSES.map((s, i) => ({
          workspaceId: workspace.id,
          name: s.name,
          color: s.color,
          category: s.category,
          position: i,
        }))
      );

      // Create default item types
      await ctx.db.insert(itemTypes).values(
        DEFAULT_ITEM_TYPES.map((t, i) => ({
          workspaceId: workspace.id,
          name: t.name,
          icon: t.icon,
          color: t.color,
          level: t.level,
          position: i,
        }))
      );

      return workspace;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: updateWorkspaceSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(workspaces)
        .set({ ...input.data, updatedAt: new Date() })
        .where(eq(workspaces.id, input.id))
        .returning();

      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" });
      }

      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(workspaces).where(eq(workspaces.id, input.id));
      return { success: true };
    }),
});
