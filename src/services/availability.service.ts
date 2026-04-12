/// Service for managing doctor availability schedules
//src/services/availability.service.ts
import { databases, ID } from '@/lib/appwrite';
import {
  DoctorAvailability,
  CreateAvailabilityDTO,
  UpdateAvailabilityDTO,
  AvailabilityDocument,
  DayOfWeek,
  TimeSlot,
  DaySchedule,
  DAY_NAMES,
} from '@/types/availability.types';
import { Query } from 'appwrite';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const AVAILABILITY_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_AVAILABILITY_COLLECTION_ID!;

function mapAvailability(doc: AvailabilityDocument): DoctorAvailability {
  return {
    $id: doc.$id,
    doctorId: doc.doctorId,
    dayOfWeek: Number(doc.dayOfWeek) as DayOfWeek,
    startTime: doc.startTime,
    endTime: doc.endTime,
    slotDuration: doc.slotDuration,
    $createdAt: doc.$createdAt,
    $updatedAt: doc.$updatedAt,
  };
}

class AvailabilityService {
  /**
   * Validate time format (HH:mm)
   */
  private validateTimeFormat(time: string): boolean {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  /**
   * Validate availability data
   */
  private validateAvailability(data: CreateAvailabilityDTO): void {
    if (data.dayOfWeek < 0 || data.dayOfWeek > 6) {
      throw new Error('Invalid day of week. Must be between 0 (Sunday) and 6 (Saturday)');
    }

    if (!this.validateTimeFormat(data.startTime)) {
      throw new Error('Invalid start time format. Use HH:mm (e.g., 09:00)');
    }

    if (!this.validateTimeFormat(data.endTime)) {
      throw new Error('Invalid end time format. Use HH:mm (e.g., 17:00)');
    }

    if (data.startTime >= data.endTime) {
      throw new Error('End time must be after start time');
    }

    if (data.slotDuration <= 0 || data.slotDuration > 240) {
      throw new Error('Slot duration must be between 1 and 240 minutes');
    }
  }

  /**
   * Convert time string (HH:mm) to minutes since midnight
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Convert minutes since midnight to time string (HH:mm)
   */
  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Generate time slots for a given availability
   */
  generateTimeSlots(availability: DoctorAvailability): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const startMinutes = this.timeToMinutes(availability.startTime);
    const endMinutes = this.timeToMinutes(availability.endTime);

    let currentMinutes = startMinutes;
    while (currentMinutes + availability.slotDuration <= endMinutes) {
      slots.push({
        time: this.minutesToTime(currentMinutes),
        available: true, // Will be updated based on appointments
      });
      currentMinutes += availability.slotDuration;
    }

    return slots;
  }

  /**
   * Create new availability for a doctor
   */
  async createAvailability(data: CreateAvailabilityDTO): Promise<DoctorAvailability> {
    try {
      this.validateAvailability(data);

      // Check if availability already exists for this doctor on this day
      const existing = await this.getDoctorAvailabilityByDay(data.doctorId, data.dayOfWeek);
      if (existing) {
        throw new Error(`Availability already exists for ${DAY_NAMES[data.dayOfWeek]}`);
      }

      const document = await databases.createDocument<AvailabilityDocument>(
        DATABASE_ID,
        AVAILABILITY_COLLECTION_ID,
        ID.unique(),
        data
      );

      return mapAvailability(document);
    } catch (error: any) {
      console.error('Error creating availability:', error);
      throw new Error(error.message || 'Failed to create availability');
    }
  }

  /**
   * Get all availability for a doctor
   */
  async getDoctorAvailability(doctorId: string): Promise<DoctorAvailability[]> {
    try {
      const response = await databases.listDocuments<AvailabilityDocument>(
        DATABASE_ID,
        AVAILABILITY_COLLECTION_ID,
        [Query.equal('doctorId', doctorId), Query.orderAsc('dayOfWeek')]
      );

      return response.documents.map(mapAvailability);
    } catch (error) {
      console.error('Error fetching doctor availability:', error);
      throw new Error('Failed to fetch availability');
    }
  }

  /**
   * Get availability for a specific day
   */
  async getDoctorAvailabilityByDay(
    doctorId: string,
    dayOfWeek: DayOfWeek
  ): Promise<DoctorAvailability | null> {
    try {
      const response = await databases.listDocuments<AvailabilityDocument>(
        DATABASE_ID,
        AVAILABILITY_COLLECTION_ID,
        [
          Query.equal('doctorId', doctorId),
          Query.equal('dayOfWeek', Number(dayOfWeek)),
          Query.limit(1),
        ]
      );

      return response.documents.length > 0 ? mapAvailability(response.documents[0]) : null;
    } catch (error) {
      console.error('Error fetching availability by day:', error);
      throw new Error('Failed to fetch availability');
    }
  }

