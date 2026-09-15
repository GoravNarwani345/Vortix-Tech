"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, Star, Loader2, Save, X, Quote } from "lucide-react";
import toast from "react-hot-toast";

type Testimonial = {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  isPublished: boolean;
  createdAt: string;
};

type FormState = {
  id: string | null;
  name: string;
  role: string;
  content: string;
  rating: number;
  isPublished: boolean;
};

const EMPTY_FORM: FormState = {
  id: null,
  name: "",
  role: "",
  content: "",
  rating: 5,
  isPublished: true,
};

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/admin/testimonials");
        const data = await res.json();
        if (active && data.success) setTestimonials(data.data);
      } catch {
        if (active) toast.error("Failed to load testimonials");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setIsFormOpen(true);
  };

  const openEdit = (t: Testimonial) => {
    setForm({
      id: t.id,
      name: t.name,
      role: t.role,
      content: t.content,
      rating: t.rating,
      isPublished: t.isPublished,
    });
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.content) {
      return toast.error("Name and content are required.");
    }

    setSaving(true);
    try {
      const isEdit = Boolean(form.id);
      const res = await fetch(
        isEdit ? `/api/admin/testimonials/${form.id}` : "/api/admin/testimonials",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            role: form.role,
            content: form.content,
            rating: form.rating,
            isPublished: form.isPublished,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed");

      if (isEdit) {
        setTestimonials((prev) =>
          prev.map((t) => (t.id === form.id ? data.data : t))
        );
        toast.success("Testimonial updated");
      } else {
        setTestimonials((prev) => [data.data, ...prev]);
        toast.success("Testimonial added");
      }
      setIsFormOpen(false);
      setForm(EMPTY_FORM);
    } catch {
      toast.error("Failed to save testimonial");
    } finally {
      setSaving(false);
    }
  };

  const togglePublished = async (t: Testimonial) => {
    try {
      const res = await fetch(`/api/admin/testimonials/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !t.isPublished }),
      });
      const data = await res.json();
      if (data.success) {
        setTestimonials((prev) =>
          prev.map((item) => (item.id === t.id ? data.data : item))
        );
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setTestimonials((prev) => prev.filter((t) => t.id !== id));
        toast.success("Testimonial deleted");
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Testimonials</h1>
          <p className="text-gray-500 mt-1">
            Client quotes shown on the homepage
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl hover:bg-black transition-colors"
        >
          <Plus size={18} /> Add Testimonial
        </button>
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <motion.form
            onSubmit={handleSave}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900 text-lg">
                {form.id ? "Edit Testimonial" : "New Testimonial"}
              </h2>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Client Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                  placeholder="e.g. Jane Cooper"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Role / Company
                </label>
                <input
                  type="text"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                  placeholder="e.g. CEO, Acme Inc."
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Testimonial
              </label>
              <textarea
                required
                rows={3}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all resize-none"
                placeholder="What did the client say about working with you?"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-gray-100">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Rating:</span>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setForm({ ...form, rating: n })}
                      aria-label={`${n} star${n > 1 ? "s" : ""}`}
                    >
                      <Star
                        size={20}
                        className={
                          n <= form.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-300"
                        }
                      />
                    </button>
                  ))}
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(e) =>
                      setForm({ ...form, isPublished: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    Published
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-xl hover:bg-black transition-colors font-semibold disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                Save
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Loader2 className="animate-spin mb-3" size={28} />
            <p>Loading testimonials...</p>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Quote size={40} className="mx-auto mb-4 opacity-20" />
            <p>No testimonials yet. Add your first one!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="p-6 flex flex-col sm:flex-row sm:items-start gap-4 hover:bg-gray-50/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold shrink-0">
                  {t.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-bold text-gray-900">{t.name}</h3>
                    <span className="text-sm text-gray-500">{t.role}</span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        t.isPublished
                          ? "bg-green-50 text-green-600"
                          : "bg-yellow-50 text-yellow-600"
                      }`}
                    >
                      {t.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>
                  <div className="flex gap-0.5 my-2">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className="fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                    {t.content}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => togglePublished(t)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  >
                    {t.isPublished ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    onClick={() => openEdit(t)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
