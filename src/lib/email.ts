const RESEND_ENDPOINT = "https://api.resend.com/emails";
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://pathfinderlabs.vercel.app").replace(/\/$/, "");
const FROM = process.env.SECURITY_EMAIL_FROM || "Pathfinder AI <noreply@pf.binuu.dev>";
const SUBJECT_PREFIX = "[Development]";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function button(label: string, href: string): string {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;background:#171717;color:#ffffff;text-decoration:none;font-size:15px;font-weight:650;line-height:20px;padding:13px 19px;border-radius:9px">${escapeHtml(label)}</a>`;
}

function layout(input: {
  title: string;
  preview: string;
  body: string;
  action?: string;
  actionUrl?: string;
  secondary?: string;
  footer: string;
}): string {
  const action = input.action && input.actionUrl
    ? `<div style="padding-top:26px">${button(input.action, input.actionUrl)}</div>`
    : "";
  const secondary = input.secondary
    ? `<div style="padding-top:38px">${input.secondary}</div>`
    : "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <title>${escapeHtml(input.title)}</title>
  </head>
  <body style="margin:0;background:#ffffff;color:#171717;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(input.preview)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#ffffff">
      <tr>
        <td align="center" style="padding:48px 20px">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px">
            <tr>
              <td style="padding-bottom:52px">
                <img src="cid:pathfinder-logo" width="168" alt="Pathfinder" style="display:block;width:168px;height:auto;border:0">
              </td>
            </tr>
            <tr>
              <td>
                <h1 style="margin:0;font-size:32px;line-height:40px;letter-spacing:-1px;font-weight:750;color:#171717">${escapeHtml(input.title)}</h1>
                <div style="margin-top:20px;font-size:16px;line-height:26px;color:#62626f">${input.body}</div>
                ${action}
                ${secondary}
              </td>
            </tr>
            <tr>
              <td style="padding-top:52px;font-size:12px;line-height:19px;color:#9a9aa5">
                <div style="padding-top:20px;border-top:1px solid #eeeeef">${escapeHtml(input.footer)}</div>
              </td>
            </tr>
          </table>
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
      attachments: [
        {
          path: `${APP_URL}/email-logo.png`,
          filename: "pathfinder-logo.png",
          content_id: "pathfinder-logo",
        },
      ],
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
    subject: `${SUBJECT_PREFIX} Verify your Pathfinder email`,
    html: layout({
      title: "Verify your email",
      preview: "Complete your Pathfinder account setup.",
      body: `<p style="margin:0">Hi ${name},</p><p style="margin:14px 0 0">Confirm your email address to finish setting up your Pathfinder account.</p>`,
      action: "Verify email address",
      actionUrl: url,
      footer: "This verification link expires in one hour.",
    }),
    text: `Hi ${input.name || "there"},\n\nConfirm your email address to finish setting up your Pathfinder account:\n${url}\n\nThis verification link expires in one hour.`,
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
    subject: `${SUBJECT_PREFIX} Reset your Pathfinder password`,
    html: layout({
      title: "Reset your password",
      preview: "A password reset was requested for your Pathfinder account.",
      body: `<p style="margin:0">Hi ${escapeHtml(input.name || "there")},</p><p style="margin:14px 0 0">We received a request to reset your Pathfinder password. Choose a new password using the secure link below.</p>`,
      action: "Choose a new password",
      actionUrl: url,
      footer: "This secure, single-use link expires in 30 minutes.",
    }),
    text: `A password reset was requested for your Pathfinder account.\n\nChoose a new password: ${url}\n\nThis secure, single-use link expires in 30 minutes.`,
  });
}

export async function sendPasswordChangedEmail(input: {
  to: string;
  name: string;
}): Promise<void> {
  await sendEmail({
    to: input.to,
    subject: `${SUBJECT_PREFIX} Your Pathfinder password was changed`,
    html: layout({
      title: "Password changed",
      preview: "Your Pathfinder account password was updated.",
      body: `<p style="margin:0">Hi ${escapeHtml(input.name || "there")},</p><p style="margin:14px 0 0">The password for your Pathfinder account was changed successfully.</p>`,
      action: "Open account settings",
      actionUrl: `${APP_URL}/dashboard/settings`,
      footer: "If you did not make this change, reset your password immediately and review your account activity.",
    }),
    text: `Your Pathfinder password was changed.\n\nIf you did not make this change, review your account security immediately: ${APP_URL}/dashboard/settings`,
  });
}

export async function sendNewDeviceEmail(input: {
  to: string;
  name: string;
  signInType: string;
  device: string;
  location: string;
  ip: string;
  time: string;
}): Promise<void> {
  const rows = [
    ["Sign-in type", input.signInType],
    ["Device", input.device],
    ["Location", input.location],
    ["IP address", input.ip],
    ["Time", input.time],
  ]
    .map(([label, value]) => `<tr><td style="padding:6px 18px 6px 0;color:#a0a0aa;white-space:nowrap">${escapeHtml(label)}</td><td style="padding:6px 0;font-weight:650;color:#24242a">${escapeHtml(value)}</td></tr>`)
    .join("");

  await sendEmail({
    to: input.to,
    subject: `${SUBJECT_PREFIX} New device signed in to your Pathfinder account`,
    html: layout({
      title: "New sign-in to your account",
      preview: "Review a new sign-in to your Pathfinder account.",
      body: `<p style="margin:0">Hi ${escapeHtml(input.name || "there")},</p><p style="margin:14px 0 22px">A new device signed in to your Pathfinder account.</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fafafa;border:1px solid #eeeeef;border-radius:12px;padding:18px 20px">${rows}</table>`,
      secondary: `<h2 style="margin:0;font-size:21px;line-height:28px;letter-spacing:-0.4px;color:#171717">Don&#39;t recognize this activity?</h2><p style="margin:10px 0 0;font-size:15px;line-height:24px;color:#62626f">Change your password and sign out every device connected to your account.</p><div style="padding-top:20px">${button("Secure my account", `${APP_URL}/dashboard/settings`)}</div>`,
      footer: "You received this email because sign-in alerts are enabled for your Pathfinder account.",
    }),
    text: `New sign-in to your Pathfinder account\n\nSign-in type: ${input.signInType}\nDevice: ${input.device}\nLocation: ${input.location}\nIP address: ${input.ip}\nTime: ${input.time}\n\nReview account security: ${APP_URL}/dashboard/settings`,
  });
}
