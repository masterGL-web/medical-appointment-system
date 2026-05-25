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
    isActivated: doc.isActivated,
    education: doc.education,
    latitude: doc.latitude,
    longitude: doc.longitude,
    $createdAt: doc.$createdAt,
    $updatedAt: doc.$updatedAt,
  };
}

class DoctorService {
  /**
 * Search specializations with autocomplete (uses full-text index)
 * Returns unique specializations matching the query
 */
async searchSpecializations(query: string): Promise<string[]> {
  try {
    // Handle empty query
    if (!query || query.trim().length === 0) {
      return [];
    }

    // Search using full-text index
    const response = await databases.listDocuments<DoctorDocument>(
      DATABASE_ID,
      DOCTORS_COLLECTION_ID,
      [
        Query.equal('isVerified', true), // Only verified doctors
        Query.search('specialization', query.trim()),
        Query.limit(50), // Limit results for performance
      ]
    );

    // Extract unique specializations
    const specializations = [
      ...new Set(
        response.documents
          .map((doc) => doc.specialization)
          .filter((spec) => spec && spec.trim().length > 0)
      ),
    ];

    // Sort alphabetically
    return specializations.sort((a, b) => a.localeCompare(b));
  } catch (error) {
    console.error('Error searching specializations:', error);
    return [];
  }
}

/**
 * Search verified doctors with filters
 * Supports: specialization, city, search query
 */
async searchDoctors(filters: {
  specialization?: string;
  city?: string;
  searchQuery?: string;
}): Promise<Doctor[]> {
  try {
    const queries: string[] = [Query.equal('isVerified', true)];

    // Filter by specialization (exact match)
    if (filters.specialization && filters.specialization.trim()) {
      queries.push(Query.equal('specialization', filters.specialization.trim()));
    }

    // Filter by city (exact match)
    if (filters.city && filters.city.trim()) {
      queries.push(Query.equal('city', filters.city.trim()));
    }

    // Search by name if provided
    if (filters.searchQuery && filters.searchQuery.trim()) {
      // Note: This will search in firstName or lastName if you have full-text index
      queries.push(Query.search('firstName', filters.searchQuery.trim()));
    }

    queries.push(Query.orderDesc('$createdAt'));
    queries.push(Query.limit(100));

    const response = await databases.listDocuments<DoctorDocument>(
      DATABASE_ID,
      DOCTORS_COLLECTION_ID,
      queries
    );

    return response.documents.map(mapDoctor);
  } catch (error) {
    console.error('Error searching doctors:', error);
    throw new Error('Failed to search doctors');
  }
}

/**
 * Get all unique specializations from verified doctors
 * Used for initial autocomplete suggestions
 */
async getAllSpecializations(): Promise<string[]> {
  try {
    const response = await databases.listDocuments<DoctorDocument>(
      DATABASE_ID,
      DOCTORS_COLLECTION_ID,
      [Query.equal('isVerified', true), Query.limit(500)]
    );

    const specializations = [
      ...new Set(
        response.documents
          .map((doc) => doc.specialization)
          .filter((spec) => spec && spec.trim().length > 0)
      ),
    ];

    return specializations.sort((a, b) => a.localeCompare(b));
  } catch (error) {
    console.error('Error fetching specializations:', error);
    return [];
  }
}
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
  /**
 * Get all verified doctors (for patient search)
 */
async getVerifiedDoctors(): Promise<Doctor[]> {
  try {
    const response = await databases.listDocuments<DoctorDocument>(
      DATABASE_ID,
      DOCTORS_COLLECTION_ID,
      [
        Query.equal('isVerified', true),
        Query.orderDesc('$createdAt'),
        Query.limit(100), // Adjust as needed
      ]
    );

    const doctors = response.documents.map(mapDoctor);
    
    // Verify latitude and longitude are present
    const docsWithCoords = doctors.filter(d => d.latitude != null && d.longitude != null);
    console.log(`📍 Loaded ${doctors.length} doctors. ${docsWithCoords.length} have coordinates.`);
    if (docsWithCoords.length > 0) {
      console.log('✅ Sample doctor with location:', {
        name: `${docsWithCoords[0].firstName} ${docsWithCoords[0].lastName}`,
        latitude: docsWithCoords[0].latitude,
        longitude: docsWithCoords[0].longitude,
      });
    }
    
    return doctors;
  } catch (error) {
    console.error('Error fetching verified doctors:', error);
    throw new Error('Failed to fetch doctors');
  }
}

/**
 * Search verified doctors by name or specialization
 */
async searchVerifiedDoctors(query: string): Promise<Doctor[]> {
  try {
    const response = await databases.listDocuments<DoctorDocument>(
      DATABASE_ID,
      DOCTORS_COLLECTION_ID,
      [
        Query.equal('isVerified', true),
        Query.search('firstName', query),
        Query.limit(100),
      ]
    );

    // Also search by last name and specialization
    const lastNameResults = await databases.listDocuments<DoctorDocument>(
      DATABASE_ID,
      DOCTORS_COLLECTION_ID,
      [
        Query.equal('isVerified', true),
        Query.search('lastName', query),
        Query.limit(100),
      ]
    );

    const specializationResults = await databases.listDocuments<DoctorDocument>(
      DATABASE_ID,
      DOCTORS_COLLECTION_ID,
      [
        Query.equal('isVerified', true),
        Query.search('specialization', query),
        Query.limit(100),
      ]
    );

    // Combine and deduplicate results
    const allDocs = [
      ...response.documents,
      ...lastNameResults.documents,
      ...specializationResults.documents,
    ];

    const uniqueDocs = Array.from(
      new Map(allDocs.map((doc) => [doc.$id, doc])).values()
    );

    return uniqueDocs.map(mapDoctor);
  } catch (error) {
    console.error('Error searching doctors:', error);
    throw new Error('Failed to search doctors');
  }
}

/**
 * Filter verified doctors by city and/or specialization
 */
async filterVerifiedDoctors(filters: {
  city?: string;
  specialization?: string;
}): Promise<Doctor[]> {
  try {
    const queries = [Query.equal('isVerified', true)];

    if (filters.city) {
      queries.push(Query.equal('city', filters.city));
    }

    if (filters.specialization) {
      queries.push(Query.equal('specialization', filters.specialization));
    }

    queries.push(Query.orderDesc('$createdAt'));
    queries.push(Query.limit(100));

    const response = await databases.listDocuments<DoctorDocument>(
      DATABASE_ID,
      DOCTORS_COLLECTION_ID,
      queries
    );

    return response.documents.map(mapDoctor);
  } catch (error) {
    console.error('Error filtering doctors:', error);
    throw new Error('Failed to filter doctors');
  }
}

/**
 * Get unique cities where verified doctors practice
 */
async getDoctorCities(): Promise<string[]> {
  try {
    const response = await databases.listDocuments<DoctorDocument>(
      DATABASE_ID,
      DOCTORS_COLLECTION_ID,
      [Query.equal('isVerified', true), Query.limit(100)]
    );

    const cities = [...new Set(response.documents.map((doc) => doc.city))];
    return cities.sort();
  } catch (error) {
    console.error('Error fetching doctor cities:', error);
    return [];
  }
}

/**
 * Get unique specializations of verified doctors
 */
async getDoctorSpecializations(): Promise<string[]> {
  try {
    const response = await databases.listDocuments<DoctorDocument>(
      DATABASE_ID,
      DOCTORS_COLLECTION_ID,
      [Query.equal('isVerified', true), Query.limit(100)]
    );

    const specializations = [
      ...new Set(response.documents.map((doc) => doc.specialization)),
    ];
    return specializations.sort();
  } catch (error) {
    console.error('Error fetching specializations:', error);
    return [];
  }
}
}
export const doctorService = new DoctorService();