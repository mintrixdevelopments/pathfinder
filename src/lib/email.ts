import { readFile } from "node:fs/promises";
import { join } from "node:path";

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://pathfinderlabs.vercel.app").replace(/\/$/, "");
const FROM = process.env.SECURITY_EMAIL_FROM || "Pathfinder AI <noreply@pf.binuu.dev>";
const LOGO_CID = "pathfinder-logo";
const FONT_STACK = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

let logoContentPromise: Promise<string | null> | null = null;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function button(label: string, href: string): string {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;background:#17171a;color:#ffffff;text-decoration:none;font-family:${FONT_STACK};font-size:15px;font-weight:600;line-height:20px;padding:14px 20px;border-radius:7px">${escapeHtml(label)}</a>`;
}

function detailCard(rows: Array<[string, string]>): string {
  const content = rows
    .map(
      ([label, value]) => `
        <tr>
          <td class="detail-label" style="padding:5px 24px 5px 0;color:#9a9aa5;font-size:15px;font-weight:400;line-height:22px;white-space:nowrap">${escapeHtml(label)}:</td>
          <td style="padding:5px 0;color:#17171c;font-size:15px;font-weight:600;line-height:22px">${escapeHtml(value)}</td>
        </tr>`
    )
    .join("");

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #eeeeef;border-radius:8px;background:#fafafa">
    <tr>
      <td style="padding:24px 28px">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${content}</table>
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
  footer: string;
}): string {
  const action = input.primaryAction && input.primaryActionUrl
    ? `<div style="padding-top:26px">${button(input.primaryAction, input.primaryActionUrl)}</div>`
    : "";
  const panel = input.panel ? `<div style="padding-top:26px">${input.panel}</div>` : "";
  const secondary = input.secondary
    ? `<div style="padding-top:46px">${input.secondary}</div>`
    : "";

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
        .email-shell { padding: 36px 20px !important; }
        .email-title { font-size: 30px !important; line-height: 38px !important; }
        .detail-label { width: 104px !important; white-space: normal !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:#ffffff;color:#17171c;font-family:${FONT_STACK};-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${escapeHtml(input.preview)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;background:#ffffff">
      <tr>
        <td class="email-shell" align="center" style="padding:68px 24px 48px">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;max-width:640px">
            <tr>
              <td align="center" style="padding-bottom:70px">
                <img src="cid:${LOGO_CID}" width="176" alt="Pathfinder" style="display:block;width:176px;max-width:100%;height:auto;border:0;outline:none;text-decoration:none">
              </td>
            </tr>
            <tr>
              <td>
                <h1 class="email-title" style="margin:0;color:#17171c;font-size:34px;font-weight:700;letter-spacing:-0.45px;line-height:42px">${escapeHtml(input.title)}</h1>
                <div style="padding-top:26px;color:#6f6f7c;font-size:17px;font-weight:400;line-height:28px">${input.content}</div>
                ${panel}
                ${action}
                ${secondary}
              </td>
            </tr>
            <tr>
              <td style="padding-top:62px">
                <div style="border-top:1px solid #eeeeef;padding-top:22px;color:#9d9da8;font-size:12px;font-weight:400;line-height:19px">${escapeHtml(input.footer)}</div>
                <div style="padding-top:8px;color:#b0b0b9;font-size:11px;font-weight:400;line-height:17px">Pathfinder · Built by Mintrix Developments</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function getLogoContent(): Promise<string | null> {
  if (!logoContentPromise) {
    logoContentPromise = readFile(join(process.cwd(), "public", "email-logo.png"))
      .then((file) => file.toString("base64"))
      .catch((error) => {
        console.error("Pathfinder email logo could not be embedded", error);
        return null;
      });
  }
  return logoContentPromise;
}

async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");

  const logoContent = await getLogoContent();
  const html = logoContent
    ? input.html
    : input.html.replace(`cid:${LOGO_CID}`, `${APP_URL}/email-logo.png`);
  const attachments = logoContent
    ? [{
        content: logoContent,
        filename: "pathfinder-logo.png",
        content_id: LOGO_CID,
      }]
    : undefined;

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
      html,
      text: input.text,
      attachments,
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
    html: emailLayout({
      title: "Verify your email",
      preview: "Finish creating your Pathfinder account.",
      content: `<p style="margin:0">Hi ${name},</p><p style="margin:16px 0 0">Use the button below to verify this email address and finish creating your Pathfinder account.</p>`,
      primaryAction: "Verify email address",
      primaryActionUrl: url,
      footer: "This single-use verification link expires in one hour.",
    }),
    text: `Hi ${input.name || "there"},\n\nVerify your email address to finish creating your Pathfinder account:\n${url}\n\nThis single-use verification link expires in one hour.`,
  });
}

