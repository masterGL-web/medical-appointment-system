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
// import { Card, CardContent } from '@/components/ui/card';
// import { Skeleton } from '@/components/ui/skeleton';
// import { Button } from '@/components/ui/button';
// import {
//   AlertCircle,
//   RefreshCw,
//   Calendar,
//   CheckCircle,
//   XCircle,
//   Clock,
//   UserX,
//   TrendingUp,
// } from 'lucide-react';

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

// // ─── Stat card ────────────────────────────────────────────────────────────────

// interface StatCardProps {
//   label:   string;
//   value:   number;
//   icon:    React.ElementType;
//   color:   string;
//   bg:      string;
//   border:  string;
//   loading: boolean;
// }

// function StatCard({ label, value, icon: Icon, color, bg, border, loading }: StatCardProps) {
//   return (
//     <Card className={`border shadow-sm ${border}`}>
//       <CardContent className="p-5">
//         <div className="flex items-center justify-between">
//           <div>
//             <p className="text-sm text-gray-500 font-medium">{label}</p>
//             {loading ? (
//               <Skeleton className="h-8 w-16 mt-2" />
//             ) : (
//               <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
//             )}
//           </div>
//           <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
//             <Icon className={`h-6 w-6 ${color}`} />
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// // ─── No-show rate bar ─────────────────────────────────────────────────────────

// function NoShowRateBar({ noShow, total }: { noShow: number; total: number }) {
//   const rate = total === 0 ? 0 : Math.round((noShow / total) * 100);
//   const color = rate === 0 ? 'bg-emerald-500' : rate < 20 ? 'bg-amber-500' : 'bg-red-500';
//   const textColor = rate === 0 ? 'text-emerald-600' : rate < 20 ? 'text-amber-600' : 'text-red-600';

//   return (
//     <Card className="border-gray-200 shadow-sm">
//       <CardContent className="p-5">
//         <div className="flex items-center justify-between mb-3">
//           <div className="flex items-center gap-2">
//             <TrendingUp className="h-4 w-4 text-gray-500" />
//             <p className="text-sm font-medium text-gray-700">No-Show Rate</p>
//           </div>
//           <span className={`text-lg font-bold ${textColor}`}>{rate}%</span>
//         </div>
//         <div className="w-full bg-gray-100 rounded-full h-2.5">
//           <div
//             className={`h-2.5 rounded-full transition-all duration-500 ${color}`}
//             style={{ width: `${rate}%` }}
//           />
//         </div>
//         <p className="text-xs text-gray-400 mt-2">
//           {noShow} no-show{noShow !== 1 ? 's' : ''} out of {total} total appointment{total !== 1 ? 's' : ''}
//         </p>
//       </CardContent>
//     </Card>
//   );
// }

// // ─── Appointment breakdown bar ────────────────────────────────────────────────

// function AppointmentBreakdown({ stats }: { stats: AppointmentStats }) {
//   const total = stats.total;
//   if (total === 0) return null;

//   const segments = [
//     { label: 'Confirmed', value: stats.confirmed, color: 'bg-emerald-500' },
//     { label: 'Completed', value: stats.completed, color: 'bg-blue-500'    },
//     { label: 'Pending',   value: stats.pending,   color: 'bg-amber-400'   },
//     { label: 'Cancelled', value: stats.cancelled, color: 'bg-red-400'     },
//     { label: 'No-Show',   value: stats.noShow,    color: 'bg-orange-500'  },
//   ];

//   return (
//     <Card className="border-gray-200 shadow-sm">
//       <CardContent className="p-5">
//         <p className="text-sm font-semibold text-gray-700 mb-3">Appointment Breakdown</p>

//         {/* Stacked bar */}
//         <div className="flex w-full h-3 rounded-full overflow-hidden gap-0.5">
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
//         <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
//           {segments.map((s) => (
//             <div key={s.label} className="flex items-center gap-1.5 text-xs text-gray-600">
//               <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
//               <span>{s.label} ({s.value})</span>
//             </div>
//           ))}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// // ─── Main page ────────────────────────────────────────────────────────────────

// export default function DoctorDashboardPage() {
//   const { doctor } = useAuth('doctor');

//   const [stats, setStats]               = useState<AppointmentStats | null>(null);
//   const [todayAppts, setTodayAppts]     = useState<AppointmentWithPatient[]>([]);
//   const [loading, setLoading]           = useState(true);
//   const [error, setError]               = useState<string | null>(null);
//   const [refreshing, setRefreshing]     = useState(false);

//   const load = async (silent = false) => {
//     if (!doctor) return;
//     if (!silent) setLoading(true);
//     else setRefreshing(true);
//     setError(null);

//     try {
//       // ── Fetch ALL appointments for this doctor (not just upcoming) ──────────
//       // We use Appwrite directly to get totals by status
//       const [
//         totalRes,
//         confirmedRes,
//         cancelledRes,
//         completedRes,
//         pendingRes,
//       ] = await Promise.all([
//         databases.listDocuments(DB, APPS, [
//           Query.equal('doctorId', doctor.$id),
//           Query.limit(1),
//         ]),
//         databases.listDocuments(DB, APPS, [
//           Query.equal('doctorId', doctor.$id),
//           Query.equal('status', 'confirmed'),
//           Query.limit(1),
//         ]),
//         databases.listDocuments(DB, APPS, [
//           Query.equal('doctorId', doctor.$id),
//           Query.equal('status', 'cancelled'),
//           Query.limit(1),
//         ]),
//         databases.listDocuments(DB, APPS, [
//           Query.equal('doctorId', doctor.$id),
//           Query.equal('status', 'completed'),
//           Query.limit(1),
//         ]),
//         databases.listDocuments(DB, APPS, [
//           Query.equal('doctorId', doctor.$id),
//           Query.equal('status', 'pending'),
//           Query.limit(1),
//         ]),
//       ]);

