"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Smartphone,
  Globe,
  Workflow,
  Palette,
  Bot,
  Link2,
  PenTool,
  Cloud,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { useContactModal } from "@/components/layout/ContactModalContext";

const categories = ["All", "Development", "AI & Automation", "Design & Cloud"];

const services = [
  {
    icon: Smartphone,
    title: "Mobile App Development",
    slug: "app-development",
    category: "Development",
    description:
      "Native-quality cross-platform mobile applications built with React Native.",
    features: [
      "Cross-platform iOS & Android",
      "Native performance",
      "Push notifications & analytics",
      "App Store deployment",
    ],
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
  },
  {
    icon: Globe,
    title: "Web Application Development",
    slug: "web-applications",
    category: "Development",
    description:
      "Full-stack web applications with Next.js, React, Node.js, and modern cloud infrastructure.",
    features: [
      "Next.js & React frontends",
      "Node.js & Express backends",
      "Database design & optimization",
      "SEO & performance optimized",
    ],
    iconBg: "bg-accent/10",
    iconColor: "text-accent",
  },
  {
    icon: Workflow,
    title: "n8n Automation",
    slug: "n8n-automation",
    category: "AI & Automation",
    description:
      "Custom workflow automations that connect your tools, eliminate manual tasks, and save hundreds of hours.",
    features: [
      "Custom n8n workflows",
      "API integrations",
      "Data pipeline automation",
      "CRM & email automation",
    ],
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
  },
  {
    icon: Palette,
    title: "ComfyUI Custom Workflows",
    slug: "comfyui-workflows",
    category: "AI & Automation",
    description:
      "Advanced AI image and video generation pipelines with custom ComfyUI nodes and FLUX/WAN models.",
    features: [
      "Custom ComfyUI nodes",
      "FLUX & WAN model integration",
      "Batch image generation",
      "Video generation pipelines",
    ],
    iconBg: "bg-purple-50",
    iconColor: "text-purple-500",
  },
  {
    icon: Bot,
    title: "LLM Solutions",
    slug: "llm-solutions",
    category: "AI & Automation",
    description:
      "Custom AI agents, RAG systems, fine-tuned models, and intelligent chatbots for your business.",
    features: [
      "Custom AI chatbots",
      "RAG (Retrieval-Augmented Generation)",
      "LLM fine-tuning",
      "AI agent development",
    ],
    iconBg: "bg-green-50",
    iconColor: "text-green-500",
  },
  {
    icon: Link2,
    title: "API Development & Integration",
    slug: "api-development",
    category: "Development",
    description:
      "Robust REST & GraphQL APIs, third-party service integrations, and microservice architecture.",
    features: [
      "REST & GraphQL APIs",
      "Third-party integrations",
      "Microservices architecture",
      "API documentation & testing",
    ],
    iconBg: "bg-rose-50",
    iconColor: "text-rose-500",
  },
  {
    icon: PenTool,
    title: "UI/UX Design",
    slug: "ui-ux-design",
    category: "Design & Cloud",
    description:
      "Modern, intuitive interface design with user experience research, prototyping, and design systems.",
    features: [
      "User research & wireframing",
      "High-fidelity prototypes",
      "Design systems",
      "Responsive design",
    ],
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-500",
  },
  {
    icon: Cloud,
    title: "Cloud & DevOps",
    slug: "cloud-devops",
    category: "Design & Cloud",
    description:
      "AWS deployment, Docker containerization, CI/CD pipelines, and infrastructure management.",
    features: [
      "AWS & cloud deployment",
      "Docker & Kubernetes",
      "CI/CD pipelines",
      "Monitoring & scaling",
    ],
    iconBg: "bg-sky-50",
    iconColor: "text-sky-500",
  },
];

export default function ServicesContent() {
  const [activeCategory, setActiveCategory] = useState("All");
  const { openModal } = useContactModal();

  const filtered =
    activeCategory === "All"
      ? services
      : services.filter((s) => s.category === activeCategory);

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative overflow-hidden bg-background py-32">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-accent text-sm font-bold uppercase tracking-widest">
              What We Offer
            </span>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif font-bold text-gray-900 mt-6 mb-8">
              Our <span className="text-accent">Services</span>
            </h1>
            <p className="text-gray-600 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
              End-to-end digital solutions tailored to your business. From
              concept to deployment and continuous support.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter + Services */}
      <section className="relative overflow-hidden bg-white py-24 border-y border-gray-100">
        <div className="relative z-10 container-custom">
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeCategory === cat
                    ? "bg-gray-900 text-white shadow-sm"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filtered.map((service, i) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  layout
                  className="premium-card group flex flex-col h-full bg-white p-8"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div
                      className={`w-14 h-14 rounded-xl ${service.iconBg} flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110`}
                    >
                      <Icon size={28} className={service.iconColor} />
                    </div>
                    <div>
                      <h3 className="text-gray-900 font-bold text-lg leading-tight mb-2 group-hover:text-accent transition-colors">
                        {service.title}
                      </h3>
                      <span className="text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full">
                        {service.category}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm leading-relaxed mb-8 flex-1">
                    {service.description}
                  </p>

                  {/* Features List */}
                  <ul className="flex flex-col gap-3 mb-8">
                    {service.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-3 text-sm text-gray-600"
                      >
                        <CheckCircle size={16} className="text-accent shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={openModal}
                    className="inline-flex items-center gap-2 text-gray-900 font-bold text-sm hover:text-accent transition-colors mt-auto group/link w-fit"
                  >
                    Get a Quote
                    <ArrowRight
                      size={16}
                      className="group-hover/link:translate-x-1 transition-transform"
                    />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-background py-24 sm:py-32">
        <div className="relative z-10 container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-serif font-bold text-gray-900 mb-6">
              Need a Custom Solution?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              Don't see exactly what you need? We love custom projects.
              Let's discuss your unique requirements.
            </p>
            <button
              onClick={openModal}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 text-white font-bold text-lg rounded-full transition-all duration-300 hover:bg-black hover:shadow-lg"
            >
              Contact Us <ArrowRight size={20} />
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
