import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and, desc, asc, isNull } from "drizzle-orm";
import { router, protectedProcedure } from "../lib/trpc.js";
import { items, comments, activityLog, customFieldValues } from "@airfocus/database";
import { createItemSchema, updateItemSchema, createCommentSchema } from "@airfocus/shared";
import { safeUserColumns, assertWorkspaceMember } from "../lib/auth-helpers.js";

export const itemRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        parentId: z.string().nullable().optional(),
        statusId: z.string().nullable().optional(),
        itemTypeId: z.string().nullable().optional(),
        limit: z.number().min(1).max(200).default(50),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      await assertWorkspaceMember(ctx.db, ctx.userId, input.workspaceId);

      const conditions = [
        eq(items.workspaceId, input.workspaceId),
        isNull(items.archivedAt),
      ];

      if (input.parentId !== undefined) {
        conditions.push(
          input.parentId === null
            ? isNull(items.parentId)
            : eq(items.parentId, input.parentId)
        );
      }

      if (input.statusId) {
        conditions.push(eq(items.statusId, input.statusId));
      }

      if (input.itemTypeId) {
        conditions.push(eq(items.itemTypeId, input.itemTypeId));
      }

      const result = await ctx.db.query.items.findMany({
        where: and(...conditions),
        with: {
          status: true,
          itemType: true,
          assignee: { columns: safeUserColumns },
        },
        orderBy: [asc(items.position)],
        limit: input.limit + 1,
      });

      let nextCursor: string | undefined;
      if (result.length > input.limit) {
        const nextItem = result.pop();
        nextCursor = nextItem?.id;
      }

      return { items: result, nextCursor };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const item = await ctx.db.query.items.findFirst({
        where: eq(items.id, input.id),
        with: {
          status: true,
          itemType: true,
          assignee: { columns: safeUserColumns },
          creator: { columns: safeUserColumns },
          children: {
            with: { status: true, itemType: true },
            orderBy: [asc(items.position)],
          },
          comments: {
            with: { author: { columns: safeUserColumns } },
            orderBy: [asc(comments.createdAt)],
          },
          fieldValues: true,
        },
      });

      if (!item) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
      }

      return item;
    }),

  create: protectedProcedure
    .input(createItemSchema.extend({ workspaceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await assertWorkspaceMember(ctx.db, ctx.userId, input.workspaceId);
      const { workspaceId, customFields: cf, startDate, endDate, ...data } = input;

      const [item] = await ctx.db
        .insert(items)
        .values({
          ...data,
          workspaceId,
          customFields: cf ?? {},
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          createdBy: ctx.userId,
        })
        .returning();

      if (!item) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      // Write custom field values to EAV table
      if (cf && Object.keys(cf).length > 0) {
        await ctx.db.insert(customFieldValues).values(
          Object.entries(cf).map(([fieldId, value]) => ({
            itemId: item.id,
            fieldId,
            value,
          }))
        );
      }

      // Log activity
      await ctx.db.insert(activityLog).values({
        workspaceId,
        itemId: item.id,
        userId: ctx.userId,
        action: "created",
        entityType: "item",
        entityId: item.id,
      });

      return item;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: updateItemSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get current item for activity log
      const current = await ctx.db.query.items.findFirst({
        where: eq(items.id, input.id),
      });

      if (!current) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
      }

      const { customFields: cf, startDate, endDate, ...data } = input.data;
      const updates: Record<string, unknown> = { ...data, updatedAt: new Date() };
      if (startDate !== undefined) updates.startDate = startDate ? new Date(startDate) : null;
      if (endDate !== undefined) updates.endDate = endDate ? new Date(endDate) : null;
      if (cf) {
        updates.customFields = { ...(current.customFields as Record<string, unknown>), ...cf };
      }

      const [updated] = await ctx.db
        .update(items)
        .set(updates)
        .where(eq(items.id, input.id))
        .returning();

      // Track changes in activity log
      const changes: Record<string, { old: unknown; new: unknown }> = {};
      for (const [key, value] of Object.entries(input.data)) {
        const oldVal = (current as Record<string, unknown>)[key];
        if (JSON.stringify(oldVal) !== JSON.stringify(value)) {
          changes[key] = { old: oldVal, new: value };
        }
      }

      if (Object.keys(changes).length > 0) {
        await ctx.db.insert(activityLog).values({
          workspaceId: current.workspaceId,
          itemId: current.id,
          userId: ctx.userId,
          action: changes.statusId ? "status_changed" : "updated",
          entityType: "item",
          entityId: current.id,
          changes,
        });
      }

      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.query.items.findFirst({
        where: eq(items.id, input.id),
      });

      if (!item) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Soft delete
      await ctx.db
        .update(items)
        .set({ archivedAt: new Date(), updatedAt: new Date() })
        .where(eq(items.id, input.id));

      await ctx.db.insert(activityLog).values({
        workspaceId: item.workspaceId,
        itemId: item.id,
        userId: ctx.userId,
        action: "deleted",
        entityType: "item",
        entityId: item.id,
      });

      return { success: true };
    }),

  reorder: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        position: z.number(),
        parentId: z.string().nullable().optional(),
        statusId: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updates: Record<string, unknown> = {
        position: input.position,
        updatedAt: new Date(),
      };

      if (input.parentId !== undefined) updates.parentId = input.parentId;
      if (input.statusId !== undefined) updates.statusId = input.statusId;

      const [updated] = await ctx.db
        .update(items)
        .set(updates)
        .where(eq(items.id, input.id))
        .returning();

      return updated;
    }),

  // --- Comments ---

  addComment: protectedProcedure
    .input(createCommentSchema)
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.query.items.findFirst({
        where: eq(items.id, input.itemId),
      });

      if (!item) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
      }

      const [comment] = await ctx.db
        .insert(comments)
        .values({
          itemId: input.itemId,
          authorId: ctx.userId,
          content: input.content,
          parentCommentId: input.parentCommentId ?? null,
        })
        .returning();

      await ctx.db.insert(activityLog).values({
        workspaceId: item.workspaceId,
        itemId: item.id,
        userId: ctx.userId,
        action: "commented",
        entityType: "comment",
        entityId: comment!.id,
      });

      return comment;
    }),

  // --- Activity ---

  getActivity: protectedProcedure
    .input(
      z.object({
        itemId: z.string().optional(),
        workspaceId: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      // Require at least one filter to prevent cross-tenant data leak
      if (!input.itemId && !input.workspaceId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Must provide itemId or workspaceId" });
      }

      if (input.workspaceId) {
        await assertWorkspaceMember(ctx.db, ctx.userId, input.workspaceId);
      }

      const conditions = [];

      if (input.itemId) {
        conditions.push(eq(activityLog.itemId, input.itemId));
      }
      if (input.workspaceId) {
        conditions.push(eq(activityLog.workspaceId, input.workspaceId));
      }

      return ctx.db.query.activityLog.findMany({
        where: and(...conditions),
        orderBy: [desc(activityLog.createdAt)],
        limit: input.limit,
      });
    }),
});
