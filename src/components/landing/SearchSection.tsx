"use client";

import { motion } from "framer-motion";
import { Search, MapPin, Stethoscope, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ALGERIA_CITIES } from "@/constants/algeria-cities";

// ─── Complete Algerian Medical Specialties ────────────────────────────────────
export const SPECIALTIES = [
  // ── General & Primary Care ──────────────────────────────────────────────────
  "Médecine Générale",
  "Médecine de Famille",
  "Médecine Interne",
  "Pédiatrie",

  // ── Specialized Medical Consultations ───────────────────────────────────────
  "Allergologie",
  "Andrologie",
  "Angiologie et Phlébologie",
  "Cardiologie",
  "Cardiologie Pédiatrique",
  "Dermatologie",
  "Endocrinologie",
  "Endocrinologie et Diabétologie",
  "Gastro-entéro-hépatologie",
  "Gynécologie-Obstétrique",
  "Hématologie",
  "Infectiologie",
  "Médecine Légale",
  "Néphrologie",
  "Neurologie",
  "Neurologie Pédiatrique",
  "Neurophysiologie",
  "Neuropsychiatrie",
  "Oncologie Médicale",
  "Ophtalmologie",
  "ORL (Oto-Rhino-Laryngologie)",
  "Pneumo-phtisiologie",
  "Psychiatrie",
  "Psychologie",
  "Psychothérapie",
  "Rhumatologie",
  "Urologie",

  // ── Surgical Specialties ────────────────────────────────────────────────────
  "Anesthésie et Réanimation",
  "Chirurgie Cardiaque et Vasculaire",
  "Chirurgie Esthétique",
  "Chirurgie Générale",
  "Chirurgie Maxillo-faciale",
  "Chirurgie Orthopédique et Traumatologique",
  "Chirurgie Pédiatrique",
  "Chirurgie Plastique et Reconstructrice",
  "Chirurgie Urologique",
  "Neurochirurgie",
  "Orthopédie-Traumatologie",
  "Réanimation",

  // ── Aesthetics & Nutrition ──────────────────────────────────────────────────
  "Esthétique et Laser",
  "Esthétique Générale",
  "Nutritionniste",
  "Diététique",

  // ── Physical Therapy & Rehabilitation ──────────────────────────────────────
  "Kinésithérapie",
  "Masseur-Kinésithérapie",
  "Médecine Physique et Réadaptation",
  "Orthophonie",
  "Ostéopathie",
  "Pédicure-Podologie",
  "Physiothérapie",
  "Psychomotricité",
  "Rééducation Fonctionnelle",

  // ── Diagnostics & Imaging ───────────────────────────────────────────────────
  "Anatomie et Cytologie Pathologiques",
  "Biologie Clinique",
  "Échographie",
  "IRM",
  "Mammographie",
  "Radiologie / Imagerie Médicale",
  "Radiologie Conventionnelle",
  "Radiologie Dentaire",
  "Radiologie Interventionnelle",
  "Tomodensitométrie (Scanner)",

  // ── Dental ─────────────────────────────────────────────────────────────────
  "Chirurgie Dentaire",
  "Orthodontie",

  // ── Alternative & Other ─────────────────────────────────────────────────────
  "Acupuncture et Auriculothérapie",
  "Conseils et Orientations",
  "Médecine du Travail",
  "Médecine d'Urgence",
  "Sage-femme",

  // ── Healthcare Centers & Paramedical ───────────────────────────────────────
  "Audio-Prothèse",
  "Centre d'Analyse Médicale",
  "Centre Médical",
  "Orthoptique",
  "Ortho-Prothèse",
  "Soins Infirmiers",
  "Pharmacie",
  "Optique Médicale",
  "Ambulance",
] as const;

export type MedicalSpecialty = typeof SPECIALTIES[number];

// ─────────────────────────────────────────────────────────────────────────────

