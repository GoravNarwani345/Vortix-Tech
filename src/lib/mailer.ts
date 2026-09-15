import dns from "node:dns";
import nodemailer from "nodemailer";

// Many VPS hosts have no IPv6 route. Prefer IPv4 so SMTP connections don't
// fail with ENETUNREACH when a host resolves to an AAAA record first.
dns.setDefaultResultOrder("ipv4first");

export function createMailer() {
  return nodemailer.createTransport({
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
}
