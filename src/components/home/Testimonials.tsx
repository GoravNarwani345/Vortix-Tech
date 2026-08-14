"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import Image from "next/image";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "CEO at TechFlow",
    content:
      "Vortix Tech transformed our business operations. The n8n automation they built saved our team over 20 hours a week.",
    rating: 5,
    avatar: "SJ",
  },
  {
    name: "Michael Chen",
    role: "Founder of StartupX",
    content:
      "Their expertise in React Native and Next.js is unmatched. They delivered our MVP two weeks ahead of schedule with flawless code.",
    rating: 5,
    avatar: "MC",
  },
  {
    name: "Elena Rodriguez",
    role: "Head of Digital, RetailPro",
    content:
      "The custom AI LLM solution they implemented for our customer support reduced our response times by 80%. Incredible work.",
    rating: 5,
    avatar: "ER",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-background py-24 sm:py-32 overflow-hidden">
      <div className="container-custom">
        <div className="text-center mb-16">
          <span className="text-accent text-sm font-bold uppercase tracking-widest">
            Client Success
          </span>
          <h2 className="text-4xl sm:text-5xl font-serif font-bold text-gray-900 mt-4 mb-6">
            Loved by our partners
          </h2>
          <div className="w-20 h-1 bg-gray-900 mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="premium-card p-8 bg-white relative"
            >
              <Quote className="absolute top-8 right-8 text-gray-100 w-12 h-12 rotate-180" />
              
              <div className="flex gap-1 mb-6 relative z-10">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="fill-accent text-accent"
                  />
                ))}
              </div>

              <p className="text-gray-700 text-lg leading-relaxed mb-8 relative z-10 font-serif italic">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-4 relative z-10 mt-auto">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="text-gray-900 font-bold">{testimonial.name}</h4>
                  <p className="text-gray-500 text-sm">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
