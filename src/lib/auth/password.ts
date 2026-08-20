import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scrypt = promisify(scryptCb);

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

/**
 * Hashes a plain-text password using scrypt (Node's built-in, no external
 * dependency needed) with a random salt. Stored format: "scrypt:<saltHex>:<hashHex>".
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH).toString("hex");
  const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
  return `scrypt:${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Verifies a plain-text password against a stored "scrypt:<salt>:<hash>" value.
 * Uses a constant-time comparison to avoid timing attacks.
 */
export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  const parts = stored.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const [, salt, hashHex] = parts;

  try {
    const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
    const storedKey = Buffer.from(hashHex, "hex");
    if (derivedKey.length !== storedKey.length) return false;
    return timingSafeEqual(derivedKey, storedKey);
  } catch {
    return false;
  }
}

/**
 * Minimal password strength check: at least 8 characters, with at least one
 * letter and one number.
 */
export function isStrongPassword(password: string): boolean {
  return (
    typeof password === "string" &&
    password.length >= 8 &&
    /[A-Za-z]/.test(password) &&
    /[0-9]/.test(password)
  );
}
