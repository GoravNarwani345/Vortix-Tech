import type { Metadata } from "next";
import ContactContent from "./ContactContent";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Vortix Tech for a free consultation. We'd love to discuss your project needs.",
  keywords: ["contact Vortix Tech", "hire software agency", "get a quote web development", "AI consulting contact"],
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact | Vortix Tech",
    description: "Get in touch with Vortix Tech for a free consultation. We'd love to discuss your project needs.",
    url: "https://vortixtech.com/contact",
  }
};

export default function ContactPage() {
  return <ContactContent />;
}
