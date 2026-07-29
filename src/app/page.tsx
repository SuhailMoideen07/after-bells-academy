import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Stats } from "@/components/sections/Stats";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { Programs } from "@/components/sections/Programs";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { TeachingProcess } from "@/components/sections/TeachingProcess";
import { Teachers } from "@/components/sections/Teachers";
import { Testimonials } from "@/components/sections/Testimonials";
import { FAQ } from "@/components/sections/FAQ";
import { CTASection } from "@/components/sections/CTASection";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "After Bells Academy | Live Online Classes for KG to Grade 12",
  description:
    "Curiosity Begins After the Last Bell. After Bells Academy provides live interactive classes for KG to Grade 12 students across State Syllabus, CBSE, ICSE, GCSE, and IGCSE curriculums in India, UK, and GCC countries.",
  keywords: [
    "After Bells Academy",
    "after bells academy",
    "After Bells",
    "after bells",
    "AfterBells Academy",
    "afterbells.in",
    "afterbells",
    "after bells online tuition",
    "Live Online Classes",
    "State Syllabus Tuition",
    "CBSE Online Tuition",
    "ICSE Online Classes",
    "GCSE Online Tuition",
    "IGCSE Online Classes",
    "KG to Grade 12 Tuition",
    "India UK GCC Online Education",
  ],
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-gold-accent selection:text-navy-primary">
      <Navbar />
      <main className="grow">
        <Hero />
        <Stats />
        <WhyChooseUs />
        <Programs />
        <HowItWorks />
        <TeachingProcess />
        <Teachers />
        <Testimonials />
        <FAQ />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
