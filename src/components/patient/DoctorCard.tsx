// //src/components/patient/DoctorCard.tsx
// 'use client';

// import { memo } from 'react';
// import { Doctor } from '@/types/doctor.types';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { motion } from 'framer-motion';
// import { MapPin, Briefcase, DollarSign, Building2, User, Clock, Calendar } from 'lucide-react';
// import Link from 'next/link';
// import { formatDistance } from '@/lib/geolocation';
// import type { Coordinates } from '@/lib/geolocation';

// interface DoctorCardProps {
//   doctor: Doctor;
//   distance?: number;
//   patientLocation: Coordinates | null;
//   isHovered: boolean;
//   onMouseEnter: (id: string) => void;
//   onMouseLeave: () => void;
//   onClick: (id: string) => void;
//   index?: number;
// }

// const DoctorCard = memo(function DoctorCard({
//   doctor,
//   distance,
//   patientLocation,
//   isHovered,
//   onMouseEnter,
//   onMouseLeave,
//   onClick,
//   index = 0,
// }: DoctorCardProps) {
//   const initials = `${doctor.firstName[0]}${doctor.lastName[0]}`;

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       whileInView={{ opacity: 1, y: 0 }}
//       viewport={{ once: true }}
//       transition={{ duration: 0.5, delay: index * 0.1 }}
//       whileHover={{ y: -4 }}
//       className="group"
//     >
//       <div
//         onMouseEnter={() => onMouseEnter(doctor.$id)}
//         onMouseLeave={onMouseLeave}
//         onClick={() => onClick(doctor.$id)}
//         className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:shadow-lg hover:border-teal-100 cursor-pointer"
//       >
//         {/* Hover overlay */}
//         <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

//         {/* Card content */}
//         <div className="relative p-6 space-y-4">
//           {/* Top row: avatar + name + specialty + badge */}
//           <div className="flex items-start gap-4">
//             {/* Avatar */}
//             <div className="h-14 w-14 rounded-full bg-gradient-to-br from-teal-200 to-teal-300 flex items-center justify-center text-teal-700 font-bold text-lg flex-shrink-0">
//               {initials}
//             </div>

//             {/* Name + specialty */}
//             <div className="flex-1 min-w-0">
//               <h3 className="text-lg font-semibold text-slate-900">Dr. {doctor.firstName} {doctor.lastName}</h3>
//               <p className="text-sm text-teal-600 font-medium mt-0.5">{doctor.specialization}</p>
//             </div>

//             {/* Availability badge */}
//             <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 text-xs flex-shrink-0">
//               <Clock className="h-3 w-3 mr-1" />
//               Available
//             </Badge>
//           </div>

//           {/* Info row */}
//           <div className="flex flex-wrap gap-3 text-sm text-slate-600">
//             {/* Location */}
//             <div className="flex items-center gap-1.5">
//               <MapPin className="h-4 w-4 text-slate-400" />
//               <span>{doctor.city}</span>
//             </div>

//             {/* Fee */}
//             {doctor.consultationFee && (
//               <div className="flex items-center gap-1.5">
//                 <DollarSign className="h-4 w-4 text-teal-500" />
//                 <span className="text-teal-600 font-medium">{doctor.consultationFee} DZD</span>
//               </div>
//             )}

//             {/* Distance */}
//             {distance !== undefined && (
//               <div className="flex items-center gap-1.5">
//                 <MapPin className="h-4 w-4 text-slate-400" />
//                 <span>{formatDistance(distance)}</span>
//               </div>
//             )}
//           </div>

//           {/* Bio */}
//           {doctor.bio && (
//             <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{doctor.bio}</p>
//           )}

