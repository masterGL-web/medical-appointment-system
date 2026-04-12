// //src/app/patient/doctors/page.tsx
// 'use client';

// import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
// import dynamic from 'next/dynamic';
// import { doctorService } from '@/services/doctor.service';
// import { Doctor } from '@/types/doctor.types';
// import { Card, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Badge } from '@/components/ui/badge';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
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
//   const [allDoctors, setAllDoctors]       = useState<Doctor[]>([]);
//   const [loading, setLoading]             = useState(true);
//   const [error, setError]                 = useState<string | null>(null);
//   const [locationError, setLocationError] = useState<string | null>(null);
//   const isRefreshingRef                   = useRef(false);

//   // Filters
//   const [nameSearch, setNameSearch]                     = useState('');
//   const [specializationSearch, setSpecializationSearch] = useState('');
//   const [selectedCity, setSelectedCity]                 = useState('all');
//   const [patientLocation, setPatientLocation]           = useState<Coordinates | null>(null);
//   const [loadingLocation, setLoadingLocation]           = useState(false);

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
//     setSelectedCity('all');
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
//         <div className="fixed inset-0 z-50 bg-white flex flex-col">
//           <div className="flex items-center justify-between px-4 py-2 border-b bg-white shadow-sm">
//             <span className="font-semibold text-gray-800">
//               Map — {doctors.length} doctors
//             </span>
//             <Button
//               size="sm"
//               variant="ghost"
//               onClick={() => setIsMapFullscreen(false)}
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
//               selectedDoctorId={selectedDoctorId} // ← ADDED
//             />
//           </div>
//         </div>
//       )}

//       {/* ── Main page ── */}
//       <div className="flex flex-col h-full">

//         {/* Header */}
//         <div className="px-6 pt-6 pb-4 flex-shrink-0">
//           <div className="flex items-center justify-between mb-1">
//             <h1 className="text-2xl font-bold text-gray-900">Find a Doctor</h1>

//             {/* View mode switcher */}
//             <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
//               <button
//                 onClick={() => setViewMode('list')}
//                 className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
//                   viewMode === 'list'
//                     ? 'bg-white shadow-sm text-gray-900'
//                     : 'text-gray-500 hover:text-gray-700'
//                 }`}
//               >
//                 <List className="h-3.5 w-3.5" />
//                 List
//               </button>
//               <button
//                 onClick={() => setViewMode('split')}
//                 className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
//                   viewMode === 'split'
//                     ? 'bg-white shadow-sm text-gray-900'
//                     : 'text-gray-500 hover:text-gray-700'
//                 }`}
//               >
//                 <MapIcon className="h-3.5 w-3.5" />
//                 Map
//               </button>
//               <button
//                 onClick={() => { setViewMode('map'); setIsMapFullscreen(true); }}
//                 className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 transition-all"
//               >
//                 <Navigation className="h-3.5 w-3.5" />
//                 Full
//               </button>
//             </div>
//           </div>
//           <p className="text-sm text-gray-500">
//             {allDoctors.length} verified professionals
//             {doctors.length !== allDoctors.length && (
//               <span className="ml-1 text-blue-600 font-medium">· {doctors.length} matching</span>
//             )}
//             {visibleInBounds && (
//               <span className="ml-1 text-amber-600 font-medium">
//                 · {displayedDoctors.length} in map view
//               </span>
//             )}
//           </p>
//         </div>

