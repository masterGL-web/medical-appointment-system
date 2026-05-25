"use client";

import { motion } from "framer-motion";
import { Star, MapPin, Calendar, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useEffect, useState } from "react";
import { doctorService } from "@/services/doctor.service";
import { Doctor } from "@/types/doctor.types";
import Image from "next/image";

export default function FeaturedDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDoctors() {
      try {
        const data = await doctorService.getVerifiedDoctors();
        setDoctors(data.slice(0, 6)); // Show first 6 doctors
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDoctors();
  }, []);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const getDoctorImage = (doctor: Doctor) => {
    if (doctor.profileImageId) {
      return doctorService.getFilePreview(doctor.profileImageId);
    }
    return null;
  };

  return (
    <section id="doctors" className="py-20 md:py-28 bg-white scroll-mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-600 mb-3">
            Our Specialists
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Meet Our
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-500">
              Expert Doctors
            </span>
          </h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Our team of highly qualified specialists is dedicated to providing you with the best healthcare experience.
          </p>
        </motion.div>

        {/* Doctors Grid */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-100 bg-white p-6 animate-pulse"
              >
                <div className="h-48 bg-slate-100 rounded-xl mb-4" />
                <div className="h-6 bg-slate-100 rounded mb-2 w-3/4" />
                <div className="h-4 bg-slate-100 rounded mb-4 w-1/2" />
                <div className="h-4 bg-slate-100 rounded mb-2 w-full" />
                <div className="h-4 bg-slate-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600">No verified doctors found at the moment.</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {doctors.map((doctor, index) => (
              <motion.div
                key={doctor.$id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group"
              >
                <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:shadow-xl hover:border-teal-100">
                  {/* Doctor Image */}
                  <div className="relative h-48 bg-gradient-to-br from-teal-50 to-slate-50 overflow-hidden">
                    {getDoctorImage(doctor) ? (
                      <Image
                        src={getDoctorImage(doctor)!}
                        alt={`${doctor.firstName} ${doctor.lastName}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-200 to-teal-300 flex items-center justify-center text-teal-700 font-bold text-2xl">
                          {getInitials(doctor.firstName, doctor.lastName)}
                        </div>
                      </div>
                    )}
                    
                    {/* Availability Badge */}
                    <div className="absolute top-4 right-4">
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-700 border-green-200"
                      >
                        <Clock className="mr-1 h-3 w-3" />
                        Available
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    {/* Name and Specialty */}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">
                        Dr. {doctor.firstName} {doctor.lastName}
                      </h3>
                      <p className="text-sm text-teal-600 font-medium">
                        {doctor.specialization}
                      </p>
                    </div>

                  {/* Rating and Reviews */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-slate-700">
                      5.0
                    </span>
                    <span className="text-sm text-slate-500">
                      Verified
                    </span>
                  </div>

                  {/* Location and Experience */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      {doctor.city}
                    </div>
                    {doctor.yearsOfExperience && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {doctor.yearsOfExperience} years experience
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {doctor.education && (
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant="outline"
                        className="text-xs border-slate-200 text-slate-600"
                      >
                        {doctor.education}
                      </Badge>
                    </div>
                  )}

                  {/* Book Button */}
                  <Link href={`/doctor/${doctor.$id}`} className="block">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2 border-teal-200 text-teal-700 hover:bg-teal-50 hover:border-teal-300"
                    >
                      Book Appointment
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        )}

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-12"
        >
          <Link href="/auth/login">
            <Button
              size="lg"
              variant="outline"
              className="gap-2 border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              View All Doctors
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