  /**
   * Get availability by document ID
   */
  async getAvailabilityById(availabilityId: string): Promise<DoctorAvailability> {
    try {
      const document = await databases.getDocument<AvailabilityDocument>(
        DATABASE_ID,
        AVAILABILITY_COLLECTION_ID,
        availabilityId
      );

      return mapAvailability(document);
    } catch (error) {
      console.error('Error fetching availability by ID:', error);
      throw new Error('Failed to fetch availability');
    }
  }

  /**
   * Update availability
   */
  async updateAvailability(
    availabilityId: string,
    data: UpdateAvailabilityDTO
  ): Promise<DoctorAvailability> {
    try {
      // Validate time formats if provided
      if (data.startTime && !this.validateTimeFormat(data.startTime)) {
        throw new Error('Invalid start time format. Use HH:mm');
      }
      if (data.endTime && !this.validateTimeFormat(data.endTime)) {
        throw new Error('Invalid end time format. Use HH:mm');
      }

      // Get existing availability to validate time ranges
      const existing = await this.getAvailabilityById(availabilityId);
      const startTime = data.startTime || existing.startTime;
      const endTime = data.endTime || existing.endTime;

      if (startTime >= endTime) {
        throw new Error('End time must be after start time');
      }

      const document = await databases.updateDocument<AvailabilityDocument>(
        DATABASE_ID,
        AVAILABILITY_COLLECTION_ID,
        availabilityId,
        data
      );

      return mapAvailability(document);
    } catch (error: any) {
      console.error('Error updating availability:', error);
      throw new Error(error.message || 'Failed to update availability');
    }
  }

  /**
   * Delete availability
   */
  async deleteAvailability(availabilityId: string): Promise<void> {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        AVAILABILITY_COLLECTION_ID,
        availabilityId
      );
    } catch (error) {
      console.error('Error deleting availability:', error);
      throw new Error('Failed to delete availability');
    }
  }

  /**
   * Get full week schedule for a doctor (with or without availability)
   */
  async getDoctorWeekSchedule(doctorId: string): Promise<DaySchedule[]> {
    try {
      const availabilities = await this.getDoctorAvailability(doctorId);
      const schedule: DaySchedule[] = [];

      for (let day = 0; day <= 6; day++) {
        const dayOfWeek = day as DayOfWeek;
        const availability = availabilities.find((a) => a.dayOfWeek === dayOfWeek);

        schedule.push({
          dayOfWeek,
          dayName: DAY_NAMES[dayOfWeek],
          slots: availability ? this.generateTimeSlots(availability) : [],
          isConfigured: !!availability,
        });
      }

      return schedule;
    } catch (error) {
      console.error('Error fetching week schedule:', error);
      throw new Error('Failed to fetch week schedule');
    }
  }

  /**
   * Bulk create/update availability for multiple days
   */
  async bulkSetAvailability(
    doctorId: string,
    availabilities: CreateAvailabilityDTO[]
  ): Promise<DoctorAvailability[]> {
    try {
      const results: DoctorAvailability[] = [];

      for (const data of availabilities) {
        const existing = await this.getDoctorAvailabilityByDay(doctorId, data.dayOfWeek);

        if (existing) {
          // Update existing
          const updated = await this.updateAvailability(existing.$id, {
            startTime: data.startTime,
            endTime: data.endTime,
            slotDuration: data.slotDuration,
          });
          results.push(updated);
        } else {
          // Create new
          const created = await this.createAvailability(data);
          results.push(created);
        }
      }

      return results;
    } catch (error: any) {
      console.error('Error bulk setting availability:', error);
      throw new Error(error.message || 'Failed to set availability');
    }
  }

  /**
   * Check if doctor is available on a specific date and time
   */
  async isAvailableAt(doctorId: string, date: Date, time: string): Promise<boolean> {
    try {
      const dayOfWeek = date.getDay() as DayOfWeek;
      const availability = await this.getDoctorAvailabilityByDay(doctorId, dayOfWeek);

      if (!availability) return false;

      const timeMinutes = this.timeToMinutes(time);
      const startMinutes = this.timeToMinutes(availability.startTime);
      const endMinutes = this.timeToMinutes(availability.endTime);

      return timeMinutes >= startMinutes && timeMinutes < endMinutes;
    } catch (error) {
      console.error('Error checking availability:', error);
      return false;
    }
  }
}

export const availabilityService = new AvailabilityService();