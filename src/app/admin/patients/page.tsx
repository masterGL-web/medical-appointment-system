// // src/app/admin/patients/page.tsx
// 'use client';

// import { useEffect, useState } from 'react';
// import { databases } from '@/lib/appwrite';
// import { Query } from 'appwrite';
// import { noShowService } from '@/services/noshow.service';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { Skeleton } from '@/components/ui/skeleton';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from '@/components/ui/alert-dialog';
// import { toast } from 'sonner';
// import {
//   Users,
//   AlertCircle,
//   RefreshCw,
//   MoreVertical,
//   ShieldBan,
//   ShieldCheck,
// } from 'lucide-react';
// import type { Patient, BanStatus } from '@/types/patient.types';

// const DB   = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
// const PATS = process.env.NEXT_PUBLIC_APPWRITE_PATIENTS_COLLECTION_ID!;

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// function formatDate(iso: string | null): string {
//   if (!iso) return '—';
//   return new Date(iso).toLocaleDateString('fr-DZ', {
//     timeZone: 'Africa/Algiers',
//     year:     'numeric',
//     month:    'short',
//     day:      'numeric',
//   });
// }

// function addDays(days: number): string {
//   const d = new Date();
//   d.setDate(d.getDate() + days);
//   return d.toISOString();
// }

// function isBanActive(banUntil: string | null): boolean {
//   if (!banUntil) return false;
//   return new Date(banUntil) > new Date();
// }

// // ─── No-show badge ────────────────────────────────────────────────────────────

// function NoShowBadge({ count }: { count: number }) {
//   if (count === 0) {
//     return (
//       <Badge className="bg-gray-50 text-gray-500 border-gray-200 border text-xs">
//         0 no-shows
//       </Badge>
//     );
//   }
//   if (count <= 2) {
//     return (
//       <Badge className="bg-amber-50 text-amber-700 border-amber-200 border text-xs">
//         {count} no-show{count > 1 ? 's' : ''}
//       </Badge>
//     );
//   }
//   return (
//     <Badge className="bg-red-50 text-red-700 border-red-200 border text-xs">
//       {count} no-shows ⚠️
//     </Badge>
//   );
// }

// // ─── Ban status badge ─────────────────────────────────────────────────────────

// function BanBadge({ patient }: { patient: Patient }) {
//   const { banStatus, banUntil } = patient;

//   if (banStatus === 'permanent') {
//     return (
//       <Badge className="bg-red-50 text-red-700 border-red-200 border text-xs gap-1">
//         <ShieldBan className="h-3 w-3" />
//         Permanent Ban
//       </Badge>
//     );
//   }

//   if (banStatus === 'temporary' && isBanActive(banUntil)) {
//     return (
//       <Badge className="bg-amber-50 text-amber-700 border-amber-200 border text-xs">
//         Banned until {formatDate(banUntil)}
//       </Badge>
//     );
//   }

//   return (
//     <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 border text-xs gap-1">
//       <ShieldCheck className="h-3 w-3" />
//       Active
//     </Badge>
//   );
// }

// // ─── Main page ────────────────────────────────────────────────────────────────

// export default function AdminPatientsPage() {
//   const [patients, setPatients]       = useState<Patient[]>([]);
//   const [loading, setLoading]         = useState(true);
//   const [error, setError]             = useState<string | null>(null);
//   const [refreshing, setRefreshing]   = useState(false);
//   const [actioning, setActioning]     = useState<string | null>(null);
//   const [permBanTarget, setPermBanTarget] = useState<Patient | null>(null);

//   const load = async (silent = false) => {
//     if (!silent) setLoading(true);
//     else setRefreshing(true);
//     setError(null);
//     try {
//       const res = await databases.listDocuments(DB, PATS, [
//         Query.orderDesc('$createdAt'),
//         Query.limit(100),
//       ]);
//       setPatients(res.documents as unknown as Patient[]);
//     } catch {
//       setError('Failed to load patients.');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

//   // ── Optimistic update helper ───────────────────────────────────────────────

//   const updatePatient = (patientId: string, updates: Partial<Patient>) => {
//     setPatients((prev) =>
//       prev.map((p) => p.$id === patientId ? { ...p, ...updates } : p)
//     );
//   };

//   // ── Ban actions ────────────────────────────────────────────────────────────

