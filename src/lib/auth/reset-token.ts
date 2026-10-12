import { createHash, randomBytes } from "crypto";

/** How long a reset link stays valid. */
export const RESET_TOKEN_TTL_MINUTES = 15;

/** Minimum gap between two reset requests for the same account. */
export const RESET_REQUEST_COOLDOWN_SECONDS = 60;

/**
 * WhatsApp number that receives admin reset links. Overridable via
 * ADMIN_RESET_WHATSAPP_TO so it can be changed without a code deploy.
 */
export function adminResetWhatsAppNumber(): string {
  return process.env.ADMIN_RESET_WHATSAPP_TO || "7984921347";
}

/** Returns a new random token (sent in the link) and its hash (stored in the DB). */
export function generateResetToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashResetToken(token) };
}

export function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
