/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();


const testimonials = [
  {
    name: "Jordan P.",
    role: "Business Owner",
    content: "Solid work. They delivered what was promised on time. Would use again.",
    rating: 4,
    isPublished: true,
  },
  {
    name: "Marcus R.",
    role: "Startup Founder",
    content: "Really happy with how the project turned out. Communication was great throughout the process and they understood what I needed without me having to explain it five times.",
    rating: 5,
    isPublished: true,
  },
  {
    name: "Lisa N.",
    role: "Online Store Owner",
    content: "Good job overall. Took a bit longer than expected but the end result was worth the wait.",
    rating: 4,
    isPublished: true,
  },
  {
    name: "Ahmed K.",
    role: "Operations Manager",
    content: "They built an automation system for our team and it's saving us hours every day. Honestly didn't think it would make that big of a difference but it did.",
    rating: 5,
    isPublished: true,
  },
  {
    name: "Sarah M.",
    role: "Small Business Owner",
    content: "I'm not a tech person at all but they were patient and walked me through everything. My site looks professional and I can update it myself now.",
    rating: 5,
    isPublished: true,
  },
  {
    name: "David M.",
    role: "Marketing Manager",
    content: "Decent experience. The design was clean and modern. Had a few back-and-forths on revisions but they were responsive.",
    rating: 3,
    isPublished: true,
  },
  {
    name: "Priya S.",
    role: "Consultant",
    content: "Happy with the work. Clean design, works well on mobile.",
    rating: 4,
    isPublished: true,
  },
  {
    name: "Terrence W.",
    role: "Community Organizer",
    content: "The website captured exactly the vibe we wanted. People have actually told us the site looks better than some major brands. Very satisfied.",
    rating: 5,
    isPublished: true,
  },
  {
    name: "Rachel K.",
    role: "Tech Lead",
    content: "Good developers. Code was clean and well-organized which is rare honestly. Easy to work with.",
    rating: 4,
    isPublished: true,
  },
  {
    name: "Nathan B.",
    role: "Software Engineer",
    content: "Professional team. Met deadlines. The codebase they handed off was maintainable which I appreciated.",
    rating: 4,
    isPublished: true,
  },
  {
    name: "Diana C.",
    role: "Project Manager",
    content: "They handled our project well. A couple of minor delays but nothing major. End product was solid.",
    rating: 3,
    isPublished: true,
  },
];

async function main() {
  console.log(`Seeding ${testimonials.length} testimonials...`);

  for (const t of testimonials) {
    const existing = await prisma.testimonial.findFirst({
      where: { name: t.name, role: t.role },
    });

    if (existing) {
      console.log(`  ✓ Already exists: ${t.name}`);
    } else {
      await prisma.testimonial.create({ data: t });
      console.log(`  + Created: ${t.name}`);
    }
  }

  const total = await prisma.testimonial.count();
  console.log(`\nDone. Total testimonials in database: ${total}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
