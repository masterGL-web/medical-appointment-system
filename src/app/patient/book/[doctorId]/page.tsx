// // src/app/patient/book/[doctorId]/page.tsx
// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter, useParams } from 'next/navigation';
// import { useAuth } from '@/lib/hooks/useAuth';
// import { doctorService } from '@/services/doctor.service';
// import { appointmentService } from '@/services/appointment.service';
// import { patientService } from '@/services/patient.service';
// import { Doctor } from '@/types/doctor.types';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Calendar } from '@/components/ui/calendar';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { availabilityService } from '@/services/availability.service';
// import { DayOfWeek } from '@/types/availability.types';

// import { toast } from 'sonner';
// import {
//     Stethoscope,
//     MapPin,
//     DollarSign,
//     Clock,
//     Loader2,
//     AlertCircle,
//     CheckCircle2,
// } from 'lucide-react';

// // Converts a Date to YYYY-MM-DD using LOCAL time parts (never toISOString)
// function toLocalDateString(date: Date): string {
//   const year  = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const day   = String(date.getDate()).padStart(2, '0');
//   return `${year}-${month}-${day}`;
// }

// export default function BookAppointmentPage() {
//     const params = useParams();
//     const router = useRouter();
//     const { user } = useAuth('patient');

//     const doctorId = params.doctorId as string;

//     const [doctor, setDoctor] = useState<Doctor | null>(null);
//     const [loadingDoctor, setLoadingDoctor] = useState(true);
//     const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
//     const [availableSlots, setAvailableSlots] = useState<string[]>([]);
//     const [loadingSlots, setLoadingSlots] = useState(false);
//     const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
//     const [booking, setBooking] = useState(false);
//     const [error, setError] = useState<string | null>(null);
//     const [slotDuration, setSlotDuration] = useState<number>(0);
//     // Load doctor data
//     useEffect(() => {
//         loadDoctor();
//     }, [doctorId]);

//     // Load slots when date changes
//     useEffect(() => {
//         if (selectedDate && doctor) {
//             loadAvailableSlots();
//             setSelectedSlot(null); // Reset selected slot on date change
//         }
//     }, [selectedDate, doctor]);

//     const loadDoctor = async () => {
//         try {
//             setLoadingDoctor(true);
//             setError(null);
//             const doctorData = await doctorService.getDoctorById(doctorId);
//             setDoctor(doctorData);
//         } catch (err: any) {
//             console.error('Failed to load doctor:', err);
//             setError(err.message || 'Failed to load doctor information');
//         } finally {
//             setLoadingDoctor(false);
//         }
//     };

//     const loadAvailableSlots = async () => {
//         if (!selectedDate || !doctor) return;

//         try {
//             setLoadingSlots(true);
//             setError(null);

//             const dateString = toLocalDateString(selectedDate);

//             // 🔥 جلب الخانات مباشرة من الخدمة
//             const slots = await appointmentService.getAvailableSlots(
//                 doctor.$id,
//                 dateString
//             );

//             setAvailableSlots(slots);

//             // 🔥 مهم: جلب availability لاستخراج slotDuration
//             const appointmentDate = new Date(dateString + 'T00:00:00');
//             const dayOfWeek = appointmentDate.getDay() as DayOfWeek;
//             const availability = await availabilityService.getDoctorAvailabilityByDay(
//                 doctor.$id,
//                 dayOfWeek
//             );

//             if (availability) {
//                 setSlotDuration(availability.slotDuration);
//             } else {
//                 setSlotDuration(0);
//             }

//             if (slots.length === 0) {
//                 setError('No available slots for this date');
//             }

//         } catch (err: any) {
//             console.error('Failed to load slots:', err);
//             setError(err.message || 'Failed to load available slots');
//             setAvailableSlots([]);
//         } finally {
//             setLoadingSlots(false);
//         }
//     };

//     const calculateEndTime = (startTime: string): string => {
//         if (!slotDuration) return startTime;

//         const [hours, minutes] = startTime.split(':').map(Number);
//         const totalMinutes = hours * 60 + minutes + slotDuration;
//         const endHours = Math.floor(totalMinutes / 60);
//         const endMinutes = totalMinutes % 60;

//         return `${endHours.toString().padStart(2, '0')}:${endMinutes
//             .toString()
//             .padStart(2, '0')}`;
//     };
//     const handleBookAppointment = async () => {
//         if (!selectedDate || !selectedSlot || !doctor || !user) return;

//         try {
//             setBooking(true);
//             setError(null);

//             // Get patient document $id
//             const patient = await patientService.getPatientByUserId(user.$id);
//             if (!patient) {
//                 throw new Error('Patient profile not found');
//             }

