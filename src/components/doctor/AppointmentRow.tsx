// //src/components/doctor/AppointmentRow.tsx
// 'use client';

// import { useState } from 'react';
// import { AppointmentWithPatient, AppointmentStatus } from '@/types/appointment.types'; // CHANGED
// import { appointmentService } from '@/services/appointment.service';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
//   DropdownMenuSeparator,
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
//   MoreVertical,
//   CheckCircle,
//   XCircle,
//   Clock,
//   Calendar as CalendarIcon,
// } from 'lucide-react';
// import { motion } from 'framer-motion';

// interface AppointmentRowProps {
//   appointment: AppointmentWithPatient; // CHANGED
//   onUpdate: () => void;
//   isToday?: boolean;
//   index: number;
// }

// export function AppointmentRow({
//   appointment,
//   onUpdate,
//   isToday,
//   index,
// }: AppointmentRowProps) {
//   const [loading, setLoading] = useState(false);
//   const [showCancelDialog, setShowCancelDialog] = useState(false);

//   // CHANGED: Patient data is already available
//   const patientName = appointment.patient.fullName;
//   const patientInitials = `${appointment.patient.firstName[0]}${appointment.patient.lastName[0]}`.toUpperCase();

//   const handleStatusChange = async (status: AppointmentStatus) => {
//     try {
//       setLoading(true);
//       await appointmentService.updateStatus(appointment.$id, status);
//       toast.success(`Appointment ${status} successfully`);
//       onUpdate();
//     } catch (error: any) {
//       toast.error(error.message || 'Failed to update appointment');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCancel = async () => {
//     try {
//       setLoading(true);
//       await appointmentService.cancelAppointment(
//         appointment.$id,
//         'doctor',
//         'Cancelled by doctor'
//       );
//       toast.success('Appointment cancelled');
//       setShowCancelDialog(false);
//       onUpdate();
//     } catch (error: any) {
//       toast.error(error.message || 'Failed to cancel appointment');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusConfig = (status: AppointmentStatus) => {
//     const configs = {
//       pending: {
//         variant: 'secondary' as const,
//         label: 'Pending',
//         icon: Clock,
//         className: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
//       },
//       confirmed: {
//         variant: 'default' as const,
//         label: 'Confirmed',
//         icon: CheckCircle,
//         className: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
//       },
//       completed: {
//         variant: 'secondary' as const,
//         label: 'Completed',
//         icon: CheckCircle,
//         className: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100',
//       },
//       cancelled: {
//         variant: 'destructive' as const,
//         label: 'Cancelled',
//         icon: XCircle,
//         className: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
//       },
//     };
//     return configs[status];
//   };

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric',
//     });
//   };

//   const formatTime = (time: string) => {
//     const [hours, minutes] = time.split(':');
//     const hour = parseInt(hours);
//     const ampm = hour >= 12 ? 'PM' : 'AM';
//     const displayHour = hour % 12 || 12;
//     return `${displayHour}:${minutes} ${ampm}`;
//   };

//   const statusConfig = getStatusConfig(appointment.status);
//   const StatusIcon = statusConfig.icon;

//   const canConfirm = appointment.status === 'pending';
//   const canComplete = appointment.status === 'confirmed';
//   const canCancel =
//     appointment.status !== 'cancelled' && appointment.status !== 'completed';

//   return (
//     <>
//       <motion.div
//         initial={{ opacity: 0, x: -20 }}
//         animate={{ opacity: 1, x: 0 }}
//         transition={{ delay: index * 0.05 }}
//         className={`p-4 hover:bg-gray-50 transition-colors ${
//           isToday ? 'bg-blue-50 border-l-4 border-blue-500' : ''
//         }`}
//       >
//         <div className="flex items-center gap-4">
//           {/* Avatar */}
//           <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
//             {patientInitials}
//           </div>

//           {/* Patient Info */}
//           <div className="flex-1 min-w-0">
//             <div className="flex items-center gap-2 mb-1">
//               <p className="font-semibold text-gray-900 truncate">{patientName}</p>
//               {isToday && (
//                 <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
//                   Today
//                 </Badge>
//               )}
//             </div>

//             <div className="flex items-center gap-4 text-sm text-gray-600">
//               <span className="flex items-center gap-1">
//                 <CalendarIcon className="h-3.5 w-3.5" />
//                 {formatDate(appointment.date)}
//               </span>
//               <span className="flex items-center gap-1">
//                 <Clock className="h-3.5 w-3.5" />
//                 {formatTime(appointment.startTime)}
//               </span>
//             </div>

//             {/* CHANGED: Show patient phone if available */}
//             {appointment.patient.phone && (
//               <p className="text-xs text-gray-500 mt-1">{appointment.patient.phone}</p>
//             )}
//             {appointment.reason && (
//               <p className="text-xs text-gray-500 mt-1 truncate">{appointment.reason}</p>
//             )}
//           </div>

