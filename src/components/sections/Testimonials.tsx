import React from "react";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { MessageSquareHeart, HeartHandshake, Globe } from "lucide-react";

export const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="py-20 lg:py-28 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <SectionHeader
          badge="Community & Reviews"
          title="Student & Parent Testimonials"
          subtitle="Student and parent testimonials will be featured here as our learning community grows."
        />

        <div className="bg-slate-50/70 rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-premium max-w-2xl mx-auto">
          <div className="w-20 h-20 rounded-3xl bg-gold-light flex items-center justify-center text-navy-primary mx-auto mb-6 border border-gold-accent/30 shadow-sm">
            <MessageSquareHeart className="w-10 h-10 text-navy-primary" />
          </div>

          <Badge variant="gold" className="mb-4">
            Growing Learning Community
          </Badge>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8">
            We are dedicated to providing a supportive, high-quality online education experience for every student. Authentic reviews and feedback from our students and parents across <strong>India, the United Kingdom, and GCC Countries</strong> will be published here.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-6 border-t border-slate-200 text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-navy-primary" /> India • United Kingdom • GCC Countries
            </span>
            <span className="flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-gold-accent" /> Transparent Feedback Policy
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
