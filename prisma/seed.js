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
