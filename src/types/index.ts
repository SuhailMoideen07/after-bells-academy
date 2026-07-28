export interface Program {
  id: string;
  category: "primary" | "middle" | "secondary" | "senior";
  title: string;
  grades: string;
  ageGroup: string;
  description: string;
  boards: ("State Syllabus" | "CBSE" | "ICSE" | "GCSE" | "IGCSE")[];
  keyHighlights: string[];
  subjects: string[];
  badgeText: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: "General" | "Classes" | "Admission" | "Technology" | "International";
}

export interface CorePillar {
  title: string;
  description: string;
  iconName: string;
}

export interface FeatureItem {
  title: string;
  description: string;
  icon: string;
  badge?: string;
}

export interface AdmissionCard {
  type: "demo" | "admission";
  title: string;
  subtitle: string;
  description: string;
  formUrl: string;
  badge: string;
  features: string[];
  ctaText: string;
  popular?: boolean;
}