//   const handleBan = async (
//     patient: Patient,
//     banStatus: 'temporary' | 'permanent',
//     days: number | null
//   ) => {
//     setActioning(patient.$id);
//     const banUntil  = days ? addDays(days) : null;
//     const banReason = banStatus === 'permanent'
//       ? 'Permanent ban by admin'
//       : `Admin ban for ${days} days`;

//     try {
//       await noShowService.applyBan({
//         patientId: patient.$id,
//         banStatus,
//         banUntil,
//         banReason,
//       });

//       updatePatient(patient.$id, { banStatus, banUntil, banReason });

//       toast.success(
//         banStatus === 'permanent'
//           ? `${patient.firstName} ${patient.lastName} permanently banned`
//           : `${patient.firstName} ${patient.lastName} banned for ${days} days`
//       );
//     } catch {
//       toast.error('Failed to apply ban');
//     } finally {
//       setActioning(null);
//     }
//   };

//   const handleUnban = async (patient: Patient) => {
//     setActioning(patient.$id);
//     try {
//       await noShowService.removeBan(patient.$id);
//       updatePatient(patient.$id, { banStatus: 'none', banUntil: null, banReason: null });
//       toast.success(`${patient.firstName} ${patient.lastName} unbanned`);
//     } catch {
//       toast.error('Failed to remove ban');
//     } finally {
//       setActioning(null);
//     }
//   };

//   const isBanned = (p: Patient): boolean =>
//     p.banStatus === 'permanent' ||
//     (p.banStatus === 'temporary' && isBanActive(p.banUntil));

//   // ─────────────────────────────────────────────────────────────────────────

//   return (
//     <div className="space-y-6">

//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
//           <p className="text-gray-500 mt-1">View and manage all registered patients</p>
//         </div>
//         <Button variant="outline" size="sm" disabled={refreshing || loading} onClick={() => load(true)}>
//           <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
//           Refresh
//         </Button>
//       </div>

//       {error && (
//         <Alert variant="destructive">
//           <AlertCircle className="h-4 w-4" />
//           <AlertDescription>{error}</AlertDescription>
//         </Alert>
//       )}

//       <Card className="border-gray-200 shadow-sm">
//         <CardHeader className="border-b bg-gray-50/60">
//           <CardTitle className="flex items-center gap-2 text-base">
//             <Users className="h-4 w-4 text-purple-600" />
//             All Patients ({loading ? '…' : patients.length})
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="p-0">
//           {loading ? (
//             <div className="space-y-3 p-4">
//               {[1,2,3,4].map((i) => (
//                 <div key={i} className="flex items-center gap-4">
//                   <Skeleton className="w-10 h-10 rounded-full" />
//                   <div className="flex-1 space-y-1">
//                     <Skeleton className="h-4 w-40" />
//                     <Skeleton className="h-3 w-56" />
//                   </div>
//                   <Skeleton className="h-6 w-20 rounded-full" />
//                 </div>
//               ))}
//             </div>
//           ) : patients.length === 0 ? (
//             <div className="text-center py-12 text-gray-500">No patients registered yet</div>
//           ) : (
//             <div className="divide-y divide-gray-100">

//               {/* Header row */}
//               <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 <div className="col-span-3">Patient</div>
//                 <div className="col-span-3">Email</div>
//                 <div className="col-span-1">City</div>
//                 <div className="col-span-2">No-Shows</div>
//                 <div className="col-span-2">Ban Status</div>
//                 <div className="col-span-1 text-right">Actions</div>
//               </div>

//               {patients.map((patient) => (
//                 <div
//                   key={patient.$id}
//                   className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-gray-50 transition-colors"
//                 >
//                   {/* Avatar + name */}
//                   <div className="col-span-3 flex items-center gap-3">
//                     <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
//                       {patient.firstName[0]}{patient.lastName[0]}
//                     </div>
//                     <div className="min-w-0">
//                       <p className="font-medium text-gray-900 text-sm truncate">
//                         {patient.firstName} {patient.lastName}
//                       </p>
//                       <p className="text-xs text-gray-500 capitalize">{patient.gender}</p>
//                     </div>
//                   </div>

//                   {/* Email */}
//                   <div className="col-span-3">
//                     <p className="text-sm text-gray-700 truncate">{patient.email}</p>
//                   </div>

//                   {/* City */}
//                   <div className="col-span-1">
//                     <p className="text-sm text-gray-600 truncate">{patient.city ?? '—'}</p>
//                   </div>

