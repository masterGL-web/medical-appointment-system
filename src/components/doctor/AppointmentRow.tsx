// 'use client';

// import { useState, useEffect } from 'react';
// import { Appointment, AppointmentStatus } from '@/types/appointment.types';
// import { appointmentService } from '@/services/appointment.service';
// import { patientService } from '@/services/patient.service';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
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
// import { MoreVertical, CheckCircle, XCircle, Clock } from 'lucide-react';
// import { toast } from 'sonner'; // ✅ use Sonner directly

// interface AppointmentRowProps {
//   appointment: Appointment;
//   onUpdate: () => void;
// }

// export function AppointmentRow({ appointment, onUpdate }: AppointmentRowProps) {
//   const [loading, setLoading] = useState(false);
//   const [showCancelDialog, setShowCancelDialog] = useState(false);
//   const [patientName, setPatientName] = useState<string>('Loading...');

//   useEffect(() => {
//     loadPatientName();
//   }, [appointment.patientId]);

//   const loadPatientName = async () => {
//     try {
//       const patient = await patientService.getPatientById(appointment.patientId);
//       setPatientName(`${patient.firstName} ${patient.lastName}`);
//     } catch {
//       setPatientName('Unknown Patient');
//     }
//   };

//   const handleStatusChange = async (status: AppointmentStatus) => {
//     try {
//       setLoading(true);
//       await appointmentService.updateStatus(appointment.$id, status);
//       toast.success(`Appointment ${status} successfully`); // ✅ Sonner
//       onUpdate();
//     } catch (error: any) {
//       toast.error(error.message || 'Failed to update appointment'); // ✅ Sonner
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
//       toast.success('Appointment cancelled successfully'); // ✅ Sonner
//       setShowCancelDialog(false);
//       onUpdate();
//     } catch (error: any) {
//       toast.error(error.message || 'Failed to cancel appointment'); // ✅ Sonner
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusBadge = (status: AppointmentStatus) => {
//     const variants: Record<AppointmentStatus, { variant: any; label: string }> = {
//       pending: { variant: 'outline', label: 'Pending' },
//       confirmed: { variant: 'default', label: 'Confirmed' },
//       completed: { variant: 'secondary', label: 'Completed' },
//       cancelled: { variant: 'destructive', label: 'Cancelled' },
//     };
//     const config = variants[status];
//     return <Badge variant={config.variant}>{config.label}</Badge>;
//   };

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       weekday: 'short',
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//     });
//   };

//   const canConfirm = appointment.status === 'pending';
//   const canComplete = appointment.status === 'confirmed';
//   const canCancel = appointment.status !== 'cancelled' && appointment.status !== 'completed';

//   return (
//     <>
//       <tr>
//         <td className="px-6 py-4 whitespace-nowrap">
//           <div className="text-sm font-medium text-gray-900">{patientName}</div>
//           <div className="text-sm text-gray-500">{appointment.patientId.slice(0, 8)}...</div>
//         </td>
//         <td className="px-6 py-4 whitespace-nowrap">
//           <div className="text-sm text-gray-900">{formatDate(appointment.date)}</div>
//         </td>
//         <td className="px-6 py-4 whitespace-nowrap">
//           <div className="text-sm text-gray-900">{appointment.startTime} - {appointment.endTime}</div>
//         </td>
//         <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(appointment.status)}</td>
//         <td className="px-6 py-4">
//           <div className="text-sm text-gray-900 max-w-xs truncate">{appointment.reason || 'No reason provided'}</div>
//         </td>
//         <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="ghost" size="sm" disabled={loading}>
//                 <MoreVertical className="h-4 w-4" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end">
//               {canConfirm && (
//                 <DropdownMenuItem onClick={() => handleStatusChange('confirmed')}>
//                   <CheckCircle className="mr-2 h-4 w-4" />
//                   Confirm
//                 </DropdownMenuItem>
//               )}
//               {canComplete && (
//                 <DropdownMenuItem onClick={() => handleStatusChange('completed')}>
//                   <Clock className="mr-2 h-4 w-4" />
//                   Mark Completed
//                 </DropdownMenuItem>
//               )}
//               {canCancel && (
//                 <DropdownMenuItem onClick={() => setShowCancelDialog(true)} className="text-red-600">
//                   <XCircle className="mr-2 h-4 w-4" />
//                   Cancel
//                 </DropdownMenuItem>
//               )}
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </td>
//       </tr>

//       {/* Cancel Confirmation Dialog */}
//       <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
//             <AlertDialogDescription>
//               Are you sure you want to cancel this appointment? This action cannot be undone.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>No, keep it</AlertDialogCancel>
//             <AlertDialogAction onClick={handleCancel} className="bg-red-600 hover:bg-red-700">
//               Yes, cancel appointment
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
import { AppointmentWithPatient, AppointmentStatus } from '@/types/appointment.types'; // CHANGED
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
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AppointmentRowProps {
  appointment: AppointmentWithPatient; // CHANGED
  onUpdate: () => void;
  isToday?: boolean;
  index: number;
}

export function AppointmentRow({
  appointment,
  onUpdate,
  isToday,
  index,
}: AppointmentRowProps) {
  const [loading, setLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // CHANGED: Patient data is already available
  const patientName = appointment.patient.fullName;
  const patientInitials = `${appointment.patient.firstName[0]}${appointment.patient.lastName[0]}`.toUpperCase();

  const handleStatusChange = async (status: AppointmentStatus) => {
    try {
      setLoading(true);
      await appointmentService.updateStatus(appointment.$id, status);
      toast.success(`Appointment ${status} successfully`);
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update appointment');
    } finally {
      setLoading(false);
    }
  };

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
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel appointment');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: AppointmentStatus) => {
    const configs = {
      pending: {
        variant: 'secondary' as const,
        label: 'Pending',
        icon: Clock,
        className: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
      },
      confirmed: {
        variant: 'default' as const,
        label: 'Confirmed',
        icon: CheckCircle,
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
      },
      completed: {
        variant: 'secondary' as const,
        label: 'Completed',
        icon: CheckCircle,
        className: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100',
      },
      cancelled: {
        variant: 'destructive' as const,
        label: 'Cancelled',
        icon: XCircle,
        className: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
      },
    };
    return configs[status];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const statusConfig = getStatusConfig(appointment.status);
  const StatusIcon = statusConfig.icon;

  const canConfirm = appointment.status === 'pending';
  const canComplete = appointment.status === 'confirmed';
  const canCancel =
    appointment.status !== 'cancelled' && appointment.status !== 'completed';

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

          {/* Patient Info */}
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

            {/* CHANGED: Show patient phone if available */}
            {appointment.patient.phone && (
              <p className="text-xs text-gray-500 mt-1">{appointment.patient.phone}</p>
            )}
            {appointment.reason && (
              <p className="text-xs text-gray-500 mt-1 truncate">{appointment.reason}</p>
            )}
          </div>

          {/* Status */}
          <Badge
            variant={statusConfig.variant}
            className={`${statusConfig.className} gap-1.5`}
          >
            <StatusIcon className="h-3.5 w-3.5" />
            {statusConfig.label}
          </Badge>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" disabled={loading} className="h-8 w-8 p-0 hover:bg-gray-200">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
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

              {(canConfirm || canComplete) && canCancel && (
                <DropdownMenuSeparator />
              )}

              {canCancel && (
                <DropdownMenuItem
                  onClick={() => setShowCancelDialog(true)}
                  className="gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel the appointment with {patientName}? This action cannot be undone.
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
    </>
  );
}