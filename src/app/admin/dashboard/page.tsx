// // src/app/admin/dashboard/page.tsx
// 'use client';

// import { useEffect, useState } from 'react';
// import { databases } from '@/lib/appwrite';
// import { Query } from 'appwrite';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Skeleton } from '@/components/ui/skeleton';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { Badge } from '@/components/ui/badge';
// import {
//   Stethoscope,
//   Users,
//   CalendarDays,
//   ShieldCheck,
//   AlertCircle,
//   CheckCircle,
//   XCircle,
//   Clock,
//   ShieldBan,
//   TrendingUp,
// } from 'lucide-react';

// const DB   = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
// const DOCS = process.env.NEXT_PUBLIC_APPWRITE_DOCTORS_COLLECTION_ID!;
// const PATS = process.env.NEXT_PUBLIC_APPWRITE_PATIENTS_COLLECTION_ID!;
// const APPS = process.env.NEXT_PUBLIC_APPWRITE_APPOINTMENTS_COLLECTION_ID!;

// // ─── Types ────────────────────────────────────────────────────────────────────

// interface AdminStats {
//   // Doctors
//   totalDoctors:      number;
//   verifiedDoctors:   number;
//   unverifiedDoctors: number;
//   // Patients
//   totalPatients:     number;
//   activatedPatients: number;
//   bannedPatients:    number;
//   // Appointments
//   totalAppointments:    number;
//   pendingAppointments:  number;
//   confirmedAppointments: number;
//   cancelledAppointments: number;
//   completedAppointments: number;
// }

// // ─── Stat card ────────────────────────────────────────────────────────────────

// function StatCard({
//   label,
//   value,
//   icon: Icon,
//   color,
//   bg,
//   loading,
// }: {
//   label:   string;
//   value:   number;
//   icon:    React.ElementType;
//   color:   string;
//   bg:      string;
//   loading: boolean;
// }) {
//   return (
//     <Card className="border-gray-200 shadow-sm">
//       <CardContent className="p-5">
//         <div className="flex items-center justify-between">
//           <div>
//             <p className="text-sm text-gray-500">{label}</p>
//             {loading ? (
//               <Skeleton className="h-8 w-14 mt-2" />
//             ) : (
//               <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
//             )}
//           </div>
//           <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
//             <Icon className={`h-6 w-6 ${color}`} />
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// // ─── Section breakdown card ───────────────────────────────────────────────────

// function BreakdownCard({
//   title,
//   icon: Icon,
//   iconColor,
//   rows,
//   loading,
// }: {
//   title:      string;
//   icon:       React.ElementType;
//   iconColor:  string;
//   rows: { label: string; value: number; badge: string; badgeColor: string }[];
//   loading:    boolean;
// }) {
//   return (
//     <Card className="border-gray-200 shadow-sm">
//       <CardHeader className="border-b bg-gray-50/60 pb-3">
//         <CardTitle className="flex items-center gap-2 text-base">
//           <Icon className={`h-4 w-4 ${iconColor}`} />
//           {title}
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="p-0">
//         <div className="divide-y divide-gray-50">
//           {rows.map((row) => (
//             <div key={row.label} className="flex items-center justify-between px-5 py-3">
//               <div className="flex items-center gap-2">
//                 <span className="text-sm text-gray-700">{row.label}</span>
//               </div>
//               <div className="flex items-center gap-3">
//                 {loading ? (
//                   <Skeleton className="h-5 w-8" />
//                 ) : (
//                   <>
//                     <span className="text-sm font-semibold text-gray-900">{row.value}</span>
//                     <Badge className={`text-xs ${row.badgeColor}`}>{row.badge}</Badge>
//                   </>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// // ─── Stacked bar ──────────────────────────────────────────────────────────────

// function AppointmentBar({ stats }: { stats: AdminStats }) {
//   const total = stats.totalAppointments;
//   if (total === 0) return null;

