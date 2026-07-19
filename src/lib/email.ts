const RESEND_ENDPOINT = "https://api.resend.com/emails";
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://pathfinderlabs.vercel.app").replace(/\/$/, "");
const FROM = process.env.SECURITY_EMAIL_FROM || "Pathfinder AI <noreply@pf.binuu.dev>";
const PATHFINDER_LOGO = `${APP_URL}/email/pathfinder.png`;
const MINTRIUM_LOGO = `${APP_URL}/email/mintrium.png`;
const FONT_STACK = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function button(label: string, href: string): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="border-collapse:separate">
    <tr>
      <td align="center" bgcolor="#17171a" style="width:232px;border-radius:8px;background:#17171a">
        <a href="${escapeHtml(href)}" style="box-sizing:border-box;display:block;width:232px;padding:14px 18px;color:#ffffff;text-decoration:none;font-family:${FONT_STACK};font-size:15px;font-weight:600;line-height:20px;text-align:center">${escapeHtml(label)}</a>
      </td>
    </tr>
  </table>`;
}

function detailCard(rows: Array<[string, string]>): string {
  const content = rows
    .map(
      ([label, value]) => `<tr>
        <td class="detail-label" style="width:128px;padding:5px 24px 5px 0;color:#9a9aa5;font-family:${FONT_STACK};font-size:15px;font-weight:400;line-height:22px;white-space:nowrap">${escapeHtml(label)}:</td>
        <td style="padding:5px 0;color:#17171c;font-family:${FONT_STACK};font-size:15px;font-weight:600;line-height:22px">${escapeHtml(value)}</td>
      </tr>`
    )
    .join("");

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e9e9ec;border-radius:10px;background:#fafafa">
    <tr>
      <td style="padding:22px 24px">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">${content}</table>
      </td>
    </tr>
  </table>`;
}

