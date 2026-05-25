

// //-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// //src/app/patient/doctors/page.tsx
// 'use client';

// import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
// import dynamic from 'next/dynamic';
// import { useSearchParams } from 'next/navigation';
// import { motion } from 'framer-motion';
// import { doctorService } from '@/services/doctor.service';
// import { Doctor } from '@/types/doctor.types';
// import { Card, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Badge } from '@/components/ui/badge';
// import { Skeleton } from '@/components/ui/skeleton';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import {
//   Search,
//   MapPin,
//   AlertCircle,
//   User,
//   Filter,
//   X,
//   Navigation,
//   Map as MapIcon,
//   List,
//   Stethoscope,
// } from 'lucide-react';
// import { ALGERIA_CITIES } from '@/constants/algeria-cities';
// import { useDebounceValue } from 'usehooks-ts';
// import {
//   getPatientLocation,
//   calculateDistance,
//   isValidCoordinates,
//   type Coordinates,
// } from '@/lib/geolocation';
// import DoctorCard from '@/components/patient/DoctorCard';
// import { SPECIALTIES } from '@/components/landing/SearchSection';

// // ── Dynamic import: Leaflet cannot run on server ──────────────────────────────

// const DoctorsMap = dynamic(() => import('@/components/patient/DoctorsMap'), {
//   ssr: false,
//   loading: () => (
//     <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-xl">
//       <div className="text-center space-y-2">
//         <MapIcon className="h-8 w-8 text-gray-300 mx-auto animate-pulse" />
//         <p className="text-sm text-gray-400">Loading map…</p>
//       </div>
//     </div>
//   ),
// });

// // ─── Cache ────────────────────────────────────────────────────────────────────

// const CACHE_KEY      = 'doctors_cache';
// const CACHE_DURATION = 5 * 60 * 1000;

// interface DoctorsCache { data: Doctor[]; timestamp: number; }

// function getCachedDoctors(): Doctor[] | null {
//   try {
//     const raw = localStorage.getItem(CACHE_KEY);
//     if (!raw) return null;
//     const parsed: DoctorsCache = JSON.parse(raw);
//     return Date.now() - parsed.timestamp < CACHE_DURATION ? parsed.data : null;
//   } catch { return null; }
// }

// function setCachedDoctors(data: Doctor[]): void {
//   try { localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() })); }
//   catch { /* quota exceeded — skip */ }
// }

// // ─── Scoring ──────────────────────────────────────────────────────────────────

// export interface DoctorWithDistance {
//   doctor: Doctor;
//   distance?: number;
//   score: number;
// }

// function scoreDoctor(
//   doctor: Doctor,
//   nameQuery: string,
//   specializationQuery: string,
//   patientLocation: Coordinates | null
// ): DoctorWithDistance {
//   let score = 0;
//   let distance: number | undefined;

//   const nameLower = nameQuery.toLowerCase().trim();
//   const specLower = specializationQuery.toLowerCase().trim();

//   if (
//     patientLocation &&
//     doctor.latitude != null &&
//     doctor.longitude != null &&
//     isValidCoordinates({ latitude: doctor.latitude, longitude: doctor.longitude })
//   ) {
//     distance = calculateDistance(patientLocation, {
//       latitude: doctor.latitude,
//       longitude: doctor.longitude,
//     });
//     if (distance < 2)       score += 100;
//     else if (distance < 5)  score += 80;
//     else if (distance < 10) score += 60;
//     else if (distance < 20) score += 40;
//     else if (distance < 50) score += 20;
//     else                    score += 5;
//   }

//   if (nameLower) {
//     const fn   = doctor.firstName.toLowerCase();
//     const ln   = doctor.lastName.toLowerCase();
//     const full = `${fn} ${ln}`;
//     if (full.startsWith(nameLower))     score += 60;
//     else if (full.includes(nameLower))  score += 25;
//     else if (fn.startsWith(nameLower))  score += 50;
//     else if (fn.includes(nameLower))    score += 20;
//     else if (ln.startsWith(nameLower))  score += 50;
//     else if (ln.includes(nameLower))    score += 20;
//   }

//   if (specLower) {
//     const spec = doctor.specialization.toLowerCase();
//     if (spec.startsWith(specLower))                                score += 40;
//     else if (spec.includes(specLower))                             score += 15;
//     else if (spec.split(' ').some((w) => w.startsWith(specLower))) score += 25;
//   }

//   if (doctor.yearsOfExperience) score += Math.min(doctor.yearsOfExperience * 0.5, 10);

//   return { doctor, score, distance };
// }

// // ─── Page ─────────────────────────────────────────────────────────────────────

// type ViewMode = 'split' | 'list' | 'map';

// export default function DoctorSearchPage() {
//   const searchParams = useSearchParams();

//   const [allDoctors, setAllDoctors]       = useState<Doctor[]>([]);
//   const [loading, setLoading]             = useState(true);
//   const [error, setError]                 = useState<string | null>(null);
//   const [locationError, setLocationError] = useState<string | null>(null);
//   const isRefreshingRef                   = useRef(false);

//   // Filters — pre-filled from URL query params (?specialization=...&city=...)
//   const [nameSearch, setNameSearch]                     = useState('');
//   const [specializationSearch, setSpecializationSearch] = useState(
//     () => searchParams.get('specialization') ?? ''
//   );
//   const [selectedCity, setSelectedCity]                 = useState(
//     () => searchParams.get('city') ?? 'all'
//   );
//   const [patientLocation, setPatientLocation]           = useState<Coordinates | null>(null);
//   const [loadingLocation, setLoadingLocation]           = useState(false);

//   // Specialization autocomplete state
//   const [specSuggestions, setSpecSuggestions]         = useState<string[]>([]);
//   const [showSpecSuggestions, setShowSpecSuggestions] = useState(false);
//   const specRef                                       = useRef<HTMLDivElement>(null);

