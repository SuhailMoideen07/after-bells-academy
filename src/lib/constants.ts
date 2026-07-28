import { Program, FAQItem, FeatureItem, AdmissionCard } from "@/types";

export const ACADEMY_INFO = {
  name: "After Bells Academy",
  tagline: "Curiosity Begins After the Last Bell.",
  description:
    "After Bells Academy is a modern online learning platform that provides live interactive classes for students from KG to Grade 12. Our mission is to make quality education accessible through personalized teaching, engaging live sessions, and concept-based learning. We focus on helping every student learn with confidence in a supportive online environment.",
  googleForms: {
    demoBooking: "https://docs.google.com/forms/d/e/1FAIpQLSecZFfWIKyQ0Dnqn4XiAs0pKp8FSRDnom6HW6FUsiSD0gE6kQ/viewform?usp=publish-editor",
    admissionApplication: "https://docs.google.com/forms/d/e/1FAIpQLSeX0J4FpGSglKZx0ChTi4ALshxUQyhVkg1Prz10Uzqmnaq0_Q/viewform?usp=publish-editor",
  },
  contact: {
    phone: "+91 96564 27537",
    email: "afterbellsacademy@gmail.com",
    instagram: "@afterbellsacademy",
    instagramUrl: "https://instagram.com/afterbellsacademy",
    whatsapp: "https://wa.me/919656427537",
    regions: "Serving Students in India, United Kingdom, and GCC Countries",
  },
  supportedBoards: ["State Syllabus", "CBSE", "ICSE", "GCSE", "IGCSE"],
  services: [
    "Live Online Classes",
    "One-to-One Tuition",
    "Small Batch Classes",
    "Homework Assistance",
    "Doubt Clearing Sessions",
    "Exam Preparation",
    "Personalized Learning Support",
    "Regular Assessments",
    "Parent Communication",
    "Free Demo Classes",
    "Online Admissions",
  ],
};

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/#services" },
  { label: "Why Us", href: "/#why-us" },
  { label: "Curriculums", href: "/#programs" },
  { label: "Methodology", href: "/#process" },
  { label: "Teachers", href: "/#teachers" },
  { label: "Testimonials", href: "/#testimonials" },
  { label: "FAQ", href: "/#faq" },
  { label: "Admissions", href: "/admissions" },
];

export const CORE_PILLARS = [
  {
    title: "Live Online Classes",
    description: "Engaging real-time online sessions led by dedicated subject teachers.",
    iconName: "Radio",
  },
  {
    title: "Personalized Learning",
    description: "Tailored individual attention to suit every student's learning pace.",
    iconName: "UserCheck",
  },
  {
    title: "Small Batch Classes",
    description: "Focused small group learning environments for maximum engagement.",
    iconName: "Users",
  },
  {
    title: "Global Reach",
    description: "Welcoming students across India, the United Kingdom, and GCC Countries.",
    iconName: "Globe",
  },
];

export const FEATURES: FeatureItem[] = [
  {
    title: "Live Interactive Classes",
    description:
      "Real teachers engaging students in real-time online sessions with interactive digital whiteboards.",
    icon: "Radio",
    badge: "Interactive",
  },
  {
    title: "Concept-Based Teaching",
    description:
      "Focusing on deep fundamental understanding and analytical problem solving rather than rote learning.",
    icon: "BookOpenCheck",
    badge: "Concept First",
  },
  {
    title: "Small Batch & Individual Attention",
    description:
      "Small class sizes ensuring every student receives personal guidance and active participation opportunities.",
    icon: "UserCheck",
    badge: "Personalized",
  },
  {
    title: "Flexible Class Timings",
    description:
      "Schedules tailored after regular school hours for students in India, UK, and GCC time zones.",
    icon: "Clock",
    badge: "Convenient",
  },
  {
    title: "Regular Progress Tracking & Parent Communication",
    description:
      "Transparent updates, regular assessments, and clear parent communication on student development.",
    icon: "LineChart",
    badge: "Transparent",
  },
  {
    title: "Safe & Supportive Learning Environment",
    description:
      "A positive online atmosphere that builds confidence, encourages questions, and nurtures curiosity.",
    icon: "HeartHandshake",
    badge: "Supportive",
  },
];

