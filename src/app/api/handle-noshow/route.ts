// // src/app/api/handle-noshow/route.ts
// import { NextRequest, NextResponse } from 'next/server';

// const ENDPOINT  = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
// const PROJECT   = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
// const DATABASE  = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
// const API_KEY   = process.env.APPWRITE_API_KEY!;
// const APPTS_COL = process.env.NEXT_PUBLIC_APPWRITE_APPOINTMENTS_COLLECTION_ID!;
// const PATS_COL  = process.env.NEXT_PUBLIC_APPWRITE_PATIENTS_COLLECTION_ID!;

// const TEMP_BAN_THRESHOLD = 3;
// const PERM_BAN_THRESHOLD = 5;
// const TEMP_BAN_DAYS      = 30;

// // ─── Headers ──────────────────────────────────────────────────────────────────

// function appwriteHeaders(): Record<string, string> {
//   return {
//     'Content-Type':       'application/json',
//     'X-Appwrite-Project': PROJECT,
//     'X-Appwrite-Key':     API_KEY,
//   };
// }

// function addDays(days: number): string {
//   const d = new Date();
//   d.setDate(d.getDate() + days);
//   return d.toISOString();
// }

// // ─── Query builders ───────────────────────────────────────────────────────────
// // Appwrite REST expects queries as JSON-serialized objects.
// // Format confirmed from node-appwrite SDK source:
// // {"method":"equal","attribute":"userId","values":["abc"]}

// function qEqual(attribute: string, value: string): string {
//   return JSON.stringify({ method: 'equal', attribute, values: [value] });
// }

// function qLimit(n: number): string {
//   return JSON.stringify({ method: 'limit', values: [n] });
// }

// // ─── REST helpers ─────────────────────────────────────────────────────────────

// async function listDocuments(
//   collection: string,
//   queries: string[]
// ): Promise<{ documents: Record<string, unknown>[] }> {
//   const params = new URLSearchParams();
//   queries.forEach((q) => params.append('queries[]', q));

//   const url = `${ENDPOINT}/databases/${DATABASE}/collections/${collection}/documents?${params.toString()}`;

//   console.log('[handle-noshow] GET', url);

//   const res = await fetch(url, { headers: appwriteHeaders() });

//   if (!res.ok) {
//     const text = await res.text();
//     throw new Error(`listDocuments [${collection}] → ${text}`);
//   }

//   return res.json() as Promise<{ documents: Record<string, unknown>[] }>;
// }

// async function getDocumentById(
//   collection: string,
//   documentId: string
// ): Promise<Record<string, unknown> | null> {
//   const url = `${ENDPOINT}/databases/${DATABASE}/collections/${collection}/documents/${documentId}`;

//   console.log('[handle-noshow] GET by $id', url);

//   const res = await fetch(url, { headers: appwriteHeaders() });

//   if (!res.ok) {
//     console.log('[handle-noshow] getDocumentById failed:', await res.text());
//     return null;
//   }

//   return res.json() as Promise<Record<string, unknown>>;
// }

// async function updateDocument(
//   collection: string,
//   documentId: string,
//   data: Record<string, unknown>
// ): Promise<void> {
//   const url = `${ENDPOINT}/databases/${DATABASE}/collections/${collection}/documents/${documentId}`;

//   console.log('[handle-noshow] PATCH', url, data);

//   const res = await fetch(url, {
//     method:  'PATCH',
//     headers: appwriteHeaders(),
//     body:    JSON.stringify({ data }),
//   });

//   if (!res.ok) {
//     const text = await res.text();
//     throw new Error(`updateDocument [${collection}/${documentId}] → ${text}`);
//   }
// }

// // ─── Core logic ───────────────────────────────────────────────────────────────

// async function handleNoShow(patientUserId: string): Promise<{
//   noShowCount: number;
//   banApplied:  boolean;
//   banStatus:   string;
// }> {

//   // ── Step 1: find patient document ─────────────────────────────────────────
//   // appointments.patientId could be stored as either:
//   //   (a) the Appwrite Auth userId → stored in patients.userId field
//   //   (b) the patients document $id directly
//   // We try (a) first, then fall back to (b).

//   let patientDoc: Record<string, unknown> | null = null;
//   let patientDocumentId = '';

//   // Try (a): query by userId field
//   const byUserId = await listDocuments(PATS_COL, [
//     qEqual('userId', patientUserId),
//     qLimit(1),
//   ]);

//   console.log('[handle-noshow] query by userId result count:', byUserId.documents.length);

//   if (byUserId.documents.length > 0) {
//     patientDoc        = byUserId.documents[0];
//     patientDocumentId = patientDoc.$id as string;
//     console.log('[handle-noshow] found by userId → $id:', patientDocumentId);
//   } else {
//     // Try (b): fetch directly by $id
//     console.log('[handle-noshow] not found by userId, trying direct $id fetch...');