export async function sendPasswordResetEmail(input: {
  to: string;
  name: string;
  token: string;
}): Promise<void> {
  const url = `${APP_URL}/reset-password?token=${encodeURIComponent(input.token)}`;
  const name = escapeHtml(input.name || "there");

  await sendEmail({
    to: input.to,
    subject: "Reset your Pathfinder password",
    html: emailLayout({
      title: "Reset your password",
      preview: "A password reset was requested for your Pathfinder account.",
      content: `<p style="margin:0">Hi ${name},</p><p style="margin:16px 0 0">A password reset was requested for your Pathfinder account. Choose a new password using the secure link below.</p>`,
      primaryAction: "Choose a new password",
      primaryActionUrl: url,
      secondary: `<h2 style="margin:0;color:#17171c;font-size:22px;font-weight:700;letter-spacing:-0.2px;line-height:29px">Wasn&#39;t you?</h2><p style="margin:12px 0 0;color:#6f6f7c;font-size:15px;font-weight:400;line-height:25px">Do not share this link. Use it to replace your password, then sign out every device from Pathfinder settings.</p>`,
      footer: "This secure, single-use link expires in 30 minutes.",
    }),
    text: `A password reset was requested for your Pathfinder account.\n\nChoose a new password: ${url}\n\nThis secure, single-use link expires in 30 minutes. Do not share it.`,
  });
}

export async function sendPasswordChangedEmail(input: {
  to: string;
  name: string;
}): Promise<void> {
  const name = escapeHtml(input.name || "there");

  await sendEmail({
    to: input.to,
    subject: "Your Pathfinder password was changed",
    html: emailLayout({
      title: "Password changed",
      preview: "Your Pathfinder password was changed.",
      content: `<p style="margin:0">Hi ${name},</p><p style="margin:16px 0 0">Your Pathfinder password was changed successfully. Existing sessions have been signed out and will need to authenticate again.</p>`,
      primaryAction: "Sign in to Pathfinder",
      primaryActionUrl: `${APP_URL}/sign-in`,
      secondary: `<h2 style="margin:0;color:#17171c;font-size:22px;font-weight:700;letter-spacing:-0.2px;line-height:29px">Don&#39;t recognize this change?</h2><p style="margin:12px 0 0;color:#6f6f7c;font-size:15px;font-weight:400;line-height:25px">Reset your password immediately using a trusted device.</p><div style="padding-top:20px">${button("Reset password", `${APP_URL}/forgot-password`)}</div>`,
      footer: "This is an automated Pathfinder account security notification.",
    }),
    text: `Your Pathfinder password was changed and existing sessions were signed out.\n\nIf you did not make this change, reset it immediately: ${APP_URL}/forgot-password`,
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
      content: `<p style="margin:0">A new device just signed in to your Pathfinder account. If you don&#39;t recognize this device, please check your account for any unauthorized activity.</p>`,
      panel: details,
      secondary: `<h2 style="margin:0;color:#17171c;font-size:22px;font-weight:700;letter-spacing:-0.2px;line-height:29px">Don&#39;t recognize this activity?</h2><p style="margin:12px 0 0;color:#6f6f7c;font-size:15px;font-weight:400;line-height:25px">To protect your account, change your password and sign out all active sessions using the button below.</p><div style="padding-top:20px">${button("Secure my account", `${APP_URL}/dashboard/settings`)}</div>`,
      footer: "This alert was sent because Pathfinder detected a browser it had not seen on your account before.",
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
      preview: "Pathfinder security email delivery is working.",
      content: `<p style="margin:0">Hi ${name},</p><p style="margin:16px 0 0">Pathfinder successfully delivered this message to your verified email address.</p>`,
      primaryAction: "Open Pathfinder settings",
      primaryActionUrl: `${APP_URL}/dashboard/settings`,
      footer: "This delivery test was requested from your Pathfinder account settings.",
    }),
    text: `Pathfinder successfully delivered a security email to ${input.to}.`,
  });
}
