import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, service, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Please provide name, email, and message." },
        { status: 400 }
      );
    }

    // If email credentials are configured, send email
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: "techvortix@gmail.com",
        subject: `New Contact: ${name} - ${service || "General Inquiry"}`,
        text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || "N/A"}\nService: ${service || "N/A"}\n\nMessage:\n${message}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px;">
            <h2 style="color: #00E5FF;">New Contact Form Submission</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px; font-weight: bold;">Name:</td><td style="padding: 8px;">${name}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Email:</td><td style="padding: 8px;">${email}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Phone:</td><td style="padding: 8px;">${phone || "N/A"}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Service:</td><td style="padding: 8px;">${service || "N/A"}</td></tr>
            </table>
            <h3>Message:</h3>
            <p style="background: #f5f5f5; padding: 16px; border-radius: 8px;">${message}</p>
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
