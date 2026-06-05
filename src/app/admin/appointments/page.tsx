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
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';

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

  // ── Chart data ────────────────────────────────────────────────────────────

  const chartData = useMemo(() => {
    // 1. Bar chart: appointments per day (last 14 days)
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      return d.toISOString().split('T')[0];
    });
    const barData = last14Days.map(day => ({
      day:   new Date(day).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      count: appointments.filter(a => a.date?.startsWith(day)).length,
    }));

    // 2. Pie chart: by status
    const statusCounts = { pending: 0, confirmed: 0, cancelled: 0 };
    appointments.forEach(a => {
      if (a.status in statusCounts)
        statusCounts[a.status as keyof typeof statusCounts]++;
    });
    const pieData = [
      { name: 'Pending',   value: statusCounts.pending,   color: '#f59e0b' },
      { name: 'Confirmed', value: statusCounts.confirmed, color: '#10b981' },
      { name: 'Cancelled', value: statusCounts.cancelled, color: '#ef4444' },
    ].filter(d => d.value > 0);

    // 3. Line chart: cumulative over last 30 days
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return d.toISOString().split('T')[0];
    });
    let cumulative = 0;
    const lineData = last30Days.map(day => {
      cumulative += appointments.filter(a => a.date?.startsWith(day)).length;
      return {
        day:   new Date(day).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        total: cumulative,
      };
    });

    return { barData, pieData, lineData };
  }, [appointments]);

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

      {/* ── Charts section ── */}
      {!loading && (
        <div className="space-y-4">

          {/* Bar chart — full width */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-6">
            <p className="text-lg font-bold text-slate-900">Appointments per Day</p>
            <p className="text-sm text-slate-500 mb-4">Last 14 days</p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.barData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 13 }}
                  cursor={{ fill: '#f3f0ff' }}
                />
                <Bar dataKey="count" fill="#7c3aed" radius={[6, 6, 0, 0]} name="Appointments" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie + Line — side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Pie chart */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-6">
              <p className="text-lg font-bold text-slate-900">Status Distribution</p>
              <p className="text-sm text-slate-500 mb-4">All appointments</p>
              {chartData.pieData.length === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-slate-400 text-sm">
                  No data yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData.pieData}
                      cx="50%"
                      cy="45%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {chartData.pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 13 }}
                    />
                    <Legend iconType="circle" iconSize={10} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Line chart */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-6">
              <p className="text-lg font-bold text-slate-900">Appointments Trend</p>
              <p className="text-sm text-slate-500 mb-4">Cumulative over 30 days</p>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData.lineData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    tickFormatter={(val, i) => i % 5 === 0 ? val : ''}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 13 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#7c3aed"
                    strokeWidth={2.5}
                    dot={false}
                    name="Total"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

          </div>
        </div>
      )}

      {/* Loading skeleton for charts */}
      {loading && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-6">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32 mb-4" />
            <Skeleton className="h-[300px] w-full rounded-xl" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-6">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-32 mb-4" />
              <Skeleton className="h-[300px] w-full rounded-xl" />
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-6">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-32 mb-4" />
              <Skeleton className="h-[300px] w-full rounded-xl" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}