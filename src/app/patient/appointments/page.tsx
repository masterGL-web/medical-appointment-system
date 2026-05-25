// // src/app/patient/appointments/page.tsx
// 'use client';

// import { useEffect, useState, useMemo } from 'react';
// import { useAuth } from '@/lib/hooks/useAuth';
// import { appointmentService } from '@/services/appointment.service';
// import { AppointmentWithDoctor, AppointmentStatus } from '@/types/appointment.types';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { Skeleton } from '@/components/ui/skeleton';
// import { Alert, AlertDescription } from '@/components/ui/alert';
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
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import {
//   Calendar,
//   Clock,
//   MapPin,
//   Stethoscope,
//   AlertCircle,
//   RefreshCw,
//   CheckCircle,
//   XCircle,
//   Timer,
// } from 'lucide-react';
// import { toast } from 'sonner';
// import { motion } from 'framer-motion';

// // ─── Status config ─────────────────────────────────────────────────────────────

// const STATUS_CONFIG: Record<
//   AppointmentStatus,
//   { label: string; className: string; icon: React.ElementType }
// > = {
//   pending: {
//     label:     'Pending',
//     className: 'bg-amber-50 text-amber-700 border-amber-200',
//     icon:      Timer,
//   },
//   confirmed: {
//     label:     'Confirmed',
//     className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
//     icon:      CheckCircle,
//   },
//   cancelled: {
//     label:     'Cancelled',
//     className: 'bg-red-50 text-red-700 border-red-200',
//     icon:      XCircle,
//   },
//   completed: {
//     label:     'Completed',
//     className: 'bg-gray-50 text-gray-600 border-gray-200',
//     icon:      CheckCircle,
//   },
// };

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// function formatDate(dateStr: string): string {
//   return new Date(dateStr).toLocaleDateString('fr-DZ', {
//     timeZone: 'Africa/Algiers',
//     weekday:  'long',
//     year:     'numeric',
//     month:    'long',
//     day:      'numeric',
//   });
// }

// function formatTime(timeStr: string): string {
//   const [h, m] = timeStr.split(':');
//   return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
// }

// function isUpcoming(dateStr: string): boolean {
//   const appt = new Date(dateStr);
//   appt.setHours(23, 59, 59);
//   return appt >= new Date();
// }

// // ─── Appointment card ─────────────────────────────────────────────────────────

// interface AppointmentCardProps {
//   appointment: AppointmentWithDoctor;
//   index:       number;
//   onCancel:    (id: string) => void;
//   cancelling:  boolean;
// }

// function AppointmentCard({ appointment, index, onCancel, cancelling }: AppointmentCardProps) {
//   const config     = STATUS_CONFIG[appointment.status];
//   const StatusIcon = config.icon;
//   const canCancel  =
//     appointment.status !== 'cancelled' && appointment.status !== 'completed';

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 16 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: index * 0.06 }}
//     >
//       <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
//         <CardContent className="p-5">
//           <div className="flex items-start justify-between gap-4">

//             {/* Left — doctor avatar + info */}
//             <div className="flex items-start gap-4 flex-1 min-w-0">
//               <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600
//                               flex items-center justify-center text-white font-semibold text-sm
//                               shadow-md flex-shrink-0">
//                 {appointment.doctor.firstName[0]}{appointment.doctor.lastName[0]}
//               </div>

//               <div className="flex-1 min-w-0">
//                 <p className="font-semibold text-gray-900 truncate">
//                   {appointment.doctor.fullName}
//                 </p>
//                 <p className="text-sm text-blue-600 flex items-center gap-1 mt-0.5">
//                   <Stethoscope className="h-3.5 w-3.5 flex-shrink-0" />
//                   {appointment.doctor.specialization}
//                 </p>

//                 <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
//                   <span className="flex items-center gap-1">
//                     <Calendar className="h-3.5 w-3.5" />
//                     {formatDate(appointment.date)}
//                   </span>
//                   <span className="flex items-center gap-1">
//                     <Clock className="h-3.5 w-3.5" />
//                     {formatTime(appointment.startTime)} – {formatTime(appointment.endTime)}
//                   </span>
//                   {appointment.doctor.city && (
//                     <span className="flex items-center gap-1">
//                       <MapPin className="h-3.5 w-3.5" />
//                       {appointment.doctor.city}
//                     </span>
//                   )}
//                 </div>

