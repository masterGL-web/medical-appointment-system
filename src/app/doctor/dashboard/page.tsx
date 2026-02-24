//src/app/doctor/dashboard/page.tsx
'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DoctorDashboard() {
  const { doctor } = useAuth('doctor');

  if (!doctor) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, Dr. {doctor.firstName}!
          </h1>
          <p className="text-gray-600 mt-1">{doctor.specialization}</p>
        </div>
        {!doctor.isVerified && (
          <Badge variant="destructive">Pending Verification</Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Today's Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Consultation Fee
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {doctor.consultationFee ? `${doctor.consultationFee} DZD` : 'Not set'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-gray-500">License Number</dt>
              <dd className="font-medium">{doctor.licenseNumber}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">City</dt>
              <dd className="font-medium">{doctor.city}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Clinic Address</dt>
              <dd className="font-medium">{doctor.clinicAddress}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Email</dt>
              <dd className="font-medium">{doctor.email}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}