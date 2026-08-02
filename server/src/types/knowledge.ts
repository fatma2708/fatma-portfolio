export interface AboutKnowledge {
  name: string;
  title: string;
  summary: string;
  whyComputerEngineering: string;
  whyCloud: string;
  whyAI: string;
  careerGoal: string;
  motivation: string;
  strengths: string[];
  currentImprovement: string[];
  lookingFor: string;
}

export interface Project {
  name: string;
  type: string;
  description: string;
  stack: string[];
  highlights: string[];
  demo?: string;
}

export interface ExperienceEntry {
  role: string;
  company: string;
  period: string;
  details: string[];
}

export interface EducationEntry {
  school: string;
  degree: string;
  specialization: string;
  period: string;
}

export interface SkillCategory {
  category: string;
  skills: string[];
}

export interface PersonalityKnowledge {
  traits: string[];
  philosophy: string;
  tone: string;
}

export interface FunFact {
  fact: string;
  value: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface ContactKnowledge {
  email: string;
  linkedin: string;
  github: string;
  resume: string;
}

export interface KnowledgeBase {
  about: AboutKnowledge;
  projects: Project[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: SkillCategory[];
  personality: PersonalityKnowledge;
  funfacts: FunFact[];
  faq: FaqItem[];
  contact: ContactKnowledge;
}

export type KnowledgeFile =
  | "about"
  | "projects"
  | "experience"
  | "education"
  | "skills"
  | "personality"
  | "funfacts"
  | "faq"
  | "contact";
