import prisma from "@/lib/prisma";

export interface DefaultCategory {
  name: string;
  slug: string;
  description: string;
  scope: "ALL" | "SERVICES" | "PORTFOLIO" | "BLOG";
  order: number;
}

export interface DefaultService {
  title: string;
  slug: string;
  category: string;
  description: string;
  features: string[];
  icon: string;
  iconBg: string;
  iconColor: string;
  order: number;
  isPublished: boolean;
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  {
    name: "Development",
    slug: "development",
    description: "Full-stack web applications, mobile apps, and microservices.",
    scope: "ALL",
    order: 1,
  },
  {
    name: "AI & Automation",
    slug: "ai-automation",
    description: "Custom AI agents, LLM solutions, n8n workflows, and ComfyUI pipelines.",
    scope: "ALL",
    order: 2,
  },
  {
    name: "Design & Cloud",
    slug: "design-cloud",
    description: "UI/UX product design, cloud infrastructure, Docker, and DevOps.",
    scope: "ALL",
    order: 3,
  },
  {
    name: "Web App",
    slug: "web-app",
    description: "Modern responsive web applications built with Next.js and React.",
    scope: "PORTFOLIO",
    order: 4,
  },
  {
    name: "Mobile App",
    slug: "mobile-app",
    description: "Native-quality mobile applications for iOS & Android with React Native.",
    scope: "PORTFOLIO",
    order: 5,
  },
];

export const DEFAULT_SERVICES: DefaultService[] = [
  {
    title: "Mobile App Development",
    slug: "app-development",
    category: "Development",
    description: "Native-quality cross-platform mobile applications built with React Native.",
    features: [
      "Cross-platform iOS & Android",
      "Native performance",
      "Push notifications & analytics",
      "App Store deployment",
    ],
    icon: "Smartphone",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    order: 1,
    isPublished: true,
  },
  {
    title: "Web Application Development",
    slug: "web-applications",
    category: "Development",
    description: "Full-stack web applications with Next.js, React, Node.js, and modern cloud infrastructure.",
    features: [
      "Next.js & React frontends",
      "Node.js & Express backends",
      "Database design & optimization",
      "SEO & performance optimized",
    ],
    icon: "Globe",
    iconBg: "bg-accent/10",
    iconColor: "text-accent",
    order: 2,
    isPublished: true,
  },
  {
    title: "n8n Automation",
    slug: "n8n-automation",
    category: "AI & Automation",
    description: "Custom workflow automations that connect your tools, eliminate manual tasks, and save hundreds of hours.",
    features: [
      "Custom n8n workflows",
      "API integrations",
      "Data pipeline automation",
      "CRM & email automation",
    ],
    icon: "Workflow",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
    order: 3,
    isPublished: true,
  },
  {
    title: "ComfyUI Custom Workflows",
    slug: "comfyui-workflows",
    category: "AI & Automation",
    description: "Advanced AI image and video generation pipelines with custom ComfyUI nodes and FLUX/WAN models.",
    features: [
      "Custom ComfyUI nodes",
      "FLUX & WAN model integration",
      "Batch image generation",
      "Video generation pipelines",
    ],
    icon: "Palette",
    iconBg: "bg-purple-50",
    iconColor: "text-purple-500",
    order: 4,
    isPublished: true,
  },
  {
    title: "LLM Solutions",
    slug: "llm-solutions",
    category: "AI & Automation",
    description: "Custom AI agents, RAG systems, fine-tuned models, and intelligent chatbots for your business.",
    features: [
      "Custom AI chatbots",
      "RAG (Retrieval-Augmented Generation)",
      "LLM fine-tuning",
      "AI agent development",
    ],
    icon: "Bot",
    iconBg: "bg-green-50",
    iconColor: "text-green-500",
    order: 5,
    isPublished: true,
  },
  {
    title: "API Development & Integration",
    slug: "api-development",
    category: "Development",
    description: "Robust REST & GraphQL APIs, third-party service integrations, and microservice architecture.",
    features: [
      "REST & GraphQL APIs",
      "Third-party integrations",
      "Microservices architecture",
      "API documentation & testing",
    ],
    icon: "Link2",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-500",
    order: 6,
    isPublished: true,
  },
  {
    title: "UI/UX Design",
    slug: "ui-ux-design",
    category: "Design & Cloud",
    description: "Modern, intuitive interface design with user experience research, prototyping, and design systems.",
    features: [
      "User research & wireframing",
      "High-fidelity prototypes",
      "Design systems",
      "Responsive design",
    ],
    icon: "PenTool",
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-500",
    order: 7,
    isPublished: true,
  },
  {
    title: "Cloud & DevOps",
    slug: "cloud-devops",
    category: "Design & Cloud",
    description: "AWS deployment, Docker containerization, CI/CD pipelines, and infrastructure management.",
    features: [
      "AWS & cloud deployment",
      "Docker & Kubernetes",
      "CI/CD pipelines",
      "Monitoring & scaling",
    ],
    icon: "Cloud",
    iconBg: "bg-sky-50",
    iconColor: "text-sky-500",
    order: 8,
    isPublished: true,
  },
];

/**
 * Ensures initial categories and services exist in the database.
 * If empty, seeds them automatically.
 */
export async function ensureSeedData() {
  try {
    // 1. Check & Seed Categories
    // @ts-ignore in case client is not yet regenerated in local environment
    if (prisma.category) {
      // @ts-ignore
      const count = await prisma.category.count();
      if (count === 0) {
        for (const cat of DEFAULT_CATEGORIES) {
          // @ts-ignore
          await prisma.category.create({ data: cat });
        }
      }
    }

    // 2. Check & Seed Services
    // @ts-ignore
    if (prisma.service) {
      // @ts-ignore
      const count = await prisma.service.count();
      if (count === 0) {
        for (const svc of DEFAULT_SERVICES) {
          // @ts-ignore
          await prisma.service.create({ data: svc });
        }
      }
    }
  } catch (error) {
    console.error("Auto-seed error (harmless if offline):", error);
  }
}
