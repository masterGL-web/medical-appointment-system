// src/types/activation.types.ts
import type { Models } from 'appwrite';

// ─── Enums ────────────────────────────────────────────────────────────────────

export type ActivationRole   = 'patient' | 'doctor';
export type ActivationStatus = 'pending' | 'used' | 'expired';

// ─── Appwrite document shape (raw from DB) ────────────────────────────────────

export type ActivationDocument = Models.Document & {
  code:      string;           // 32-char hex
  email:     string;
  role:      ActivationRole;
  userId:    string;           // Appwrite Auth user $id
  profileId: string;           // patients.$id or doctors.$id
  expiresAt: string;           // ISO-8601
  usedAt:    string | null;
  status:    ActivationStatus;
};

// ─── Domain model (after mapping) ────────────────────────────────────────────

export interface Activation {
  $id:       string;
  code:      string;
  email:     string;
  role:      ActivationRole;
  userId:    string;
  profileId: string;
  expiresAt: string;
  usedAt:    string | null;
  status:    ActivationStatus;
  $createdAt: string;
  $updatedAt: string;
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface CreateActivationDTO {
  code:      string;
  email:     string;
  role:      ActivationRole;
  userId:    string;
  profileId: string;
  expiresAt: string;
}

// ─── Result types (no exceptions for control flow) ───────────────────────────

export type ValidationResult =
  | { valid: true;  activation: Activation }
  | { valid: false; reason: 'not_found' | 'already_used' | 'expired' };