//                 {appointment.reason && (
//                   <p className="text-xs text-gray-500 mt-2 italic truncate">
//                     Reason: {appointment.reason}
//                   </p>
//                 )}

//                 {appointment.cancelReason && (
//                   <p className="text-xs text-red-500 mt-1 italic truncate">
//                     Cancel reason: {appointment.cancelReason}
//                   </p>
//                 )}
//               </div>
//             </div>

//             {/* Right — status badge + cancel */}
//             <div className="flex flex-col items-end gap-3 flex-shrink-0">
//               <Badge className={`${config.className} border gap-1.5 font-medium`}>
//                 <StatusIcon className="h-3.5 w-3.5" />
//                 {config.label}
//               </Badge>

//               {canCancel && (
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   disabled={cancelling}
//                   onClick={() => onCancel(appointment.$id)}
//                   className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs h-7 px-2"
//                 >
//                   Cancel
//                 </Button>
//               )}
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </motion.div>
//   );
// }

// // ─── Loading skeleton ─────────────────────────────────────────────────────────

// function AppointmentSkeleton() {
//   return (
//     <div className="space-y-4">
//       {[1, 2, 3].map((i) => (
//         <Card key={i} className="border-gray-200">
//           <CardContent className="p-5">
//             <div className="flex items-start gap-4">
//               <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
//               <div className="flex-1 space-y-2">
//                 <Skeleton className="h-4 w-40" />
//                 <Skeleton className="h-3 w-28" />
//                 <Skeleton className="h-3 w-64" />
//               </div>
//               <Skeleton className="h-6 w-24 rounded-full" />
//             </div>
//           </CardContent>
//         </Card>
//       ))}
//     </div>
//   );
// }

// // ─── Empty state ──────────────────────────────────────────────────────────────

// function EmptyState({ label }: { label: string }) {
//   return (
//     <div className="text-center py-16">
//       <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
//       <p className="text-gray-500 font-medium">{label}</p>
//     </div>
//   );
// }

// // ─── Main page ─────────────────────────────────────────────────────────────────

// export default function PatientAppointmentsPage() {
//   const { patient } = useAuth('patient');

//   const [appointments, setAppointments]   = useState<AppointmentWithDoctor[]>([]);
//   const [loading, setLoading]             = useState(true);
//   const [error, setError]                 = useState<string | null>(null);
//   const [refreshing, setRefreshing]       = useState(false);
//   const [cancelId, setCancelId]           = useState<string | null>(null);
//   const [cancelling, setCancelling]       = useState(false);
//   const [activeTab, setActiveTab]         = useState<'upcoming' | 'history'>('upcoming');

//   // ── Fetch ──────────────────────────────────────────────────────────────────

//   const load = async (silent = false) => {
//     if (!patient) return;
//     if (!silent) setLoading(true);
//     else setRefreshing(true);
//     setError(null);

//     try {
//       const data = await appointmentService.getAppointmentsByPatientWithDoctor(patient.$id);
//       setAppointments(data);
//     } catch {
//       setError('Failed to load appointments. Please try again.');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     if (patient) load();
//   }, [patient]); // eslint-disable-line react-hooks/exhaustive-deps

//   // ── Cancel ─────────────────────────────────────────────────────────────────

//   const handleCancel = async () => {
//     if (!cancelId) return;
//     setCancelling(true);
//     try {
//       await appointmentService.cancelAppointment(cancelId, 'patient', 'Cancelled by patient');
//       toast.success('Appointment cancelled successfully');
//       setCancelId(null);
//       await load(true);
//     } catch {
//       toast.error('Failed to cancel appointment');
//     } finally {
//       setCancelling(false);
//     }
//   };

//   // ── Split upcoming / history ───────────────────────────────────────────────

//   const upcoming = useMemo(
//     () =>
//       appointments.filter(
//         (a) => isUpcoming(a.date) && a.status !== 'cancelled' && a.status !== 'completed'
//       ),
//     [appointments]
//   );

//   const history = useMemo(
//     () =>
//       appointments.filter(
//         (a) => !isUpcoming(a.date) || a.status === 'cancelled' || a.status === 'completed'
//       ),
//     [appointments]
//   );

//   // ── Render ─────────────────────────────────────────────────────────────────

//   return (
//     <div className="space-y-6">

