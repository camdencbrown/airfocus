"use client";

import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@airfocus/api/src/routes/index.js";

export const trpc = createTRPCReact<AppRouter>();
