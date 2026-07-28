import React from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  dark?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverEffect = true,
  dark = false,
}) => {
  return (
    <div
      className={cn(
        "rounded-2xl p-6 transition-all duration-300",
        dark
          ? "glass-navy-card text-white shadow-xl"
          : "bg-white border border-slate-100/80 shadow-premium",
        hoverEffect && "shadow-premium-hover",
        className
      )}
    >
      {children}
    </div>
  );
};
