const RESEND_ENDPOINT = "https://api.resend.com/emails";
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://pathfinderlabs.vercel.app").replace(/\/$/, "");
const FROM = process.env.SECURITY_EMAIL_FROM || "Pathfinder <noreply@pf.binuu.dev>";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function button(label: string, href: string): string {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;background:#171717;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;line-height:20px;padding:12px 18px;border-radius:9px">${escapeHtml(label)}</a>`;
}

function layout(input: {
  eyebrow: string;
  title: string;
  preview: string;
  body: string;
  action?: string;
  actionUrl?: string;
  footer?: string;
}): string {
  const action = input.action && input.actionUrl
    ? `<div style="padding-top:24px">${button(input.action, input.actionUrl)}</div>`
    : "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <title>${escapeHtml(input.title)}</title>
  </head>
  <body style="margin:0;background:#f5f5f5;color:#171717;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(input.preview)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f5f5">
      <tr>
        <td align="center" style="padding:40px 16px">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #e5e5e5;border-radius:16px;overflow:hidden">
            <tr>
              <td style="padding:24px 32px;border-bottom:1px solid #eeeeee">
                <div style="font-size:20px;font-weight:750;letter-spacing:-0.5px">Pathfinder</div>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 32px 32px">
                <div style="font-size:12px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#737373">${escapeHtml(input.eyebrow)}</div>
                <h1 style="margin:12px 0 0;font-size:28px;line-height:35px;letter-spacing:-0.8px">${escapeHtml(input.title)}</h1>
                <div style="margin-top:18px;font-size:15px;line-height:24px;color:#525252">${input.body}</div>
                ${action}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background:#fafafa;border-top:1px solid #eeeeee;font-size:12px;line-height:18px;color:#8a8a8a">
                ${escapeHtml(input.footer || "This is an automated security message from Pathfinder. Please do not reply.")}
              </td>
            </tr>
          </table>
          <div style="padding-top:18px;font-size:11px;color:#a3a3a3">Pathfinder by Mintrix Developments</div>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");

  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend request failed (${response.status}): ${detail}`);
  }
}

export async function sendVerificationEmail(input: {
  to: string;
  name: string;
  token: string;
}): Promise<void> {
  const url = `${APP_URL}/verify-email?token=${encodeURIComponent(input.token)}`;
  const name = escapeHtml(input.name || "there");
  await sendEmail({
    to: input.to,
    subject: "Verify your Pathfinder email",
    html: layout({
      eyebrow: "Account verification",
      title: "Verify your email",
      preview: "Finish creating your Pathfinder account.",
      body: `<p style="margin:0">Hi ${name},</p><p style="margin:12px 0 0">Confirm this email address to activate your Pathfinder account. This link expires in one hour.</p>`,
      action: "Verify email",
      actionUrl: url,
      footer: "If you did not create a Pathfinder account, you can safely ignore this email.",
    }),
    text: `Hi ${input.name || "there"},\n\nVerify your Pathfinder email: ${url}\n\nThis link expires in one hour.`,
  });
}

export async function sendPasswordResetEmail(input: {
  to: string;
  name: string;
  token: string;
}): Promise<void> {
  const url = `${APP_URL}/reset-password?token=${encodeURIComponent(input.token)}`;
  await sendEmail({
    to: input.to,
    subject: "Reset your Pathfinder password",
    html: layout({
      eyebrow: "Account security",
      title: "Reset your password",
      preview: "A password reset was requested for your Pathfinder account.",
      body: `<p style="margin:0">Hi ${escapeHtml(input.name || "there")},</p><p style="margin:12px 0 0">Use the button below to choose a new password. This single-use link expires in 30 minutes.</p>`,
      action: "Reset password",
      actionUrl: url,
      footer: "If you did not request this reset, your password has not changed and you can ignore this email.",
    }),
    text: `Reset your Pathfinder password: ${url}\n\nThis link expires in 30 minutes.`,
  });
}

export async function sendPasswordChangedEmail(input: {
  to: string;
  name: string;
}): Promise<void> {
  await sendEmail({
    to: input.to,
    subject: "Your Pathfinder password was changed",
    html: layout({
      eyebrow: "Account security",
      title: "Password changed",
      preview: "Your Pathfinder password was changed successfully.",
      body: `<p style="margin:0">Hi ${escapeHtml(input.name || "there")},</p><p style="margin:12px 0 0">The password for your Pathfinder account was changed successfully.</p>`,
      action: "Review account",
      actionUrl: `${APP_URL}/dashboard/settings`,
      footer: "If this was not you, reset your password immediately and secure your email account.",
    }),
    text: `Your Pathfinder password was changed. Review your account: ${APP_URL}/dashboard/settings`,
  });
}

export async function sendNewDeviceEmail(input: {
  to: string;
  name: string;
  device: string;
  location: string;
  ip: string;
  time: string;
}): Promise<void> {
  const rows = [
    ["Device", input.device],
    ["Location", input.location],
    ["IP address", input.ip],
    ["Time", input.time],
  ]
    .map(([label, value]) => `<tr><td style="padding:5px 14px 5px 0;color:#a3a3a3">${escapeHtml(label)}</td><td style="padding:5px 0;font-weight:600;color:#262626">${escapeHtml(value)}</td></tr>`)
    .join("");

  await sendEmail({
    to: input.to,
    subject: "New device signed in to your Pathfinder account",
    html: layout({
      eyebrow: "New sign-in",
      title: "A new device signed in",
      preview: "Review a new sign-in to your Pathfinder account.",
      body: `<p style="margin:0">Hi ${escapeHtml(input.name || "there")},</p><p style="margin:12px 0 18px">Pathfinder noticed a sign-in from a browser we have not seen before.</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fafafa;border:1px solid #eeeeee;border-radius:10px;padding:12px 16px">${rows}</table>`,
      action: "Review activity",
      actionUrl: `${APP_URL}/dashboard/settings`,
      footer: "If this was you, no action is required. Location is approximate and may be affected by a VPN or mobile network.",
    }),
    text: `New Pathfinder sign-in\nDevice: ${input.device}\nLocation: ${input.location}\nIP: ${input.ip}\nTime: ${input.time}\n\nReview: ${APP_URL}/dashboard/settings`,
  });
}