//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
//           <p className="text-gray-500 mt-1">Track and manage all your bookings</p>
//         </div>
//         <Button
//           variant="outline"
//           size="sm"
//           disabled={refreshing || loading}
//           onClick={() => load(true)}
//         >
//           <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
//           Refresh
//         </Button>
//       </div>

//       {/* Error */}
//       {error && (
//         <Alert variant="destructive">
//           <AlertCircle className="h-4 w-4" />
//           <AlertDescription>{error}</AlertDescription>
//         </Alert>
//       )}

//       {/* Stats */}
//       {!loading && !error && (
//         <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//           {(
//             [
//               { label: 'Total',     value: appointments.length,                            color: 'text-gray-900' },
//               { label: 'Upcoming',  value: upcoming.length,                                color: 'text-blue-600' },
//               { label: 'Confirmed', value: appointments.filter((a) => a.status === 'confirmed').length,  color: 'text-emerald-600' },
//               { label: 'Cancelled', value: appointments.filter((a) => a.status === 'cancelled').length,  color: 'text-red-600' },
//             ] as const
//           ).map((stat) => (
//             <Card key={stat.label} className="border-gray-200 shadow-sm">
//               <CardContent className="p-4 text-center">
//                 <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
//                 <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       )}

//       {/* Tabs */}
//       <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'upcoming' | 'history')}>
//         <TabsList className="grid w-full max-w-xs grid-cols-2">
//           <TabsTrigger value="upcoming">
//             Upcoming ({loading ? '…' : upcoming.length})
//           </TabsTrigger>
//           <TabsTrigger value="history">
//             History ({loading ? '…' : history.length})
//           </TabsTrigger>
//         </TabsList>

//         {/* Upcoming tab */}
//         <TabsContent value="upcoming" className="mt-6">
//           <Card className="border-gray-200 shadow-sm">
//             <CardHeader className="border-b bg-gray-50/60">
//               <CardTitle className="flex items-center gap-2 text-base">
//                 <Clock className="h-4 w-4 text-blue-600" />
//                 Upcoming Appointments
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="p-4">
//               {loading ? (
//                 <AppointmentSkeleton />
//               ) : upcoming.length === 0 ? (
//                 <EmptyState label="No upcoming appointments" />
//               ) : (
//                 <div className="space-y-4">
//                   {upcoming.map((appt, i) => (
//                     <AppointmentCard
//                       key={appt.$id}
//                       appointment={appt}
//                       index={i}
//                       onCancel={setCancelId}
//                       cancelling={cancelling}
//                     />
//                   ))}
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* History tab */}
//         <TabsContent value="history" className="mt-6">
//           <Card className="border-gray-200 shadow-sm">
//             <CardHeader className="border-b bg-gray-50/60">
//               <CardTitle className="flex items-center gap-2 text-base">
//                 <Calendar className="h-4 w-4 text-gray-500" />
//                 Appointment History
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="p-4">
//               {loading ? (
//                 <AppointmentSkeleton />
//               ) : history.length === 0 ? (
//                 <EmptyState label="No appointment history yet" />
//               ) : (
//                 <div className="space-y-4">
//                   {history.map((appt, i) => (
//                     <AppointmentCard
//                       key={appt.$id}
//                       appointment={appt}
//                       index={i}
//                       onCancel={setCancelId}
//                       cancelling={cancelling}
//                     />
//                   ))}
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>

//       {/* Cancel confirm dialog */}
//       <AlertDialog open={!!cancelId} onOpenChange={(open) => !open && setCancelId(null)}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
//             <AlertDialogDescription>
//               Are you sure you want to cancel this appointment? This action cannot be undone.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel disabled={cancelling}>Keep Appointment</AlertDialogCancel>
//             <AlertDialogAction
//               onClick={handleCancel}
//               disabled={cancelling}
//               className="bg-red-600 hover:bg-red-700"
//             >
//               {cancelling ? 'Cancelling…' : 'Yes, Cancel'}
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// }




//--------------------------------------------------------------------------------------------
// src/app/patient/appointments/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { appointmentService } from '@/services/appointment.service';
import { AppointmentWithDoctor, AppointmentStatus } from '@/types/appointment.types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Calendar, Clock, MapPin, Stethoscope, AlertCircle, RefreshCw,
  CheckCircle, CheckCircle2, XCircle, Timer, MoreVertical, EyeOff,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import Link from 'next/link';

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 5;

