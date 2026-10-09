"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, ChevronRight, ChevronLeft, X, Layers, ArrowRight, Eye, Play, Video } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { useContactModal } from "@/components/layout/ContactModalContext";
import { isVideoMedia } from "@/lib/mediaHelper";

type Project = {
  id?: string;
  title: string;
  category: string;
  description: string;
  images: string[];
  tags: string;
  liveUrl?: string | null;
  githubUrl?: string | null;
};

export default function PortfolioContent({ projects = [] }: { projects: Project[] }) {
  const [categories, setCategories] = useState<string[]>([
    "All",
    "Web App",
    "Mobile App",
    "AI & Automation",
    "Design & Cloud",
  ]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { openModal } = useContactModal();

  // Handle ESC key and body scroll locking when modal is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedProject(null);
      }
    };
    if (selectedProject) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedProject]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/categories?scope=PORTFOLIO");
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const fetchedNames = json.data.map((c: { name: string }) => c.name);
          const projectCategories = projects.map((p) => p.category).filter(Boolean);
          const combined = ["All", ...fetchedNames, ...projectCategories];
          setCategories(Array.from(new Set(combined)));
        }
      } catch {
        // Keep fallback
      }
    })();
  }, [projects]);

  const filtered =
    activeCategory === "All"
      ? projects
      : projects.filter((p) => p.category?.toLowerCase() === activeCategory.toLowerCase());

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background py-32">
        <div className="absolute top-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-accent text-sm font-bold uppercase tracking-widest">
              Our Portfolio
            </span>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif font-bold text-gray-900 mt-6 mb-8">
              Featured <span className="text-accent">Projects</span>
            </h1>
            <p className="text-gray-600 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
              Explore some of our recent work across web applications, mobile apps, and AI-powered automation solutions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="relative overflow-hidden bg-white py-24 border-y border-gray-100">
        <div className="relative z-10 container-custom">
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeCategory === cat
                    ? "bg-gray-900 text-white shadow-sm"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Projects Grid */}
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <AnimatePresence>
              {filtered.map((project) => (
                <motion.div
                  key={project.id || project.title}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ duration: 0.4 }}
                  onClick={() => {
                    setSelectedProject(project);
                    setActiveImageIndex(0);
                  }}
                  className="premium-card group flex flex-col overflow-hidden bg-white cursor-pointer hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-accent/30"
                >
                  {/* Image Container */}
                  <div className="relative w-full h-64 overflow-hidden bg-gray-100">
                    {/* Hover Quick Preview Action */}
                    <div className="absolute inset-0 bg-black/45 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[2px]">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProject(project);
                          setActiveImageIndex(0);
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-gray-900 font-bold text-xs uppercase tracking-wider shadow-2xl hover:bg-accent hover:text-white transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                      >
                        <Eye size={15} /> Quick Preview
                      </button>
                    </div>
                    
                    {project.images && project.images.length > 0 ? (
                      isVideoMedia(project.images[0]) ? (
                        <div className="relative w-full h-full bg-black">
                          <video
                            src={project.images[0]}
                            muted
                            loop
                            playsInline
                            autoPlay
                            preload="metadata"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
                          />
                          <div className="absolute top-3 left-3 z-20 bg-purple-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                            <Video size={10} /> VIDEO
                          </div>
                        </div>
                      ) : (
                        <img
                          src={project.images[0]}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent/10 to-secondary/10">
                        <span className="text-4xl font-serif font-bold text-accent/60">
                          {project.title?.slice(0, 1) ?? "V"}
                        </span>
                      </div>
                    )}

                    {/* Multiple media indicator */}
                    {project.images && project.images.length > 1 && (
                      <div className="absolute top-3 right-3 z-20 bg-black/70 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                        <Layers size={12} />
                        <span>{project.images.length}</span>
                      </div>
                    )}

                    {/* Overlay Links */}
                    <div className="absolute bottom-3 right-3 z-20 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          title="Visit Live Site"
                          className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          title="View GitHub Repository"
                          className="w-9 h-9 rounded-full bg-white text-gray-900 flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                        >
                          <FaGithub size={16} />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-7 flex flex-col flex-1">
                    <span className="text-xs text-accent font-bold uppercase tracking-widest mb-2.5">
                      {project.category}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-accent transition-colors line-clamp-1">
                      {project.title}
                    </h3>
                    
                    {/* Short in first: 3-line clamp ensures uniform card heights */}
                    <p className="text-gray-600 leading-relaxed text-sm line-clamp-3 mb-6 flex-1">
                      {project.description}
                    </p>

                    {/* Tags preview */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-6">
                      {project.tags &&
                        project.tags
                          .split(",")
                          .map((tag) => tag.trim())
                          .filter(Boolean)
                          .slice(0, 3)
                          .map((tag) => (
                            <span
                              key={tag}
                              className="text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 px-2.5 py-0.5 rounded-md"
                            >
                              {tag}
                            </span>
                          ))}
                      {project.tags &&
                        project.tags.split(",").map((t) => t.trim()).filter(Boolean).length > 3 && (
                          <span className="text-xs text-gray-600 font-medium px-1.5 py-0.5">
                            +{project.tags.split(",").map((t) => t.trim()).filter(Boolean).length - 3} more
                          </span>
                        )}
                    </div>

                    {/* Specific Click Action Button */}
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProject(project);
                          setActiveImageIndex(0);
                        }}
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-900 group-hover:text-accent transition-colors group/btn"
                      >
                        <span>Preview Details</span>
                        <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-50 text-gray-600 border border-gray-200 group-hover:border-accent/30 group-hover:text-accent transition-colors">
                        Case Study
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto text-center py-16"
            >
              <div className="premium-card p-12 bg-white">
                <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                  Projects coming soon
                </h3>
                <p className="text-gray-600 leading-relaxed mb-8">
                  We&apos;re finalizing our case studies. In the meantime, check out our services or get in touch to see our recent work.
                </p>
                <button
                  type="button"
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

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            key="project-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-y-auto bg-black/80 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            onClick={() => setSelectedProject(null)}
          >
            {/* Modal Dialog Content */}
            <motion.div
              key="project-modal-dialog"
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col z-10 border border-gray-100"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center backdrop-blur-sm transition-all shadow-lg hover:scale-105"
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>

              {/* Scrollable Modal Body */}
              <div className="overflow-y-auto flex-1">
                {/* Gallery Header */}
                <div className="relative w-full bg-gray-950 flex flex-col items-center justify-center">
                  {/* Main Media Display */}
                  <div className="relative w-full h-72 sm:h-96 md:h-[440px] flex items-center justify-center overflow-hidden bg-black/90">
                    {selectedProject.images && selectedProject.images.length > 0 ? (
                      (() => {
                        const currentMedia =
                          selectedProject.images[activeImageIndex] || selectedProject.images[0];
                        const isVid = isVideoMedia(currentMedia);

                        return isVid ? (
                          <div key={activeImageIndex} className="w-full h-full flex items-center justify-center bg-black">
                            <video
                              src={currentMedia}
                              controls
                              autoPlay
                              playsInline
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <AnimatePresence mode="wait">
                            <motion.img
                              key={activeImageIndex}
                              src={currentMedia}
                              alt={`${selectedProject.title} screenshot ${activeImageIndex + 1}`}
                              initial={{ opacity: 0, scale: 0.97 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 1.03 }}
                              transition={{ duration: 0.2 }}
                              className="w-full h-full object-contain"
                            />
                          </AnimatePresence>
                        );
                      })()
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent/20 to-secondary/20">
                        <span className="text-6xl font-serif font-bold text-white/50">
                          {selectedProject.title?.slice(0, 1) ?? "V"}
                        </span>
                      </div>
                    )}

                    {/* Prev / Next controls if multiple images */}
                    {selectedProject.images && selectedProject.images.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImageIndex((prev) =>
                              prev > 0 ? prev - 1 : selectedProject.images.length - 1
                            );
                          }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm transition-all shadow-lg hover:scale-110"
                          aria-label="Previous image"
                        >
                          <ChevronLeft size={22} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImageIndex((prev) =>
                              prev < selectedProject.images.length - 1 ? prev + 1 : 0
                            );
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm transition-all shadow-lg hover:scale-110"
                          aria-label="Next image"
                        >
                          <ChevronRight size={22} />
                        </button>

                        <div className="absolute bottom-4 left-4 z-20 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-md">
                          {activeImageIndex + 1} / {selectedProject.images.length} items
                        </div>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Navigation Strip if multiple media */}
                  {selectedProject.images && selectedProject.images.length > 1 && (
                    <div className="w-full bg-gray-900/90 p-3 flex items-center justify-center gap-2 overflow-x-auto border-t border-white/10">
                      {selectedProject.images.map((item, idx) => {
                        const isVidThumb = isVideoMedia(item);

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveImageIndex(idx)}
                            className={`relative w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                              activeImageIndex === idx
                                ? "border-accent scale-105 shadow-md"
                                : "border-transparent opacity-60 hover:opacity-100"
                            }`}
                          >
                            {isVidThumb ? (
                              <div className="w-full h-full relative bg-black flex items-center justify-center">
                                <video
                                  src={item}
                                  muted
                                  preload="metadata"
                                  className="w-full h-full object-cover opacity-70"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Play size={12} fill="white" className="text-white ml-0.5" />
                                </div>
                              </div>
                            ) : (
                              <img
                                src={item}
                                alt={`Thumbnail ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Details Section */}
                <div className="p-6 sm:p-8 md:p-10">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <span className="px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-accent bg-accent/10 border border-accent/20 rounded-full">
                      {selectedProject.category}
                    </span>
                    <div className="flex items-center gap-3">
                      {selectedProject.liveUrl && (
                        <a
                          href={selectedProject.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full bg-accent text-white hover:bg-accent/90 transition-all shadow-sm"
                        >
                          Live Demo <ExternalLink size={14} />
                        </a>
                      )}
                      {selectedProject.githubUrl && (
                        <a
                          href={selectedProject.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full bg-gray-900 text-white hover:bg-black transition-all shadow-sm"
                        >
                          <FaGithub size={14} /> GitHub
                        </a>
                      )}
                    </div>
                  </div>

                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">
                    {selectedProject.title}
                  </h2>

                  {/* Project Overview */}
                  <div className="mb-8">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                      About The Project
                    </h4>
                    <p className="text-gray-700 leading-relaxed text-base whitespace-pre-line">
                      {selectedProject.description}
                    </p>
                  </div>

                  {/* Tech Stack */}
                  {selectedProject.tags && (
                    <div className="mb-8">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                        Technologies & Frameworks
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.tags
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean)
                          .map((tag) => (
                            <span
                              key={tag}
                              className="text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 px-3.5 py-1.5 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* CTA Box */}
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-gray-50 to-blue-50/30 border border-gray-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-8">
                    <div>
                      <h4 className="text-base font-bold text-gray-900 mb-1">
                        Want a project like this built for your business?
                      </h4>
                      <p className="text-sm text-gray-600">
                        Our team can scope, design, and deliver your custom solution in weeks.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProject(null);
                        openModal();
                      }}
                      className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold text-sm rounded-full hover:bg-black hover:shadow-lg transition-all"
                    >
                      Start a Project <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA */}
      <section className="relative overflow-hidden bg-background py-24 sm:py-32">
        <div className="relative z-10 container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-serif font-bold text-gray-900 mb-6">
              Ready to start your project?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              Join the growing list of successful businesses leveraging our
              technology solutions. Let&apos;s build something amazing together.
            </p>
            <button
              type="button"
              onClick={openModal}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 text-white font-bold text-lg rounded-full transition-all duration-300 hover:bg-black hover:shadow-lg"
            >
              Get in Touch <ChevronRight size={20} />
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
