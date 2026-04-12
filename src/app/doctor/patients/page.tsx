//src/app/doctor/patients/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { appointmentService } from '@/services/appointment.service';
import { AppointmentWithPatient } from '@/types/appointment.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Phone, Calendar } from 'lucide-react';

export default function DoctorPatientsPage() {
  const { doctor } = useAuth('doctor');
  
  // FIXED: Use angle brackets < > for TypeScript generics
 const [patients, setPatients] = useState<Array<{
  name: string;
  phone?: string;
  lastVisit: string;
  totalVisits: number;
  status: string;
}>>([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (doctor) {
      loadPatients();
    }
  }, [doctor]);

  const loadPatients = async () => {
    if (!doctor) return;

    try {
      setLoading(true);
      const appointments = await appointmentService.getAppointmentsWithPatient(doctor.$id);

      // FIXED: Use angle brackets < > for Map generics
     const patientMap = new Map<string, {
  name: string;
  phone?: string;
  appointments: AppointmentWithPatient[];
}>();

      appointments.forEach((apt) => {
        const key = apt.patientId;
        if (!patientMap.has(key)) {
          patientMap.set(key, {
            name: apt.patient.fullName,
            phone: apt.patient.phone,
            appointments: [],
          });
        }
        patientMap.get(key)!.appointments.push(apt);
      });

      // Convert to array
      const patientsData = Array.from(patientMap.values()).map((p) => ({
        name: p.name,
        phone: p.phone,
        lastVisit: p.appointments[0].date,
        totalVisits: p.appointments.filter((a) => a.status === 'completed').length,
        status: p.appointments[0].status,
      }));

      setPatients(patientsData);
    } catch (err) {
      console.error('Failed to load patients:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Patients</h1>
        <p className="text-gray-600 mt-1">Overview of all your patients</p>
      </div>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-emerald-600" />
            Patients ({patients.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {patients.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {patients.map((patient, index) => (
                <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold">
                        {patient.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{patient.name}</p>
                        {patient.phone && (
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5" />
                            {patient.phone}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 flex items-center gap-1 justify-end">
                        <Calendar className="h-3.5 w-3.5" />
                        Last: {new Date(patient.lastVisit).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {patient.totalVisits} completed visits
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No patients yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}