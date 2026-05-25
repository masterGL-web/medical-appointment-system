// // src/app/doctor/dashboard/page.tsx
// 'use client';

// import { useEffect, useState, useMemo } from 'react';
// import { useAuth } from '@/lib/hooks/useAuth';
// import { databases } from '@/lib/appwrite';
// import { Query } from 'appwrite';
// import { TodaySchedule } from '@/components/doctor/TodaySchedule';
// import { appointmentService } from '@/services/appointment.service';
// import { AppointmentWithPatient } from '@/types/appointment.types';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Skeleton } from '@/components/ui/skeleton';
// import { Button } from '@/components/ui/button';
// import {
//   PieChart,
//   Pie,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Cell,
//   ResponsiveContainer,
// } from 'recharts';
// import {
//   AlertCircle,
//   RefreshCw,
//   Calendar,
//   CheckCircle,
//   XCircle,
//   Clock,
//   UserX,
//   Activity,
// } from 'lucide-react';

// // ─── Env ──────────────────────────────────────────────────────────────────────

// const DB   = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
// const APPS = process.env.NEXT_PUBLIC_APPWRITE_APPOINTMENTS_COLLECTION_ID!;

// // ─── Types ────────────────────────────────────────────────────────────────────

// interface AppointmentStats {
//   total:     number;
//   confirmed: number;
//   cancelled: number;
//   completed: number;
//   pending:   number;
//   noShow:    number;
// }

// interface ChartDataPoint {
//   name:  string;
//   value: number;
//   color: string;
// }

// // ─── Constants ────────────────────────────────────────────────────────────────

// const STAT_COLORS = {
//   total:     { text: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-100',    icon: Calendar    },
//   confirmed: { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: CheckCircle },
//   completed: { text: 'text-indigo-600',  bg: 'bg-indigo-50',  border: 'border-indigo-100',  icon: Activity    },
//   pending:   { text: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-100',   icon: Clock       },
//   cancelled: { text: 'text-red-600',     bg: 'bg-red-50',     border: 'border-red-100',     icon: XCircle     },
//   noShow:    { text: 'text-orange-600',  bg: 'bg-orange-50',  border: 'border-orange-100',  icon: UserX       },
// } as const;

// const CHART_COLORS: Record<string, string> = {
//   Confirmed: '#10b981',
//   Completed: '#6366f1',
//   Pending:   '#f59e0b',
//   Cancelled: '#ef4444',
//   'No-Show': '#f97316',
// };

// // ─── Stat card ────────────────────────────────────────────────────────────────

// interface StatCardProps {
//   label:   string;
//   value:   number;
//   styleKey: keyof typeof STAT_COLORS;
//   loading: boolean;
// }

// function StatCard({ label, value, styleKey, loading }: StatCardProps) {
//   const s    = STAT_COLORS[styleKey];
//   const Icon = s.icon;

//   return (
//     <Card className={`border ${s.border} shadow-sm`}>
//       <CardContent className="p-4">
//         <div className="flex items-start justify-between gap-3">
//           <div className="min-w-0">
//             {loading ? (
//               <>
//                 <Skeleton className="h-8 w-12 mb-2" />
//                 <Skeleton className="h-3 w-20" />
//               </>
//             ) : (
//               <>
//                 <p className={`text-3xl font-bold ${s.text}`}>{value}</p>
//                 <p className="text-xs text-gray-500 mt-1 font-medium">{label}</p>
//               </>
//             )}
//           </div>
//           <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
//             <Icon className={`h-5 w-5 ${s.text}`} />
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// // ─── Custom pie tooltip ───────────────────────────────────────────────────────

// interface PieTooltipProps {
//   active?:  boolean;
//   payload?: { name: string; value: number; payload: ChartDataPoint }[];
// }

// function PieTooltip({ active, payload }: PieTooltipProps) {
//   if (!active || !payload?.length) return null;
//   const d = payload[0];
//   return (
//     <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm">
//       <p className="font-semibold text-gray-800">{d.name}</p>
//       <p className="text-gray-600">{d.value} appointment{d.value !== 1 ? 's' : ''}</p>
//     </div>
//   );
// }

