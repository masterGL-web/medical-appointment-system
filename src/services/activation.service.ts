// src/services/activation.service.ts
// Server-only — all DB writes use the Appwrite SDK.

import { databases, ID } from '@/lib/appwrite';
import { Query } from 'appwrite';
import {
  Activation,
  ActivationDocument,
  ActivationRole,
  CreateActivationDTO,
  ValidationResult,
} from '@/types/activation.types';

const DATABASE_ID              = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const ACTIVATIONS_COLLECTION   = process.env.NEXT_PUBLIC_APPWRITE_ACTIVATIONS_COLLECTION_ID!;
const PATIENTS_COLLECTION      = process.env.NEXT_PUBLIC_APPWRITE_PATIENTS_COLLECTION_ID!;
const DOCTORS_COLLECTION       = process.env.NEXT_PUBLIC_APPWRITE_DOCTORS_COLLECTION_ID!;

// ─── Mapper ───────────────────────────────────────────────────────────────────

function mapActivation(doc: ActivationDocument): Activation {
  return {
    $id:        doc.$id,
    code:       doc.code,
    email:      doc.email,
    role:       doc.role,
    userId:     doc.userId,
    profileId:  doc.profileId,
    expiresAt:  doc.expiresAt,
    usedAt:     doc.usedAt,
    status:     doc.status,
    $createdAt: doc.$createdAt,
    $updatedAt: doc.$updatedAt,
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

class ActivationService {

  /** Persist a new activation record with status = "pending". */
  async createActivation(data: CreateActivationDTO): Promise<Activation> {
    const doc = await databases.createDocument<ActivationDocument>(
      DATABASE_ID,
      ACTIVATIONS_COLLECTION,
      ID.unique(),
      {
        code:      data.code,
        email:     data.email,
        role:      data.role,
        userId:    data.userId,
        profileId: data.profileId,
        expiresAt: data.expiresAt,
        usedAt:    null,
        status:    'pending',
      }
    );
    return mapActivation(doc);
  }

  /** Fetch a single activation record by its code. Returns null if not found. */
  async getByCode(code: string): Promise<Activation | null> {
    const res = await databases.listDocuments<ActivationDocument>(
      DATABASE_ID,
      ACTIVATIONS_COLLECTION,
      [Query.equal('code', code), Query.limit(1)]
    );
    return res.documents.length > 0 ? mapActivation(res.documents[0]) : null;
  }

  /**
   * Validate a code without side effects.
   * Returns a typed result — never throws for expected failure states.
   */
  async validateCode(code: string): Promise<ValidationResult> {
    const activation = await this.getByCode(code);

    if (!activation) {
      return { valid: false, reason: 'not_found' };
    }

    if (activation.status === 'used') {
      return { valid: false, reason: 'already_used' };
    }

    // Treat both explicit "expired" status and past expiry date as expired
    if (
      activation.status === 'expired' ||
      new Date(activation.expiresAt) < new Date()
    ) {
      // Lazily update status to "expired" in DB if not already set
      if (activation.status !== 'expired') {
        await databases.updateDocument(
          DATABASE_ID,
          ACTIVATIONS_COLLECTION,
          activation.$id,
          { status: 'expired' }
        );
      }
      return { valid: false, reason: 'expired' };
    }

    return { valid: true, activation };
  }

  /** Mark activation as used and activate the user's profile in one operation. */
  async consumeCode(activation: Activation): Promise<void> {
    const now = new Date().toISOString();

    // 1. Mark activation record as used
    await databases.updateDocument(
      DATABASE_ID,
      ACTIVATIONS_COLLECTION,
      activation.$id,
      { status: 'used', usedAt: now }
    );

    // 2. Set isActivated = true on the profile document
    await this.activateProfile(activation.profileId, activation.role);
  }

  /** Flip isActivated on the correct collection. */
  private async activateProfile(
    profileId: string,
    role:      ActivationRole
  ): Promise<void> {
    const collectionId =
      role === 'patient' ? PATIENTS_COLLECTION : DOCTORS_COLLECTION;

    await databases.updateDocument(
      DATABASE_ID,
      collectionId,
      profileId,
      { isActivated: true }
    );
  }

  /**
   * Convenience method: validate then consume in one call.
   * Returns the same ValidationResult so the caller can branch on failure.
   */
  async validateAndActivate(code: string): Promise<ValidationResult> {
    const result = await this.validateCode(code);
    if (!result.valid) return result;

    await this.consumeCode(result.activation);
    return result;
  }

  /**
   * Verify activation code by email and code, then activate the user profile.
   * Returns true on success, false on any failure (invalid, expired, or error).
   */
async verifyAndActivate(email: string, code: string): Promise<boolean> {
  try {
    const res = await databases.listDocuments<ActivationDocument>(
      DATABASE_ID,
      ACTIVATIONS_COLLECTION,
      [
        Query.equal('email', email),
        Query.equal('code', code),
        Query.equal('status', 'pending'),   // ← was: Query.equal('isUsed', false)
        Query.limit(1),
      ]
    );

    if (res.documents.length === 0) return false;

    const activation = res.documents[0];

    if (new Date(activation.expiresAt) < new Date()) return false;

    // Mark as used
    await databases.updateDocument(
      DATABASE_ID,
      ACTIVATIONS_COLLECTION,
      activation.$id,
      { status: 'used', usedAt: new Date().toISOString() }  // ← was: { isUsed: true }
    );

    // Activate profile
    const collectionId =
      activation.role === 'patient' ? PATIENTS_COLLECTION : DOCTORS_COLLECTION;

    await databases.updateDocument(
      DATABASE_ID,
      collectionId,
      activation.profileId,
      { isActivated: true }
    );

    return true;
  } catch (error: unknown) {
    console.error('verifyAndActivate error:', error);
    return false;
  }
}
}

export const activationService = new ActivationService();