//     patientDoc = await getDocumentById(PATS_COL, patientUserId);

//     if (patientDoc) {
//       patientDocumentId = patientDoc.$id as string;
//       console.log('[handle-noshow] found by direct $id fetch → $id:', patientDocumentId);
//     }
//   }

//   if (!patientDoc || !patientDocumentId) {
//     throw new Error(
//       `No patient document found for patientId: ${patientUserId} — tried userId field and direct $id lookup`
//     );
//   }

//   // ── Step 2: count no-show appointments ────────────────────────────────────
//   // Use the same value that was passed in — it matches what is stored
//   // as patientId in the appointments collection.

//   const apptResult = await listDocuments(APPTS_COL, [
//     qEqual('patientId',   patientUserId),
//     qEqual('status',      'cancelled'),
//     qEqual('cancelledBy', 'doctor'),
//     qLimit(100),
//   ]);

//   console.log('[handle-noshow] appointments fetched:', apptResult.documents.length);

//   // Filter locally: cancelReason must contain "no-show" (case-insensitive)
//   const noShows = apptResult.documents.filter((doc) => {
//     const reason = (doc.cancelReason as string | undefined | null) ?? '';
//     return reason.toLowerCase().includes('no-show');
//   });

//   const noShowCount = noShows.length;
//   console.log('[handle-noshow] noShowCount:', noShowCount);

//   // ── Step 3: determine ban state ───────────────────────────────────────────

//   const currentBanStatus = (patientDoc.banStatus as string) ?? 'none';

//   let banStatus  = currentBanStatus;
//   let banUntil:  string | null = (patientDoc.banUntil  as string | null) ?? null;
//   let banReason: string | null = (patientDoc.banReason as string | null) ?? null;
//   let banApplied = false;

//   if (noShowCount >= PERM_BAN_THRESHOLD && currentBanStatus === 'temporary') {
//     banStatus  = 'permanent';
//     banUntil   = null;
//     banReason  = `Permanent ban: ${noShowCount} no-shows recorded.`;
//     banApplied = true;
//   } else if (noShowCount >= TEMP_BAN_THRESHOLD && currentBanStatus === 'none') {
//     banStatus  = 'temporary';
//     banUntil   = addDays(TEMP_BAN_DAYS);
//     banReason  = `Automatic ban: ${noShowCount} no-shows recorded. Banned for 30 days.`;
//     banApplied = true;
//   }

//   // ── Step 4: update using real document $id — NOT the userId ──────────────

//   await updateDocument(PATS_COL, patientDocumentId, {
//     noShowCount,
//     banStatus,
//     banUntil,
//     banReason,
//   });

//   console.log('[handle-noshow] patient updated successfully → $id:', patientDocumentId);

//   return { noShowCount, banApplied, banStatus };
// }

// // ─── Route handler ────────────────────────────────────────────────────────────

// interface HandleNoShowBody {
//   patientId: string;
// }

// export async function POST(req: NextRequest): Promise<NextResponse> {
//   try {
//     const body      = (await req.json()) as HandleNoShowBody;
//     const patientId = body.patientId?.trim();

//     console.log('[handle-noshow] called with patientId:', patientId);

//     if (!patientId) {
//       return NextResponse.json(
//         { ok: false, error: 'patientId is required' },
//         { status: 400 }
//       );
//     }

//     const result = await handleNoShow(patientId);
//     return NextResponse.json({ ok: true, result });

//   } catch (error) {
//     const message = error instanceof Error ? error.message : 'Unknown error';
//     console.error('[handle-noshow] error:', message);
//     return NextResponse.json(
//       { ok: false, error: message },
//       { status: 500 }
//     );
//   }
// }
// src/app/api/handle-noshow/route.ts
import { NextRequest, NextResponse } from 'next/server';

const ENDPOINT  = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const PROJECT   = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const DATABASE  = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const API_KEY   = process.env.APPWRITE_API_KEY!;
const PATS_COL  = process.env.NEXT_PUBLIC_APPWRITE_PATIENTS_COLLECTION_ID!;

// ─── Thresholds ───────────────────────────────────────────────────────────────

const TEMP_BAN_THRESHOLD = 3;
const PERM_BAN_THRESHOLD = 5;
const TEMP_BAN_DAYS      = 30;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function appwriteHeaders(): Record<string, string> {
  return {
    'Content-Type':       'application/json',
    'X-Appwrite-Project': PROJECT,
    'X-Appwrite-Key':     API_KEY,
  };
}

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function qEqual(attribute: string, value: string): string {
  return JSON.stringify({ method: 'equal', attribute, values: [value] });
}

function qLimit(n: number): string {
  return JSON.stringify({ method: 'limit', values: [n] });
}

// ─── REST helpers ─────────────────────────────────────────────────────────────

