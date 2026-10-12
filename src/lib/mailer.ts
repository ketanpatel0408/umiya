import nodemailer from "nodemailer";

/**
 * Email sender for password reset links, using Gmail SMTP.
 *
 * Required env vars:
 *   SMTP_USER   the Gmail address that sends the mail
 *   SMTP_PASS   a Gmail "App Password" (16 characters; needs 2-Step
 *               Verification on the Google account), not the normal password
 * Optional:
 *   SMTP_HOST / SMTP_PORT   defaults smtp.gmail.com / 465 (SSL)
 *   ADMIN_RESET_EMAIL       send admin reset links here instead of the
 *                           admin account's own email address
 */

export function isMailerConfigured(): boolean {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

/** "ketan.patel@gmail.com" -> "ke***@gmail.com", for confirmation messages. */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  return `${local.slice(0, 2)}***@${domain}`;
}

export async function sendResetEmail(to: string, link: string): Promise<void> {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) throw new Error("Email is not configured (SMTP_USER / SMTP_PASS)");

  const port = Number(process.env.SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `"Umiya GST Portal" <${user}>`,
    to,
    subject: "Reset your Umiya GST Portal password",
    text:
      `A password reset was requested for your admin account.\n\n` +
      `Reset your password using this link (valid for 15 minutes):\n${link}\n\n` +
      `If you didn't request this, you can ignore this email.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;color:#0f172a">
        <h2 style="margin:0 0 12px">Reset your password</h2>
        <p>A password reset was requested for your <b>Umiya GST Portal</b> admin account.</p>
        <p style="margin:24px 0">
          <a href="${link}" style="background:#4f46e5;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block">
            Set a new password
          </a>
        </p>
        <p style="font-size:13px;color:#64748b">This link is valid for 15 minutes and can be used once.
        If you didn't request this, you can ignore this email.</p>
      </div>`,
  });
}
