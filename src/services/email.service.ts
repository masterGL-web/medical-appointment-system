// src/services/email.service.ts
// Server-only — never import this from a client component.
// Required env vars: GMAIL_USER, GMAIL_APP_PASSWORD, NEXT_PUBLIC_APP_URL

import nodemailer from 'nodemailer';

// ─── Transporter (singleton per server process) ───────────────────────────────

function createTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error('Missing GMAIL_USER or GMAIL_APP_PASSWORD environment variables');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
}

// ─── Templates ────────────────────────────────────────────────────────────────

function buildActivationEmail(params: {
  recipientEmail: string;
  recipientName:  string;
  role:           'patient' | 'doctor';
  activationLink: string;
}): { subject: string; html: string } {
  const { recipientName, role, activationLink } = params;
  const roleLabel = role === 'doctor' ? 'Doctor' : 'Patient';

  const subject = 'Activate your MediCare account';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Activate your account</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:12px;overflow:hidden;
                      box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#10b981;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;
                         letter-spacing:-0.5px;">
                MediCare
              </h1>
              <p style="margin:8px 0 0;color:#d1fae5;font-size:14px;">
                Healthcare appointment platform
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;color:#111827;font-size:20px;font-weight:600;">
                Welcome, ${recipientName}!
              </h2>
              <p style="margin:0 0 12px;color:#4b5563;font-size:15px;line-height:1.6;">
                Your <strong>${roleLabel}</strong> account has been created.
                Click the button below to activate it — the link expires in
                <strong>24 hours</strong>.
              </p>
              <p style="margin:0 0 32px;color:#4b5563;font-size:15px;line-height:1.6;">
                If you did not create this account, you can safely ignore this email.
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="border-radius:8px;background:#10b981;">
                    <a href="${activationLink}"
                       style="display:inline-block;padding:14px 36px;
                              color:#ffffff;font-size:15px;font-weight:600;
                              text-decoration:none;border-radius:8px;
                              letter-spacing:0.2px;">
                      Activate My Account
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback link -->
              <p style="margin:28px 0 0;color:#6b7280;font-size:13px;line-height:1.6;">
                Button not working? Copy and paste this link into your browser:<br/>
                <a href="${activationLink}"
                   style="color:#10b981;word-break:break-all;">
                  ${activationLink}
                </a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #f3f4f6;
                       background:#f9fafb;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                © ${new Date().getFullYear()} MediCare · This is an automated message, please do not reply.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return { subject, html };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface SendActivationEmailParams {
  recipientEmail: string;
  recipientName:  string;
  role:           'patient' | 'doctor';
  activationCode: string;
}

/**
 * Sends the account activation email.
 * Must be called from a server context (API route or server action).
 */
export async function sendActivationEmail(
  params: SendActivationEmailParams
): Promise<void> {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  const activationLink = `${appUrl}/active/${params.activationCode}`;

  const { subject, html } = buildActivationEmail({
    ...params,
    activationLink,
  });

  const transporter = createTransporter();

  await transporter.sendMail({
    from:    `"MediCare" <${process.env.GMAIL_USER}>`,
    to:      params.recipientEmail,
    subject,
    html,
  });
}