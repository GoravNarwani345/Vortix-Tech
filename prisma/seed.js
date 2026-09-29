/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Starter content. Replace / edit these before going live.
// Run with: npx prisma db seed   (or)   node prisma/seed.js
// ---------------------------------------------------------------------------

async function main() {
  // ---- Blog articles (idempotent by slug) ----
  const articles = [
    {
      slug: "welcome-to-vortix-tech",
      title: "Welcome to Vortix Tech",
      category: "Company",
      author: "Vortix Tech",
      image:
        "https://image.pollinations.ai/prompt/modern%20technology%20abstract?width=1200&height=630&nologo=true",
      excerpt:
        "Introducing Vortix Tech — an AI-first studio building web, mobile, and automation solutions.",
      content:
        "# Welcome to Vortix Tech\n\nWe build web apps, mobile apps, and AI automations that help businesses move faster.\n\n## What we do\n\n- Web & mobile application development\n- n8n and workflow automation\n- LLM solutions, agents, and RAG\n\nGet in touch to start your project.",
      readTime: "3 min read",
      isPublished: true,
    },
  ];

  for (const article of articles) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {},
      create: article,
    });
  }

  // ---- Portfolio projects (only if empty) ----
  const projectCount = await prisma.project.count();
  if (projectCount === 0) {
    await prisma.project.createMany({
      data: [
        {
          title: "Sample SaaS Dashboard",
          category: "Web App",
          images: [],
          description:
            "A placeholder project. Replace this with a real case study in the admin panel.",
          tags: "Next.js, TypeScript, PostgreSQL",
          isPublished: false,
        },
      ],
    });
  }

  // ---- Categories (idempotent by slug) ----
  const categories = [
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

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // ---- Services (idempotent by slug) ----
  const services = [
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

  for (const svc of services) {
    await prisma.service.upsert({
      where: { slug: svc.slug },
      update: {},
      create: svc,
    });
  }

  // ---- Testimonials (only if empty) ----
  const testimonialCount = await prisma.testimonial.count();
  if (testimonialCount === 0) {
    console.log(
      "No testimonials yet — add real client testimonials before launching."
    );
  }

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
