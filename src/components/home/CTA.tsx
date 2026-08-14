"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useContactModal } from "@/components/layout/ContactModalContext";

export default function CTA() {
  const { openModal } = useContactModal();

  return (
    <section className="bg-background py-24 sm:py-32">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-accent/5 rounded-3xl border border-accent/10 relative overflow-hidden"
          style={{ padding: "80px 32px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}
        >
          {/* Background decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

          <div className="relative z-10 w-full max-w-[800px] mx-auto flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/20 bg-white text-accent text-sm font-medium mb-6 shadow-sm">
              <Sparkles size={16} />
              Ready to Start?
            </div>

            <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-6 leading-tight">
              Let's build something <br className="hidden sm:block" />
              <span className="text-accent">amazing together.</span>
            </h2>

            <p className="text-gray-600 text-lg sm:text-xl mb-10 max-w-2xl leading-relaxed">
              Whether you need a full-stack web application, a mobile app, or
              custom AI automation, our team is ready to turn your vision into
              reality.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={openModal}
                className="group flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 text-white font-semibold rounded-full transition-all duration-300 hover:bg-black hover:shadow-lg w-full sm:w-auto text-lg"
              >
                Start a Project
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
