import Hero from "@/components/home/Hero";
import ServicesPreview from "@/components/home/ServicesPreview";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import TechStack from "@/components/home/TechStack";
import Testimonials from "@/components/home/Testimonials";
import CTA from "@/components/home/CTA";
import prisma from "@/lib/prisma";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function HomePage() {
  let testimonials: {
    id: string;
    name: string;
    role: string;
    content: string;
    rating: number;
  }[] = [];

  try {
    testimonials = await prisma.testimonial.findMany({
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
    });
  } catch {
    // Database may not be available
  }

  return (
    <>
      <Hero />
      <ServicesPreview />
      <WhyChooseUs />
      <TechStack />
      <Testimonials testimonials={testimonials} />
      <CTA />
    </>
  );
}