//   // City autocomplete state
//   const [cityInput, setCityInput]                     = useState(
//     () => { const c = searchParams.get('city'); return c && c !== 'all' ? c : ''; }
//   );
//   const [citySuggestions, setCitySuggestions]         = useState<string[]>([]);
//   const [showCitySuggestions, setShowCitySuggestions] = useState(false);
//   const cityRef                                       = useRef<HTMLDivElement>(null);

//   // Map interaction state
//   const [hoveredDoctorId, setHoveredDoctorId]   = useState<string | null>(null);
//   const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null); // ← ADDED
//   const [isMapFullscreen, setIsMapFullscreen]   = useState(false);
//   const [viewMode, setViewMode]                 = useState<ViewMode>('split');
//   const [visibleInBounds, setVisibleInBounds]   = useState<string[] | null>(null);

//   const [debouncedNameSearch]           = useDebounceValue(nameSearch, 300);
//   const [debouncedSpecializationSearch] = useDebounceValue(specializationSearch, 300);

//   // ── Data ────────────────────────────────────────────────────────────────────

//   const fetchAndCache = async (showLoading: boolean) => {
//     if (showLoading) setLoading(true);
//     setError(null);
//     try {
//       const data = await doctorService.getVerifiedDoctors();
//       setAllDoctors(data);
//       setCachedDoctors(data);
//     } finally {
//       if (showLoading) setLoading(false);
//     }
//   };

//   const loadDoctors = async () => {
//     try {
//       const cached = getCachedDoctors();
//       if (cached) {
//         setAllDoctors(cached);
//         setLoading(false);
//         if (!isRefreshingRef.current) {
//           isRefreshingRef.current = true;
//           fetchAndCache(false).finally(() => { isRefreshingRef.current = false; });
//         }
//         return;
//       }
//       await fetchAndCache(true);
//     } catch (err) {
//       console.error(err);
//       setError('Failed to load doctors. Please try again.');
//       setLoading(false);
//     }
//   };

//   useEffect(() => { loadDoctors(); }, []); // eslint-disable-line

//   // ── Geolocation ─────────────────────────────────────────────────────────────

//   const handleSearchNearby = async () => {
//     setLoadingLocation(true);
//     setLocationError(null);
//     const location = await getPatientLocation();
//     setLoadingLocation(false);
//     if (location) setPatientLocation(location);
//     else setLocationError('Could not get your location. Please enable location permissions.');
//   };

//   const handleClearLocation = useCallback(() => {
//     setPatientLocation(null);
//     setLocationError(null);
//   }, []);

//   // ── Interaction handlers ───────────────────────────────────────────────────

//   const handleCardHover   = useCallback((id: string) => setHoveredDoctorId(id), []);
//   const handleCardUnhover = useCallback(() => setHoveredDoctorId(null), []);
//   const handleMarkerHover = useCallback((id: string | null) => setHoveredDoctorId(id), []);

//   // ← ADDED: click card → switch to split if needed, then set selected ID
//   const handleCardClick = useCallback((id: string) => {
//     setSelectedDoctorId(id);
//     if (viewMode !== 'split') setViewMode('split');
//   }, [viewMode]);

//   // ── Scoring + sorting ───────────────────────────────────────────────────────

//   const doctors: DoctorWithDistance[] = useMemo(() => {
//     let pool = [...allDoctors];

//     if (selectedCity !== 'all') {
//       const cityLower = selectedCity.toLowerCase().trim();
//       pool = pool.filter((d) => d.city?.toLowerCase().trim() === cityLower);
//     }

//     const scored = pool.map((d) =>
//       scoreDoctor(d, debouncedNameSearch, debouncedSpecializationSearch, patientLocation)
//     );

//     const hasTextQuery = debouncedNameSearch || debouncedSpecializationSearch;
//     const filtered = hasTextQuery
//       ? scored.filter((item) => {
//           const distScore = item.distance !== undefined
//             ? item.distance < 2  ? 100 : item.distance < 5  ? 80
//             : item.distance < 10 ? 60  : item.distance < 20 ? 40
//             : item.distance < 50 ? 20  : 5
//             : 0;
//           return (item.score - distScore) > 0;
//         })
//       : scored;

//     return filtered.sort((a, b) => b.score - a.score);
//   }, [allDoctors, debouncedNameSearch, debouncedSpecializationSearch, selectedCity, patientLocation]);

//   const displayedDoctors = useMemo(() => {
//     if (!visibleInBounds) return doctors;
//     return doctors.filter((d) => visibleInBounds.includes(d.doctor.$id));
//   }, [doctors, visibleInBounds]);

//   const doctorsWithCoords = patientLocation
//     ? doctors.filter((d) => d.distance !== undefined).length
//     : 0;

//   const clearFilters = useCallback(() => {
//     setNameSearch('');
//     setSpecializationSearch('');
//     setSpecSuggestions([]);
//     setShowSpecSuggestions(false);
//     setSelectedCity('all');
//     setCityInput('');
//     setCitySuggestions([]);
//     setShowCitySuggestions(false);
//     setPatientLocation(null);
//     setLocationError(null);
//     setVisibleInBounds(null);
//   }, []);

//   const hasActiveFilters =
//     nameSearch || specializationSearch || selectedCity !== 'all' || patientLocation;

//   // ── Block body scroll when fullscreen is open ──────────────────────────────

//   useEffect(() => {
//     document.body.style.overflow = isMapFullscreen ? 'hidden' : '';
//     return () => { document.body.style.overflow = ''; };
//   }, [isMapFullscreen]);

//   // ── City autocomplete click-outside handler ───────────────────────────────

