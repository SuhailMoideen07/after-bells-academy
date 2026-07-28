"use client";

import React from "react";
import Link from "next/link";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { ACADEMY_INFO } from "@/lib/constants";
import {
  CalendarCheck,
  PhoneCall,
  Video,
  Users,
  GraduationCap,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: "1",
      title: "Book FREE Demo",
      icon: CalendarCheck,
      description:
        "Submit a simple 30-second form with your child's grade, subject, and syllabus (State, CBSE, ICSE, GCSE, or IGCSE).",
      badge: "Step 1",
    },
    {
      number: "2",
      title: "We Contact You",
      icon: PhoneCall,
      description:
        "Our academic advisor calls or messages you on WhatsApp to understand your goals and set a convenient class time slot.",
      badge: "Step 2",
    },
    {
      number: "3",
      title: "Attend FREE Live Class",
      icon: Video,
      description:
        "Join an interactive live demo class with our expert subject teacher. Experience concept-based learning with zero fee or obligation.",
      badge: "Step 3",
    },
    {
      number: "4",
      title: "Choose Your Batch",
      icon: Users,
      description:
        "Select between small batch interactive learning or 1-on-1 personalized tuition scheduled after regular school hours.",
      badge: "Step 4",
    },
    {
      number: "5",
      title: "Start Learning",
      icon: GraduationCap,
      description:
        "Begin regular live interactive classes with dedicated homework assistance, instant doubt resolution, and parent progress updates.",
      badge: "Step 5",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-gradient-to-b from-slate-50 via-white to-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Demo & Enrolment Journey"
          title="What Happens After You Click 'Book Demo'?"
          subtitle="Zero uncertainty, zero hidden commitments. Here is our transparent 5-step process from booking your free demo to academic confidence."
        />

        {/* 5-Step Connected Timeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-4 relative mb-12">
          {steps.map((step, idx) => {
            const IconComponent = step.icon;
            return (
              <div
                key={step.number}
                className="relative bg-white rounded-2xl p-6 border border-slate-200/80 shadow-md hover:shadow-xl hover:border-gold-accent/50 transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Step Connector Arrow for Desktop */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3.5 top-1/2 -translate-y-1/2 z-10 bg-navy-primary text-gold-accent p-1.5 rounded-full shadow-sm">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}

                <div>
                  {/* Step Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-navy-primary text-gold-accent flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-wider text-gold-accent bg-navy-primary/5 px-2.5 py-1 rounded-md border border-gold-accent/20">
                      {step.badge}
                    </span>
                  </div>

                  {/* Step Title & Description */}
                  <h3 className="text-base sm:text-lg font-bold text-navy-primary mb-2 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Progress Pill Indicator */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-gold-accent" />
                  <span>Phase {step.number} of 5</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Callout Box */}
        <div className="bg-navy-dark text-white rounded-3xl p-8 sm:p-10 border border-white/10 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-gold-accent/20 text-gold-accent text-xs font-bold px-3 py-1 rounded-full mb-3 border border-gold-accent/30">
              <Sparkles className="w-3.5 h-3.5" /> 100% Free • No Obligation • No Credit Card
            </div>
            <h4 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Ready to Experience Our Live Interactive Class?
            </h4>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Book your free demo session today. Meet dedicated subject teachers and discuss your child's learning goals.
            </p>
          </div>

          <a
            href={ACADEMY_INFO.googleForms.demoBooking}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 w-full sm:w-auto"
          >
            <Button
              variant="gold"
              size="lg"
              fullWidth
              className="px-8 py-4 text-base font-bold shadow-xl shadow-gold-accent/20"
              icon={<Sparkles className="w-5 h-5 text-navy-dark" />}
            >
              Book a FREE Demo Class Now
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};
