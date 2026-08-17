import type { Metadata } from "next";
import ServicesContent from "./ServicesContent";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Explore our full range of tech services — web development, mobile apps, n8n automation, ComfyUI workflows, LLM solutions, and more.",
  keywords: ["web development services", "mobile app development agency", "n8n automation services", "AI solutions", "LLM integrations"],
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "Services | Vortix Tech",
    description: "Explore our full range of tech services — web development, mobile apps, n8n automation, ComfyUI workflows, LLM solutions, and more.",
    url: "https://vortixtech.com/services",
  }
};

export default function ServicesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "serviceType": "Software Development",
            "provider": {
              "@type": "Organization",
              "name": "Vortix Tech"
            }
          }),
        }}
      />
      <ServicesContent />
    </>
  );
}
