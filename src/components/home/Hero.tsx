"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Code2,
  Bot,
  HeartPulse,
  ShieldCheck,
  Zap,
  Activity,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useContactModal } from "@/components/layout/ContactModalContext";

type HeroData = {
  badge: string;
  titlePrefix: string;
  titleAccent: string;
  titleSuffix: string;
  subtitlePrefix: string;
  rotatingWords: string[];
  description: string;
  primaryCta: string;
  secondaryCta: string;
};

const DEFAULT_HERO: HeroData = {
  badge: "Full-Stack Engineering · AI Automation · Healthcare Operations · CRM",
  titlePrefix: "We Build",
  titleAccent: "Digital Systems",
  titleSuffix: "That Drive Real Growth",
  subtitlePrefix: "We engineer powerful",
  rotatingWords: [
    "Full-Stack Web & Mobile Apps",
    "AI Agents & Autonomous Workflows",
    "DME & Healthcare Operations",
    "CRM Pipeline Automations",
    "Enterprise n8n & ComfyUI Systems",
    "Cloud Architecture & Scalable APIs",
  ],
  description:
    "From high-performance web applications and AI automations to end-to-end healthcare operations and CRM pipeline management, Vortix Tech builds the digital infrastructure that scales your business.",
  primaryCta: "Get a Quote",
  secondaryCta: "Explore Services",
};

const PILLARS = [
  {
    icon: Code2,
    title: "Software & Mobile",
    subtitle: "Web, Mobile & Cloud Systems",
    tags: ["Next.js", "React Native", "APIs", "DevOps"],
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    hoverBorder: "hover:border-blue-300",
    href: "/services?category=Development",
  },
  {
    icon: Bot,
    title: "AI & Automations",
    subtitle: "Agents, Workflows & LLMs",
    tags: ["AI Agents", "n8n Workflows", "ComfyUI", "RAG"],
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    hoverBorder: "hover:border-purple-300",
    href: "/services?category=AI+%26+Automation",
  },
  {
    icon: HeartPulse,
    title: "Healthcare Ops & CRM",
    subtitle: "DME, PA & Pipeline Ops",
    tags: ["DME Intake", "Insurance PA", "Brightree", "GHL CRM"],
    iconBg: "bg-teal-50",
    iconColor: "text-teal-600",
    hoverBorder: "hover:border-teal-300",
    href: "/services?category=Healthcare+Operations",
  },
];

export default function Hero() {
  const [heroData, setHeroData] = useState<HeroData>(DEFAULT_HERO);
  const [wordIndex, setWordIndex] = useState(0);
  const { openModal } = useContactModal();

  // Fetch dynamic hero config if updated via admin settings
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch("/api/hero");
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && data.hero && isMounted) {
          setHeroData((prev) => ({
            ...prev,
            ...data.hero,
            rotatingWords:
              Array.isArray(data.hero.rotatingWords) && data.hero.rotatingWords.length > 0
                ? data.hero.rotatingWords
                : prev.rotatingWords,
          }));
        }
      } catch {
        // Fall back gracefully
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // Rotating subtitle timer
  useEffect(() => {
    if (!heroData.rotatingWords || heroData.rotatingWords.length === 0) return;
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % heroData.rotatingWords.length);
    }, 2600);
    return () => clearInterval(interval);
  }, [heroData.rotatingWords]);

  const currentRotatingWord =
    heroData.rotatingWords[wordIndex % (heroData.rotatingWords.length || 1)] ||
    heroData.rotatingWords[0];

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-background pt-24 pb-16 sm:pt-28 sm:pb-24">
      {/* Decorative gradient blur in background */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 container-custom text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white text-gray-800 text-xs sm:text-sm font-medium mb-8 shadow-sm"
        >
          <Sparkles size={14} className="text-accent shrink-0" />
          <span>{heroData.badge}</span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-bold tracking-tight mb-6 leading-[1.1] text-gray-900"
        >
          {heroData.titlePrefix} <span className="text-accent">{heroData.titleAccent}</span>
          <br />
          {heroData.titleSuffix}
        </motion.h1>

        {/* Rotating subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="h-12 sm:h-14 flex items-center justify-center mb-6"
        >
          <span className="text-gray-600 text-lg sm:text-2xl mr-2">
            {heroData.subtitlePrefix}
          </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={currentRotatingWord}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="text-accent text-lg sm:text-2xl font-semibold inline-block"
            >
              {currentRotatingWord}
            </motion.span>
          </AnimatePresence>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-gray-600 text-base sm:text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed"
        >
          {heroData.description}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <button
            onClick={openModal}
            className="group flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-semibold rounded-full transition-all duration-300 hover:bg-black hover:shadow-lg text-base sm:text-lg w-full sm:w-auto justify-center"
          >
            {heroData.primaryCta}
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
          <Link
            href="/services"
            className="flex items-center gap-2 px-8 py-4 bg-white border border-gray-200 hover:border-gray-300 text-gray-900 font-semibold rounded-full transition-all duration-300 hover:shadow-sm text-base sm:text-lg w-full sm:w-auto justify-center"
          >
            {heroData.secondaryCta}
          </Link>
        </motion.div>

        {/* Interactive 3-Pillar Capability Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto text-left mb-14"
        >
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <Link
                key={pillar.title}
                href={pillar.href}
                className={`group block p-6 rounded-2xl bg-white border border-gray-100 ${pillar.hoverBorder} shadow-sm hover:shadow-md transition-all duration-300`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl ${pillar.iconBg} flex items-center justify-center transition-transform group-hover:scale-105`}
                  >
                    <Icon size={24} className={pillar.iconColor} />
                  </div>
                  <span className="text-gray-400 group-hover:text-gray-900 transition-colors">
                    <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-accent transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-xs text-gray-500 font-medium mb-4">
                  {pillar.subtitle}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {pillar.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-gray-50 text-gray-700 border border-gray-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </motion.div>

        {/* Trust & Credibility Badges (No Emojis) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-gray-500 font-medium text-xs sm:text-sm"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-accent shrink-0" />
            <span>HIPAA-Ready Protocols & Data Privacy</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-emerald-500 shrink-0" />
            <span>99.8% Workflow & Order Accuracy</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-gray-800 shrink-0" />
            <span>Global Delivery · 24/7 Operations</span>
          </div>
        </motion.div>
      </div>

      {/* Bottom gradient fade for smooth transition */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