//   const segments = [
//     { label: 'Confirmed', value: stats.confirmedAppointments, color: 'bg-emerald-500' },
//     { label: 'Completed', value: stats.completedAppointments, color: 'bg-blue-500'    },
//     { label: 'Pending',   value: stats.pendingAppointments,   color: 'bg-amber-400'   },
//     { label: 'Cancelled', value: stats.cancelledAppointments, color: 'bg-red-400'     },
//   ];

//   return (
//     <Card className="border-gray-200 shadow-sm">
//       <CardContent className="p-5">
//         <div className="flex items-center gap-2 mb-4">
//           <TrendingUp className="h-4 w-4 text-gray-500" />
//           <p className="text-sm font-semibold text-gray-700">
//             Appointment Status Distribution
//           </p>
//           <span className="ml-auto text-sm font-bold text-gray-900">{total} total</span>
//         </div>

//         {/* Stacked bar */}
//         <div className="flex w-full h-4 rounded-full overflow-hidden gap-0.5">
//           {segments.map((s) => {
//             const pct = (s.value / total) * 100;
//             if (pct === 0) return null;
//             return (
//               <div
//                 key={s.label}
//                 className={`${s.color} h-full`}
//                 style={{ width: `${pct}%` }}
//                 title={`${s.label}: ${s.value}`}
//               />
//             );
//           })}
//         </div>

//         {/* Legend */}
//         <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4">
//           {segments.map((s) => {
//             const pct = total === 0 ? 0 : Math.round((s.value / total) * 100);
//             return (
//               <div key={s.label} className="flex items-center gap-1.5 text-xs text-gray-600">
//                 <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
//                 <span>{s.label}</span>
//                 <span className="font-semibold text-gray-800">
//                   {s.value} ({pct}%)
//                 </span>
//               </div>
//             );
//           })}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// // ─── Main page ────────────────────────────────────────────────────────────────

// export default function AdminDashboardPage() {
//   const [stats, setStats]     = useState<AdminStats | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError]     = useState<string | null>(null);

//   useEffect(() => {
//     const load = async () => {
//       try {
//         const [
//           doctorsTotal,
//           doctorsVerified,
//           patientsTotal,
//           patientsActivated,
//           patientsBanned,
//           appsTotal,
//           appsPending,
//           appsConfirmed,
//           appsCancelled,
//           appsCompleted,
//         ] = await Promise.all([
//           databases.listDocuments(DB, DOCS, [Query.limit(1)]),
//           databases.listDocuments(DB, DOCS, [Query.equal('isVerified', true),  Query.limit(1)]),
//           databases.listDocuments(DB, PATS, [Query.limit(1)]),
//           databases.listDocuments(DB, PATS, [Query.equal('isActivated', true), Query.limit(1)]),
//           databases.listDocuments(DB, PATS, [Query.equal('banStatus', 'temporary'), Query.limit(1)]),
//           databases.listDocuments(DB, APPS, [Query.limit(1)]),
//           databases.listDocuments(DB, APPS, [Query.equal('status', 'pending'),   Query.limit(1)]),
//           databases.listDocuments(DB, APPS, [Query.equal('status', 'confirmed'), Query.limit(1)]),
//           databases.listDocuments(DB, APPS, [Query.equal('status', 'cancelled'), Query.limit(1)]),
//           databases.listDocuments(DB, APPS, [Query.equal('status', 'completed'), Query.limit(1)]),
//         ]);

//         setStats({
//           totalDoctors:      doctorsTotal.total,
//           verifiedDoctors:   doctorsVerified.total,
//           unverifiedDoctors: doctorsTotal.total - doctorsVerified.total,
//           totalPatients:     patientsTotal.total,
//           activatedPatients: patientsActivated.total,
//           bannedPatients:    patientsBanned.total,
//           totalAppointments:     appsTotal.total,
//           pendingAppointments:   appsPending.total,
//           confirmedAppointments: appsConfirmed.total,
//           cancelledAppointments: appsCancelled.total,
//           completedAppointments: appsCompleted.total,
//         });
//       } catch {
//         setError('Failed to load statistics. Please refresh.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     load();
//   }, []);

//   return (
//     <div className="space-y-8">

//       {/* Header */}
//       <div>
//         <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
//         <p className="text-gray-500 mt-1">Overview of the MediCare platform</p>
//       </div>

