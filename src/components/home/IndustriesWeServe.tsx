"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import {
  Code2,
  Cpu,
  Database,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const verticals = [
  {
    icon: Code2,
    title: "Software Engineering",
    tagline: "Web, Mobile & Cloud",
    description:
      "Full-stack web applications, cross-platform mobile apps, REST/GraphQL APIs, and scalable cloud infrastructure built with Next.js, React Native, and modern DevOps.",
    capabilities: [
      "Next.js & React web applications",
      "React Native mobile apps (iOS & Android)",
      "API development & microservices",
      "UI/UX design & design systems",
      "Docker, AWS & CI/CD pipelines",
    ],
    accentColor: "bg-blue-500",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    borderHover: "hover:border-blue-300",
  },
  {
    icon: Cpu,
    title: "AI & Business Automation",
    tagline: "Workflows, Agents & CRM",
    description:
      "Custom AI agents, LLM-powered chatbots, n8n workflow automations, ComfyUI image/video pipelines, and end-to-end CRM management across GoHighLevel, HubSpot & Salesforce.",
    capabilities: [
      "n8n & API workflow automation",
      "LLM agents, RAG & AI chatbots",
      "ComfyUI image & video generation",
      "CRM pipeline & lead operations",
      "Automated reporting & webhooks",
    ],
    accentColor: "bg-purple-500",
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    borderHover: "hover:border-purple-300",
  },
  {
    icon: Database,
    title: "CRM & Pipeline Operations",
    tagline: "Lead Funnels, Sync & Workflows",
    description:
      "Complete CRM administration, multi-platform setup, automated lead follow-ups, and revenue pipeline operations across GoHighLevel, HubSpot, Salesforce, and custom CRMs.",
    capabilities: [
      "GoHighLevel & HubSpot CRM administration",
      "Lead nurture sequences & instant follow-ups",
      "Deal pipeline tracking & database hygiene",
      "Webhook integrations & custom triggers",
      "Automated KPI dashboards & revenue analytics",
    ],
    accentColor: "bg-emerald-500",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    borderHover: "hover:border-emerald-300",
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function IndustriesWeServe() {
  return (
    <section className="relative overflow-hidden bg-[#FAF7F2] py-24 sm:py-32">
      {/* Subtle decorative blurs */}
      <div className="absolute top-0 left-1/3 w-[30rem] h-[30rem] bg-accent/3 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/3 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 container-custom">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-accent text-sm font-bold uppercase tracking-widest">
            Industries We Serve
          </span>
          <h2 className="text-4xl sm:text-5xl font-serif font-bold text-gray-900 mt-4 mb-6">
            Three Verticals.{" "}
            <span className="text-accent">One Team.</span>
          </h2>
          <div className="w-20 h-1 bg-gray-900 mx-auto rounded-full mb-6" />
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            We bring together software engineering, intelligent automation, and
            end-to-end CRM pipeline operations under one roof — so you get a
            single partner for every digital need.
          </p>
        </motion.div>

        {/* Vertical Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {verticals.map((vertical) => {
            const Icon = vertical.icon;
            return (
              <motion.div
                key={vertical.title}
                variants={cardVariants}
                className={`group relative bg-white rounded-2xl border border-gray-100 ${vertical.borderHover} p-8 sm:p-10 transition-all duration-300 hover:shadow-xl flex flex-col`}
              >
                {/* Top accent bar */}
                <div
                  className={`absolute top-0 left-8 right-8 h-1 ${vertical.accentColor} rounded-b-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />

                {/* Icon + Title */}
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className={`w-14 h-14 rounded-2xl ${vertical.iconBg} flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon size={28} className={vertical.iconColor} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {vertical.title}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium">
                      {vertical.tagline}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed text-[15px] mb-8">
                  {vertical.description}
                </p>

                {/* Capabilities list */}
                <ul className="space-y-3 mb-8 flex-1">
                  {vertical.capabilities.map((cap) => (
                    <li
                      key={cap}
                      className="flex items-start gap-3 text-sm text-gray-700"
                    >
                      <CheckCircle2
                        size={16}
                        className={`${vertical.iconColor} mt-0.5 shrink-0`}
                      />
                      <span>{cap}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 group-hover:text-accent transition-colors"
                >
                  Learn more
                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
