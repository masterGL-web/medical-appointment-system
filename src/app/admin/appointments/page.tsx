// src/app/admin/appointments/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar,
  AlertCircle,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Timer,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { AppointmentStatus } from '@/types/appointment.types';
import type { Models } from 'appwrite';

// ─── Env vars ────────────────────────────────────────────────────────────────

const DB   = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const APPS = process.env.NEXT_PUBLIC_APPWRITE_APPOINTMENTS_COLLECTION_ID!;
const DOCS = process.env.NEXT_PUBLIC_APPWRITE_DOCTORS_COLLECTION_ID!;
const PATS = process.env.NEXT_PUBLIC_APPWRITE_PATIENTS_COLLECTION_ID!;

// ─── Types ────────────────────────────────────────────────────────────────────

interface RawAppointment extends Models.Document {
  patientId:   string;
  doctorId:    string;
  date:        string;
  startTime:   string;
  endTime:     string;
  status:      AppointmentStatus;
  reason?:     string;
  cancelReason?: string;
  cancelledBy?:  string;
}

interface EnrichedAppointment extends RawAppointment {
  patientName: string;
  doctorName:  string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; className: string; icon: React.ElementType }
> = {
  pending: {
    label:     'Pending',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    icon:      Timer,
  },
  confirmed: {
    label:     'Confirmed',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon:      CheckCircle,
  },
  cancelled: {
    label:     'Cancelled',
    className: 'bg-red-50 text-red-700 border-red-200',
    icon:      XCircle,
  },
  completed: {
    label:     'Completed',
    className: 'bg-gray-50 text-gray-600 border-gray-200',
    icon:      CheckCircle,
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-DZ', {
    timeZone: 'Africa/Algiers',
    year:     'numeric',
    month:    'short',
    day:      'numeric',
  });
}

function formatTime(t: string): string {
  const [h, m] = t.split(':');
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<EnrichedAppointment[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [refreshing, setRefreshing]     = useState(false);
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
  const [page, setPage]                 = useState(1);

  // ── Fetch all appointments and enrich with names ──────────────────────────

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      // 1. Fetch all appointments (up to 100)
      const apptRes = await databases.listDocuments(DB, APPS, [
        Query.orderDesc('$createdAt'),
        Query.limit(100),
      ]);
      const raw = apptRes.documents as unknown as RawAppointment[];

      if (raw.length === 0) {
        setAppointments([]);
        return;
      }

      // 2. Collect unique IDs
      const patientIds = [...new Set(raw.map((a) => a.patientId))];
      const doctorIds  = [...new Set(raw.map((a) => a.doctorId))];

      // 3. Batch fetch patients and doctors
      const [patientRes, doctorRes] = await Promise.all([
        databases.listDocuments(DB, PATS, [Query.equal('$id', patientIds), Query.limit(100)]),
        databases.listDocuments(DB, DOCS, [Query.equal('$id', doctorIds),  Query.limit(100)]),
      ]);

      // 4. Build lookup maps
      const patientMap = new Map<string, string>();
      patientRes.documents.forEach((p) => {
        patientMap.set(p.$id, `${p.firstName} ${p.lastName}`);
      });

      const doctorMap = new Map<string, string>();
      doctorRes.documents.forEach((d) => {
        doctorMap.set(d.$id, `Dr. ${d.firstName} ${d.lastName}`);
      });

      // 5. Enrich
      const enriched: EnrichedAppointment[] = raw.map((a) => ({
        ...a,
        patientName: patientMap.get(a.patientId) ?? 'Unknown Patient',
        doctorName:  doctorMap.get(a.doctorId)   ?? 'Unknown Doctor',
      }));

      setAppointments(enriched);
    } catch {
      setError('Failed to load appointments.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Filter + paginate ─────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return appointments;
    return appointments.filter((a) => a.status === statusFilter);
  }, [appointments, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const slice      = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Reset page when filter changes
  useEffect(() => { setPage(1); }, [statusFilter]);

  // ── Stats ─────────────────────────────────────────────────────────────────

  const stats = useMemo(() => ({
    total:     appointments.length,
    pending:   appointments.filter((a) => a.status === 'pending').length,
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
    cancelled: appointments.filter((a) => a.status === 'cancelled').length,
  }), [appointments]);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500 mt-1">View all appointments across the platform</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={refreshing || loading}
          onClick={() => load(true)}
        >
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

      {/* Stats row */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total',     value: stats.total,     color: 'text-gray-900',    bg: 'bg-gray-50'    },
            { label: 'Pending',   value: stats.pending,   color: 'text-amber-600',   bg: 'bg-amber-50'   },
            { label: 'Confirmed', value: stats.confirmed, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Cancelled', value: stats.cancelled, color: 'text-red-600',     bg: 'bg-red-50'     },
          ].map((s) => (
            <Card key={s.label} className="border-gray-200 shadow-sm">
              <CardContent className={`p-4 text-center ${s.bg} rounded-lg`}>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Table card */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="border-b bg-gray-50/60 flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4 text-purple-600" />
            All Appointments ({loading ? '…' : filtered.length})
          </CardTitle>

          {/* Status filter */}
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as AppointmentStatus | 'all')}
          >
            <SelectTrigger className="w-36 h-8 text-sm">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-24 rounded-full ml-auto" />
                </div>
              ))}
            </div>
          ) : slice.length === 0 ? (
            <div className="text-center py-14">
              <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No appointments found</p>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="col-span-3">Patient</div>
                <div className="col-span-3">Doctor</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2">Time</div>
                <div className="col-span-2 text-right">Status</div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-gray-100">
                {slice.map((appt) => {
                  const cfg  = STATUS_CONFIG[appt.status];
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={appt.$id}
                      className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-gray-50 transition-colors"
                    >
                      {/* Patient */}
                      <div className="col-span-3 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-semibold flex-shrink-0">
                          {appt.patientName.charAt(0)}
                        </div>
                        <p className="text-sm text-gray-900 font-medium truncate">
                          {appt.patientName}
                        </p>
                      </div>

                      {/* Doctor */}
                      <div className="col-span-3 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold flex-shrink-0">
                          {appt.doctorName.charAt(3)}
                        </div>
                        <p className="text-sm text-gray-700 truncate">{appt.doctorName}</p>
                      </div>

                      {/* Date */}
                      <div className="col-span-2">
                        <span className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                          {formatDate(appt.date)}
                        </span>
                      </div>

                      {/* Time */}
                      <div className="col-span-2">
                        <span className="flex items-center gap-1 text-sm text-gray-600">
                          <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                          {formatTime(appt.startTime)}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="col-span-2 flex justify-end">
                        <Badge className={`${cfg.className} border gap-1.5 font-medium`}>
                          <Icon className="h-3.5 w-3.5" />
                          {cfg.label}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    Page {safePage} of {totalPages} — {filtered.length} appointments
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={safePage <= 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="h-8 px-3"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={safePage >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="h-8 px-3"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}