"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useContactModal } from "./ContactModalContext";

const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Blog", href: "/blog" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const { openModal } = useContactModal();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Prevent scroll when mobile menu open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled ? "py-2" : "py-4"
        )}
      >
        {/* Background panel */}
        <div
          className={cn(
            "absolute inset-0 transition-all duration-300",
            isScrolled
              ? "bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm"
              : "bg-transparent"
          )}
        />

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-8">
          <div className="flex items-center justify-between h-[60px]">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white transition-transform group-hover:scale-105">
                <Zap size={20} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-serif font-bold text-gray-900 leading-tight">
                  Vortix<span className="text-accent">Tech</span>
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-full p-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-5 py-2 text-sm font-medium rounded-full transition-all duration-300",
                      isActive
                        ? "bg-white text-accent shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={openModal}
                className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white font-medium text-sm rounded-full transition-all hover:bg-accent hover:shadow-glow group"
              >
                Start Project
                <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Mobile Toggle */}
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden flex items-center justify-center w-11 h-11 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 lg:hidden bg-white/95 backdrop-blur-md pt-[100px]"
          >
            <div className="max-w-[480px] mx-auto px-6">
              <div className="flex flex-col gap-2">
                {navItems.map((item, i) => {
                  const isActive = pathname === item.href;
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                    >
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-xl text-lg transition-all border",
                          isActive
                            ? "font-bold text-accent bg-accent/5 border-accent/10"
                            : "font-medium text-gray-700 bg-transparent border-transparent hover:bg-gray-50 hover:border-gray-100"
                        )}
                      >
                        {item.label}
                        <ChevronRight size={18} className={isActive ? "opacity-100" : "opacity-40"} />
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navItems.length * 0.05 + 0.1 }}
                className="mt-8"
              >
                <button
                  onClick={() => {
                    setIsMobileOpen(false);
                    openModal();
                  }}
                  className="w-full flex items-center justify-center py-4 bg-gray-900 text-white font-bold text-base rounded-xl transition-colors hover:bg-black"
                >
                  Start Your Project
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-10 text-center"
              >
                <p className="text-sm text-gray-500">techvortix@gmail.com</p>
                <p className="text-sm text-gray-500 mt-1">+92 335 1283034</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