// ─── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; badgeClass: string; icon: React.ElementType }
> = {
  pending: {
    label:      'Pending',
    badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200',
    icon:       Timer,
  },
  confirmed: {
    label:      'Confirmed',
    badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    icon:       CheckCircle,
  },
  cancelled: {
    label:      'Cancelled',
    badgeClass: 'bg-red-50 text-red-600 border border-red-200',
    icon:       XCircle,
  },
  completed: {
    label:      'Completed',
    badgeClass: 'bg-slate-50 text-slate-600 border border-slate-200',
    icon:       CheckCircle,
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-DZ', {
    timeZone: 'Africa/Algiers',
    weekday:  'long',
    year:     'numeric',
    month:    'long',
    day:      'numeric',
  });
}

function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(':');
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
}

function isUpcoming(dateStr: string): boolean {
  const appt = new Date(dateStr);
  appt.setHours(23, 59, 59);
  return appt >= new Date();
}

// ─── Pagination controls ──────────────────────────────────────────────────────

interface PaginationControlsProps {
  page:       number;
  totalPages: number;
  loading:    boolean;
  onPrev:     () => void;
  onNext:     () => void;
}

function PaginationControls({ page, totalPages, loading, onPrev, onNext }: PaginationControlsProps) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
      <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
      <div className="flex items-center gap-2">
        <button
          disabled={page <= 1 || loading}
          onClick={onPrev}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Previous
        </button>
        <button
          disabled={page >= totalPages || loading}
          onClick={onNext}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Appointment card ─────────────────────────────────────────────────────────

interface AppointmentCardProps {
  appointment: AppointmentWithDoctor;
  index:       number;
  onCancel:    (id: string) => void;
  cancelling:  boolean;
  onRemove:    (id: string) => void;
  removing:    string | null;
}

