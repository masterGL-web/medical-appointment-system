// // Patient CRUD operations
// // src/services/patient.service.ts
// import { databases, ID } from '@/lib/appwrite';
// import { Patient, CreatePatientDTO, UpdatePatientDTO } from '@/types/patient.types';
// import { Query } from 'appwrite';
// import type { Models } from 'appwrite';
// import type { PatientDocument } from '@/types/patient.types';

// const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
// const PATIENTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_PATIENTS_COLLECTION_ID!;

// class PatientService {
//   /**
//    * Map patient document to Patient type
//    * PUBLIC - used by appointment service
//    */
//   public mapPatient(doc: PatientDocument): Patient {
//     return {
//       $id: doc.$id,
//       userId: doc.userId,
//       firstName: doc.firstName,
//       lastName: doc.lastName,
//       phone: doc.phone,
//       dateOfBirth: doc.dateOfBirth,
//       gender: doc.gender,
//       medicalHistory: doc.medicalHistory,
//       address: doc.address,
//       city: doc.city,
//       $createdAt: doc.$createdAt,
//       $updatedAt: doc.$updatedAt,
//     };
//   }

//   async createPatient(data: CreatePatientDTO): Promise<Patient> {
//     try {
//       const patientDocument = await databases.createDocument<PatientDocument>(
//         DATABASE_ID,
//         PATIENTS_COLLECTION_ID,
//         ID.unique(),
//         data
//       );

//       return this.mapPatient(patientDocument); // CHANGED: use this.mapPatient

//     } catch (error) {
//       console.error('Error creating patient:', error);
//       throw new Error('Failed to create patient profile');
//     }
//   }

//   async getPatientByUserId(userId: string): Promise<Patient | null> {
//     try {
//       const response = await databases.listDocuments<PatientDocument>(
//         DATABASE_ID,
//         PATIENTS_COLLECTION_ID,
//         [Query.equal('userId', userId), Query.limit(1)]
//       );

//       return response.documents.length
//         ? this.mapPatient(response.documents[0]) // CHANGED
//         : null;

//     } catch (error) {
//       console.error('Error fetching patient:', error);
//       throw new Error('Failed to fetch patient profile');
//     }
//   }

//   async getPatientById(documentId: string): Promise<Patient> {
//     try {
//       const document = await databases.getDocument<PatientDocument>(
//         DATABASE_ID,
//         PATIENTS_COLLECTION_ID,
//         documentId
//       );

//       return this.mapPatient(document); // CHANGED

//     } catch (error) {
//       console.error('Error fetching patient by ID:', error);
//       throw new Error('Failed to fetch patient');
//     }
//   }

//   async updatePatient(
//     documentId: string,
//     data: UpdatePatientDTO
//   ): Promise<Patient> {
//     try {
//       const updatedDocument = await databases.updateDocument<PatientDocument>(
//         DATABASE_ID,
//         PATIENTS_COLLECTION_ID,
//         documentId,
//         data
//       );

//       return this.mapPatient(updatedDocument); // CHANGED

//     } catch (error) {
//       console.error('Error updating patient:', error);
//       throw new Error('Failed to update patient profile');
//     }
//   }

//   async deletePatient(documentId: string): Promise<void> {
//     try {
//       await databases.deleteDocument(
//         DATABASE_ID,
//         PATIENTS_COLLECTION_ID,
//         documentId
//       );
//     } catch (error) {
//       console.error('Error deleting patient:', error);
//       throw new Error('Failed to delete patient profile');
//     }
//   }

//   async searchPatientsByCity(city: string): Promise<Patient[]> {
//     try {
//       const response = await databases.listDocuments<PatientDocument>(
//         DATABASE_ID,
//         PATIENTS_COLLECTION_ID,
//         [Query.equal('city', city)]
//       );

//       return response.documents.map((doc) => this.mapPatient(doc)); // CHANGED

//     } catch (error) {
//       console.error('Error searching patients:', error);
//       throw new Error('Failed to search patients');
//     }
//   }
// }

