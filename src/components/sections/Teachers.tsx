"use client";

import React from "react";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Award,
  Users,
  Sparkles,
  BookOpenCheck,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

export const Teachers: React.FC = () => {
  const teacherPillars = [
    {
      title: "Qualified Subject Specialists",
      description:
        "Educators with specialized academic degrees and deep subject expertise across State, CBSE, ICSE, GCSE, and IGCSE curriculums.",
      icon: GraduationCap,
    },
    {
      title: "Interactive Concept Trainers",
      description:
        "Trained specifically in live online teaching, digital whiteboards, and engaging student-centered problem solving.",
      icon: BookOpenCheck,
    },
    {
      title: "Personalized & Small Batch Mentors",
      description:
        "Committed to dedicated individual attention, adapting lessons to suit every student's learning pace.",
      icon: Users,
    },
    {
      title: "Regular Performance Evaluation",
      description:
        "Continuous academic monitoring and transparent parent communication to maintain top teaching standards.",
      icon: ShieldCheck,
    },
  ];

  return (
    <section id="teachers" className="py-20 lg:py-28 bg-slate-50/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Educator Standards"
          title="Qualified & Dedicated Subject Teachers"
          subtitle="Every class at After Bells Academy is led by qualified subject specialists committed to interactive, concept-based learning."
        />

        {/* 4 Educator Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {teacherPillars.map((pillar) => {
            const IconComponent = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-gold-accent/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-navy-primary text-gold-accent flex items-center justify-center mb-5 shadow-sm">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-navy-primary mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-gold-accent" />
                  <span>Verified Educator Standard</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-premium max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-navy-subtle text-navy-primary text-xs font-bold px-3.5 py-1.5 rounded-full mb-4 border border-navy-primary/10">
            <Award className="w-4 h-4 text-gold-accent" />
            <span>Dedicated Academic Mentorship</span>
          </div>

          <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
            At <strong>After Bells Academy</strong>, our faculty is chosen for their academic qualifications, patient teaching style, and ability to make complex concepts simple and engaging for students from <strong>KG to Grade 12</strong>.
          </p>
        </div>
      </div>
    </section>
  );
};
