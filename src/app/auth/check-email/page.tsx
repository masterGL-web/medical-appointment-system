'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Info, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-50/50 via-white to-white px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full mx-auto rounded-3xl bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 p-8 md:p-10"
      >
        {/* Animated envelope icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
          className="mx-auto mb-6 h-20 w-20 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-500/30 flex items-center justify-center"
        >
          <Mail className="h-10 w-10 text-white" />
        </motion.div>

        {/* Ping dot indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex items-center justify-center gap-2 mb-4"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500" />
          </span>
          <span className="text-sm font-medium text-teal-600">Code sent successfully</span>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <h1 className="text-2xl font-bold text-slate-900 text-center">Check Your Email</h1>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="text-sm text-slate-600 text-center mt-2"
        >
          We sent a 6-digit activation code to your email address.
        </motion.p>

        {/* Expiry info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="text-sm text-slate-500 text-center mt-1"
        >
          The code expires in <span className="font-semibold text-slate-900">24 hours</span>
        </motion.p>

        {/* Info card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="rounded-xl bg-teal-50 border border-teal-100 p-4 mt-6 flex items-start gap-3"
        >
          <Info className="h-4 w-4 text-teal-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-teal-700">Didn&apos;t receive the email? Check your spam or junk folder.</p>
        </motion.div>

        {/* Enter My Code button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="mt-6"
        >
          <Link href="/auth/verify">
            <Button className="w-full gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg shadow-teal-500/30 text-base h-12 rounded-xl">
              Enter My Code <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>

        {/* Below button links */}
        <div className="mt-4 space-y-2 text-center">
          <p>
            <Link href="/auth/register" className="text-sm text-slate-500 hover:text-teal-600 transition-colors">
              Need to register again?
            </Link>
          </p>
          <p className="text-sm text-slate-500">
            Already activated?{' '}
            <Link href="/auth/login" className="text-teal-600 font-medium hover:text-teal-700 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}