function AppointmentCard({ appointment, index, onCancel, cancelling, onRemove, removing }: AppointmentCardProps) {
  const config     = STATUS_CONFIG[appointment.status];
  const StatusIcon = config.icon;
  const canCancel  = appointment.status !== 'cancelled' && appointment.status !== 'completed';
  const canRemove  = appointment.status === 'cancelled'  || appointment.status === 'completed';
  const isRemoving = removing === appointment.$id;

  const initials = `${appointment.doctor.firstName?.[0] ?? ''}${appointment.doctor.lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-5 flex items-start gap-4 hover:shadow-lg hover:border-teal-200 transition-all duration-200">

        {/* Avatar */}
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-md">
          {initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-slate-900 truncate">
            {appointment.doctor.fullName}
          </p>
          <p className="text-sm text-teal-600 font-medium flex items-center gap-1 mt-0.5">
            <Stethoscope className="h-3.5 w-3.5 flex-shrink-0" />
            {appointment.doctor.specialization}
          </p>

          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            <span className="flex items-center gap-1.5 text-sm text-slate-500">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(appointment.date)}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              {formatTime(appointment.startTime)} – {formatTime(appointment.endTime)}
            </span>
            {appointment.doctor.city && (
              <span className="flex items-center gap-1.5 text-sm text-slate-500">
                <MapPin className="h-3.5 w-3.5" />
                {appointment.doctor.city}
              </span>
            )}
          </div>

          {appointment.reason && (
            <p className="text-xs text-slate-400 mt-2 italic truncate">Reason: {appointment.reason}</p>
          )}
          {appointment.cancelReason && (
            <p className="text-xs text-red-400 mt-1 italic truncate">Cancel reason: {appointment.cancelReason}</p>
          )}
        </div>

        {/* Right — badge + actions */}
        <div className="flex flex-col items-end gap-3 flex-shrink-0">
          <div className="flex items-center gap-1">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.badgeClass}`}>
              <StatusIcon className="h-3.5 w-3.5" />
              {config.label}
            </span>

            {canRemove && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    disabled={isRemoving}
                    className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-40"
                  >
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">More options</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem
                    disabled={isRemoving}
                    onClick={() => onRemove(appointment.$id)}
                    className="text-slate-700 cursor-pointer"
                  >
                    <EyeOff className="h-4 w-4 mr-2 text-slate-400" />
                    {isRemoving ? 'Removing…' : 'Remove from list'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {canCancel && (
            <button
              disabled={cancelling}
              onClick={() => onCancel(appointment.$id)}
              className="text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 hover:border-red-300 transition-colors disabled:opacity-40"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function AppointmentSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-start gap-4">
            <Skeleton className="w-14 h-14 rounded-2xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Calendar className="h-16 w-16 text-slate-200" />
      <p className="text-lg font-semibold text-slate-400">No appointments yet</p>
      <p className="text-sm text-slate-400">{label}</p>
      <Link
        href="/patient/doctors"
        className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
      >
        Find a Doctor
      </Link>
    </div>
  );
}

// ─── Paginated list ───────────────────────────────────────────────────────────

interface PaginatedListProps {
  items:        AppointmentWithDoctor[];
  loading:      boolean;
  emptyLabel:   string;
  page:         number;
  onPageChange: (page: number) => void;
  onCancel:     (id: string) => void;
  cancelling:   boolean;
  onRemove:     (id: string) => void;
  removing:     string | null;
}

function PaginatedList({ items, loading, emptyLabel, page, onPageChange, onCancel, cancelling, onRemove, removing }: PaginatedListProps) {
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const slice      = items.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  if (loading) return <AppointmentSkeleton />;
  if (items.length === 0) return <EmptyState label={emptyLabel} />;

  return (
    <>
      <div className="space-y-4">
        {slice.map((appt, i) => (
          <AppointmentCard
            key={appt.$id}
            appointment={appt}
            index={i}
            onCancel={onCancel}
            cancelling={cancelling}
            onRemove={onRemove}
            removing={removing}
          />
        ))}
      </div>
      <PaginationControls
        page={safePage}
        totalPages={totalPages}
        loading={loading}
        onPrev={() => onPageChange(safePage - 1)}
        onNext={() => onPageChange(safePage + 1)}
      />
    </>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function PatientAppointmentsPage() {
  const { patient } = useAuth('patient');

  const [appointments, setAppointments] = useState<AppointmentWithDoctor[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [refreshing,   setRefreshing]   = useState(false);
  const [cancelId,     setCancelId]     = useState<string | null>(null);
  const [cancelling,   setCancelling]   = useState(false);
  const [removing,     setRemoving]     = useState<string | null>(null);
  const [activeTab,    setActiveTab]    = useState<'upcoming' | 'history'>('upcoming');
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [historyPage,  setHistoryPage]  = useState(1);

  // ── Fetch ────────────────────────────────────────────────────────────────────

  const load = async (silent = false) => {
    if (!patient) return;
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const data = await appointmentService.getAppointmentsByPatientWithDoctor(patient.$id);
      const visible = data.filter(
        (a) => !('hiddenByPatient' in a && (a as AppointmentWithDoctor & { hiddenByPatient?: boolean }).hiddenByPatient === true)
      );
      setAppointments(visible);
    } catch {
      setError('Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (patient) load();
  }, [patient]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cancel ───────────────────────────────────────────────────────────────────

  const handleCancel = async () => {
    if (!cancelId) return;
    setCancelling(true);
    try {
      await appointmentService.cancelAppointment(cancelId, 'patient', 'Cancelled by patient');
      toast.success('Appointment cancelled successfully');
      setCancelId(null);
      await load(true);
    } catch {
      toast.error('Failed to cancel appointment');
    } finally {
      setCancelling(false);
    }
  };

  // ── Remove ───────────────────────────────────────────────────────────────────

  const handleRemove = async (appointmentId: string) => {
    setRemoving(appointmentId);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setAppointments((prev) => prev.filter((a) => a.$id !== appointmentId));
    setRemoving(null);
    toast.success('Removed from your list');
  };

  // ── Split ────────────────────────────────────────────────────────────────────

  const upcoming = useMemo(
    () => appointments.filter((a) => isUpcoming(a.date) && a.status !== 'cancelled' && a.status !== 'completed'),
    [appointments]
  );

  const history = useMemo(
    () => appointments.filter((a) => !isUpcoming(a.date) || a.status === 'cancelled' || a.status === 'completed'),
    [appointments]
  );

  useEffect(() => {
    const max = Math.max(1, Math.ceil(upcoming.length / PAGE_SIZE));
    if (upcomingPage > max) setUpcomingPage(max);
  }, [upcoming.length]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const max = Math.max(1, Math.ceil(history.length / PAGE_SIZE));
    if (historyPage > max) setHistoryPage(max);
  }, [history.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Stats ────────────────────────────────────────────────────────────────────

  const confirmedCount = appointments.filter((a) => a.status === 'confirmed').length;
  const cancelledCount = appointments.filter((a) => a.status === 'cancelled').length;

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Header banner */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl px-8 py-6 shadow-lg shadow-teal-700/20 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Appointments</h1>
          <p className="text-teal-100 mt-1">Track and manage all your bookings</p>
        </div>
        <button
          disabled={refreshing || loading}
          onClick={() => load(true)}
          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats cards */}
      {!loading && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

          <div className="bg-white rounded-2xl border border-slate-200 border-b-4 border-b-slate-400 shadow-md p-5 flex items-center justify-between hover:shadow-lg transition-shadow">
            <div>
              <Calendar className="h-5 w-5 text-slate-500 mb-1" />
              <p className="text-3xl font-bold text-slate-800">{appointments.length}</p>
              <p className="text-sm text-slate-500 font-medium">Total</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3 flex-shrink-0">
              <Calendar className="h-6 w-6 text-slate-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 border-b-4 border-b-blue-400 shadow-md p-5 flex items-center justify-between hover:shadow-lg transition-shadow">
            <div>
              <Clock className="h-5 w-5 text-blue-400 mb-1" />
              <p className="text-3xl font-bold text-blue-600">{upcoming.length}</p>
              <p className="text-sm text-slate-500 font-medium">Upcoming</p>
            </div>
            <div className="rounded-2xl bg-blue-50 p-3 flex-shrink-0">
              <Clock className="h-6 w-6 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 border-b-4 border-b-emerald-400 shadow-md p-5 flex items-center justify-between hover:shadow-lg transition-shadow">
            <div>
              <CheckCircle2 className="h-5 w-5 text-emerald-400 mb-1" />
              <p className="text-3xl font-bold text-emerald-600">{confirmedCount}</p>
              <p className="text-sm text-slate-500 font-medium">Confirmed</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3 flex-shrink-0">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 border-b-4 border-b-red-400 shadow-md p-5 flex items-center justify-between hover:shadow-lg transition-shadow">
            <div>
              <XCircle className="h-5 w-5 text-red-400 mb-1" />
              <p className="text-3xl font-bold text-red-500">{cancelledCount}</p>
              <p className="text-sm text-slate-500 font-medium">Cancelled</p>
            </div>
            <div className="rounded-2xl bg-red-50 p-3 flex-shrink-0">
              <XCircle className="h-6 w-6 text-red-500" />
            </div>
          </div>

        </div>
      )}

      {/* Tab switcher */}
      <div className="bg-slate-100 rounded-2xl p-1 flex gap-1 w-fit">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={activeTab === 'upcoming'
            ? 'bg-white rounded-xl px-6 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition-all'
            : 'px-6 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 rounded-xl transition-all'}
        >
          Upcoming ({loading ? '…' : upcoming.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={activeTab === 'history'
            ? 'bg-white rounded-xl px-6 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition-all'
            : 'px-6 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 rounded-xl transition-all'}
        >
          History ({loading ? '…' : history.length})
        </button>
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6">

        {/* Section header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-xl bg-teal-100 p-2">
            {activeTab === 'upcoming'
              ? <Clock className="h-5 w-5 text-teal-600" />
              : <Calendar className="h-5 w-5 text-teal-600" />}
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            {activeTab === 'upcoming' ? 'Upcoming Appointments' : 'Appointment History'}
          </h2>
        </div>

        {activeTab === 'upcoming' ? (
          <PaginatedList
            items={upcoming}
            loading={loading}
            emptyLabel="Book your first appointment with a doctor"
            page={upcomingPage}
            onPageChange={setUpcomingPage}
            onCancel={setCancelId}
            cancelling={cancelling}
            onRemove={handleRemove}
            removing={removing}
          />
        ) : (
          <PaginatedList
            items={history}
            loading={loading}
            emptyLabel="Your completed and cancelled appointments will appear here"
            page={historyPage}
            onPageChange={setHistoryPage}
            onCancel={setCancelId}
            cancelling={cancelling}
            onRemove={handleRemove}
            removing={removing}
          />
        )}
      </div>

      {/* Cancel confirm dialog */}
      <AlertDialog open={!!cancelId} onOpenChange={(open) => !open && setCancelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>Keep Appointment</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={cancelling}
              className="bg-red-600 hover:bg-red-700"
            >
              {cancelling ? 'Cancelling…' : 'Yes, Cancel'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}