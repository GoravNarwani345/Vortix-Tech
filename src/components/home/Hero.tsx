"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useContactModal } from "@/components/layout/ContactModalContext";

const rotatingWords = [
  "Web Applications",
  "Mobile Apps",
  "n8n Automations",
  "ComfyUI Workflows",
  "LLM Solutions",
  "AI Agents",
];

export default function Hero() {
  const [wordIndex, setWordIndex] = useState(0);
  const { openModal } = useContactModal();

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background pt-20">
      {/* Decorative gradient blur in background */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 container-custom text-center py-20">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white text-gray-800 text-sm font-medium mb-8 shadow-sm"
        >
          <Sparkles size={14} className="text-accent" />
          <span>Transforming Ideas Into Digital Reality</span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-bold tracking-tight mb-6 leading-[1.1] text-gray-900"
        >
          We Build <span className="text-accent">Digital</span>
          <br />
          Solutions That Scale
        </motion.h1>

        {/* Rotating subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="h-12 sm:h-14 flex items-center justify-center mb-8"
        >
          <span className="text-gray-600 text-xl sm:text-2xl mr-2">
            We create powerful
          </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={wordIndex}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="text-accent text-xl sm:text-2xl font-semibold"
            >
              {rotatingWords[wordIndex]}
            </motion.span>
          </AnimatePresence>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-gray-600 text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          From AI-powered solutions to custom automation workflows, we deliver
          cutting-edge technology that scales your business and drives results.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={openModal}
            className="group flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-semibold rounded-full transition-all duration-300 hover:bg-black hover:shadow-lg text-lg w-full sm:w-auto justify-center"
          >
            Get a Quote
            <ArrowRight
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
          <Link
            href="/services"
            className="flex items-center gap-2 px-8 py-4 bg-white border border-gray-200 hover:border-gray-300 text-gray-900 font-semibold rounded-full transition-all duration-300 hover:shadow-sm text-lg w-full sm:w-auto justify-center"
          >
            Explore Services
          </Link>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 text-gray-500 font-medium text-sm"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <span>100+ Projects Delivered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-secondary" />
            <span>50+ Happy Clients</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-800" />
            <span>AI-First Approach</span>
          </div>
        </motion.div>
      </div>

      {/* Bottom gradient fade for smooth transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
