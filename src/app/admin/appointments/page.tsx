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
  CheckCircle2,
  XCircle,
  Timer,
  ChevronLeft,
  ChevronRight,
  Users,
  Stethoscope,
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

      {/* ── Header banner ── */}
      <div className="bg-gradient-to-r from-purple-800 to-purple-700 rounded-2xl px-8 py-6 shadow-lg shadow-purple-900/20 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Appointments</h1>
          <p className="text-purple-200 mt-1">View all appointments across the platform</p>
        </div>
        <button
          disabled={refreshing || loading}
          onClick={() => load(true)}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* ── Stats cards ── */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 border-b-4 border-b-purple-400 shadow-md p-5 flex items-center justify-between hover:shadow-lg transition-shadow">
            <div>
              <Calendar className="h-5 w-5 text-purple-400 mb-1" />
              <p className="text-3xl font-bold text-purple-600">{stats.total}</p>
              <p className="text-sm text-slate-500 font-medium">Total</p>
            </div>
            <div className="rounded-2xl bg-purple-50 p-3"><Calendar className="h-6 w-6 text-purple-500" /></div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 border-b-4 border-b-amber-400 shadow-md p-5 flex items-center justify-between hover:shadow-lg transition-shadow">
            <div>
              <Timer className="h-5 w-5 text-amber-400 mb-1" />
              <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
              <p className="text-sm text-slate-500 font-medium">Pending</p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-3"><Timer className="h-6 w-6 text-amber-500" /></div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 border-b-4 border-b-emerald-400 shadow-md p-5 flex items-center justify-between hover:shadow-lg transition-shadow">
            <div>
              <CheckCircle2 className="h-5 w-5 text-emerald-400 mb-1" />
              <p className="text-3xl font-bold text-emerald-600">{stats.confirmed}</p>
              <p className="text-sm text-slate-500 font-medium">Confirmed</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3"><CheckCircle2 className="h-6 w-6 text-emerald-500" /></div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 border-b-4 border-b-red-400 shadow-md p-5 flex items-center justify-between hover:shadow-lg transition-shadow">
            <div>
              <XCircle className="h-5 w-5 text-red-400 mb-1" />
              <p className="text-3xl font-bold text-red-500">{stats.cancelled}</p>
              <p className="text-sm text-slate-500 font-medium">Cancelled</p>
            </div>
            <div className="rounded-2xl bg-red-50 p-3"><XCircle className="h-6 w-6 text-red-500" /></div>
          </div>
        </div>
      )}

      {/* ── Table card ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">

        {/* Card header */}
        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-100 p-2">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              All Appointments ({loading ? '…' : filtered.length})
            </h2>
          </div>

          {/* Status filter */}
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as AppointmentStatus | 'all')}>
            <SelectTrigger className="w-40 h-10 rounded-xl border-slate-200 text-sm">
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
        </div>

        {loading ? (
          <div className="space-y-3 p-6">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-11 w-11 rounded-2xl flex-shrink-0" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-24 ml-auto" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            ))}
          </div>
        ) : slice.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Calendar className="h-16 w-16 text-slate-200" />
            <p className="text-lg font-semibold text-slate-400">No appointments found</p>
            <p className="text-sm text-slate-400">
              {statusFilter !== 'all' ? `No ${statusFilter} appointments` : 'No appointments yet'}
            </p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <div className="col-span-3">Patient</div>
              <div className="col-span-3">Doctor</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Time</div>
              <div className="col-span-2 text-right">Status</div>
            </div>

            {/* Rows */}
            {slice.map((appt) => {
              const cfg  = STATUS_CONFIG[appt.status];
              const Icon = cfg.icon;
              const patientInitials = appt.patientName.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase();
              const doctorInitials  = appt.doctorName.replace('Dr. ', '').split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase();
              return (
                <div
                  key={appt.$id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-slate-100 last:border-b-0 hover:bg-slate-50/80 transition-colors"
                >
                  {/* Patient */}
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md">
                      {patientInitials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{appt.patientName}</p>
                      <p className="text-xs text-slate-400">Patient</p>
                    </div>
                  </div>

                  {/* Doctor */}
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md">
                      {doctorInitials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{appt.doctorName}</p>
                      <p className="text-xs text-slate-400">Doctor</p>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="col-span-2">
                    <span className="flex items-center gap-1.5 text-sm text-slate-600">
                      <Calendar className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                      {formatDate(appt.date)}
                    </span>
                  </div>

                  {/* Time */}
                  <div className="col-span-2">
                    <span className="flex items-center gap-1.5 text-sm text-slate-600">
                      <Clock className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                      {formatTime(appt.startTime)}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="col-span-2 flex justify-end">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.className}`}>
                      <Icon className="h-3.5 w-3.5" />
                      {cfg.label}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                <p className="text-sm text-slate-500">
                  Page {safePage} of {totalPages} — {filtered.length} appointments
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={safePage <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" /> Previous
                  </button>
                  <button
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

}