//   useEffect(() => {
//     function handleClickOutside(e: MouseEvent) {
//       if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
//         setShowCitySuggestions(false);
//       }
//       if (specRef.current && !specRef.current.contains(e.target as Node)) {
//         setShowSpecSuggestions(false);
//       }
//     }
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   function handleSpecializationChange(value: string) {
//     setSpecializationSearch(value);
//     if (value.trim().length > 0) {
//       const filtered = (SPECIALTIES as readonly string[])
//         .filter((s) => s.toLowerCase().includes(value.toLowerCase()))
//         .slice(0, 8);
//       setSpecSuggestions(filtered);
//       setShowSpecSuggestions(true); // always open so raw input is also usable
//     } else {
//       setSpecSuggestions([]);
//       setShowSpecSuggestions(false);
//     }
//   }

//   function handleSpecSelect(spec: string) {
//     setSpecializationSearch(spec);
//     setSpecSuggestions([]);
//     setShowSpecSuggestions(false);
//   }

//   function handleCityInputChange(value: string) {
//     setCityInput(value);
//     if (value.trim().length > 0) {
//       const filtered = (ALGERIA_CITIES as readonly string[])
//         .filter((city) => city.toLowerCase().includes(value.toLowerCase()))
//         .slice(0, 6);
//       setCitySuggestions(filtered);
//       setShowCitySuggestions(filtered.length > 0);
//     } else {
//       setCitySuggestions([]);
//       setShowCitySuggestions(false);
//       setSelectedCity('all');
//     }
//   }

//   function handleCitySelect(city: string) {
//     setCityInput(city);
//     setSelectedCity(city);
//     setShowCitySuggestions(false);
//   }

//   // ── Render ──────────────────────────────────────────────────────────────────

//   if (loading) {
//     return (
//       <div className="p-6 space-y-4">
//         <Skeleton className="h-10 w-56" />
//         <Skeleton className="h-24 w-full" />
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//           {[1,2,3,4].map((i) => <Skeleton key={i} className="h-48" />)}
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-6">
//         <Alert variant="destructive">
//           <AlertCircle className="h-4 w-4" />
//           <AlertDescription>{error}</AlertDescription>
//         </Alert>
//       </div>
//     );
//   }

//   return (
//     <>
//       {/* ── Fullscreen map overlay ── */}
//       {isMapFullscreen && (
//         <div className="fixed inset-0 z-[9999] bg-white flex flex-col">
//           <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 bg-white shadow-sm">
//             <span className="font-semibold text-slate-900">
//               Map — {doctors.length} doctors
//             </span>
//             <Button
//               size="sm"
//               variant="ghost"
//               onClick={() => setIsMapFullscreen(false)}
//               className="text-slate-600 hover:text-slate-900"
//             >
//               <X className="h-4 w-4 mr-1.5" />
//               Close
//             </Button>
//           </div>
//           <div className="flex-1">
//             <DoctorsMap
//               doctors={doctors}
//               patientLocation={patientLocation}
//               hoveredDoctorId={hoveredDoctorId}
//               onMarkerHover={handleMarkerHover}
//               onBoundsChange={setVisibleInBounds}
//               isFullscreen={true}
//               onToggleFullscreen={() => setIsMapFullscreen(false)}
//               selectedDoctorId={selectedDoctorId}
//             />
//           </div>
//         </div>
//       )}

//       {/* ── Main page ── */}
//       <div className="flex flex-col h-full">

//         {/* Header */}
//         <div className="px-6 pt-6 pb-4 flex-shrink-0">
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6 }}
//             className="flex items-center justify-between mb-1"
//           >
//             <h1 className="text-3xl font-bold text-slate-900">Find a Doctor</h1>

//             {/* View mode switcher */}
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={() => setViewMode('list')}
//                 className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
//                   viewMode === 'list'
//                     ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/30'
//                     : 'border border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-600 hover:bg-teal-50'
//                 }`}
//               >
//                 <List className="h-4 w-4" />
//                 List
//               </button>
//               <button
//                 onClick={() => setViewMode('split')}
//                 className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
//                   viewMode === 'split'
//                     ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/30'
//                     : 'border border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-600 hover:bg-teal-50'
//                 }`}
//               >
//                 <MapIcon className="h-4 w-4" />
//                 Map
//               </button>
//               <button
//                 onClick={() => { setViewMode('map'); setIsMapFullscreen(true); }}
//                 className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-600 hover:bg-teal-50 transition-all"
//               >
//                 <Navigation className="h-4 w-4" />
//                 Full
//               </button>
//             </div>
//           </motion.div>
//           <p className="text-sm text-slate-500 mt-1">
//             {allDoctors.length} verified professionals
//             {doctors.length !== allDoctors.length && (
//               <span className="ml-1 text-teal-600 font-medium">· {doctors.length} matching</span>
//             )}
//             {visibleInBounds && (
//               <span className="ml-1 text-teal-600 font-medium">
//                 · {displayedDoctors.length} in map view
//               </span>
//             )}
//           </p>
//         </div>

