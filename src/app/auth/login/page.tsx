'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Stethoscope,
  Shield,
  Calendar,
  Users,
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { account } from '@/lib/appwrite';
import { patientService } from '@/services/patient.service';
import { doctorService } from '@/services/doctor.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      try {
        await account.get();
        await account.deleteSession('current');
      } catch {
        // No session → ignore
      }

      await account.createEmailPasswordSession(email, password);
      const user = await account.get();

      if (Array.isArray(user.labels) && user.labels.includes('admin')) {
        router.push('/admin/dashboard');
        return;
      }

      const patient = await patientService.getPatientByUserId(user.$id);
      if (patient) {
        router.push('/patient/doctors'); return;
      }

      const doctor = await doctorService.getDoctorByUserId(user.$id);
      if (doctor) {
        router.push('/doctor/dashboard');
        return;
      }

      setError('User profile not found');
      await account.deleteSession('current').catch(() => null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid email or password';
      console.error('Login error:', err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Shield, text: 'Secure & Private' },
    { icon: Calendar, text: 'Easy Scheduling' },
    { icon: Users, text: 'Trusted by 50,000+ patients' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* ── LEFT: Decorative panel (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-[60%] relative bg-gradient-to-br from-teal-500 to-teal-600 overflow-hidden">
        {/* Dot grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #ffffff 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Top: Logo + headline */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Link href="/" className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 shadow-lg shadow-teal-500/20">
                  <Stethoscope className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white">
                  MediCare
                </span>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-4"
            >
              <h1 className="text-4xl font-bold tracking-tight text-white xl:text-5xl leading-tight">
                Welcome Back
              </h1>
              <p className="text-lg text-teal-100 leading-relaxed max-w-md">
                Sign in to access your health dashboard
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              {features.map((f, i) => (
                <motion.div
                  key={f.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 flex-shrink-0">
                    <f.icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-sm font-medium text-white">{f.text}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Bottom: Floating stat card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="relative"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="rounded-2xl bg-white/20 backdrop-blur-sm p-6 max-w-xs border border-white/10"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">50,000+</p>
                  <p className="text-xs text-teal-200">Trusted Patients</p>
                </div>
                <div className="ml-auto">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ── RIGHT: Login form ── */}
      <div className="w-full lg:w-[40%] flex items-center justify-center bg-white px-6 py-12 sm:px-12">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Logo for mobile */}
          <div className="lg:hidden flex items-center gap-2.5 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-500/20">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              MediCare
            </span>
          </div>

          {/* Header */}
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Sign In
            </h2>
            <p className="mt-2 text-lg text-slate-600">
              Welcome back! Please enter your details
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Mail className="h-4 w-4 text-teal-600" />
                Email
              </label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your.email@example.com"
                  required
                  className="pl-10 h-12 border-slate-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Lock className="h-4 w-4 text-teal-600" />
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  required
                  className="pl-10 pr-10 h-12 border-slate-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-200">
                {error}
              </div>
            )}

            {/* Primary Sign In button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg shadow-teal-500/30 text-base h-12 rounded-xl"
            >
              {loading ? 'Signing in…' : 'Sign In'}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </Button>

            {/* Register link */}
            <p className="text-sm text-center text-slate-600">
              Don&apos;t have an account?{' '}
              <Link
                href="/auth/register"
                className="text-teal-600 hover:text-teal-700 font-medium transition-colors"
              >
                Register here
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}