"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Server,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Save,
  X,
  Globe,
  Smartphone,
  Workflow,
  Bot,
  Palette,
  Cloud,
  Database,
  Cpu,
  ShieldCheck,
  Terminal,
  Layers,
  Link2,
  PenTool,
  Sparkles,
  Code,
  Zap,
  CheckCircle2,
  Eye,
  EyeOff,
  AlertCircle,
  Hash,
} from "lucide-react";
import toast from "react-hot-toast";
import { slugify } from "@/lib/utils";

// Icon dictionary for live preview
export const AVAILABLE_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Globe,
  Smartphone,
  Workflow,
  Bot,
  Palette,
  Cloud,
  Database,
  Cpu,
  ShieldCheck,
  Terminal,
  Layers,
  Link2,
  PenTool,
  Sparkles,
  Code,
  Zap,
};

export const COLOR_PRESETS = [
  { label: "Blue", bg: "bg-blue-50", text: "text-blue-500", border: "border-blue-200" },
  { label: "Accent", bg: "bg-accent/10", text: "text-accent", border: "border-accent/30" },
  { label: "Orange", bg: "bg-orange-50", text: "text-orange-500", border: "border-orange-200" },
  { label: "Purple", bg: "bg-purple-50", text: "text-purple-500", border: "border-purple-200" },
  { label: "Green", bg: "bg-emerald-50", text: "text-emerald-500", border: "border-emerald-200" },
  { label: "Rose", bg: "bg-rose-50", text: "text-rose-500", border: "border-rose-200" },
  { label: "Indigo", bg: "bg-indigo-50", text: "text-indigo-500", border: "border-indigo-200" },
  { label: "Sky", bg: "bg-sky-50", text: "text-sky-500", border: "border-sky-200" },
];

type ServiceItem = {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  features: string[];
  icon: string;
  iconBg: string;
  iconColor: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
};

type FormState = {
  id: string | null;
  title: string;
  slug: string;
  category: string;
  description: string;
  features: string[];
  icon: string;
  iconBg: string;
  iconColor: string;
  order: number;
  isPublished: boolean;
};

