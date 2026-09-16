import dns from "node:dns";
import nodemailer from "nodemailer";
import { Resend } from "resend";

// Many VPS hosts (e.g. DigitalOcean) block outbound SMTP ports, so the default
// transport is the Resend HTTPS API. SMTP is kept as a fallback for hosts that
// allow ports 465/587.
dns.setDefaultResultOrder("ipv4first");

export type OutgoingMail = {
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
};

function getFromAddress(): string {
  return (
    process.env.EMAIL_FROM ||
    process.env.EMAIL_USER ||
    "Vortix Tech <onboarding@resend.dev>"
  );
}

export function isMailConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY ||
      (process.env.EMAIL_USER && process.env.EMAIL_PASS)
  );
}

async function sendWithResend(mail: OutgoingMail): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: getFromAddress(),
    to: [mail.to],
    replyTo: mail.replyTo,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
  });

  if (error) {
    throw new Error(error.message);
  }
}

async function sendWithSmtp(mail: OutgoingMail): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.hostinger.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: (process.env.SMTP_SECURE || "true") === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000,
  });

  await transporter.sendMail({
    from: getFromAddress(),
    to: mail.to,
    replyTo: mail.replyTo,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
  });
}

/**
 * Sends an email through Resend when RESEND_API_KEY is set, otherwise falls
 * back to SMTP. Never throws — returns whether the send succeeded.
 */
export async function sendMail(mail: OutgoingMail): Promise<boolean> {
  try {
    if (process.env.RESEND_API_KEY) {
      await sendWithResend(mail);
      return true;
    }

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await sendWithSmtp(mail);
      return true;
    }

    console.log("Email not configured; skipping send.");
    return false;
  } catch (error) {
    console.error("Email failed to send:", error);
    return false;
  }
}