// export const patientService = new PatientService();
// src/services/patient.service.ts
import { databases, ID } from '@/lib/appwrite';
import { Patient, CreatePatientDTO, UpdatePatientDTO } from '@/types/patient.types';
import { Query } from 'appwrite';
import type { PatientDocument } from '@/types/patient.types';

const DATABASE_ID           = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const PATIENTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_PATIENTS_COLLECTION_ID!;

class PatientService {
  /**
   * Map Appwrite document → Patient interface.
   * PUBLIC — used by appointment service and banned page.
   * MUST include ALL fields so ban detection works everywhere.
   */
  public mapPatient(doc: PatientDocument): Patient {
    return {
      $id:             doc.$id,
      userId:          doc.userId,
      firstName:       doc.firstName,
      lastName:        doc.lastName,
      email:           doc.email,
      phone:           doc.phone,
      dateOfBirth:     doc.dateOfBirth,
      gender:          doc.gender,
      medicalHistory:  doc.medicalHistory,
      address:         doc.address,
      city:            doc.city,
      isActivated:     doc.isActivated,
      // ── Ban / no-show fields — required for /banned page logic ──────────
      noShowCount:     (doc.noShowCount as number)          ?? 0,
      banStatus:       (doc.banStatus  as Patient['banStatus']) ?? 'none',
      banUntil:        (doc.banUntil   as string | null)    ?? null,
      banReason:       (doc.banReason  as string | null)    ?? null,
      // ────────────────────────────────────────────────────────────────────
      $createdAt:      doc.$createdAt,
      $updatedAt:      doc.$updatedAt,
    };
  }

  async createPatient(data: CreatePatientDTO): Promise<Patient> {
    try {
      const patientDocument = await databases.createDocument<PatientDocument>(
        DATABASE_ID,
        PATIENTS_COLLECTION_ID,
        ID.unique(),
        {
          ...data,
          noShowCount: 0,
          banStatus: 'none',
          banUntil: null,
          banReason: null,
        }
      );
      return this.mapPatient(patientDocument);
    } catch (error) {
      console.error('Error creating patient:', error);
      throw new Error('Failed to create patient profile');
    }
  }

  async getPatientByUserId(userId: string): Promise<Patient | null> {
    try {
      const response = await databases.listDocuments<PatientDocument>(
        DATABASE_ID,
        PATIENTS_COLLECTION_ID,
        [Query.equal('userId', userId), Query.limit(1)]
      );
      return response.documents.length
        ? this.mapPatient(response.documents[0])
        : null;
    } catch (error) {
      console.error('Error fetching patient:', error);
      throw new Error('Failed to fetch patient profile');
    }
  }

  async getPatientById(documentId: string): Promise<Patient> {
    try {
      const document = await databases.getDocument<PatientDocument>(
        DATABASE_ID,
        PATIENTS_COLLECTION_ID,
        documentId
      );
      return this.mapPatient(document);
    } catch (error) {
      console.error('Error fetching patient by ID:', error);
      throw new Error('Failed to fetch patient');
    }
  }

  async updatePatient(documentId: string, data: UpdatePatientDTO): Promise<Patient> {
    try {
      const updatedDocument = await databases.updateDocument<PatientDocument>(
        DATABASE_ID,
        PATIENTS_COLLECTION_ID,
        documentId,
        data
      );
      return this.mapPatient(updatedDocument);
    } catch (error) {
      console.error('Error updating patient:', error);
      throw new Error('Failed to update patient profile');
    }
  }

  async deletePatient(documentId: string): Promise<void> {
    try {
      await databases.deleteDocument(DATABASE_ID, PATIENTS_COLLECTION_ID, documentId);
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw new Error('Failed to delete patient profile');
    }
  }

  async searchPatientsByCity(city: string): Promise<Patient[]> {
    try {
      const response = await databases.listDocuments<PatientDocument>(
        DATABASE_ID,
        PATIENTS_COLLECTION_ID,
        [Query.equal('city', city)]
      );
      return response.documents.map((doc) => this.mapPatient(doc));
    } catch (error) {
      console.error('Error searching patients:', error);
      throw new Error('Failed to search patients');
    }
  }
}

export const patientService = new PatientService();