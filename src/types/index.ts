// ===== Database Model Types =====

export interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDesc: string | null;
  icon: string;
  coverImage: string | null;
  techStack: string[];
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  client: string | null;
  category: string;
  techStack: string[];
  images: string[];
  liveUrl: string | null;
  githubUrl: string | null;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImg: string | null;
  category: string;
  tags: string[];
  status: "draft" | "published";
  createdAt: Date;
  updatedAt: Date;
}

export interface Testimonial {
  id: string;
  name: string;
  company: string | null;
  role: string | null;
  text: string;
  rating: number;
  avatar: string | null;
  isActive: boolean;
  createdAt: Date;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  service: string | null;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  role: "user" | "model";
  text: string;
  timestamp?: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: string;
}

// ===== API Response Types =====

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ===== UI Component Types =====

export interface NavItem {
  label: string;
  href: string;
  isExternal?: boolean;
}

export interface ServiceCardData {
  icon: string;
  title: string;
  description: string;
  slug: string;
  techStack: string[];
}

export interface StatItem {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
}

export interface TeamMember {
  name: string;
  role: string;
  image: string;
  bio: string;
  socials: {
    linkedin?: string;
    github?: string;
    twitter?: string;
  };
}

export interface TimelineItem {
  year: string;
  title: string;
  description: string;
}