//         {/* Filter bar */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, delay: 0.1 }}
//           className="px-6 pb-4 flex-shrink-0"
//         >
//           <div className="relative z-10 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
//             <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
//               {/* Name */}
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
//                 <Input
//                   placeholder="Doctor name…"
//                   value={nameSearch}
//                   onChange={(e) => setNameSearch(e.target.value)}
//                   className="pl-10 h-12 border-slate-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl"
//                 />
//               </div>
//               {/* Specialization */}
//               <div className="relative" ref={specRef}>
//                 <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
//                 <Input
//                   placeholder="Specialization…"
//                   value={specializationSearch}
//                   onChange={(e) => handleSpecializationChange(e.target.value)}
//                   onFocus={() => {
//                     if (specSuggestions.length > 0) setShowSpecSuggestions(true);
//                   }}
//                   className="pl-10 h-12 border-slate-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl"
//                 />
//                 {showSpecSuggestions && (
//                   <div className="absolute z-[9999] top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto">
//                     {/* Raw input row — always first so "dentiste" etc. always works */}
//                     <button
//                       onMouseDown={(e) => e.preventDefault()}
//                       onClick={() => handleSpecSelect(specializationSearch)}
//                       className="w-full text-left px-4 py-2.5 text-sm text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors flex items-center gap-2 border-b border-slate-100"
//                     >
//                       <Search className="h-3.5 w-3.5 text-teal-500 flex-shrink-0" />
//                       Rechercher &quot;{specializationSearch}&quot;
//                     </button>
//                     {specSuggestions.map((s) => (
//                       <button
//                         key={s}
//                         onMouseDown={(e) => e.preventDefault()}
//                         onClick={() => handleSpecSelect(s)}
//                         className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors flex items-center gap-2"
//                       >
//                         <Stethoscope className="h-3.5 w-3.5 text-teal-400 flex-shrink-0" />
//                         {s}
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>
//               {/* City */}
//               <div className="relative" ref={cityRef}>
//                 <Input
//                   placeholder="All cities..."
//                   value={cityInput}
//                   onChange={(e) => handleCityInputChange(e.target.value)}
//                   onFocus={() => {
//                     if (citySuggestions.length > 0) setShowCitySuggestions(true);
//                   }}
//                   className="pl-10 h-12 border-slate-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl"
//                 />
//                 <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

//                 {showCitySuggestions && (
//                   <div className="absolute z-[9999] top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto">
//                     {citySuggestions.map((city) => (
//                       <button
//                         key={city}
//                         onMouseDown={(e) => e.preventDefault()}
//                         onClick={() => handleCitySelect(city)}
//                         className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors flex items-center gap-2"
//                       >
//                         <MapPin className="h-3.5 w-3.5 text-teal-400 flex-shrink-0" />
//                         {city}
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>
//               {/* Location */}
//               <Button
//                 onClick={patientLocation ? handleClearLocation : handleSearchNearby}
//                 disabled={loadingLocation}
//                 className="h-12 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg shadow-teal-500/30"
//               >
//                 {loadingLocation ? (
//                   <><Navigation className="mr-2 h-4 w-4 animate-pulse" />Getting…</>
//                 ) : patientLocation ? (
//                   <><Navigation className="mr-2 h-4 w-4" />Near me — clear</>
//                 ) : (
//                   <><Navigation className="mr-2 h-4 w-4" />Search Nearby</>
//                 )}
//               </Button>
//             </div>

//             {/* Location error */}
//             {locationError && (
//               <Alert variant="destructive" className="py-2 mt-3">
//                 <AlertCircle className="h-4 w-4" />
//                 <AlertDescription className="text-xs">{locationError}</AlertDescription>
//               </Alert>
//             )}

//             {/* Location active banner */}
//             {patientLocation && (
//               <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 mt-3">
//                 <Navigation className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
//                 <p className="text-xs text-green-800">
//                   Sorted by distance from your location
//                   {doctorsWithCoords > 0 && (
//                     <span className="ml-1 text-green-700">
//                       · {doctorsWithCoords}/{doctors.length} have distance data
//                     </span>
//                   )}
//                 </p>
//               </div>
//             )}

//             {/* Active filter chips */}
//             {hasActiveFilters && (
//               <div className="flex items-center gap-1.5 flex-wrap mt-3">
//                 <span className="text-xs text-slate-500 flex items-center gap-1">
//                   <Filter className="h-3 w-3" />Filters:
//                 </span>
//                 {nameSearch && (
//                   <Badge variant="secondary" className="gap-1 text-xs">
//                     {nameSearch}
//                     <X className="h-3 w-3 cursor-pointer" onClick={() => setNameSearch('')} />
//                   </Badge>
//                 )}
//                 {specializationSearch && (
//                   <Badge variant="secondary" className="gap-1 text-xs">
//                     {specializationSearch}
//                     <X className="h-3 w-3 cursor-pointer" onClick={() => setSpecializationSearch('')} />
//                   </Badge>
//                 )}
//                 {selectedCity !== 'all' && (
//                   <Badge variant="secondary" className="gap-1 text-xs">
//                     {selectedCity}
//                     <X className="h-3 w-3 cursor-pointer" onClick={() => { setSelectedCity('all'); setCityInput(''); }} />
//                   </Badge>
//                 )}
//                 {patientLocation && (
//                   <Badge variant="secondary" className="gap-1 text-xs">
//                     Near me
//                     <X className="h-3 w-3 cursor-pointer" onClick={handleClearLocation} />
//                   </Badge>
//                 )}
//                 {visibleInBounds && (
//                   <Badge variant="secondary" className="gap-1 text-xs bg-amber-100">
//                     Map area only
//                     <X className="h-3 w-3 cursor-pointer" onClick={() => setVisibleInBounds(null)} />
//                   </Badge>
//                 )}
//                 <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={clearFilters}>
//                   Clear all
//                 </Button>
//               </div>
//             )}
//           </div>
//         </motion.div>

//         {/* ── Content area ── */}
//         <div className="px-6 pb-6">
//           {viewMode === 'split' ? (
//             <div className="flex gap-4 items-start">

