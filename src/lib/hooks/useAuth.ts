// // src/lib/hooks/useAuth.ts
// // Updated: activation guard + ban guard for patients.

// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { account } from '@/lib/appwrite';
// import { patientService } from '@/services/patient.service';
// import { doctorService } from '@/services/doctor.service';
// import { noShowService } from '@/services/noshow.service';
// import { Patient } from '@/types/patient.types';
// import { Doctor } from '@/types/doctor.types';
// import type { Models } from 'appwrite';

// type UserRole = 'patient' | 'doctor' | null;

// interface AuthState {
//   user:    Models.User<Models.Preferences> | null;
//   patient: Patient | null;
//   doctor:  Doctor  | null;
//   role:    UserRole;
//   loading: boolean;
//   error:   string | null;
// }

// export function useAuth(expectedRole?: UserRole) {
//   const router = useRouter();
//   const [authState, setAuthState] = useState<AuthState>({
//     user:    null,
//     patient: null,
//     doctor:  null,
//     role:    null,
//     loading: true,
//     error:   null,
//   });

//   useEffect(() => {
//     checkAuth();
//   }, []);  // eslint-disable-line react-hooks/exhaustive-deps

//   const checkAuth = async () => {
//     try {
//       const user = await account.get();

//       const patient = await patientService.getPatientByUserId(user.$id).catch(() => null);
//       const doctor  = await doctorService.getDoctorByUserId(user.$id).catch(() => null);

//       let role: UserRole = null;
//       if (patient) role = 'patient';
//       else if (doctor) role = 'doctor';

//       if (!role) throw new Error('User profile not found');

//       // ── Guard 1: Activation check ─────────────────────────────────────────
//       const profile = role === 'patient' ? patient : doctor;
//       if (profile && 'isActivated' in profile && !profile.isActivated) {
//         await account.deleteSession('current').catch(() => null);
//         router.replace('/please-activate');
//         return;
//       }

//       // ── Guard 2: Ban check (patients only) ────────────────────────────────
//       if (role === 'patient' && patient) {
//         const banResult = await noShowService.checkIfBanned(patient.$id).catch(() => null);
//         if (banResult?.banned) {
//           await account.deleteSession('current').catch(() => null);
//           router.replace('/banned');
//           return;
//         }
//       }
//       // ──────────────────────────────────────────────────────────────────────

//       if (expectedRole && role !== expectedRole) {
//         throw new Error(`Access denied. Expected ${expectedRole}, found ${role}`);
//       }

//       setAuthState({ user, patient, doctor, role, loading: false, error: null });

//     } catch (error: unknown) {
//       const message = error instanceof Error ? error.message : 'Authentication failed';
//       setAuthState({
//         user: null, patient: null, doctor: null,
//         role: null, loading: false, error: message,
//       });
//     }
//   };

//   const logout = async () => {
//     await account.deleteSession('current').catch(() => null);
//     router.push('/');
//   };

//   return { ...authState, logout, refetch: checkAuth };
// }
// src/lib/hooks/useAuth.ts
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { account } from '@/lib/appwrite';
import { patientService } from '@/services/patient.service';
import { doctorService } from '@/services/doctor.service';
import { noShowService } from '@/services/noshow.service';
import { Patient } from '@/types/patient.types';
import { Doctor } from '@/types/doctor.types';
import type { Models } from 'appwrite';

type UserRole = 'patient' | 'doctor' | null;

interface AuthState {
  user:    Models.User<Models.Preferences> | null;
  patient: Patient | null;
  doctor:  Doctor  | null;
  role:    UserRole;
  loading: boolean;
  error:   string | null;
}

export function useAuth(expectedRole?: UserRole) {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    user:    null,
    patient: null,
    doctor:  null,
    role:    null,
    loading: true,
    error:   null,
  });

  useEffect(() => {
    checkAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const checkAuth = async () => {
    try {
      const user = await account.get();

      const patient = await patientService.getPatientByUserId(user.$id).catch(() => null);
      const doctor  = await doctorService.getDoctorByUserId(user.$id).catch(() => null);

      let role: UserRole = null;
      if (patient) role = 'patient';
      else if (doctor) role = 'doctor';

      if (!role) throw new Error('User profile not found');

      // ── Guard 1: Activation check ─────────────────────────────────────────
      const profile = role === 'patient' ? patient : doctor;
      if (profile && 'isActivated' in profile && !profile.isActivated) {
        await account.deleteSession('current').catch(() => null);
        router.replace('/please-activate');
        return;
      }

      // ── Guard 2: Ban check (patients only) ────────────────────────────────
      // DO NOT delete session here — /banned page needs account.get() to work
      // so it can read the ban reason and display it to the patient.
      // Session is deleted only when the patient clicks "Log out" on /banned.
      if (role === 'patient' && patient) {
        const banResult = await noShowService.checkIfBanned(patient.$id).catch(() => null);
        if (banResult?.banned) {
          router.replace('/banned'); // ← session kept alive on purpose
          return;
        }
      }
      // ─────────────────────────────────────────────────────────────────────

      if (expectedRole && role !== expectedRole) {
        throw new Error(`Access denied. Expected ${expectedRole}, found ${role}`);
      }

      setAuthState({ user, patient, doctor, role, loading: false, error: null });

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Authentication failed';
      setAuthState({
        user: null, patient: null, doctor: null,
        role: null, loading: false, error: message,
      });
    }
  };

  const logout = async () => {
    await account.deleteSession('current').catch(() => null);
    router.push('/');
  };

  return { ...authState, logout, refetch: checkAuth };
}