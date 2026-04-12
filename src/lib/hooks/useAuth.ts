// src/lib/hooks/useAuth.ts
// Updated to block unactivated users and redirect to /please-activate.

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { account } from '@/lib/appwrite';
import { patientService } from '@/services/patient.service';
import { doctorService } from '@/services/doctor.service';
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
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const checkAuth = async () => {
    try {
      const user = await account.get();

      const patient = await patientService.getPatientByUserId(user.$id).catch(() => null);
      const doctor  = await doctorService.getDoctorByUserId(user.$id).catch(() => null);

      let role: UserRole = null;
      if (patient) role = 'patient';
      else if (doctor) role = 'doctor';

      if (!role) throw new Error('User profile not found');

      // ── Activation guard ──────────────────────────────────────────────────
      // Check the isActivated flag on whichever profile was found.
      // Unactivated users are redirected regardless of expected role.
      const profile = role === 'patient' ? patient : doctor;
      if (profile && 'isActivated' in profile && !profile.isActivated) {
        // Sign them out so they cannot retry by refreshing
        await account.deleteSession('current').catch(() => null);
        router.replace('/please-activate');
        return;
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