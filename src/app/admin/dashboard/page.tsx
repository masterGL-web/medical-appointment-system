// src/app/admin/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Stethoscope,
  Users,
  Calendar,
  BadgeCheck,
  AlertCircle,
} from 'lucide-react';

const DB   = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const DOCS = process.env.NEXT_PUBLIC_APPWRITE_DOCTORS_COLLECTION_ID!;
const PATS = process.env.NEXT_PUBLIC_APPWRITE_PATIENTS_COLLECTION_ID!;
const APPS = process.env.NEXT_PUBLIC_APPWRITE_APPOINTMENTS_COLLECTION_ID!;

interface Stats {
  totalDoctors:    number;
  verifiedDoctors: number;
  totalPatients:   number;
  totalAppointments: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [doctors, verified, patients, appointments] = await Promise.all([
          databases.listDocuments(DB, DOCS, [Query.limit(1)]),
          databases.listDocuments(DB, DOCS, [Query.equal('isVerified', true), Query.limit(1)]),
          databases.listDocuments(DB, PATS, [Query.limit(1)]),
          databases.listDocuments(DB, APPS, [Query.limit(1)]),
        ]);

        setStats({
          totalDoctors:      doctors.total,
          verifiedDoctors:   verified.total,
          totalPatients:     patients.total,
          totalAppointments: appointments.total,
        });
      } catch {
        setError('Failed to load stats. Please refresh.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const cards = [
    { label: 'Total Doctors',     value: stats?.totalDoctors,      icon: Stethoscope, color: 'text-blue-600',   bg: 'bg-blue-50'   },
    { label: 'Verified Doctors',  value: stats?.verifiedDoctors,   icon: BadgeCheck,  color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Patients',    value: stats?.totalPatients,     icon: Users,       color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Total Appointments',value: stats?.totalAppointments, icon: Calendar,    color: 'text-amber-600',  bg: 'bg-amber-50'  },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of the MediCare platform</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{card.label}</p>
                    {loading ? (
                      <Skeleton className="h-8 w-16 mt-2" />
                    ) : (
                      <p className={`text-3xl font-bold mt-1 ${card.color}`}>
                        {card.value ?? 0}
                      </p>
                    )}
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}