//               {/* Left: scrollable doctor list */}
//               <div className="flex-1 min-w-0 flex flex-col overflow-y-auto" style={{ maxHeight: '100vh' }}>
//                 <p className="text-xs text-slate-500 mb-4 flex-shrink-0">
//                   {(visibleInBounds ? displayedDoctors : doctors).length} results
//                   {visibleInBounds && ' in map view'}
//                 </p>
//                 <div className="flex-1 overflow-y-auto space-y-3 pr-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
//                   {(visibleInBounds ? displayedDoctors : doctors).length > 0 ? (
//                     (visibleInBounds ? displayedDoctors : doctors).map(({ doctor, distance }, index) => (
//                       <DoctorCard
//                         key={doctor.$id}
//                         doctor={doctor}
//                         distance={distance}
//                         patientLocation={patientLocation}
//                         isHovered={hoveredDoctorId === doctor.$id}
//                         onMouseEnter={handleCardHover}
//                         onMouseLeave={handleCardUnhover}
//                         onClick={handleCardClick}
//                         index={index}
//                       />
//                     ))
//                   ) : (
//                     <div className="text-center py-12">
//                       <User className="h-12 w-12 text-slate-300 mx-auto mb-4" />
//                       <p className="text-lg font-semibold text-slate-900">No doctors found</p>
//                       <p className="text-sm text-slate-500 mt-2">Try adjusting your search filters</p>
//                       {hasActiveFilters && (
//                         <button onClick={clearFilters} className="mt-4 text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors">
//                           Clear filters
//                         </button>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Right: map */}
//               <div
//                 className={
//                   isMapFullscreen
//                     ? 'hidden'
//                     : 'sticky top-0 w-[420px] flex-shrink-0 rounded-2xl overflow-hidden border border-slate-100 shadow-sm'
//                 }
//                 style={{ height: '100vh' }}
//               >
//                 {!isMapFullscreen && (
//                   <DoctorsMap
//                     doctors={doctors}
//                     patientLocation={patientLocation}
//                     hoveredDoctorId={hoveredDoctorId}
//                     onMarkerHover={handleMarkerHover}
//                     onBoundsChange={setVisibleInBounds}
//                     isFullscreen={false}
//                     onToggleFullscreen={() => {
//                       setViewMode('map');
//                       setIsMapFullscreen(true);
//                     }}
//                     selectedDoctorId={selectedDoctorId}
//                   />
//                 )}
//               </div>
//             </div>

//           ) : (
//             // List-only layout
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               {doctors.length > 0 ? doctors.map(({ doctor, distance }, index) => (
//                 <DoctorCard
//                   key={doctor.$id}
//                   doctor={doctor}
//                   distance={distance}
//                   patientLocation={patientLocation}
//                   isHovered={hoveredDoctorId === doctor.$id}
//                   onMouseEnter={handleCardHover}
//                   onMouseLeave={handleCardUnhover}
//                   onClick={handleCardClick}
//                   index={index}
//                 />
//               )) : (
//                 <div className="col-span-3 text-center py-16">
//                   <User className="h-12 w-12 text-slate-300 mx-auto mb-4" />
//                   <p className="text-lg font-semibold text-slate-900">No doctors found</p>
//                   <p className="text-sm text-slate-500 mt-2">Try adjusting your search filters</p>
//                   {hasActiveFilters && (
//                     <button onClick={clearFilters} className="mt-4 text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors">
//                       Clear filters
//                     </button>
//                   )}
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// }








//-------------------------------------------
//src/app/patient/doctors/page.tsx
'use client';

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { doctorService } from '@/services/doctor.service';
import { Doctor } from '@/types/doctor.types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Search,
  MapPin,
  AlertCircle,
  User,
  Filter,
  X,
  Navigation,
  Map as MapIcon,
  List,
  Stethoscope,
} from 'lucide-react';
import { ALGERIA_CITIES } from '@/constants/algeria-cities';
import { useDebounceValue } from 'usehooks-ts';
import {
  getPatientLocation,
  calculateDistance,
  isValidCoordinates,
  type Coordinates,
} from '@/lib/geolocation';
import DoctorCard from '@/components/patient/DoctorCard';
import { SPECIALTIES } from '@/components/landing/SearchSection';

// ── Dynamic import: Leaflet cannot run on server ──────────────────────────────

const DoctorsMap = dynamic(() => import('@/components/patient/DoctorsMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-xl">
      <div className="text-center space-y-2">
        <MapIcon className="h-8 w-8 text-gray-300 mx-auto animate-pulse" />
        <p className="text-sm text-gray-400">Loading map…</p>
      </div>
    </div>
  ),
});

// ─── Cache ────────────────────────────────────────────────────────────────────

const CACHE_KEY      = 'doctors_cache';
const CACHE_DURATION = 5 * 60 * 1000;

interface DoctorsCache { data: Doctor[]; timestamp: number; }

function getCachedDoctors(): Doctor[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: DoctorsCache = JSON.parse(raw);
    return Date.now() - parsed.timestamp < CACHE_DURATION ? parsed.data : null;
  } catch { return null; }
}

function setCachedDoctors(data: Doctor[]): void {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() })); }
  catch { /* quota exceeded — skip */ }
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

export interface DoctorWithDistance {
  doctor: Doctor;
  distance?: number;
  score: number;
}

