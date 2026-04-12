// src/services/appointment.service.ts
// src/services/appointment.service.ts
import { databases, ID } from '@/lib/appwrite';
import {
  Appointment,
  AppointmentDocument,
  AppointmentWithPatient,
  AppointmentWithDoctor, // ADDED
  CreateAppointmentDTO,
  UpdateAppointmentDTO,
  AppointmentFilters,
  AppointmentStatus,
  CancelledBy,
} from '@/types/appointment.types';
import { Query } from 'appwrite';
import { doctorService } from './doctor.service';
import { patientService } from './patient.service';
import { availabilityService } from './availability.service';
import { DayOfWeek } from '@/types/availability.types';
import type { Patient } from '@/types/patient.types';
import type { Doctor } from '@/types/doctor.types'; // ADDED

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const APPOINTMENTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_APPOINTMENTS_COLLECTION_ID!;
const AVAILABILITY_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_AVAILABILITY_COLLECTION_ID!;

function mapAppointment(doc: AppointmentDocument): Appointment {
  return {
    $id: doc.$id,
    patientId: doc.patientId,
    doctorId: doc.doctorId,
    availabilityId: doc.availabilityId,
    date: doc.date,
    startTime: doc.startTime,
    endTime: doc.endTime,
    status: doc.status,
    reason: doc.reason,
    cancelReason: doc.cancelReason,
    cancelledBy: doc.cancelledBy,
    $createdAt: doc.$createdAt,
    $updatedAt: doc.$updatedAt,
  };
}

class AppointmentService {
  /**
   * Validate time format (HH:mm)
   */
  private validateTimeFormat(time: string): boolean {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  /**
   * Convert time string (HH:mm) to minutes since midnight
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Convert minutes since midnight to time string
   */
  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Get ISO datetime string from date (UTC midnight)
   */
  private toISODateTime(date: string): string {
    const [year, month, day] = date.split('-').map(Number);
    const d = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    return d.toISOString();
  }

  /**
   * Get UTC day range for datetime queries
   */
  private getDayRange(date: string): { start: string; end: string } {
    const [year, month, day] = date.split('-').map(Number);

    const start = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    const end = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

    return {
      start: start.toISOString(),
      end: end.toISOString(),
    };
  }

  /**
   * Generate time slots from availability
   */
  private generateTimeSlotsFromAvailability(
    startTime: string,
    endTime: string,
    slotDuration: number
  ): string[] {
    const slots: string[] = [];
    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);
    let currentMinutes = startMinutes;

    while (currentMinutes + slotDuration <= endMinutes) {
      slots.push(this.minutesToTime(currentMinutes));
      currentMinutes += slotDuration;
    }

    return slots;
  }

  /**
   * Split array into chunks (SINGLE IMPLEMENTATION)
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Get doctor document $id from userId
   */
  private async getDoctorDocumentId(userId: string): Promise<string> {
    const doctor = await doctorService.getDoctorByUserId(userId);
    if (!doctor) {
      throw new Error('Doctor not found');
    }
    return doctor.$id;
  }

  /**
   * Get patient document $id from userId
   */
  private async getPatientDocumentId(userId: string): Promise<string> {
    const patient = await patientService.getPatientByUserId(userId);
    if (!patient) {
      throw new Error('Patient not found');
    }
    return patient.$id;
  }

  /**
   * Check if doctor is verified
   */
  private async validateDoctor(doctorDocumentId: string): Promise<void> {
    const doctor = await doctorService.getDoctorById(doctorDocumentId);
    if (!doctor.isVerified) {
      throw new Error('Doctor is not verified. Cannot book appointment.');
    }
  }

  /**
   * Check if appointment date is in the past
   */
  private validateNotPast(date: string, startTime: string): void {
    const [year, month, day] = date.split('-').map(Number);
    const appointmentDate = new Date(year, month - 1, day);
    const [hours, minutes] = startTime.split(':').map(Number);
    appointmentDate.setHours(hours, minutes, 0, 0);

    const now = new Date();
    if (appointmentDate <= now) {
      throw new Error('Cannot book appointment in the past');
    }
  }

