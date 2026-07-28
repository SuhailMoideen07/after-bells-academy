"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "gold" | "outline" | "ghost" | "navy-outline";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  children,
  icon,
  iconPosition = "right",
  fullWidth = false,
  className,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold transition-all duration-300 rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98]";

  const sizeStyles = {
    sm: "px-4 py-2 text-xs gap-1.5",
    md: "px-6 py-3 text-sm gap-2",
    lg: "px-8 py-4 text-base gap-2.5 shadow-lg",
  };

  const variantStyles = {
    primary:
      "bg-navy-primary text-white hover:bg-navy-dark focus:ring-navy-primary shadow-md hover:shadow-xl hover:-translate-y-0.5",
    gold: "bg-gold-accent text-navy-dark hover:bg-yellow-500 focus:ring-gold-accent shadow-md hover:shadow-xl hover:-translate-y-0.5 font-bold",
    outline:
      "border-2 border-navy-primary text-navy-primary hover:bg-navy-primary hover:text-white focus:ring-navy-primary",
    "navy-outline":
      "border-2 border-gold-accent/40 text-gold-accent hover:bg-gold-accent hover:text-navy-dark focus:ring-gold-accent",
    ghost:
      "text-navy-primary hover:bg-navy-subtle focus:ring-navy-primary",
  };

  return (
    <button
      className={cn(
        baseStyles,
        sizeStyles[size],
        variantStyles[variant],
        fullWidth ? "w-full" : "",
        className
      )}
      {...props}
    >
      {icon && iconPosition === "left" && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === "right" && <span className="shrink-0">{icon}</span>}
    </button>
  );
};
