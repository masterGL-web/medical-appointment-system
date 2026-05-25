'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stethoscope, Shield, Calendar, Users, UserPlus, Eye, EyeOff,
  Mail, Lock, Phone, MapPin, FileText, Award, Building2, DollarSign,
  Upload, ImagePlus, ArrowRight, ChevronDown, Navigation, PenLine,
  CheckCircle, AlertCircle, ShieldCheck,
} from 'lucide-react';
import { account, ID } from '@/lib/appwrite';
import { patientService } from '@/services/patient.service';
import { doctorService } from '@/services/doctor.service';
import { activationService } from '@/services/activation.service';
import { generateActivationCode, expiresInHours } from '@/lib/crypto-code';
import { toAppwriteDatetime } from '@/lib/utils';
import { getPatientLocation } from '@/lib/geolocation';
import { ALGERIA_CITIES } from '@/constants/algeria-cities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const SPECIALTIES = [
  "Médecine Générale","Médecine de Famille","Médecine Interne","Pédiatrie",
  "Allergologie","Andrologie","Angiologie et Phlébologie","Cardiologie",
  "Cardiologie Pédiatrique","Dermatologie","Endocrinologie",
  "Endocrinologie et Diabétologie","Gastro-entéro-hépatologie",
  "Gynécologie-Obstétrique","Hématologie","Infectiologie","Médecine Légale",
  "Néphrologie","Neurologie","Neurologie Pédiatrique","Neurophysiologie",
  "Neuropsychiatrie","Oncologie Médicale","Ophtalmologie",
  "ORL (Oto-Rhino-Laryngologie)","Pneumo-phtisiologie","Psychiatrie",
  "Psychologie","Psychothérapie","Rhumatologie","Urologie",
  "Anesthésie et Réanimation","Chirurgie Cardiaque et Vasculaire",
  "Chirurgie Esthétique","Chirurgie Générale","Chirurgie Maxillo-faciale",
  "Chirurgie Orthopédique et Traumatologique","Chirurgie Pédiatrique",
  "Chirurgie Plastique et Reconstructrice","Chirurgie Urologique",
  "Neurochirurgie","Orthopédie-Traumatologie","Réanimation",
  "Esthétique et Laser","Esthétique Générale","Nutritionniste","Diététique",
  "Kinésithérapie","Masseur-Kinésithérapie","Médecine Physique et Réadaptation",
  "Orthophonie","Ostéopathie","Pédicure-Podologie","Physiothérapie",
  "Psychomotricité","Rééducation Fonctionnelle",
  "Anatomie et Cytologie Pathologiques","Biologie Clinique","Échographie",
  "IRM","Mammographie","Radiologie / Imagerie Médicale",
  "Radiologie Conventionnelle","Radiologie Dentaire",
  "Radiologie Interventionnelle","Tomodensitométrie (Scanner)",
  "Chirurgie Dentaire","Orthodontie",
  "Acupuncture et Auriculothérapie","Conseils et Orientations",
  "Médecine du Travail","Médecine d'Urgence","Sage-femme",
  "Audio-Prothèse","Centre d'Analyse Médicale","Centre Médical",
  "Orthoptique","Ortho-Prothèse","Soins Infirmiers","Pharmacie",
  "Optique Médicale","Ambulance",
] as const;

type LocationMode = 'gps' | 'manual';
interface ClinicLocation { latitude?: number; longitude?: number; }
interface LocationError { latitude?: string; longitude?: string; }

function validateCoordinates(lat?: number, lng?: number): LocationError {
  const errors: LocationError = {};
  if (lat !== undefined && (isNaN(lat) || lat < -90 || lat > 90)) errors.latitude = 'Latitude must be between -90 and 90.';
  if (lng !== undefined && (isNaN(lng) || lng < -180 || lng > 180)) errors.longitude = 'Longitude must be between -180 and 180.';
  return errors;
}

// ─── Autocomplete Input ──────────────────────────────────────────────────────

interface AutocompleteInputProps {
  id: string; name: string; placeholder: string; icon: React.ElementType;
  required?: boolean; suggestions: readonly string[];
  value: string; onChange: (v: string) => void;
}