  /**
   * Check if slot exists in doctor's availability
   */
  private async validateSlotInAvailability(
    doctorDocumentId: string,
    date: string,
    startTime: string,
    endTime: string
  ): Promise<string | undefined> {
    const [year, month, day] = date.split('-').map(Number);
    const appointmentDate = new Date(year, month - 1, day);
    const dayOfWeek = appointmentDate.getDay() as DayOfWeek;

    const availability = await availabilityService.getDoctorAvailabilityByDay(
      doctorDocumentId,
      dayOfWeek
    );

    if (!availability) {
      throw new Error(`Doctor is not available on ${appointmentDate.toLocaleDateString()}`);
    }

    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);
    const availStartMinutes = this.timeToMinutes(availability.startTime);
    const availEndMinutes = this.timeToMinutes(availability.endTime);

    if (startMinutes < availStartMinutes || endMinutes > availEndMinutes) {
      throw new Error(
        `Appointment time must be between ${availability.startTime} and ${availability.endTime}`
      );
    }

    const requestedDuration = endMinutes - startMinutes;
    if (requestedDuration !== availability.slotDuration) {
      throw new Error(`Appointment duration must be ${availability.slotDuration} minutes`);
    }

    const slots = availabilityService.generateTimeSlots(availability);
    const isValidSlot = slots.some((slot) => slot.time === startTime);

    if (!isValidSlot) {
      throw new Error(
        `Invalid time slot. Available slots start at: ${slots.map((s) => s.time).join(', ')}`
      );
    }

