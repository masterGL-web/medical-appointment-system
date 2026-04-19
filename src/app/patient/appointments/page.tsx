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
// src/app/patient/appointments/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { appointmentService } from '@/services/appointment.service';
import { AppointmentWithDoctor, AppointmentStatus } from '@/types/appointment.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  Clock,
  MapPin,
  Stethoscope,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  XCircle,
  Timer,
  MoreVertical,
  EyeOff,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 5;

// ─── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; className: string; icon: React.ElementType }
> = {
  pending: {
    label:     'Pending',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    icon:      Timer,
  },
  confirmed: {
    label:     'Confirmed',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon:      CheckCircle,
  },
  cancelled: {
    label:     'Cancelled',
    className: 'bg-red-50 text-red-700 border-red-200',
    icon:      XCircle,
  },
  completed: {
    label:     'Completed',
    className: 'bg-gray-50 text-gray-600 border-gray-200',
    icon:      CheckCircle,
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
    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
      <p className="text-sm text-gray-500">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1 || loading}
          onClick={onPrev}
          className="h-8 px-3"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages || loading}
          onClick={onNext}
          className="h-8 px-3"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
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

function AppointmentCard({
  appointment,
  index,
  onCancel,
  cancelling,
  onRemove,
  removing,
}: AppointmentCardProps) {
  const config     = STATUS_CONFIG[appointment.status];
  const StatusIcon = config.icon;
  const canCancel  =
    appointment.status !== 'cancelled' && appointment.status !== 'completed';
  const canRemove  =
    appointment.status === 'cancelled' || appointment.status === 'completed';
  const isRemoving = removing === appointment.$id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">

            {/* Left — doctor avatar + info */}
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600
                              flex items-center justify-center text-white font-semibold text-sm
                              shadow-md flex-shrink-0">
                {appointment.doctor.firstName[0]}{appointment.doctor.lastName[0]}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {appointment.doctor.fullName}
                </p>
                <p className="text-sm text-blue-600 flex items-center gap-1 mt-0.5">
                  <Stethoscope className="h-3.5 w-3.5 flex-shrink-0" />
                  {appointment.doctor.specialization}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(appointment.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatTime(appointment.startTime)} – {formatTime(appointment.endTime)}
                  </span>
                  {appointment.doctor.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {appointment.doctor.city}
                    </span>
                  )}
                </div>

                {appointment.reason && (
                  <p className="text-xs text-gray-500 mt-2 italic truncate">
                    Reason: {appointment.reason}
                  </p>
                )}

                {appointment.cancelReason && (
                  <p className="text-xs text-red-500 mt-1 italic truncate">
                    Cancel reason: {appointment.cancelReason}
                  </p>
                )}
              </div>
            </div>

            {/* Right — status badge + actions */}
            <div className="flex flex-col items-end gap-3 flex-shrink-0">
              <div className="flex items-center gap-1">
                <Badge className={`${config.className} border gap-1.5 font-medium`}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  {config.label}
                </Badge>

                {/* 3-dot menu — only for cancelled/completed */}
                {canRemove && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isRemoving}
                        className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
                      >
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">More options</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem
                        disabled={isRemoving}
                        onClick={() => onRemove(appointment.$id)}
                        className="text-gray-700 cursor-pointer"
                      >
                        <EyeOff className="h-4 w-4 mr-2 text-gray-400" />
                        {isRemoving ? 'Removing…' : 'Remove from list'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {canCancel && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={cancelling}
                  onClick={() => onCancel(appointment.$id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs h-7 px-2"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function AppointmentSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border-gray-200">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-64" />
              </div>
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ label }: { label: string }) {
  return (
    <div className="text-center py-16">
      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
      <p className="text-gray-500 font-medium">{label}</p>
    </div>
  );
}

// ─── Paginated list ───────────────────────────────────────────────────────────

interface PaginatedListProps {
  items:      AppointmentWithDoctor[];
  loading:    boolean;
  emptyLabel: string;
  page:       number;
  onPageChange: (page: number) => void;
  onCancel:   (id: string) => void;
  cancelling: boolean;
  onRemove:   (id: string) => void;
  removing:   string | null;
}

function PaginatedList({
  items,
  loading,
  emptyLabel,
  page,
  onPageChange,
  onCancel,
  cancelling,
  onRemove,
  removing,
}: PaginatedListProps) {
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
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [refreshing, setRefreshing]     = useState(false);
  const [cancelId, setCancelId]         = useState<string | null>(null);
  const [cancelling, setCancelling]     = useState(false);
  const [removing, setRemoving]         = useState<string | null>(null);
  const [activeTab, setActiveTab]       = useState<'upcoming' | 'history'>('upcoming');

  // Independent pagination state per tab
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [historyPage, setHistoryPage]   = useState(1);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const load = async (silent = false) => {
    if (!patient) return;
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const data = await appointmentService.getAppointmentsByPatientWithDoctor(patient.$id);
      // Filter out documents hidden by the patient
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

  // ── Cancel ─────────────────────────────────────────────────────────────────

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

  // ── Remove from UI ─────────────────────────────────────────────────────────

  const handleRemove = async (appointmentId: string) => {
  setRemoving(appointmentId);
  // Small delay so the user sees the loading state before item disappears
  await new Promise((resolve) => setTimeout(resolve, 300));
  setAppointments((prev) => prev.filter((a) => a.$id !== appointmentId));
  setRemoving(null);
  toast.success('Removed from your list');
};

  // ── Split upcoming / history ───────────────────────────────────────────────

  const upcoming = useMemo(
    () =>
      appointments.filter(
        (a) => isUpcoming(a.date) && a.status !== 'cancelled' && a.status !== 'completed'
      ),
    [appointments]
  );

  const history = useMemo(
    () =>
      appointments.filter(
        (a) => !isUpcoming(a.date) || a.status === 'cancelled' || a.status === 'completed'
      ),
    [appointments]
  );

  // Reset pages when data changes so we never land on a now-empty page
  useEffect(() => {
    const maxUpcoming = Math.max(1, Math.ceil(upcoming.length / PAGE_SIZE));
    if (upcomingPage > maxUpcoming) setUpcomingPage(maxUpcoming);
  }, [upcoming.length]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const maxHistory = Math.max(1, Math.ceil(history.length / PAGE_SIZE));
    if (historyPage > maxHistory) setHistoryPage(maxHistory);
  }, [history.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-500 mt-1">Track and manage all your bookings</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={refreshing || loading}
          onClick={() => load(true)}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      {!loading && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(
            [
              { label: 'Total',     value: appointments.length,                                           color: 'text-gray-900'    },
              { label: 'Upcoming',  value: upcoming.length,                                               color: 'text-blue-600'    },
              { label: 'Confirmed', value: appointments.filter((a) => a.status === 'confirmed').length,   color: 'text-emerald-600' },
              { label: 'Cancelled', value: appointments.filter((a) => a.status === 'cancelled').length,   color: 'text-red-600'     },
            ] as const
          ).map((stat) => (
            <Card key={stat.label} className="border-gray-200 shadow-sm">
              <CardContent className="p-4 text-center">
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'upcoming' | 'history')}>
        <TabsList className="grid w-full max-w-xs grid-cols-2">
          <TabsTrigger value="upcoming">
            Upcoming ({loading ? '…' : upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            History ({loading ? '…' : history.length})
          </TabsTrigger>
        </TabsList>

        {/* Upcoming tab */}
        <TabsContent value="upcoming" className="mt-6">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="border-b bg-gray-50/60">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4 text-blue-600" />
                Upcoming Appointments
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <PaginatedList
                items={upcoming}
                loading={loading}
                emptyLabel="No upcoming appointments"
                page={upcomingPage}
                onPageChange={setUpcomingPage}
                onCancel={setCancelId}
                cancelling={cancelling}
                onRemove={handleRemove}
                removing={removing}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* History tab */}
        <TabsContent value="history" className="mt-6">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="border-b bg-gray-50/60">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4 text-gray-500" />
                Appointment History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <PaginatedList
                items={history}
                loading={loading}
                emptyLabel="No appointment history yet"
                page={historyPage}
                onPageChange={setHistoryPage}
                onCancel={setCancelId}
                cancelling={cancelling}
                onRemove={handleRemove}
                removing={removing}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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