//             const dateString = toLocalDateString(selectedDate);
//             const endTime = calculateEndTime(selectedSlot);

//             await appointmentService.createAppointment({
//                 patientId: patient.$id,
//                 doctorId: doctor.$id,
//                 date: dateString,
//                 startTime: selectedSlot,
//                 endTime: endTime,
//             });

//             toast.success('Appointment booked successfully!');

//             router.push('/patient/appointments');
//         } catch (err: any) {
//             console.error('Booking failed:', err);
//             setError(err.message || 'Failed to book appointment');
//             toast.error(err.message || 'Failed to book appointment');
//         } finally {
//             setBooking(false);
//         }
//     };

//     // Loading state
//     if (loadingDoctor) {
//         return (
//             <div className="flex items-center justify-center min-h-[400px]">
//                 <div className="text-center space-y-3">
//                     <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
//                     <p className="text-sm text-gray-600">Loading doctor information...</p>
//                 </div>
//             </div>
//         );
//     }

//     // Error state
//     if (!doctor) {
//         return (
//             <div className="max-w-2xl mx-auto">
//                 <Alert variant="destructive">
//                     <AlertCircle className="h-4 w-4" />
//                     <AlertDescription>
//                         {error || 'Doctor not found'}
//                     </AlertDescription>
//                 </Alert>
//             </div>
//         );
//     }

//     // Disable past dates
//     const disabledDates = (date: Date) => {
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);
//         return date < today;
//     };

//     return (
//         <div className="space-y-6">
//             {/* Header */}
//             <div>
//                 <h1 className="text-3xl font-bold text-gray-900">Book Appointment</h1>
//                 <p className="text-gray-600 mt-1">Select a date and time to book your appointment</p>
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                 {/* Doctor Information */}
//                 <div className="lg:col-span-1">
//                     <Card>
//                         <CardHeader>
//                             <CardTitle className="text-lg">Doctor Information</CardTitle>
//                         </CardHeader>
//                         <CardContent className="space-y-4">
//                             <div>
//                                 <p className="text-xl font-semibold text-gray-900">
//                                     Dr. {doctor.firstName} {doctor.lastName}
//                                 </p>
//                                 <div className="flex items-center text-sm text-gray-600 mt-1">
//                                     <Stethoscope className="h-4 w-4 mr-1" />
//                                     {doctor.specialization}
//                                 </div>
//                             </div>

//                             {doctor.clinicAddress && (
//                                 <div className="flex items-start text-sm text-gray-600">
//                                     <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
//                                     <span>{doctor.clinicAddress}, {doctor.city}</span>
//                                 </div>
//                             )}

//                             {doctor.consultationFee && (
//                                 <div className="flex items-center text-sm text-gray-600">
//                                     <DollarSign className="h-4 w-4 mr-1" />
//                                     <span>{doctor.consultationFee} DZD</span>
//                                 </div>
//                             )}

//                             <div className="flex items-center text-sm text-gray-600">
//                                 <Clock className="h-4 w-4 mr-1" />
//                                 <span>{slotDuration} min sessions</span>
//                             </div>

//                             {doctor.bio && (
//                                 <div className="pt-4 border-t">
//                                     <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">About</p>
//                                     <p className="text-sm text-gray-700">{doctor.bio}</p>
//                                 </div>
//                             )}
//                         </CardContent>
//                     </Card>
//                 </div>

//                 {/* Booking Interface */}
//                 <div className="lg:col-span-2 space-y-6">
//                     {/* Calendar */}
//                     <Card>
//                         <CardHeader>
//                             <CardTitle>Select Date</CardTitle>
//                             <CardDescription>Choose a date for your appointment</CardDescription>
//                         </CardHeader>
//                         <CardContent>
//                             <Calendar
//                                 mode="single"
//                                 selected={selectedDate}
//                                 onSelect={setSelectedDate}
//                                 disabled={disabledDates}
//                                 className="rounded-md border"
//                             />
//                         </CardContent>
//                     </Card>

