//src/app/doctor/patients/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { appointmentService } from '@/services/appointment.service';
import { AppointmentWithPatient } from '@/types/appointment.types';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Phone, Calendar, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface PatientSummary {
  name:        string;
  phone?:      string;
  lastVisit:   string;
  totalVisits: number;
  upcoming:    number;
  initials:    string;
}

export default function DoctorPatientsPage() {
  const { doctor } = useAuth('doctor');

  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (doctor) loadPatients();
  }, [doctor]);

  const loadPatients = async () => {
    if (!doctor) return;
    try {
      setLoading(true);
      const appointments = await appointmentService.getAppointmentsWithPatient(doctor.$id);

      const patientMap = new Map<string, {
        name:         string;
        phone?:       string;
        appointments: AppointmentWithPatient[];
      }>();

      appointments.forEach((apt) => {
        const key = apt.patientId;
        if (!patientMap.has(key)) {
          patientMap.set(key, {
            name:         apt.patient.fullName,
            phone:        apt.patient.phone,
            appointments: [],
          });
        }
        patientMap.get(key)!.appointments.push(apt);
      });

      const patientsData: PatientSummary[] = Array.from(patientMap.values()).map((p) => {
        const sorted   = [...p.appointments].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        const parts    = p.name.trim().split(' ');
        const initials = parts.length >= 2
          ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
          : p.name.slice(0, 2).toUpperCase();

        return {
          name:        p.name,
          phone:       p.phone,
          lastVisit:   sorted[0].date,
          totalVisits: p.appointments.filter((a) => a.status === 'completed').length,
          upcoming:    p.appointments.filter((a) =>
            a.status === 'pending' || a.status === 'confirmed'
          ).length,
          initials,
        };
      });

      // Sort by last visit descending
      patientsData.sort(
        (a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime()
      );

      setPatients(patientsData);
    } catch (err) {
      console.error('Failed to load patients:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-600" />
          <p className="text-sm text-slate-500">Loading patients...</p>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Header banner ── */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl px-8 py-6 shadow-lg flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Patients</h1>
          <p className="text-slate-300 mt-1">Overview of all your patients</p>
        </div>
        <div className="bg-white/10 rounded-2xl px-5 py-3 text-center">
          <p className="text-3xl font-bold text-white">{patients.length}</p>
          <p className="text-xs text-slate-300 font-medium mt-0.5">Total Patients</p>
        </div>
      </div>

      {/* ── Stats row ── */}
      {patients.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 border-b-4 border-b-violet-400 shadow-md p-5 flex items-center justify-between hover:shadow-lg transition-shadow">
            <div>
              <Users className="h-5 w-5 text-violet-400 mb-1" />
              <p className="text-3xl font-bold text-violet-600">{patients.length}</p>
              <p className="text-sm text-slate-500 font-medium">Total</p>
            </div>
            <div className="rounded-2xl bg-violet-50 p-3">
              <Users className="h-6 w-6 text-violet-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 border-b-4 border-b-emerald-400 shadow-md p-5 flex items-center justify-between hover:shadow-lg transition-shadow">
            <div>
              <CheckCircle2 className="h-5 w-5 text-emerald-400 mb-1" />
              <p className="text-3xl font-bold text-emerald-600">
                {patients.reduce((s, p) => s + p.totalVisits, 0)}
              </p>
              <p className="text-sm text-slate-500 font-medium">Completed</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 border-b-4 border-b-blue-400 shadow-md p-5 flex items-center justify-between hover:shadow-lg transition-shadow col-span-2 sm:col-span-1">
            <div>
              <Clock className="h-5 w-5 text-blue-400 mb-1" />
              <p className="text-3xl font-bold text-blue-600">
                {patients.reduce((s, p) => s + p.upcoming, 0)}
              </p>
              <p className="text-sm text-slate-500 font-medium">Upcoming</p>
            </div>
            <div className="rounded-2xl bg-blue-50 p-3">
              <Clock className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </div>
      )}

      {/* ── Patients list card ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">

        {/* Card header */}
        <div className="border-b border-slate-100 px-6 py-4 flex items-center gap-3 bg-gradient-to-r from-slate-50 to-white">
          <div className="rounded-xl bg-emerald-100 p-2">
            <Users className="h-5 w-5 text-emerald-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Patients ({patients.length})
          </h2>
        </div>

        {patients.length > 0 ? (
          <div className="p-6 space-y-4">
            {patients.map((patient, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4 hover:shadow-md hover:border-emerald-200 transition-all duration-200"
              >
                {/* Avatar */}
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-md">
                  {patient.initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-slate-900 truncate">{patient.name}</p>
                  {patient.phone && (
                    <p className="flex items-center gap-1.5 text-sm text-slate-500 mt-0.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      {patient.phone}
                    </p>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="flex items-center gap-1.5 text-sm text-slate-500 justify-end">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {new Date(patient.lastVisit).toLocaleDateString('en-US', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 text-right">Last visit</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {patient.totalVisits} visits
                      </div>
                    </div>
                    {patient.upcoming > 0 && (
                      <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                        <Clock className="h-3.5 w-3.5" />
                        {patient.upcoming} upcoming
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Users className="h-16 w-16 text-slate-200" />
            <p className="text-lg font-semibold text-slate-400">No patients yet</p>
            <p className="text-sm text-slate-400">
              Patients will appear here after their first appointment
            </p>
          </div>
        )}
      </div>
    </div>
  );
}