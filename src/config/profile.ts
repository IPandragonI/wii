/**
 * Personal information, in one place. Every field below comes from Mathys's CV (cv.jpg at the
 * project root), translated to English. The About, Contact, and LinkedIn channels, the site
 * metadata, and the menu all read from here, so update this file when the CV changes.
 *
 * Deliberately not published: phone number, age, and driving licence, which appear on the CV
 * but are private details. Add them here only if they should be public.
 */
export interface ProfileLink {
  label: string;
  href: string;
  kind: "github" | "linkedin" | "email" | "website" | "other";
}

export interface ExperienceEntry {
  role: string;
  organization: string;
  /** e.g. "Work-study contract" or "Internship". */
  type: string;
  start: string;
  end: string;
  highlights: string[];
  /** Notable projects delivered in this role. */
  keyProjects?: string[];
  technologies: string[];
}

export interface StudyProject {
  title: string;
  date: string;
  highlights: string[];
  technologies: string[];
}

export interface EducationEntry {
  period: string;
  degree: string;
  school: string;
  detail?: string;
}

export interface Profile {
  name: string;
  /** Professional title, as on the CV. */
  role: string;
  location: string;
  /** What the person is looking for, if stated on the CV. */
  availability: string;
  /** Short paragraphs for the About channel. */
  bio: string[];
  experience: ExperienceEntry[];
  studyProjects: StudyProject[];
  education: EducationEntry[];
  skills: { group: string; items: string[] }[];
  languages: { language: string; level: string }[];
  interests: { topic: string; detail: string }[];
  email: string;
  links: ProfileLink[];
}

export const profile: Profile = {
  name: "Mathys Farineau",
  role: "Full-stack developer",
  location: "Montpellier, France",
  availability: "Looking for a position in Montpellier and the surrounding area.",
  bio: [
    "I'm a full-stack developer with more than three years of work-study experience in the software publishing industry, where I've worked on a wide range of projects.",
    "I'm comfortable across several languages and frameworks, and I enjoy the whole journey: understanding what users need, designing robust software, and keeping development projects on track.",
  ],
  experience: [
    {
      role: "Junior developer",
      organization: "Decalog",
      type: "Work-study contract",
      start: "Aug 2023",
      end: "Sep 2026",
      highlights: [
        "Developed and maintained complex library management software (an integrated library system and its public portal).",
        "Analysed client needs, assessed the feasibility of their requests, and wrote functional specifications.",
      ],
      keyProjects: [
        "Migrated a legacy PHP MVC application to Symfony to modernise the library system and prepare a front-end redesign.",
        "Contributed to and integrated Planno, an open-source scheduling project, into the library system.",
      ],
      technologies: ["ExtJS", "Spring", "Symfony", "Zend", "Docker"],
    },
    {
      role: "Junior developer",
      organization: "Colombier communications",
      type: "Internship",
      start: "Mar 2023",
      end: "Jun 2023",
      highlights: [
        "Built a PHP management tool for viewing and processing missions.",
        "Optimised the performance of WordPress sites.",
      ],
      technologies: ["PHP", "JavaScript", "WordPress"],
    },
  ],
  studyProjects: [
    {
      title: "ESGI × Michelin Group hackathon",
      date: "Jun 2026",
      highlights: [
        "Designed a connected loyalty app (Strava integration, gamification, a 3D bike dashboard, and smart tyre tracking) to boost the visibility and sales of Michelin's bike range.",
      ],
      technologies: ["React Native", "Express"],
    },
    {
      title: "SSO course with Java Spring Boot",
      date: "Sep – Dec 2025",
      highlights: [
        "Designed and wrote a complete ~10-hour course on setting up Single Sign-On.",
        "Made complex topics approachable: authentication, sessions, tokens, and backend architecture.",
      ],
      technologies: ["Spring"],
    },
  ],
  education: [
    { period: "2024 – 2026", degree: "Master's degree in Web Engineering", school: "ESGI Lyon" },
    { period: "2021 – 2024", degree: "BUT in Computer Science", school: "IUT de Valence" },
    {
      period: "2021",
      degree: "Baccalauréat (general)",
      school: "Lycée Marie Pila, Carpentras",
      detail: "With honours (mention Bien)",
    },
  ],
  skills: [
    { group: "Backend", items: ["Spring", "Symfony", "NestJS", "Node.js"] },
    { group: "Frontend", items: ["Next.js", "React", "Angular", "ExtJS"] },
    { group: "Mobile", items: ["Flutter"] },
    { group: "Languages", items: ["TypeScript", "JavaScript", "PHP", "Java", "Dart"] },
    { group: "Databases", items: ["MySQL", "PostgreSQL", "Firebase"] },
    { group: "DevOps & tools", items: ["Docker", "Git", "CI/CD", "Agile", "Figma", "JetBrains"] },
    { group: "Concepts", items: ["REST APIs", "Auth / SSO", "WebSockets", "Clean Architecture"] },
  ],
  languages: [{ language: "French", level: "Native" }, { language: "English", level: "B2 (TOEIC 900/990)" }],
  interests: [
    { topic: "Music", detail: "Guitar and piano, played in a band" },
    { topic: "Sport", detail: "Tennis, weight training, running, hiking" },
    { topic: "Motorsport", detail: "Sim racing and motorsport" },
  ],
  email: "mathysf84@gmail.com",
  links: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/mathys-farineau/", kind: "linkedin" },
    { label: "Previous portfolio", href: "https://ipandragoni.github.io/portfolio/", kind: "website" },
  ],
};

export function displayName(): string {
  return profile.name.trim() || "Portfolio";
}

/** The LinkedIn profile URL, if one is configured. Used by the LinkedIn channel and Contact. */
export function linkedinUrl(): string | undefined {
  return profile.links.find((link) => link.kind === "linkedin")?.href;
}