//       {error && (
//         <Alert variant="destructive">
//           <AlertCircle className="h-4 w-4" />
//           <AlertDescription>{error}</AlertDescription>
//         </Alert>
//       )}

//       {/* Top stat cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
//         <StatCard label="Total Doctors"      value={stats?.totalDoctors      ?? 0} icon={Stethoscope} color="text-blue-600"   bg="bg-blue-50"   loading={loading} />
//         <StatCard label="Verified Doctors"   value={stats?.verifiedDoctors   ?? 0} icon={ShieldCheck} color="text-emerald-600" bg="bg-emerald-50" loading={loading} />
//         <StatCard label="Total Patients"     value={stats?.totalPatients     ?? 0} icon={Users}       color="text-violet-600" bg="bg-violet-50" loading={loading} />
//         <StatCard label="Total Appointments" value={stats?.totalAppointments ?? 0} icon={CalendarDays} color="text-amber-600" bg="bg-amber-50"  loading={loading} />
//       </div>

//       {/* Appointment distribution bar */}
//       {!loading && stats && <AppointmentBar stats={stats} />}

//       {/* Two breakdown cards side by side */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

//         {/* Doctors breakdown */}
//         <BreakdownCard
//           title="Doctors Overview"
//           icon={Stethoscope}
//           iconColor="text-blue-600"
//           loading={loading}
//           rows={[
//             {
//               label:      'Total Doctors',
//               value:      stats?.totalDoctors      ?? 0,
//               badge:      'All',
//               badgeColor: 'bg-gray-100 text-gray-600',
//             },
//             {
//               label:      'Verified',
//               value:      stats?.verifiedDoctors   ?? 0,
//               badge:      'Active',
//               badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
//             },
//             {
//               label:      'Unverified',
//               value:      stats?.unverifiedDoctors ?? 0,
//               badge:      'Pending review',
//               badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
//             },
//           ]}
//         />

//         {/* Patients breakdown */}
//         <BreakdownCard
//           title="Patients Overview"
//           icon={Users}
//           iconColor="text-violet-600"
//           loading={loading}
//           rows={[
//             {
//               label:      'Total Patients',
//               value:      stats?.totalPatients     ?? 0,
//               badge:      'All',
//               badgeColor: 'bg-gray-100 text-gray-600',
//             },
//             {
//               label:      'Activated',
//               value:      stats?.activatedPatients ?? 0,
//               badge:      'Active',
//               badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
//             },
//             {
//               label:      'Banned',
//               value:      stats?.bannedPatients    ?? 0,
//               badge:      'Suspended',
//               badgeColor: 'bg-red-50 text-red-700 border-red-200',
//             },
//           ]}
//         />
//       </div>

//       {/* Appointments breakdown */}
//       <BreakdownCard
//         title="Appointments by Status"
//         icon={CalendarDays}
//         iconColor="text-amber-600"
//         loading={loading}
//         rows={[
//           {
//             label:      'Pending',
//             value:      stats?.pendingAppointments   ?? 0,
//             badge:      'Awaiting confirmation',
//             badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
//           },
//           {
//             label:      'Confirmed',
//             value:      stats?.confirmedAppointments ?? 0,
//             badge:      'Upcoming',
//             badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
//           },
//           {
//             label:      'Completed',
//             value:      stats?.completedAppointments ?? 0,
//             badge:      'Done',
//             badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
//           },
//           {
//             label:      'Cancelled',
//             value:      stats?.cancelledAppointments ?? 0,
//             badge:      'Cancelled',
//             badgeColor: 'bg-red-50 text-red-700 border-red-200',
//           },
//         ]}
//       />
//     </div>
//   );
// }
// src/app/admin/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import {
  Stethoscope,
  Users,
  CalendarDays,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

// ─── Env ──────────────────────────────────────────────────────────────────────

