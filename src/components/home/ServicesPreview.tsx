"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Smartphone,
  Globe,
  Workflow,
  Palette,
  Bot,
  Link2,
  PenTool,
  Cloud,
} from "lucide-react";

const services = [
  {
    icon: Smartphone,
    title: "Mobile App Development",
    description:
      "Native-quality cross-platform apps with React Native and Flutter that users love.",
    slug: "app-development",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
  },
  {
    icon: Globe,
    title: "Web Applications",
    description:
      "Full-stack web apps with Next.js, MERN stack, and modern frameworks that scale.",
    slug: "web-applications",
    iconBg: "bg-accent/10",
    iconColor: "text-accent",
  },
  {
    icon: Workflow,
    title: "n8n Automation",
    description:
      "Custom workflow automations that connect your tools and eliminate manual tasks.",
    slug: "n8n-automation",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
  },
  {
    icon: Palette,
    title: "ComfyUI Workflows",
    description:
      "Advanced AI image & video generation pipelines with custom ComfyUI nodes.",
    slug: "comfyui-workflows",
    iconBg: "bg-purple-50",
    iconColor: "text-purple-500",
  },
  {
    icon: Bot,
    title: "LLM Solutions",
    description:
      "Custom AI agents, RAG systems, fine-tuned models, and intelligent chatbots.",
    slug: "llm-solutions",
    iconBg: "bg-green-50",
    iconColor: "text-green-500",
  },
  {
    icon: Link2,
    title: "API Development",
    description:
      "Robust REST & GraphQL APIs, third-party integrations, and microservices.",
    slug: "api-development",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-500",
  },
  {
    icon: PenTool,
    title: "UI/UX Design",
    description:
      "Modern, intuitive interfaces designed with user experience as the top priority.",
    slug: "ui-ux-design",
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-500",
  },
  {
    icon: Cloud,
    title: "Cloud & DevOps",
    description:
      "AWS, Docker, CI/CD pipelines, and infrastructure that keeps you running 24/7.",
    slug: "cloud-devops",
    iconBg: "bg-sky-50",
    iconColor: "text-sky-500",
  },
];

const containerVariants: any = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function ServicesPreview() {
  return (
    <section className="relative overflow-hidden bg-background py-24 sm:py-32">
      <div className="container-custom relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-accent text-sm font-bold uppercase tracking-widest">
            What We Do
          </span>
          <h2 className="text-4xl sm:text-5xl font-serif font-bold text-gray-900 mt-4 mb-6">
            Our Services
          </h2>
          <div className="w-20 h-1 bg-gray-900 mx-auto rounded-full mb-6" />
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            End-to-end digital solutions tailored to your business needs. From
            concept to deployment and beyond.
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {services.map((service) => {
            const Icon = service.icon;
            return (
               <motion.div key={service.slug} variants={cardVariants} className="h-full">
                <Link href={`/services`} className="block h-full">
                  <div className="premium-card group cursor-pointer p-8 h-full flex flex-col items-center text-center">
                    {/* Icon */}
                    <div
                      className={`w-16 h-16 rounded-2xl ${service.iconBg} flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110`}
                    >
                      <Icon size={28} className={service.iconColor} />
                    </div>

                    {/* Content */}
                    <h3 className="text-gray-900 font-bold text-lg mb-3 group-hover:text-accent transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-gray-900 font-bold text-base hover:text-accent transition-colors"
          >
            View All Services <span aria-hidden="true">→</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