//         {/* Filter bar */}
//         <div className="px-6 pb-4 flex-shrink-0">
//           <Card>
//             <CardContent className="p-3 space-y-3">
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//                 {/* Name */}
//                 <div className="relative">
//                   <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
//                   <Input
//                     placeholder="Doctor name…"
//                     value={nameSearch}
//                     onChange={(e) => setNameSearch(e.target.value)}
//                     className="pl-8 h-9 text-sm"
//                   />
//                 </div>
//                 {/* Specialization */}
//                 <div className="relative">
//                   <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
//                   <Input
//                     placeholder="Specialization…"
//                     value={specializationSearch}
//                     onChange={(e) => setSpecializationSearch(e.target.value)}
//                     className="pl-8 h-9 text-sm"
//                   />
//                 </div>
//                 {/* City */}
//                 <Select value={selectedCity} onValueChange={setSelectedCity}>
//                   <SelectTrigger className="h-9 text-sm">
//                     <SelectValue placeholder="All cities" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">All cities</SelectItem>
//                     {ALGERIA_CITIES.map((city) => (
//                       <SelectItem key={city} value={city}>{city}</SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//                 {/* Location */}
//                 <Button
//                   onClick={patientLocation ? handleClearLocation : handleSearchNearby}
//                   disabled={loadingLocation}
//                   size="sm"
//                   className="h-9 text-sm w-full"
//                   variant={patientLocation ? 'default' : 'outline'}
//                 >
//                   {loadingLocation ? (
//                     <><Navigation className="mr-1.5 h-3.5 w-3.5 animate-pulse" />Getting…</>
//                   ) : patientLocation ? (
//                     <><Navigation className="mr-1.5 h-3.5 w-3.5" />Near me — clear</>
//                   ) : (
//                     <><MapPin className="mr-1.5 h-3.5 w-3.5" />Search Nearby</>
//                   )}
//                 </Button>
//               </div>

//               {/* Location error */}
//               {locationError && (
//                 <Alert variant="destructive" className="py-2">
//                   <AlertCircle className="h-4 w-4" />
//                   <AlertDescription className="text-xs">{locationError}</AlertDescription>
//                 </Alert>
//               )}

//               {/* Location active banner */}
//               {patientLocation && (
//                 <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
//                   <Navigation className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
//                   <p className="text-xs text-green-800">
//                     Sorted by distance from your location
//                     {doctorsWithCoords > 0 && (
//                       <span className="ml-1 text-green-700">
//                         · {doctorsWithCoords}/{doctors.length} have distance data
//                       </span>
//                     )}
//                   </p>
//                 </div>
//               )}

//               {/* Active filter chips */}
//               {hasActiveFilters && (
//                 <div className="flex items-center gap-1.5 flex-wrap">
//                   <span className="text-xs text-gray-500 flex items-center gap-1">
//                     <Filter className="h-3 w-3" />Filters:
//                   </span>
//                   {nameSearch && (
//                     <Badge variant="secondary" className="gap-1 text-xs">
//                       {nameSearch}
//                       <X className="h-3 w-3 cursor-pointer" onClick={() => setNameSearch('')} />
//                     </Badge>
//                   )}
//                   {specializationSearch && (
//                     <Badge variant="secondary" className="gap-1 text-xs">
//                       {specializationSearch}
//                       <X className="h-3 w-3 cursor-pointer" onClick={() => setSpecializationSearch('')} />
//                     </Badge>
//                   )}
//                   {selectedCity !== 'all' && (
//                     <Badge variant="secondary" className="gap-1 text-xs">
//                       {selectedCity}
//                       <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCity('all')} />
//                     </Badge>
//                   )}
//                   {patientLocation && (
//                     <Badge variant="secondary" className="gap-1 text-xs">
//                       Near me
//                       <X className="h-3 w-3 cursor-pointer" onClick={handleClearLocation} />
//                     </Badge>
//                   )}
//                   {visibleInBounds && (
//                     <Badge variant="secondary" className="gap-1 text-xs bg-amber-100">
//                       Map area only
//                       <X className="h-3 w-3 cursor-pointer" onClick={() => setVisibleInBounds(null)} />
//                     </Badge>
//                   )}
//                   <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={clearFilters}>
//                     Clear all
//                   </Button>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </div>

//         {/* ── Content area ── */}
//         <div className="flex-1 min-h-0 px-6 pb-6">
//           {viewMode === 'split' ? (
//             <div className="flex gap-4 h-full" style={{ minHeight: '600px' }}>