// // ─── Custom bar tooltip ───────────────────────────────────────────────────────

// interface BarTooltipProps {
//   active?:  boolean;
//   payload?: { value: number; fill: string }[];
//   label?:   string;
// }

// function BarTooltip({ active, payload, label }: BarTooltipProps) {
//   if (!active || !payload?.length) return null;
//   return (
//     <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm">
//       <p className="font-semibold text-gray-800">{label}</p>
//       <p className="text-gray-600">{payload[0].value} appointment{payload[0].value !== 1 ? 's' : ''}</p>
//     </div>
//   );
// }

// // ─── Custom pie legend ────────────────────────────────────────────────────────

// function PieLegend({ data }: { data: ChartDataPoint[] }) {
//   return (
//     <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
//       {data.map((entry) => (
//         <div key={entry.name} className="flex items-center gap-1.5 text-xs text-gray-600">
//           <div
//             className="w-2.5 h-2.5 rounded-full flex-shrink-0"
//             style={{ backgroundColor: entry.color }}
//           />
//           <span>{entry.name}</span>
//           <span className="font-semibold text-gray-800">({entry.value})</span>
//         </div>
//       ))}
//     </div>
//   );
// }

// // ─── Empty chart state ────────────────────────────────────────────────────────

// function EmptyChart({ message }: { message: string }) {
//   return (
//     <div className="flex flex-col items-center justify-center h-48 text-gray-400">
//       <Calendar className="h-10 w-10 mb-2 opacity-30" />
//       <p className="text-sm">{message}</p>
//     </div>
//   );
// }

// // ─── Main page ────────────────────────────────────────────────────────────────

// export default function DoctorDashboardPage() {
//   const { doctor } = useAuth('doctor');

//   const [stats, setStats]           = useState<AppointmentStats | null>(null);
//   const [todayAppts, setTodayAppts] = useState<AppointmentWithPatient[]>([]);
//   const [loading, setLoading]       = useState(true);
//   const [error, setError]           = useState<string | null>(null);
//   const [refreshing, setRefreshing] = useState(false);

//   // ── Data fetching — unchanged from original ──────────────────────────────

//   const load = async (silent = false) => {
//     if (!doctor) return;
//     if (!silent) setLoading(true);
//     else setRefreshing(true);
//     setError(null);

//     try {
//       const [
//         totalRes,
//         confirmedRes,
//         cancelledRes,
//         completedRes,
//         pendingRes,
//       ] = await Promise.all([
//         databases.listDocuments(DB, APPS, [Query.equal('doctorId', doctor.$id), Query.limit(1)]),
//         databases.listDocuments(DB, APPS, [Query.equal('doctorId', doctor.$id), Query.equal('status', 'confirmed'), Query.limit(1)]),
//         databases.listDocuments(DB, APPS, [Query.equal('doctorId', doctor.$id), Query.equal('status', 'cancelled'), Query.limit(1)]),
//         databases.listDocuments(DB, APPS, [Query.equal('doctorId', doctor.$id), Query.equal('status', 'completed'), Query.limit(1)]),
//         databases.listDocuments(DB, APPS, [Query.equal('doctorId', doctor.$id), Query.equal('status', 'pending'),   Query.limit(1)]),
//       ]);

//       const noShowRes = await databases.listDocuments(DB, APPS, [
//         Query.equal('doctorId',    doctor.$id),
//         Query.equal('status',      'cancelled'),
//         Query.equal('cancelledBy', 'doctor'),
//         Query.limit(100),
//       ]);

//       const noShowCount = noShowRes.documents.filter((doc) => {
//         const reason = (doc.cancelReason as string | null) ?? '';
//         return reason.toLowerCase().includes('no-show');
//       }).length;

//       setStats({
//         total:     totalRes.total,
//         confirmed: confirmedRes.total,
//         cancelled: cancelledRes.total,
//         completed: completedRes.total,
//         pending:   pendingRes.total,
//         noShow:    noShowCount,
//       });

