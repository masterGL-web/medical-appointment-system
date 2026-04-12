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
  doctorId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:mm format (e.g., "09:00")
  endTime: string; // HH:mm format (e.g., "17:00")
  slotDuration: number; // minutes (e.g., 30)
};

export interface DoctorAvailability {
  $id: string;
  doctorId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  slotDuration: number;
  $createdAt: string;
  $updatedAt: string;
}

export interface CreateAvailabilityDTO {
  doctorId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // Must be in HH:mm format
  endTime: string; // Must be in HH:mm format
  slotDuration: number; // Default: 30 minutes
}

export interface UpdateAvailabilityDTO {
  dayOfWeek?: DayOfWeek;
  startTime?: string;
  endTime?: string;
  slotDuration?: number;
}

export interface TimeSlot {
  time: string; // HH:mm format
  available: boolean;
}

export interface DaySchedule {
  dayOfWeek: DayOfWeek;
  dayName: string;
  slots: TimeSlot[];
  isConfigured: boolean;
}