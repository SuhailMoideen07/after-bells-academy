import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { FloatingWhatsAppButton } from "@/components/ui/FloatingWhatsAppButton";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.afterbells.in"),
  applicationName: "After Bells",
  title: {
    default: "After Bells | Live Online Classes for KG to Grade 12 (After Bells Academy)",
    template: "%s | After Bells",
  },
  description:
    "Curiosity Begins After the Last Bell. After Bells (After Bells Academy) is a modern online learning platform providing live interactive classes for KG to Grade 12 students across State Syllabus, CBSE, ICSE, GCSE, and IGCSE in India, UK, and GCC countries.",
  keywords: [
    "After Bells",
    "after bells",
    "After Bells Academy",
    "after bells academy",
    "AfterBells",
    "afterbells",
    "AfterBells Academy",
    "afterbells academy",
    "afterbells.in",
    "after bells online tuition",
    "after bells academy online learning",
    "after bells tuition classes",
    "online tuition KG to Grade 12",
    "live online classes India",
    "online tuition UK",
    "online classes GCC",
    "CBSE online tuition",
    "ICSE online classes",
    "GCSE online tuition",
    "IGCSE online classes",
    "State Syllabus online tuition",
    "one to one online tuition",
    "small batch online classes",
    "homework assistance online",
    "doubt clearing live classes",
    "free demo class online",
  ],
  authors: [{ name: "After Bells" }, { name: "After Bells Academy" }],
  creator: "After Bells",
  publisher: "After Bells",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://www.afterbells.in",
  },
  openGraph: {
    title: "After Bells | Live Online Classes for KG to Grade 12 (After Bells Academy)",
    description:
      "Curiosity Begins After the Last Bell. Live interactive online tuition classes for KG to Grade 12 across State Syllabus, CBSE, ICSE, GCSE, and IGCSE curriculums in India, UK, and GCC countries by After Bells.",
    url: "https://www.afterbells.in",
    siteName: "After Bells",
    images: [
      {
        url: "https://www.afterbells.in/logo.png",
        width: 1200,
        height: 630,
        alt: "After Bells & After Bells Academy Official Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "After Bells | Live Online Classes for KG to Grade 12 (After Bells Academy)",
    description:
      "Curiosity Begins After the Last Bell. Live interactive online tuition classes for students in India, UK, and GCC countries.",
    images: ["https://www.afterbells.in/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/logo.png" },
      { url: "/icon.png" },
    ],
    shortcut: "/logo.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Google JSON-LD Structured Data Schema for EducationalOrganization & WebSite
  const jsonLdData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EducationalOrganization",
        "@id": "https://www.afterbells.in/#organization",
        name: "After Bells",
        legalName: "After Bells Academy",
        alternateName: [
          "After Bells Academy",
          "AfterBells",
          "AfterBells Academy",
          "after bells academy",
          "after bells",
          "afterbells.in",
        ],
        url: "https://www.afterbells.in",
        logo: "https://www.afterbells.in/logo.png",
        image: "https://www.afterbells.in/logo.png",
        description:
          "After Bells (After Bells Academy) is a modern online learning platform providing live interactive classes for students from KG to Grade 12.",
        telephone: "+91 96564 27537",
        email: "afterbellsacademy@gmail.com",
        sameAs: [
          "https://instagram.com/afterbellsacademy",
          "https://wa.me/919656427537",
        ],
        areaServed: ["India", "United Kingdom", "GCC Countries"],
      },
      {
        "@type": "WebSite",
        "@id": "https://www.afterbells.in/#website",
        url: "https://www.afterbells.in",
        name: "After Bells",
        alternateName: ["After Bells Academy", "AfterBells", "AfterBells Academy", "afterbells.in"],
        publisher: {
          "@id": "https://www.afterbells.in/#organization",
        },
      },
    ],
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      </head>
      <body className="min-h-full flex flex-col relative">
        {children}
        <FloatingWhatsAppButton />
      </body>
    </html>
  );
}
