// src/types/availability.types.ts
import type { Models } from 'appwrite';

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const DAY_NAMES: Record<DayOfWeek, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

export type AvailabilityDocument = Models.Document & {
  doctorId:       string;
  dayOfWeek:      DayOfWeek;
  startTime:      string;
  endTime:        string;
  slotDuration:   number;
  hasBreak:       boolean;
  breakStartTime: string | null;
  breakEndTime:   string | null;
};

export interface DoctorAvailability {
  $id:            string;
  doctorId:       string;
  dayOfWeek:      DayOfWeek;
  startTime:      string;
  endTime:        string;
  slotDuration:   number;
  hasBreak:       boolean;
  breakStartTime: string | null;
  breakEndTime:   string | null;
  $createdAt:     string;
  $updatedAt:     string;
}

export interface CreateAvailabilityDTO {
  doctorId:       string;
  dayOfWeek:      DayOfWeek;
  startTime:      string;
  endTime:        string;
  slotDuration:   number;
  hasBreak:       boolean;
  breakStartTime: string | null;
  breakEndTime:   string | null;
}

export interface UpdateAvailabilityDTO {
  dayOfWeek?:      DayOfWeek;
  startTime?:      string;
  endTime?:        string;
  slotDuration?:   number;
  hasBreak?:       boolean;
  breakStartTime?: string | null;
  breakEndTime?:   string | null;
}

export interface TimeSlot {
  time:      string;
  available: boolean;
  session:   'morning' | 'afternoon' | 'full';
}

export interface DaySchedule {
  dayOfWeek:    DayOfWeek;
  dayName:      string;
  slots:        TimeSlot[];
  isConfigured: boolean;
}