export default function SearchSection() {
  const router = useRouter();

  const [specialty, setSpecialty] = useState("");
  const [location, setLocation] = useState("");

  const [specialtySuggestions, setSpecialtySuggestions] = useState<string[]>([]);
  const [showSpecialtySuggestions, setShowSpecialtySuggestions] = useState(false);
  const specialtyRef = useRef<HTMLDivElement>(null);

  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (specialtyRef.current && !specialtyRef.current.contains(e.target as Node)) {
        setShowSpecialtySuggestions(false);
      }
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setShowLocationSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSpecialtyChange(value: string) {
    setSpecialty(value);
    if (value.trim().length > 0) {
      const filtered = (SPECIALTIES as readonly string[]).filter((s) =>
        s.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 8);
      setSpecialtySuggestions(filtered);
      setShowSpecialtySuggestions(filtered.length > 0);
    } else {
      setShowSpecialtySuggestions(false);
    }
  }

  function handleLocationChange(value: string) {
    setLocation(value);
    if (value.trim().length > 0) {
      const filtered = (ALGERIA_CITIES as readonly string[]).filter((city) =>
        city.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 6);
      setLocationSuggestions(filtered);
      setShowLocationSuggestions(filtered.length > 0);
    } else {
      setShowLocationSuggestions(false);
    }
  }

  function handleSearch() {
    const params = new URLSearchParams();
    if (specialty.trim()) params.set("specialization", specialty.trim());
    if (location.trim()) params.set("city", location.trim());
    router.push(`/patient/doctors?${params.toString()}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSearch();
  }

  return (
    <section className="relative -mt-16 z-10 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-5xl"
      >
        <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 p-6 md:p-8 border border-slate-100">
          <div className="grid md:grid-cols-3 gap-4">

            {/* Specialty Input */}
            <div className="space-y-2" ref={specialtyRef}>
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-teal-600" />
                Spécialité
              </label>
              <div className="relative">
                <Input
                  placeholder="Rechercher une spécialité..."
                  value={specialty}
                  onChange={(e) => handleSpecialtyChange(e.target.value)}
                  onFocus={() => {
                    if (specialtySuggestions.length > 0) setShowSpecialtySuggestions(true);
                  }}
                  onKeyDown={handleKeyDown}
                  className="pl-10 h-12 border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                {showSpecialtySuggestions && (
                  <div className="absolute z-50 top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden max-h-64 overflow-y-auto">
                    {specialtySuggestions.map((s) => (
                      <button
                        key={s}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setSpecialty(s);
                          setShowSpecialtySuggestions(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors flex items-center gap-2"
                      >
                        <Stethoscope className="h-3.5 w-3.5 text-teal-400 flex-shrink-0" />
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Location Input */}
            <div className="space-y-2" ref={locationRef}>
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-teal-600" />
                Wilaya / Ville
              </label>
              <div className="relative">
                <Input
                  placeholder="Entrer une wilaya..."
                  value={location}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  onFocus={() => {
                    if (locationSuggestions.length > 0) setShowLocationSuggestions(true);
                  }}
                  onKeyDown={handleKeyDown}
                  className="pl-10 h-12 border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                />
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                {showLocationSuggestions && (
                  <div className="absolute z-50 top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                    {locationSuggestions.map((city) => (
                      <button
                        key={city}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setLocation(city);
                          setShowLocationSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors flex items-center gap-2"
                      >
                        <MapPin className="h-3.5 w-3.5 text-teal-400 flex-shrink-0" />
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <Button
                size="lg"
                onClick={handleSearch}
                className="w-full h-12 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg shadow-teal-500/30 cursor-pointer"
              >
                <Search className="mr-2 h-4 w-4" />
                Trouver un médecin
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Tags */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-sm text-slate-500 mb-3">Recherches populaires :</p>
            <div className="flex flex-wrap gap-2">
              {[
                "Médecine Générale",
                "Cardiologie",
                "Dermatologie",
                "Pédiatrie",
                "Gynécologie-Obstétrique",
                "Neurologie",
              ].map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSpecialty(tag);
                    setShowSpecialtySuggestions(false);
                  }}
                  className="text-sm px-4 py-2 rounded-full border border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-600 hover:bg-teal-50 transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}