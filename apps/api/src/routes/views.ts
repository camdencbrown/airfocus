import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and, asc } from "drizzle-orm";
import { router, protectedProcedure } from "../lib/trpc.js";
import { views } from "@airfocus/database";
import { createViewSchema } from "@airfocus/shared";
import { safeUserColumns, assertWorkspaceMember } from "../lib/auth-helpers.js";

export const viewRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      await assertWorkspaceMember(ctx.db, ctx.userId, input.workspaceId);
      const result = await ctx.db.query.views.findMany({
        where: eq(views.workspaceId, input.workspaceId),
        with: {
          creator: { columns: safeUserColumns },
        },
        orderBy: [asc(views.position)],
      });

      return result;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const view = await ctx.db.query.views.findFirst({
        where: eq(views.id, input.id),
        with: {
          creator: { columns: safeUserColumns },
          workspace: true,
        },
      });

      if (!view) {
        throw new TRPCError({ code: "NOT_FOUND", message: "View not found" });
      }

      return view;
    }),

  create: protectedProcedure
    .input(createViewSchema.extend({ workspaceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await assertWorkspaceMember(ctx.db, ctx.userId, input.workspaceId);
      const { workspaceId, config, ...data } = input;

      const [view] = await ctx.db
        .insert(views)
        .values({
          ...data,
          config: config as any,
          workspaceId,
          createdBy: ctx.userId,
        })
        .returning();

      if (!view) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      return view;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: createViewSchema.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.views.findFirst({
        where: eq(views.id, input.id),
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "View not found" });
      }

      const { config, ...rest } = input.data;
      const [updated] = await ctx.db
        .update(views)
        .set({ ...rest, ...(config ? { config: config as any } : {}), updatedAt: new Date() })
        .where(eq(views.id, input.id))
        .returning();

      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const view = await ctx.db.query.views.findFirst({
        where: eq(views.id, input.id),
      });

      if (!view) {
        throw new TRPCError({ code: "NOT_FOUND", message: "View not found" });
      }

      await ctx.db.delete(views).where(eq(views.id, input.id));

      return { success: true };
    }),

  reorder: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        position: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(views)
        .set({
          position: input.position,
          updatedAt: new Date(),
        })
        .where(eq(views.id, input.id))
        .returning();

      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "View not found" });
      }

      return updated;
    }),
});