//           {/* Status */}
//           <Badge
//             variant={statusConfig.variant}
//             className={`${statusConfig.className} gap-1.5`}
//           >
//             <StatusIcon className="h-3.5 w-3.5" />
//             {statusConfig.label}
//           </Badge>

//           {/* Actions */}
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="ghost" size="sm" disabled={loading} className="h-8 w-8 p-0 hover:bg-gray-200">
//                 <MoreVertical className="h-4 w-4" />
//               </Button>
//             </DropdownMenuTrigger>

//             <DropdownMenuContent align="end" className="w-48">
//               {canConfirm && (
//                 <DropdownMenuItem
//                   onClick={() => handleStatusChange('confirmed')}
//                   className="gap-2 cursor-pointer"
//                 >
//                   <CheckCircle className="h-4 w-4 text-emerald-600" />
//                   Confirm
//                 </DropdownMenuItem>
//               )}

//               {canComplete && (
//                 <DropdownMenuItem
//                   onClick={() => handleStatusChange('completed')}
//                   className="gap-2 cursor-pointer"
//                 >
//                   <CheckCircle className="h-4 w-4 text-blue-600" />
//                   Mark Completed
//                 </DropdownMenuItem>
//               )}

//               {(canConfirm || canComplete) && canCancel && (
//                 <DropdownMenuSeparator />
//               )}

//               {canCancel && (
//                 <DropdownMenuItem
//                   onClick={() => setShowCancelDialog(true)}
//                   className="gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
//                 >
//                   <XCircle className="h-4 w-4" />
//                   Cancel
//                 </DropdownMenuItem>
//               )}
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//       </motion.div>

//       <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
//             <AlertDialogDescription>
//               Are you sure you want to cancel the appointment with {patientName}? This action cannot be undone.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
//             <AlertDialogAction
//               onClick={handleCancel}
//               className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
//             >
//               Yes, Cancel
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </>
//   );
// }
//src/components/doctor/AppointmentRow.tsx
'use client';

import { useState } from 'react';
import { AppointmentWithPatient, AppointmentStatus } from '@/types/appointment.types';
import { appointmentService } from '@/services/appointment.service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  Calendar as CalendarIcon,
  UserX,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AppointmentRowProps {
  appointment: AppointmentWithPatient;
  onUpdate: () => void;
  /** Name of the logged-in doctor — used in notification emails */
  doctorName: string;
  isToday?: boolean;
  index: number;
}

// ─── Helper: fire-and-forget email notification ───────────────────────────────

function notifyPatient(
  appointment: AppointmentWithPatient,
  doctorName: string,
  status: 'confirmed' | 'cancelled'
): void {
  fetch('/api/notify-appointment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patientEmail:  appointment.patient.email,
      patientName:   appointment.patient.fullName,
      patientUserId: appointment.patient.userId,
      doctorName,
      status,
      date:          appointment.date,
      startTime:     appointment.startTime,
    }),
  }).catch((err) => {
    console.warn('Notification failed (non-blocking):', err);
  });
}

// ─── Helper: fire-and-forget no-show trigger ──────────────────────────────────

