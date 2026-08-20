"use client";

import Link from "next/link";
import { Zap, Mail, Phone, MapPin } from "lucide-react";
import { FaLinkedin, FaGithub, FaWhatsapp } from "react-icons/fa";
import { useContactModal } from "./ContactModalContext";

const footerLinks = {
  services: [
    { label: "App Development", href: "/services" },
    { label: "Web Applications", href: "/services" },
    { label: "n8n Automation", href: "/services" },
    { label: "ComfyUI Workflows", href: "/services" },
    { label: "LLM Solutions", href: "/services" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Blog", href: "/blog" },
  ],
};

export default function Footer() {
  const { openModal } = useContactModal();

  return (
    <footer className="bg-[#FAF7F2] border-t border-gray-200 pt-20 pb-8">
      <div className="max-w-[1280px] mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6 group">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white transition-transform group-hover:scale-105">
                <Zap size={20} className="text-white" />
              </div>
              <span className="text-xl font-serif font-bold text-gray-900 leading-tight">
                Vortix<span className="text-accent">Tech</span>
              </span>
            </Link>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              We build cutting-edge digital solutions powered by AI, automation,
              and modern technologies. Transforming ideas into powerful digital
              experiences.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.linkedin.com/company/vortixtech"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:border-accent hover:text-accent transition-all shadow-sm hover:shadow-md"
                aria-label="LinkedIn"
              >
                <FaLinkedin size={18} />
              </a>
              <a
                href="https://github.com/VortixTech"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:border-accent hover:text-accent transition-all shadow-sm hover:shadow-md"
                aria-label="GitHub"
              >
                <FaGithub size={18} />
              </a>
              <a
                href="https://wa.me/923351283034"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:border-green-500 hover:text-green-500 transition-all shadow-sm hover:shadow-md"
                aria-label="WhatsApp"
              >
                <FaWhatsapp size={18} />
              </a>
            </div>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="text-gray-900 text-sm font-semibold uppercase tracking-wider mb-6">
              Services
            </h3>
            <ul className="flex flex-col gap-3">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-600 text-sm hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-gray-900 text-sm font-semibold uppercase tracking-wider mb-6">
              Company
            </h3>
            <ul className="flex flex-col gap-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-600 text-sm hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  onClick={openModal}
                  className="text-gray-600 text-sm hover:text-accent transition-colors"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-gray-900 text-sm font-semibold uppercase tracking-wider mb-6">
              Contact
            </h3>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <Mail size={16} className="text-accent mt-0.5 shrink-0" />
                <a
                  href="mailto:techvortix@gmail.com"
                  className="text-gray-600 text-sm hover:text-accent transition-colors"
                >
                  techvortix@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={16} className="text-accent mt-0.5 shrink-0" />
                <a
                  href="tel:+923351283034"
                  className="text-gray-600 text-sm hover:text-accent transition-colors"
                >
                  +92 335 1283034
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-accent mt-0.5 shrink-0" />
                <span className="text-gray-600 text-sm">
                  Remote First Agency<br />Global Team
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200 flex flex-wrap justify-between items-center gap-4">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} Vortix Tech. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy-policy" className="text-gray-500 text-xs hover:text-accent transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="text-gray-500 text-xs hover:text-accent transition-colors">
              Terms of Service
            </Link>
            <button
              onClick={() => localStorage.removeItem("vortix_cookie_consent")}
              className="text-gray-500 text-xs hover:text-accent transition-colors underline"
              title="Click to reset cookies and reload"
            >
              Reset Cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
