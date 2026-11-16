/** Max stored size of a signature data URL (images are resized client-side). */
export const MAX_SIGNATURE_LENGTH = 300 * 1024;

const SIGNATURE_PATTERN = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/;

/** Accepts only small base64 PNG/JPEG/WebP data URLs (no SVG: it can carry script). */
export function isValidSignatureImage(value: string): boolean {
  return value.length <= MAX_SIGNATURE_LENGTH && SIGNATURE_PATTERN.test(value);
}
