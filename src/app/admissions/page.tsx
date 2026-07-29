import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ADMISSION_CARDS, ACADEMY_INFO } from "@/lib/constants";
import {
  Sparkles,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  PhoneCall,
  ShieldCheck,
  Globe,
  Mail,
} from "lucide-react";

export const metadata = {
  title: "Book a FREE Demo & Admissions | After Bells (After Bells Academy)",
  description:
    "Book a FREE demo class or apply for online admission at After Bells (After Bells Academy) for live interactive classes (KG to Grade 12).",
};

export default function AdmissionsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-gold-accent selection:text-navy-primary">
      <Navbar />

      <main className="grow pt-32 pb-24">
        {/* Admissions Hero Header */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
          <div className="inline-block mb-4">
            <Badge variant="gold" icon={<Sparkles className="w-3.5 h-3.5" />}>
              Online Admissions & Free Demo Classes Open
            </Badge>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-navy-primary tracking-tight mb-4 leading-tight">
            Start Learning with <br className="hidden sm:inline" />
            <span className="gradient-text-navy">After Bells Academy</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Experience our concept-based live teaching with a 100% free demo class or apply online for small batch or one-to-one tuition.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-6 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-xs">
              <Globe className="w-3.5 h-3.5 text-navy-primary" /> Students We Serve: India • United Kingdom • GCC Countries
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-navy-primary" /> Curriculums: State Syllabus • CBSE • ICSE • GCSE • IGCSE
            </span>
          </div>
        </section>

        {/* Dual Cards Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {ADMISSION_CARDS.map((card) => {
              const isDemo = card.type === "demo";
              return (
                <div
                  key={card.type}
                  className={`relative rounded-3xl p-8 sm:p-10 transition-all duration-300 flex flex-col justify-between ${
                    isDemo
                      ? "bg-white border-2 border-gold-accent shadow-2xl hover:-translate-y-1"
                      : "bg-navy-dark text-white border border-white/10 shadow-xl hover:-translate-y-1"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                          isDemo
                            ? "bg-gold-light text-navy-primary border border-gold-accent/40"
                            : "bg-white/10 text-gold-accent border border-white/10"
                        }`}
                      >
                        {isDemo ? (
                          <Sparkles className="w-7 h-7" />
                        ) : (
                          <GraduationCap className="w-7 h-7" />
                        )}
                      </div>
                      <Badge variant={isDemo ? "gold" : "subtle"}>{card.badge}</Badge>
                    </div>

                    <h2
                      className={`text-2xl sm:text-3xl font-black mb-1 ${
                        isDemo ? "text-navy-primary" : "text-white"
                      }`}
                    >
                      {card.title}
                    </h2>
                    <p
                      className={`text-xs font-bold uppercase tracking-wider mb-4 ${
                        isDemo ? "text-gold-accent" : "text-gold-accent"
                      }`}
                    >
                      {card.subtitle}
                    </p>

                    <p
                      className={`text-sm leading-relaxed mb-6 ${
                        isDemo ? "text-slate-600" : "text-slate-300"
                      }`}
                    >
                      {card.description}
                    </p>

                    {/* Features checklist */}
                    <div className="space-y-3 mb-8">
                      <div
                        className={`text-xs font-bold uppercase tracking-wider ${
                          isDemo ? "text-navy-primary" : "text-slate-200"
                        }`}
                      >
                        What's Included:
                      </div>
                      {card.features.map((feat) => (
                        <div key={feat} className="flex items-start gap-2.5">
                          <CheckCircle2
                            className={`w-4 h-4 shrink-0 mt-0.5 ${
                              isDemo ? "text-gold-accent" : "text-gold-accent"
                            }`}
                          />
                          <span
                            className={`text-xs sm:text-sm font-medium ${
                              isDemo ? "text-slate-700" : "text-slate-200"
                            }`}
                          >
                            {feat}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Form External Link Button */}
                  <div className="pt-6 border-t border-slate-200/40">
                    <a
                      href={card.formUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full"
                    >
                      <Button
                        variant={isDemo ? "gold" : "navy-outline"}
                        size="lg"
                        fullWidth
                        icon={<ExternalLink className="w-4 h-4" />}
                      >
                        {card.ctaText}
                      </Button>
                    </a>
                    <p
                      className={`text-[11px] text-center mt-2.5 ${
                        isDemo ? "text-slate-400" : "text-slate-400"
                      }`}
                    >
                      Fill out our quick online registration form
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* How It Works 5-Step Journey Section */}
        <HowItWorks />

        {/* Real Contact Box */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-premium">
            <h3 className="text-2xl font-extrabold text-navy-primary mb-2">
              Have Questions? Contact Us Directly
            </h3>
            <p className="text-sm text-slate-600 mb-6 max-w-xl mx-auto">
              Our academic team is available to assist you with class schedules, curriculums, and demo bookings.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-semibold">
              <a
                href={`tel:${ACADEMY_INFO.contact.phone.replace(/\s+/g, "")}`}
                className="flex items-center gap-2 text-navy-primary hover:text-gold-accent transition-colors bg-slate-50 px-4 py-2 rounded-xl border border-slate-200"
              >
                <PhoneCall className="w-4 h-4 text-gold-accent" />
                <span>{ACADEMY_INFO.contact.phone}</span>
              </a>
              <a
                href={`mailto:${ACADEMY_INFO.contact.email}`}
                className="flex items-center gap-2 text-navy-primary hover:text-gold-accent transition-colors bg-slate-50 px-4 py-2 rounded-xl border border-slate-200"
              >
                <Mail className="w-4 h-4 text-gold-accent" />
                <span>{ACADEMY_INFO.contact.email}</span>
              </a>
              <a
                href={ACADEMY_INFO.contact.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-navy-primary hover:text-gold-accent transition-colors bg-slate-50 px-4 py-2 rounded-xl border border-slate-200"
              >
                <svg className="w-4 h-4 text-gold-accent fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span>{ACADEMY_INFO.contact.instagram}</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
