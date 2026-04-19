//src/app/auth/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { account, ID } from '@/lib/appwrite';
import { patientService } from '@/services/patient.service';
import { doctorService } from '@/services/doctor.service';
import { activationService } from '@/services/activation.service';
import { generateActivationCode, expiresInHours } from '@/lib/crypto-code';
import { toAppwriteDatetime } from '@/lib/utils';
import { getPatientLocation } from '@/lib/geolocation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, CheckCircle, Navigation, PenLine, AlertCircle } from 'lucide-react';

// ⚠️  IMPORTANT: sendActivationEmail() uses Nodemailer (server-only).
// If this component throws errors, move handlePatientSubmit and handleDoctorSubmit
// to a Next.js Server Action: src/app/auth/register/actions.ts
// Then use the form action prop instead of onSubmit.
// See setupGuide at the end of this file for details.

// ─── Types ────────────────────────────────────────────────────────────────────

type LocationMode = 'gps' | 'manual';

interface ClinicLocation {
  latitude?: number;
  longitude?: number;
}

interface LocationError {
  latitude?: string;
  longitude?: string;
}

// ─── Validation helpers ───────────────────────────────────────────────────────

function validateCoordinates(lat?: number, lng?: number): LocationError {
  const errors: LocationError = {};

  if (lat !== undefined) {
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.latitude = 'Latitude must be between -90 and 90.';
    }
  }

  if (lng !== undefined) {
    if (isNaN(lng) || lng < -180 || lng > 180) {
      errors.longitude = 'Longitude must be between -180 and 180.';
    }
  }

  return errors;
}

// ─── Sub-component: Clinic Location Picker ───────────────────────────────────

interface ClinicLocationPickerProps {
  value: ClinicLocation;
  onChange: (location: ClinicLocation) => void;
}

