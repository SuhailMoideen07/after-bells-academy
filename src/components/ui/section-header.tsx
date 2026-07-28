import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  badge?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  dark?: boolean;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  badge,
  title,
  subtitle,
  align = "center",
  dark = false,
  className,
}) => {
  return (
    <div
      className={cn(
        "max-w-3xl mb-12 lg:mb-16",
        align === "center" ? "mx-auto text-center" : "text-left",
        className
      )}
    >
      {badge && (
        <div className={cn("mb-4", align === "center" ? "flex justify-center" : "inline-block")}>
          <Badge variant={dark ? "gold" : "gold"}>{badge}</Badge>
        </div>
      )}
      <h2
        className={cn(
          "text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-4",
          dark ? "text-white" : "text-navy-primary"
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "text-base sm:text-lg leading-relaxed font-normal",
            dark ? "text-slate-300" : "text-slate-600"
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};
