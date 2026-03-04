import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and, asc } from "drizzle-orm";
import { router, protectedProcedure } from "../lib/trpc.js";
import { customFieldDefinitions, customFieldValues } from "@airfocus/database";
import { createFieldSchema } from "@airfocus/shared";
import { assertWorkspaceMember } from "../lib/auth-helpers.js";

export const fieldRouter = router({
  list: protectedProcedure
    .input(z.object({ workspaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      await assertWorkspaceMember(ctx.db, ctx.userId, input.workspaceId);
      return ctx.db.query.customFieldDefinitions.findMany({
        where: eq(customFieldDefinitions.workspaceId, input.workspaceId),
        orderBy: [asc(customFieldDefinitions.position)],
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const field = await ctx.db.query.customFieldDefinitions.findFirst({
        where: eq(customFieldDefinitions.id, input.id),
      });

      if (!field) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Field definition not found" });
      }

      return field;
    }),

  create: protectedProcedure
    .input(createFieldSchema.extend({ workspaceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await assertWorkspaceMember(ctx.db, ctx.userId, input.workspaceId);
      const { workspaceId, ...data } = input;

      const [field] = await ctx.db
        .insert(customFieldDefinitions)
        .values({
          workspaceId,
          ...data,
        })
        .returning();

      if (!field) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create field definition" });
      }

      return field;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: createFieldSchema.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.customFieldDefinitions.findFirst({
        where: eq(customFieldDefinitions.id, input.id),
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Field definition not found" });
      }

      const [updated] = await ctx.db
        .update(customFieldDefinitions)
        .set(input.data)
        .where(eq(customFieldDefinitions.id, input.id))
        .returning();

      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.customFieldDefinitions.findFirst({
        where: eq(customFieldDefinitions.id, input.id),
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Field definition not found" });
      }

      // Delete associated field values first
      await ctx.db
        .delete(customFieldValues)
        .where(eq(customFieldValues.fieldId, input.id));

      // Delete the field definition
      await ctx.db
        .delete(customFieldDefinitions)
        .where(eq(customFieldDefinitions.id, input.id));

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
      const existing = await ctx.db.query.customFieldDefinitions.findFirst({
        where: eq(customFieldDefinitions.id, input.id),
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Field definition not found" });
      }

      const [updated] = await ctx.db
        .update(customFieldDefinitions)
        .set({ position: input.position })
        .where(eq(customFieldDefinitions.id, input.id))
        .returning();

      return updated;
    }),

  updateValue: protectedProcedure
    .input(
      z.object({
        itemId: z.string(),
        fieldId: z.string(),
        value: z.unknown(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify the field definition exists
      const fieldDef = await ctx.db.query.customFieldDefinitions.findFirst({
        where: eq(customFieldDefinitions.id, input.fieldId),
      });

      if (!fieldDef) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Field definition not found" });
      }

      // Check if a value already exists for this item + field
      const existing = await ctx.db.query.customFieldValues.findFirst({
        where: and(
          eq(customFieldValues.itemId, input.itemId),
          eq(customFieldValues.fieldId, input.fieldId)
        ),
      });

      if (existing) {
        // Update existing value
        const [updated] = await ctx.db
          .update(customFieldValues)
          .set({ value: input.value })
          .where(eq(customFieldValues.id, existing.id))
          .returning();

        return updated;
      } else {
        // Insert new value
        const [created] = await ctx.db
          .insert(customFieldValues)
          .values({
            itemId: input.itemId,
            fieldId: input.fieldId,
            value: input.value,
          })
          .returning();

        if (!created) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to set field value" });
        }

        return created;
      }
    }),
});
