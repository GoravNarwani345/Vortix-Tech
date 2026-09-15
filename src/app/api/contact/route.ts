import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import prisma from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char] as string
  );
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limit = rateLimit(`contact:${ip}`, 5, 15 * 60 * 1000);
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
      );
    }

    const { name, email, phone, service, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Please provide name, email, and message." },
        { status: 400 }
      );
    }

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof message !== "string" ||
      name.length > 120 ||
      email.length > 200 ||
      message.length > 5000 ||
      (phone && (typeof phone !== "string" || phone.length > 40)) ||
      (service && (typeof service !== "string" || service.length > 80))
    ) {
      return NextResponse.json(
        { error: "Invalid input." },
        { status: 400 }
      );
    }

    const recipient =
      process.env.CONTACT_EMAIL ||
      process.env.EMAIL_USER ||
      "info@thevortixtech.com";

    // If email credentials are configured, send email via SMTP (Hostinger)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.hostinger.com",
        port: Number(process.env.SMTP_PORT || 465),
        secure: (process.env.SMTP_SECURE || "true") === "true",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: recipient,
        subject: `New Contact: ${name.replace(/[\r\n]+/g, " ")} - ${service || "General Inquiry"}`,
        text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || "N/A"}\nService: ${service || "N/A"}\n\nMessage:\n${message}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px;">
            <h2 style="color: #00E5FF;">New Contact Form Submission</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px; font-weight: bold;">Name:</td><td style="padding: 8px;">${escapeHtml(name)}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Email:</td><td style="padding: 8px;">${escapeHtml(email)}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Phone:</td><td style="padding: 8px;">${escapeHtml(phone || "N/A")}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Service:</td><td style="padding: 8px;">${escapeHtml(service || "N/A")}</td></tr>
            </table>
            <h3>Message:</h3>
            <p style="background: #f5f5f5; padding: 16px; border-radius: 8px; white-space: pre-wrap;">${escapeHtml(message)}</p>
          </div>
        `,
      });
    } else {
      console.log("Contact form submission (email not configured):", {
        name,
        email,
        phone,
        service,
        message,
      });
    }

    // Persist every submission so the admin feedback inbox stays in sync.
    try {
      await prisma.feedback.create({
        data: {
          name,
          email,
          subject: service || "General Inquiry",
          message: phone ? `Phone: ${phone}\n\n${message}` : message,
          status: "New",
        },
      });
    } catch (dbError) {
      console.error("Failed to save feedback record:", dbError);
    }

    return NextResponse.json({
      success: true,
      message: "Message sent successfully!",
    });
  } catch (error) {
    console.error("Contact API Error:", error);
    return NextResponse.json(
      { error: "Failed to send message." },
      { status: 500 }
    );
  }
}
