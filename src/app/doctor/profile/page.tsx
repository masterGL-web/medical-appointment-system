//src/app/doctor/profile/page.tsx
'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Briefcase, MapPin, CheckCircle, XCircle } from 'lucide-react';

export default function DoctorProfilePage() {
  const { doctor } = useAuth('doctor');

  if (!doctor) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-1">Manage your professional information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-2">
          <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-emerald-600" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">First Name</label>
                <p className="text-gray-900 mt-1">{doctor.firstName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Name</label>
                <p className="text-gray-900 mt-1">{doctor.lastName}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </label>
              <p className="text-gray-900 mt-1">{doctor.email}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone
              </label>
              <p className="text-gray-900 mt-1">{doctor.phone}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Specialization
              </label>
              <p className="text-gray-900 mt-1">{doctor.specialization}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">License Number</label>
              <p className="text-gray-900 mt-1">{doctor.licenseNumber}</p>
            </div>

            {doctor.yearsOfExperience && (
              <div>
                <label className="text-sm font-medium text-gray-500">Years of Experience</label>
                <p className="text-gray-900 mt-1">{doctor.yearsOfExperience} years</p>
              </div>
            )}

            {doctor.bio && (
              <div>
                <label className="text-sm font-medium text-gray-500">Bio</label>
                <p className="text-gray-700 mt-1">{doctor.bio}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Card */}
        <Card>
          <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white">
            <CardTitle className="text-lg">Account Status</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Verification Status</label>
              <div className="mt-2">
                {doctor.isVerified ? (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <XCircle className="h-3.5 w-3.5 mr-1" />
                    Pending Verification
                  </Badge>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Clinic Address
              </label>
              <p className="text-gray-700 mt-1">{doctor.clinicAddress}</p>
              <p className="text-gray-600 text-sm">{doctor.city}</p>
            </div>

            {doctor.consultationFee && (
              <div>
                <label className="text-sm font-medium text-gray-500">Consultation Fee</label>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {doctor.consultationFee} DZD
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}