// src/types/appointment.types.ts
import type { Models } from 'appwrite';
import type { Patient } from './patient.types';

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type CancelledBy = 'patient' | 'doctor';

export type AppointmentDocument = Models.Document & {
  patientId: string;
  doctorId: string;
  availabilityId?: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  reason?: string;
  cancelReason?: string;
  cancelledBy?: CancelledBy;
};

export interface Appointment {
  $id: string;
  patientId: string;
  doctorId: string;
  availabilityId?: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  reason?: string;
  cancelReason?: string;
  cancelledBy?: CancelledBy;
  $createdAt: string;
  $updatedAt: string;
}

// NEW: Appointment with embedded patient data
export interface AppointmentWithPatient extends Appointment {
  patient: {
    firstName: string;
    lastName: string;
    fullName: string;
    phone?: string;
  };
}

export interface CreateAppointmentDTO {
  patientId: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
}

export interface UpdateAppointmentDTO {
  status?: AppointmentStatus;
  reason?: string;
  cancelReason?: string;
  cancelledBy?: CancelledBy;
}

export interface AppointmentFilters {
  status?: AppointmentStatus;
  fromDate?: string;
  toDate?: string;
}
export interface AppointmentWithDoctor extends Appointment {
  doctor: {
    firstName: string;
    lastName: string;
    fullName: string;
    specialization: string;
    city: string;
    clinicName?: string;
    clinicAddress?: string;
  };
}