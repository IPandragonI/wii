/**
 * Personal information, in one place. Every field below comes from Mathys's CV (cv.jpg at the
 * project root), translated to English. The About, Contact, and LinkedIn channels, the site
 * metadata, and the menu all read from here, so update this file when the CV changes.
 *
 * Deliberately not published: phone number, age, and driving licence, which appear on the CV
 * but are private details. Add them here only if they should be public.
 */
import type { Locale } from "@/i18n/config";

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

/**
 * The French version, worded as on the original (French) CV. Language-neutral details (name,
 * email, links, technologies) are shared with the English profile above.
 */
const profileFr: Profile = {
  ...profile,
  role: "Développeur full-stack",
  location: "Montpellier, France",
  availability: "À la recherche d'une opportunité sur Montpellier et sa région.",
  bio: [
    "Développeur full-stack avec plus de 3 ans d'expérience en alternance dans l'industrie des éditeurs de logiciels, j'ai travaillé sur une large gamme de projets.",
    "Maîtrisant plusieurs langages de programmation et frameworks, j'ai une solide expérience dans l'analyse des besoins des utilisateurs, la conception de solutions logicielles robustes et la gestion efficace des projets de développement.",
  ],
  experience: [
    {
      ...profile.experience[0],
      role: "Développeur junior",
      type: "Contrat en alternance",
      start: "août 2023",
      end: "sept. 2026",
      highlights: [
        "Développement et maintenance de logiciels complexes de gestion de bibliothèque (SIGB et portail).",
        "Analyse des besoins clients, étude de la faisabilité de leurs demandes et rédaction de cahiers des charges.",
      ],
      keyProjects: [
        "Migration complète d'un MVC PHP vers Symfony afin de moderniser le SIGB et de préparer une refonte du frontend.",
        "Contribution et intégration d'un projet open source de gestion de planning (Planno) dans le SIGB.",
      ],
    },
    {
      ...profile.experience[1],
      role: "Développeur junior",
      type: "Stage",
      start: "mars 2023",
      end: "juin 2023",
      highlights: [
        "Développement d'un outil de gestion PHP permettant la visualisation et le traitement de missions.",
        "Optimisation des performances de sites WordPress.",
      ],
    },
  ],
  studyProjects: [
    {
      ...profile.studyProjects[0],
      title: "Hackathon ESGI × Groupe Michelin",
      date: "juin 2026",
      highlights: [
        "Conception d'une application mobile de fidélisation connectée (Strava, gamification, dashboard 3D du vélo, suivi intelligent des pneus) pour renforcer la visibilité et les ventes de la gamme vélo.",
      ],
    },
    {
      ...profile.studyProjects[1],
      title: "Création d'une formation SSO avec Java Spring Boot",
      date: "sept. – déc. 2025",
      highlights: [
        "Conception et rédaction d'un cours complet (~10 h) sur la mise en place d'un système Single Sign-On (SSO).",
        "Vulgarisation de concepts complexes : authentification, sessions, tokens, architecture backend.",
      ],
    },
  ],
  education: [
    { period: "2024 – 2026", degree: "Mastère Ingénierie du Web", school: "ESGI Lyon" },
    { period: "2021 – 2024", degree: "BUT Informatique", school: "IUT de Valence" },
    { period: "2021", degree: "Baccalauréat général", school: "Lycée Marie Pila, Carpentras", detail: "Mention Bien" },
  ],
  skills: [
    { group: "Backend", items: ["Spring", "Symfony", "NestJS", "Node.js"] },
    { group: "Frontend", items: ["Next.js", "React", "Angular", "ExtJS"] },
    { group: "Mobile", items: ["Flutter"] },
    { group: "Langages", items: ["TypeScript", "JavaScript", "PHP", "Java", "Dart"] },
    { group: "Bases de données", items: ["MySQL", "PostgreSQL", "Firebase"] },
    { group: "DevOps & outils", items: ["Docker", "Git", "CI/CD", "Méthodologie Agile", "Figma", "JetBrains"] },
    { group: "Concepts", items: ["API REST", "Auth / SSO", "WebSockets", "Clean Architecture"] },
  ],
  languages: [
    { language: "Français", level: "Langue maternelle" },
    { language: "Anglais", level: "Niveau B2 (TOEIC : 900/990)" },
  ],
  interests: [
    { topic: "Musique", detail: "Guitare et piano (pratique en groupe)" },
    { topic: "Sport", detail: "Tennis, musculation, course, randonnée" },
    { topic: "Automobile", detail: "Simulation et sport automobile" },
  ],
  links: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/mathys-farineau/", kind: "linkedin" },
    { label: "Ancien portfolio", href: "https://ipandragoni.github.io/portfolio/", kind: "website" },
  ],
};

const PROFILES: Record<Locale, Profile> = { en: profile, fr: profileFr };

/** The profile in a given language. */
export function getProfile(locale: Locale = "en"): Profile {
  return PROFILES[locale];
}

export function displayName(): string {
  return profile.name.trim() || "Portfolio";
}

/** The LinkedIn profile URL, if one is configured. Used by the LinkedIn channel and Contact. */
export function linkedinUrl(): string | undefined {
  return profile.links.find((link) => link.kind === "linkedin")?.href;
}
