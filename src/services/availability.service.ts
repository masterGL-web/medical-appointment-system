// src/services/availability.service.ts
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

const DATABASE_ID            = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const AVAILABILITY_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_AVAILABILITY_COLLECTION_ID!;

function mapAvailability(doc: AvailabilityDocument): DoctorAvailability {
  return {
    $id:            doc.$id,
    doctorId:       doc.doctorId,
    dayOfWeek:      Number(doc.dayOfWeek) as DayOfWeek,
    startTime:      doc.startTime,
    endTime:        doc.endTime,
    slotDuration:   doc.slotDuration,
    hasBreak:       doc.hasBreak       ?? false,
    breakStartTime: doc.breakStartTime ?? null,
    breakEndTime:   doc.breakEndTime   ?? null,
    $createdAt:     doc.$createdAt,
    $updatedAt:     doc.$updatedAt,
  };
}

class AvailabilityService {

  // ── Private helpers ────────────────────────────────────────────────────────

  private validateTimeFormat(time: string): boolean {
    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
  }

  private timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  private minutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

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

    // Validate break times when hasBreak is true
    if (data.hasBreak) {
      if (!data.breakStartTime || !data.breakEndTime) {
        throw new Error('Break start and end times are required when break is enabled');
      }
      if (!this.validateTimeFormat(data.breakStartTime)) {
        throw new Error('Invalid break start time format. Use HH:mm');
      }
      if (!this.validateTimeFormat(data.breakEndTime)) {
        throw new Error('Invalid break end time format. Use HH:mm');
      }
      if (data.breakStartTime <= data.startTime) {
        throw new Error('Break start must be after work start time');
      }
      if (data.breakEndTime >= data.endTime) {
        throw new Error('Break end must be before work end time');
      }
      if (data.breakStartTime >= data.breakEndTime) {
        throw new Error('Break end time must be after break start time');
      }
    }
  }

  // ── Core: slot generation with break support ───────────────────────────────

  generateTimeSlots(availability: DoctorAvailability): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const { startTime, endTime, slotDuration, hasBreak, breakStartTime, breakEndTime } = availability;

    if (hasBreak && breakStartTime && breakEndTime) {
      // Morning session: startTime → breakStartTime
      const morningStart  = this.timeToMinutes(startTime);
      const morningEnd    = this.timeToMinutes(breakStartTime);
      let current         = morningStart;
      while (current + slotDuration <= morningEnd) {
        slots.push({
          time:      this.minutesToTime(current),
          available: true,
          session:   'morning',
        });
        current += slotDuration;
      }

      // Afternoon session: breakEndTime → endTime
      const afternoonStart = this.timeToMinutes(breakEndTime);
      const afternoonEnd   = this.timeToMinutes(endTime);
      current              = afternoonStart;
      while (current + slotDuration <= afternoonEnd) {
        slots.push({
          time:      this.minutesToTime(current),
          available: true,
          session:   'afternoon',
        });
        current += slotDuration;
      }
    } else {
      // No break — original behaviour
      const start = this.timeToMinutes(startTime);
      const end   = this.timeToMinutes(endTime);
      let current = start;
      while (current + slotDuration <= end) {
        slots.push({
          time:      this.minutesToTime(current),
          available: true,
          session:   'full',
        });
        current += slotDuration;
      }
    }

    return slots;
  }

  // ── CRUD ───────────────────────────────────────────────────────────────────

  async createAvailability(data: CreateAvailabilityDTO): Promise<DoctorAvailability> {
    try {
      this.validateAvailability(data);

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
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to create availability';
      throw new Error(msg);
    }
  }

  async getDoctorAvailability(doctorId: string): Promise<DoctorAvailability[]> {
    try {
      const response = await databases.listDocuments<AvailabilityDocument>(
        DATABASE_ID,
        AVAILABILITY_COLLECTION_ID,
        [Query.equal('doctorId', doctorId), Query.orderAsc('dayOfWeek')]
      );
      return response.documents.map(mapAvailability);
    } catch {
      throw new Error('Failed to fetch availability');
    }
  }

  async getDoctorAvailabilityByDay(
    doctorId:  string,
    dayOfWeek: DayOfWeek
  ): Promise<DoctorAvailability | null> {
    try {
      const response = await databases.listDocuments<AvailabilityDocument>(
        DATABASE_ID,
        AVAILABILITY_COLLECTION_ID,
        [
          Query.equal('doctorId',  doctorId),
          Query.equal('dayOfWeek', Number(dayOfWeek)),
          Query.limit(1),
        ]
      );
      return response.documents.length > 0 ? mapAvailability(response.documents[0]) : null;
    } catch {
      throw new Error('Failed to fetch availability');
    }
  }

  async getAvailabilityById(availabilityId: string): Promise<DoctorAvailability> {
    try {
      const document = await databases.getDocument<AvailabilityDocument>(
        DATABASE_ID,
        AVAILABILITY_COLLECTION_ID,
        availabilityId
      );
      return mapAvailability(document);
    } catch {
      throw new Error('Failed to fetch availability');
    }
  }

  async updateAvailability(
    availabilityId: string,
    data: UpdateAvailabilityDTO
  ): Promise<DoctorAvailability> {
    try {
      const existing  = await this.getAvailabilityById(availabilityId);
      const startTime = data.startTime ?? existing.startTime;
      const endTime   = data.endTime   ?? existing.endTime;

      if (data.startTime && !this.validateTimeFormat(data.startTime)) {
        throw new Error('Invalid start time format. Use HH:mm');
      }
      if (data.endTime && !this.validateTimeFormat(data.endTime)) {
        throw new Error('Invalid end time format. Use HH:mm');
      }
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
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to update availability';
      throw new Error(msg);
    }
  }

  async deleteAvailability(availabilityId: string): Promise<void> {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        AVAILABILITY_COLLECTION_ID,
        availabilityId
      );
    } catch {
      throw new Error('Failed to delete availability');
    }
  }

  async getDoctorWeekSchedule(doctorId: string): Promise<DaySchedule[]> {
    try {
      const availabilities = await this.getDoctorAvailability(doctorId);
      const schedule: DaySchedule[] = [];

      for (let day = 0; day <= 6; day++) {
        const dayOfWeek    = day as DayOfWeek;
        const availability = availabilities.find((a) => a.dayOfWeek === dayOfWeek);
        schedule.push({
          dayOfWeek,
          dayName:      DAY_NAMES[dayOfWeek],
          slots:        availability ? this.generateTimeSlots(availability) : [],
          isConfigured: !!availability,
        });
      }

      return schedule;
    } catch {
      throw new Error('Failed to fetch week schedule');
    }
  }

  async bulkSetAvailability(
    doctorId:       string,
    availabilities: CreateAvailabilityDTO[]
  ): Promise<DoctorAvailability[]> {
    try {
      const results: DoctorAvailability[] = [];

      for (const data of availabilities) {
        const existing = await this.getDoctorAvailabilityByDay(doctorId, data.dayOfWeek);
        if (existing) {
          const updated = await this.updateAvailability(existing.$id, {
            startTime:      data.startTime,
            endTime:        data.endTime,
            slotDuration:   data.slotDuration,
            hasBreak:       data.hasBreak,
            breakStartTime: data.breakStartTime,
            breakEndTime:   data.breakEndTime,
          });
          results.push(updated);
        } else {
          const created = await this.createAvailability(data);
          results.push(created);
        }
      }

      return results;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to set availability';
      throw new Error(msg);
    }
  }

  async isAvailableAt(doctorId: string, date: Date, time: string): Promise<boolean> {
    try {
      const dayOfWeek    = date.getDay() as DayOfWeek;
      const availability = await this.getDoctorAvailabilityByDay(doctorId, dayOfWeek);
      if (!availability) return false;

      const timeMin  = this.timeToMinutes(time);
      const startMin = this.timeToMinutes(availability.startTime);
      const endMin   = this.timeToMinutes(availability.endTime);

      if (timeMin < startMin || timeMin >= endMin) return false;

      // Exclude break window
      if (availability.hasBreak && availability.breakStartTime && availability.breakEndTime) {
        const breakStart = this.timeToMinutes(availability.breakStartTime);
        const breakEnd   = this.timeToMinutes(availability.breakEndTime);
        if (timeMin >= breakStart && timeMin < breakEnd) return false;
      }

      return true;
    } catch {
      return false;
    }
  }
}

export const availabilityService = new AvailabilityService();