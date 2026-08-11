'use strict';

const nodemailer = require('nodemailer');

let transporterPromise = null;
let lastSmtpError = null;

function normalizeSecret(value) {
  return String(value || '')
    .trim()
    // Gmail app passwords are often copied with spaces: "abcd efgh ijkl mnop"
    .replace(/\s+/g, '');
}

function getLastSmtpError() {
  return lastSmtpError;
}

function buildGmailTransport() {
  const user = normalizeSecret(process.env.SMTP_USER);
  const pass = normalizeSecret(process.env.SMTP_PASS);

  if (!user || !pass) {
    lastSmtpError = 'SMTP_USER or SMTP_PASS is missing in backend/.env';
    return null;
  }

  const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const port = Number(process.env.SMTP_PORT) || 587;
  const secureEnv = String(process.env.SMTP_SECURE || '').toLowerCase();
  const secure =
    secureEnv === 'true' || (secureEnv === '' && port === 465);

  if (port === 587 && secure) {
    lastSmtpError =
      'Invalid SMTP config: port 587 requires SMTP_SECURE=false';
    return null;
  }
  if (port === 465 && !secure) {
    lastSmtpError =
      'Invalid SMTP config: port 465 requires SMTP_SECURE=true';
    return null;
  }

  // Explicit Gmail SMTP only (no Ethereal).
  return nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS: !secure && port === 587,
    auth: {
      user,
      pass,
    },
    tls: {
      minVersion: 'TLSv1.2',
    },
  });
}

async function getTransporter() {
  if (transporterPromise) return transporterPromise;

  transporterPromise = (async () => {
    const transport = buildGmailTransport();
    if (!transport) {
      console.error(`[mail] ${lastSmtpError}`);
      return null;
    }

    try {
      await transport.verify();
      lastSmtpError = null;
      console.log(
        `[mail] Gmail SMTP ready (${normalizeSecret(process.env.SMTP_USER)})`,
      );
      return transport;
    } catch (err) {
      lastSmtpError = err?.response || err?.message || String(err);
      console.error('[mail] Gmail SMTP login failed:', lastSmtpError);
      console.error(
        '[mail] Google rejected SMTP_PASS. It must be an App Password for',
        normalizeSecret(process.env.SMTP_USER),
      );
      console.error(
        '[mail] Create one: https://myaccount.google.com/apppasswords',
      );
      return null;
    }
  })();

  return transporterPromise;
}

function resetTransporter() {
  transporterPromise = null;
}

function frontendUrl(path = '/') {
  // Student app (frontend), never admin — default matches Next.js student port.
  const base = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(
    /\/$/,
    '',
  );
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

async function sendMail({ to, subject, html, text }) {
  const mailer = await getTransporter();
  const from =
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    'ImReady <noreply@imready.io>';

  if (!mailer) {
    const err = new Error(
      'Gmail SMTP is not available. Check SMTP_USER and SMTP_PASS (Google App Password) in backend/.env, then restart the server.',
    );
    err.statusCode = 503;
    throw err;
  }

  const info = await mailer.sendMail({
    from,
    to,
    subject,
    html,
    text,
  });

  console.log(`[mail] Sent "${subject}" to ${to} via Gmail (id: ${info.messageId})`);
  return {
    sent: true,
    messageId: info.messageId,
  };
}

async function sendVerificationEmail({ email, fullName, token, careerDoor }) {
  const verifyUrl = frontendUrl(
    `/verify-email?token=${encodeURIComponent(token)}`,
  );
  const isPremium = careerDoor === 'bytex-unlock';
  const nextStep = isPremium
    ? 'After verification you will continue to the Bytex premium page.'
    : 'After verification you will continue to your dashboard.';

  const subject = 'Verify your ImReady account';
  const text = `Hi ${fullName},\n\nThanks for signing up for ImReady.\n\nOpen the Verify button in this email to activate your account.\n\n${nextStep}\n\nThis link expires in 1 hour. If you did not create an account, you can ignore this email.`;
  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verify your ImReady account</title>
  </head>
  <body style="margin:0;padding:0;background:#f3f6fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f6fb;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="background:#153a75;padding:24px 28px;">
                <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;">ImReady</p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 28px;">
                <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:#153a75;">Verify your email</h1>
                <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#4b5563;">
                  Hi ${fullName},
                </p>
                <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#4b5563;">
                  Thanks for creating your ImReady account. Click the button below to verify your email and activate your account.
                </p>
                <p style="margin:0 0 28px;font-size:14px;line-height:1.6;color:#6b7280;">
                  ${nextStep}
                </p>
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 24px;">
                  <tr>
                    <td align="center" bgcolor="#153a75" style="border-radius:8px;">
                      <a href="${verifyUrl}"
                         style="display:inline-block;padding:14px 36px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:8px;background:#153a75;">
                        Verify
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0;font-size:12px;line-height:1.6;color:#9ca3af;">
                  This link expires in 1 hour. If you did not create an account, you can ignore this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `;

  try {
    return await sendMail({ to: email, subject, html, text });
  } catch (err) {
    console.error(
      '[mail] Failed to send verification email via Gmail:',
      err?.message || err,
    );
    console.warn(`[mail] Manual verify link for ${email}: ${verifyUrl}`);
    return { skipped: true, error: true, verifyUrl };
  }
}

async function sendPasswordResetEmail({ email, fullName, token }) {
  const resetUrl = frontendUrl(
    `/reset-password?token=${encodeURIComponent(token)}`,
  );
  const subject = 'Reset your ImReady password';
  const text = `Hi ${fullName},\n\nReset your password using this link:\n${resetUrl}\n\nThis link expires in 1 hour. If you did not request this, ignore this email.`;
  const html = `
    <p>Hi ${fullName},</p>
    <p>We received a request to reset your ImReady password.</p>
    <p><a href="${resetUrl}" style="display:inline-block;padding:12px 28px;background:#153a75;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;">Reset Password</a></p>
    <p>Or copy this link: ${resetUrl}</p>
    <p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p>
  `;

  try {
    return await sendMail({ to: email, subject, html, text });
  } catch (err) {
    console.error(
      '[mail] Failed to send password reset email via Gmail:',
      err?.message || err,
    );
    console.warn(`[mail] Manual reset link for ${email}: ${resetUrl}`);
    const error = new Error(
      'Could not send password reset email. Please try again later.',
    );
    error.statusCode = 503;
    throw error;
  }
}

async function verifyMailConfig() {
  resetTransporter();
  const mailer = await getTransporter();
  return Boolean(mailer);
}

module.exports = {
  sendMail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  frontendUrl,
  verifyMailConfig,
  resetTransporter,
  getLastSmtpError,
};