//               {/* Left: scrollable doctor list */}
//               <div className="w-80 xl:w-96 flex-shrink-0 flex flex-col min-h-0">
//                 <p className="text-xs text-gray-500 mb-2 flex-shrink-0">
//                   {(visibleInBounds ? displayedDoctors : doctors).length} results
//                   {visibleInBounds && ' in map view'}
//                 </p>
//                 <div className="flex-1 overflow-y-auto space-y-3 pr-1">
//                   {(visibleInBounds ? displayedDoctors : doctors).length > 0 ? (
//                     (visibleInBounds ? displayedDoctors : doctors).map(({ doctor, distance }) => (
//                       <DoctorCard
//                         key={doctor.$id}
//                         doctor={doctor}
//                         distance={distance}
//                         patientLocation={patientLocation}
//                         isHovered={hoveredDoctorId === doctor.$id}
//                         onMouseEnter={handleCardHover}
//                         onMouseLeave={handleCardUnhover}
//                         onClick={handleCardClick} // ← ADDED
//                       />
//                     ))
//                   ) : (
//                     <div className="text-center py-12">
//                       <User className="h-10 w-10 text-gray-300 mx-auto mb-2" />
//                       <p className="text-sm text-gray-500">No doctors found</p>
//                       {hasActiveFilters && (
//                         <button onClick={clearFilters} className="mt-2 text-xs text-blue-600 hover:underline">
//                           Clear filters
//                         </button>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Right: map — ONLY rendered when NOT fullscreen to prevent duplicate instances */}
//               {!isMapFullscreen && ( // ← ADDED guard
//                 <div className="flex-1 min-w-0 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
//                   <DoctorsMap
//                     doctors={doctors}
//                     patientLocation={patientLocation}
//                     hoveredDoctorId={hoveredDoctorId}
//                     onMarkerHover={handleMarkerHover}
//                     onBoundsChange={setVisibleInBounds}
//                     isFullscreen={false}
//                     onToggleFullscreen={() => setIsMapFullscreen(true)}
//                     selectedDoctorId={selectedDoctorId} // ← ADDED
//                   />
//                 </div>
//               )}
//             </div>