//           {/* Actions row */}
//           <div className="flex gap-3 pt-2" onClick={(e) => e.stopPropagation()}>
//             <Button asChild variant="outline" className="flex-1 h-10 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl">
//               <Link href={`/patient/doctors/${doctor.$id}`}>
//                 <User className="h-4 w-4 mr-2" />
//                 View Profile
//               </Link>
//             </Button>
//             <Button asChild className="flex-1 h-10 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg shadow-teal-500/30 rounded-xl">
//               <Link href={`/patient/book/${doctor.$id}`}>
//                 <Calendar className="h-4 w-4 mr-2" />
//                 Book
//               </Link>
//             </Button>
//           </div>
//         </div>
//       </div>
//     </motion.div>
//   );
// });

// export default DoctorCard;

//--------------------------------------------------------
//src/components/patient/DoctorCard.tsx
'use client';

import { memo } from 'react';
import { Doctor } from '@/types/doctor.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { MapPin, Briefcase, DollarSign, Building2, User, Clock, Calendar } from 'lucide-react';
import Link from 'next/link';
import { formatDistance } from '@/lib/geolocation';
import type { Coordinates } from '@/lib/geolocation';
import { doctorService } from '@/services/doctor.service';

interface DoctorCardProps {
  doctor: Doctor;
  distance?: number;
  patientLocation: Coordinates | null;
  isHovered: boolean;
  onMouseEnter: (id: string) => void;
  onMouseLeave: () => void;
  onClick: (id: string) => void;
  index?: number;
}

const DoctorCard = memo(function DoctorCard({
  doctor,
  distance,
  patientLocation,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onClick,
  index = 0,
}: DoctorCardProps) {
  const initials = `${doctor.firstName[0]}${doctor.lastName[0]}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <div
        onMouseEnter={() => onMouseEnter(doctor.$id)}
        onMouseLeave={onMouseLeave}
        onClick={() => onClick(doctor.$id)}
        className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:shadow-lg hover:border-teal-100 cursor-pointer"
      >
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

        {/* Card content */}
        <div className="relative p-6 space-y-4">
          {/* Top row: avatar + name + specialty + badge */}
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-teal-200 to-teal-300 flex items-center justify-center text-teal-700 font-bold text-lg flex-shrink-0 overflow-hidden">
              {doctor.profileImageId ? (
                <img
                  src={doctorService.getFilePreview(doctor.profileImageId)}
                  alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    // Fallback to initials if image fails to load
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                    (e.currentTarget.parentElement as HTMLElement).innerText = initials;
                  }}
                />
              ) : (
                initials
              )}
            </div>

            {/* Name + specialty */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-slate-900">Dr. {doctor.firstName} {doctor.lastName}</h3>
              <p className="text-sm text-teal-600 font-medium mt-0.5">{doctor.specialization}</p>
            </div>

            {/* Availability badge */}
            <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 text-xs flex-shrink-0">
              <Clock className="h-3 w-3 mr-1" />
              Available
            </Badge>
          </div>

          {/* Info row */}
          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
            {/* Location */}
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-slate-400" />
              <span>{doctor.city}</span>
            </div>

            {/* Fee */}
            {doctor.consultationFee && (
              <div className="flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-teal-500" />
                <span className="text-teal-600 font-medium">{doctor.consultationFee} DZD</span>
              </div>
            )}

            {/* Distance */}
            {distance !== undefined && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-slate-400" />
                <span>{formatDistance(distance)}</span>
              </div>
            )}
          </div>

          {/* Bio */}
          {doctor.bio && (
            <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{doctor.bio}</p>
          )}

          {/* Actions row */}
          <div className="flex gap-3 pt-2" onClick={(e) => e.stopPropagation()}>
            <Button asChild variant="outline" className="flex-1 h-10 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl">
              <Link href={`/patient/doctors/${doctor.$id}`}>
                <User className="h-4 w-4 mr-2" />
                View Profile
              </Link>
            </Button>
            <Button asChild className="flex-1 h-10 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg shadow-teal-500/30 rounded-xl">
              <Link href={`/patient/book/${doctor.$id}`}>
                <Calendar className="h-4 w-4 mr-2" />
                Book
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default DoctorCard;