const DB   = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const DOCS = process.env.NEXT_PUBLIC_APPWRITE_DOCTORS_COLLECTION_ID!;
const PATS = process.env.NEXT_PUBLIC_APPWRITE_PATIENTS_COLLECTION_ID!;
const APPS = process.env.NEXT_PUBLIC_APPWRITE_APPOINTMENTS_COLLECTION_ID!;

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminStats {
  totalDoctors:          number;
  verifiedDoctors:       number;
  unverifiedDoctors:     number;
  totalPatients:         number;
  activatedPatients:     number;
  bannedPatients:        number;
  totalAppointments:     number;
  pendingAppointments:   number;
  confirmedAppointments: number;
  cancelledAppointments: number;
  completedAppointments: number;
}

interface PieDataPoint {
  name:  string;
  value: number;
  color: string;
}

interface BarDataPoint {
  name:  string;
  value: number;
  color: string;
}

// ─── Stat card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label:   string;
  value:   number | undefined;
  icon:    React.ElementType;
  color:   string;
  bg:      string;
  border:  string;
  loading: boolean;
}

function StatCard({
  label, value, icon: Icon, color, bg, border, loading,
}: StatCardProps) {
  return (
    <Card className={`border ${border} shadow-sm`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">{label}</p>
            {loading ? (
              <Skeleton className="h-9 w-16 mt-2" />
            ) : (
              <p className={`text-4xl font-bold mt-1 ${color}`}>{value ?? 0}</p>
            )}
          </div>
          <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center`}>
            <Icon className={`h-7 w-7 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Custom pie tooltip ───────────────────────────────────────────────────────

interface PieTooltipProps {
  active?:  boolean;
  payload?: {
    name:    string;
    value:   number;
    payload: PieDataPoint & { percent: number };
  }[];
}

function PieTooltip({ active, payload }: PieTooltipProps) {
  if (!active || !payload?.length) return null;
  const d       = payload[0];
  const percent = d.payload.percent != null
    ? (d.payload.percent * 100).toFixed(1)
    : '0.0';

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-2.5 text-sm">
      <p className="font-semibold text-gray-800">{d.name}</p>
      <p className="text-gray-500 mt-0.5">
        {d.value} &nbsp;·&nbsp;
        <span className="font-medium text-gray-700">{percent}%</span>
      </p>
    </div>
  );
}

// ─── Custom bar tooltip ───────────────────────────────────────────────────────

interface BarTooltipProps {
  active?:  boolean;
  payload?: { value: number; fill: string }[];
  label?:   string;
  total:    number;
}

function BarTooltip({ active, payload, label, total }: BarTooltipProps) {
  if (!active || !payload?.length) return null;
  const val     = payload[0].value;
  const percent = total === 0 ? '0.0' : ((val / total) * 100).toFixed(1);
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-2.5 text-sm">
      <p className="font-semibold text-gray-800">{label}</p>
      <p className="text-gray-500 mt-0.5">
        {val} appointment{val !== 1 ? 's' : ''} &nbsp;·&nbsp;
        <span className="font-medium text-gray-700">{percent}%</span>
      </p>
    </div>
  );
}

// ─── Pie legend ───────────────────────────────────────────────────────────────

function PieLegend({ data, total }: { data: PieDataPoint[]; total: number }) {
  return (
    <div className="flex flex-col gap-2 mt-4">
      {data.map((d) => {
        const pct = total === 0 ? 0 : Math.round((d.value / total) * 100);
        return (
          <div key={d.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: d.color }}
              />
              <span className="text-gray-600">{d.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-800">{d.value}</span>
              <span className="text-gray-400 text-xs w-10 text-right">{pct}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Empty chart state ────────────────────────────────────────────────────────

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-40 text-gray-300">
      <CalendarDays className="h-10 w-10 mb-2 opacity-40" />
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}

// ─── Skeleton chart ───────────────────────────────────────────────────────────

function PieSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4 pt-2">
      <Skeleton className="w-40 h-40 rounded-full" />
      <div className="w-full space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

function BarSkeleton() {
  return (
    <div className="flex items-end justify-around h-48 gap-4 px-4 pt-4">
      {[70, 90, 55, 40].map((h, i) => (
        <Skeleton key={i} className="flex-1 rounded-t-lg" style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [stats, setStats]     = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  // ── Data fetching — completely unchanged ────────────────────────────────

  useEffect(() => {
    const load = async () => {
      try {
        const [
          doctorsTotal,
          doctorsVerified,
          patientsTotal,
          patientsActivated,
          patientsBanned,
          appsTotal,
          appsPending,
          appsConfirmed,
          appsCancelled,
          appsCompleted,
        ] = await Promise.all([
          databases.listDocuments(DB, DOCS, [Query.limit(1)]),
          databases.listDocuments(DB, DOCS, [Query.equal('isVerified', true),  Query.limit(1)]),
          databases.listDocuments(DB, PATS, [Query.limit(1)]),
          databases.listDocuments(DB, PATS, [Query.equal('isActivated', true), Query.limit(1)]),
          databases.listDocuments(DB, PATS, [Query.equal('banStatus', 'temporary'), Query.limit(1)]),
          databases.listDocuments(DB, APPS, [Query.limit(1)]),
          databases.listDocuments(DB, APPS, [Query.equal('status', 'pending'),   Query.limit(1)]),
          databases.listDocuments(DB, APPS, [Query.equal('status', 'confirmed'), Query.limit(1)]),
          databases.listDocuments(DB, APPS, [Query.equal('status', 'cancelled'), Query.limit(1)]),
          databases.listDocuments(DB, APPS, [Query.equal('status', 'completed'), Query.limit(1)]),
        ]);

        setStats({
          totalDoctors:          doctorsTotal.total,
          verifiedDoctors:       doctorsVerified.total,
          unverifiedDoctors:     doctorsTotal.total - doctorsVerified.total,
          totalPatients:         patientsTotal.total,
          activatedPatients:     patientsActivated.total,
          bannedPatients:        patientsBanned.total,
          totalAppointments:     appsTotal.total,
          pendingAppointments:   appsPending.total,
          confirmedAppointments: appsConfirmed.total,
          cancelledAppointments: appsCancelled.total,
          completedAppointments: appsCompleted.total,
        });
      } catch {
        setError('Failed to load statistics. Please refresh.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // ── Chart data ──────────────────────────────────────────────────────────

  const doctorPieData: PieDataPoint[] = stats
    ? [
        { name: 'Verified',   value: stats.verifiedDoctors,   color: '#10b981' },
        { name: 'Unverified', value: stats.unverifiedDoctors, color: '#f59e0b' },
      ].filter((d) => d.value > 0)
    : [];

  const patientPieData: PieDataPoint[] = stats
    ? [
        { name: 'Activated', value: stats.activatedPatients, color: '#3b82f6' },
        { name: 'Banned',    value: stats.bannedPatients,    color: '#ef4444' },
      ].filter((d) => d.value > 0)
    : [];

  const apptBarData: BarDataPoint[] = stats
    ? [
        { name: 'Pending',   value: stats.pendingAppointments,   color: '#f59e0b' },
        { name: 'Confirmed', value: stats.confirmedAppointments, color: '#10b981' },
        { name: 'Completed', value: stats.completedAppointments, color: '#3b82f6' },
        { name: 'Cancelled', value: stats.cancelledAppointments, color: '#ef4444' },
      ]
    : [];

  const totalAppts = stats?.totalAppointments ?? 0;

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 pb-8">

      {/* ── Header banner ── */}
      <div className="bg-gradient-to-r from-purple-800 to-purple-700 rounded-2xl px-8 py-6 shadow-lg shadow-purple-900/20 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-purple-200 mt-1">Overview of the MediCare platform</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <CalendarDays className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* ── Row 1: 4 stat cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

        <div className="bg-white rounded-2xl border border-slate-200 border-b-4 border-b-purple-400 shadow-md p-5 flex items-center justify-between hover:shadow-lg transition-shadow">
          <div>
            <Stethoscope className="h-5 w-5 text-purple-400 mb-1" />
            {loading ? <Skeleton className="h-8 w-12 mt-1" /> : <p className="text-3xl font-bold text-purple-600">{stats?.totalDoctors ?? 0}</p>}
            <p className="text-sm text-slate-500 font-medium">Total Doctors</p>
          </div>
          <div className="rounded-2xl bg-purple-50 p-3 flex-shrink-0">
            <Stethoscope className="h-6 w-6 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 border-b-4 border-b-emerald-400 shadow-md p-5 flex items-center justify-between hover:shadow-lg transition-shadow">
          <div>
            <ShieldCheck className="h-5 w-5 text-emerald-400 mb-1" />
            {loading ? <Skeleton className="h-8 w-12 mt-1" /> : <p className="text-3xl font-bold text-emerald-600">{stats?.verifiedDoctors ?? 0}</p>}
            <p className="text-sm text-slate-500 font-medium">Verified Doctors</p>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-3 flex-shrink-0">
            <ShieldCheck className="h-6 w-6 text-emerald-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 border-b-4 border-b-blue-400 shadow-md p-5 flex items-center justify-between hover:shadow-lg transition-shadow">
          <div>
            <Users className="h-5 w-5 text-blue-400 mb-1" />
            {loading ? <Skeleton className="h-8 w-12 mt-1" /> : <p className="text-3xl font-bold text-blue-600">{stats?.totalPatients ?? 0}</p>}
            <p className="text-sm text-slate-500 font-medium">Total Patients</p>
          </div>
          <div className="rounded-2xl bg-blue-50 p-3 flex-shrink-0">
            <Users className="h-6 w-6 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 border-b-4 border-b-orange-400 shadow-md p-5 flex items-center justify-between hover:shadow-lg transition-shadow">
          <div>
            <CalendarDays className="h-5 w-5 text-orange-400 mb-1" />
            {loading ? <Skeleton className="h-8 w-12 mt-1" /> : <p className="text-3xl font-bold text-orange-600">{stats?.totalAppointments ?? 0}</p>}
            <p className="text-sm text-slate-500 font-medium">Total Appointments</p>
          </div>
          <div className="rounded-2xl bg-orange-50 p-3 flex-shrink-0">
            <CalendarDays className="h-6 w-6 text-orange-500" />
          </div>
        </div>

      </div>

      {/* ── Row 2: two pie charts ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Doctor verification pie */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-6 rounded-full bg-emerald-500 flex-shrink-0" />
            <p className="text-base font-bold text-slate-800">Doctor Verification Status</p>
          </div>
          <p className="text-sm text-slate-500 mb-4">Verified vs unverified doctor accounts</p>
            {loading ? (
              <PieSkeleton />
            ) : doctorPieData.length === 0 ? (
              <EmptyChart message="No doctor data yet" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={doctorPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {doctorPieData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={entry.color}
                          stroke="white"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <PieLegend data={doctorPieData} total={stats?.totalDoctors ?? 0} />
              </>
            )}
          </div>

        {/* Patient status pie */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-6 rounded-full bg-blue-500 flex-shrink-0" />
            <p className="text-base font-bold text-slate-800">Patient Status</p>
          </div>
          <p className="text-sm text-slate-500 mb-4">Activated vs banned patient accounts</p>
            {loading ? (
              <PieSkeleton />
            ) : patientPieData.length === 0 ? (
              <EmptyChart message="No patient data yet" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={patientPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {patientPieData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={entry.color}
                          stroke="white"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <PieLegend data={patientPieData} total={stats?.totalPatients ?? 0} />
              </>
            )}
          </div>
      </div>

      {/* ── Row 3: full-width bar chart ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1 h-6 rounded-full bg-orange-400 flex-shrink-0" />
          <p className="text-base font-bold text-slate-800">Appointments by Status</p>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Breakdown of all {totalAppts} appointment{totalAppts !== 1 ? 's' : ''} across the platform
        </p>
          {loading ? (
            <BarSkeleton />
          ) : totalAppts === 0 ? (
            <EmptyChart message="No appointment data yet" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={apptBarData}
                margin={{ top: 8, right: 16, left: -16, bottom: 0 }}
                barCategoryGap="35%"
              >
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  allowDecimals={false}
                />
                <Tooltip
                  content={<BarTooltip total={totalAppts} />}
                  cursor={{ fill: 'rgba(0,0,0,0.04)', radius: 6 }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {apptBarData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
    </div>
  );
}