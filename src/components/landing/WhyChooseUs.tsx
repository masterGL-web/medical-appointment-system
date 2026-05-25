"use client";

import { motion } from "framer-motion";
import { Shield, Clock, Users, Heart, Zap, Award } from "lucide-react";

export default function WhyChooseUs() {
  const benefits = [
    {
      icon: Shield,
      title: "Verified Doctors",
      description: "All doctors are thoroughly vetted and certified to ensure the highest quality of care.",
    },
    {
      icon: Clock,
      title: "24/7 Availability",
      description: "Book appointments anytime, day or night, with our always-on platform.",
    },
    {
      icon: Users,
      title: "Patient-Centric",
      description: "Designed with patients in mind, making healthcare accessible and convenient.",
    },
    {
      icon: Heart,
      title: "Compassionate Care",
      description: "Our doctors are committed to providing empathetic and personalized treatment.",
    },
    {
      icon: Zap,
      title: "Instant Booking",
      description: "Skip the phone calls and book your appointment in seconds with our streamlined process.",
    },
    {
      icon: Award,
      title: "Award-Winning Service",
      description: "Recognized for excellence in healthcare delivery and patient satisfaction.",
    },
  ];

  return (
    <section id="services" className="py-20 md:py-28 bg-gradient-to-b from-slate-50 to-white scroll-mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-teal-600 mb-3">
                Why Choose Us
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Healthcare That
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-500">
                  Puts You First
                </span>
              </h2>
            </div>

            <p className="text-lg text-slate-600 leading-relaxed">
              We believe healthcare should be accessible, convenient, and personalized. Our platform connects you with top-rated doctors while providing the tools you need to manage your health journey effortlessly.
            </p>

            <div className="space-y-4">
              {[
                "Skip the waiting room with instant online booking",
                "Access your medical records anytime, anywhere",
                "Get reminders so you never miss an appointment",
                "Choose from a wide network of specialists",
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-teal-600 flex-shrink-0">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-slate-700">{item}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Content - Benefits Grid */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid gap-6 sm:grid-cols-2"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="group"
              >
                <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-teal-100">
                  {/* Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  
                  <div className="relative">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/20">
                      <benefit.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
