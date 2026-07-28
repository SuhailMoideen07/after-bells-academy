import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ACADEMY_INFO, NAV_LINKS } from "@/lib/constants";
import { Mail, Phone, Globe, Heart } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-dark text-slate-300 pt-16 pb-12 border-t border-navy-primary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-white/10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <img
                src="/logo.png"
                alt="After Bells Academy"
                className="h-16 sm:h-20 w-auto object-contain rounded-xl bg-white p-1 shadow-lg border border-gold-accent/40 group-hover:scale-105 transition-transform"
              />
              <span className="text-2xl font-black text-white tracking-tight">
                After Bells <span className="text-gold-accent">Academy</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              "{ACADEMY_INFO.tagline}" {ACADEMY_INFO.description}
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-gold-accent bg-white/5 px-3 py-2 rounded-lg w-fit border border-gold-accent/20">
              <Globe className="w-4 h-4" /> Curriculums: State Syllabus • CBSE • ICSE • GCSE • IGCSE
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-white text-base font-bold tracking-wider uppercase text-xs">
              Quick Navigation
            </h3>
            <ul className="space-y-2.5 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-gold-accent transition-colors flex items-center gap-1.5"
                  >
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Curriculums */}
          <div className="space-y-4">
            <h3 className="text-white text-base font-bold tracking-wider uppercase text-xs">
              Curriculums We Teach
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              {ACADEMY_INFO.supportedBoards.map((board) => (
                <li key={board} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-accent"></span>
                  <span>{board}</span>
                </li>
              ))}
              <li className="pt-2 text-xs text-gold-accent font-medium">
                KG to Grade 12 LIVE Classes
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-white text-base font-bold tracking-wider uppercase text-xs">
              Contact Us
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-gold-accent shrink-0" />
                <a href={`tel:${ACADEMY_INFO.contact.phone.replace(/\s+/g, "")}`} className="hover:text-white transition-colors">
                  {ACADEMY_INFO.contact.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-gold-accent shrink-0" />
                <a href={`mailto:${ACADEMY_INFO.contact.email}`} className="hover:text-white transition-colors">
                  {ACADEMY_INFO.contact.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-gold-accent shrink-0 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <a
                  href={ACADEMY_INFO.contact.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  {ACADEMY_INFO.contact.instagram}
                </a>
              </li>
              <li className="pt-2 text-xs text-slate-400 flex items-start gap-1.5">
                <Globe className="w-3.5 h-3.5 text-gold-accent shrink-0 mt-0.5" />
                <span>Serving students in India, UK, and GCC countries</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} After Bells Academy. All rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>for curious minds worldwide.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
