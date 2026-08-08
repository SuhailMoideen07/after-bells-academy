"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ACADEMY_INFO, NAV_LINKS } from "@/lib/constants";
import { Menu, X, ArrowRight, Sparkles, PhoneCall, UserCheck, ShieldCheck } from "lucide-react";

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md border-b border-slate-200/80 py-2 shadow-sm"
          : "bg-white/90 backdrop-blur-sm border-b border-slate-100 py-3"
      }`}
    >
      <div className="w-full px-3 sm:px-5 lg:px-6 xl:px-8 max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between gap-2 xl:gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <img
              src="/logo.png"
              alt="After Bells Academy Logo"
              className="h-11 sm:h-13 lg:h-14 w-auto object-contain shrink-0 group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-black tracking-tight text-navy-primary leading-none whitespace-nowrap">
                After Bells <span className="text-gold-accent font-bold">Academy</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-semibold text-slate-500 tracking-wider uppercase hidden xl:inline-block mt-0.5 whitespace-nowrap">
                Curiosity Begins After the Last Bell
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 xl:gap-1.5">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`px-2 py-1 text-xs 2xl:text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
                    isActive
                      ? "text-navy-primary font-bold bg-navy-subtle"
                      : "text-slate-700 hover:text-navy-primary hover:bg-slate-100"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* CTA Action Buttons */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <Link href="/login">
              <Button
                variant="outline"
                size="sm"
                className="font-bold text-xs border-gold-accent/60 text-navy-primary bg-gold-light/60 hover:bg-gold-accent hover:text-navy-dark px-3 py-1.5 transition-all shadow-xs"
                icon={<UserCheck className="w-3.5 h-3.5 text-navy-primary" />}
              >
                Teacher & Admin Portal
              </Button>
            </Link>
            <a
              href={ACADEMY_INFO.googleForms.admissionApplication}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                size="sm"
                className="font-bold text-xs border-navy-primary text-navy-primary hover:bg-navy-primary hover:text-white px-3 py-1.5"
              >
                Apply for Admission
              </Button>
            </a>
            <a
              href={ACADEMY_INFO.googleForms.demoBooking}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="gold"
                size="sm"
                className="text-xs px-3.5 py-1.5 font-extrabold shadow-sm"
                icon={<Sparkles className="w-3.5 h-3.5 text-navy-primary" />}
              >
                Book FREE Demo
              </Button>
            </a>
          </div>

          {/* Mobile Hamburger & Quick Portal Button */}
          <div className="lg:hidden flex items-center gap-2">
            <Link href="/login">
              <Button variant="outline" size="sm" className="text-xs px-2.5 py-1 font-bold border-gold-accent text-navy-primary">
                Portal
              </Button>
            </Link>
            <a
              href={ACADEMY_INFO.googleForms.demoBooking}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="gold" size="sm" className="text-xs px-2.5 py-1 font-bold">
                FREE Demo
              </Button>
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-navy-primary bg-navy-subtle hover:bg-slate-200 transition-colors focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[58px] bg-white border-b border-slate-200 shadow-2xl p-5 transition-all animate-in slide-in-from-top-2 max-h-[calc(100vh-65px)] overflow-y-auto z-50">
          <div className="grid grid-cols-2 gap-2 mb-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-xs font-semibold text-navy-primary bg-slate-50 hover:bg-navy-subtle rounded-xl transition-colors text-center"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-2.5 pt-4 border-t border-slate-100">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant="outline"
                fullWidth
                size="md"
                className="font-bold border-gold-accent bg-gold-light/50 text-navy-primary"
                icon={<UserCheck className="w-4 h-4 text-navy-primary" />}
              >
                Teacher & Admin Portal Login
              </Button>
            </Link>
            <a
              href={ACADEMY_INFO.googleForms.demoBooking}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Button
                variant="gold"
                fullWidth
                size="md"
                className="font-bold shadow-md"
                icon={<Sparkles className="w-4 h-4 text-navy-dark" />}
              >
                Book a FREE Demo Class
              </Button>
            </a>
            <a
              href={ACADEMY_INFO.googleForms.admissionApplication}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Button
                variant="outline"
                fullWidth
                size="md"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Apply for Admission
              </Button>
            </a>
            <a
              href={ACADEMY_INFO.contact.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 hover:text-navy-primary pt-2"
            >
              <PhoneCall className="w-3.5 h-3.5 text-gold-accent" /> Need Help? Chat with Us
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