//       // ── No-show count: cancelled by doctor with reason "no-show" ───────────
//       const noShowRes = await databases.listDocuments(DB, APPS, [
//         Query.equal('doctorId',   doctor.$id),
//         Query.equal('status',     'cancelled'),
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

//       // ── Today's appointments with patient data ─────────────────────────────
//       const todayData = await appointmentService.getUpcomingAppointmentsWithPatient(doctor.$id);
//       const todayStr  = new Date().toISOString().split('T')[0];
//       const todayOnly = todayData.filter(
//         (a) => a.date.split('T')[0] === todayStr && a.status !== 'cancelled'
//       );
//       setTodayAppts(todayOnly);

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

//   // Greeting by time of day
//   const greeting = useMemo(() => {
//     const h = new Date().getHours();
//     if (h < 12) return 'Good morning';
//     if (h < 18) return 'Good afternoon';
//     return 'Good evening';
//   }, []);

//   const STAT_CARDS: StatCardProps[] = stats
//     ? [
//         {
//           label:   'Total Appointments',
//           value:   stats.total,
//           icon:    Calendar,
//           color:   'text-blue-600',
//           bg:      'bg-blue-50',
//           border:  'border-blue-100',
//           loading: false,
//         },
//         {
//           label:   'Confirmed',
//           value:   stats.confirmed,
//           icon:    CheckCircle,
//           color:   'text-emerald-600',
//           bg:      'bg-emerald-50',
//           border:  'border-emerald-100',
//           loading: false,
//         },
//         {
//           label:   'Completed',
//           value:   stats.completed,
//           icon:    CheckCircle,
//           color:   'text-indigo-600',
//           bg:      'bg-indigo-50',
//           border:  'border-indigo-100',
//           loading: false,
//         },
//         {
//           label:   'Pending',
//           value:   stats.pending,
//           icon:    Clock,
//           color:   'text-amber-600',
//           bg:      'bg-amber-50',
//           border:  'border-amber-100',
//           loading: false,
//         },
//         {
//           label:   'Cancelled',
//           value:   stats.cancelled,
//           icon:    XCircle,
//           color:   'text-red-600',
//           bg:      'bg-red-50',
//           border:  'border-red-100',
//           loading: false,
//         },
//         {
//           label:   'No-Shows',
//           value:   stats.noShow,
//           icon:    UserX,
//           color:   'text-orange-600',
//           bg:      'bg-orange-50',
//           border:  'border-orange-100',
//           loading: false,
//         },
//       ]
//     : [];

//   // ── Render ─────────────────────────────────────────────────────────────────

//   return (
//     <div className="space-y-8 pb-8">

//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">
//             {greeting}, Dr. {doctor?.lastName}
//           </h1>
//           <p className="text-gray-500 mt-1">
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

//       {/* 6 stat cards */}
//       <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
//         {loading
//           ? Array.from({ length: 6 }).map((_, i) => (
//               <Card key={i} className="border-gray-200 shadow-sm">
//                 <CardContent className="p-5">
//                   <Skeleton className="h-4 w-24 mb-3" />
//                   <Skeleton className="h-8 w-12" />
//                 </CardContent>
//               </Card>
//             ))
//           : STAT_CARDS.map((card) => (
//               <StatCard key={card.label} {...card} />
//             ))}
//       </div>

//       {/* Second row: no-show rate + breakdown */}
//       {!loading && stats && stats.total > 0 && (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <NoShowRateBar noShow={stats.noShow} total={stats.total} />
//           <AppointmentBreakdown stats={stats} />
//         </div>
//       )}

//       {/* Today's schedule */}
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

// ─── Stat card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label:   string;
  value:   number;
  styleKey: keyof typeof STAT_COLORS;
  loading: boolean;
}

function StatCard({ label, value, styleKey, loading }: StatCardProps) {
  const s    = STAT_COLORS[styleKey];
  const Icon = s.icon;

  return (
    <Card className={`border ${s.border} shadow-sm`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {loading ? (
              <>
                <Skeleton className="h-8 w-12 mb-2" />
                <Skeleton className="h-3 w-20" />
              </>
            ) : (
              <>
                <p className={`text-3xl font-bold ${s.text}`}>{value}</p>
                <p className="text-xs text-gray-500 mt-1 font-medium">{label}</p>
              </>
            )}
          </div>
          <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`h-5 w-5 ${s.text}`} />
          </div>
        </div>
      </CardContent>
    </Card>
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

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting}, Dr. {doctor?.lastName}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Here&apos;s what&apos;s happening with your practice
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={refreshing || loading}
          onClick={handleRefresh}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
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
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-2 border-b bg-gray-50/50">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
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
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-2 border-b bg-gray-50/50">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
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
        <TodaySchedule appointments={todayAppts} onUpdate={handleRefresh} />
      </div>
    </div>
  );
}