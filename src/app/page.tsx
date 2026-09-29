import Hero from "@/components/home/Hero";
import ServicesPreview from "@/components/home/ServicesPreview";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import TechStack from "@/components/home/TechStack";
import Testimonials from "@/components/home/Testimonials";
import CTA from "@/components/home/CTA";
import prisma from "@/lib/prisma";
import { getCompanyStats } from "@/lib/companyStats";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function HomePage() {
  let testimonials: {
    id: string;
    name: string;
    role: string;
    content: string;
    rating: number;
  }[] = [];

  let stats = undefined;

  try {
    const [dbTestimonials, dbStats] = await Promise.all([
      prisma.testimonial.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          role: true,
          content: true,
          rating: true,
        },
        take: 6,
      }),
      getCompanyStats(),
    ]);

    testimonials = dbTestimonials;
    stats = dbStats;
  } catch {
    // Database or stats may not be available during initial build
  }

  return (
    <>
      <Hero />
      <ServicesPreview />
      <WhyChooseUs initialStats={stats} />
      <TechStack />
      <Testimonials testimonials={testimonials} />
      <CTA />
    </>
  );
}
