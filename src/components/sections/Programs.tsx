"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PROGRAMS, ACADEMY_INFO } from "@/lib/constants";
import { CheckCircle2, ArrowRight, BookOpen, Layers } from "lucide-react";

export const Programs: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredPrograms =
    activeCategory === "all"
      ? PROGRAMS
      : PROGRAMS.filter((p) => p.category === activeCategory);

  return (
    <section id="programs" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Curriculum & Programs"
          title="Tailored Classes from KG to Grade 12"
          subtitle="Whether preparing for CBSE & ICSE board exams, State syllabus, or UK & GCC international curricula, we have small-batch programs designed for your child."
        />

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-12 overflow-x-auto no-scrollbar pb-2 max-w-full justify-start sm:justify-center flex-nowrap sm:flex-wrap">
          {[
            { id: "all", label: "All Programs (KG-12)" },
            { id: "primary", label: "KG - Grade 5" },
            { id: "middle", label: "Grade 6 - 8" },
            { id: "secondary", label: "Grade 9 - 10" },
            { id: "senior", label: "Grade 11 - 12" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
                activeCategory === tab.id
                  ? "bg-navy-primary text-white shadow-md"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredPrograms.map((program) => (
            <div
              key={program.id}
              className="bg-white rounded-3xl p-8 border border-slate-200 shadow-premium hover:shadow-premium-hover transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <Badge variant="gold" icon={<Layers className="w-3.5 h-3.5" />}>
                    {program.badgeText}
                  </Badge>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    {program.ageGroup}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-navy-primary mb-2">
                  {program.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  {program.description}
                </p>

                {/* Boards Supported */}
                <div className="mb-6">
                  <div className="text-xs font-bold text-navy-primary uppercase tracking-wider mb-2">
                    Supported Boards:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {program.boards.map((b) => (
                      <span
                        key={b}
                        className="text-xs font-semibold px-2.5 py-1 rounded-md bg-navy-subtle text-navy-primary border border-navy-primary/10"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Highlights */}
                <div className="mb-6">
                  <div className="text-xs font-bold text-navy-primary uppercase tracking-wider mb-2">
                    Key Focus Areas:
                  </div>
                  <ul className="space-y-2">
                    {program.keyHighlights.map((hl) => (
                      <li key={hl} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-gold-accent shrink-0" />
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Subjects */}
                <div className="mb-6">
                  <div className="text-xs font-bold text-navy-primary uppercase tracking-wider mb-2">
                    Subjects Taught:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {program.subjects.map((sub) => (
                      <span
                        key={sub}
                        className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Small Group Batches</span>
                <a
                  href={ACADEMY_INFO.googleForms.demoBooking}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="gold" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
                    Book Demo for {program.grades}
                  </Button>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
