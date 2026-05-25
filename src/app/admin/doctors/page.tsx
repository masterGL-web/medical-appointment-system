// src/app/admin/doctors/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { databases, storage } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Stethoscope,
  AlertCircle,
  BadgeCheck,
  RefreshCw,
  Eye,
  ExternalLink,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  Building2,
  GraduationCap,
  DollarSign,
  Award,
  FileWarning,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
} from 'lucide-react';
import type { Doctor } from '@/types/doctor.types';

// ─── Env vars ─────────────────────────────────────────────────────────────────

const DB      = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const DOCS    = process.env.NEXT_PUBLIC_APPWRITE_DOCTORS_COLLECTION_ID!;
const BUCKET  = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID!;
const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const PROJECT  = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getFileUrl(fileId: string): string {
  return `${ENDPOINT}/storage/buckets/${BUCKET}/files/${fileId}/view?project=${PROJECT}`;
}

// ─── License viewer sub-component ─────────────────────────────────────────────

interface LicenseViewerProps {
  licenseDocumentId: string | undefined;
}

function LicenseViewer({ licenseDocumentId }: LicenseViewerProps) {
  const [mimeType, setMimeType]   = useState<string | null>(null);
  const [loadingMime, setLoadingMime] = useState(false);
  const [mimeError, setMimeError] = useState(false);

  useEffect(() => {
    if (!licenseDocumentId) return;

    const fetchMime = async () => {
      setLoadingMime(true);
      setMimeError(false);
      try {
        const meta = await storage.getFile(BUCKET, licenseDocumentId);
        setMimeType(meta.mimeType);
      } catch {
        setMimeError(true);
      } finally {
        setLoadingMime(false);
      }
    };

    fetchMime();
  }, [licenseDocumentId]);

  if (!licenseDocumentId) {
    return (
      <div className="flex items-center gap-2 p-4 rounded-lg bg-gray-50 border border-gray-200 text-gray-500">
        <FileWarning className="h-5 w-5 flex-shrink-0" />
        <span className="text-sm">No license document uploaded</span>
      </div>
    );
  }

  const fileUrl = getFileUrl(licenseDocumentId);

  if (loadingMime) {
    return <Skeleton className="w-full h-48 rounded-lg" />;
  }

  if (mimeError) {
    return (
      <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        Failed to load document preview.{' '}
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-red-700"
        >
          Open in new tab
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Preview */}
      {mimeType?.startsWith('image/') ? (
        <img
          src={fileUrl}
          alt="License document"
          className="w-full rounded-lg border border-gray-200 object-contain max-h-96"
        />
      ) : (
        <iframe
          src={fileUrl}
          title="License document"
          className="w-full rounded-lg border border-gray-200"
          style={{ height: 500 }}
        />
      )}

      {/* Download button */}
      <a href={fileUrl} target="_blank" rel="noopener noreferrer">
        <Button variant="outline" size="sm" className="gap-2">
          <ExternalLink className="h-4 w-4" />
          Download / Open in new tab
        </Button>
      </a>
    </div>
  );
}

// ─── Profile field helper ─────────────────────────────────────────────────────

interface FieldProps {
  icon:  React.ElementType;
  label: string;
  value: string | number | undefined | null;
}

function ProfileField({ icon: Icon, label, value }: FieldProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="h-4 w-4 text-gray-500" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-sm text-gray-900 mt-0.5 break-words">
          {value ?? <span className="text-gray-400 italic">Not provided</span>}
        </p>
      </div>
    </div>
  );
}

// ─── Doctor Profile Dialog ─────────────────────────────────────────────────────

interface DoctorProfileDialogProps {
  doctor:     Doctor | null;
  open:       boolean;
  onClose:    () => void;
  onVerify:   (doctor: Doctor) => Promise<void>;
  toggling:   string | null;
}

