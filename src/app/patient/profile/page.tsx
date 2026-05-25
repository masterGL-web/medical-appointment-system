// src/app/patient/profile/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { patientService } from '@/services/patient.service';
import { UpdatePatientDTO } from '@/types/patient.types';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import {
  Loader2, User, Calendar, MapPin, Phone, Mail,
  Pencil, Heart, UserCircle, Check, X,
} from 'lucide-react';
import { ALGERIA_CITIES } from '@/constants/algeria-cities';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatMemberSince(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function formatDateOfBirth(dateStr: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

function toDateInputValue(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

function capitalise(str: string): string {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

// ── Form state type ───────────────────────────────────────────────────────────

type FormState = {
  firstName:      string;
  lastName:       string;
  phone:          string;
  gender:         'male' | 'female' | 'other';
  dateOfBirth:    string;
  city:           string;
  address:        string;
  medicalHistory: string;
};

// ── Read-only Field ───────────────────────────────────────────────────────────

function Field({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value?: string | null;
  fullWidth?: boolean;
}) {
  return (
    <div className={`space-y-1 ${fullWidth ? 'col-span-1 sm:col-span-2' : ''}`}>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
      <div className="bg-slate-50 rounded-xl px-4 py-3 mt-1">
        {value ? (
          <p className="text-sm font-medium text-slate-800">{value}</p>
        ) : (
          <p className="text-sm text-slate-400 italic">—</p>
        )}
      </div>
    </div>
  );
}

// ── Editable Field ────────────────────────────────────────────────────────────

type EditableFieldProps = {
  label:      string;
  fieldKey:   keyof FormState;
  form:       FormState;
  onChange:   (key: keyof FormState, value: string) => void;
  isEditing:  boolean;
  fullWidth?: boolean;
  displayValue?: string | null; // pre-formatted value for read mode
};

function EditableField({
  label, fieldKey, form, onChange, isEditing, fullWidth = false, displayValue,
}: EditableFieldProps) {
  const baseInputClass =
    'h-10 border-slate-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl text-sm';

  function renderEditor() {
    // Gender → <select>
    if (fieldKey === 'gender') {
      return (
        <select
          value={form.gender}
          onChange={(e) => onChange('gender', e.target.value)}
          className="w-full h-10 border border-slate-200 focus:border-teal-500 focus:outline-none rounded-xl text-sm px-3 bg-white text-slate-800"
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      );
    }

    // Date of birth → date input
    if (fieldKey === 'dateOfBirth') {
      return (
        <Input
          type="date"
          value={toDateInputValue(form.dateOfBirth)}
          onChange={(e) => onChange('dateOfBirth', e.target.value)}
          className={baseInputClass}
        />
      );
    }

    // Medical history → textarea
    if (fieldKey === 'medicalHistory') {
      return (
        <textarea
          rows={3}
          value={form.medicalHistory}
          onChange={(e) => onChange('medicalHistory', e.target.value)}
          placeholder="Add your medical history…"
          className="w-full border border-slate-200 focus:border-teal-500 focus:outline-none rounded-xl text-sm px-3 py-2 bg-white text-slate-800 resize-none"
        />
      );
    }

    // City → datalist autocomplete
    if (fieldKey === 'city') {
      return (
        <>
          <Input
            list="city-options"
            value={form.city}
            onChange={(e) => onChange('city', e.target.value)}
            placeholder="Enter city…"
            className={baseInputClass}
          />
          <datalist id="city-options">
            {(ALGERIA_CITIES as readonly string[]).map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </>
      );
    }

    // Default → text input
    return (
      <Input
        value={form[fieldKey]}
        onChange={(e) => onChange(fieldKey, e.target.value)}
        className={baseInputClass}
      />
    );
  }

  const readValue = displayValue !== undefined ? displayValue : form[fieldKey];

  return (
    <div className={`space-y-1 ${fullWidth ? 'col-span-1 sm:col-span-2' : ''}`}>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
      {isEditing ? (
        <div className="mt-1">{renderEditor()}</div>
      ) : (
        <div className="bg-slate-50 rounded-xl px-4 py-3 mt-1">
          {readValue ? (
            <p className="text-sm font-medium text-slate-800">{readValue}</p>
          ) : (
            <p className="text-sm text-slate-400 italic">—</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function PatientProfilePage() {
  const { patient, loading, refetch } = useAuth('patient');

  const [isEditing, setIsEditing] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [form,      setForm]      = useState<FormState>({
    firstName:      '',
    lastName:       '',
    phone:          '',
    gender:         'male',
    dateOfBirth:    '',
    city:           '',
    address:        '',
    medicalHistory: '',
  });

  // ── Initialise form from patient data ──────────────────────────────────────

  function startEditing() {
    if (!patient) return;
    setForm({
      firstName:      patient.firstName      ?? '',
      lastName:       patient.lastName       ?? '',
      phone:          patient.phone          ?? '',
      gender:         patient.gender         ?? 'male',
      dateOfBirth:    patient.dateOfBirth    ?? '',
      city:           patient.city           ?? '',
      address:        patient.address        ?? '',
      medicalHistory: patient.medicalHistory ?? '',
    });
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
  }

  function handleChange(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // ── Save ───────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!patient) return;
    setSaving(true);
    try {
      const dto: UpdatePatientDTO = {
        firstName:      form.firstName      || undefined,
        lastName:       form.lastName       || undefined,
        phone:          form.phone          || undefined,
        gender:         form.gender,
        dateOfBirth:    form.dateOfBirth    || undefined,
        city:           form.city           || undefined,
        address:        form.address        || undefined,
        medicalHistory: form.medicalHistory || undefined,
      };
      await patientService.updatePatient(patient.$id, dto);
      await refetch();
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading || !patient) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-teal-600" />
          <p className="text-sm text-slate-500">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const initials = `${patient.firstName?.[0] ?? ''}${patient.lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <div className="space-y-6">

      {/* ── Header banner ────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl px-8 py-6 shadow-lg shadow-teal-700/20">
        <h1 className="text-3xl font-bold text-white">My Profile</h1>
        <p className="text-teal-100 mt-1">Manage your personal information</p>
      </div>

      {/* ── Two-column layout ─────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── Left: Avatar card ──────────────────────────────────────────────── */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">

            {/* Gradient top */}
            <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-t-2xl px-6 py-8 flex flex-col items-center gap-3">
              <div className="h-24 w-24 rounded-full bg-white/20 ring-4 ring-white/30 shadow-lg flex items-center justify-center text-3xl font-bold text-white">
                {initials}
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-white">
                  {patient.firstName} {patient.lastName}
                </p>
                <span className="text-sm text-white/70 bg-white/20 px-3 py-0.5 rounded-full mt-1 inline-block">
                  Patient
                </span>
              </div>
            </div>

            {/* White bottom */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <Calendar className="h-4 w-4 text-teal-600 flex-shrink-0" />
                <span>Member since {formatMemberSince(patient.$createdAt)}</span>
              </div>

              <div className="border-t border-slate-100" />

              <div className="space-y-2.5">
                {patient.email && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Mail className="h-4 w-4 text-teal-400 flex-shrink-0" />
                    <span className="truncate">{patient.email}</span>
                  </div>
                )}
                {patient.phone && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Phone className="h-4 w-4 text-teal-400 flex-shrink-0" />
                    <span>{patient.phone}</span>
                  </div>
                )}
                {patient.city && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <MapPin className="h-4 w-4 text-teal-400 flex-shrink-0" />
                    <span>{patient.city}</span>
                  </div>
                )}
              </div>

              {/* Account status */}
              <div className="border-t border-slate-100 pt-4">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  patient.isActivated
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${patient.isActivated ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {patient.isActivated ? 'Active account' : 'Pending activation'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Info cards ─────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Personal Information */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-teal-100 p-2">
                  <User className="h-5 w-5 text-teal-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
              </div>

              {/* Edit / Save / Cancel buttons */}
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={cancelEditing}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium transition-colors disabled:opacity-70"
                  >
                    {saving
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <Check className="h-4 w-4" />}
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={startEditing}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>
              )}
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <EditableField label="First Name"    fieldKey="firstName"   form={form} onChange={handleChange} isEditing={isEditing} />
              <EditableField label="Last Name"     fieldKey="lastName"    form={form} onChange={handleChange} isEditing={isEditing} />

              {/* Email — always read-only */}
              <Field label="Email" value={patient.email} fullWidth />

              <EditableField label="Phone"         fieldKey="phone"       form={form} onChange={handleChange} isEditing={isEditing} />
              <EditableField label="Gender"        fieldKey="gender"      form={form} onChange={handleChange} isEditing={isEditing}
                displayValue={capitalise(patient.gender)} />
              <EditableField label="Date of Birth" fieldKey="dateOfBirth" form={form} onChange={handleChange} isEditing={isEditing}
                displayValue={patient.dateOfBirth ? formatDateOfBirth(patient.dateOfBirth) : null} />
              <EditableField label="City"          fieldKey="city"        form={form} onChange={handleChange} isEditing={isEditing} />
              <EditableField label="Address"       fieldKey="address"     form={form} onChange={handleChange} isEditing={isEditing} fullWidth />
            </div>
          </div>

          {/* Medical Information */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4 flex items-center gap-3">
              <div className="rounded-xl bg-teal-100 p-2">
                <Heart className="h-5 w-5 text-teal-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Medical Information</h2>
            </div>

            <div className="p-6">
              {isEditing ? (
                <EditableField
                  label="Medical History"
                  fieldKey="medicalHistory"
                  form={form}
                  onChange={handleChange}
                  isEditing={isEditing}
                  fullWidth
                />
              ) : patient.medicalHistory ? (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Medical History</p>
                  <div className="bg-slate-50 rounded-xl px-4 py-3 mt-1">
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                      {patient.medicalHistory}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <UserCircle className="h-10 w-10 text-slate-200" />
                  <p className="text-sm text-slate-400">No medical history recorded</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}