function triggerNoShow(patientId: string): void {
  fetch('/api/handle-noshow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patientId }),
  })
    .then(async (res) => {
      const data = await res.json();
      if (data?.result?.banApplied) {
        toast.warning(
          `⚠️ Patient has been banned after ${data.result.noShowCount} no-shows.`,
          { duration: 5000 }
        );
      }
    })
    .catch(() => {
      // Silent — never blocks doctor workflow
    });
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AppointmentRow({
  appointment,
  onUpdate,
  doctorName,
  isToday,
  index,
}: AppointmentRowProps) {
  const [loading, setLoading]                   = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showNoShowDialog, setShowNoShowDialog] = useState(false); // ← NEW

  const patientName     = appointment.patient.fullName;
  const patientInitials = `${appointment.patient.firstName[0]}${appointment.patient.lastName[0]}`.toUpperCase();

  // ── Confirm / complete ──────────────────────────────────────────────────────

  const handleStatusChange = async (status: AppointmentStatus) => {
    try {
      setLoading(true);
      await appointmentService.updateStatus(appointment.$id, status);
      toast.success(`Appointment ${status} successfully`);

      if (status === 'confirmed' || status === 'cancelled') {
        notifyPatient(appointment, doctorName, status);
      }

      onUpdate();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to update appointment';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Regular cancel ──────────────────────────────────────────────────────────

  const handleCancel = async () => {
    try {
      setLoading(true);
      await appointmentService.cancelAppointment(
        appointment.$id,
        'doctor',
        'Cancelled by doctor'
      );
      toast.success('Appointment cancelled');
      setShowCancelDialog(false);

      notifyPatient(appointment, doctorName, 'cancelled');

      onUpdate();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to cancel appointment';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── No-show cancel (NEW) ────────────────────────────────────────────────────

  const handleNoShow = async () => {
    try {
      setLoading(true);

      // Cancel with reason "no-show" — this is what noshow.service detects
      await appointmentService.cancelAppointment(
        appointment.$id,
        'doctor',
        'no-show'
      );

      toast.success('Appointment marked as no-show');
      setShowNoShowDialog(false);

      // Send cancellation email to patient
      notifyPatient(appointment, doctorName, 'cancelled');

      // Trigger no-show counter — may auto-ban the patient
      triggerNoShow(appointment.patientId);

      onUpdate();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to mark as no-show';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Status badge config ─────────────────────────────────────────────────────

  const getStatusConfig = (status: AppointmentStatus) => {
    const configs = {
      pending: {
        variant:   'secondary' as const,
        label:     'Pending',
        icon:      Clock,
        className: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
      },
      confirmed: {
        variant:   'default' as const,
        label:     'Confirmed',
        icon:      CheckCircle,
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
      },
      completed: {
        variant:   'secondary' as const,
        label:     'Completed',
        icon:      CheckCircle,
        className: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100',
      },
      cancelled: {
        variant:   'destructive' as const,
        label:     'Cancelled',
        icon:      XCircle,
        className: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
      },
    };
    return configs[status];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day:   'numeric',
      year:  'numeric',
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour        = parseInt(hours);
    const ampm        = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const statusConfig = getStatusConfig(appointment.status);
  const StatusIcon   = statusConfig.icon;

  const canConfirm  = appointment.status === 'pending';
  const canComplete = appointment.status === 'confirmed';
  const canCancel   =
    appointment.status !== 'cancelled' && appointment.status !== 'completed';

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`p-4 hover:bg-gray-50 transition-colors ${
          isToday ? 'bg-blue-50 border-l-4 border-blue-500' : ''
        }`}
      >
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
            {patientInitials}
          </div>

          {/* Patient info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-gray-900 truncate">{patientName}</p>
              {isToday && (
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                  Today
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <CalendarIcon className="h-3.5 w-3.5" />
                {formatDate(appointment.date)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatTime(appointment.startTime)}
              </span>
            </div>

            {appointment.patient.phone && (
              <p className="text-xs text-gray-500 mt-1">{appointment.patient.phone}</p>
            )}
            {appointment.reason && (
              <p className="text-xs text-gray-500 mt-1 truncate">{appointment.reason}</p>
            )}
          </div>

          {/* Status badge */}
          <Badge
            variant={statusConfig.variant}
            className={`${statusConfig.className} gap-1.5`}
          >
            <StatusIcon className="h-3.5 w-3.5" />
            {statusConfig.label}
          </Badge>

          {/* Actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                disabled={loading}
                className="h-8 w-8 p-0 hover:bg-gray-200"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-52">
              {canConfirm && (
                <DropdownMenuItem
                  onClick={() => handleStatusChange('confirmed')}
                  className="gap-2 cursor-pointer"
                >
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  Confirm
                </DropdownMenuItem>
              )}

              {canComplete && (
                <DropdownMenuItem
                  onClick={() => handleStatusChange('completed')}
                  className="gap-2 cursor-pointer"
                >
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  Mark Completed
                </DropdownMenuItem>
              )}

              {(canConfirm || canComplete) && canCancel && <DropdownMenuSeparator />}

              {canCancel && (
                <>
                  {/* Regular cancel */}
                  <DropdownMenuItem
                    onClick={() => setShowCancelDialog(true)}
                    className="gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <XCircle className="h-4 w-4" />
                    Cancel
                  </DropdownMenuItem>

                  {/* No-show — NEW */}
                  <DropdownMenuItem
                    onClick={() => setShowNoShowDialog(true)}
                    className="gap-2 cursor-pointer text-orange-600 focus:text-orange-600 focus:bg-orange-50"
                  >
                    <UserX className="h-4 w-4" />
                    Patient No-Show
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      {/* ── Regular cancel dialog ── */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel the appointment with {patientName}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Yes, Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── No-show dialog — NEW ── */}
      <AlertDialog open={showNoShowDialog} onOpenChange={setShowNoShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <UserX className="h-5 w-5 text-orange-600" />
              Mark as No-Show?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  You are marking <strong>{patientName}</strong> as a no-show for this appointment.
                </p>
                <p className="text-orange-700 font-medium bg-orange-50 border border-orange-200 rounded-md px-3 py-2">
                  ⚠️ This counts toward their no-show record.
                  After 3 no-shows the patient will be automatically banned from booking. 
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleNoShow}
              className="bg-orange-600 hover:bg-orange-700 focus:ring-orange-600"
            >
              Yes, Mark as No-Show
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}