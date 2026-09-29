"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tags,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Save,
  X,
  Layers,
  Briefcase,
  Server,
  FileText,
  AlertCircle,
  Hash,
} from "lucide-react";
import toast from "react-hot-toast";
import { slugify } from "@/lib/utils";

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  scope: "ALL" | "SERVICES" | "PORTFOLIO" | "BLOG";
  order: number;
  servicesCount: number;
  projectsCount: number;
  createdAt: string;
};

type FormState = {
  id: string | null;
  name: string;
  slug: string;
  description: string;
  scope: "ALL" | "SERVICES" | "PORTFOLIO" | "BLOG";
  order: number;
};

const EMPTY_FORM: FormState = {
  id: null,
  name: "",
  slug: "",
  description: "",
  scope: "ALL",
  order: 0,
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<CategoryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const json = await res.json();
      if (json.success) {
        setCategories(json.data);
      } else {
        toast.error(json.error || "Failed to load categories");
      }
    } catch {
      toast.error("Network error loading categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCategories();
  }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEdit = (cat: CategoryItem) => {
    setForm({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      scope: cat.scope,
      order: cat.order,
    });
    setIsModalOpen(true);
  };

  const handleNameChange = (newName: string) => {
    setForm((prev) => ({
      ...prev,
      name: newName,
      // Auto-update slug only if creating or slug matches previous slugified name
      slug: !prev.id || prev.slug === slugify(prev.name) ? slugify(newName) : prev.slug,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      return toast.error("Category name is required");
    }

    setSaving(true);
    try {
      const isEdit = Boolean(form.id);
      const url = isEdit ? `/api/admin/categories/${form.id}` : "/api/admin/categories";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(isEdit ? "Category updated!" : "Category created!");
        setIsModalOpen(false);
        void fetchCategories();
      } else {
        toast.error(json.error || "Failed to save category");
      }
    } catch {
      toast.error("Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async (force = false) => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/admin/categories/${deleteTarget.id}${force ? "?force=true" : ""}`,
        { method: "DELETE" }
      );
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success("Category deleted");
        setDeleteTarget(null);
        void fetchCategories();
      } else if (json.requiresConfirmation) {
        // Prompt for force delete
        if (confirm(`${json.error}\n\nDo you want to force delete this category anyway?`)) {
          void confirmDelete(true);
          return;
        }
      } else {
        toast.error(json.error || "Failed to delete category");
      }
    } catch {
      toast.error("Failed to delete category");
    } finally {
      setDeleting(false);
    }
  };

  const filteredCategories = categories.filter((c) => {
    if (activeTab === "ALL") return true;
    return c.scope === activeTab || c.scope === "ALL";
  });

  const getScopeBadge = (scope: CategoryItem["scope"]) => {
    switch (scope) {
      case "SERVICES":
        return { label: "Services", color: "bg-blue-50 text-blue-700 border-blue-200" };
      case "PORTFOLIO":
        return { label: "Portfolio", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "BLOG":
        return { label: "Blog", color: "bg-purple-50 text-purple-700 border-purple-200" };
      default:
        return { label: "Universal (All)", color: "bg-indigo-50 text-indigo-700 border-indigo-200" };
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Tags size={22} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
              <p className="text-gray-500 text-sm mt-0.5">
                Manage unified taxonomy across Services, Portfolio, and Articles
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm"
        >
          <Plus size={18} /> Add Category
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-3 overflow-x-auto">
        {[
          { id: "ALL", label: "All Categories" },
          { id: "SERVICES", label: "Services Scope" },
          { id: "PORTFOLIO", label: "Portfolio Scope" },
          { id: "BLOG", label: "Blog Scope" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors shrink-0 ${
              activeTab === tab.id
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 text-gray-400 gap-3">
          <Loader2 size={32} className="animate-spin text-indigo-600" />
          <p className="text-sm">Loading categories...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
            <Tags size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No categories found</h3>
          <p className="text-sm text-gray-500 mt-1 mb-5">
            Add a category to organize your services and portfolio projects.
          </p>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-black"
          >
            <Plus size={16} /> Create Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCategories.map((cat) => {
            const badge = getScopeBadge(cat.scope);
            return (
              <motion.div
                key={cat.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-gray-300 transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">{cat.name}</h3>
                      <span className="text-xs font-mono text-gray-400">/{cat.slug}</span>
                    </div>
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badge.color}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  {cat.description && (
                    <p className="text-xs text-gray-600 line-clamp-2 mt-2 leading-relaxed">
                      {cat.description}
                    </p>
                  )}

                  {/* Usage Counters */}
                  <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Server size={13} className="text-blue-500" />
                      <strong className="text-gray-900">{cat.servicesCount}</strong> Services
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase size={13} className="text-emerald-500" />
                      <strong className="text-gray-900">{cat.projectsCount}</strong> Projects
                    </span>
                    <span className="ml-auto text-[11px] text-gray-400">Order: {cat.order}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => openEdit(cat)}
                    className="p-2 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    title="Edit category"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(cat)}
                    className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete category"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-lg">
                  {form.id ? "Edit Category" : "New Category"}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. AI & Automation"
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
                      placeholder="ai-automation"
                      className="w-full bg-transparent outline-none font-mono text-xs text-gray-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Scope / Section
                    </label>
                    <select
                      value={form.scope}
                      onChange={(e) =>
                        setForm({ ...form, scope: e.target.value as FormState["scope"] })
                      }
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    >
                      <option value="ALL">Universal (All)</option>
                      <option value="SERVICES">Services Only</option>
                      <option value="PORTFOLIO">Portfolio Only</option>
                      <option value="BLOG">Blog Only</option>
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

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Short summary of this category..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
                  />
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
                        <Save size={16} /> Save Category
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
              <h3 className="font-bold text-gray-900 text-lg">Delete Category?</h3>
              <p className="text-sm text-gray-500 mt-1 mb-2">
                Are you sure you want to delete category &ldquo;
                <strong className="text-gray-900">{deleteTarget.name}</strong>&rdquo;?
              </p>

              {(deleteTarget.servicesCount > 0 || deleteTarget.projectsCount > 0) && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 my-3">
                  This category is currently assigned to{" "}
                  <strong>{deleteTarget.servicesCount} service(s)</strong> and{" "}
                  <strong>{deleteTarget.projectsCount} project(s)</strong>.
                </div>
              )}

              <div className="flex items-center justify-end gap-3 mt-6">
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
                  onClick={() => confirmDelete(false)}
                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete Category"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