//                   {/* No-show badge */}
//                   <div className="col-span-2">
//                     <NoShowBadge count={patient.noShowCount ?? 0} />
//                   </div>

//                   {/* Ban status badge */}
//                   <div className="col-span-2">
//                     <BanBadge patient={patient} />
//                   </div>

//                   {/* 3-dot actions */}
//                   <div className="col-span-1 flex justify-end">
//                     <DropdownMenu>
//                       <DropdownMenuTrigger asChild>
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           disabled={actioning === patient.$id}
//                           className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
//                         >
//                           <MoreVertical className="h-4 w-4" />
//                         </Button>
//                       </DropdownMenuTrigger>
//                       <DropdownMenuContent align="end" className="w-48">

//                         <DropdownMenuItem
//                           onClick={() => handleBan(patient, 'temporary', 30)}
//                           className="cursor-pointer text-amber-700"
//                         >
//                           <ShieldBan className="h-4 w-4 mr-2" />
//                           Ban 1 month
//                         </DropdownMenuItem>

//                         <DropdownMenuItem
//                           onClick={() => handleBan(patient, 'temporary', 90)}
//                           className="cursor-pointer text-amber-700"
//                         >
//                           <ShieldBan className="h-4 w-4 mr-2" />
//                           Ban 3 months
//                         </DropdownMenuItem>

//                         <DropdownMenuItem
//                           onClick={() => setPermBanTarget(patient)}
//                           className="cursor-pointer text-red-600"
//                         >
//                           <ShieldBan className="h-4 w-4 mr-2" />
//                           Permanent ban
//                         </DropdownMenuItem>

//                         {isBanned(patient) && (
//                           <>
//                             <DropdownMenuSeparator />
//                             <DropdownMenuItem
//                               onClick={() => handleUnban(patient)}
//                               className="cursor-pointer text-emerald-600"
//                             >
//                               <ShieldCheck className="h-4 w-4 mr-2" />
//                               Remove ban
//                             </DropdownMenuItem>
//                           </>
//                         )}
//                       </DropdownMenuContent>
//                     </DropdownMenu>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Permanent ban confirmation dialog */}
//       <AlertDialog
//         open={!!permBanTarget}
//         onOpenChange={(open) => !open && setPermBanTarget(null)}
//       >
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Permanently ban this patient?</AlertDialogTitle>
//             <AlertDialogDescription>
//               This will permanently ban{' '}
//               <strong>
//                 {permBanTarget?.firstName} {permBanTarget?.lastName}
//               </strong>
//               . They will not be able to book any appointments. Only you can remove this ban.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction
//               className="bg-red-600 hover:bg-red-700"
//               onClick={async () => {
//                 if (permBanTarget) {
//                   await handleBan(permBanTarget, 'permanent', null);
//                   setPermBanTarget(null);
//                 }
//               }}
//             >
//               Yes, permanently ban
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// }
// src/app/admin/patients/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { noShowService } from '@/services/noshow.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  Users,
  AlertCircle,
  RefreshCw,
  MoreVertical,
  ShieldBan,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
} from 'lucide-react';
import type { Patient, BanStatus } from '@/types/patient.types';

const DB   = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const PATS = process.env.NEXT_PUBLIC_APPWRITE_PATIENTS_COLLECTION_ID!;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-DZ', {
    timeZone: 'Africa/Algiers',
    year:     'numeric',
    month:    'short',
    day:      'numeric',
  });
}

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function isBanActive(banUntil: string | null): boolean {
  if (!banUntil) return false;
  return new Date(banUntil) > new Date();
}

// ─── No-show badge ────────────────────────────────────────────────────────────

