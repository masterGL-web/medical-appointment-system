"use client";

import { motion } from "framer-motion";
import { Users, HeartPulse, Award, TrendingUp } from "lucide-react";

export default function StatsSection() {
  const stats = [
    {
      icon: Users,
      value: "50,000+",
      label: "Happy Patients",
      description: "Trusted by thousands of patients worldwide",
    },
    {
      icon: HeartPulse,
      value: "98%",
      label: "Satisfaction Rate",
      description: "Excellent patient feedback and ratings",
    },
    {
      icon: Award,
      value: "500+",
      label: "Certified Doctors",
      description: "Highly qualified medical professionals",
    },
    {
      icon: TrendingUp,
      value: "24/7",
      label: "Support Available",
      description: "Round-the-clock healthcare assistance",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm transition-all hover:shadow-lg hover:border-teal-100">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                
                <div className="relative">
                  {/* Icon */}
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/20">
                    <stat.icon className="h-6 w-6" />
                  </div>

                  {/* Value */}
                  <h3 className="text-3xl font-bold text-slate-900 mb-1">
                    {stat.value}
                  </h3>

                  {/* Label */}
                  <p className="text-sm font-semibold text-slate-700 mb-2">
                    {stat.label}
                  </p>

                  {/* Description */}
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {stat.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
