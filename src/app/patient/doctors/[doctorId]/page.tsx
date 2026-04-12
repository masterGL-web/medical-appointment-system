//src/app/patient/doctors/[doctorId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doctorService } from '@/services/doctor.service';
import { Doctor } from '@/types/doctor.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  MapPin,
  Briefcase,
  DollarSign,
  GraduationCap,
  AlertCircle,
  Calendar,
  Building2,
  Phone,
  Mail,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

export default function DoctorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const doctorId = params.doctorId as string;

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (doctorId) {
      loadDoctor();
    }
  }, [doctorId]);

  const loadDoctor = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await doctorService.getDoctorById(doctorId);

      // Check if doctor is verified
      if (!data.isVerified) {
        setError('This doctor is not verified and cannot accept appointments.');
      }

      setDoctor(data);
    } catch (err) {
      console.error('Failed to load doctor:', err);
      setError('Failed to load doctor profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Search
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Doctor not found'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Search
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold text-2xl">
                {doctor.firstName[0]}
                {doctor.lastName[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-2xl">
                    Dr. {doctor.firstName} {doctor.lastName}
                  </CardTitle>
                  {doctor.isVerified && (
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  )}
                </div>
                <Badge variant="secondary" className="mt-2">
                  {doctor.specialization}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Bio */}
            {doctor.bio && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                <p className="text-gray-600 leading-relaxed">{doctor.bio}</p>
              </div>
            )}

            {/* Education */}
            {doctor.education && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-emerald-600" />
                  Education
                </h3>
                <p className="text-gray-600">{doctor.education}</p>
              </div>
            )}

            {/* Experience */}
            {doctor.yearsOfExperience && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-emerald-600" />
                  Experience
                </h3>
                <p className="text-gray-600">{doctor.yearsOfExperience} years of practice</p>
              </div>
            )}

            {/* Clinic Information */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-emerald-600" />
                Clinic Information
              </h3>
              <div className="space-y-2">
                {doctor.clinicName && (
                  <p className="text-gray-600">
                    <span className="font-medium">Name:</span> {doctor.clinicName}
                  </p>
                )}
                {doctor.clinicAddress && (
                  <p className="text-gray-600">
                    <span className="font-medium">Address:</span> {doctor.clinicAddress}
                  </p>
                )}
                <p className="text-gray-600">
                  <span className="font-medium">City:</span> {doctor.city}
                </p>
              </div>
            </div>

            {/* Contact (if available) */}
            {(doctor.email || doctor.phone) && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Contact</h3>
                <div className="space-y-2">
                  {doctor.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{doctor.phone}</span>
                    </div>
                  )}
                  {doctor.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{doctor.email}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar - Booking Card */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Book Appointment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Consultation Fee */}
              {doctor.consultationFee && (
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                  <span className="text-sm text-gray-600">Consultation Fee</span>
                  <span className="text-lg font-bold text-emerald-600">
                    {doctor.consultationFee} DZD
                  </span>
                </div>
              )}

              {/* Booking Button */}
              <Button asChild className="w-full" size="lg" disabled={!doctor.isVerified}>
                <Link href={`/patient/book/${doctor.$id}`}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Appointment
                </Link>
              </Button>

              {!doctor.isVerified && (
                <p className="text-sm text-amber-600 text-center">
                  This doctor is not currently accepting appointments
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">
                  {doctor.specialization}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{doctor.city}</span>
              </div>
              {doctor.yearsOfExperience && (
                <div className="flex items-center gap-2 text-sm">
                  <GraduationCap className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">
                    {doctor.yearsOfExperience} years experience
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}