function footer(reason: string): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top:1px solid #e9e9ec">
    <tr>
      <td style="padding-top:28px">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td style="padding-right:14px;vertical-align:middle">
              <img src="${PATHFINDER_LOGO}" width="124" alt="Pathfinder" style="display:block;width:124px;height:auto;border:0;outline:none;text-decoration:none">
            </td>
            <td style="padding:0 14px;border-left:1px solid #dedee2;color:#9a9aa5;font-family:${FONT_STACK};font-size:11px;line-height:16px;vertical-align:middle">A product of</td>
            <td style="vertical-align:middle">
              <img src="${MINTRIUM_LOGO}" width="62" alt="Mintrium" style="display:block;width:62px;height:auto;border:0;outline:none;text-decoration:none">
            </td>
          </tr>
        </table>
        <p style="margin:24px 0 0;color:#8f8f99;font-family:${FONT_STACK};font-size:12px;font-weight:400;line-height:19px">${escapeHtml(reason)}</p>
        <p style="margin:8px 0 0;color:#a2a2ab;font-family:${FONT_STACK};font-size:12px;font-weight:400;line-height:19px">You&#39;re receiving this email because this address is connected to a Pathfinder account. This automated mailbox is not monitored.</p>
        <p style="margin:16px 0 0;color:#a2a2ab;font-family:${FONT_STACK};font-size:12px;font-weight:400;line-height:19px">© ${new Date().getUTCFullYear()} Mintrium Developments. All rights reserved.</p>
        <p style="margin:7px 0 0;font-family:${FONT_STACK};font-size:12px;line-height:19px"><a href="${APP_URL}/privacy" style="color:#73737d;text-decoration:underline">Privacy</a><span style="color:#c0c0c6"> &nbsp;·&nbsp; </span><a href="${APP_URL}/terms" style="color:#73737d;text-decoration:underline">Terms</a><span style="color:#c0c0c6"> &nbsp;·&nbsp; </span><a href="${APP_URL}/dashboard/settings" style="color:#73737d;text-decoration:underline">Account settings</a></p>
      </td>
    </tr>
  </table>`;
}

function emailLayout(input: {
  title: string;
  preview: string;
  content: string;
  primaryAction?: string;
  primaryActionUrl?: string;
  panel?: string;
  secondary?: string;
  reason: string;
}): string {
  const action = input.primaryAction && input.primaryActionUrl
    ? `<div style="padding-top:28px">${button(input.primaryAction, input.primaryActionUrl)}</div>`
    : "";
  const panel = input.panel ? `<div style="padding-top:28px">${input.panel}</div>` : "";
  const secondary = input.secondary ? `<div style="padding-top:44px">${input.secondary}</div>` : "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
    <title>${escapeHtml(input.title)}</title>
    <style>
      @media only screen and (max-width: 600px) {
        .email-shell { padding: 28px 20px 36px !important; }
        .email-title { font-size: 28px !important; line-height: 35px !important; }
        .detail-label { width: 102px !important; white-space:normal !important; }
        .footer-product { display:block !important; padding:10px 0 0 !important; border:0 !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:#f7f7f8;color:#17171c;font-family:${FONT_STACK};-webkit-font-smoothing:antialiased">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${escapeHtml(input.preview)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#f7f7f8">
      <tr>
        <td class="email-shell" align="center" style="padding:48px 24px">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:620px;background:#ffffff;border:1px solid #e9e9ec;border-radius:14px">
            <tr>
              <td style="padding:42px 44px 0">
                <img src="${PATHFINDER_LOGO}" width="168" alt="Pathfinder" style="display:block;width:168px;max-width:100%;height:auto;border:0;outline:none;text-decoration:none">
              </td>
            </tr>
            <tr>
              <td style="padding:52px 44px 44px">
                <h1 class="email-title" style="margin:0;color:#17171c;font-family:${FONT_STACK};font-size:32px;font-weight:700;letter-spacing:-0.45px;line-height:40px;text-align:left">${escapeHtml(input.title)}</h1>
                <div style="padding-top:22px;color:#666671;font-family:${FONT_STACK};font-size:16px;font-weight:400;line-height:26px;text-align:left">${input.content}</div>
                ${panel}
                ${action}
                ${secondary}
              </td>
            </tr>
            <tr>
              <td style="padding:0 44px 40px">${footer(input.reason)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function sendEmail(input: { to: string; subject: string; html: string; text: string }): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");

  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
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

export async function sendVerificationEmail(input: { to: string; name: string; token: string }): Promise<void> {
  const url = `${APP_URL}/verify-email?token=${encodeURIComponent(input.token)}`;
  const name = escapeHtml(input.name || "there");
  await sendEmail({
    to: input.to,
    subject: "Verify your Pathfinder email",
    html: emailLayout({
      title: "Verify your email",
      preview: "Finish creating your Pathfinder account.",
      content: `<p style="margin:0">Hi ${name},</p><p style="margin:16px 0 0">Confirm this email address to finish creating your Pathfinder account.</p>`,
      primaryAction: "Verify email address",
      primaryActionUrl: url,
      reason: "This secure, single-use verification link expires in one hour.",
    }),
    text: `Hi ${input.name || "there"},\n\nVerify your email address to finish creating your Pathfinder account:\n${url}\n\nThis single-use verification link expires in one hour.`,
  });
}

export async function sendPasswordResetEmail(input: { to: string; name: string; token: string }): Promise<void> {
  const url = `${APP_URL}/reset-password?token=${encodeURIComponent(input.token)}`;
  const name = escapeHtml(input.name || "there");
  await sendEmail({
    to: input.to,
    subject: "Reset your Pathfinder password",
    html: emailLayout({
      title: "Reset your password",
      preview: "A password reset was requested for your Pathfinder account.",
      content: `<p style="margin:0">Hi ${name},</p><p style="margin:16px 0 0">We received a request to reset your Pathfinder password. Choose a new password using the secure link below.</p>`,
      primaryAction: "Choose a new password",
      primaryActionUrl: url,
      secondary: `<h2 style="margin:0;color:#17171c;font-family:${FONT_STACK};font-size:21px;font-weight:700;letter-spacing:-0.2px;line-height:28px">Didn&#39;t request this?</h2><p style="margin:12px 0 0;color:#666671;font-family:${FONT_STACK};font-size:15px;font-weight:400;line-height:24px">You can safely leave your password unchanged. Never share this link with anyone.</p>`,
      reason: "This secure, single-use password reset link expires in 30 minutes.",
    }),
    text: `We received a request to reset your Pathfinder password.\n\nChoose a new password: ${url}\n\nThis secure, single-use link expires in 30 minutes.`,
  });
}

