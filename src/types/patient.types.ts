// src/types/patient.types.ts
import type { Models } from 'appwrite';

export type BanStatus = 'none' | 'temporary' | 'permanent';

export type PatientDocument = Models.Document & {
  userId:          string;
  firstName:       string;
  lastName:        string;
  email:           string;
  phone?:          string;
  dateOfBirth:     string;
  gender:          'male' | 'female' | 'other';
  medicalHistory?: string;
  address?:        string;
  city?:           string;
  isActivated:     boolean;
  noShowCount:     number;
  banStatus:       BanStatus;
  banUntil:        string | null;
  banReason:       string | null;
};

export interface Patient {
  $id:             string;
  userId:          string;
  firstName:       string;
  lastName:        string;
  email:           string;
  phone?:          string;
  dateOfBirth:     string;
  gender:          'male' | 'female' | 'other';
  medicalHistory?: string;
  address?:        string;
  city?:           string;
  isActivated:     boolean;
  noShowCount:     number;
  banStatus:       BanStatus;
  banUntil:        string | null;
  banReason:       string | null;
  $createdAt:      string;
  $updatedAt:      string;
}

export interface CreatePatientDTO {
  userId:          string;
  firstName:       string;
  lastName:        string;
  email:           string;
  phone?:          string;
  dateOfBirth:     string;
  gender:          'male' | 'female' | 'other';
  medicalHistory?: string;
  address?:        string;
  city?:           string;
  isActivated:     boolean;
}

export interface UpdatePatientDTO {
  firstName?:      string;
  lastName?:       string;
  phone?:          string;
  dateOfBirth?:    string;
  gender?:         'male' | 'female' | 'other';
  medicalHistory?: string;
  address?:        string;
  city?:           string;
}

// ── Ban DTOs ──────────────────────────────────────────────────────────────────

export interface ApplyBanDTO {
  patientId: string;
  banStatus: 'temporary' | 'permanent';
  banUntil:  string | null;
  banReason: string;
}

export interface NoShowResult {
  noShowCount: number;
  banApplied:  boolean;
  banStatus:   BanStatus;
}

export interface BanCheckResult {
  banned:    boolean;
  banStatus: BanStatus;
  banUntil:  string | null;
  banReason: string | null;
}