//                     {/* Available Slots */}
//                     {selectedDate && (
//                         <Card>
//                             <CardHeader>
//                                 <CardTitle>Available Time Slots</CardTitle>
//                                 <CardDescription>
//                                     {selectedDate.toLocaleDateString('en-US', {
//                                         weekday: 'long',
//                                         year: 'numeric',
//                                         month: 'long',
//                                         day: 'numeric',
//                                     })}
//                                 </CardDescription>
//                             </CardHeader>
//                             <CardContent>
//                                 {loadingSlots ? (
//                                     <div className="flex items-center justify-center py-8">
//                                         <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
//                                         <span className="ml-2 text-sm text-gray-600">Loading slots...</span>
//                                     </div>
//                                 ) : availableSlots.length > 0 ? (
//                                     <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
//                                         {availableSlots.map((slot) => (
//                                             <Button
//                                                 key={slot}
//                                                 variant={selectedSlot === slot ? 'default' : 'outline'}
//                                                 className="h-12"
//                                                 onClick={() => setSelectedSlot(slot)}
//                                             >
//                                                 {slot}
//                                             </Button>
//                                         ))}
//                                     </div>
//                                 ) : (
//                                     <Alert>
//                                         <AlertCircle className="h-4 w-4" />
//                                         <AlertDescription>
//                                             No available slots for this date. Please select another date.
//                                         </AlertDescription>
//                                     </Alert>
//                                 )}
//                             </CardContent>
//                         </Card>
//                     )}

//                     {/* Error Display */}
//                     {error && (
//                         <Alert variant="destructive">
//                             <AlertCircle className="h-4 w-4" />
//                             <AlertDescription>{error}</AlertDescription>
//                         </Alert>
//                     )}

//                     {/* Confirmation */}
//                     {selectedSlot && selectedDate && (
//                         <Card className="border-green-200 bg-green-50">
//                             <CardHeader>
//                                 <CardTitle className="text-green-900 flex items-center">
//                                     <CheckCircle2 className="h-5 w-5 mr-2" />
//                                     Confirm Appointment
//                                 </CardTitle>
//                             </CardHeader>
//                             <CardContent className="space-y-4">
//                                 <div className="text-sm text-green-900">
//                                     <p className="font-medium">
//                                         {selectedDate.toLocaleDateString('en-US', {
//                                             weekday: 'long',
//                                             year: 'numeric',
//                                             month: 'long',
//                                             day: 'numeric',
//                                         })}
//                                     </p>
//                                     <p className="mt-1">
//                                         Time: {selectedSlot} - {calculateEndTime(selectedSlot)}
//                                     </p>
//                                     <p className="mt-1">
//                                         Duration: {slotDuration} minutes
//                                     </p>
//                                 </div>

//                                 <Button
//                                     onClick={handleBookAppointment}
//                                     disabled={booking}
//                                     className="w-full"
//                                     size="lg"
//                                 >
//                                     {booking ? (
//                                         <>
//                                             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                                             Booking...
//                                         </>
//                                     ) : (
//                                         'Confirm Appointment'
//                                     )}
//                                 </Button>
//                             </CardContent>
//                         </Card>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }


// //--------------------------------------------------------
// src/app/patient/book/[doctorId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { doctorService } from '@/services/doctor.service';
import { appointmentService } from '@/services/appointment.service';
import { patientService } from '@/services/patient.service';
import { Doctor } from '@/types/doctor.types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { availabilityService } from '@/services/availability.service';
import { DayOfWeek } from '@/types/availability.types';
import { toast } from 'sonner';
import {
  MapPin, DollarSign, Clock, Loader2, AlertCircle,
  CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, User,
} from 'lucide-react';

// ── Date helpers ──────────────────────────────────────────────────────────────