//           ) : (
//             // List-only layout
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               {doctors.length > 0 ? doctors.map(({ doctor, distance }) => (
//                 <DoctorCard
//                   key={doctor.$id}
//                   doctor={doctor}
//                   distance={distance}
//                   patientLocation={patientLocation}
//                   isHovered={hoveredDoctorId === doctor.$id}
//                   onMouseEnter={handleCardHover}
//                   onMouseLeave={handleCardUnhover}
//                   onClick={handleCardClick} // ← ADDED
//                 />
//               )) : (
//                 <div className="col-span-3 text-center py-16">
//                   <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
//                   <p className="text-gray-500">No doctors found</p>
//                   {hasActiveFilters && (
//                     <button onClick={clearFilters} className="mt-2 text-sm text-blue-600 hover:underline">
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

// -----------------------------------------------------------------
//src/app/patient/doctors/page.tsx
'use client';

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { doctorService } from '@/services/doctor.service';
import { Doctor } from '@/types/doctor.types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  const [allDoctors, setAllDoctors]       = useState<Doctor[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const isRefreshingRef                   = useRef(false);

  // Filters
  const [nameSearch, setNameSearch]                     = useState('');
  const [specializationSearch, setSpecializationSearch] = useState('');
  const [selectedCity, setSelectedCity]                 = useState('all');
  const [patientLocation, setPatientLocation]           = useState<Coordinates | null>(null);
  const [loadingLocation, setLoadingLocation]           = useState(false);

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
    setSelectedCity('all');
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
        // FIX 1: z-[9999] ensures no layout, sidebar, or stacking context leaks through
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 border-b bg-white shadow-sm">
            <span className="font-semibold text-gray-800">
              Map — {doctors.length} doctors
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsMapFullscreen(false) }
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
              selectedDoctorId={selectedDoctorId} // ← ADDED
            />
          </div>
        </div>
      )}

      {/* ── Main page ── */}
      <div className="flex flex-col h-full">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl font-bold text-gray-900">Find a Doctor</h1>

            {/* View mode switcher */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'list'
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List className="h-3.5 w-3.5" />
                List
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'split'
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <MapIcon className="h-3.5 w-3.5" />
                Map
              </button>
              <button
                onClick={() => { setViewMode('map'); setIsMapFullscreen(true); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 transition-all"
              >
                <Navigation className="h-3.5 w-3.5" />
                Full
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            {allDoctors.length} verified professionals
            {doctors.length !== allDoctors.length && (
              <span className="ml-1 text-blue-600 font-medium">· {doctors.length} matching</span>
            )}
            {visibleInBounds && (
              <span className="ml-1 text-amber-600 font-medium">
                · {displayedDoctors.length} in map view
              </span>
            )}
          </p>
        </div>

        {/* Filter bar */}
        <div className="px-6 pb-4 flex-shrink-0">
          <Card>
            <CardContent className="p-3 space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Name */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <Input
                    placeholder="Doctor name…"
                    value={nameSearch}
                    onChange={(e) => setNameSearch(e.target.value)}
                    className="pl-8 h-9 text-sm"
                  />
                </div>
                {/* Specialization */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <Input
                    placeholder="Specialization…"
                    value={specializationSearch}
                    onChange={(e) => setSpecializationSearch(e.target.value)}
                    className="pl-8 h-9 text-sm"
                  />
                </div>
                {/* City */}
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="All cities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All cities</SelectItem>
                    {ALGERIA_CITIES.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Location */}
                <Button
                  onClick={patientLocation ? handleClearLocation : handleSearchNearby}
                  disabled={loadingLocation}
                  size="sm"
                  className="h-9 text-sm w-full"
                  variant={patientLocation ? 'default' : 'outline'}
                >
                  {loadingLocation ? (
                    <><Navigation className="mr-1.5 h-3.5 w-3.5 animate-pulse" />Getting…</>
                  ) : patientLocation ? (
                    <><Navigation className="mr-1.5 h-3.5 w-3.5" />Near me — clear</>
                  ) : (
                    <><MapPin className="mr-1.5 h-3.5 w-3.5" />Search Nearby</>
                  )}
                </Button>
              </div>

              {/* Location error */}
              {locationError && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">{locationError}</AlertDescription>
                </Alert>
              )}

              {/* Location active banner */}
              {patientLocation && (
                <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
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
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
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
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCity('all')} />
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
            </CardContent>
          </Card>
        </div>

        {/* ── Content area ── */}
        <div className="flex-1 min-h-0 px-6 pb-6">
          {viewMode === 'split' ? (
            <div className="flex gap-4 h-full" style={{ minHeight: '600px' }}>

              {/* Left: scrollable doctor list */}
              <div className="w-80 xl:w-96 flex-shrink-0 flex flex-col min-h-0">
                <p className="text-xs text-gray-500 mb-2 flex-shrink-0">
                  {(visibleInBounds ? displayedDoctors : doctors).length} results
                  {visibleInBounds && ' in map view'}
                </p>
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {(visibleInBounds ? displayedDoctors : doctors).length > 0 ? (
                    (visibleInBounds ? displayedDoctors : doctors).map(({ doctor, distance }) => (
                      <DoctorCard
                        key={doctor.$id}
                        doctor={doctor}
                        distance={distance}
                        patientLocation={patientLocation}
                        isHovered={hoveredDoctorId === doctor.$id}
                        onMouseEnter={handleCardHover}
                        onMouseLeave={handleCardUnhover}
                        onClick={handleCardClick} // ← ADDED
                      />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <User className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No doctors found</p>
                      {hasActiveFilters && (
                        <button onClick={clearFilters} className="mt-2 text-xs text-blue-600 hover:underline">
                          Clear filters
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: map */}
              {/* FIX 2: two-layer protection against duplicate instances.
                  - `hidden` removes the container from layout immediately (no paint, no tile requests)
                  - `{!isMapFullscreen && ...}` fully unmounts <DoctorsMap> so Leaflet tears down completely.
                  Both are needed: `hidden` alone still keeps the DOM node alive and Leaflet running. */}
              <div className={
                isMapFullscreen
                  ? 'hidden'
                  : 'flex-1 min-w-0 rounded-xl overflow-hidden border border-gray-200 shadow-sm'
              }>
                {!isMapFullscreen && (
                  <DoctorsMap
                    doctors={doctors}
                    patientLocation={patientLocation}
                    hoveredDoctorId={hoveredDoctorId}
                    onMarkerHover={handleMarkerHover}
                    onBoundsChange={setVisibleInBounds}
                    isFullscreen={false}
                    onToggleFullscreen={() => { // FIX 3: also exit split mode so only fullscreen is active
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
              {doctors.length > 0 ? doctors.map(({ doctor, distance }) => (
                <DoctorCard
                  key={doctor.$id}
                  doctor={doctor}
                  distance={distance}
                  patientLocation={patientLocation}
                  isHovered={hoveredDoctorId === doctor.$id}
                  onMouseEnter={handleCardHover}
                  onMouseLeave={handleCardUnhover}
                  onClick={handleCardClick} // ← ADDED
                />
              )) : (
                <div className="col-span-3 text-center py-16">
                  <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No doctors found</p>
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="mt-2 text-sm text-blue-600 hover:underline">
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