function scoreDoctor(
  doctor: Doctor,
  nameQuery: string,
  specializationQuery: string,
  patientLocation: Coordinates | null
): DoctorWithDistance {
  let score = 0;
  let distance: number | undefined;

  const nameLower = nameQuery.toLowerCase().trim();
  const specLower = specializationQuery.toLowerCase().trim();

  if (
    patientLocation &&
    doctor.latitude != null &&
    doctor.longitude != null &&
    isValidCoordinates({ latitude: doctor.latitude, longitude: doctor.longitude })
  ) {
    distance = calculateDistance(patientLocation, {
      latitude: doctor.latitude,
      longitude: doctor.longitude,
    });
    if (distance < 2)       score += 100;
    else if (distance < 5)  score += 80;
    else if (distance < 10) score += 60;
    else if (distance < 20) score += 40;
    else if (distance < 50) score += 20;
    else                    score += 5;
  }

  if (nameLower) {
    const fn   = doctor.firstName.toLowerCase();
    const ln   = doctor.lastName.toLowerCase();
    const full = `${fn} ${ln}`;
    if (full.startsWith(nameLower))     score += 60;
    else if (full.includes(nameLower))  score += 25;
    else if (fn.startsWith(nameLower))  score += 50;
    else if (fn.includes(nameLower))    score += 20;
    else if (ln.startsWith(nameLower))  score += 50;
    else if (ln.includes(nameLower))    score += 20;
  }

  if (specLower) {
    const spec = doctor.specialization.toLowerCase();
    if (spec.startsWith(specLower))                                score += 40;
    else if (spec.includes(specLower))                             score += 15;
    else if (spec.split(' ').some((w) => w.startsWith(specLower))) score += 25;
  }

  if (doctor.yearsOfExperience) score += Math.min(doctor.yearsOfExperience * 0.5, 10);

  return { doctor, score, distance };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type ViewMode = 'split' | 'list' | 'map';

export default function DoctorSearchPage() {
  const searchParams = useSearchParams();

  const [allDoctors, setAllDoctors]       = useState<Doctor[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const isRefreshingRef                   = useRef(false);

  // Filters — pre-filled from URL query params (?specialization=...&city=...)
  const [nameSearch, setNameSearch]                     = useState('');
  const [specializationSearch, setSpecializationSearch] = useState(
    () => searchParams.get('specialization') ?? ''
  );
  const [selectedCity, setSelectedCity]                 = useState(
    () => searchParams.get('city') ?? 'all'
  );
  const [patientLocation, setPatientLocation]           = useState<Coordinates | null>(null);
  const [loadingLocation, setLoadingLocation]           = useState(false);

  // Specialization autocomplete state
  const [specSuggestions, setSpecSuggestions]         = useState<string[]>([]);
  const [showSpecSuggestions, setShowSpecSuggestions] = useState(false);
  const specRef                                       = useRef<HTMLDivElement>(null);

  // City autocomplete state
  const [cityInput, setCityInput]                     = useState(
    () => { const c = searchParams.get('city'); return c && c !== 'all' ? c : ''; }
  );
  const [citySuggestions, setCitySuggestions]         = useState<string[]>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const cityRef                                       = useRef<HTMLDivElement>(null);

  // Map interaction state
  const [hoveredDoctorId, setHoveredDoctorId]   = useState<string | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null); // ← ADDED
  const [isMapFullscreen, setIsMapFullscreen]   = useState(false);
  const [viewMode, setViewMode]                 = useState<ViewMode>('split');
  const [visibleInBounds, setVisibleInBounds]   = useState<string[] | null>(null);

  const [debouncedNameSearch]           = useDebounceValue(nameSearch, 300);
  const [debouncedSpecializationSearch] = useDebounceValue(specializationSearch, 300);

  // ── Data ────────────────────────────────────────────────────────────────────

  const fetchAndCache = async (showLoading: boolean) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const data = await doctorService.getVerifiedDoctors();
      setAllDoctors(data);
      setCachedDoctors(data);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const loadDoctors = async () => {
    try {
      const cached = getCachedDoctors();
      if (cached) {
        setAllDoctors(cached);
        setLoading(false);
        if (!isRefreshingRef.current) {
          isRefreshingRef.current = true;
          fetchAndCache(false).finally(() => { isRefreshingRef.current = false; });
        }
        return;
      }
      await fetchAndCache(true);
    } catch (err) {
      console.error(err);
      setError('Failed to load doctors. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => { loadDoctors(); }, []); // eslint-disable-line

  // ── Geolocation ─────────────────────────────────────────────────────────────

  const handleSearchNearby = async () => {
    setLoadingLocation(true);
    setLocationError(null);
    const location = await getPatientLocation();
    setLoadingLocation(false);
    if (location) setPatientLocation(location);
    else setLocationError('Could not get your location. Please enable location permissions.');
  };

  const handleClearLocation = useCallback(() => {
    setPatientLocation(null);
    setLocationError(null);
  }, []);

  // ── Interaction handlers ───────────────────────────────────────────────────

  const handleCardHover   = useCallback((id: string) => setHoveredDoctorId(id), []);
  const handleCardUnhover = useCallback(() => setHoveredDoctorId(null), []);
  const handleMarkerHover = useCallback((id: string | null) => setHoveredDoctorId(id), []);

  // ← ADDED: click card → switch to split if needed, then set selected ID
  const handleCardClick = useCallback((id: string) => {
    setSelectedDoctorId(id);
    if (viewMode !== 'split') setViewMode('split');
  }, [viewMode]);

  // ── Scoring + sorting ───────────────────────────────────────────────────────

  const doctors: DoctorWithDistance[] = useMemo(() => {
    let pool = [...allDoctors];

    if (selectedCity !== 'all') {
      const cityLower = selectedCity.toLowerCase().trim();
      pool = pool.filter((d) => d.city?.toLowerCase().trim() === cityLower);
    }

    const scored = pool.map((d) =>
      scoreDoctor(d, debouncedNameSearch, debouncedSpecializationSearch, patientLocation)
    );

    const hasTextQuery = debouncedNameSearch || debouncedSpecializationSearch;

    const filtered = hasTextQuery
      ? scored.filter((item) => {
          const distScore = item.distance !== undefined
            ? item.distance < 2  ? 100 : item.distance < 5  ? 80
            : item.distance < 10 ? 60  : item.distance < 20 ? 40
            : item.distance < 50 ? 20  : 5
            : 0;
          return (item.score - distScore) > 0;
        })
      : scored;

    // ── Sort ──────────────────────────────────────────────────────────────────
    // When the patient clicked "Search Nearby" (patientLocation set) and typed
    // no extra query → sort PURELY by distance ascending so the closest doctor
    // is always first, regardless of experience points or bucket rounding.
    if (patientLocation && !hasTextQuery) {
      return [...filtered].sort((a, b) => {
        // Doctors without coordinates go to the end
        if (a.distance == null && b.distance == null) return 0;
        if (a.distance == null) return 1;
        if (b.distance == null) return -1;
        return a.distance - b.distance; // closest first
      });
    }

    return filtered.sort((a, b) => b.score - a.score);
  }, [allDoctors, debouncedNameSearch, debouncedSpecializationSearch, selectedCity, patientLocation]);

  const displayedDoctors = useMemo(() => {
    if (!visibleInBounds) return doctors;
    return doctors.filter((d) => visibleInBounds.includes(d.doctor.$id));
  }, [doctors, visibleInBounds]);

  const doctorsWithCoords = patientLocation
    ? doctors.filter((d) => d.distance !== undefined).length
    : 0;

  const clearFilters = useCallback(() => {
    setNameSearch('');
    setSpecializationSearch('');
    setSpecSuggestions([]);
    setShowSpecSuggestions(false);
    setSelectedCity('all');
    setCityInput('');
    setCitySuggestions([]);
    setShowCitySuggestions(false);
    setPatientLocation(null);
    setLocationError(null);
    setVisibleInBounds(null);
  }, []);

  const hasActiveFilters =
    nameSearch || specializationSearch || selectedCity !== 'all' || patientLocation;

  // ── Block body scroll when fullscreen is open ──────────────────────────────

  useEffect(() => {
    document.body.style.overflow = isMapFullscreen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMapFullscreen]);

  // ── City autocomplete click-outside handler ───────────────────────────────

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setShowCitySuggestions(false);
      }
      if (specRef.current && !specRef.current.contains(e.target as Node)) {
        setShowSpecSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSpecializationChange(value: string) {
    setSpecializationSearch(value);
    if (value.trim().length > 0) {
      const filtered = (SPECIALTIES as readonly string[])
        .filter((s) => s.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 8);
      setSpecSuggestions(filtered);
      setShowSpecSuggestions(true); // always open so raw input is also usable
    } else {
      setSpecSuggestions([]);
      setShowSpecSuggestions(false);
    }
  }

  function handleSpecSelect(spec: string) {
    setSpecializationSearch(spec);
    setSpecSuggestions([]);
    setShowSpecSuggestions(false);
  }

  function handleCityInputChange(value: string) {
    setCityInput(value);
    if (value.trim().length > 0) {
      const filtered = (ALGERIA_CITIES as readonly string[])
        .filter((city) => city.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 6);
      setCitySuggestions(filtered);
      setShowCitySuggestions(filtered.length > 0);
    } else {
      setCitySuggestions([]);
      setShowCitySuggestions(false);
      setSelectedCity('all');
    }
  }

  function handleCitySelect(city: string) {
    setCityInput(city);
    setSelectedCity(city);
    setShowCitySuggestions(false);
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1,2,3,4].map((i) => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      {/* ── Fullscreen map overlay ── */}
      {isMapFullscreen && (
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 bg-white shadow-sm">
            <span className="font-semibold text-slate-900">
              Map — {doctors.length} doctors
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsMapFullscreen(false)}
              className="text-slate-600 hover:text-slate-900"
            >
              <X className="h-4 w-4 mr-1.5" />
              Close
            </Button>
          </div>
          <div className="flex-1">
            <DoctorsMap
              doctors={doctors}
              patientLocation={patientLocation}
              hoveredDoctorId={hoveredDoctorId}
              onMarkerHover={handleMarkerHover}
              onBoundsChange={setVisibleInBounds}
              isFullscreen={true}
              onToggleFullscreen={() => setIsMapFullscreen(false)}
              selectedDoctorId={selectedDoctorId}
            />
          </div>
        </div>
      )}

      {/* ── Main page ── */}
      <div className="flex flex-col h-full">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex-shrink-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between mb-1"
          >
            <h1 className="text-3xl font-bold text-slate-900">Find a Doctor</h1>

            {/* View mode switcher */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/30'
                    : 'border border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-600 hover:bg-teal-50'
                }`}
              >
                <List className="h-4 w-4" />
                List
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  viewMode === 'split'
                    ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/30'
                    : 'border border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-600 hover:bg-teal-50'
                }`}
              >
                <MapIcon className="h-4 w-4" />
                Map
              </button>
              <button
                onClick={() => { setViewMode('map'); setIsMapFullscreen(true); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-600 hover:bg-teal-50 transition-all"
              >
                <Navigation className="h-4 w-4" />
                Full
              </button>
            </div>
          </motion.div>
          <p className="text-sm text-slate-500 mt-1">
            {allDoctors.length} verified professionals
            {doctors.length !== allDoctors.length && (
              <span className="ml-1 text-teal-600 font-medium">· {doctors.length} matching</span>
            )}
            {visibleInBounds && (
              <span className="ml-1 text-teal-600 font-medium">
                · {displayedDoctors.length} in map view
              </span>
            )}
          </p>
        </div>

        {/* Filter bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="px-6 pb-4 flex-shrink-0"
        >
          <div className="relative z-10 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* Name */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Doctor name…"
                  value={nameSearch}
                  onChange={(e) => setNameSearch(e.target.value)}
                  className="pl-10 h-12 border-slate-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl"
                />
              </div>
              {/* Specialization */}
              <div className="relative" ref={specRef}>
                <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
                <Input
                  placeholder="Specialization…"
                  value={specializationSearch}
                  onChange={(e) => handleSpecializationChange(e.target.value)}
                  onFocus={() => {
                    if (specSuggestions.length > 0) setShowSpecSuggestions(true);
                  }}
                  className="pl-10 h-12 border-slate-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl"
                />
                {showSpecSuggestions && (
                  <div className="absolute z-[9999] top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                    {/* Raw input row — always first so "dentiste" etc. always works */}
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSpecSelect(specializationSearch)}
                      className="w-full text-left px-4 py-2.5 text-sm text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors flex items-center gap-2 border-b border-slate-100"
                    >
                      <Search className="h-3.5 w-3.5 text-teal-500 flex-shrink-0" />
                      Rechercher &quot;{specializationSearch}&quot;
                    </button>
                    {specSuggestions.map((s) => (
                      <button
                        key={s}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSpecSelect(s)}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors flex items-center gap-2"
                      >
                        <Stethoscope className="h-3.5 w-3.5 text-teal-400 flex-shrink-0" />
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* City */}
              <div className="relative" ref={cityRef}>
                <Input
                  placeholder="All cities..."
                  value={cityInput}
                  onChange={(e) => handleCityInputChange(e.target.value)}
                  onFocus={() => {
                    if (citySuggestions.length > 0) setShowCitySuggestions(true);
                  }}
                  className="pl-10 h-12 border-slate-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl"
                />
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

                {showCitySuggestions && (
                  <div className="absolute z-[9999] top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                    {citySuggestions.map((city) => (
                      <button
                        key={city}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleCitySelect(city)}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors flex items-center gap-2"
                      >
                        <MapPin className="h-3.5 w-3.5 text-teal-400 flex-shrink-0" />
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Location */}
              <Button
                onClick={patientLocation ? handleClearLocation : handleSearchNearby}
                disabled={loadingLocation}
                className="h-12 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg shadow-teal-500/30"
              >
                {loadingLocation ? (
                  <><Navigation className="mr-2 h-4 w-4 animate-pulse" />Getting…</>
                ) : patientLocation ? (
                  <><Navigation className="mr-2 h-4 w-4" />Near me — clear</>
                ) : (
                  <><Navigation className="mr-2 h-4 w-4" />Search Nearby</>
                )}
              </Button>
            </div>

            {/* Location error */}
            {locationError && (
              <Alert variant="destructive" className="py-2 mt-3">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">{locationError}</AlertDescription>
              </Alert>
            )}

            {/* Location active banner */}
            {patientLocation && (
              <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 mt-3">
                <Navigation className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                <p className="text-xs text-green-800">
                  Sorted by distance from your location
                  {doctorsWithCoords > 0 && (
                    <span className="ml-1 text-green-700">
                      · {doctorsWithCoords}/{doctors.length} have distance data
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Active filter chips */}
            {hasActiveFilters && (
              <div className="flex items-center gap-1.5 flex-wrap mt-3">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Filter className="h-3 w-3" />Filters:
                </span>
                {nameSearch && (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    {nameSearch}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setNameSearch('')} />
                  </Badge>
                )}
                {specializationSearch && (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    {specializationSearch}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSpecializationSearch('')} />
                  </Badge>
                )}
                {selectedCity !== 'all' && (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    {selectedCity}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => { setSelectedCity('all'); setCityInput(''); }} />
                  </Badge>
                )}
                {patientLocation && (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    Near me
                    <X className="h-3 w-3 cursor-pointer" onClick={handleClearLocation} />
                  </Badge>
                )}
                {visibleInBounds && (
                  <Badge variant="secondary" className="gap-1 text-xs bg-amber-100">
                    Map area only
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setVisibleInBounds(null)} />
                  </Badge>
                )}
                <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={clearFilters}>
                  Clear all
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Content area ── */}
        <div className="px-6 pb-6">
          {viewMode === 'split' ? (
            <div className="flex gap-4 items-start">

              {/* Left: scrollable doctor list */}
              <div className="flex-1 min-w-0 flex flex-col overflow-y-auto" style={{ maxHeight: '100vh' }}>
                <p className="text-xs text-slate-500 mb-4 flex-shrink-0">
                  {(visibleInBounds ? displayedDoctors : doctors).length} results
                  {visibleInBounds && ' in map view'}
                </p>
                <div className="flex-1 overflow-y-auto space-y-3 pr-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {(visibleInBounds ? displayedDoctors : doctors).length > 0 ? (
                    (visibleInBounds ? displayedDoctors : doctors).map(({ doctor, distance }, index) => (
                      <DoctorCard
                        key={doctor.$id}
                        doctor={doctor}
                        distance={distance}
                        patientLocation={patientLocation}
                        isHovered={hoveredDoctorId === doctor.$id}
                        onMouseEnter={handleCardHover}
                        onMouseLeave={handleCardUnhover}
                        onClick={handleCardClick}
                        index={index}
                      />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <User className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-lg font-semibold text-slate-900">No doctors found</p>
                      <p className="text-sm text-slate-500 mt-2">Try adjusting your search filters</p>
                      {hasActiveFilters && (
                        <button onClick={clearFilters} className="mt-4 text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors">
                          Clear filters
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: map */}
              <div
                className={
                  isMapFullscreen
                    ? 'hidden'
                    : 'sticky top-0 w-[420px] flex-shrink-0 rounded-2xl overflow-hidden border border-slate-100 shadow-sm'
                }
                style={{ height: '100vh' }}
              >
                {!isMapFullscreen && (
                  <DoctorsMap
                    doctors={doctors}
                    patientLocation={patientLocation}
                    hoveredDoctorId={hoveredDoctorId}
                    onMarkerHover={handleMarkerHover}
                    onBoundsChange={setVisibleInBounds}
                    isFullscreen={false}
                    onToggleFullscreen={() => {
                      setViewMode('map');
                      setIsMapFullscreen(true);
                    }}
                    selectedDoctorId={selectedDoctorId}
                  />
                )}
              </div>
            </div>

          ) : (
            // List-only layout
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctors.length > 0 ? doctors.map(({ doctor, distance }, index) => (
                <DoctorCard
                  key={doctor.$id}
                  doctor={doctor}
                  distance={distance}
                  patientLocation={patientLocation}
                  isHovered={hoveredDoctorId === doctor.$id}
                  onMouseEnter={handleCardHover}
                  onMouseLeave={handleCardUnhover}
                  onClick={handleCardClick}
                  index={index}
                />
              )) : (
                <div className="col-span-3 text-center py-16">
                  <User className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-slate-900">No doctors found</p>
                  <p className="text-sm text-slate-500 mt-2">Try adjusting your search filters</p>
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="mt-4 text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors">
                      Clear filters
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}






























