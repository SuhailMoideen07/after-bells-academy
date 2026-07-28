import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "gold" | "navy" | "outline" | "live" | "subtle";
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "gold",
  className,
  icon,
}) => {
  const variantStyles = {
    gold: "bg-gold-light text-navy-primary border border-gold-accent/30 font-semibold",
    navy: "bg-navy-primary text-white font-medium",
    subtle: "bg-navy-subtle text-navy-primary font-semibold border border-navy-primary/10",
    outline: "border border-navy-primary/20 text-navy-primary bg-white/50 backdrop-blur-xs font-medium",
    live: "bg-red-50 text-red-600 border border-red-200 font-bold animate-pulse",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-full transition-colors",
        variantStyles[variant],
        className
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
