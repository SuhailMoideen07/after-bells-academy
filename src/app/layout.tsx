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
  metadataBase: new URL("https://afterbells.in"),
  title: {
    default: "After Bells Academy | Live Online Classes for KG to Grade 12",
    template: "%s | After Bells Academy",
  },
  description:
    "Curiosity Begins After the Last Bell. After Bells Academy is a modern online learning platform providing live interactive classes for KG to Grade 12 students across State Syllabus, CBSE, ICSE, GCSE, and IGCSE in India, UK, and GCC countries.",
  keywords: [
    "After Bells",
    "After Bells Academy",
    "afterbells.in",
    "afterbells",
    "AfterBells",
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
  authors: [{ name: "After Bells Academy" }],
  creator: "After Bells Academy",
  publisher: "After Bells Academy",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://afterbells.in",
  },
  openGraph: {
    title: "After Bells Academy | Live Online Classes for KG to Grade 12",
    description:
      "Curiosity Begins After the Last Bell. Live interactive online tuition classes for KG to Grade 12 across State Syllabus, CBSE, ICSE, GCSE, and IGCSE curriculums in India, UK, and GCC countries.",
    url: "https://afterbells.in",
    siteName: "After Bells Academy",
    images: [
      {
        url: "https://afterbells.in/logo.png",
        width: 1200,
        height: 630,
        alt: "After Bells Academy Official Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "After Bells Academy | Live Online Classes for KG to Grade 12",
    description:
      "Curiosity Begins After the Last Bell. Live interactive online tuition classes for students in India, UK, and GCC countries.",
    images: ["https://afterbells.in/logo.png"],
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
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
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
        "@id": "https://afterbells.in/#organization",
        name: "After Bells Academy",
        alternateName: ["After Bells", "AfterBells", "afterbells.in"],
        url: "https://afterbells.in",
        logo: "https://afterbells.in/logo.png",
        image: "https://afterbells.in/logo.png",
        description:
          "After Bells Academy is a modern online learning platform providing live interactive classes for students from KG to Grade 12.",
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
        "@id": "https://afterbells.in/#website",
        url: "https://afterbells.in",
        name: "After Bells Academy",
        alternateName: "After Bells",
        publisher: {
          "@id": "https://afterbells.in/#organization",
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
