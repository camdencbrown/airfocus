import { router } from "../lib/trpc.js";
import { authRouter } from "./auth.js";
import { workspaceRouter } from "./workspaces.js";
import { itemRouter } from "./items.js";
import { fieldRouter } from "./fields.js";
import { viewRouter } from "./views.js";
import { objectiveRouter } from "./objectives.js";
import { feedbackRouter } from "./feedback.js";

export const appRouter = router({
  auth: authRouter,
  workspace: workspaceRouter,
  item: itemRouter,
  field: fieldRouter,
  view: viewRouter,
  objective: objectiveRouter,
  feedback: feedbackRouter,
});

export type AppRouter = typeof appRouter;
