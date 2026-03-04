import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and, asc } from "drizzle-orm";
import { router, protectedProcedure } from "../lib/trpc.js";
import { objectives, keyResults } from "@airfocus/database";
import { safeUserColumns, assertWorkspaceMember } from "../lib/auth-helpers.js";

export const objectiveRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        period: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      await assertWorkspaceMember(ctx.db, ctx.userId, input.workspaceId);
      const conditions = [eq(objectives.workspaceId, input.workspaceId)];

      if (input.period) {
        conditions.push(eq(objectives.period, input.period));
      }

      const result = await ctx.db.query.objectives.findMany({
        where: and(...conditions),
        with: {
          keyResults: true,
        },
        orderBy: [asc(objectives.position)],
      });

      return result;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const objective = await ctx.db.query.objectives.findFirst({
        where: eq(objectives.id, input.id),
        with: {
          keyResults: true,
          owner: { columns: safeUserColumns },
        },
      });

      if (!objective) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Objective not found" });
      }

      return objective;
    }),

  create: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        title: z.string(),
        description: z.string().optional(),
        ownerId: z.string().optional(),
        period: z.string().optional(),
        status: z.enum(["on_track", "at_risk", "behind", "completed", "cancelled"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertWorkspaceMember(ctx.db, ctx.userId, input.workspaceId);
      const { workspaceId, ...data } = input;

      const [objective] = await ctx.db
        .insert(objectives)
        .values({
          workspaceId,
          ...data,
        })
        .returning();

      if (!objective) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create objective" });
      }

      return objective;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          title: z.string().optional(),
          description: z.string().optional(),
          ownerId: z.string().optional(),
          period: z.string().optional(),
          status: z.enum(["on_track", "at_risk", "behind", "completed", "cancelled"]).optional(),
          progress: z.number().min(0).max(100).optional(),
          position: z.number().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.objectives.findFirst({
        where: eq(objectives.id, input.id),
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Objective not found" });
      }

      const [updated] = await ctx.db
        .update(objectives)
        .set({ ...input.data, updatedAt: new Date() })
        .where(eq(objectives.id, input.id))
        .returning();

      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.objectives.findFirst({
        where: eq(objectives.id, input.id),
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Objective not found" });
      }

      await ctx.db.delete(objectives).where(eq(objectives.id, input.id));

      return { success: true };
    }),

  createKeyResult: protectedProcedure
    .input(
      z.object({
        objectiveId: z.string(),
        title: z.string(),
        description: z.string().optional(),
        ownerId: z.string().optional(),
        targetValue: z.number().optional(),
        unit: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { objectiveId, ...data } = input;

      // Verify the objective exists
      const objective = await ctx.db.query.objectives.findFirst({
        where: eq(objectives.id, objectiveId),
      });

      if (!objective) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Objective not found" });
      }

      const [keyResult] = await ctx.db
        .insert(keyResults)
        .values({
          objectiveId,
          ...data,
        })
        .returning();

      if (!keyResult) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create key result" });
      }

      return keyResult;
    }),

  updateKeyResult: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          title: z.string().optional(),
          description: z.string().optional(),
          ownerId: z.string().optional(),
          targetValue: z.number().optional(),
          currentValue: z.number().optional(),
          startValue: z.number().optional(),
          unit: z.string().optional(),
          status: z.enum(["on_track", "at_risk", "behind", "completed", "cancelled"]).optional(),
          linkedItemId: z.string().optional(),
          position: z.number().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.keyResults.findFirst({
        where: eq(keyResults.id, input.id),
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Key result not found" });
      }

      const [updated] = await ctx.db
        .update(keyResults)
        .set({ ...input.data, updatedAt: new Date() })
        .where(eq(keyResults.id, input.id))
        .returning();

      return updated;
    }),

  deleteKeyResult: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.keyResults.findFirst({
        where: eq(keyResults.id, input.id),
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Key result not found" });
      }

      await ctx.db.delete(keyResults).where(eq(keyResults.id, input.id));

      return { success: true };
    }),
});
