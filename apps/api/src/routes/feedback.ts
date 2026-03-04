import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and, desc, sql } from "drizzle-orm";
import { router, protectedProcedure } from "../lib/trpc.js";
import { feedbackEntries, feedbackPortals } from "@airfocus/database";
import { safeUserColumns, assertWorkspaceMember } from "../lib/auth-helpers.js";

export const feedbackRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        status: z.enum(["new", "reviewed", "planned", "in_progress", "completed", "archived"]).optional(),
        limit: z.number().min(1).max(200).default(50),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      await assertWorkspaceMember(ctx.db, ctx.userId, input.workspaceId);
      const conditions = [eq(feedbackEntries.workspaceId, input.workspaceId)];

      if (input.status) {
        conditions.push(eq(feedbackEntries.status, input.status));
      }

      const result = await ctx.db.query.feedbackEntries.findMany({
        where: and(...conditions),
        with: {
          creator: { columns: safeUserColumns },
        },
        orderBy: [desc(feedbackEntries.createdAt)],
        limit: input.limit + 1,
      });

      let nextCursor: string | undefined;
      if (result.length > input.limit) {
        const nextItem = result.pop();
        nextCursor = nextItem?.id;
      }

      return { entries: result, nextCursor };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const entry = await ctx.db.query.feedbackEntries.findFirst({
        where: eq(feedbackEntries.id, input.id),
        with: {
          creator: { columns: safeUserColumns },
          linkedItem: true,
        },
      });

      if (!entry) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Feedback entry not found" });
      }

      return entry;
    }),

  create: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        title: z.string().min(1),
        description: z.string().optional(),
        submitterName: z.string().optional(),
        submitterEmail: z.string().email().optional(),
        source: z.enum(["portal", "email", "slack", "intercom", "manual", "api"]).optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertWorkspaceMember(ctx.db, ctx.userId, input.workspaceId);
      const [entry] = await ctx.db
        .insert(feedbackEntries)
        .values({
          workspaceId: input.workspaceId,
          title: input.title,
          description: input.description ?? null,
          submitterName: input.submitterName ?? null,
          submitterEmail: input.submitterEmail ?? null,
          source: input.source ?? "manual",
          tags: input.tags ?? null,
          createdBy: ctx.userId,
        })
        .returning();

      if (!entry) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      return entry;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          title: z.string().min(1).optional(),
          description: z.string().optional(),
          status: z.enum(["new", "reviewed", "planned", "in_progress", "completed", "archived"]).optional(),
          linkedItemId: z.string().nullable().optional(),
          importanceScore: z.number().int().optional(),
          tags: z.array(z.string()).optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.feedbackEntries.findFirst({
        where: eq(feedbackEntries.id, input.id),
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Feedback entry not found" });
      }

      const [updated] = await ctx.db
        .update(feedbackEntries)
        .set({ ...input.data, updatedAt: new Date() })
        .where(eq(feedbackEntries.id, input.id))
        .returning();

      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const entry = await ctx.db.query.feedbackEntries.findFirst({
        where: eq(feedbackEntries.id, input.id),
      });

      if (!entry) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Feedback entry not found" });
      }

      await ctx.db.delete(feedbackEntries).where(eq(feedbackEntries.id, input.id));

      return { success: true };
    }),

  vote: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const entry = await ctx.db.query.feedbackEntries.findFirst({
        where: eq(feedbackEntries.id, input.id),
      });

      if (!entry) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Feedback entry not found" });
      }

      const [updated] = await ctx.db
        .update(feedbackEntries)
        .set({ votes: sql`${feedbackEntries.votes} + 1`, updatedAt: new Date() })
        .where(eq(feedbackEntries.id, input.id))
        .returning();

      return updated;
    }),

  getPortal: protectedProcedure
    .input(z.object({ workspaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      await assertWorkspaceMember(ctx.db, ctx.userId, input.workspaceId);
      const portal = await ctx.db.query.feedbackPortals.findFirst({
        where: eq(feedbackPortals.workspaceId, input.workspaceId),
      });

      return portal ?? null;
    }),

  createPortal: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        isPublic: z.boolean().optional(),
        allowVoting: z.boolean().optional(),
        primaryColor: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertWorkspaceMember(ctx.db, ctx.userId, input.workspaceId);
      // Check if portal already exists for this workspace
      const existing = await ctx.db.query.feedbackPortals.findFirst({
        where: eq(feedbackPortals.workspaceId, input.workspaceId),
      });

      if (existing) {
        // Update existing portal
        const [updated] = await ctx.db
          .update(feedbackPortals)
          .set({
            name: input.name,
            slug: input.slug,
            description: input.description ?? existing.description,
            isPublic: input.isPublic ?? existing.isPublic,
            allowVoting: input.allowVoting ?? existing.allowVoting,
            primaryColor: input.primaryColor ?? existing.primaryColor,
            updatedAt: new Date(),
          })
          .where(eq(feedbackPortals.id, existing.id))
          .returning();

        return updated;
      }

      // Create new portal
      const [portal] = await ctx.db
        .insert(feedbackPortals)
        .values({
          workspaceId: input.workspaceId,
          name: input.name,
          slug: input.slug,
          description: input.description ?? null,
          isPublic: input.isPublic ?? true,
          allowVoting: input.allowVoting ?? true,
          primaryColor: input.primaryColor ?? "#3b82f6",
        })
        .returning();

      if (!portal) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      return portal;
    }),
});
