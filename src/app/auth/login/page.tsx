// // src/app/auth/login/page.tsx
// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { account } from '@/lib/appwrite';
// import { patientService } from '@/services/patient.service';
// import { doctorService } from '@/services/doctor.service';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';

// export default function LoginPage() {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   // const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//   //   e.preventDefault();
//   //   setLoading(true);
//   //   setError('');

//   //   const formData = new FormData(e.currentTarget);
//   //   const email = formData.get('email') as string;
//   //   const password = formData.get('password') as string;

//   //   try {
//   //     // 1. Create session
//   //     await account.createEmailPasswordSession(email, password);

//   //     // 2. Get current user
//   //     const user = await account.get();

//   //     let patient = null;
//   //     let doctor = null;

//   //     // 3. Try patient
//   //     try {
//   //       patient = await patientService.getPatientByUserId(user.$id);
//   //     } catch { }

//   //     // 4. Try doctor
//   //     try {
//   //       doctor = await doctorService.getDoctorByUserId(user.$id);
//   //     } catch { }

//   //     // 5. Redirect based on role
//   //     if (patient) {
//   //       router.push('/patient/dashboard');
//   //       return;
//   //     }

//   //     if (doctor) {
//   //       router.push('/doctor/dashboard');
//   //       return;
//   //     }

//   //     // 6. No profile found
//   //     setError('No profile found for this account');
//   //     await account.deleteSession('current');

//   //   } catch (err: any) {
//   //     console.error('Login error:', err);
//   //     setError(err.message || 'Invalid email or password');
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//   e.preventDefault();
//   setLoading(true);
//   setError('');

//   const formData = new FormData(e.currentTarget);
//   const email = formData.get('email') as string;
//   const password = formData.get('password') as string;

//   try {
//     // Check if session exists
//     try {
//       await account.get();
//       await account.deleteSession('current');
//     } catch {
//       // No session exists → ignore
//     }


//     // Login
//     await account.createEmailPasswordSession(email, password);

//     // Get user
//     const user = await account.get();

//     // Check patient
//     const patient = await patientService.getPatientByUserId(user.$id);
//     if (patient) {
//       router.push('/patient/dashboard');
//       return;
//     }

//     // Check doctor
//     const doctor = await doctorService.getDoctorByUserId(user.$id);
//     if (doctor) {
//       router.push('/doctor/dashboard');
//       return;
//     }

//     setError('User profile not found');
//   } catch (err: any) {
//     console.error('Login error:', err);
//     setError(err.message || 'Invalid email or password');
//   } finally {
//     setLoading(false);
//   }
// };
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
//       <Card className="w-full max-w-md">
//         <CardHeader>
//           <CardTitle>Welcome Back</CardTitle>
//           <CardDescription>Sign in to your account</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <Input
//                 id="email"
//                 name="email"
//                 type="email"
//                 placeholder="your.email@example.com"
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="password">Password</Label>
//               <Input id="password" name="password" type="password" required />
//             </div>

//             {error && (
//               <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
//                 {error}
//               </div>
//             )}

//             <Button type="submit" className="w-full" disabled={loading}>
//               {loading ? 'Signing in...' : 'Sign In'}
//             </Button>

//             <p className="text-sm text-center text-gray-600">
//               Don't have an account?{' '}
//               <a href="/register" className="text-blue-600 hover:underline">
//                 Register here
//               </a>
//             </p>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
// src/app/auth/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { account } from '@/lib/appwrite';
import { patientService } from '@/services/patient.service';
import { doctorService } from '@/services/doctor.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email    = formData.get('email')    as string;
    const password = formData.get('password') as string;

    try {
      // Clear any existing session first
      try {
        await account.get();
        await account.deleteSession('current');
      } catch {
        // No session → ignore
      }

      // Create new session
      await account.createEmailPasswordSession(email, password);

      // Get user with labels
      const user = await account.get();

      // ── Admin check (label-based) ─────────────────────────────────────────
      if (Array.isArray(user.labels) && user.labels.includes('admin')) {
        router.push('/admin/dashboard');
        return;
      }

      // ── Patient check ─────────────────────────────────────────────────────
      const patient = await patientService.getPatientByUserId(user.$id);
      if (patient) {
        router.push('/patient/dashboard');
        return;
      }

      // ── Doctor check ──────────────────────────────────────────────────────
      const doctor = await doctorService.getDoctorByUserId(user.$id);
      if (doctor) {
        router.push('/doctor/dashboard');
        return;
      }

      // No profile found
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>

            <p className="text-sm text-center text-gray-600">
              Don&apos;t have an account?{' '}
              <a href="/auth/register" className="text-blue-600 hover:underline">
                Register here
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}