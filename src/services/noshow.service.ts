// // src/services/noshow.service.ts
// // This service uses the browser Appwrite SDK — safe for client-side use only.
// // Server-side no-show counting is handled by /api/handle-noshow (REST API).
// import { databases } from '@/lib/appwrite';
// import type {
//   ApplyBanDTO,
//   BanCheckResult,
//   BanStatus,
// } from '@/types/patient.types';

// const DATABASE_ID  = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
// const PATIENTS_COL = process.env.NEXT_PUBLIC_APPWRITE_PATIENTS_COLLECTION_ID!;

// function isBanActive(banUntil: string | null): boolean {
//   if (!banUntil) return false;
//   return new Date(banUntil) > new Date();
// }

// class NoShowService {
//   /**
//    * Check if a patient is currently banned.
//    * Used in useAuth and before booking.
//    */
//   async checkIfBanned(patientId: string): Promise<BanCheckResult> {
//     const doc = await databases.getDocument(DATABASE_ID, PATIENTS_COL, patientId);

//     const banStatus = (doc.banStatus as BanStatus) ?? 'none';
//     const banUntil  = (doc.banUntil  as string | null) ?? null;
//     const banReason = (doc.banReason as string | null) ?? null;

//     if (banStatus === 'permanent') {
//       return { banned: true, banStatus, banUntil, banReason };
//     }

//     if (banStatus === 'temporary' && isBanActive(banUntil)) {
//       return { banned: true, banStatus, banUntil, banReason };
//     }

//     // Expired temporary ban — lift it automatically
//     if (banStatus === 'temporary' && !isBanActive(banUntil)) {
//       await databases.updateDocument(DATABASE_ID, PATIENTS_COL, patientId, {
//         banStatus: 'none',
//         banUntil:  null,
//         banReason: null,
//       });
//     }

//     return { banned: false, banStatus: 'none', banUntil: null, banReason: null };
//   }

//   /**
//    * Admin-only: manually apply a ban.
//    */
//   async applyBan(dto: ApplyBanDTO): Promise<void> {
//     await databases.updateDocument(DATABASE_ID, PATIENTS_COL, dto.patientId, {
//       banStatus: dto.banStatus,
//       banUntil:  dto.banUntil,
//       banReason: dto.banReason,
//     });
//   }

//   /**
//    * Admin-only: remove all ban restrictions.
//    */
//   async removeBan(patientId: string): Promise<void> {
//     await databases.updateDocument(DATABASE_ID, PATIENTS_COL, patientId, {
//       banStatus: 'none',
//       banUntil:  null,
//       banReason: null,
//     });
//   }
// }

// export const noShowService = new NoShowService();
// src/services/noshow.service.ts
// Uses browser Appwrite SDK — client-side only.
// Server-side no-show incrementing is handled by /api/handle-noshow.
import { databases } from '@/lib/appwrite';
import type {
  ApplyBanDTO,
  BanCheckResult,
  BanStatus,
} from '@/types/patient.types';

const DATABASE_ID  = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const PATIENTS_COL = process.env.NEXT_PUBLIC_APPWRITE_PATIENTS_COLLECTION_ID!;

function isBanActive(banUntil: string | null): boolean {
  if (!banUntil) return false;
  return new Date(banUntil) > new Date();
}

class NoShowService {
  /**
   * Check if a patient is currently banned.
   * Used in useAuth and before booking.
   */
  async checkIfBanned(patientId: string): Promise<BanCheckResult> {
    const doc = await databases.getDocument(DATABASE_ID, PATIENTS_COL, patientId);

    const banStatus = (doc.banStatus as BanStatus) ?? 'none';
    const banUntil  = (doc.banUntil  as string | null) ?? null;
    const banReason = (doc.banReason as string | null) ?? null;

    if (banStatus === 'permanent') {
      return { banned: true, banStatus, banUntil, banReason };
    }

    if (banStatus === 'temporary' && isBanActive(banUntil)) {
      return { banned: true, banStatus, banUntil, banReason };
    }

    // Expired temporary ban — lift it automatically (keep noShowCount intact)
    if (banStatus === 'temporary' && !isBanActive(banUntil)) {
      await databases.updateDocument(DATABASE_ID, PATIENTS_COL, patientId, {
        banStatus: 'none',
        banUntil:  null,
        banReason: null,
      });
    }

    return { banned: false, banStatus: 'none', banUntil: null, banReason: null };
  }

  /**
   * Admin-only: manually apply a ban.
   */
  async applyBan(dto: ApplyBanDTO): Promise<void> {
    await databases.updateDocument(DATABASE_ID, PATIENTS_COL, dto.patientId, {
      banStatus: dto.banStatus,
      banUntil:  dto.banUntil,
      banReason: dto.banReason,
    });
  }

  /**
   * Admin-only: remove ban AND reset noShowCount to 0.
   * This gives the patient a clean slate — next no-show starts from 1.
   */
  async removeBan(patientId: string): Promise<void> {
    await databases.updateDocument(DATABASE_ID, PATIENTS_COL, patientId, {
      banStatus:   'none',
      banUntil:    null,
      banReason:   null,
      noShowCount: 0,   // ← KEY FIX: reset counter so they start fresh
    });
  }
}

export const noShowService = new NoShowService();