import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import { createDb, type Database, sessions } from "@airfocus/database";
import { eq, gt } from "drizzle-orm";

let db: Database | null = null;

function getDb(): Database {
  if (!db) {
    db = createDb();
  }
  return db;
}

export interface Context {
  db: Database;
  userId: string | null;
  req: CreateFastifyContextOptions["req"];
  res: CreateFastifyContextOptions["res"];
}

export async function createContext({ req, res }: CreateFastifyContextOptions): Promise<Context> {
  const database = getDb();
  let userId: string | null = null;

  // Extract user from session cookie
  const token = req.cookies?.session;
  if (token) {
    const session = await database.query.sessions.findFirst({
      where: eq(sessions.token, token),
    });

    if (session && session.expiresAt > new Date()) {
      userId = session.userId;
    }
  }

  return {
    db: database,
    userId,
    req,
    res,
  };
}
