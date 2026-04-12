// src/app/patient/book/[doctorId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { doctorService } from '@/services/doctor.service';
import { appointmentService } from '@/services/appointment.service';
import { patientService } from '@/services/patient.service';
import { Doctor } from '@/types/doctor.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { availabilityService } from '@/services/availability.service';
import { DayOfWeek } from '@/types/availability.types';

import { toast } from 'sonner';
import {
    Stethoscope,
    MapPin,
    DollarSign,
    Clock,
    Loader2,
    AlertCircle,
    CheckCircle2,
} from 'lucide-react';

// Converts a Date to YYYY-MM-DD using LOCAL time parts (never toISOString)
function toLocalDateString(date: Date): string {
  const year  = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day   = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function BookAppointmentPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth('patient');

    const doctorId = params.doctorId as string;

    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [loadingDoctor, setLoadingDoctor] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [booking, setBooking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [slotDuration, setSlotDuration] = useState<number>(0);
    // Load doctor data
    useEffect(() => {
        loadDoctor();
    }, [doctorId]);

    // Load slots when date changes
    useEffect(() => {
        if (selectedDate && doctor) {
            loadAvailableSlots();
            setSelectedSlot(null); // Reset selected slot on date change
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

            // 🔥 جلب الخانات مباشرة من الخدمة
            const slots = await appointmentService.getAvailableSlots(
                doctor.$id,
                dateString
            );

            setAvailableSlots(slots);

            // 🔥 مهم: جلب availability لاستخراج slotDuration
            const appointmentDate = new Date(dateString + 'T00:00:00');
            const dayOfWeek = appointmentDate.getDay() as DayOfWeek;
            const availability = await availabilityService.getDoctorAvailabilityByDay(
                doctor.$id,
                dayOfWeek
            );

            if (availability) {
                setSlotDuration(availability.slotDuration);
            } else {
                setSlotDuration(0);
            }

            if (slots.length === 0) {
                setError('No available slots for this date');
            }

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
        const endHours = Math.floor(totalMinutes / 60);
        const endMinutes = totalMinutes % 60;

        return `${endHours.toString().padStart(2, '0')}:${endMinutes
            .toString()
            .padStart(2, '0')}`;
    };
    const handleBookAppointment = async () => {
        if (!selectedDate || !selectedSlot || !doctor || !user) return;

        try {
            setBooking(true);
            setError(null);

            // Get patient document $id
            const patient = await patientService.getPatientByUserId(user.$id);
            if (!patient) {
                throw new Error('Patient profile not found');
            }

            const dateString = toLocalDateString(selectedDate);
            const endTime = calculateEndTime(selectedSlot);

            await appointmentService.createAppointment({
                patientId: patient.$id,
                doctorId: doctor.$id,
                date: dateString,
                startTime: selectedSlot,
                endTime: endTime,
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

    // Loading state
    if (loadingDoctor) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                    <p className="text-sm text-gray-600">Loading doctor information...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (!doctor) {
        return (
            <div className="max-w-2xl mx-auto">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {error || 'Doctor not found'}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // Disable past dates
    const disabledDates = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Book Appointment</h1>
                <p className="text-gray-600 mt-1">Select a date and time to book your appointment</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Doctor Information */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Doctor Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-xl font-semibold text-gray-900">
                                    Dr. {doctor.firstName} {doctor.lastName}
                                </p>
                                <div className="flex items-center text-sm text-gray-600 mt-1">
                                    <Stethoscope className="h-4 w-4 mr-1" />
                                    {doctor.specialization}
                                </div>
                            </div>

                            {doctor.clinicAddress && (
                                <div className="flex items-start text-sm text-gray-600">
                                    <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                                    <span>{doctor.clinicAddress}, {doctor.city}</span>
                                </div>
                            )}

                            {doctor.consultationFee && (
                                <div className="flex items-center text-sm text-gray-600">
                                    <DollarSign className="h-4 w-4 mr-1" />
                                    <span>{doctor.consultationFee} DZD</span>
                                </div>
                            )}

                            <div className="flex items-center text-sm text-gray-600">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>{slotDuration} min sessions</span>
                            </div>

                            {doctor.bio && (
                                <div className="pt-4 border-t">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">About</p>
                                    <p className="text-sm text-gray-700">{doctor.bio}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Booking Interface */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Calendar */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Select Date</CardTitle>
                            <CardDescription>Choose a date for your appointment</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                disabled={disabledDates}
                                className="rounded-md border"
                            />
                        </CardContent>
                    </Card>

                    {/* Available Slots */}
                    {selectedDate && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Available Time Slots</CardTitle>
                                <CardDescription>
                                    {selectedDate.toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loadingSlots ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                                        <span className="ml-2 text-sm text-gray-600">Loading slots...</span>
                                    </div>
                                ) : availableSlots.length > 0 ? (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                        {availableSlots.map((slot) => (
                                            <Button
                                                key={slot}
                                                variant={selectedSlot === slot ? 'default' : 'outline'}
                                                className="h-12"
                                                onClick={() => setSelectedSlot(slot)}
                                            >
                                                {slot}
                                            </Button>
                                        ))}
                                    </div>
                                ) : (
                                    <Alert>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            No available slots for this date. Please select another date.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Error Display */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Confirmation */}
                    {selectedSlot && selectedDate && (
                        <Card className="border-green-200 bg-green-50">
                            <CardHeader>
                                <CardTitle className="text-green-900 flex items-center">
                                    <CheckCircle2 className="h-5 w-5 mr-2" />
                                    Confirm Appointment
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-sm text-green-900">
                                    <p className="font-medium">
                                        {selectedDate.toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                    <p className="mt-1">
                                        Time: {selectedSlot} - {calculateEndTime(selectedSlot)}
                                    </p>
                                    <p className="mt-1">
                                        Duration: {slotDuration} minutes
                                    </p>
                                </div>

                                <Button
                                    onClick={handleBookAppointment}
                                    disabled={booking}
                                    className="w-full"
                                    size="lg"
                                >
                                    {booking ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Booking...
                                        </>
                                    ) : (
                                        'Confirm Appointment'
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}