async function listDocuments(
  collection: string,
  queries: string[]
): Promise<{ documents: Record<string, unknown>[] }> {
  const params = new URLSearchParams();
  queries.forEach((q) => params.append('queries[]', q));
  const url = `${ENDPOINT}/databases/${DATABASE}/collections/${collection}/documents?${params.toString()}`;
  const res = await fetch(url, { headers: appwriteHeaders() });
  if (!res.ok) throw new Error(`listDocuments [${collection}] → ${await res.text()}`);
  return res.json() as Promise<{ documents: Record<string, unknown>[] }>;
}

async function getDocumentById(
  collection: string,
  documentId: string
): Promise<Record<string, unknown> | null> {
  const url = `${ENDPOINT}/databases/${DATABASE}/collections/${collection}/documents/${documentId}`;
  const res = await fetch(url, { headers: appwriteHeaders() });
  if (!res.ok) return null;
  return res.json() as Promise<Record<string, unknown>>;
}

async function updateDocument(
  collection: string,
  documentId: string,
  data: Record<string, unknown>
): Promise<void> {
  const url = `${ENDPOINT}/databases/${DATABASE}/collections/${collection}/documents/${documentId}`;
  const res = await fetch(url, {
    method:  'PATCH',
    headers: appwriteHeaders(),
    body:    JSON.stringify({ data }),
  });
  if (!res.ok) throw new Error(`updateDocument [${collection}/${documentId}] → ${await res.text()}`);
}

// ─── Core logic ───────────────────────────────────────────────────────────────

async function handleNoShow(patientUserId: string): Promise<{
  noShowCount: number;
  banApplied:  boolean;
  banStatus:   string;
}> {
  // ── Step 1: find patient document ─────────────────────────────────────────

  let patientDoc: Record<string, unknown> | null = null;
  let patientDocumentId = '';

  const byUserId = await listDocuments(PATS_COL, [
    qEqual('userId', patientUserId),
    qLimit(1),
  ]);

  if (byUserId.documents.length > 0) {
    patientDoc        = byUserId.documents[0];
    patientDocumentId = patientDoc.$id as string;
  } else {
    patientDoc = await getDocumentById(PATS_COL, patientUserId);
    if (patientDoc) {
      patientDocumentId = patientDoc.$id as string;
    }
  }

  if (!patientDoc || !patientDocumentId) {
    throw new Error(`No patient document found for patientId: ${patientUserId}`);
  }

  // ── Step 2: INCREMENT stored count by 1 (not recount from appointments) ───
  // This is the key fix: we trust the stored noShowCount field.
  // Admin can reset it to 0 via removeBan, and it will stay 0.

  const currentCount    = (patientDoc.noShowCount as number) ?? 0;
  const newNoShowCount  = currentCount + 1;

  console.log(`[handle-noshow] incrementing noShowCount: ${currentCount} → ${newNoShowCount}`);

  // ── Step 3: determine ban state ───────────────────────────────────────────

  const currentBanStatus = (patientDoc.banStatus as string) ?? 'none';

  let banStatus  = currentBanStatus;
  let banUntil:  string | null = (patientDoc.banUntil  as string | null) ?? null;
  let banReason: string | null = (patientDoc.banReason as string | null) ?? null;
  let banApplied = false;

  if (newNoShowCount >= PERM_BAN_THRESHOLD && currentBanStatus === 'temporary') {
    // Escalate to permanent
    banStatus  = 'permanent';
    banUntil   = null;
    banReason  = `Permanent ban: ${newNoShowCount} no-shows recorded.`;
    banApplied = true;
  } else if (newNoShowCount >= TEMP_BAN_THRESHOLD && currentBanStatus === 'none') {
    // Apply temporary ban
    banStatus  = 'temporary';
    banUntil   = addDays(TEMP_BAN_DAYS);
    banReason  = `Automatic ban: ${newNoShowCount} no-shows recorded. Banned for 30 days.`;
    banApplied = true;
  }

  // ── Step 4: update patient ────────────────────────────────────────────────

  await updateDocument(PATS_COL, patientDocumentId, {
    noShowCount: newNoShowCount,
    banStatus,
    banUntil,
    banReason,
  });

  console.log(`[handle-noshow] patient updated → noShowCount: ${newNoShowCount}, banStatus: ${banStatus}`);

  return { noShowCount: newNoShowCount, banApplied, banStatus };
}

// ─── Route handler ────────────────────────────────────────────────────────────

interface HandleNoShowBody {
  patientId: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body      = (await req.json()) as HandleNoShowBody;
    const patientId = body.patientId?.trim();

    if (!patientId) {
      return NextResponse.json(
        { ok: false, error: 'patientId is required' },
        { status: 400 }
      );
    }

    const result = await handleNoShow(patientId);
    return NextResponse.json({ ok: true, result });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[handle-noshow] error:', message);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}