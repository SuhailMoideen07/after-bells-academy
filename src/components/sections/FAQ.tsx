"use client";

import React, { useState } from "react";
import { SectionHeader } from "@/components/ui/section-header";
import { FAQS } from "@/lib/constants";
import { ChevronDown, HelpCircle } from "lucide-react";

export const FAQ: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>("faq-1");

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="py-20 lg:py-28 bg-slate-50/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Frequently Asked Questions"
          title="Everything Parents Need to Know"
          subtitle="Have questions about live classes, demo bookings, time zones, or fees? Here are clear answers."
        />

        <div className="space-y-4">
          {FAQS.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all duration-200"
              >
                <button
                  onClick={() => toggleAccordion(faq.id)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 focus:outline-none hover:bg-slate-50 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg font-bold text-navy-primary flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-gold-accent shrink-0" />
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-navy-primary transition-transform duration-300 shrink-0 ${
                      isOpen ? "rotate-180 text-gold-accent" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 pt-2 text-slate-600 text-sm sm:text-base leading-relaxed border-t border-slate-100 animate-in fade-in duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
