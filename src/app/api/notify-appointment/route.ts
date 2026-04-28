// // src/app/api/notify-appointment/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import nodemailer from 'nodemailer';
// import { notificationService } from '@/services/notification.service'; // ← STATIC IMPORT (was dynamic, now fixed)

// // ─── Request body type ────────────────────────────────────────────────────────

// interface NotifyAppointmentBody {
//   patientEmail:  string;
//   patientName:   string;
//   patientUserId: string;
//   doctorName:    string;
//   status:        'confirmed' | 'cancelled';
//   date:          string;
//   startTime:     string;
// }

// // ─── Algerian date/time formatting ───────────────────────────────────────────

// function formatAlgerianDate(dateStr: string): string {
//   return new Date(dateStr).toLocaleDateString('fr-DZ', {
//     timeZone: 'Africa/Algiers',
//     weekday:  'long',
//     year:     'numeric',
//     month:    'long',
//     day:      'numeric',
//   });
// }

// function formatAlgerianTime(timeStr: string): string {
//   const [hours, minutes] = timeStr.split(':');
//   return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
// }

// // ─── Email templates ──────────────────────────────────────────────────────────

// function buildEmail(
//   patientName: string,
//   doctorName:  string,
//   date:        string,
//   startTime:   string,
//   status:      'confirmed' | 'cancelled'
// ): { subject: string; html: string } {
//   const formattedDate = formatAlgerianDate(date);
//   const formattedTime = formatAlgerianTime(startTime);
//   const appName       = 'MediCare';

//   if (status === 'confirmed') {
//     return {
//       subject: 'Appointment Confirmed',
//       html: `
//         <div style="font-family:sans-serif;max-width:480px;margin:auto">
//           <div style="background:#0ea5e9;padding:24px;border-radius:12px 12px 0 0;text-align:center">
//             <h1 style="color:white;margin:0;font-size:22px">✅ Appointment Confirmed</h1>
//             <p style="color:white;margin-top:6px;font-size:14px">${appName}</p>
//           </div>
//           <div style="background:#f8fafc;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0">
//             <p style="color:#374151">Hello <strong>${patientName}</strong>,</p>
//             <p style="color:#374151">Your appointment has been <strong style="color:#16a34a">confirmed</strong>.</p>
//             <div style="background:white;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin:16px 0">
//               <p style="margin:4px 0;color:#6b7280;font-size:13px">Doctor</p>
//               <p style="margin:4px 0;color:#111827;font-weight:600">Dr. ${doctorName}</p>
//               <p style="margin:12px 0 4px 0;color:#6b7280;font-size:13px">Date</p>
//               <p style="margin:4px 0;color:#111827;font-weight:600">${formattedDate}</p>
//               <p style="margin:12px 0 4px 0;color:#6b7280;font-size:13px">Time</p>
//               <p style="margin:4px 0;color:#111827;font-weight:600">${formattedTime}</p>
//             </div>
//             <div style="text-align:center">
//               <a href="${process.env.NEXT_PUBLIC_APP_URL}/patient/appointments"
//                  style="display:inline-block;padding:12px 24px;background:#0ea5e9;
//                         color:white;border-radius:8px;text-decoration:none;font-weight:600">
//                 View My Appointments
//               </a>
//             </div>
//             <p style="color:#9ca3af;font-size:12px;margin-top:24px;text-align:center">
//               ${appName} — Your Trusted Medical Appointment Platform
//             </p>
//           </div>
//         </div>
//       `,
//     };
//   }

//   return {
//     subject: 'Appointment Cancelled',
//     html: `
//       <div style="font-family:sans-serif;max-width:480px;margin:auto">
//         <div style="background:#ef4444;padding:24px;border-radius:12px 12px 0 0;text-align:center">
//           <h1 style="color:white;margin:0;font-size:22px">❌ Appointment Cancelled</h1>
//           <p style="color:white;margin-top:6px;font-size:14px">${appName}</p>
//         </div>
//         <div style="background:#f8fafc;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0">
//           <p style="color:#374151">Hello <strong>${patientName}</strong>,</p>
//           <p style="color:#374151">
//             Your appointment with <strong>Dr. ${doctorName}</strong><br/>
//             on <strong>${formattedDate}</strong> at <strong>${formattedTime}</strong><br/>
//             has been <strong style="color:#dc2626">cancelled</strong>.
//           </p>
//           <div style="text-align:center;margin-top:16px">
//             <a href="${process.env.NEXT_PUBLIC_APP_URL}/patient/doctors"
//                style="display:inline-block;padding:12px 24px;background:#0ea5e9;
//                       color:white;border-radius:8px;text-decoration:none;font-weight:600">
//               Book a New Appointment
//             </a>
//           </div>
//           <p style="color:#9ca3af;font-size:12px;margin-top:24px;text-align:center">
//             ${appName} — Your Trusted Medical Appointment Platform
//           </p>
//         </div>
//       </div>
//     `,
//   };
// }

// // ─── Route handler ────────────────────────────────────────────────────────────

// export async function POST(req: NextRequest): Promise<NextResponse> {
//   try {
//     const body = (await req.json()) as NotifyAppointmentBody;
//     const { patientEmail, patientName, patientUserId, doctorName, status, date, startTime } = body;

//     // ── 1. Send email — failure returns 500 ────────────────────────────────

//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.GMAIL_USER,
//         pass: process.env.GMAIL_APP_PASSWORD,
//       },
//     });

//     const { subject, html } = buildEmail(patientName, doctorName, date, startTime, status);

//     await transporter.sendMail({
//       from:    process.env.GMAIL_USER,
//       to:      patientEmail,
//       subject,
//       html,
//     });

