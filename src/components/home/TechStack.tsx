"use client";

import { motion } from "framer-motion";
import { FaReact, FaNodeJs, FaPython, FaDocker, FaAws } from "react-icons/fa";
import {
  SiNextdotjs,
  SiTypescript,
  SiTailwindcss,
  SiPostgresql,
  SiMongodb,
  SiGooglegemini,
} from "react-icons/si";
import { Workflow, Palette, Bot } from "lucide-react";

const technologies = [
  { name: "React", icon: FaReact, color: "#61DAFB" },
  { name: "Next.js", icon: SiNextdotjs, color: "#000000" },
  { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },
  { name: "Node.js", icon: FaNodeJs, color: "#68A063" },
  { name: "Python", icon: FaPython, color: "#3776AB" },
  { name: "Tailwind", icon: SiTailwindcss, color: "#06B6D4" },
  { name: "PostgreSQL", icon: SiPostgresql, color: "#4169E1" },
  { name: "MongoDB", icon: SiMongodb, color: "#47A248" },
  { name: "Docker", icon: FaDocker, color: "#2496ED" },
  { name: "AWS", icon: FaAws, color: "#FF9900" },
  { name: "Gemini", icon: SiGooglegemini, color: "#8E75B2" },
  { name: "n8n", icon: Workflow, color: "#EA4B71" },
  { name: "ComfyUI", icon: Palette, color: "#A855F7" },
  { name: "AI Agents", icon: Bot, color: "#10B981" },
];

export default function TechStack() {
  return (
    <section className="bg-white py-24 border-y border-gray-100 overflow-hidden">
      <div className="container-custom">
        <div className="text-center mb-16">
          <span className="text-accent text-sm font-bold uppercase tracking-widest">
            Our Stack
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mt-4">
            Technologies We Master
          </h2>
        </div>

        {/* Marquee Container */}
        <div className="relative w-full overflow-hidden flex">
          {/* Fading edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          {/* Scrolling Content */}
          <motion.div
            animate={{ x: [0, -1035] }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 30,
            }}
            className="flex gap-8 items-center shrink-0 w-max"
          >
            {[...technologies, ...technologies].map((tech, idx) => {
              const Icon = tech.icon;
              return (
                <div
                  key={`${tech.name}-${idx}`}
                  className="flex flex-col items-center justify-center w-[120px] h-[120px] rounded-2xl bg-[#FAF7F2] border border-gray-100 group transition-all hover:-translate-y-2 hover:shadow-md cursor-pointer"
                >
                  <Icon
                    size={40}
                    style={{ color: tech.color }}
                    className="mb-3 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                  />
                  <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                    {tech.name}
                  </span>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
