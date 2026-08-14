import type { Metadata } from "next";
import ServicesContent from "./ServicesContent";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Explore our full range of tech services — web development, mobile apps, n8n automation, ComfyUI workflows, LLM solutions, and more.",
};

export default function ServicesPage() {
  return <ServicesContent />;
}