    return availability.$id;
  }

  /**
   * Check if slot is already booked
   */
  async checkSlotAvailability(
    doctorDocumentId: string,
    date: string,
    startTime: string
  ): Promise<boolean> {
    try {
      const { start, end } = this.getDayRange(date);

      const response = await databases.listDocuments<AppointmentDocument>(
        DATABASE_ID,
        APPOINTMENTS_COLLECTION_ID,
        [
          Query.equal('doctorId', doctorDocumentId),
          Query.greaterThanEqual('date', start),
          Query.lessThanEqual('date', end),
          Query.equal('startTime', startTime),
          Query.notEqual('status', 'cancelled'),
        ]
      );

      return response.documents.length === 0;
    } catch (error) {
      console.error('Error checking slot availability:', error);
      throw new Error('Failed to check slot availability');
    }
  }

  /**
   * Create new appointment
   */
  async createAppointment(data: CreateAppointmentDTO): Promise<Appointment> {
    try {
      if (!this.validateTimeFormat(data.startTime)) {
        throw new Error('Invalid start time format. Use HH:mm');
      }
      if (!this.validateTimeFormat(data.endTime)) {
        throw new Error('Invalid end time format. Use HH:mm');
      }

      await this.validateDoctor(data.doctorId);
      this.validateNotPast(data.date, data.startTime);

      const availabilityId = await this.validateSlotInAvailability(
        data.doctorId,
        data.date,
        data.startTime,
        data.endTime
      );

      const isAvailable = await this.checkSlotAvailability(
        data.doctorId,
        data.date,
        data.startTime
      );

      if (!isAvailable) {
        throw new Error('This time slot is already booked');
      }

      const isoDate = this.toISODateTime(data.date);

      const document = await databases.createDocument<AppointmentDocument>(
        DATABASE_ID,
        APPOINTMENTS_COLLECTION_ID,
        ID.unique(),
        {
          patientId: data.patientId,
          doctorId: data.doctorId,
          availabilityId,
          date: isoDate,
          startTime: data.startTime,
          endTime: data.endTime,
          status: 'pending',
          reason: data.reason,
        }
      );

      return mapAppointment(document);
    } catch (error: any) {
      console.error('Error creating appointment:', error);

      if (error.code === 409 || error.message?.includes('unique')) {
        throw new Error('This time slot is already booked');
      }

      throw new Error(error.message || 'Failed to create appointment');
    }
  }

  /**
   * Get appointment by ID
   */
  async getAppointmentById(appointmentId: string): Promise<Appointment> {
    try {
      const document = await databases.getDocument<AppointmentDocument>(
        DATABASE_ID,
        APPOINTMENTS_COLLECTION_ID,
        appointmentId
      );

      return mapAppointment(document);
    } catch (error) {
      console.error('Error fetching appointment:', error);
      throw new Error('Failed to fetch appointment');
    }
  }

  /**
   * Get appointments for a doctor
   */
  async getAppointmentsByDoctor(
    doctorDocumentId: string,
    filters?: AppointmentFilters
  ): Promise<Appointment[]> {
    try {
      const queries = [Query.equal('doctorId', doctorDocumentId)];

      if (filters?.status) {
        queries.push(Query.equal('status', filters.status));
      }

      if (filters?.fromDate) {
        const { start } = this.getDayRange(filters.fromDate);
        queries.push(Query.greaterThanEqual('date', start));
      }

      if (filters?.toDate) {
        const { end } = this.getDayRange(filters.toDate);
        queries.push(Query.lessThanEqual('date', end));
      }

      queries.push(Query.orderDesc('date'));

      const response = await databases.listDocuments<AppointmentDocument>(
        DATABASE_ID,
        APPOINTMENTS_COLLECTION_ID,
        queries
      );

      return response.documents.map(mapAppointment);
    } catch (error) {
      console.error('Error fetching doctor appointments:', error);
      throw new Error('Failed to fetch appointments');
    }
  }

  /**
   * Get appointments for a patient
   */
  async getAppointmentsByPatient(
    patientDocumentId: string,
    filters?: AppointmentFilters
  ): Promise<Appointment[]> {
    try {
      const queries = [Query.equal('patientId', patientDocumentId)];

      if (filters?.status) {
        queries.push(Query.equal('status', filters.status));
      }

      if (filters?.fromDate) {
        const { start } = this.getDayRange(filters.fromDate);
        queries.push(Query.greaterThanEqual('date', start));
      }

      if (filters?.toDate) {
        const { end } = this.getDayRange(filters.toDate);
        queries.push(Query.lessThanEqual('date', end));
      }

      queries.push(Query.orderDesc('date'));

      const response = await databases.listDocuments<AppointmentDocument>(
        DATABASE_ID,
        APPOINTMENTS_COLLECTION_ID,
        queries
      );

      return response.documents.map(mapAppointment);
    } catch (error) {
      console.error('Error fetching patient appointments:', error);
      throw new Error('Failed to fetch appointments');
    }
  }

  /**
   * Update appointment status
   */
  async updateStatus(appointmentId: string, status: AppointmentStatus): Promise<Appointment> {
    try {
      const document = await databases.updateDocument<AppointmentDocument>(
        DATABASE_ID,
        APPOINTMENTS_COLLECTION_ID,
        appointmentId,
        { status }
      );

      return mapAppointment(document);
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw new Error('Failed to update appointment status');
    }
  }

  /**
   * Update appointment status (alternative name for consistency)
   */
  async updateAppointmentStatus(
    appointmentId: string,
    status: AppointmentStatus
  ): Promise<Appointment> {
    return this.updateStatus(appointmentId, status);
  }

  /**
   * Cancel appointment
   */
  async cancelAppointment(
    appointmentId: string,
    cancelledBy: CancelledBy,
    cancelReason?: string
  ): Promise<Appointment> {
    try {
      const appointment = await this.getAppointmentById(appointmentId);

      if (appointment.status === 'cancelled') {
        throw new Error('Appointment is already cancelled');
      }

      if (appointment.status === 'completed') {
        throw new Error('Cannot cancel completed appointment');
      }

      const document = await databases.updateDocument<AppointmentDocument>(
        DATABASE_ID,
        APPOINTMENTS_COLLECTION_ID,
        appointmentId,
        {
          status: 'cancelled',
          cancelledBy,
          cancelReason,
        }
      );

      return mapAppointment(document);
    } catch (error: any) {
      console.error('Error cancelling appointment:', error);
      throw new Error(error.message || 'Failed to cancel appointment');
    }
  }

  /**
   * Get upcoming appointments for a doctor
   */
  async getUpcomingAppointmentsByDoctor(doctorDocumentId: string): Promise<Appointment[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { start } = this.getDayRange(today);

      const response = await databases.listDocuments<AppointmentDocument>(
        DATABASE_ID,
        APPOINTMENTS_COLLECTION_ID,
        [
          Query.equal('doctorId', doctorDocumentId),
          Query.greaterThanEqual('date', start),
          Query.notEqual('status', 'cancelled'),
          Query.orderAsc('date'),
        ]
      );

      return response.documents.map(mapAppointment);
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
      throw new Error('Failed to fetch upcoming appointments');
    }
  }

  /**
   * Get upcoming appointments for a patient
   */
  async getUpcomingAppointmentsByPatient(patientDocumentId: string): Promise<Appointment[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { start } = this.getDayRange(today);

      const response = await databases.listDocuments<AppointmentDocument>(
        DATABASE_ID,
        APPOINTMENTS_COLLECTION_ID,
        [
          Query.equal('patientId', patientDocumentId),
          Query.greaterThanEqual('date', start),
          Query.notEqual('status', 'cancelled'),
          Query.orderAsc('date'),
        ]
      );

      return response.documents.map(mapAppointment);
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
      throw new Error('Failed to fetch upcoming appointments');
    }
  }

  /**
   * Get available slots for a doctor on a specific date
   */
  async getAvailableSlots(doctorDocumentId: string, date: string): Promise<string[]> {
    try {
      const [year, month, day] = date.split('-').map(Number);
      const appointmentDate = new Date(year, month - 1, day);
      const dayOfWeek = appointmentDate.getDay();

      const availabilityResponse = await databases.listDocuments(
        DATABASE_ID,
        AVAILABILITY_COLLECTION_ID,
        [
          Query.equal('doctorId', doctorDocumentId),
          Query.equal('dayOfWeek', dayOfWeek),
          Query.limit(1),
        ]
      );

      if (availabilityResponse.documents.length === 0) {
        return [];
      }

      const availability = availabilityResponse.documents[0];

      const allSlots = this.generateTimeSlotsFromAvailability(
        availability.startTime,
        availability.endTime,
        availability.slotDuration
      );

      const { start, end } = this.getDayRange(date);

      const appointmentsResponse = await databases.listDocuments<AppointmentDocument>(
        DATABASE_ID,
        APPOINTMENTS_COLLECTION_ID,
        [
          Query.equal('doctorId', doctorDocumentId),
          Query.greaterThanEqual('date', start),
          Query.lessThanEqual('date', end),
          Query.notEqual('status', 'cancelled'),
        ]
      );

      const bookedTimes = new Set(appointmentsResponse.documents.map((appt) => appt.startTime));

      return allSlots.filter((slot) => !bookedTimes.has(slot));
    } catch (error) {
      console.error('Error getting available slots:', error);
      throw new Error('Failed to get available slots');
    }
  }

  /**
   * Helper: Convert Auth userId to document $id for doctor
   */
  async doctorUserIdToDocumentId(userId: string): Promise<string> {
    return this.getDoctorDocumentId(userId);
  }

  /**
   * Helper: Convert Auth userId to document $id for patient
   */
  async patientUserIdToDocumentId(userId: string): Promise<string> {
    return this.getPatientDocumentId(userId);
  }

  /**
   * Enrich appointments with patient data
   */
  private async enrichAppointmentsWithPatients(
    appointments: Appointment[]
  ): Promise<AppointmentWithPatient[]> {
    if (appointments.length === 0) return [];

    try {
      const uniquePatientIds = [...new Set(appointments.map((apt) => apt.patientId))];
      const patientMap = new Map<string, Patient>();
      const chunks = this.chunkArray(uniquePatientIds, 100);
      const PATIENTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_PATIENTS_COLLECTION_ID!;

      for (const chunk of chunks) {
        const patientsResponse = await databases.listDocuments(
          DATABASE_ID,
          PATIENTS_COLLECTION_ID,
          [Query.equal('$id', chunk), Query.limit(100)]
        );

        patientsResponse.documents.forEach((doc: any) => {
          const patient = patientService.mapPatient(doc);
          patientMap.set(patient.$id, patient);
        });
      }

      return appointments.map((appointment) => {
        const patient = patientMap.get(appointment.patientId);

        if (!patient) {
          console.warn(`Patient not found for appointment ${appointment.$id}`);
          return {
            ...appointment,
            patient: {
              firstName: 'Unknown',
              lastName: 'Patient',
              fullName: 'Unknown Patient',
              phone: undefined,
            },
          };
        }

        return {
          ...appointment,
          patient: {
            firstName: patient.firstName,
            lastName: patient.lastName,
            fullName: `${patient.firstName} ${patient.lastName}`,
            phone: patient.phone,
          },
        };
      });
    } catch (error) {
      console.error('Error enriching appointments with patient data:', error);
      return appointments.map((apt) => ({
        ...apt,
        patient: {
          firstName: 'Unknown',
          lastName: 'Patient',
          fullName: 'Unknown Patient',
          phone: undefined,
        },
      }));
    }
  }

  /**
   * Enrich appointments with doctor information
   */
  private async enrichAppointmentsWithDoctors(
    appointments: Appointment[]
  ): Promise<AppointmentWithDoctor[]> {
    if (appointments.length === 0) return [];

    try {
      const uniqueDoctorIds = [...new Set(appointments.map((apt) => apt.doctorId))];
      const doctorMap = new Map<string, Doctor>();
      const chunks = this.chunkArray(uniqueDoctorIds, 100);
      const DOCTORS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_DOCTORS_COLLECTION_ID!;

      for (const chunk of chunks) {
        const doctorsResponse = await databases.listDocuments(
          DATABASE_ID,
          DOCTORS_COLLECTION_ID,
          [Query.equal('$id', chunk), Query.limit(100)]
        );

        doctorsResponse.documents.forEach((doc: any) => {
          const doctor = doc as Doctor; // Cast directly since we know the structure
          doctorMap.set(doctor.$id, doctor);
        });
      }

      return appointments.map((appointment) => {
        const doctor = doctorMap.get(appointment.doctorId);

        if (!doctor) {
          console.warn(`Doctor not found for appointment ${appointment.$id}`);
          return {
            ...appointment,
            doctor: {
              firstName: 'Unknown',
              lastName: 'Doctor',
              fullName: 'Unknown Doctor',
              specialization: 'N/A',
              city: 'N/A',
            },
          };
        }

        return {
          ...appointment,
          doctor: {
            firstName: doctor.firstName,
            lastName: doctor.lastName,
            fullName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
            specialization: doctor.specialization,
            city: doctor.city,
            clinicName: doctor.clinicName,
            clinicAddress: doctor.clinicAddress,
          },
        };
      });
    } catch (error) {
      console.error('Error enriching appointments with doctor data:', error);
      return appointments.map((apt) => ({
        ...apt,
        doctor: {
          firstName: 'Unknown',
          lastName: 'Doctor',
          fullName: 'Unknown Doctor',
          specialization: 'N/A',
          city: 'N/A',
        },
      }));
    }
  }

  /**
   * Get upcoming appointments with patient data for a doctor
   */
  async getUpcomingAppointmentsWithPatient(
    doctorDocumentId: string
  ): Promise<AppointmentWithPatient[]> {
    try {
      const appointments = await this.getUpcomingAppointmentsByDoctor(doctorDocumentId);
      return await this.enrichAppointmentsWithPatients(appointments);
    } catch (error) {
      console.error('Error fetching appointments with patient data:', error);
      throw new Error('Failed to fetch appointments with patient data');
    }
  }

  /**
   * Get appointments with patient data for a doctor (with filters)
   */
  async getAppointmentsWithPatient(
    doctorDocumentId: string,
    filters?: AppointmentFilters
  ): Promise<AppointmentWithPatient[]> {
    try {
      const appointments = await this.getAppointmentsByDoctor(doctorDocumentId, filters);
      return await this.enrichAppointmentsWithPatients(appointments);
    } catch (error) {
      console.error('Error fetching filtered appointments with patient data:', error);
      throw new Error('Failed to fetch appointments with patient data');
    }
  }

  /**
   * Get appointments for a patient with doctor information
   */
  async getAppointmentsByPatientWithDoctor(
    patientDocumentId: string
  ): Promise<AppointmentWithDoctor[]> {
    try {
      const appointments = await this.getAppointmentsByPatient(patientDocumentId);
      return await this.enrichAppointmentsWithDoctors(appointments);
    } catch (error) {
      console.error('Error fetching patient appointments with doctor:', error);
      throw new Error('Failed to fetch appointments');
    }
  }
}

export const appointmentService = new AppointmentService();