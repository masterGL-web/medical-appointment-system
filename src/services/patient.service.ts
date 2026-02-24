// Patient CRUD operations
// src/services/patient.service.ts
import { databases, ID } from '@/lib/appwrite';
import { Patient, CreatePatientDTO, UpdatePatientDTO } from '@/types/patient.types';
import { Query } from 'appwrite';
import type { Models } from 'appwrite';
import type { PatientDocument } from '@/types/patient.types';



const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const PATIENTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_PATIENTS_COLLECTION_ID!;

function mapPatient(doc: PatientDocument): Patient {
    return {
        $id: doc.$id,
        userId: doc.userId,
        firstName: doc.firstName,
        lastName: doc.lastName,
        phone: doc.phone,
        dateOfBirth: doc.dateOfBirth,
        gender: doc.gender,
        medicalHistory: doc.medicalHistory,
        address: doc.address,
        city: doc.city,
        $createdAt: doc.$createdAt,
        $updatedAt: doc.$updatedAt,
    };
}

class PatientService {
    /**
     * Create a new patient document after registration
     */
    async createPatient(data: CreatePatientDTO): Promise<Patient> {
        try {
            const patientDocument = await databases.createDocument<PatientDocument>(
                DATABASE_ID,
                PATIENTS_COLLECTION_ID,
                ID.unique(),
                data
            );

            return mapPatient(patientDocument);

        } catch (error) {
            console.error('Error creating patient:', error);
            throw new Error('Failed to create patient profile');
        }
    }

    /**
     * Get patient by Appwrite Auth userId
     */
    async getPatientByUserId(userId: string): Promise<Patient | null> {
        try {
            const response = await databases.listDocuments<PatientDocument>(
                DATABASE_ID,
                PATIENTS_COLLECTION_ID,
                [Query.equal('userId', userId), Query.limit(1)]
            );

            return response.documents.length
                ? mapPatient(response.documents[0])
                : null;

        } catch (error) {
            console.error('Error fetching patient:', error);
            throw new Error('Failed to fetch patient profile');
        }
    }

    /**
     * Get patient by document ID
     */
    async getPatientById(documentId: string): Promise<Patient> {
        try {
            const document = await databases.getDocument<PatientDocument>(
                DATABASE_ID,
                PATIENTS_COLLECTION_ID,
                documentId
            );

            return mapPatient(document);

        } catch (error) {
            console.error('Error fetching patient by ID:', error);
            throw new Error('Failed to fetch patient');
        }
    }

    /**
     * Update patient profile
     */
    async updatePatient(
        documentId: string,
        data: UpdatePatientDTO
    ): Promise<Patient> {
        try {
            const updatedDocument = await databases.updateDocument<PatientDocument>(
                DATABASE_ID,
                PATIENTS_COLLECTION_ID,
                documentId,
                data
            );

            return mapPatient(updatedDocument);

        } catch (error) {
            console.error('Error updating patient:', error);
            throw new Error('Failed to update patient profile');
        }
    }

    /**
     * Delete patient profile (admin only)
     */
    async deletePatient(documentId: string): Promise<void> {
        try {
            await databases.deleteDocument(
                DATABASE_ID,
                PATIENTS_COLLECTION_ID,
                documentId
            );
        } catch (error) {
            console.error('Error deleting patient:', error);
            throw new Error('Failed to delete patient profile');
        }
    }

    /**
     * Search patients by city
     */
    async searchPatientsByCity(city: string): Promise<Patient[]> {
        try {
            const response = await databases.listDocuments<PatientDocument>(
                DATABASE_ID,
                PATIENTS_COLLECTION_ID,
                [Query.equal('city', city)]
            );

            return response.documents.map(mapPatient);

        } catch (error) {
            console.error('Error searching patients:', error);
            throw new Error('Failed to search patients');
        }
    }
}

export const patientService = new PatientService();