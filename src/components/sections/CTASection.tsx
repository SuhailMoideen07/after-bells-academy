import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ACADEMY_INFO } from "@/lib/constants";
import { Sparkles, GraduationCap, PhoneCall, CheckCircle } from "lucide-react";

export const CTASection: React.FC = () => {
  return (
    <section className="py-20 lg:py-24 bg-gradient-to-r from-navy-primary via-navy-dark to-navy-primary text-white relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold-accent/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-navy-light/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="inline-block mb-4">
          <Badge variant="gold" icon={<Sparkles className="w-3.5 h-3.5" />}>
            Limited Seats Available for 2026 Cohort
          </Badge>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-6 leading-tight">
          Ready to See the Difference After the Last Bell?
        </h2>

        <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
          Book a 30-minute FREE Live Trial Class today. Experience our interactive whiteboards, meet subject experts, and receive a free academic diagnostic.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <a
            href={ACADEMY_INFO.googleForms.demoBooking}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button
              variant="gold"
              size="lg"
              fullWidth
              icon={<Sparkles className="w-5 h-5 text-navy-dark" />}
              className="shadow-2xl shadow-gold-accent/20"
            >
              Book a FREE Demo Class
            </Button>
          </a>
          <a
            href={ACADEMY_INFO.googleForms.admissionApplication}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button
              variant="navy-outline"
              size="lg"
              fullWidth
              icon={<GraduationCap className="w-5 h-5" />}
            >
              Apply for Admission
            </Button>
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-gold-accent" /> No Credit Card Required
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-gold-accent" /> Flexible Time Zones (UK/GCC/India)
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-gold-accent" /> 100% Free Trial
          </div>
        </div>
      </div>
    </section>
  );
};