export async function sendPasswordChangedEmail(input: { to: string; name: string }): Promise<void> {
  const name = escapeHtml(input.name || "there");
  await sendEmail({
    to: input.to,
    subject: "Your Pathfinder password was changed",
    html: emailLayout({
      title: "Password changed",
      preview: "Your Pathfinder password was changed.",
      content: `<p style="margin:0">Hi ${name},</p><p style="margin:16px 0 0">Your Pathfinder password was changed successfully. All existing sessions were signed out.</p><p style="margin:20px 0 0;font-size:14px;line-height:23px">If you didn&#39;t make this change, <a href="${APP_URL}/forgot-password" style="color:#303038;font-weight:600;text-decoration:underline">reset your password immediately</a>.</p>`,
      reason: "This security notification was sent because the password on your Pathfinder account changed.",
    }),
    text: `Your Pathfinder password was changed and existing sessions were signed out.\n\nIf you did not make this change, reset it immediately: ${APP_URL}/forgot-password`,
  });
}

export async function sendNewDeviceEmail(input: { to: string; name: string; signInType: string; device: string; location: string; ip: string; time: string }): Promise<void> {
  const details = detailCard([
    ["Sign-in type", input.signInType],
    ["Device", input.device],
    ["Location", input.location],
    ["IP address", input.ip],
    ["Time", input.time],
  ]);
  await sendEmail({
    to: input.to,
    subject: "New device signed in to your Pathfinder account",
    html: emailLayout({
      title: "New sign-in to your account",
      preview: "A new device signed in to your Pathfinder account.",
      content: `<p style="margin:0">A new device just signed in to your Pathfinder account. If you don&#39;t recognize this activity, review the details below and secure your account.</p>`,
      panel: details,
      secondary: `<h2 style="margin:0;color:#17171c;font-family:${FONT_STACK};font-size:21px;font-weight:700;letter-spacing:-0.2px;line-height:28px">Don&#39;t recognize this activity?</h2><p style="margin:12px 0 0;color:#666671;font-family:${FONT_STACK};font-size:15px;font-weight:400;line-height:24px">Change your password and sign out all active sessions using the button below.</p><div style="padding-top:22px">${button("Secure my account", `${APP_URL}/dashboard/settings`)}</div>`,
      reason: "This security notification was sent because Pathfinder detected a browser it had not seen on your account before.",
    }),
    text: `New sign-in to your Pathfinder account\n\nSign-in type: ${input.signInType}\nDevice: ${input.device}\nLocation: ${input.location}\nIP address: ${input.ip}\nTime: ${input.time}\n\nIf this was not you, secure your account: ${APP_URL}/dashboard/settings`,
  });
}

export async function sendSecurityTestEmail(input: { to: string; name: string }): Promise<void> {
  const name = escapeHtml(input.name || "there");
  await sendEmail({
    to: input.to,
    subject: "Pathfinder email delivery test",
    html: emailLayout({
      title: "Email delivery confirmed",
      preview: "Pathfinder account email delivery is working.",
      content: `<p style="margin:0">Hi ${name},</p><p style="margin:16px 0 0">Pathfinder successfully delivered this message to your verified email address.</p>`,
      primaryAction: "Open account settings",
      primaryActionUrl: `${APP_URL}/dashboard/settings`,
      reason: "This delivery test was requested from your Pathfinder account.",
    }),
    text: `Pathfinder successfully delivered an account email to ${input.to}.`,
  });
}