function AutocompleteInput({ id, name, placeholder, icon: Icon, required, suggestions, value, onChange }: AutocompleteInputProps) {
  const [filtered, setFiltered] = useState<string[]>([]);
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setShow(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleChange = (v: string) => {
    onChange(v);
    if (v.trim().length > 0) {
      setFiltered((suggestions as readonly string[]).filter(s => s.toLowerCase().includes(v.toLowerCase())).slice(0, 8));
      setShow(true);
    } else setShow(false);
  };

  return (
    <div ref={ref} className="relative">
      <Input id={id} name={name} placeholder={placeholder} required={required} value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="pl-10 h-12 border-slate-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl" />
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      {show && filtered.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto">
          {filtered.map(item => (
            <button key={item} type="button" onClick={() => { onChange(item); setShow(false); }}
              className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors">{item}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Clinic Location Picker ──────────────────────────────────────────────────

function ClinicLocationPicker({ value, onChange }: { value: ClinicLocation; onChange: (l: ClinicLocation) => void }) {
  const [mode, setMode] = useState<LocationMode>('gps');
  const [fetchingGps, setFetchingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [coordErrors, setCoordErrors] = useState<LocationError>({});

  const handleGetGps = async () => {
    setFetchingGps(true); setGpsError(null);
    const loc = await getPatientLocation();
    setFetchingGps(false);
    if (loc) onChange(loc);
    else setGpsError('Location access was denied. Please enable location permissions.');
  };

  const handleManual = (field: 'latitude' | 'longitude', raw: string) => {
    const num = parseFloat(raw);
    const next: ClinicLocation = { ...value, [field]: isNaN(num) ? undefined : num };
    onChange(next);
    const errors = validateCoordinates(next.latitude, next.longitude);
    setCoordErrors(prev => ({ ...prev, [field]: errors[field] }));
  };

  const switchMode = (next: LocationMode) => { setMode(next); onChange({}); setGpsError(null); setCoordErrors({}); };

  const hasCaptured = value.latitude !== undefined && value.longitude !== undefined &&
    Object.keys(coordErrors).filter(k => coordErrors[k as keyof LocationError]).length === 0;

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-teal-600" /> Clinic Location
        </label>
        <p className="text-xs text-slate-500 mt-0.5 ml-6">Used for nearest-doctor searches. Optional.</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => switchMode('gps')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${mode === 'gps' ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/30' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
          <Navigation className="h-4 w-4" /> Use GPS
        </button>
        <button type="button" onClick={() => switchMode('manual')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${mode === 'manual' ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/30' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
          <PenLine className="h-4 w-4" /> Manual
        </button>
      </div>
      {mode === 'gps' && (
        <div className="space-y-2">
          <Button type="button" variant="outline" onClick={handleGetGps} disabled={fetchingGps}
            className="w-full gap-2 border-teal-200 text-teal-700 hover:bg-teal-50 hover:border-teal-300 h-12 rounded-xl">
            <MapPin className="h-4 w-4" /> {fetchingGps ? 'Getting location…' : hasCaptured ? 'Refresh Location' : 'Get Current Location'}
          </Button>
          {gpsError && <div className="flex items-start gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700"><AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" /><span>{gpsError}</span></div>}
        </div>
      )}
      {mode === 'manual' && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-slate-600">Latitude <span className="text-slate-400 font-normal">(-90 to 90)</span></label>
            <Input id="manual-lat" type="number" step="any" placeholder="e.g. 36.7372" value={value.latitude ?? ''}
              onChange={e => handleManual('latitude', e.target.value)}
              className={`h-12 border-slate-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl ${coordErrors.latitude ? 'border-red-400' : ''}`} />
            {coordErrors.latitude && <p className="text-xs text-red-600">{coordErrors.latitude}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-600">Longitude <span className="text-slate-400 font-normal">(-180 to 180)</span></label>
            <Input id="manual-lng" type="number" step="any" placeholder="e.g. -0.6335" value={value.longitude ?? ''}
              onChange={e => handleManual('longitude', e.target.value)}
              className={`h-12 border-slate-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl ${coordErrors.longitude ? 'border-red-400' : ''}`} />
            {coordErrors.longitude && <p className="text-xs text-red-600">{coordErrors.longitude}</p>}
          </div>
        </div>
      )}
      {hasCaptured && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          <span>Location set: <span className="font-mono">{value.latitude!.toFixed(5)}, {value.longitude!.toFixed(5)}</span></span>
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
  const [showPassword, setShowPassword] = useState(false);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [clinicLocation, setClinicLocation] = useState<ClinicLocation>({});
  const [patientCity, setPatientCity] = useState('');
  const [doctorCity, setDoctorCity] = useState('');
  const [doctorSpecialization, setDoctorSpecialization] = useState('');
  const [showGender, setShowGender] = useState(false);
  const genderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (genderRef.current && !genderRef.current.contains(e.target as Node)) setShowGender(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

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

    try {
      const user = await account.create(ID.unique(), email, password, `${firstName} ${lastName}`);
      const patient = await patientService.createPatient({
        userId: user.$id, firstName, lastName, email,
        phone: phone || undefined, dateOfBirth: toAppwriteDatetime(dateOfBirth),
        gender, address: address || undefined, city: patientCity || undefined, isActivated: false,
      });
      const code = generateActivationCode();
      await activationService.createActivation({
        code, email, role: 'patient', userId: user.$id, profileId: patient.$id, expiresAt: expiresInHours(24),
      });
      await fetch('/api/send-activation', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientEmail: email, recipientName: `${firstName} ${lastName}`, role: 'patient', activationCode: code }),
      });
      router.push('/auth/check-email');

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
    const licenseNumber = formData.get('licenseNumber') as string;
    const clinicName = formData.get('clinicName') as string;
    const clinicAddress = formData.get('clinicAddress') as string;
    const consultationFee = formData.get('consultationFee') as string;
    const bio = formData.get('bio') as string;

    try {
      if (!licenseFile) { setError('Medical license document is required'); setLoading(false); return; }
      const user = await account.create(ID.unique(), email, password, `Dr. ${firstName} ${lastName}`);
      const licenseDocumentId = await doctorService.uploadFile(licenseFile);
      let profileImageId: string | undefined;
      if (profileImage) profileImageId = await doctorService.uploadFile(profileImage);
      const doctor = await doctorService.createDoctor({
        userId: user.$id, firstName, lastName, email, phone,
        specialization: doctorSpecialization, licenseNumber,
        clinicName: clinicName || undefined, clinicAddress, city: doctorCity,
        consultationFee: consultationFee ? parseFloat(consultationFee) : undefined,
        bio: bio || undefined, licenseDocumentId, profileImageId,
        latitude: clinicLocation.latitude, longitude: clinicLocation.longitude, isActivated: false,
      });
      const code = generateActivationCode();
      await activationService.createActivation({
        code, email, role: 'doctor', userId: user.$id, profileId: doctor.$id, expiresAt: expiresInHours(24),
      });
      await fetch('/api/send-activation', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientEmail: email, recipientName: `Dr. ${firstName} ${lastName}`, role: 'doctor', activationCode: code }),
      });
      router.push('/auth/check-email');

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const leftFeatures = [
    { icon: UserPlus, text: 'Free to Register' },
    { icon: Shield, text: 'Your Data is Safe' },
    { icon: Calendar, text: 'Book in Seconds' },
  ];

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* ── LEFT: Decorative panel (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-[40%] relative bg-gradient-to-br from-teal-500 to-teal-600 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, #ffffff 1px, transparent 0)`, backgroundSize: '40px 40px' }} />
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          <div className="space-y-8">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <Link href="/" className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 shadow-lg shadow-teal-500/20"><Stethoscope className="h-5 w-5 text-white" /></div>
                <span className="text-xl font-bold tracking-tight text-white">MediCare</span>
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-white xl:text-5xl leading-tight">Join MediCare</h1>
              <p className="text-lg text-teal-100 leading-relaxed max-w-md">Create your account and start your health journey</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="space-y-4">
              {leftFeatures.map((f, i) => (
                <motion.div key={f.text} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 flex-shrink-0"><f.icon className="h-5 w-5 text-white" /></div>
                  <p className="text-sm font-medium text-white">{f.text}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="relative">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} className="rounded-2xl bg-white/20 backdrop-blur-sm p-4 max-w-xs border border-white/10">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0"><Stethoscope className="h-6 w-6 text-white" /></div>
                <div><p className="text-lg font-bold text-white">500+ Verified Doctors</p><p className="text-xs text-teal-200">Ready to help you</p></div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ── RIGHT: Register form ── */}
      <div className="w-full lg:w-[60%] flex items-start justify-center bg-white overflow-y-auto">
        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-2xl px-6 py-12 sm:px-12">
          {/* Logo for mobile */}
          <div className="lg:hidden flex items-center gap-2.5 mb-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-500/20"><Stethoscope className="h-5 w-5 text-white" /></div>
            <span className="text-xl font-bold tracking-tight text-slate-900">MediCare</span>
          </div>
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Create Account</h2>
            <p className="mt-2 text-lg text-slate-600">Register as a patient or doctor</p>
          </div>
          {/* Role Toggle */}
          <div className="grid grid-cols-2 gap-2 mb-8">
            <button type="button" onClick={() => setRole('patient')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all ${role === 'patient' ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/30' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              <Users className="h-4 w-4" /> Patient
            </button>
            <button type="button" onClick={() => setRole('doctor')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all ${role === 'doctor' ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/30' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              <Stethoscope className="h-4 w-4" /> Doctor
            </button>
          </div>

          <AnimatePresence mode="wait">
            {role === 'patient' ? (
              <motion.form key="patient" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} onSubmit={handlePatientSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><Users className="h-4 w-4 text-teal-600" /> First Name</label>
                    <div className="relative"><Input id="firstName" name="firstName" placeholder="First name" required className="pl-10 h-12 border-slate-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl" /><Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /></div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><Users className="h-4 w-4 text-teal-600" /> Last Name</label>
                    <div className="relative"><Input id="lastName" name="lastName" placeholder="Last name" required className="pl-10 h-12 border-slate-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl" /><Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><Mail className="h-4 w-4 text-teal-600" /> Email</label>
                  <div className="relative"><Input id="email" name="email" type="email" placeholder="your.email@example.com" required className="pl-10 h-12 border-slate-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl" /><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /></div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><Lock className="h-4 w-4 text-teal-600" /> Password</label>
                  <div className="relative">
                    <Input id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Min. 8 characters" minLength={8} required className="pl-10 pr-10 h-12 border-slate-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl" />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><Phone className="h-4 w-4 text-teal-600" /> Phone</label>
                  <div className="relative"><Input id="phone" name="phone" type="tel" placeholder="+213 xxx xxx xxx" className="pl-10 h-12 border-slate-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl" /><Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /></div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><Calendar className="h-4 w-4 text-teal-600" /> Date of Birth</label>
                  <div className="relative"><Input id="dateOfBirth" name="dateOfBirth" type="date" required className="pl-10 h-12 border-slate-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl" /><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /></div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><ChevronDown className="h-4 w-4 text-teal-600" /> Gender</label>
                  <div ref={genderRef} className="relative">
                    <button type="button" onClick={() => setShowGender(!showGender)}
                      className="w-full flex items-center justify-between pl-10 pr-4 h-12 border border-slate-200 rounded-xl text-sm text-left focus:border-teal-500 focus:ring-teal-500 focus:outline-none transition-colors bg-transparent">
                      <span className={gender ? 'text-slate-900' : 'text-slate-400'}>{genderOptions.find(g => g.value === gender)?.label || 'Select gender'}</span>
                      <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${showGender ? 'rotate-180' : ''}`} />
                    </button>
                    <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    {showGender && (
                      <div className="absolute z-50 top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                        {genderOptions.map(opt => (
                          <button key={opt.value} type="button" onClick={() => { setGender(opt.value as typeof gender); setShowGender(false); }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${gender === opt.value ? 'bg-teal-50 text-teal-700 font-medium' : 'text-slate-700 hover:bg-teal-50 hover:text-teal-700'}`}>{opt.label}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><MapPin className="h-4 w-4 text-teal-600" /> Address</label>
                  <div className="relative"><Input id="address" name="address" placeholder="Your address" className="pl-10 h-12 border-slate-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl" /><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /></div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><MapPin className="h-4 w-4 text-teal-600" /> City</label>
                  <AutocompleteInput id="city" name="city" placeholder="Select your city" icon={MapPin} suggestions={ALGERIA_CITIES} value={patientCity} onChange={setPatientCity} />
                </div>
                {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-200">{error}</div>}
                <Button type="submit" disabled={loading} className="w-full gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg shadow-teal-500/30 text-base h-12 rounded-xl">
                  {loading ? 'Creating Account…' : 'Create Patient Account'} {!loading && <ArrowRight className="h-4 w-4" />}
                </Button>
                <p className="text-sm text-center text-slate-600">Already have an account? <Link href="/auth/login" className="text-teal-600 hover:text-teal-700 font-medium transition-colors">Sign In</Link></p>
              </motion.form>
            ) : (
              <motion.form key="doctor" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} onSubmit={handleDoctorSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><Users className="h-4 w-4 text-teal-600" /> First Name</label>
                    <div className="relative"><Input id="doc-firstName" name="firstName" placeholder="First name" required className="pl-10 h-12 border-slate-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl" /><Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /></div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><Users className="h-4 w-4 text-teal-600" /> Last Name</label>
                    <div className="relative"><Input id="doc-lastName" name="lastName" placeholder="Last name" required className="pl-10 h-12 border-slate-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl" /><Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><Mail className="h-4 w-4 text-teal-600" /> Email</label>
                  <div className="relative"><Input id="doc-email" name="email" type="email" placeholder="your.email@example.com" required className="pl-10 h-12 border-slate-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl" /><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /></div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><Lock className="h-4 w-4 text-teal-600" /> Password</label>
                  <div className="relative">
                    <Input id="doc-password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Min. 8 characters" minLength={8} required className="pl-10 pr-10 h-12 border-slate-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl" />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><Phone className="h-4 w-4 text-teal-600" /> Phone</label>
                  <div className="relative"><Input id="doc-phone" name="phone" type="tel" placeholder="+213 xxx xxx xxx" required className="pl-10 h-12 border-slate-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl" /><Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /></div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><Stethoscope className="h-4 w-4 text-teal-600" /> Specialization</label>
                  <AutocompleteInput id="specialization" name="specialization" placeholder="Select specialization" icon={Stethoscope} required suggestions={SPECIALTIES} value={doctorSpecialization} onChange={setDoctorSpecialization} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><FileText className="h-4 w-4 text-teal-600" /> Medical License Number</label>
                  <div className="relative"><Input id="licenseNumber" name="licenseNumber" placeholder="License number" required className="pl-10 h-12 border-slate-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl" /><FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><Award className="h-4 w-4 text-teal-600" /> Experience (yrs)</label>
                    <div className="relative"><Input id="yearsExperience" name="yearsExperience" type="number" placeholder="e.g. 5" className="pl-10 h-12 border-slate-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl" /><Award className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /></div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><DollarSign className="h-4 w-4 text-teal-600" /> Fee (DZD)</label>
                    <div className="relative"><Input id="consultationFee" name="consultationFee" type="number" step="0.01" placeholder="e.g. 3000" className="pl-10 h-12 border-slate-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl" /><DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><Building2 className="h-4 w-4 text-teal-600" /> Clinic Name</label>
                  <div className="relative"><Input id="clinicName" name="clinicName" placeholder="Clinic name" className="pl-10 h-12 border-slate-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl" /><Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /></div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><MapPin className="h-4 w-4 text-teal-600" /> Clinic Address</label>
                  <div className="relative"><Input id="clinicAddress" name="clinicAddress" placeholder="Clinic address" required className="pl-10 h-12 border-slate-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl" /><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /></div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><MapPin className="h-4 w-4 text-teal-600" /> City</label>
                  <AutocompleteInput id="doc-city" name="city" placeholder="Select your city" icon={MapPin} required suggestions={ALGERIA_CITIES} value={doctorCity} onChange={setDoctorCity} />
                </div>
                {/* Clinic Location */}
                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <ClinicLocationPicker value={clinicLocation} onChange={setClinicLocation} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><FileText className="h-4 w-4 text-teal-600" /> Bio</label>
                  <Textarea id="bio" name="bio" placeholder="Brief professional summary…" className="min-h-[100px] border-slate-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl" />
                </div>
                {/* Medical License Document */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><FileText className="h-4 w-4 text-teal-600" /> Medical License Document</label>
                  <label className="block rounded-xl border-2 border-dashed border-slate-200 p-4 hover:border-teal-300 hover:bg-teal-50 transition-all cursor-pointer">
                    <input id="licenseFile" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setLicenseFile(e.target.files?.[0] || null)} required className="hidden" />
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-6 w-6 text-slate-400" />
                      <span className="text-sm text-slate-500">{licenseFile ? licenseFile.name : 'Upload PDF or image'}</span>
                    </div>
                  </label>
                </div>
                {/* Profile Photo */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><ImagePlus className="h-4 w-4 text-teal-600" /> Profile Photo</label>
                  <label className="block rounded-xl border-2 border-dashed border-slate-200 p-4 hover:border-teal-300 hover:bg-teal-50 transition-all cursor-pointer">
                    <input id="profileImage" type="file" accept="image/*" onChange={(e) => setProfileImage(e.target.files?.[0] || null)} className="hidden" />
                    <div className="flex flex-col items-center gap-2">
                      <ImagePlus className="h-6 w-6 text-slate-400" />
                      <span className="text-sm text-slate-500">{profileImage ? profileImage.name : 'Upload a photo'}</span>
                    </div>
                  </label>
                </div>
                {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-200">{error}</div>}
                <Button type="submit" disabled={loading} className="w-full gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg shadow-teal-500/30 text-base h-12 rounded-xl">
                  {loading ? 'Creating Account…' : 'Create Doctor Account'} {!loading && <ArrowRight className="h-4 w-4" />}
                </Button>
                {/* Doctor info card */}
                <div className="rounded-xl bg-teal-50 border border-teal-100 p-3 flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-teal-700">Your account will be pending admin verification</p>
                </div>
                <p className="text-sm text-center text-slate-600">Already have an account? <Link href="/auth/login" className="text-teal-600 hover:text-teal-700 font-medium transition-colors">Sign In</Link></p>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}