function NoShowBadge({ count }: { count: number }) {
  if (count === 0) {
    return (
      <Badge className="bg-gray-50 text-gray-500 border-gray-200 border text-xs">
        0 no-shows
      </Badge>
    );
  }
  if (count <= 2) {
    return (
      <Badge className="bg-amber-50 text-amber-700 border-amber-200 border text-xs">
        {count} no-show{count > 1 ? 's' : ''}
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-50 text-red-700 border-red-200 border text-xs">
      {count} no-shows ⚠️
    </Badge>
  );
}

// ─── Ban status badge ─────────────────────────────────────────────────────────

function BanBadge({ patient }: { patient: Patient }) {
  const { banStatus, banUntil } = patient;

  if (banStatus === 'permanent') {
    return (
      <Badge className="bg-red-50 text-red-700 border-red-200 border text-xs gap-1">
        <ShieldBan className="h-3 w-3" />
        Permanent Ban
      </Badge>
    );
  }

  if (banStatus === 'temporary' && isBanActive(banUntil)) {
    return (
      <Badge className="bg-amber-50 text-amber-700 border-amber-200 border text-xs">
        Banned until {formatDate(banUntil)}
      </Badge>
    );
  }

  return (
    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 border text-xs gap-1">
      <ShieldCheck className="h-3 w-3" />
      Active
    </Badge>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminPatientsPage() {
  const [patients, setPatients]           = useState<Patient[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [refreshing, setRefreshing]       = useState(false);
  const [actioning, setActioning]         = useState<string | null>(null);
  const [permBanTarget, setPermBanTarget] = useState<Patient | null>(null);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const res = await databases.listDocuments(DB, PATS, [
        Query.orderDesc('$createdAt'),
        Query.limit(100),
      ]);
      setPatients(res.documents as unknown as Patient[]);
    } catch {
      setError('Failed to load patients.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Optimistic update helper ───────────────────────────────────────────────

  const updatePatient = (patientId: string, updates: Partial<Patient>) => {
    setPatients((prev) =>
      prev.map((p) => p.$id === patientId ? { ...p, ...updates } : p)
    );
  };

  // ── Ban actions ────────────────────────────────────────────────────────────

  const handleBan = async (
    patient: Patient,
    banStatus: 'temporary' | 'permanent',
    days: number | null
  ) => {
    setActioning(patient.$id);
    const banUntil  = days ? addDays(days) : null;
    const banReason = banStatus === 'permanent'
      ? 'Permanent ban by admin'
      : `Admin ban for ${days} days`;

    try {
      await noShowService.applyBan({
        patientId: patient.$id,
        banStatus,
        banUntil,
        banReason,
      });

      updatePatient(patient.$id, { banStatus, banUntil, banReason });

      toast.success(
        banStatus === 'permanent'
          ? `${patient.firstName} ${patient.lastName} permanently banned`
          : `${patient.firstName} ${patient.lastName} banned for ${days} days`
      );
    } catch {
      toast.error('Failed to apply ban');
    } finally {
      setActioning(null);
    }
  };

  // ── KEY FIX: also reset noShowCount to 0 in the optimistic UI update ──────

  const handleUnban = async (patient: Patient) => {
    setActioning(patient.$id);
    try {
      await noShowService.removeBan(patient.$id);
      updatePatient(patient.$id, {
        banStatus:   'none',
        banUntil:    null,
        banReason:   null,
        noShowCount: 0,   // ← was missing before — UI kept showing old count
      });
      toast.success(`${patient.firstName} ${patient.lastName} unbanned`);
    } catch {
      toast.error('Failed to remove ban');
    } finally {
      setActioning(null);
    }
  };

  const isBanned = (p: Patient): boolean =>
    p.banStatus === 'permanent' ||
    (p.banStatus === 'temporary' && isBanActive(p.banUntil));

  const activeCount  = patients.filter(p => !isBanned(p)).length;
  const bannedCount  = patients.filter(p => isBanned(p)).length;

  return (
    <div className="space-y-6">

      {/* ── Header banner ── */}
      <div className="bg-gradient-to-r from-purple-800 to-purple-700 rounded-2xl px-8 py-6 shadow-lg shadow-purple-900/20 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Patients</h1>
          <p className="text-purple-200 mt-1">View and manage all registered patients</p>
        </div>
        <button
          disabled={refreshing || loading}
          onClick={() => load(true)}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* ── Stats cards ── */}
      {!loading && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 border-b-4 border-b-purple-400 shadow-md p-5 flex items-center justify-between hover:shadow-lg transition-shadow">
            <div>
              <Users className="h-5 w-5 text-purple-400 mb-1" />
              <p className="text-3xl font-bold text-purple-600">{patients.length}</p>
              <p className="text-sm text-slate-500 font-medium">Total Patients</p>
            </div>
            <div className="rounded-2xl bg-purple-50 p-3"><Users className="h-6 w-6 text-purple-500" /></div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 border-b-4 border-b-emerald-400 shadow-md p-5 flex items-center justify-between hover:shadow-lg transition-shadow">
            <div>
              <CheckCircle2 className="h-5 w-5 text-emerald-400 mb-1" />
              <p className="text-3xl font-bold text-emerald-600">{activeCount}</p>
              <p className="text-sm text-slate-500 font-medium">Active</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3"><CheckCircle2 className="h-6 w-6 text-emerald-500" /></div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 border-b-4 border-b-red-400 shadow-md p-5 flex items-center justify-between hover:shadow-lg transition-shadow">
            <div>
              <ShieldBan className="h-5 w-5 text-red-400 mb-1" />
              <p className="text-3xl font-bold text-red-500">{bannedCount}</p>
              <p className="text-sm text-slate-500 font-medium">Banned</p>
            </div>
            <div className="rounded-2xl bg-red-50 p-3"><ShieldBan className="h-6 w-6 text-red-500" /></div>
          </div>
        </div>
      )}

      {/* ── Patients table card ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">

        {/* Card header */}
        <div className="border-b border-slate-100 px-6 py-4 flex items-center gap-3 bg-gradient-to-r from-slate-50 to-white">
          <div className="rounded-xl bg-purple-100 p-2">
            <Users className="h-5 w-5 text-purple-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            All Patients ({loading ? '…' : patients.length})
          </h2>
        </div>

        {loading ? (
          <div className="space-y-3 p-6">
            {[1,2,3,4].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-11 h-11 rounded-2xl" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            ))}
          </div>
        ) : patients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Users className="h-16 w-16 text-slate-200" />
            <p className="text-lg font-semibold text-slate-400">No patients found</p>
            <p className="text-sm text-slate-400">No patients registered yet</p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <div className="col-span-3">Patient</div>
              <div className="col-span-3">Email</div>
              <div className="col-span-2">City</div>
              <div className="col-span-2">No-Shows</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            {/* Rows */}
            {patients.map((patient) => (
              <div
                key={patient.$id}
                className="grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-slate-100 last:border-b-0 hover:bg-slate-50/80 transition-colors"
              >
                {/* Avatar + name */}
                <div className="col-span-3 flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md">
                    {patient.firstName[0]}{patient.lastName[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {patient.firstName} {patient.lastName}
                    </p>
                    <p className="text-xs text-slate-400 capitalize">{patient.gender}</p>
                  </div>
                </div>

                {/* Email */}
                <div className="col-span-3">
                  <p className="text-sm text-slate-600 truncate">{patient.email}</p>
                </div>

                {/* City */}
                <div className="col-span-2 flex items-center gap-1.5 text-sm text-slate-600">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{patient.city ?? '—'}</span>
                </div>

                {/* No-show badge */}
                <div className="col-span-2">
                  <NoShowBadge count={patient.noShowCount ?? 0} />
                </div>

                {/* Ban status */}
                <div className="col-span-1">
                  <BanBadge patient={patient} />
                </div>

                {/* 3-dot actions */}
                <div className="col-span-1 flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        disabled={actioning === patient.$id}
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-40"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleBan(patient, 'temporary', 7)} className="cursor-pointer text-amber-700">
                        <ShieldBan className="h-4 w-4 mr-2" /> Ban 1 week
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBan(patient, 'temporary', 14)} className="cursor-pointer text-amber-700">
                        <ShieldBan className="h-4 w-4 mr-2" /> Ban 2 weeks
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setPermBanTarget(patient)} className="cursor-pointer text-red-600">
                        <ShieldBan className="h-4 w-4 mr-2" /> Permanent ban
                      </DropdownMenuItem>
                      {isBanned(patient) && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleUnban(patient)} className="cursor-pointer text-emerald-600">
                            <ShieldCheck className="h-4 w-4 mr-2" /> Remove ban
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Permanent ban confirmation dialog — unchanged */}
      <AlertDialog open={!!permBanTarget} onOpenChange={(open) => !open && setPermBanTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently ban this patient?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently ban{' '}
              <strong>{permBanTarget?.firstName} {permBanTarget?.lastName}</strong>.
              They will not be able to book any appointments. Only you can remove this ban.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={async () => {
                if (permBanTarget) {
                  await handleBan(permBanTarget, 'permanent', null);
                  setPermBanTarget(null);
                }
              }}
            >
              Yes, permanently ban
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}