function DoctorProfileDialog({
  doctor,
  open,
  onClose,
  onVerify,
  toggling,
}: DoctorProfileDialogProps) {
  if (!doctor) return null;

  const isToggling = toggling === doctor.$id;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
              {doctor.firstName[0]}{doctor.lastName[0]}
            </div>
            <div>
              <DialogTitle className="text-xl">
                Dr. {doctor.firstName} {doctor.lastName}
              </DialogTitle>
              <p className="text-sm text-blue-600 mt-0.5">{doctor.specialization}</p>
              <div className="flex items-center gap-2 mt-1">
                {doctor.isVerified ? (
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 border gap-1 text-xs">
                    <BadgeCheck className="h-3 w-3" />
                    Verified
                  </Badge>
                ) : (
                  <Badge className="bg-amber-50 text-amber-700 border-amber-200 border text-xs">
                    Unverified
                  </Badge>
                )}
                {doctor.isActivated ? (
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200 border text-xs">
                    Activated
                  </Badge>
                ) : (
                  <Badge className="bg-red-50 text-red-700 border-red-200 border text-xs">
                    Not Activated
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        {/* Section 1 — Doctor Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
            Doctor Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ProfileField icon={User}        label="Full Name"          value={`Dr. ${doctor.firstName} ${doctor.lastName}`} />
            <ProfileField icon={Mail}        label="Email"              value={doctor.email} />
            <ProfileField icon={Phone}       label="Phone"              value={doctor.phone} />
            <ProfileField icon={Stethoscope} label="Specialization"     value={doctor.specialization} />
            <ProfileField icon={MapPin}      label="City"               value={doctor.city} />
            <ProfileField icon={Building2}   label="Clinic Name"        value={doctor.clinicName} />
            <ProfileField icon={MapPin}      label="Clinic Address"     value={doctor.clinicAddress} />
            <ProfileField icon={Award}       label="License Number"     value={doctor.licenseNumber} />
            <ProfileField icon={GraduationCap} label="Years of Experience" value={doctor.yearsOfExperience != null ? `${doctor.yearsOfExperience} years` : undefined} />
            <ProfileField icon={DollarSign}  label="Consultation Fee"   value={doctor.consultationFee != null ? `${doctor.consultationFee} DZD` : undefined} />
          </div>

          {doctor.education && (
            <ProfileField icon={GraduationCap} label="Education" value={doctor.education} />
          )}

          {doctor.bio && (
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
              <p className="text-xs text-gray-500 font-medium mb-1">Bio</p>
              <p className="text-sm text-gray-800 leading-relaxed">{doctor.bio}</p>
            </div>
          )}
        </div>

        <Separator />

        {/* Section 2 — License Document */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
            <FileText className="h-4 w-4" />
            License Document
          </h3>
          <LicenseViewer licenseDocumentId={doctor.licenseDocumentId} />
        </div>

        <DialogFooter className="flex items-center justify-between pt-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            disabled={isToggling}
            onClick={() => onVerify(doctor)}
            className={
              doctor.isVerified
                ? 'border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 border bg-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }
          >
            {isToggling
              ? 'Updating…'
              : doctor.isVerified
              ? 'Unverify Doctor'
              : 'Verify Doctor'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminDoctorsPage() {
  const [doctors, setDoctors]       = useState<Doctor[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [toggling, setToggling]     = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const res = await databases.listDocuments(DB, DOCS, [
        Query.orderDesc('$createdAt'),
        Query.limit(100),
      ]);
      setDoctors(res.documents as unknown as Doctor[]);
    } catch {
      setError('Failed to load doctors.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleVerify = async (doctor: Doctor) => {
    setToggling(doctor.$id);
    try {
      await databases.updateDocument(DB, DOCS, doctor.$id, {
        isVerified: !doctor.isVerified,
      });

      // Update both list state and selected doctor state (so dialog badge updates live)
      const updated = { ...doctor, isVerified: !doctor.isVerified };
      setDoctors((prev) => prev.map((d) => d.$id === doctor.$id ? updated : d));
      if (selectedDoctor?.$id === doctor.$id) setSelectedDoctor(updated);

      toast.success(
        doctor.isVerified
          ? `Dr. ${doctor.firstName} ${doctor.lastName} unverified`
          : `Dr. ${doctor.firstName} ${doctor.lastName} verified`
      );
    } catch {
      toast.error('Failed to update doctor status');
    } finally {
      setToggling(null);
    }
  };

  const openProfile = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setDialogOpen(true);
  };

  const closeProfile = () => {
    setDialogOpen(false);
    // Small delay before clearing so dialog closes gracefully
    setTimeout(() => setSelectedDoctor(null), 200);
  };

  const verifiedCount   = doctors.filter(d => d.isVerified).length;
  const unverifiedCount = doctors.filter(d => !d.isVerified).length;

  return (
    <div className="space-y-6">

      {/* ── Header banner ── */}
      <div className="bg-gradient-to-r from-purple-800 to-purple-700 rounded-2xl px-8 py-6 shadow-lg shadow-purple-900/20 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Doctors</h1>
          <p className="text-purple-200 mt-1">Manage and verify doctor accounts</p>
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
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 border-b-4 border-b-purple-400 shadow-md p-5 flex items-center justify-between hover:shadow-lg transition-shadow">
            <div>
              <Stethoscope className="h-5 w-5 text-purple-400 mb-1" />
              <p className="text-3xl font-bold text-purple-600">{doctors.length}</p>
              <p className="text-sm text-slate-500 font-medium">Total Doctors</p>
            </div>
            <div className="rounded-2xl bg-purple-50 p-3"><Stethoscope className="h-6 w-6 text-purple-500" /></div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 border-b-4 border-b-emerald-400 shadow-md p-5 flex items-center justify-between hover:shadow-lg transition-shadow">
            <div>
              <CheckCircle2 className="h-5 w-5 text-emerald-400 mb-1" />
              <p className="text-3xl font-bold text-emerald-600">{verifiedCount}</p>
              <p className="text-sm text-slate-500 font-medium">Verified</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3"><CheckCircle2 className="h-6 w-6 text-emerald-500" /></div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 border-b-4 border-b-amber-400 shadow-md p-5 flex items-center justify-between hover:shadow-lg transition-shadow">
            <div>
              <Clock className="h-5 w-5 text-amber-400 mb-1" />
              <p className="text-3xl font-bold text-amber-600">{unverifiedCount}</p>
              <p className="text-sm text-slate-500 font-medium">Unverified</p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-3"><Clock className="h-6 w-6 text-amber-500" /></div>
          </div>
        </div>
      )}

      {/* ── Doctors table card ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">

        {/* Card header */}
        <div className="border-b border-slate-100 px-6 py-4 flex items-center gap-3 bg-gradient-to-r from-slate-50 to-white">
          <div className="rounded-xl bg-purple-100 p-2">
            <Stethoscope className="h-5 w-5 text-purple-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            All Doctors ({loading ? '…' : doctors.length})
          </h2>
        </div>

        {loading ? (
          <div className="space-y-3 p-6">
            {[1,2,3,4].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-11 h-11 rounded-2xl" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-7 w-20 rounded-lg" />
              </div>
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Stethoscope className="h-16 w-16 text-slate-200" />
            <p className="text-lg font-semibold text-slate-400">No doctors found</p>
            <p className="text-sm text-slate-400">No doctors registered yet</p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <div className="col-span-4">Doctor</div>
              <div className="col-span-2">Specialization</div>
              <div className="col-span-2">City</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* Rows */}
            {doctors.map((doctor) => (
              <div
                key={doctor.$id}
                className="grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-slate-100 last:border-b-0 hover:bg-slate-50/80 transition-colors"
              >
                {/* Doctor */}
                <div className="col-span-4 flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md">
                    {doctor.firstName[0]}{doctor.lastName[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      Dr. {doctor.firstName} {doctor.lastName}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{doctor.email}</p>
                  </div>
                </div>

                {/* Specialization */}
                <div className="col-span-2">
                  <p className="text-sm text-slate-600 truncate">{doctor.specialization}</p>
                </div>

                {/* City */}
                <div className="col-span-2 flex items-center gap-1.5 text-sm text-slate-600">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{doctor.city}</span>
                </div>

                {/* Status */}
                <div className="col-span-2">
                  {doctor.isVerified ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      <Clock className="h-3.5 w-3.5" /> Unverified
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openProfile(doctor)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" /> View
                  </button>

                  {doctor.isVerified ? (
                    <button
                      disabled={toggling === doctor.$id}
                      onClick={() => toggleVerify(doctor)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 text-xs font-medium transition-colors disabled:opacity-40"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      {toggling === doctor.$id ? '…' : 'Unverify'}
                    </button>
                  ) : (
                    <button
                      disabled={toggling === doctor.$id}
                      onClick={() => toggleVerify(doctor)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors disabled:opacity-40"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {toggling === doctor.$id ? '…' : 'Verify'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Profile dialog — unchanged */}
      <DoctorProfileDialog
        doctor={selectedDoctor}
        open={dialogOpen}
        onClose={closeProfile}
        onVerify={toggleVerify}
        toggling={toggling}
      />
    </div>
  );
}