import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { to, subject, text, html } = await req.json();

    if (!to || !subject || (!text && !html)) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });

    await transporter.verify(); // 🔥 IMPORTANT DEBUG

    await transporter.sendMail({
      from: `"Auction App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    return NextResponse.json({ message: "Email sent successfully" });
  } catch (error: any) {
    console.error("Email error:", error);
    return NextResponse.json(
      { message: "Email failed", error: error.message },
      { status: 500 }
    );
  }
}
