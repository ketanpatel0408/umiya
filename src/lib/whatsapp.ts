/**
 * Minimal WhatsApp sender built on the Meta WhatsApp Cloud API.
 *
 * Required env vars (from Meta Business > WhatsApp > API Setup):
 *   WHATSAPP_ACCESS_TOKEN     permanent/system-user access token
 *   WHATSAPP_PHONE_NUMBER_ID  the sender phone number ID
 * Optional:
 *   WHATSAPP_TEMPLATE_NAME    approved template whose body has one {{1}}
 *                             variable for the reset link. Needed when the
 *                             recipient hasn't messaged the business number
 *                             in the last 24h (WhatsApp rule for
 *                             business-initiated messages).
 *   WHATSAPP_TEMPLATE_LANG    template language code (default "en")
 *   WHATSAPP_API_VERSION      Graph API version (default "v21.0")
 */

export class WhatsAppNotConfiguredError extends Error {
  constructor() {
    super("WhatsApp is not configured (WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID)");
    this.name = "WhatsAppNotConfiguredError";
  }
}

export function isWhatsAppConfigured(): boolean {
  return Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

/** "7984921347" / "+91 79849 21347" -> "917984921347" (E.164 digits, India default). */
export function normalizeIndianNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return digits.length === 10 ? `91${digits}` : digits;
}

/**
 * Sends a password reset link over WhatsApp. Uses the approved template when
 * WHATSAPP_TEMPLATE_NAME is set, otherwise a plain text message.
 */
export async function sendWhatsAppResetLink(to: string, link: string): Promise<void> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) throw new WhatsAppNotConfiguredError();

  const version = process.env.WHATSAPP_API_VERSION || "v21.0";
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME;
  const recipient = normalizeIndianNumber(to);

  const body = templateName
    ? {
        messaging_product: "whatsapp",
        to: recipient,
        type: "template",
        template: {
          name: templateName,
          language: { code: process.env.WHATSAPP_TEMPLATE_LANG || "en" },
          components: [{ type: "body", parameters: [{ type: "text", text: link }] }],
        },
      }
    : {
        messaging_product: "whatsapp",
        to: recipient,
        type: "text",
        text: {
          preview_url: true,
          body:
            `Umiya GST Portal: a password reset was requested for the admin account.\n\n` +
            `Reset your password using this link (valid for 15 minutes):\n${link}\n\n` +
            `If you didn't request this, you can ignore this message.`,
        },
      };

  const res = await fetch(`https://graph.facebook.com/${version}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`WhatsApp API request failed (${res.status}): ${detail.slice(0, 500)}`);
  }
}
