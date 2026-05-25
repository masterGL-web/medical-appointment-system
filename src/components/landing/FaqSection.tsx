"use client";

import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "How do I book an appointment?",
      answer: "Booking an appointment is simple. Search for your desired specialty or doctor, select a convenient time slot, and complete the booking process. You'll receive instant confirmation and reminders before your appointment.",
    },
    {
      question: "Are the doctors on your platform verified?",
      answer: "Yes, all doctors on our platform are thoroughly vetted and verified. We check their credentials, licenses, and certifications to ensure you receive care from qualified healthcare professionals.",
    },
    {
      question: "What if I need to cancel or reschedule?",
      answer: "You can cancel or reschedule your appointment through our platform at any time. We recommend doing so at least 24 hours before your scheduled appointment to avoid any cancellation fees.",
    },
    {
      question: "Is my personal information secure?",
      answer: "Absolutely. We use industry-standard encryption and security measures to protect your personal and medical information. Your privacy is our top priority, and we comply with all healthcare data protection regulations.",
    },
    {
      question: "Can I access my medical records through the platform?",
      answer: "Yes, you can access your medical records, appointment history, and prescriptions through our secure patient portal. This gives you complete visibility into your healthcare journey.",
    },
    {
      question: "Do you offer telemedicine consultations?",
      answer: "Yes, many of our doctors offer telemedicine consultations. You can filter your search to find doctors who provide online consultations and book a virtual appointment from the comfort of your home.",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
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
                FAQ
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Frequently Asked
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-500">
                  Questions
                </span>
              </h2>
            </div>

            <p className="text-lg text-slate-600 leading-relaxed">
              Have questions about our platform? We've compiled answers to the most common questions to help you get started.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-600 flex-shrink-0">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">
                    Still have questions?
                  </h3>
                  <p className="text-sm text-slate-600">
                    Contact our support team at support@medappoint.com
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Content - FAQ Accordion */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                  aria-expanded={openIndex === index}
                >
                  <span className="font-semibold text-slate-900 pr-4">
                    {faq.question}
                  </span>
                  <div className="flex-shrink-0">
                    {openIndex === index ? (
                      <ChevronUp className="h-5 w-5 text-teal-600" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                </button>
                
                {openIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-5 pt-0"
                  >
                    <p className="text-slate-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
