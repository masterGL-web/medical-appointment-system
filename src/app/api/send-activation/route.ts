//src/app/api/send-activation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { recipientEmail, recipientName, role, activationCode } = await req.json();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: recipientEmail,
      subject: `Activate your My Appointments ${role} account`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto">
          <h2>Verify Your ${role.charAt(0).toUpperCase() + role.slice(1)} Account</h2>
          <p>Hello ${recipientName},</p>
          <p>Your activation code is:</p>
          <div style="font-size:32px;font-weight:bold;letter-spacing:8px;
                      background:#f0f4ff;padding:16px;border-radius:8px;
                      text-align:center;margin:16px 0">
            ${activationCode}
          </div>
          <p>This code expires in <strong>24 hours</strong>.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/check-email"
             style="display:inline-block;padding:12px 24px;background:#1d4ed8;
                    color:white;border-radius:8px;text-decoration:none">
            Verify Now
          </a>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Email sending failed:', error);
    return NextResponse.json({ ok: false, error: 'Failed to send email' }, { status: 500 });
  }
}