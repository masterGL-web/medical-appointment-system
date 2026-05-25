//src/app/doctor/profile/page.tsx
'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { doctorService } from '@/services/doctor.service';
import { toast } from 'sonner';
import {
  User, Mail, Phone, MapPin, CheckCircle2, Clock,
  Building2, DollarSign, GraduationCap, FileText,
  Calendar, Loader2, Pencil, Briefcase,
} from 'lucide-react';

// ── Field component ───────────────────────────────────────────────────────────

function Field({
  label, value, fullWidth = false,
}: {
  label: string; value?: string | null; fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? 'col-span-1 sm:col-span-2' : ''}>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
      <div className="bg-slate-50 rounded-xl px-4 py-3 mt-1">
        {value
          ? <p className="text-sm font-medium text-slate-800">{value}</p>
          : <p className="text-sm text-slate-400 italic">—</p>
        }
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DoctorProfilePage() {
  const { doctor } = useAuth('doctor');

  if (!doctor) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-600" />
          <p className="text-sm text-slate-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  const profileImageUrl = doctor.profileImageId
    ? doctorService.getFilePreview(doctor.profileImageId)
    : null;
  const initials = `${doctor.firstName?.[0] ?? ''}${doctor.lastName?.[0] ?? ''}`.toUpperCase();

  const memberSince = new Date(doctor.$createdAt).toLocaleDateString('en-US', {
    month: 'long', year: 'numeric',
  });

  return (
    <div className="space-y-6">

      {/* ── Header banner ── */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl px-8 py-6 shadow-lg flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Profile</h1>
          <p className="text-slate-300 mt-1">Manage your professional information</p>
        </div>
        <button
          onClick={() => toast.info('Edit profile coming soon')}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <Pencil className="h-4 w-4" />
          Edit Profile
        </button>
      </div>

      {/* ── Two-column layout ── */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── Left: Avatar card ── */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">

            {/* Gradient top */}
            <div className="bg-gradient-to-br from-slate-700 to-slate-800 px-6 py-8 flex flex-col items-center gap-3">
              <div className="h-24 w-24 rounded-full overflow-hidden ring-4 ring-white/30 shadow-lg flex items-center justify-center bg-white/20 text-3xl font-bold text-white flex-shrink-0">
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                      (e.currentTarget.parentElement as HTMLElement).innerText = initials;
                    }}
                  />
                ) : initials}
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-white">
                  Dr. {doctor.firstName} {doctor.lastName}
                </p>
                <span className="text-sm text-white/70 bg-white/20 px-3 py-0.5 rounded-full mt-1 inline-block">
                  {doctor.specialization}
                </span>
              </div>
            </div>

            {/* White bottom */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2.5 text-sm text-slate-500">
                <Calendar className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>Member since {memberSince}</span>
              </div>

              <div className="border-t border-slate-100" />

              <div className="space-y-2.5">
                {doctor.email && (
                  <div className="flex items-center gap-2.5 text-sm text-slate-600">
                    <Mail className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    <span className="truncate">{doctor.email}</span>
                  </div>
                )}
                {doctor.phone && (
                  <div className="flex items-center gap-2.5 text-sm text-slate-600">
                    <Phone className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    <span>{doctor.phone}</span>
                  </div>
                )}
                {doctor.city && (
                  <div className="flex items-center gap-2.5 text-sm text-slate-600">
                    <MapPin className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    <span>{doctor.city}{doctor.country ? `, ${doctor.country}` : ''}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100" />

              {/* Verification badge */}
              <div className={`flex items-center gap-2 w-full justify-center px-3 py-1.5 rounded-xl text-sm font-semibold ${
                doctor.isVerified
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {doctor.isVerified
                  ? <><CheckCircle2 className="h-4 w-4" /> Verified Doctor</>
                  : <><Clock className="h-4 w-4" /> Pending Verification</>
                }
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Info cards ── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Personal Information */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-100 p-2">
                  <User className="h-5 w-5 text-emerald-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
              </div>
              <button
                onClick={() => toast.info('Edit profile coming soon')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="First Name"       value={doctor.firstName} />
              <Field label="Last Name"        value={doctor.lastName} />
              <Field label="Email"            value={doctor.email}         fullWidth />
              <Field label="Phone"            value={doctor.phone} />
              <Field label="Specialization"   value={doctor.specialization} />
              <Field label="License Number"   value={doctor.licenseNumber} />
              {doctor.yearsOfExperience && (
                <Field label="Years of Experience" value={`${doctor.yearsOfExperience} years`} />
              )}
              {doctor.education && (
                <Field label="Education" value={doctor.education} fullWidth />
              )}
            </div>
          </div>

          {/* Clinic Information */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4 flex items-center gap-3">
              <div className="rounded-xl bg-emerald-100 p-2">
                <Building2 className="h-5 w-5 text-emerald-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Clinic Information</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {doctor.clinicName && (
                <Field label="Clinic Name" value={doctor.clinicName} />
              )}
              <Field label="Address" value={doctor.clinicAddress} fullWidth />
              <Field label="City"    value={doctor.city} />
              {doctor.country && (
                <Field label="Country" value={doctor.country} />
              )}
              {!!doctor.consultationFee && (
                <div className="col-span-1 sm:col-span-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Consultation Fee
                  </p>
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 mt-1">
                    <p className="text-xl font-bold text-emerald-600">
                      {doctor.consultationFee} DZD
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bio — only if exists */}
          {doctor.bio && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
              <div className="border-b border-slate-100 px-6 py-4 flex items-center gap-3">
                <div className="rounded-xl bg-emerald-100 p-2">
                  <FileText className="h-5 w-5 text-emerald-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">About</h2>
              </div>
              <div className="p-6">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-sm text-slate-700 leading-relaxed">{doctor.bio}</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}