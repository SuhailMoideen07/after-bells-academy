import React from "react";
import { SectionHeader } from "@/components/ui/section-header";
import { TEACHING_PROCESS } from "@/lib/constants";
import { FileSearch, MonitorPlay, BookMarked, TrendingUp } from "lucide-react";

export const TeachingProcess: React.FC = () => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "FileSearch":
        return <FileSearch className="w-6 h-6 text-gold-accent" />;
      case "MonitorPlay":
        return <MonitorPlay className="w-6 h-6 text-gold-accent" />;
      case "BookMarked":
        return <BookMarked className="w-6 h-6 text-gold-accent" />;
      case "TrendingUp":
        return <TrendingUp className="w-6 h-6 text-gold-accent" />;
      default:
        return <MonitorPlay className="w-6 h-6 text-gold-accent" />;
    }
  };

  return (
    <section id="process" className="py-20 lg:py-28 bg-navy-dark text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Our Teaching Methodology"
          title="The 4-Step Academic Mastery Process"
          subtitle="How we guide students from initial assessment to top board scores and lifelong conceptual clarity."
          dark
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {TEACHING_PROCESS.map((proc, idx) => (
            <div
              key={proc.step}
              className="relative bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-gold-accent/40 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-navy-primary border border-gold-accent/30 flex items-center justify-center">
                    {getIcon(proc.icon)}
                  </div>
                  <span className="text-3xl font-black text-white/20 font-mono">
                    {proc.step}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {proc.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {proc.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
