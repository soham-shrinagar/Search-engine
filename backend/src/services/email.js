const nodemailer = require('nodemailer');

let transporter = null;

function isResendConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

function isBrevoConfigured() {
  return Boolean(process.env.BREVO_API_KEY && process.env.BREVO_SENDER_EMAIL);
}

function isEmailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter() {
  if (!isEmailConfigured()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
  }
  return transporter;
}

async function sendViaResend(email, subject, text) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || 'SearchSphere <onboarding@resend.dev>',
      to: [email],
      subject,
      text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Email delivery failed: ${body}`);
  }
}

async function sendViaBrevo(email, subject, text) {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'SearchSphere', email: process.env.BREVO_SENDER_EMAIL },
      to: [{ email }],
      subject,
      textContent: text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Email delivery failed: ${body}`);
  }
}

async function sendViaSmtp(email, subject, text) {
  const transport = getTransporter();
  await transport.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to: email,
    subject,
    text,
  });
}

async function sendOtpEmail(email, code, purpose) {
  const action = purpose === 'signup' ? 'create your account' : 'sign in';
  const subject = 'Your SearchSphere verification code';
  const text = `Your verification code is ${code}. It expires in 10 minutes.\n\nUse this code to ${action} on SearchSphere.\n\nIf you didn't request this, you can ignore this email.`;

  if (isBrevoConfigured()) {
    await sendViaBrevo(email, subject, text);
    return;
  }

  if (isResendConfigured()) {
    await sendViaResend(email, subject, text);
    return;
  }

  if (isEmailConfigured()) {
    try {
      await sendViaSmtp(email, subject, text);
      return;
    } catch (err) {
      const blocked = process.env.NODE_ENV === 'production';
      const hint = blocked
        ? ' Render blocks Gmail SMTP on the free plan. Add BREVO_API_KEY + BREVO_SENDER_EMAIL on Render (free at brevo.com).'
        : '';
      const error = new Error(`SMTP failed: ${err.message}.${hint}`);
      error.status = 503;
      throw error;
    }
  }

  console.log(`[DEV OTP] ${purpose} for ${email}: ${code}`);
}

module.exports = { sendOtpEmail, isEmailConfigured, isResendConfigured };
