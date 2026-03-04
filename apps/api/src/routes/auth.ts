import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { router, publicProcedure, protectedProcedure } from "../lib/trpc.js";
import { users, organizations, organizationMembers, sessions } from "@airfocus/database";
import { signUpSchema, signInSchema } from "@airfocus/shared";
import { createId } from "@airfocus/database";

const isProd = process.env.NODE_ENV === "production";
const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: (isProd ? "none" : "lax") as "none" | "lax",
  path: "/",
  maxAge: 30 * 24 * 60 * 60,
};

export const authRouter = router({
  signUp: publicProcedure.input(signUpSchema).mutation(async ({ ctx, input }) => {
    const { db } = ctx;

    // Check if email already exists
    const existing = await db.query.users.findFirst({
      where: eq(users.email, input.email.toLowerCase()),
    });

    if (existing) {
      throw new TRPCError({ code: "CONFLICT", message: "Email already in use" });
    }

    // Hash password (dynamic import for argon2 ESM compat)
    const argon2 = await import("argon2");
    const passwordHash = await argon2.hash(input.password, {
      type: 2, // argon2id
      memoryCost: 65536,
      timeCost: 3,
    });

    // Create user
    const [user] = await db
      .insert(users)
      .values({
        email: input.email.toLowerCase(),
        name: input.name,
        passwordHash,
      })
      .returning({ id: users.id, email: users.email, name: users.name });

    if (!user) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create user" });
    }

    // Create default organization
    const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const [org] = await db
      .insert(organizations)
      .values({
        name: `${input.name}'s Organization`,
        slug: `${slug}-${createId().slice(0, 6)}`,
        plan: "trial",
      })
      .returning();

    if (org) {
      await db.insert(organizationMembers).values({
        organizationId: org.id,
        userId: user.id,
        role: "owner",
      });
    }

    // Create session
    const token = createId() + createId();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await db.insert(sessions).values({
      userId: user.id,
      token,
      expiresAt,
    });

    // Set session cookie
    ctx.res.setCookie("session", token, cookieOptions);

    return { user: { id: user.id, email: user.email, name: user.name } };
  }),

  signIn: publicProcedure.input(signInSchema).mutation(async ({ ctx, input }) => {
    const { db } = ctx;

    const user = await db.query.users.findFirst({
      where: eq(users.email, input.email.toLowerCase()),
    });

    if (!user || !user.passwordHash) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
    }

    const argon2 = await import("argon2");
    const valid = await argon2.verify(user.passwordHash, input.password);

    if (!valid) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
    }

    // Create session
    const token = createId() + createId();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await db.insert(sessions).values({
      userId: user.id,
      token,
      expiresAt,
    });

    ctx.res.setCookie("session", token, cookieOptions);

    return { user: { id: user.id, email: user.email, name: user.name } };
  }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.userId),
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    // Get the user's organization memberships
    const orgMemberships = await ctx.db.query.organizationMembers.findMany({
      where: eq(organizationMembers.userId, ctx.userId),
      with: {
        organization: true,
      },
    });

    const orgs = orgMemberships.map((m) => ({
      id: m.organization.id,
      name: m.organization.name,
      slug: m.organization.slug,
      role: m.role,
    }));

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      organizations: orgs,
      defaultOrganizationId: orgs[0]?.id ?? null,
    };
  }),

  signOut: protectedProcedure.mutation(async ({ ctx }) => {
    const token = ctx.req.cookies.session;
    if (token) {
      await ctx.db.delete(sessions).where(eq(sessions.token, token));
    }
    ctx.res.clearCookie("session", cookieOptions);
    return { success: true };
  }),
});
