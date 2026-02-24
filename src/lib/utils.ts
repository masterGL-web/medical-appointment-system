// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert HTML date input (YYYY-MM-DD) to Appwrite datetime format
 * @param dateString - Date string from HTML input (e.g., "2000-01-15")
 * @returns ISO 8601 datetime string (e.g., "2000-01-15T00:00:00.000Z")
 */
export function toAppwriteDatetime(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString();
}

/**
 * Convert Appwrite datetime to HTML date input format
 * @param datetime - ISO 8601 datetime string
 * @returns Date string for HTML input (YYYY-MM-DD)
 */
export function toInputDate(datetime: string): string {
  return datetime.split('T')[0];
}

/**
 * Calculate age from date of birth
 * @param dateOfBirth - ISO 8601 datetime string
 * @returns Age in years
 */
export function calculateAge(dateOfBirth: string): number {
  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}