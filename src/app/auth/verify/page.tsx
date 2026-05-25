'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { activationService } from '@/services/activation.service';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Stethoscope,
  Mail,
  Shield,
  Clock,
  CheckCircle,
  KeyRound,
  Info,
  ArrowRight,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function VerifyPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await activationService.verifyAndActivate(email, code);

      if (result) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      } else {
        setError('Invalid or expired code. Please try again.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Verification failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const leftFeatures = [
    { icon: Mail, text: 'Check your inbox' },
    { icon: Shield, text: 'Secure verification' },
    { icon: Clock, text: 'Code expires in 24 hours' },
  ];

  if (success) {
    return (
      <div className="min-h-screen flex">
        {/* Left panel (hidden on mobile) */}
        <div className="hidden lg:flex lg:w-[40%] relative bg-gradient-to-br from-teal-500 to-teal-600 overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, #ffffff 1px, transparent 0)`, backgroundSize: '40px 40px' }} />
          <div className="relative z-10 flex flex-col justify-center items-center p-12 xl:p-16 w-full">
            <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, type: 'spring' }} className="text-center space-y-6">
              <div className="h-20 w-20 rounded-2xl bg-white/20 flex items-center justify-center mx-auto shadow-lg shadow-teal-500/20">
                <Check className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white">Account Activated!</h1>
              <p className="text-lg text-teal-100">Redirecting to login…</p>
            </motion.div>
          </div>
        </div>
        {/* Right: success message */}
        <div className="w-full lg:w-[60%] flex items-center justify-center bg-white px-6 py-12 sm:px-12">
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md text-center space-y-6">
            <div className="lg:hidden flex items-center gap-2.5 justify-center mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-500/20"><Stethoscope className="h-5 w-5 text-white" /></div>
              <span className="text-xl font-bold tracking-tight text-slate-900">MediCare</span>
            </div>
            <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.3, type: 'spring' }}>
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/30 flex items-center justify-center mx-auto mb-6">
                <Check className="h-8 w-8 text-white" />
              </div>
            </motion.div>
            <h2 className="text-2xl font-bold text-slate-900">Account Activated!</h2>
            <p className="text-sm text-slate-600">Your account has been verified successfully. Redirecting to login…</p>
            <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors">
              Go to Sign In <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* ── LEFT: Decorative panel (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-[40%] relative bg-gradient-to-br from-teal-500 to-teal-600 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, #ffffff 1px, transparent 0)`, backgroundSize: '40px 40px' }} />
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          <div className="space-y-8">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <Link href="/" className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 shadow-lg shadow-teal-500/20"><Stethoscope className="h-5 w-5 text-white" /></div>
                <span className="text-xl font-bold tracking-tight text-white">MediCare</span>
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-white xl:text-5xl leading-tight">Almost There!</h1>
              <p className="text-lg text-teal-100 leading-relaxed max-w-md">Just one step away from your health dashboard</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="space-y-4">
              {leftFeatures.map((f, i) => (
                <motion.div key={f.text} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 flex-shrink-0"><f.icon className="h-5 w-5 text-white" /></div>
                  <p className="text-sm font-medium text-white">{f.text}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="relative">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} className="rounded-2xl bg-white/20 backdrop-blur-sm p-4 max-w-xs border border-white/10">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0"><CheckCircle className="h-6 w-6 text-white" /></div>
                <div><p className="text-lg font-bold text-white">Verify to unlock</p><p className="text-xs text-teal-200">all features</p></div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ── RIGHT: Verify form ── */}
      <div className="w-full lg:w-[60%] flex items-center justify-center bg-white px-6 py-12 sm:px-12">
        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="w-full max-w-md space-y-8">
          {/* Logo for mobile */}
          <div className="lg:hidden flex items-center gap-2.5 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-500/20"><Stethoscope className="h-5 w-5 text-white" /></div>
            <span className="text-xl font-bold tracking-tight text-slate-900">MediCare</span>
          </div>

          {/* Top icon */}
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.3, type: 'spring' }}>
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-500/30 flex items-center justify-center mx-auto mb-6">
              <Mail className="h-8 w-8 text-white" />
            </div>
          </motion.div>

          {/* Header */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900">Verify Your Account</h2>
            <p className="text-sm text-slate-600 max-w-sm mx-auto mt-2">Enter your email and the 6-digit code we sent you</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Mail className="h-4 w-4 text-teal-600" /> Email Address
              </label>
              <div className="relative">
                <Input id="email" type="email" placeholder="your.email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10 h-12 border-slate-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl" />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* 6-Digit Code */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-teal-600" /> 6-Digit Code
              </label>
              <div className="relative">
                <Input id="code" type="text" placeholder="000000" maxLength={6} pattern="[0-9]{6}" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} required className="pl-10 h-12 border-slate-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl" />
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <Info className="h-3 w-3 text-slate-400" /> Check your email for the code
              </p>
            </div>

            {/* Info card */}
            <div className="rounded-xl bg-teal-50 border border-teal-100 p-3 flex items-start gap-3">
              <Info className="h-4 w-4 text-teal-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-teal-700">Didn&apos;t receive the code? Check your spam folder or wait a few minutes.</p>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-200">{error}</div>
            )}

            {/* Activate button */}
            <Button type="submit" disabled={loading} className="w-full gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg shadow-teal-500/30 text-base h-12 rounded-xl">
              {loading ? 'Verifying…' : 'Activate Account'} {!loading && <ArrowRight className="h-4 w-4" />}
            </Button>

            {/* Links */}
            <div className="text-center text-sm space-y-2 mt-4">
              <p><Link href="/auth/register" className="text-teal-600 hover:text-teal-700 font-medium transition-colors">Need to register again?</Link></p>
              <p><Link href="/auth/login" className="text-teal-600 hover:text-teal-700 font-medium transition-colors">Already activated? Sign in</Link></p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
