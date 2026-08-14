"use client";

import { motion } from "framer-motion";
import { Target, Eye, Heart, Lightbulb } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Innovation First",
    description:
      "We stay at the forefront of technology, adopting the latest tools and frameworks to deliver cutting-edge solutions.",
  },
  {
    icon: Eye,
    title: "Transparency",
    description:
      "Open communication and honest timelines. You always know where your project stands and what comes next.",
  },
  {
    icon: Heart,
    title: "Client-Centric",
    description:
      "Your success is our success. We work as an extension of your team, deeply invested in your goals.",
  },
  {
    icon: Lightbulb,
    title: "Quality Obsessed",
    description:
      "Every line of code, every pixel, every workflow is crafted with precision and tested for reliability.",
  },
];

const team = [
  {
    name: "Gorav Narwani",
    role: "Founder & Lead Developer",
    bio: "Full-stack developer specializing in MERN, Next.js, React Native, and AI implementations. Passionate about building scalable, AI-powered solutions.",
    initials: "GN",
  },
  {
    name: "Raja Hemnani",
    role: "Founder & Strategy",
    bio: "Business strategist and project manager ensuring every project is delivered on time and exceeds client expectations.",
    initials: "RH",
  },
  {
    name: "Ronit Mukhi",
    role: "Founder",
    bio: "Driving the vision and operational excellence of Vortix Tech, ensuring we deliver world-class digital experiences.",
    initials: "RM",
  },
  {
    name: "AI Team",
    role: "AI & Automation Engineers",
    bio: "Our growing team of specialists in LLM development, n8n workflows, ComfyUI pipelines, and cloud infrastructure.",
    initials: "VT",
  },
];

const timeline = [
  {
    year: "2024",
    title: "Vortix Tech Founded",
    description: "Started as a freelance dev shop, quickly growing into a full agency with enterprise clients.",
  },
  {
    year: "2024",
    title: "AI Division Launched",
    description: "Expanded into AI solutions — LLM integrations, custom ComfyUI workflows, and intelligent chatbots.",
  },
  {
    year: "2025",
    title: "50+ Clients Milestone",
    description: "Hit 50+ happy clients across web, mobile, and AI automation projects worldwide.",
  },
  {
    year: "2026",
    title: "Scaling to Enterprise",
    description: "Partnering with enterprises to deliver large-scale AI-powered digital transformations.",
  },
];

export default function AboutContent() {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background py-32">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-[30rem] h-[30rem] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-accent text-sm font-bold uppercase tracking-widest">
              About Us
            </span>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif font-bold text-gray-900 mt-6 mb-8 leading-[1.1]">
              The Team Behind <br className="hidden sm:block" />
              <span className="text-accent">Vortix Tech</span>
            </h1>
            <p className="text-gray-600 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
              We're a passionate team of developers, designers, and AI
              engineers building the future of digital technology. From startups
              to enterprises, we transform ideas into powerful digital
              experiences.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="relative overflow-hidden bg-white py-24 sm:py-32">
        <div className="relative z-10 container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="premium-card p-10 sm:p-12"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-8">
                <Target size={32} className="text-accent" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
                Our Mission
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                To democratize cutting-edge technology by making AI, automation,
                and modern software accessible to businesses of all sizes. We
                believe every company deserves world-class digital tools.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="premium-card p-10 sm:p-12"
            >
              <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mb-8">
                <Eye size={32} className="text-purple-500" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
                Our Vision
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                To become the leading AI-first tech agency in the region,
                recognized for innovation, quality, and transformative impact on
                our clients' businesses.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="relative overflow-hidden bg-background py-24 sm:py-32">
        <div className="relative z-10 container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-accent text-sm font-bold uppercase tracking-widest">
              Our Values
            </span>
            <h2 className="text-4xl sm:text-5xl font-serif font-bold text-gray-900 mt-4 mb-6">
              What Drives Us
            </h2>
            <div className="w-20 h-1 bg-gray-900 mx-auto rounded-full" />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, i) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="premium-card p-8 text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-6">
                    <Icon size={32} className="text-accent" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="relative overflow-hidden bg-white py-24 sm:py-32 border-y border-gray-100">
        <div className="relative z-10 container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-accent text-sm font-bold uppercase tracking-widest">
              Our Team
            </span>
            <h2 className="text-4xl sm:text-5xl font-serif font-bold text-gray-900 mt-4 mb-6">
              Meet the People
            </h2>
            <div className="w-20 h-1 bg-gray-900 mx-auto rounded-full" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="premium-card p-10 text-center flex flex-col items-center"
              >
                <div 
                  className="w-24 h-24 rounded-full bg-accent flex items-center justify-center text-white font-bold text-3xl mb-6 shadow-sm"
                >
                  {member.initials}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-accent font-semibold text-sm mb-4 uppercase tracking-wide">
                  {member.role}
                </p>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {member.bio}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="relative overflow-hidden bg-background py-24 sm:py-32">
        <div className="relative z-10 container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-accent text-sm font-bold uppercase tracking-widest">
              Our Journey
            </span>
            <h2 className="text-4xl sm:text-5xl font-serif font-bold text-gray-900 mt-4 mb-6">
              Company Timeline
            </h2>
            <div className="w-20 h-1 bg-gray-900 mx-auto rounded-full" />
          </motion.div>

          <div className="max-w-3xl mx-auto">
            {timeline.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex gap-8 mb-8"
              >
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-white border-2 border-accent flex items-center justify-center text-accent font-bold shrink-0 shadow-sm">
                    {item.year}
                  </div>
                  {i < timeline.length - 1 && (
                    <div className="w-0.5 flex-1 bg-gray-200 mt-4" />
                  )}
                </div>
                <div className="premium-card p-8 flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
