import { router } from "../lib/trpc.js";
import { authRouter } from "./auth.js";
import { workspaceRouter } from "./workspaces.js";
import { itemRouter } from "./items.js";

export const appRouter = router({
  auth: authRouter,
  workspace: workspaceRouter,
  item: itemRouter,
});

export type AppRouter = typeof appRouter;