//       const todayData = await appointmentService.getUpcomingAppointmentsWithPatient(doctor.$id);
//       const todayStr  = new Date().toISOString().split('T')[0];
//       setTodayAppts(
//         todayData.filter((a) => a.date.split('T')[0] === todayStr && a.status !== 'cancelled')
//       );
//     } catch {
//       setError('Failed to load dashboard. Please try again.');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     if (doctor) load();
//   }, [doctor]); // eslint-disable-line react-hooks/exhaustive-deps

//   const handleRefresh = () => load(true);

//   // ── Chart data ─────────────────────────────────────────────────────────

//   const chartData = useMemo<ChartDataPoint[]>(() => {
//     if (!stats) return [];
//     return [
//       { name: 'Confirmed', value: stats.confirmed, color: CHART_COLORS['Confirmed'] },
//       { name: 'Completed', value: stats.completed, color: CHART_COLORS['Completed'] },
//       { name: 'Pending',   value: stats.pending,   color: CHART_COLORS['Pending']   },
//       { name: 'Cancelled', value: stats.cancelled, color: CHART_COLORS['Cancelled'] },
//       { name: 'No-Show',   value: stats.noShow,    color: CHART_COLORS['No-Show']   },
//     ].filter((d) => d.value > 0);
//   }, [stats]);

//   const hasChartData = chartData.some((d) => d.value > 0);

//   // ── Greeting ────────────────────────────────────────────────────────────

//   const greeting = useMemo(() => {
//     const h = new Date().getHours();
//     if (h < 12) return 'Good morning';
//     if (h < 18) return 'Good afternoon';
//     return 'Good evening';
//   }, []);

//   // ── Render ──────────────────────────────────────────────────────────────

//   return (
//     <div className="space-y-6 pb-8">

//       {/* ── Header ── */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">
//             {greeting}, Dr. {doctor?.lastName}
//           </h1>
//           <p className="text-sm text-gray-500 mt-0.5">
//             Here&apos;s what&apos;s happening with your practice
//           </p>
//         </div>
//         <Button
//           variant="outline"
//           size="sm"
//           disabled={refreshing || loading}
//           onClick={handleRefresh}
//         >
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

//       {/* ── Row 1: 6 Stat cards ── */}
//       <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
//         <StatCard label="Total"     value={stats?.total     ?? 0} styleKey="total"     loading={loading} />
//         <StatCard label="Confirmed" value={stats?.confirmed ?? 0} styleKey="confirmed" loading={loading} />
//         <StatCard label="Completed" value={stats?.completed ?? 0} styleKey="completed" loading={loading} />
//         <StatCard label="Pending"   value={stats?.pending   ?? 0} styleKey="pending"   loading={loading} />
//         <StatCard label="Cancelled" value={stats?.cancelled ?? 0} styleKey="cancelled" loading={loading} />
//         <StatCard label="No-Shows"  value={stats?.noShow    ?? 0} styleKey="noShow"    loading={loading} />
//       </div>

//       {/* ── Row 2: Charts side by side ── */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

//         {/* Pie chart */}
//         <Card className="border-gray-200 shadow-sm">
//           <CardHeader className="pb-2 border-b bg-gray-50/50">
//             <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
//               <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
//               Appointment Distribution
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="pt-4">
//             {loading ? (
//               <div className="flex items-center justify-center h-48">
//                 <Skeleton className="h-40 w-40 rounded-full" />
//               </div>
//             ) : !hasChartData ? (
//               <EmptyChart message="No appointment data yet" />
//             ) : (
//               <>
//                 <ResponsiveContainer width="100%" height={200}>
//                   <PieChart>
//                     <Pie
//                       data={chartData}
//                       cx="50%"
//                       cy="50%"
//                       innerRadius={55}
//                       outerRadius={85}
//                       paddingAngle={3}
//                       dataKey="value"
//                     >
//                       {chartData.map((entry) => (
//                         <Cell
//                           key={entry.name}
//                           fill={entry.color}
//                           stroke="white"
//                           strokeWidth={2}
//                         />
//                       ))}
//                     </Pie>
//                     <Tooltip content={<PieTooltip />} />
//                   </PieChart>
//                 </ResponsiveContainer>
//                 <PieLegend data={chartData} />
//               </>
//             )}
//           </CardContent>
//         </Card>

