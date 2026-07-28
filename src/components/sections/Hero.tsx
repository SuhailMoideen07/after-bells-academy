"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ACADEMY_INFO } from "@/lib/constants";
import { Sparkles, CheckCircle2, Globe, GraduationCap, Video } from "lucide-react";

export const Hero: React.FC = () => {
  return (
    <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 lg:pt-40 lg:pb-28 overflow-hidden bg-gradient-to-b from-navy-subtle/40 via-white to-white">
      {/* Background Decorative Gradient Orbs */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-navy-primary/5 via-gold-accent/10 to-navy-primary/5 blur-3xl -z-10 rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mb-6">
          <Badge variant="navy" icon={<Video className="w-3.5 h-3.5 text-gold-accent" />}>
            Live Online Classes
          </Badge>
          <Badge variant="gold" icon={<Sparkles className="w-3.5 h-3.5 text-navy-primary" />}>
            KG to Grade 12
          </Badge>
          <Badge variant="subtle" icon={<Globe className="w-3.5 h-3.5 text-navy-primary" />}>
            State Syllabus • CBSE • ICSE • GCSE • IGCSE
          </Badge>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-navy-primary tracking-tight leading-[1.15] mb-6">
          Curiosity Begins <br className="hidden sm:inline" />
          <span className="gradient-text-navy">After the Last Bell.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg lg:text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto mb-8 font-normal">
          After Bells Academy is a modern online learning platform providing live interactive classes for students from <strong>KG to Grade 12</strong>. We make quality education accessible through personalized teaching, engaging live sessions, and concept-based learning.
        </p>

        {/* Core Services Highlights Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl mx-auto mb-10 text-left bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-premium">
          {[
            "Live Interactive Classes",
            "One-to-One & Small Batch Tuition",
            "State, CBSE, ICSE, GCSE & IGCSE",
            "Homework Assistance & Doubt Clearing",
            "Exam Prep & Personalized Support",
            "Serving India, UK & GCC Countries",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-gold-accent shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* Call To Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 mb-8">
          <a
            href={ACADEMY_INFO.googleForms.admissionApplication}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button
              variant="gold"
              size="lg"
              fullWidth
              icon={<GraduationCap className="w-5 h-5 text-navy-dark" />}
              className="shadow-xl shadow-gold-accent/20 px-8 py-4 text-base font-bold"
            >
              Apply for Admission
            </Button>
          </a>
          <a
            href={ACADEMY_INFO.googleForms.demoBooking}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button
              variant="outline"
              size="lg"
              fullWidth
              icon={<Sparkles className="w-5 h-5" />}
              className="px-8 py-4 text-base font-bold border-2 border-navy-primary text-navy-primary hover:bg-navy-primary hover:text-white"
            >
              Book a FREE Demo
            </Button>
          </a>
        </div>

        {/* Regional Welcome Note */}
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-4 py-2 rounded-full w-fit mx-auto shadow-xs">
          <Globe className="w-3.5 h-3.5 text-navy-primary shrink-0" />
          <span>Welcoming Students from <strong>India • United Kingdom • GCC Countries</strong></span>
        </div>
      </div>
    </section>
  );
};
