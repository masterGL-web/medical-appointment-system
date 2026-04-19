// src/app/admin/patients/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, AlertCircle, RefreshCw } from 'lucide-react';
import type { Patient } from '@/types/patient.types';

const DB   = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const PATS = process.env.NEXT_PUBLIC_APPWRITE_PATIENTS_COLLECTION_ID!;

export default function AdminPatientsPage() {
  const [patients, setPatients]     = useState<Patient[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const res = await databases.listDocuments(DB, PATS, [
        Query.orderDesc('$createdAt'),
        Query.limit(100),
      ]);
      setPatients(res.documents as unknown as Patient[]);
    } catch {
      setError('Failed to load patients.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-500 mt-1">View all registered patients</p>
        </div>
        <Button variant="outline" size="sm" disabled={refreshing || loading} onClick={() => load(true)}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="border-b bg-gray-50/60">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-purple-600" />
            All Patients ({loading ? '…' : patients.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-4">
              {[1,2,3,4].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No patients registered yet</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {/* Header row */}
              <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="col-span-4">Patient</div>
                <div className="col-span-4">Email</div>
                <div className="col-span-2">City</div>
                <div className="col-span-2">Status</div>
              </div>

              {patients.map((patient) => (
                <div key={patient.$id} className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-gray-50 transition-colors">
                  {/* Name + avatar */}
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                      {patient.firstName[0]}{patient.lastName[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {patient.firstName} {patient.lastName}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{patient.gender}</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="col-span-4">
                    <p className="text-sm text-gray-700 truncate">{patient.email}</p>
                  </div>

                  {/* City */}
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 truncate">{patient.city ?? '—'}</p>
                  </div>

                  {/* Activation badge */}
                  <div className="col-span-2">
                    {patient.isActivated ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 border">
                        Activated
                      </Badge>
                    ) : (
                      <Badge className="bg-red-50 text-red-700 border-red-200 border">
                        Not Activated
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}