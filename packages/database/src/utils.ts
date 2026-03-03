import { randomBytes } from "crypto";

/**
 * Generate a prefixed CUID-like ID.
 * Uses crypto.randomBytes for security + timestamp for sortability.
 */
export function createId(): string {
  const timestamp = Date.now().toString(36);
  const random = randomBytes(8).toString("hex");
  return `${timestamp}${random}`;
}
