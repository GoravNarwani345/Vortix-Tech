"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Shield, Zap, Users, Headphones, CheckCircle2, ArrowRight } from "lucide-react";
import { useContactModal } from "@/components/layout/ContactModalContext";
import { DEFAULT_STATS, type StatItem } from "@/lib/companyStatsTypes";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast Delivery",
    description:
      "We use agile methodologies and modern tools to deliver your project on time, every time without sacrificing quality.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "Best-in-class security practices and code quality standards protect your data and users from day one.",
  },
  {
    icon: Users,
    title: "Dedicated Team",
    description:
      "Work directly with experienced developers and designers who are passionate about bringing your vision to life.",
  },
  {
    icon: Headphones,
    title: "Dedicated Support",
    description:
      "Our relationship doesn't end at launch. We provide ongoing support and maintenance to keep you growing.",
  },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const ref = useRef(null);

  useEffect(() => {
    const animation = animate(count, value, {
      duration: 1.8,
      delay: 0.1,
      ease: "easeOut",
    });
    return animation.stop;
  }, [value, count]);

  return (
    <div ref={ref} className="flex items-center text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
      <motion.span>{rounded}</motion.span>
      <span>{suffix}</span>
    </div>
  );
}

export default function WhyChooseUs({ initialStats }: { initialStats?: StatItem[] }) {
  const [stats, setStats] = useState<StatItem[]>(initialStats || DEFAULT_STATS);
  const { openModal } = useContactModal();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/stats");
        const json = await res.json();
        if (json.success && Array.isArray(json.stats) && json.stats.length > 0) {
          setStats(json.stats);
        }
      } catch {
        // Fallback to initial stats
      }
    })();
  }, []);

  return (
    <section className="bg-[#FAF7F2] py-24 sm:py-32">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left Column: Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-accent text-sm font-bold uppercase tracking-widest">
              Why Vortix Tech
            </span>
            <h2 className="text-4xl sm:text-5xl font-serif font-bold text-gray-900 mt-4 mb-6 leading-tight">
              A partner you can rely on to scale
            </h2>
            <p className="text-gray-600 text-lg mb-10 leading-relaxed">
              We don&apos;t just write code; we build digital businesses and streamline mission-critical operations. 
              Our team combines deep technical engineering with operational domain expertise to deliver solutions that give you a competitive edge.
            </p>

            <div className="space-y-8">
              {features.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div key={idx} className="flex gap-4 group">
                    <div className="mt-1 w-12 h-12 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                      <Icon size={24} className="text-accent" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-accent transition-colors">
                        {feature.title}
                      </h4>
                      <p className="text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Right Column: Dynamic Stats Grid */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 gap-4 sm:gap-6"
          >
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="premium-card p-6 sm:p-8 flex flex-col justify-center bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                <p className="text-gray-500 font-medium text-sm sm:text-base mt-2">
                  {stat.label}
                </p>
              </div>
            ))}

            {/* Interactive Trust & Contact CTA Card */}
            <div
              onClick={openModal}
              className="col-span-2 premium-card p-6 sm:p-8 bg-gray-900 text-white mt-2 relative overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-[1.01]"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  openModal();
                }
              }}
            >
              <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-accent/20 transition-all duration-300">
                  <CheckCircle2 size={32} className="text-accent" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h4 className="text-xl font-bold mb-2 flex items-center justify-center sm:justify-start gap-2 group-hover:text-accent transition-colors">
                    Ready to scale?
                    <ArrowRight size={18} className="text-accent group-hover:translate-x-1.5 transition-transform" />
                  </h4>
                  <p className="text-gray-400 text-sm">
                    Ready to build your next project with a team that cares about quality? Tap to get in touch.
                  </p>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 blur-3xl rounded-full group-hover:bg-accent/40 transition-colors" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
