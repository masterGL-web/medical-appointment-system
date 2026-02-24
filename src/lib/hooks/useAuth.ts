/// Custom hook to manage authentication state and user roles (patient/doctor)
//src/lib/hooks/useAuth.ts
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
  user: Models.User<Models.Preferences> | null;
  patient: Patient | null;
  doctor: Doctor | null;
  role: UserRole;
  loading: boolean;
  error: string | null;
}

export function useAuth(expectedRole?: UserRole) {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    patient: null,
    doctor: null,
    role: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await account.get();
      
      // Try to fetch patient profile
      const patient = await patientService.getPatientByUserId(user.$id).catch(() => null);
      
      // Try to fetch doctor profile
      const doctor = await doctorService.getDoctorByUserId(user.$id).catch(() => null);
      
      // Determine role
      let role: UserRole = null;
      if (patient) role = 'patient';
      else if (doctor) role = 'doctor';
      
      // If no profile found
      if (!role) {
        throw new Error('User profile not found');
      }
      
      // If expected role doesn't match
      if (expectedRole && role !== expectedRole) {
        throw new Error(`Access denied. Expected ${expectedRole} but found ${role}`);
      }

      setAuthState({
        user,
        patient,
        doctor,
        role,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Auth check failed:', error);
      
      setAuthState({
        user: null,
        patient: null,
        doctor: null,
        role: null,
        loading: false,
        error: error.message || 'Authentication failed',
      });

    }
  };

  const logout = async () => {
    try {
      await account.deleteSession('current');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/');
    }
  };

  return {
    ...authState,
    logout,
    refetch: checkAuth,
  };
}