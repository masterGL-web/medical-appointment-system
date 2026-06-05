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

// ─── Pure utility functions (used by /api/handle-noshow route) ────────────────

/**
 * Returns count of no-shows in the last 60 days from a list of appointment dates.
 * Rolling-window equivalent of SQL's DATE_SUB(NOW(), INTERVAL 2 MONTH).
 */
export function countRecentNoShows(noShowDates: string[]): number {
  const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  return noShowDates.filter(d => new Date(d).getTime() >= now - SIXTY_DAYS_MS).length;
}

/**
 * Pure decision: given recent no-show count → graduated ban state.
 * 3 no-shows → 7-day ban
 * 4 no-shows → 14-day ban
 * 5+ no-shows → permanent ban
 * No side effects — only returns a decision object.
 */
export function evaluateBan(recentCount: number): {
  shouldBan:      boolean;
  banStatus:      'none' | 'temporary' | 'permanent';
  banDurationDays: number | null;
  banReason:      string | null;
} {
  if (recentCount >= 5) return {
    shouldBan: true, banStatus: 'permanent', banDurationDays: null,
    banReason: `Permanent ban: ${recentCount} no-shows in the last 60 days.`,
  };
  if (recentCount === 4) return {
    shouldBan: true, banStatus: 'temporary', banDurationDays: 14,
    banReason: '4 no-shows in the last 60 days. Banned for 14 days.',
  };
  if (recentCount === 3) return {
    shouldBan: true, banStatus: 'temporary', banDurationDays: 7,
    banReason: '3 no-shows in the last 60 days. Banned for 7 days.',
  };
  return { shouldBan: false, banStatus: 'none', banDurationDays: null, banReason: null };
}