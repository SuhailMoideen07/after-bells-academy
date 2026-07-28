import React from "react";
import { CORE_PILLARS } from "@/lib/constants";
import { Radio, Users, UserCheck, Globe } from "lucide-react";

export const Stats: React.FC = () => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Radio":
        return <Radio className="w-7 h-7 text-gold-accent" />;
      case "UserCheck":
        return <UserCheck className="w-7 h-7 text-gold-accent" />;
      case "Users":
        return <Users className="w-7 h-7 text-gold-accent" />;
      case "Globe":
        return <Globe className="w-7 h-7 text-gold-accent" />;
      default:
        return <Radio className="w-7 h-7 text-gold-accent" />;
    }
  };

  return (
    <section id="services" className="py-16 bg-navy-primary text-white relative overflow-hidden">
      {/* Subtle Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {CORE_PILLARS.map((pillar, idx) => (
            <div
              key={idx}
              className="bg-navy-dark/70 border border-white/10 rounded-2xl p-6 transition-transform hover:-translate-y-1 duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-white/5 border border-gold-accent/20 flex items-center justify-center mb-4">
                {getIcon(pillar.iconName)}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{pillar.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