//     // ── 2. Create in-app notification — failure is silent ──────────────────

//     try {
//       // await notificationService.createNotification(
//       //   patientUserId,
//       //   status === 'confirmed' ? 'Appointment confirmed' : 'Appointment cancelled',
//       //   status === 'confirmed'
//       //     ? `Your appointment with Dr. ${doctorName} on ${formatAlgerianDate(date)} at ${formatAlgerianTime(startTime)} is confirmed.`
//       //     : `Your appointment with Dr. ${doctorName} on ${formatAlgerianDate(date)} at ${formatAlgerianTime(startTime)} was cancelled.`,
//       //   status === 'confirmed' ? 'appointment_confirmed' : 'appointment_cancelled',
//       //   '/patient/appointments'
//       // );
//       console.log('✅ In-app notification created for userId:', patientUserId);
//     } catch (notifError) {
//       // Never breaks the email response
//       console.error('❌ In-app notification failed (non-blocking):', notifError);
//     }

//     return NextResponse.json({ ok: true });

//   } catch (error) {
//     console.error('notify-appointment failed:', error);
//     return NextResponse.json(
//       { ok: false, error: 'Failed to send appointment notification' },
//       { status: 500 }
//     );
//   }
// }
// src/app/api/notify-appointment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const ENDPOINT       = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const PROJECT        = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const DATABASE       = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const API_KEY        = process.env.APPWRITE_API_KEY!;
const NOTIFS_COL     = process.env.NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID!;

// ─── Appwrite REST headers ────────────────────────────────────────────────────

function appwriteHeaders(): Record<string, string> {
  return {
    'Content-Type':       'application/json',
    'X-Appwrite-Project': PROJECT,
    'X-Appwrite-Key':     API_KEY,
  };
}

// ─── Create notification via REST (not browser SDK) ───────────────────────────

async function createNotification(data: {
  userId:    string;
  title:     string;
  message:   string;
  type:      string;
  read:      boolean;
  link:      string;
  createdAt: string;
}): Promise<void> {
  const url = `${ENDPOINT}/databases/${DATABASE}/collections/${NOTIFS_COL}/documents`;

  const res = await fetch(url, {
    method:  'POST',
    headers: appwriteHeaders(),
    body:    JSON.stringify({
      documentId: 'unique()',
      data,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`createNotification failed: ${text}`);
  }
}

// ─── Date formatters ──────────────────────────────────────────────────────────

function formatAlgerianDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-DZ', {
    timeZone: 'Africa/Algiers',
    weekday:  'long',
    year:     'numeric',
    month:    'long',
    day:      'numeric',
  });
}

function formatAlgerianTime(timeStr: string): string {
  const [h, m] = timeStr.split(':');
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
}

// ─── Email transporter ────────────────────────────────────────────────────────

function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

// ─── Route handler ────────────────────────────────────────────────────────────

interface NotifyBody {
  patientEmail:  string;
  patientName:   string;
  patientUserId: string;
  doctorName:    string;
  status:        'confirmed' | 'cancelled';
  date:          string;
  startTime:     string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  console.log('[notify-appointment] API CALLED');

  try {
    const body = (await req.json()) as NotifyBody;
    const {
      patientEmail,
      patientName,
      patientUserId,
      doctorName,
      status,
      date,
      startTime,
    } = body;

    const formattedDate = formatAlgerianDate(date);
    const formattedTime = formatAlgerianTime(startTime);

    // ── Step 1: Send email (blocking — if this fails, return 500) ────────────

    const transporter = createTransporter();

    const isConfirmed = status === 'confirmed';

    await transporter.sendMail({
      from:    `"My Appointments" <${process.env.GMAIL_USER}>`,
      to:      patientEmail,
      subject: isConfirmed
        ? `✅ Appointment Confirmed — Dr. ${doctorName}`
        : `❌ Appointment Cancelled — Dr. ${doctorName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: ${isConfirmed ? '#16a34a' : '#dc2626'}">
            ${isConfirmed ? 'Appointment Confirmed' : 'Appointment Cancelled'}
          </h2>
          <p>Hello <strong>${patientName}</strong>,</p>
          <p>
            Your appointment with <strong>Dr. ${doctorName}</strong>
            on <strong>${formattedDate}</strong> at <strong>${formattedTime}</strong>
            has been <strong>${isConfirmed ? 'confirmed' : 'cancelled'}</strong>.
          </p>
          ${!isConfirmed ? '<p>Please contact the clinic to reschedule.</p>' : ''}
          <hr/>
          <p style="color: #6b7280; font-size: 12px;">My Appointments Platform</p>
        </div>
      `,
    });

    console.log('[notify-appointment] email sent to:', patientEmail);

    // ── Step 2: Create in-app notification via REST (non-blocking) ────────────

    try {
      const title = isConfirmed ? 'Appointment confirmed' : 'Appointment cancelled';
      const message = `Your appointment with Dr. ${doctorName} on ${formattedDate} at ${formattedTime} is ${isConfirmed ? 'confirmed' : 'cancelled'}.`;

      await createNotification({
        userId:    patientUserId,
        title,
        message,
        type:      isConfirmed ? 'appointment_confirmed' : 'appointment_cancelled',
        read:      false,
        link:      '/patient/appointments',
        createdAt: new Date().toISOString(),
      });

      console.log('✅ In-app notification created for userId:', patientUserId);
    } catch (notifError) {
      // Non-blocking — email already sent, log and continue
      console.error('❌ In-app notification failed (non-blocking):', notifError);
    }

    return NextResponse.json({ ok: true });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[notify-appointment] error:', message);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}