const EMPTY_FORM: FormState = {
  id: null,
  title: "",
  slug: "",
  category: "Development",
  description: "",
  features: [""],
  icon: "Globe",
  iconBg: "bg-blue-50",
  iconColor: "text-blue-500",
  order: 0,
  isPublished: true,
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [categories, setCategories] = useState<Array<{ name: string; slug: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<ServiceItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [newFeatureText, setNewFeatureText] = useState("");

  const fetchData = async () => {
    try {
      const [servicesRes, categoriesRes] = await Promise.all([
        fetch("/api/admin/services"),
        fetch("/api/admin/categories?scope=SERVICES"),
      ]);

      const servicesJson = await servicesRes.json();
      const categoriesJson = await categoriesRes.json();

      if (servicesJson.success) setServices(servicesJson.data);
      if (categoriesJson.success) setCategories(categoriesJson.data);
    } catch {
      toast.error("Failed to load services data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const openCreate = () => {
    const defaultCat = categories[0]?.name || "Development";
    setForm({
      ...EMPTY_FORM,
      category: defaultCat,
      order: services.length + 1,
      features: [""],
    });
    setNewFeatureText("");
    setIsModalOpen(true);
  };

  const openEdit = (svc: ServiceItem) => {
    setForm({
      id: svc.id,
      title: svc.title,
      slug: svc.slug,
      category: svc.category,
      description: svc.description,
      features: svc.features.length > 0 ? svc.features : [""],
      icon: svc.icon || "Globe",
      iconBg: svc.iconBg || "bg-blue-50",
      iconColor: svc.iconColor || "text-blue-500",
      order: svc.order,
      isPublished: svc.isPublished,
    });
    setNewFeatureText("");
    setIsModalOpen(true);
  };

  const handleTitleChange = (newTitle: string) => {
    setForm((prev) => ({
      ...prev,
      title: newTitle,
      slug: !prev.id || prev.slug === slugify(prev.title) ? slugify(newTitle) : prev.slug,
    }));
  };

  const handleAddFeature = () => {
    const trimmed = newFeatureText.trim();
    if (!trimmed) return;
    setForm((prev) => ({
      ...prev,
      features: [...prev.features.filter(Boolean), trimmed],
    }));
    setNewFeatureText("");
  };

  const handleRemoveFeature = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== idx),
    }));
  };

  const handleTogglePublish = async (svc: ServiceItem) => {
    try {
      const res = await fetch(`/api/admin/services/${svc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !svc.isPublished }),
      });
      if (res.ok) {
        toast.success(svc.isPublished ? "Service unpublished" : "Service published!");
        void fetchData();
      } else {
        toast.error("Failed to update status");
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      return toast.error("Title and description are required");
    }

    const cleanFeatures = form.features.map((f) => f.trim()).filter(Boolean);
    if (newFeatureText.trim()) {
      cleanFeatures.push(newFeatureText.trim());
    }

    setSaving(true);
    try {
      const isEdit = Boolean(form.id);
      const url = isEdit ? `/api/admin/services/${form.id}` : "/api/admin/services";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          features: cleanFeatures,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(isEdit ? "Service updated!" : "Service created!");
        setIsModalOpen(false);
        void fetchData();
      } else {
        toast.error(json.error || "Failed to save service");
      }
    } catch {
      toast.error("Failed to save service");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/services/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Service deleted");
        setDeleteTarget(null);
        void fetchData();
      } else {
        toast.error("Failed to delete service");
      }
    } catch {
      toast.error("Failed to delete service");
    } finally {
      setDeleting(false);
    }
  };

  const filteredServices = services.filter((s) => {
    if (activeCategory === "All") return true;
    return s.category === activeCategory;
  });

  const categoryNames = ["All", ...Array.from(new Set(services.map((s) => s.category)))];

  const IconComponent = AVAILABLE_ICONS[form.icon] || Globe;

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Server size={22} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Services</h1>
              <p className="text-gray-500 text-sm mt-0.5">
                Manage your agency offerings, tech capabilities, and feature deliverables
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm"
        >
          <Plus size={18} /> Add Service
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-3 overflow-x-auto">
        {categoryNames.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors shrink-0 ${
              activeCategory === cat
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 text-gray-400 gap-3">
          <Loader2 size={32} className="animate-spin text-indigo-600" />
          <p className="text-sm">Loading services...</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
            <Server size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No services found</h3>
          <p className="text-sm text-gray-500 mt-1 mb-5">
            Add your engineering and AI services to showcase to clients.
          </p>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-black"
          >
            <Plus size={16} /> Create Service
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map((svc) => {
            const Icon = AVAILABLE_ICONS[svc.icon] || Globe;
            return (
              <motion.div
                key={svc.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-gray-300 transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl ${svc.iconBg || "bg-blue-50"} ${
                          svc.iconColor || "text-blue-500"
                        } flex items-center justify-center shrink-0`}
                      >
                        <Icon size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-base leading-snug">{svc.title}</h3>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 inline-block mt-1">
                          {svc.category}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTogglePublish(svc)}
                      className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                        svc.isPublished
                          ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                          : "text-gray-400 bg-gray-100 hover:bg-gray-200"
                      }`}
                      title={svc.isPublished ? "Published (Click to unpublish)" : "Draft (Click to publish)"}
                    >
                      {svc.isPublished ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed mb-4">
                    {svc.description}
                  </p>

                  {/* Deliverable features */}
                  <div className="space-y-1.5 border-t border-gray-100 pt-3">
                    {svc.features.slice(0, 3).map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                        <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                    {svc.features.length > 3 && (
                      <span className="text-[11px] text-gray-400 pl-5">
                        +{svc.features.length - 3} more deliverables
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 mt-6 pt-3 border-t border-gray-100">
                  <span className="text-[11px] text-gray-400 font-mono">Priority: {svc.order}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(svc)}
                      className="p-2 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="Edit service"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(svc)}
                      className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete service"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-gray-200 overflow-hidden my-8"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl ${form.iconBg} ${form.iconColor} flex items-center justify-center`}
                  >
                    <IconComponent size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {form.id ? "Edit Service" : "New Service"}
                    </h3>
                    <p className="text-xs text-gray-500">Configure service details and deliverables</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Service Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="e.g. Mobile App Development"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      URL Slug
                    </label>
                    <div className="flex items-center px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm">
                      <Hash size={14} className="text-gray-400 mr-1.5 shrink-0" />
                      <input
                        type="text"
                        required
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                        placeholder="app-development"
                        className="w-full bg-transparent outline-none font-mono text-xs text-gray-800"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    >
                      {categories.map((c) => (
                        <option key={c.slug} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                      {/* Fallback option if custom */}
                      {!categories.some((c) => c.name === form.category) && form.category && (
                        <option value={form.category}>{form.category}</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Display Priority Order
                    </label>
                    <input
                      type="number"
                      value={form.order}
                      onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    />
                  </div>
                </div>

                {/* Icon Selection */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Visual Icon & Color Accent
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {Object.keys(AVAILABLE_ICONS).map((iconKey) => {
                      const Icon = AVAILABLE_ICONS[iconKey];
                      const isSelected = form.icon === iconKey;
                      return (
                        <button
                          key={iconKey}
                          type="button"
                          onClick={() => setForm({ ...form, icon: iconKey })}
                          className={`p-2.5 rounded-xl border transition-all ${
                            isSelected
                              ? "bg-gray-900 text-white border-gray-900 shadow-xs scale-105"
                              : "bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200"
                          }`}
                          title={iconKey}
                        >
                          <Icon size={18} />
                        </button>
                      );
                    })}
                  </div>

                  {/* Color Preset Pills */}
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PRESETS.map((preset) => {
                      const isSelected = form.iconBg === preset.bg && form.iconColor === preset.text;
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() =>
                            setForm({ ...form, iconBg: preset.bg, iconColor: preset.text })
                          }
                          className={`text-xs px-3 py-1 rounded-lg border font-medium transition-all ${
                            preset.bg
                          } ${preset.text} ${isSelected ? "ring-2 ring-gray-900" : "opacity-80 hover:opacity-100"}`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Short description of this service and who it's for..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
                  />
                </div>

                {/* Features & Deliverables List */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Key Features & Deliverables
                  </label>
                  <div className="space-y-2 mb-3">
                    {form.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={feat}
                          onChange={(e) => {
                            const updated = [...form.features];
                            updated[i] = e.target.value;
                            setForm({ ...form, features: updated });
                          }}
                          placeholder={`Feature ${i + 1} (e.g. Cross-platform iOS & Android)`}
                          className="flex-1 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(i)}
                          className="p-2 text-gray-400 hover:text-red-500 rounded-lg"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newFeatureText}
                      onChange={(e) => setNewFeatureText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddFeature();
                        }
                      }}
                      placeholder="Add another deliverable and press Enter..."
                      className="flex-1 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddFeature}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* Publish Toggle */}
                <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isPublished}
                      onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    <span className="ml-3 text-sm font-medium text-gray-900">
                      Publish Live on /services & Homepage
                    </span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} /> Save Service
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-200 p-6"
            >
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
                <AlertCircle size={24} />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Delete Service?</h3>
              <p className="text-sm text-gray-500 mt-1 mb-6">
                Are you sure you want to delete service &ldquo;
                <strong className="text-gray-900">{deleteTarget.title}</strong>&rdquo;? This will
                remove it from the public services page and the AI knowledge base.
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete Service"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
