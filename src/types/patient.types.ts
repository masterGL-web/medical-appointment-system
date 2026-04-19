// src/types/patient.types.ts
import type { Models } from 'appwrite';

export type PatientDocument = Models.Document & {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;          // ← ADDED: stored in patients collection
  phone?: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  medicalHistory?: string;
  address?: string;
  city?: string;
  isActivated: boolean;
};

export interface Patient {
  $id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;          // ← ADDED
  phone?: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  medicalHistory?: string;
  address?: string;
  city?: string;
  isActivated: boolean;
  $createdAt: string;
  $updatedAt: string;
}

export interface CreatePatientDTO {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;          // ← ADDED
  phone?: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  medicalHistory?: string;
  address?: string;
  city?: string;
  isActivated: boolean;
}

export interface UpdatePatientDTO {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  medicalHistory?: string;
  address?: string;
  city?: string;
}