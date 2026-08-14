import type { Metadata } from "next";
import ContactContent from "./ContactContent";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Vortix Tech for a free consultation. We'd love to discuss your project needs.",
};

export default function ContactPage() {
  return <ContactContent />;
}