function ClinicLocationPicker({ value, onChange }: ClinicLocationPickerProps) {
  const [mode, setMode] = useState<LocationMode>('gps');
  const [fetchingGps, setFetchingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [coordErrors, setCoordErrors] = useState<LocationError>({});

  // ── GPS handler ───────────────────────────────────────────────────────────

  const handleGetGpsLocation = async () => {
    setFetchingGps(true);
    setGpsError(null);

    const location = await getPatientLocation();
    setFetchingGps(false);

    if (location) {
      onChange(location);
    } else {
      setGpsError(
        'Location access was denied. Please enable location permissions in your browser settings.'
      );
    }
  };

  // ── Manual handler ────────────────────────────────────────────────────────

  const handleManualChange = (field: 'latitude' | 'longitude', raw: string) => {
    const num = parseFloat(raw);
    const next: ClinicLocation = { ...value, [field]: isNaN(num) ? undefined : num };
    onChange(next);

    // Validate only the touched field inline
    const errors = validateCoordinates(next.latitude, next.longitude);
    setCoordErrors((prev) => ({ ...prev, [field]: errors[field] }));
  };

  // ── Mode switch ───────────────────────────────────────────────────────────

  const handleModeChange = (next: LocationMode) => {
    setMode(next);
    // Reset everything when switching modes to avoid stale data
    onChange({});
    setGpsError(null);
    setCoordErrors({});
  };

  const hasCaptured =
    value.latitude !== undefined &&
    value.longitude !== undefined &&
    Object.keys(coordErrors).filter((k) => coordErrors[k as keyof LocationError]).length === 0;

  return (
    <div className="space-y-3">
      <div>
        <Label>Clinic Location</Label>
        <p className="text-xs text-gray-500 mt-0.5">
          Used to display your clinic in nearest-doctor searches. Recommended but optional.
        </p>
      </div>

      {/* ── Mode toggle ── */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-100 rounded-lg">
        <button
          type="button"
          onClick={() => handleModeChange('gps')}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
            mode === 'gps'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Navigation className="h-3.5 w-3.5" />
          Use GPS
        </button>
        <button
          type="button"
          onClick={() => handleModeChange('manual')}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
            mode === 'manual'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <PenLine className="h-3.5 w-3.5" />
          Enter Manually
        </button>
      </div>

      {/* ── GPS panel ── */}
      {mode === 'gps' && (
        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleGetGpsLocation}
            disabled={fetchingGps}
            className="w-full"
          >
            <MapPin className="mr-2 h-4 w-4" />
            {fetchingGps
              ? 'Getting location…'
              : hasCaptured
              ? 'Refresh Location'
              : 'Get Current Location'}
          </Button>

          {gpsError && (
            <div className="flex items-start gap-2 p-2.5 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{gpsError}</span>
            </div>
          )}
        </div>
      )}

      {/* ── Manual panel ── */}
      {mode === 'manual' && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="manual-lat" className="text-xs text-gray-600">
              Latitude{' '}
              <span className="text-gray-400 font-normal">(-90 to 90)</span>
            </Label>
            <Input
              id="manual-lat"
              type="number"
              step="any"
              placeholder="e.g. 36.7372"
              value={value.latitude ?? ''}
              onChange={(e) => handleManualChange('latitude', e.target.value)}
              className={
                coordErrors.latitude ? 'border-red-400 focus-visible:ring-red-300' : ''
              }
            />
            {coordErrors.latitude && (
              <p className="text-xs text-red-600">{coordErrors.latitude}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="manual-lng" className="text-xs text-gray-600">
              Longitude{' '}
              <span className="text-gray-400 font-normal">(-180 to 180)</span>
            </Label>
            <Input
              id="manual-lng"
              type="number"
              step="any"
              placeholder="e.g. -0.6335"
              value={value.longitude ?? ''}
              onChange={(e) => handleManualChange('longitude', e.target.value)}
              className={
                coordErrors.longitude ? 'border-red-400 focus-visible:ring-red-300' : ''
              }
            />
            {coordErrors.longitude && (
              <p className="text-xs text-red-600">{coordErrors.longitude}</p>
            )}
          </div>
        </div>
      )}

      {/* ── Shared success indicator ── */}
      {hasCaptured && (
        <div className="flex items-center gap-2 p-2.5 rounded-md bg-green-50 border border-green-200 text-sm text-green-700">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          <span>
            Location set:{' '}
            <span className="font-mono">
              {value.latitude!.toFixed(5)}, {value.longitude!.toFixed(5)}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');

  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [clinicLocation, setClinicLocation] = useState<ClinicLocation>({});

  // ── Patient submit ────────────────────────────────────────────────────────

  const handlePatientSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const phone = formData.get('phone') as string;
    const dateOfBirth = formData.get('dateOfBirth') as string;
    const address = formData.get('address') as string;
    const city = formData.get('city') as string;

    try {
      // 1. Create Appwrite Auth account
      const user = await account.create(
        ID.unique(),
        email,
        password,
        `${firstName} ${lastName}`
      );

      // 2. Create patient profile — isActivated starts false           // ← NEW
      const patient = await patientService.createPatient({             // ← NEW
        userId: user.$id,
        firstName,
        lastName,
        email,
        phone: phone || undefined,
        dateOfBirth: toAppwriteDatetime(dateOfBirth),
        gender,
        address: address || undefined,
        city: city || undefined,
        isActivated: false,                                            // ← NEW
      });

      // 3. Generate activation code and persist it                     // ← NEW
      const code = generateActivationCode();                           // ← NEW
      await activationService.createActivation({                       // ← NEW
        code,                                                          // ← NEW
        email,                                                         // ← NEW
        role: 'patient',                                               // ← NEW
        userId: user.$id,                                              // ← NEW
        profileId: patient.$id,                                        // ← NEW
        expiresAt: expiresInHours(24),                                 // ← NEW
      });                                                              // ← NEW

      // 4. Send activation email                                       // ← NEW
      await fetch('/api/send-activation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    recipientEmail: email,
    recipientName: `${firstName} ${lastName}`,
    role: 'patient',
    activationCode: code,
  }),
});                                                            // ← NEW

      // 5. Redirect to "check your email" page                         // ← NEW
      router.push('/auth/check-email');                                // ← NEW

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ── Doctor submit ─────────────────────────────────────────────────────────

  const handleDoctorSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Guard: both coords must be present or both absent
    const hasLat = clinicLocation.latitude !== undefined;
    const hasLng = clinicLocation.longitude !== undefined;
    if (hasLat !== hasLng) {
      setError('Please provide both latitude and longitude, or leave both empty.');
      setLoading(false);
      return;
    }

    // Guard: values in range
    const coordErrors = validateCoordinates(clinicLocation.latitude, clinicLocation.longitude);
    if (Object.keys(coordErrors).length > 0) {
      setError('Clinic location coordinates are out of range. Please correct them.');
      setLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const phone = formData.get('phone') as string;
    const specialization = formData.get('specialization') as string;
    const licenseNumber = formData.get('licenseNumber') as string;
    const clinicAddress = formData.get('clinicAddress') as string;
    const city = formData.get('city') as string;
    const consultationFee = formData.get('consultationFee') as string;
    const bio = formData.get('bio') as string;

    try {
      if (!licenseFile) {
        setError('Medical license document is required');
        setLoading(false);
        return;
      }

      const user = await account.create(
        ID.unique(),
        email,
        password,
        `Dr. ${firstName} ${lastName}`
      );

      const licenseDocumentId = await doctorService.uploadFile(licenseFile);

      let profileImageId: string | undefined;
      if (profileImage) {
        profileImageId = await doctorService.uploadFile(profileImage);
      }

      // Create doctor profile — isActivated starts false               // ← NEW
      const doctor = await doctorService.createDoctor({                // ← NEW
        userId: user.$id,
        firstName,
        lastName,
        email,
        phone,
        specialization,
        licenseNumber,
        clinicAddress,
        city,
        consultationFee: consultationFee ? parseFloat(consultationFee) : undefined,
        bio: bio || undefined,
        licenseDocumentId,
        profileImageId,
        // undefined is fine — Appwrite omits the field when not provided
        latitude: clinicLocation.latitude,
        longitude: clinicLocation.longitude,
        isActivated: false,                                            // ← NEW
      });

      // Generate activation code and persist it                        // ← NEW
      const code = generateActivationCode();                           // ← NEW
      await activationService.createActivation({                       // ← NEW
        code,                                                          // ← NEW
        email,                                                         // ← NEW
        role: 'doctor',                                                // ← NEW
        userId: user.$id,                                              // ← NEW
        profileId: doctor.$id,                                         // ← NEW
        expiresAt: expiresInHours(24),                                 // ← NEW
      });                                                              // ← NEW

      // Send activation email                                          // ← NEW
      await fetch('/api/send-activation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    recipientEmail: email,
    recipientName: `Dr. ${firstName} ${lastName}`,
    role: 'doctor',
    activationCode: code,
  }),
});                                                              // ← NEW

      // Redirect to "check your email" page                            // ← NEW
      router.push('/auth/check-email');                                // ← NEW

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>Register as a patient or doctor</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={role} onValueChange={(v) => setRole(v as 'patient' | 'doctor')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="patient">Patient</TabsTrigger>
              <TabsTrigger value="doctor">Doctor</TabsTrigger>
            </TabsList>

            {/* ── Patient form ── */}
            <TabsContent value="patient">
              <form onSubmit={handlePatientSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input id="firstName" name="firstName" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input id="lastName" name="lastName" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" name="email" type="email" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input id="password" name="password" type="password" minLength={8} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" type="tel" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input id="dateOfBirth" name="dateOfBirth" type="date" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={gender} onValueChange={(v: any) => setGender(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" name="address" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" />
                </div>

                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating Account…' : 'Register as Patient'}
                </Button>
              </form>
            </TabsContent>

            {/* ── Doctor form ── */}
            <TabsContent value="doctor">
              <form onSubmit={handleDoctorSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="doc-firstName">First Name *</Label>
                    <Input id="doc-firstName" name="firstName" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doc-lastName">Last Name *</Label>
                    <Input id="doc-lastName" name="lastName" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doc-email">Email *</Label>
                  <Input id="doc-email" name="email" type="email" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doc-password">Password *</Label>
                  <Input
                    id="doc-password"
                    name="password"
                    type="password"
                    minLength={8}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doc-phone">Phone *</Label>
                  <Input id="doc-phone" name="phone" type="tel" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization *</Label>
                  <Input
                    id="specialization"
                    name="specialization"
                    placeholder="e.g., Cardiology"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">Medical License Number *</Label>
                  <Input id="licenseNumber" name="licenseNumber" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clinicAddress">Clinic Address *</Label>
                  <Input id="clinicAddress" name="clinicAddress" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doc-city">City *</Label>
                  <Input id="doc-city" name="city" required />
                </div>

                {/* ── Location picker (self-contained) ── */}
                <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                  <ClinicLocationPicker
                    value={clinicLocation}
                    onChange={setClinicLocation}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="consultationFee">Consultation Fee (DZD)</Label>
                  <Input
                    id="consultationFee"
                    name="consultationFee"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 3000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    rows={3}
                    placeholder="Brief professional summary…"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseFile">Medical License Document *</Label>
                  <Input
                    id="licenseFile"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
                    required
                  />
                  <p className="text-xs text-gray-500">Upload PDF or image</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profileImage">Profile Photo (Optional)</Label>
                  <Input
                    id="profileImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
                  />
                </div>

                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating Account…' : 'Register as Doctor'}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Your account will be pending verification by admin
                </p>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-sm text-center text-gray-600 mt-4">
            Already have an account?{' '}
            <a href="/auth/login" className="text-blue-600 hover:underline">
              Log in
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}