function toLocalDateString(date: Date): string {
  const year  = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day   = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

const DAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

// ── Mini Calendar ─────────────────────────────────────────────────────────────

function MiniCalendar({ selected, onSelect }: { selected: Date | undefined; onSelect: (d: Date) => void; }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold text-slate-800">{MONTH_NAMES[viewMonth]} {viewYear}</span>
        <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {DAY_HEADERS.map(d => (
          <div key={d} className="text-center text-xs font-medium text-slate-400 py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} />;
          const cellDate = new Date(viewYear, viewMonth, day);
          cellDate.setHours(0, 0, 0, 0);
          const isPast     = cellDate < today;
          const isToday    = cellDate.getTime() === today.getTime();
          const isSelected = selected &&
            cellDate.getTime() === new Date(selected.getFullYear(), selected.getMonth(), selected.getDate()).getTime();

          return (
            <button
              key={day}
              disabled={isPast}
              onClick={() => !isPast && onSelect(cellDate)}
              className={[
                'mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm transition-all duration-150',
                isPast      ? 'text-slate-300 cursor-not-allowed'
                : isSelected ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-md font-semibold'
                : isToday    ? 'ring-2 ring-teal-400 ring-offset-1 text-teal-700 font-medium hover:bg-teal-50'
                             : 'text-slate-700 hover:bg-teal-50 hover:text-teal-700 cursor-pointer',
              ].join(' ')}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function BookAppointmentPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth('patient');
  const doctorId = params.doctorId as string;

  const [doctor,        setDoctor]        = useState<Doctor | null>(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [selectedDate,  setSelectedDate]  = useState<Date | undefined>(undefined);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots,  setLoadingSlots]  = useState(false);
  const [selectedSlot,  setSelectedSlot]  = useState<string | null>(null);
  const [booking,       setBooking]       = useState(false);
  const [error,         setError]         = useState<string | null>(null);
  const [slotDuration,  setSlotDuration]  = useState<number>(0);

  useEffect(() => { loadDoctor(); }, [doctorId]);

  useEffect(() => {
    if (selectedDate && doctor) {
      loadAvailableSlots();
      setSelectedSlot(null);
    }
  }, [selectedDate, doctor]);

  const loadDoctor = async () => {
    try {
      setLoadingDoctor(true);
      setError(null);
      const doctorData = await doctorService.getDoctorById(doctorId);
      setDoctor(doctorData);
    } catch (err: any) {
      console.error('Failed to load doctor:', err);
      setError(err.message || 'Failed to load doctor information');
    } finally {
      setLoadingDoctor(false);
    }
  };

  const loadAvailableSlots = async () => {
    if (!selectedDate || !doctor) return;
    try {
      setLoadingSlots(true);
      setError(null);
      const dateString = toLocalDateString(selectedDate);
      const slots = await appointmentService.getAvailableSlots(doctor.$id, dateString);
      setAvailableSlots(slots);

      const appointmentDate = new Date(dateString + 'T00:00:00');
      const dayOfWeek = appointmentDate.getDay() as DayOfWeek;
      const availability = await availabilityService.getDoctorAvailabilityByDay(doctor.$id, dayOfWeek);
      if (availability) setSlotDuration(availability.slotDuration);
      else setSlotDuration(0);

      if (slots.length === 0) setError('No available slots for this date');
    } catch (err: any) {
      console.error('Failed to load slots:', err);
      setError(err.message || 'Failed to load available slots');
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const calculateEndTime = (startTime: string): string => {
    if (!slotDuration) return startTime;
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + slotDuration;
    const endHours   = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedSlot || !doctor || !user) return;
    try {
      setBooking(true);
      setError(null);
      const patient = await patientService.getPatientByUserId(user.$id);
      if (!patient) throw new Error('Patient profile not found');
      const dateString = toLocalDateString(selectedDate);
      const endTime    = calculateEndTime(selectedSlot);
      await appointmentService.createAppointment({
        patientId: patient.$id,
        doctorId:  doctor.$id,
        date:      dateString,
        startTime: selectedSlot,
        endTime,
      });
      toast.success('Appointment booked successfully!');
      router.push('/patient/appointments');
    } catch (err: any) {
      console.error('Booking failed:', err);
      setError(err.message || 'Failed to book appointment');
      toast.error(err.message || 'Failed to book appointment');
    } finally {
      setBooking(false);
    }
  };

  // Loading / error states
  if (loadingDoctor) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-teal-600" />
          <p className="text-sm text-slate-500">Loading doctor information...</p>
        </div>
      </div>
    );
  }
  if (!doctor) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Doctor not found'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const profileImageUrl = doctor.profileImageId ? doctorService.getFilePreview(doctor.profileImageId) : null;
  const initials = `${doctor.firstName?.[0] ?? ''}${doctor.lastName?.[0] ?? ''}`.toUpperCase();
  const amSlots  = availableSlots.filter(s => parseInt(s.split(':')[0]) < 12);
  const pmSlots  = availableSlots.filter(s => parseInt(s.split(':')[0]) >= 12);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Book Appointment</h1>
        <p className="text-slate-500 mt-1">Select a date and time to book your appointment</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── Doctor Info Card ────────────────────────────────────────────── */}
        <div className="w-full lg:w-[380px] flex-shrink-0">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">

            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-teal-200 to-teal-300 flex items-center justify-center text-teal-700 font-bold text-xl flex-shrink-0 overflow-hidden border-2 border-white shadow-md">
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                      (e.currentTarget.parentElement as HTMLElement).innerText = initials;
                    }}
                  />
                ) : initials}
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">Dr. {doctor.firstName} {doctor.lastName}</p>
                <p className="text-sm font-medium text-teal-600 mt-0.5">{doctor.specialization}</p>
              </div>
            </div>

            <div className="border-t border-slate-100" />

            <div className="space-y-3">
              {doctor.clinicAddress && (
                <div className="flex items-start gap-2.5 text-sm text-slate-600">
                  <MapPin className="h-4 w-4 text-teal-400 mt-0.5 flex-shrink-0" />
                  <span>{doctor.clinicAddress}, {doctor.city}</span>
                </div>
              )}
              {!!doctor.consultationFee && (
                <div className="flex items-center gap-2.5 text-sm text-slate-600">
                  <DollarSign className="h-4 w-4 text-teal-400 flex-shrink-0" />
                  <span className="font-semibold text-slate-800">{doctor.consultationFee} DZD</span>
                </div>
              )}
              {slotDuration > 0 && (
                <div className="flex items-center gap-2.5 text-sm text-slate-600">
                  <Clock className="h-4 w-4 text-teal-400 flex-shrink-0" />
                  <span>{slotDuration} min sessions</span>
                </div>
              )}
            </div>

            {doctor.bio && (
              <>
                <div className="border-t border-slate-100" />
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">About</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{doctor.bio}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Booking Flow ─────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Step 1 — Calendar */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-500 text-white text-xs font-bold flex-shrink-0">1</div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Select a Date</p>
                <p className="text-xs text-slate-400">Choose when you'd like to visit</p>
              </div>
            </div>
            <MiniCalendar selected={selectedDate} onSelect={setSelectedDate} />
          </div>

          {/* Step 2 — Time Slots */}
          {selectedDate && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-500 text-white text-xs font-bold flex-shrink-0">2</div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Select a Time</p>
                  <p className="text-xs text-slate-400">{formatDisplayDate(selectedDate)}</p>
                </div>
              </div>

              {loadingSlots ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-5 w-5 animate-spin text-teal-500 mr-2" />
                  <span className="text-sm text-slate-500">Loading available times…</span>
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="space-y-4">
                  {amSlots.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Morning</p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {amSlots.map(slot => (
                          <button
                            key={slot}
                            onClick={() => setSelectedSlot(slot)}
                            className={[
                              'rounded-xl border px-3 py-2 text-sm text-center transition-all duration-150 font-medium',
                              selectedSlot === slot
                                ? 'bg-teal-500 text-white border-teal-500 shadow-sm'
                                : 'border-slate-200 text-slate-700 hover:border-teal-400 hover:bg-teal-50 hover:text-teal-700',
                            ].join(' ')}
                          >
                            {formatTime(slot)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {pmSlots.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Afternoon</p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {pmSlots.map(slot => (
                          <button
                            key={slot}
                            onClick={() => setSelectedSlot(slot)}
                            className={[
                              'rounded-xl border px-3 py-2 text-sm text-center transition-all duration-150 font-medium',
                              selectedSlot === slot
                                ? 'bg-teal-500 text-white border-teal-500 shadow-sm'
                                : 'border-slate-200 text-slate-700 hover:border-teal-400 hover:bg-teal-50 hover:text-teal-700',
                            ].join(' ')}
                          >
                            {formatTime(slot)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                  <AlertCircle className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <p className="text-sm text-slate-500">No available slots for this date. Please pick another day.</p>
                </div>
              )}
            </div>
          )}

          {/* Step 3 — Booking Summary + Confirm */}
          {selectedSlot && selectedDate && (
            <div className="bg-white rounded-2xl border border-teal-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-500 text-white text-xs font-bold flex-shrink-0">3</div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Confirm Booking</p>
                  <p className="text-xs text-slate-400">Review your appointment details</p>
                </div>
              </div>

              <div className="rounded-xl bg-teal-50 border border-teal-100 p-4 space-y-2.5 mb-5">
                <div className="flex items-center gap-2.5 text-sm">
                  <User className="h-4 w-4 text-teal-500 flex-shrink-0" />
                  <span className="text-slate-600">Dr. {doctor.firstName} {doctor.lastName}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <CalendarIcon className="h-4 w-4 text-teal-500 flex-shrink-0" />
                  <span className="text-slate-600">{formatDisplayDate(selectedDate)}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <Clock className="h-4 w-4 text-teal-500 flex-shrink-0" />
                  <span className="text-slate-600">
                    {formatTime(selectedSlot)}
                    {slotDuration > 0 && ` — ${formatTime(calculateEndTime(selectedSlot))} (${slotDuration} min)`}
                  </span>
                </div>
                {!!doctor.consultationFee && (
                  <div className="flex items-center gap-2.5 text-sm">
                    <DollarSign className="h-4 w-4 text-teal-500 flex-shrink-0" />
                    <span className="font-semibold text-slate-800">{doctor.consultationFee} DZD</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleBookAppointment}
                disabled={booking}
                className="w-full h-12 rounded-xl bg-teal-500 hover:bg-teal-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm shadow-teal-200"
              >
                {booking ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Booking…</>
                ) : (
                  <><CheckCircle2 className="h-4 w-4" /> Confirm Appointment</>
                )}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}