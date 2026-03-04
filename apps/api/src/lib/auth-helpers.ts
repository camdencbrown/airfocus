import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { workspaceMembers } from "@airfocus/database";
import type { Context } from "./context.js";

/** Safe user columns to include in relations — excludes passwordHash and other sensitive fields */
export const safeUserColumns = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
} as const;

/** Verify the current user is a member of the given workspace. Throws FORBIDDEN if not. */
export async function assertWorkspaceMember(
  db: Context["db"],
  userId: string,
  workspaceId: string
) {
  const membership = await db.query.workspaceMembers.findFirst({
    where: and(
      eq(workspaceMembers.userId, userId),
      eq(workspaceMembers.workspaceId, workspaceId),
    ),
  });

  if (!membership) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Not a member of this workspace",
    });
  }

  return membership;
}
