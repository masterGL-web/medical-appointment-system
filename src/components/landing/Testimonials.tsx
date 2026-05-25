"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: "Jennifer Martinez",
      role: "Patient",
      content: "The booking process was incredibly smooth. I found a great cardiologist within minutes and got an appointment the same day. The platform is user-friendly and efficient.",
      rating: 5,
      avatar: "JM",
    },
    {
      id: 2,
      name: "Robert Thompson",
      role: "Patient",
      content: "Finally, a healthcare platform that actually works! No more waiting on hold or dealing with confusing schedules. The reminders are a nice touch too.",
      rating: 5,
      avatar: "RT",
    },
    {
      id: 3,
      name: "Sarah Chen",
      role: "Patient",
      content: "I was skeptical at first, but this platform exceeded my expectations. The doctor I found was professional, and the whole experience was seamless from start to finish.",
      rating: 5,
      avatar: "SC",
    },
    {
      id: 4,
      name: "Michael Davis",
      role: "Patient",
      content: "As someone with a busy schedule, being able to book appointments online is a game-changer. The interface is intuitive and the support team is always helpful.",
      rating: 5,
      avatar: "MD",
    },
    {
      id: 5,
      name: "Emily Wilson",
      role: "Patient",
      content: "The quality of doctors on this platform is outstanding. I've found my new primary care physician and couldn't be happier with the service.",
      rating: 5,
      avatar: "EW",
    },
    {
      id: 6,
      name: "David Brown",
      role: "Patient",
      content: "From booking to follow-up, everything was handled professionally. The platform makes managing healthcare appointments so much easier.",
      rating: 5,
      avatar: "DB",
    },
  ];

  return (
    <section id="about" className="py-20 md:py-28 bg-gradient-to-b from-white to-slate-50 scroll-mt-16">
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
            Testimonials
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            What Our Patients
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-500">
              Say About Us
            </span>
          </h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our patients have to say about their experience.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className="group"
            >
              <div className="relative h-full rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-teal-100">
                {/* Quote Icon */}
                <div className="absolute top-6 right-6 opacity-10">
                  <Quote className="h-8 w-8 text-teal-600" />
                </div>

                {/* Rating */}
                <div className="flex items-center gap-0.5 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>

                {/* Content */}
                <p className="text-slate-700 leading-relaxed mb-6">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center text-teal-700 font-semibold text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-slate-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
