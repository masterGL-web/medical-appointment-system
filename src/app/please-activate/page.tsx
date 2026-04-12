// src/app/please-activate/page.tsx
// Shown when an authenticated but unactivated user tries to access the app.

import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function PleaseActivatePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center">
            <ShieldAlert className="h-10 w-10 text-amber-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Account Not Activated</h1>
          <p className="text-gray-600 leading-relaxed">
            Your account has not been activated yet. Please check your email
            for the activation link we sent during registration.
          </p>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-left space-y-1">
          <p className="text-sm font-medium text-blue-900">What to do:</p>
          <ol className="text-sm text-blue-800 list-decimal list-inside space-y-1">
            <li>Open the email from MediCare</li>
            <li>Click the "Activate My Account" button</li>
            <li>Return here and sign in</li>
          </ol>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/auth/login"
            className="inline-block w-full py-3 px-6 bg-gray-900 hover:bg-gray-800
                       text-white font-semibold rounded-lg transition-colors duration-200"
          >
            Back to Login
          </Link>
          <Link
            href="/auth/register"
            className="text-sm text-gray-500 hover:underline"
          >
            Register a new account
          </Link>
        </div>
      </div>
    </div>
  );
}