//         {/* Bar chart */}
//         <Card className="border-gray-200 shadow-sm">
//           <CardHeader className="pb-2 border-b bg-gray-50/50">
//             <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
//               <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
//               Appointment Status Overview
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="pt-4">
//             {loading ? (
//               <div className="flex items-end justify-around h-48 gap-3 px-4">
//                 {[60, 90, 45, 75, 30].map((h, i) => (
//                   <Skeleton key={i} className="flex-1 rounded-t-lg" style={{ height: `${h}%` }} />
//                 ))}
//               </div>
//             ) : !hasChartData ? (
//               <EmptyChart message="No appointment data yet" />
//             ) : (
//               <ResponsiveContainer width="100%" height={240}>
//                 <BarChart
//                   data={chartData}
//                   margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
//                   barCategoryGap="30%"
//                 >
//                   <XAxis
//                     dataKey="name"
//                     axisLine={false}
//                     tickLine={false}
//                     tick={{ fontSize: 11, fill: '#6b7280' }}
//                   />
//                   <YAxis
//                     axisLine={false}
//                     tickLine={false}
//                     tick={{ fontSize: 11, fill: '#6b7280' }}
//                     allowDecimals={false}
//                   />
//                   <Tooltip
//                     content={<BarTooltip />}
//                     cursor={{ fill: 'rgba(0,0,0,0.04)', radius: 6 }}
//                   />
//                   <Bar dataKey="value" radius={[6, 6, 0, 0]}>
//                     {chartData.map((entry) => (
//                       <Cell key={entry.name} fill={entry.color} />
//                     ))}
//                   </Bar>
//                 </BarChart>
//               </ResponsiveContainer>
//             )}
//           </CardContent>
//         </Card>
//       </div>

//       {/* ── Row 3: Today's schedule ── */}
//       <div className="max-w-4xl">
//         <TodaySchedule appointments={todayAppts} onUpdate={handleRefresh} />
//       </div>
//     </div>
//   );
// }

// src/app/doctor/dashboard/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { TodaySchedule } from '@/components/doctor/TodaySchedule';
import { appointmentService } from '@/services/appointment.service';
import { AppointmentWithPatient } from '@/types/appointment.types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
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
  AlertCircle,
  RefreshCw,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  UserX,
  Activity,
} from 'lucide-react';

// ─── Env ──────────────────────────────────────────────────────────────────────

const DB   = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const APPS = process.env.NEXT_PUBLIC_APPWRITE_APPOINTMENTS_COLLECTION_ID!;

// ─── Types ────────────────────────────────────────────────────────────────────

interface AppointmentStats {
  total:     number;
  confirmed: number;
  cancelled: number;
  completed: number;
  pending:   number;
  noShow:    number;
}

