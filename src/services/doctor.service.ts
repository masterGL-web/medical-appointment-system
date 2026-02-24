import { databases, storage, ID } from '@/lib/appwrite';
import { Doctor, CreateDoctorDTO, UpdateDoctorDTO, DoctorDocument } from '@/types/doctor.types';
import { Query } from 'appwrite';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const DOCTORS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_DOCTORS_COLLECTION_ID!;
const STORAGE_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID!;

function mapDoctor(doc: DoctorDocument): Doctor {
  return {
    $id: doc.$id,
    userId: doc.userId,
    firstName: doc.firstName,
    lastName: doc.lastName,
    email: doc.email,
    phone: doc.phone,
    specialization: doc.specialization,
    licenseNumber: doc.licenseNumber,
    yearsOfExperience: doc.yearsOfExperience,
    bio: doc.bio,
    clinicName: doc.clinicName,
    clinicAddress: doc.clinicAddress,
    city: doc.city,
    country: doc.country,
    consultationFee: doc.consultationFee,
    licenseDocumentId: doc.licenseDocumentId,
    profileImageId: doc.profileImageId,
    isVerified: doc.isVerified,
    education: doc.education,
    $createdAt: doc.$createdAt,
    $updatedAt: doc.$updatedAt,
  };
}

class DoctorService {
  /**
   * Upload file to Appwrite Storage
   */
  async uploadFile(file: File): Promise<string> {
    try {
      const response = await storage.createFile(
        STORAGE_BUCKET_ID,
        ID.unique(),
        file
      );
      return response.$id;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  }

  /**
   * Get file preview URL
   */
  getFilePreview(fileId: string): string {
    return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${STORAGE_BUCKET_ID}/files/${fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
  }

  /**
   * Create a new doctor document
   */
  async createDoctor(data: CreateDoctorDTO): Promise<Doctor> {
    try {
      const doctorDocument = await databases.createDocument<DoctorDocument>(
        DATABASE_ID,
        DOCTORS_COLLECTION_ID,
        ID.unique(),
        {
          ...data,
          isVerified: false, // Default to false, admin will verify
        }
      );

      return mapDoctor(doctorDocument);
    } catch (error) {
      console.error('Error creating doctor:', error);
      throw new Error('Failed to create doctor profile');
    }
  }

  /**
   * Get doctor by Appwrite Auth userId
   */
  async getDoctorByUserId(userId: string): Promise<Doctor | null> {
    try {
      const response = await databases.listDocuments<DoctorDocument>(
        DATABASE_ID,
        DOCTORS_COLLECTION_ID,
        [Query.equal('userId', userId), Query.limit(1)]
      );

      return response.documents.length ? mapDoctor(response.documents[0]) : null;
    } catch (error) {
      console.error('Error fetching doctor:', error);
      throw new Error('Failed to fetch doctor profile');
    }
  }

  /**
   * Get doctor by document ID
   */
  async getDoctorById(documentId: string): Promise<Doctor> {
    try {
      const document = await databases.getDocument<DoctorDocument>(
        DATABASE_ID,
        DOCTORS_COLLECTION_ID,
        documentId
      );

      return mapDoctor(document);
    } catch (error) {
      console.error('Error fetching doctor by ID:', error);
      throw new Error('Failed to fetch doctor');
    }
  }

  /**
   * Update doctor profile
   */
  async updateDoctor(documentId: string, data: UpdateDoctorDTO): Promise<Doctor> {
    try {
      const updatedDocument = await databases.updateDocument<DoctorDocument>(
        DATABASE_ID,
        DOCTORS_COLLECTION_ID,
        documentId,
        data
      );

      return mapDoctor(updatedDocument);
    } catch (error) {
      console.error('Error updating doctor:', error);
      throw new Error('Failed to update doctor profile');
    }
  }

  /**
   * Get all doctors (for patient search)
   */
  async getAllDoctors(): Promise<Doctor[]> {
    try {
      const response = await databases.listDocuments<DoctorDocument>(
        DATABASE_ID,
        DOCTORS_COLLECTION_ID,
        [Query.equal('isVerified', true)]
      );

      return response.documents.map(mapDoctor);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      throw new Error('Failed to fetch doctors');
    }
  }

  /**
   * Search doctors by specialization
   */
  async searchDoctorsBySpecialization(specialization: string): Promise<Doctor[]> {
    try {
      const response = await databases.listDocuments<DoctorDocument>(
        DATABASE_ID,
        DOCTORS_COLLECTION_ID,
        [
          Query.equal('specialization', specialization),
          Query.equal('isVerified', true),
        ]
      );

      return response.documents.map(mapDoctor);
    } catch (error) {
      console.error('Error searching doctors:', error);
      throw new Error('Failed to search doctors');
    }
  }

  /**
   * Search doctors by city
   */
  async searchDoctorsByCity(city: string): Promise<Doctor[]> {
    try {
      const response = await databases.listDocuments<DoctorDocument>(
        DATABASE_ID,
        DOCTORS_COLLECTION_ID,
        [Query.equal('city', city), Query.equal('isVerified', true)]
      );

      return response.documents.map(mapDoctor);
    } catch (error) {
      console.error('Error searching doctors by city:', error);
      throw new Error('Failed to search doctors');
    }
  }
}
export const doctorService = new DoctorService();