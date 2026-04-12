// src/app/auth/check-email/page.tsx
// Static page — no data fetching needed.

import Link from 'next/link';
import { Mail } from 'lucide-react';

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
            <Mail className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Check Your Email</h1>
          <p className="text-gray-600 leading-relaxed">
            We sent a 6-digit activation code to your email address. Enter the code on the verification page to activate your account.
          </p>
          <p className="text-sm text-gray-500">
            The code expires in <strong>24 hours</strong>.
          </p>
        </div>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-left">
          <p className="text-sm text-amber-800">
            <strong>Did not receive the email?</strong> Check your spam or junk folder.
            If it is not there, try registering again.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/auth/verify"
            className="inline-block w-full py-3 px-6 bg-blue-600 hover:bg-blue-700
                       text-white font-semibold rounded-lg transition-colors duration-200"
          >
            Enter My Code
          </Link>
          <Link href="/auth/register" className="text-sm text-gray-500 hover:underline">
            Need to register again?
          </Link>
          <Link href="/auth/login" className="text-sm text-gray-500 hover:underline">
            Already activated? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}