interface ChartDataPoint {
  name:  string;
  value: number;
  color: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STAT_COLORS = {
  total:     { text: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-100',    icon: Calendar    },
  confirmed: { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: CheckCircle },
  completed: { text: 'text-indigo-600',  bg: 'bg-indigo-50',  border: 'border-indigo-100',  icon: Activity    },
  pending:   { text: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-100',   icon: Clock       },
  cancelled: { text: 'text-red-600',     bg: 'bg-red-50',     border: 'border-red-100',     icon: XCircle     },
  noShow:    { text: 'text-orange-600',  bg: 'bg-orange-50',  border: 'border-orange-100',  icon: UserX       },
} as const;

const CHART_COLORS: Record<string, string> = {
  Confirmed: '#10b981',
  Completed: '#6366f1',
  Pending:   '#f59e0b',
  Cancelled: '#ef4444',
  'No-Show': '#f97316',
};

const STAT_BOTTOM: Record<keyof typeof STAT_COLORS, string> = {
  total:     'border-b-blue-400',
  confirmed: 'border-b-emerald-400',
  completed: 'border-b-violet-400',
  pending:   'border-b-amber-400',
  cancelled: 'border-b-red-400',
  noShow:    'border-b-orange-400',
};

// ─── Stat card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label:    string;
  value:    number;
  styleKey: keyof typeof STAT_COLORS;
  loading:  boolean;
}

function StatCard({ label, value, styleKey, loading }: StatCardProps) {
  const s    = STAT_COLORS[styleKey];
  const Icon = s.icon;

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 border-b-4 ${STAT_BOTTOM[styleKey]} shadow-md p-5 flex items-center justify-between hover:shadow-lg transition-shadow`}>
      <div className="min-w-0">
        {loading ? (
          <>
            <Skeleton className="h-8 w-12 mb-2" />
            <Skeleton className="h-3 w-20" />
          </>
        ) : (
          <>
            <p className={`text-3xl font-bold ${s.text}`}>{value}</p>
            <p className="text-sm text-slate-500 font-medium mt-0.5">{label}</p>
          </>
        )}
      </div>
      <div className={`rounded-2xl p-3 ${s.bg} flex-shrink-0`}>
        <Icon className={`h-6 w-6 ${s.text}`} />
      </div>
    </div>
  );
}

// ─── Custom pie tooltip ───────────────────────────────────────────────────────

interface PieTooltipProps {
  active?:  boolean;
  payload?: { name: string; value: number; payload: ChartDataPoint }[];
}

function PieTooltip({ active, payload }: PieTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="font-semibold text-gray-800">{d.name}</p>
      <p className="text-gray-600">{d.value} appointment{d.value !== 1 ? 's' : ''}</p>
    </div>
  );
}

// ─── Custom bar tooltip ───────────────────────────────────────────────────────

interface BarTooltipProps {
  active?:  boolean;
  payload?: { value: number; fill: string }[];
  label?:   string;
}

function BarTooltip({ active, payload, label }: BarTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="font-semibold text-gray-800">{label}</p>
      <p className="text-gray-600">{payload[0].value} appointment{payload[0].value !== 1 ? 's' : ''}</p>
    </div>
  );
}

// ─── Custom pie legend ────────────────────────────────────────────────────────

function PieLegend({ data }: { data: ChartDataPoint[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
      {data.map((entry) => (
        <div key={entry.name} className="flex items-center gap-1.5 text-xs text-gray-600">
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span>{entry.name}</span>
          <span className="font-semibold text-gray-800">({entry.value})</span>
        </div>
      ))}
    </div>
  );
}

// ─── Empty chart state ────────────────────────────────────────────────────────

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
      <Calendar className="h-10 w-10 mb-2 opacity-30" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DoctorDashboardPage() {
  const { doctor } = useAuth('doctor');

  const [stats, setStats]           = useState<AppointmentStats | null>(null);
  const [todayAppts, setTodayAppts] = useState<AppointmentWithPatient[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // ── Data fetching — unchanged from original ──────────────────────────────

  const load = async (silent = false) => {
    if (!doctor) return;
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const [
        totalRes,
        confirmedRes,
        cancelledRes,
        completedRes,
        pendingRes,
      ] = await Promise.all([
        databases.listDocuments(DB, APPS, [Query.equal('doctorId', doctor.$id), Query.limit(1)]),
        databases.listDocuments(DB, APPS, [Query.equal('doctorId', doctor.$id), Query.equal('status', 'confirmed'), Query.limit(1)]),
        databases.listDocuments(DB, APPS, [Query.equal('doctorId', doctor.$id), Query.equal('status', 'cancelled'), Query.limit(1)]),
        databases.listDocuments(DB, APPS, [Query.equal('doctorId', doctor.$id), Query.equal('status', 'completed'), Query.limit(1)]),
        databases.listDocuments(DB, APPS, [Query.equal('doctorId', doctor.$id), Query.equal('status', 'pending'),   Query.limit(1)]),
      ]);

      const noShowRes = await databases.listDocuments(DB, APPS, [
        Query.equal('doctorId',    doctor.$id),
        Query.equal('status',      'cancelled'),
        Query.equal('cancelledBy', 'doctor'),
        Query.limit(100),
      ]);

      const noShowCount = noShowRes.documents.filter((doc) => {
        const reason = (doc.cancelReason as string | null) ?? '';
        return reason.toLowerCase().includes('no-show');
      }).length;

      setStats({
        total:     totalRes.total,
        confirmed: confirmedRes.total,
        cancelled: cancelledRes.total,
        completed: completedRes.total,
        pending:   pendingRes.total,
        noShow:    noShowCount,
      });

      const todayData = await appointmentService.getUpcomingAppointmentsWithPatient(doctor.$id);
      const todayStr  = new Date().toISOString().split('T')[0];
      setTodayAppts(
        todayData.filter((a) => a.date.split('T')[0] === todayStr && a.status !== 'cancelled')
      );
    } catch {
      setError('Failed to load dashboard. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (doctor) load();
  }, [doctor]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = () => load(true);

  // ── Chart data ─────────────────────────────────────────────────────────

  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (!stats) return [];
    return [
      { name: 'Confirmed', value: stats.confirmed, color: CHART_COLORS['Confirmed'] },
      { name: 'Completed', value: stats.completed, color: CHART_COLORS['Completed'] },
      { name: 'Pending',   value: stats.pending,   color: CHART_COLORS['Pending']   },
      { name: 'Cancelled', value: stats.cancelled, color: CHART_COLORS['Cancelled'] },
      { name: 'No-Show',   value: stats.noShow,    color: CHART_COLORS['No-Show']   },
    ].filter((d) => d.value > 0);
  }, [stats]);

  const hasChartData = chartData.some((d) => d.value > 0);

  // ── Greeting ────────────────────────────────────────────────────────────

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 pb-8">

      {/* ── Header banner ── */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl px-8 py-6 shadow-lg flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {greeting}, Dr. {doctor?.lastName}
          </h1>
          <p className="text-slate-300 mt-1">
            Here&apos;s what&apos;s happening with your practice
          </p>
        </div>
        <button
          disabled={refreshing || loading}
          onClick={handleRefresh}
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

      {/* ── Row 1: 6 Stat cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard label="Total"     value={stats?.total     ?? 0} styleKey="total"     loading={loading} />
        <StatCard label="Confirmed" value={stats?.confirmed ?? 0} styleKey="confirmed" loading={loading} />
        <StatCard label="Completed" value={stats?.completed ?? 0} styleKey="completed" loading={loading} />
        <StatCard label="Pending"   value={stats?.pending   ?? 0} styleKey="pending"   loading={loading} />
        <StatCard label="Cancelled" value={stats?.cancelled ?? 0} styleKey="cancelled" loading={loading} />
        <StatCard label="No-Shows"  value={stats?.noShow    ?? 0} styleKey="noShow"    loading={loading} />
      </div>

      {/* ── Row 2: Charts side by side ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Pie chart */}
        <Card className="bg-white rounded-2xl border border-slate-200 shadow-md hover:shadow-lg transition-shadow overflow-hidden">
          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
              <div className="w-1 h-6 rounded-full bg-teal-500 flex-shrink-0" />
              Appointment Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <Skeleton className="h-40 w-40 rounded-full" />
              </div>
            ) : !hasChartData ? (
              <EmptyChart message="No appointment data yet" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {chartData.map((entry) => (
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
                <PieLegend data={chartData} />
              </>
            )}
          </CardContent>
        </Card>

        {/* Bar chart */}
        <Card className="bg-white rounded-2xl border border-slate-200 shadow-md hover:shadow-lg transition-shadow overflow-hidden">
          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
              <div className="w-1 h-6 rounded-full bg-emerald-500 flex-shrink-0" />
              Appointment Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {loading ? (
              <div className="flex items-end justify-around h-48 gap-3 px-4">
                {[60, 90, 45, 75, 30].map((h, i) => (
                  <Skeleton key={i} className="flex-1 rounded-t-lg" style={{ height: `${h}%` }} />
                ))}
              </div>
            ) : !hasChartData ? (
              <EmptyChart message="No appointment data yet" />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={chartData}
                  margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                  barCategoryGap="30%"
                >
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={<BarTooltip />}
                    cursor={{ fill: 'rgba(0,0,0,0.04)', radius: 6 }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Row 3: Today's schedule ── */}
      <div className="max-w-4xl">
        <TodaySchedule
          appointments={todayAppts}
          doctorName={doctor ? `${doctor.firstName} ${doctor.lastName}` : ''}
          onUpdate={handleRefresh}
        />
      </div>
    </div>
  );
}