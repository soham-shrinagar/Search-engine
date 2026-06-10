const nodemailer = require('nodemailer');

let transporter = null;

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
    });
  }
  return transporter;
}

async function sendOtpEmail(email, code, purpose) {
  const action = purpose === 'signup' ? 'create your account' : 'sign in';
  const subject = `Your SearchSphere verification code`;
  const text = `Your verification code is ${code}. It expires in 10 minutes.\n\nUse this code to ${action} on SearchSphere.\n\nIf you didn't request this, you can ignore this email.`;

  if (!isEmailConfigured()) {
    console.log(`[DEV OTP] ${purpose} for ${email}: ${code}`);
    return;
  }

  const transport = getTransporter();
  await transport.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to: email,
    subject,
    text,
  });
}

module.exports = { sendOtpEmail, isEmailConfigured };
