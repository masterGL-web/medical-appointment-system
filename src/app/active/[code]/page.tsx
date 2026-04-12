// src/app/active/[code]/page.tsx
// Server component — runs on the server, no 'use client' needed.
// Reads the code, validates it, activates the profile, renders result.

import { activationService } from '@/services/activation.service';
import Link from 'next/link';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

interface Props {
  params: { code: string };
}

export default async function ActivationPage({ params }: Props) {
  const { code } = params;

  // ── Run validation + activation in one call ──────────────────────────────
  const result = await activationService.validateAndActivate(code);

  // ── Render success ────────────────────────────────────────────────────────
  if (result.valid) {
    const { activation } = result;
    const roleLabel = activation.role === 'doctor' ? 'Doctor' : 'Patient';
    const dashboardPath =
      activation.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard';

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Account Activated!</h1>
            <p className="text-gray-600">
              Your <strong>{roleLabel}</strong> account has been successfully activated.
              You can now sign in and use MediCare.
            </p>
          </div>

          <Link
            href="/auth/login"
            className="inline-block w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-700
                       text-white font-semibold rounded-lg transition-colors duration-200"
          >
            Sign In
          </Link>

          <Link
            href={dashboardPath}
            className="inline-block text-sm text-emerald-600 hover:underline"
          >
            Go to dashboard →
          </Link>
        </div>
      </div>
    );
  }

  // ── Render failure states ─────────────────────────────────────────────────
  const errorConfig = {
    not_found: {
      icon:    <XCircle className="h-10 w-10 text-red-500" />,
      bg:      'bg-red-100',
      title:   'Invalid Link',
      message: 'This activation link does not exist. Please check your email or register again.',
    },
    already_used: {
      icon:    <CheckCircle2 className="h-10 w-10 text-blue-500" />,
      bg:      'bg-blue-100',
      title:   'Already Activated',
      message: 'This account has already been activated. You can sign in directly.',
    },
    expired: {
      icon:    <Clock className="h-10 w-10 text-amber-500" />,
      bg:      'bg-amber-100',
      title:   'Link Expired',
      message: 'This activation link has expired (links are valid for 24 hours). Please register again to receive a new link.',
    },
  } as const;

  const config = errorConfig[result.reason];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-slate-100 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className={`w-20 h-20 rounded-full ${config.bg} flex items-center justify-center`}>
            {config.icon}
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">{config.title}</h1>
          <p className="text-gray-600">{config.message}</p>
        </div>

        <div className="flex flex-col gap-3">
          {result.reason === 'already_used' && (
            <Link
              href="/auth/login"
              className="inline-block w-full py-3 px-6 bg-gray-900 hover:bg-gray-800
                         text-white font-semibold rounded-lg transition-colors duration-200"
            >
              Sign In
            </Link>
          )}
          {(result.reason === 'not_found' || result.reason === 'expired') && (
            <Link
              href="/auth/register"
              className="inline-block w-full py-3 px-6 bg-gray-900 hover:bg-gray-800
                         text-white font-semibold rounded-lg transition-colors duration-200"
            >
              Register Again
            </Link>
          )}
          <Link
            href="/"
            className="text-sm text-gray-500 hover:underline"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}