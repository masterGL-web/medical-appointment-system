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

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Doctors</h1>
          <p className="text-gray-500 mt-1">Manage and verify doctor accounts</p>
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
            <Stethoscope className="h-4 w-4 text-blue-600" />
            All Doctors ({loading ? '…' : doctors.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <Skeleton className="h-8 w-20 rounded" />
                </div>
              ))}
            </div>
          ) : doctors.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No doctors registered yet</div>
          ) : (
            <div className="divide-y divide-gray-100">

              {/* Table header — now 12 cols: 4 name | 3 spec | 2 city | 1 status | 2 actions */}
              <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="col-span-4">Doctor</div>
                <div className="col-span-3">Specialization</div>
                <div className="col-span-2">City</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              {doctors.map((doctor) => (
                <div
                  key={doctor.$id}
                  className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-gray-50 transition-colors"
                >
                  {/* Name */}
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                      {doctor.firstName[0]}{doctor.lastName[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        Dr. {doctor.firstName} {doctor.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{doctor.email}</p>
                    </div>
                  </div>

                  {/* Specialization */}
                  <div className="col-span-3">
                    <p className="text-sm text-gray-700 truncate">{doctor.specialization}</p>
                  </div>

                  {/* City */}
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 truncate">{doctor.city}</p>
                  </div>

                  {/* Verified badge */}
                  <div className="col-span-1">
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
                  </div>

                  {/* Actions — View Profile + Verify toggle */}
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    {/* View Profile button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openProfile(doctor)}
                      className="h-7 px-2 text-xs text-gray-600 hover:text-blue-600 hover:border-blue-300"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      View
                    </Button>

                    {/* Verify / Unverify */}
                    <Button
                      size="sm"
                      variant={doctor.isVerified ? 'outline' : 'default'}
                      disabled={toggling === doctor.$id}
                      onClick={() => toggleVerify(doctor)}
                      className={
                        doctor.isVerified
                          ? 'border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-7 text-xs'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white h-7 text-xs'
                      }
                    >
                      {toggling === doctor.$id
                        ? '…'
                        : doctor.isVerified
                        ? 'Unverify'
                        : 'Verify'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile dialog */}
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