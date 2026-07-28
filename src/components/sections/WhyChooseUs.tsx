import React from "react";
import { SectionHeader } from "@/components/ui/section-header";
import { FEATURES } from "@/lib/constants";
import {
  Radio,
  BookOpenCheck,
  UserCheck,
  Clock,
  LineChart,
  HeartHandshake,
} from "lucide-react";

export const WhyChooseUs: React.FC = () => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Radio":
        return <Radio className="w-6 h-6 text-navy-primary" />;
      case "BookOpenCheck":
        return <BookOpenCheck className="w-6 h-6 text-navy-primary" />;
      case "UserCheck":
        return <UserCheck className="w-6 h-6 text-navy-primary" />;
      case "Clock":
        return <Clock className="w-6 h-6 text-navy-primary" />;
      case "LineChart":
        return <LineChart className="w-6 h-6 text-navy-primary" />;
      case "HeartHandshake":
        return <HeartHandshake className="w-6 h-6 text-navy-primary" />;
      default:
        return <Radio className="w-6 h-6 text-navy-primary" />;
    }
  };

  return (
    <section id="why-us" className="py-20 lg:py-28 bg-slate-50/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Why Choose After Bells Academy"
          title="Concept-Based Learning in a Supportive Online Environment"
          subtitle="Our core commitment is helping every student learn with confidence through personalized teaching, engaging live sessions, and clear parent communication."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-8 border border-slate-200 shadow-premium hover:shadow-premium-hover transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-navy-subtle flex items-center justify-center border border-navy-primary/10">
                    {getIcon(feature.icon)}
                  </div>
                  {feature.badge && (
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-gold-light text-navy-primary border border-gold-accent/30">
                      {feature.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-extrabold text-navy-primary mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
