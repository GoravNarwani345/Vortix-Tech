"use client";

import { motion } from "framer-motion";
import { Star, Quote, MessageSquarePlus } from "lucide-react";
import { useContactModal } from "@/components/layout/ContactModalContext";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
}

export default function Testimonials({
  testimonials = [],
}: {
  testimonials?: Testimonial[];
}) {
  const { openModal } = useContactModal();

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

        {testimonials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={testimonial.id}
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
                  &ldquo;{testimonial.content}&rdquo;
                </p>

                <div className="flex items-center gap-4 relative z-10 mt-auto">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                    {testimonial.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="text-gray-900 font-bold">
                      {testimonial.name}
                    </h4>
                    <p className="text-gray-500 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Empty state — no fake testimonials */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="premium-card p-12 bg-white">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
                <MessageSquarePlus className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                Be our first success story
              </h3>
              <p className="text-gray-600 leading-relaxed mb-8">
                We&apos;re a growing agency putting everything into delivering
                exceptional results. Work with us and your testimonial could be
                featured right here.
              </p>
              <button
                onClick={openModal}
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gray-900 text-white font-semibold rounded-full transition-all duration-300 hover:bg-black hover:shadow-lg"
              >
                Start a Project
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
