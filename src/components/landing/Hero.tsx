"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, CheckCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Hero() {
  const floatingElements = [
    { delay: 0,   duration: 3,   y: [-10, 10, -10] as number[] },
    { delay: 0.5, duration: 3.5, y: [10, -10, 10]  as number[] },
    { delay: 1,   duration: 4,   y: [-8, 8, -8]    as number[] },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/50 via-white to-white scroll-mt-16">
      {/* Background dot grid */}
      <div
        className="absolute inset-0 -z-10 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #0d9488 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── Left: text content ── */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50/80 px-4 py-2 text-sm font-medium text-teal-700"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500" />
              </span>
              Trusted by 50,000+ patients
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl leading-tight"
            >
              Your Health Journey
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-500">
                Starts Here
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-lg text-slate-600 leading-relaxed max-w-xl"
            >
              Connect with top-rated doctors, book appointments instantly, and
              manage your healthcare journey with our modern, patient-first platform.
            </motion.p>

            {/* Feature pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap gap-4"
            >
              {["24/7 Support", "Verified Doctors", "Secure Booking"].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle className="h-4 w-4 text-teal-600" />
                  {f}
                </div>
              ))}
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/auth/register" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg shadow-teal-500/30 text-base"
                >
                  Book Appointment
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="w-full gap-2 border-slate-200 text-slate-700 hover:bg-slate-50 text-base"
              >
                <Play className="h-4 w-4 fill-current" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Rating */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex items-center gap-2"
            >
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm font-medium text-slate-700">4.9/5</span>
              <span className="text-sm text-slate-500">(2,500+ reviews)</span>
            </motion.div>
          </motion.div>

          {/* ── Right: Doctor image with animations ── */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative">

              {/* Main card — floats up/down */}
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/20 aspect-[4/5] max-w-md mx-auto bg-white"
              >
                {/* ── Doctor photo ── */}
                <img
                  src="/doctor-hero.jpg"
                  alt="Dr. Sarah Johnson"
                  className="absolute inset-0 w-full h-full object-cover object-top"
                />

                {/* Bottom gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

                {/* Name + title at the bottom */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="absolute bottom-0 left-0 right-0 p-6"
                >
                  <p className="text-white font-semibold text-lg leading-tight">
                    Dr. Sarah Johnson
                  </p>
                  <p className="text-teal-300 text-sm mt-0.5">Cardiologist</p>
                </motion.div>
              </motion.div>

              {/* ── Floating badge cards ── */}
              {floatingElements.map((elem, index) => (
                <motion.div
                  key={index}
                  animate={{ y: elem.y }}
                  transition={{
                    duration: elem.duration,
                    repeat: Infinity,
                    delay: elem.delay,
                    ease: "easeInOut",
                  }}
                  className="absolute bg-white rounded-2xl shadow-lg shadow-slate-200/50 p-4"
                  style={{
                    top:   index === 0 ? "10%" : index === 1 ? "60%" : "40%",
                    right: index === 0 ? "-10%" : index === 1 ? "5%"  : "-15%",
                  }}
                >
                  {index === 0 && (
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Verified</p>
                        <p className="text-xs text-slate-500">Certified Doctor</p>
                      </div>
                    </div>
                  )}
                  {index === 1 && (
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                        <Star className="h-5 w-5 text-teal-600 fill-current" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">4.9 Rating</p>
                        <p className="text-xs text-slate-500">500+ Reviews</p>
                      </div>
                    </div>
                  )}
                  {index === 2 && (
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Available</p>
                        <p className="text-xs text-slate-500">Today at 3 PM</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}