export const PROGRAMS: Program[] = [
  {
    id: "primary",
    category: "primary",
    title: "Foundational Primary (KG to Grade 5)",
    grades: "KG - Grade 5",
    ageGroup: "Primary Level",
    description:
      "Building strong fundamentals in reading, logical thinking, arithmetic, and basic science in a supportive environment.",
    boards: ["State Syllabus", "CBSE", "ICSE", "GCSE", "IGCSE"],
    keyHighlights: [
      "Foundational Reading & Math Skills",
      "Interactive Learning Activities",
      "Encouraging Curiosity & Confidence",
      "Homework & Concept Assistance",
    ],
    subjects: ["Mathematics", "English", "General Science", "Environmental Studies"],
    badgeText: "Foundational Level",
  },
  {
    id: "middle",
    category: "middle",
    title: "Middle School (Grade 6 to 8)",
    grades: "Grade 6 - Grade 8",
    ageGroup: "Middle Level",
    description:
      "Developing conceptual clarity, structured study habits, and analytical problem-solving across core subjects.",
    boards: ["State Syllabus", "CBSE", "ICSE", "GCSE", "IGCSE"],
    keyHighlights: [
      "Conceptual Science & Mathematics",
      "Grammar & Composition Skills",
      "Doubt Clearing & Assignment Help",
      "Regular Chapter Assessments",
    ],
    subjects: ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Social Science"],
    badgeText: "Middle Level",
  },
  {
    id: "secondary",
    category: "secondary",
    title: "Secondary Education (Grade 9 & 10)",
    grades: "Grade 9 - Grade 10",
    ageGroup: "Secondary Level",
    description:
      "Comprehensive exam preparation and subject mastery aligned with State Syllabus, CBSE, ICSE, GCSE, and IGCSE.",
    boards: ["State Syllabus", "CBSE", "ICSE", "GCSE", "IGCSE"],
    keyHighlights: [
      "Exam-Oriented Problem Solving",
      "Chapter-wise Revision & Practice",
      "Dedicated Doubt Resolution Sessions",
      "Past Paper Guidance & Mock Tests",
    ],
    subjects: ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Social Studies"],
    badgeText: "Exam Prep Focus",
  },
  {
    id: "senior",
    category: "senior",
    title: "Senior Secondary (Grade 11 & 12)",
    grades: "Grade 11 - Grade 12",
    ageGroup: "Senior Level",
    description:
      "Specialized subject guidance and rigorous conceptual clarity for higher secondary school academic success.",
    boards: ["State Syllabus", "CBSE", "ICSE", "GCSE", "IGCSE"],
    keyHighlights: [
      "In-Depth Subject Derivations & Numericals",
      "Targeted Exam Preparation Strategies",
      "Personalized Academic Support",
      "Regular Evaluation & Feedback",
    ],
    subjects: ["Physics", "Chemistry", "Mathematics", "Biology", "Computer Science"],
    badgeText: "Senior Level",
  },
];

export const TEACHING_PROCESS = [
  {
    step: "01",
    title: "Free Demo & Academic Need Assessment",
    description:
      "We begin with a free demo session to understand the student's current academic level and specific learning goals.",
    icon: "FileSearch",
  },
  {
    step: "02",
    title: "Interactive LIVE Online Classes",
    description:
      "Students join real-time live sessions with concept explanation, interactive whiteboards, and instant doubt resolution.",
    icon: "MonitorPlay",
  },
  {
    step: "03",
    title: "Homework Assistance & Practice Notes",
    description:
      "After class, students receive revision notes, practice exercises, and guidance on school homework assignments.",
    icon: "BookMarked",
  },
  {
    step: "04",
    title: "Regular Assessments & Parent Updates",
    description:
      "Periodic evaluations and transparent parent updates ensure continuous academic monitoring and growth.",
    icon: "TrendingUp",
  },
];

export const FAQS: FAQItem[] = [
  {
    id: "faq-1",
    question: "How are the live online classes conducted?",
    answer:
      "Classes are conducted live over secure interactive online video platforms. Students interact directly with teachers in real time, ask questions, and solve exercises together.",
    category: "Classes",
  },
  {
    id: "faq-2",
    question: "What class sizes do you offer?",
    answer:
      "We offer both small batch classes for collaborative peer learning and one-to-one tuition options for dedicated individual focus.",
    category: "Classes",
  },
  {
    id: "faq-3",
    question: "Which curriculums and grade levels do you teach?",
    answer:
      "We teach State Syllabus, CBSE, ICSE, GCSE, and IGCSE curriculums for students from Kindergarten (KG) up to Grade 12.",
    category: "General",
  },
  {
    id: "faq-4",
    question: "Do you cater to international students outside India?",
    answer:
      "Yes! We welcome students from India, the United Kingdom, and GCC countries, with class timings scheduled conveniently after regular school hours.",
    category: "International",
  },
  {
    id: "faq-5",
    question: "How do I book a FREE Demo class?",
    answer:
      "Click on the 'Book a FREE Demo' button on our website, fill out the simple form with your child's grade and syllabus, and our team will contact you to schedule the session.",
    category: "Admission",
  },
  {
    id: "faq-6",
    question: "How can parents stay updated on student progress?",
    answer:
      "We prioritize clear parent communication through regular progress updates, performance feedback, and direct contact with our team.",
    category: "General",
  },
];

export const ADMISSION_CARDS: AdmissionCard[] = [
  {
    type: "demo",
    title: "Book a FREE Demo Class",
    subtitle: "Experience Our Live Online Teaching",
    description:
      "Attend an interactive live demo session to experience our teaching methodology and discuss your child's learning needs.",
    formUrl: ACADEMY_INFO.googleForms.demoBooking,
    badge: "Primary Action",
    features: [
      "Interactive Live Session",
      "Experience Concept-Based Teaching",
      "Academic Goal Consultation",
      "No Obligation or Fee Required",
    ],
    ctaText: "Book a FREE Demo",
    popular: true,
  },
  {
    type: "admission",
    title: "Apply for Admission",
    subtitle: "Enroll Your Child Today",
    description:
      "Submit an online application to reserve a slot for small batch classes or one-to-one personalized tuition.",
    formUrl: ACADEMY_INFO.googleForms.admissionApplication,
    badge: "Online Admission",
    features: [
      "Flexible Timing Allocation",
      "Choose Small Batch or 1-to-1 Tuition",
      "Comprehensive Homework & Exam Support",
      "Regular Parent Communication",
    ],
    ctaText: "Apply for Admission",
    popular: false,
  },
];
