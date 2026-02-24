// This file defines TypeScript types and interfaces for the Doctor entity in the application.
// It includes the structure of the Doctor document as stored in the database, as well as data transfer objects (DTOs) for creating and updating doctor records.
// The DoctorDocument type extends the base document structure provided by Appwrite's Models.Document, adding specific fields relevant to a doctor's profile.
// The Doctor interface represents the complete structure of a doctor record, including metadata fields like $createdAt and $updatedAt.
// The CreateDoctorDTO and UpdateDoctorDTO interfaces define the expected structure of data when creating or updating a doctor record, respectively.
//src/types/doctor.types.ts
import type { Models } from 'appwrite';

export type DoctorDocument = Models.Document & {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  licenseNumber: string;
  yearsOfExperience?: number;
  bio?: string;
  clinicName?: string;
  clinicAddress: string;
  city: string;
  country?: string;
  consultationFee?: number;
  licenseDocumentId?: string;
  profileImageId?: string;
  isVerified: boolean;
  education?: string;
};

export interface Doctor {
  $id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  licenseNumber: string;
  yearsOfExperience?: number;
  bio?: string;
  clinicName?: string;
  clinicAddress: string;
  city: string;
  country?: string;
  consultationFee?: number;
  licenseDocumentId?: string;
  profileImageId?: string;
  isVerified: boolean;
  education?: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface CreateDoctorDTO {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  licenseNumber: string;
  clinicAddress: string;
  city: string;
  yearsOfExperience?: number;
  bio?: string;
  clinicName?: string;
  country?: string;
  consultationFee?: number;
  licenseDocumentId?: string;
  profileImageId?: string;
  education?: string;
}

export interface UpdateDoctorDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  specialization?: string;
  yearsOfExperience?: number;
  bio?: string;
  clinicName?: string;
  clinicAddress?: string;
  city?: string;
  country?: string;
  consultationFee?: number;
  licenseDocumentId?: string;
  profileImageId?: string;
  isVerified?: boolean;
  education?: string;
}