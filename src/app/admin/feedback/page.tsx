"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Loader2, 
  Mail, 
  Search, 
  RefreshCcw,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Feedback = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
};

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/feedback");
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/admin/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setFeedbacks((prev) =>
          prev.map((f) => (f.id === id ? { ...f, status } : f))
        );
        if (selectedFeedback?.id === id) {
          setSelectedFeedback({ ...selectedFeedback, status });
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filteredFeedbacks = feedbacks.filter((f) => 
    f.name.toLowerCase().includes(search.toLowerCase()) || 
    f.email.toLowerCase().includes(search.toLowerCase()) ||
    f.subject.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "New":
        return <span className="px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md text-xs font-semibold">New</span>;
      case "In Progress":
        return <span className="px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md text-xs font-semibold">In Progress</span>;
      case "Resolved":
        return <span className="px-2 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-md text-xs font-semibold">Resolved</span>;
      default:
        return <span className="px-2 py-1 bg-gray-500/10 text-gray-400 border border-gray-500/20 rounded-md text-xs font-semibold">{status}</span>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Feedback & Inquiries</h1>
          <p className="text-foreground-muted text-sm mt-1">Manage contact form submissions</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-64">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-card-bg border border-card-border rounded-xl text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
            />
          </div>
          <button 
            onClick={fetchFeedbacks}
            className="w-full sm:w-auto p-2.5 bg-card-bg border border-card-border rounded-xl text-foreground-muted hover:text-accent hover:border-accent/50 transition-all flex items-center justify-center"
          >
            <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden border border-card-border">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-foreground-muted">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p>Loading feedback...</p>
          </div>
        ) : filteredFeedbacks.length === 0 ? (
          <div className="text-center p-12 text-foreground-muted">
            <Mail size={48} className="mx-auto mb-4 opacity-20" />
            <p>No feedback entries found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-card-border bg-card-border/20">
                  <th className="p-4 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Date</th>
                  <th className="p-4 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Name / Email</th>
                  <th className="p-4 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Subject</th>
                  <th className="p-4 text-xs font-semibold text-foreground-muted uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredFeedbacks.map((item) => (
                  <tr key={item.id} className="border-b border-card-border/50 hover:bg-card-border/10 transition-colors">
                    <td className="p-4 whitespace-nowrap text-sm text-foreground-muted">
                      {format(new Date(item.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-foreground">{item.name}</div>
                      <div className="text-sm text-foreground-muted">{item.email}</div>
                    </td>
                    <td className="p-4 text-sm text-foreground-muted max-w-xs truncate">
                      {item.subject}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedFeedback(item)}
                        className="text-xs font-semibold text-accent hover:text-accent-hover bg-accent/10 hover:bg-accent/20 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedFeedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card-bg border border-card-border rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1">Feedback Details</h2>
                  <p className="text-xs text-foreground-muted">ID: {selectedFeedback.id}</p>
                </div>
                <button
                  onClick={() => setSelectedFeedback(null)}
                  className="p-2 text-foreground-muted hover:text-foreground hover:bg-card-border rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="p-4 rounded-xl bg-background border border-card-border">
                  <p className="text-xs text-foreground-muted uppercase font-semibold mb-1">Contact</p>
                  <p className="font-medium text-foreground">{selectedFeedback.name}</p>
                  <a href={`mailto:${selectedFeedback.email}`} className="text-sm text-accent hover:underline">
                    {selectedFeedback.email}
                  </a>
                </div>
                <div className="p-4 rounded-xl bg-background border border-card-border">
                  <p className="text-xs text-foreground-muted uppercase font-semibold mb-1">Date</p>
                  <p className="font-medium text-foreground">
                    {format(new Date(selectedFeedback.createdAt), "PPP p")}
                  </p>
                </div>
              </div>

              <div className="mb-6 p-5 rounded-xl bg-background border border-card-border">
                <p className="text-xs text-foreground-muted uppercase font-semibold mb-2">Subject</p>
                <p className="font-medium text-foreground mb-4 pb-4 border-b border-card-border">
                  {selectedFeedback.subject}
                </p>
                
                <p className="text-xs text-foreground-muted uppercase font-semibold mb-2">Message</p>
                <p className="text-sm text-foreground-muted whitespace-pre-wrap leading-relaxed">
                  {selectedFeedback.message}
                </p>
              </div>

              <div className="border-t border-card-border pt-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground-muted">Update Status:</span>
                  {getStatusBadge(selectedFeedback.status)}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus(selectedFeedback.id, "New")}
                    disabled={selectedFeedback.status === "New"}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-card-border/50 text-foreground-muted hover:text-foreground disabled:opacity-50 transition-colors"
                  >
                    <Circle size={14} /> New
                  </button>
                  <button
                    onClick={() => updateStatus(selectedFeedback.id, "In Progress")}
                    disabled={selectedFeedback.status === "In Progress"}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 disabled:opacity-50 transition-colors"
                  >
                    <Clock size={14} /> In Progress
                  </button>
                  <button
                    onClick={() => updateStatus(selectedFeedback.id, "Resolved")}
                    disabled={selectedFeedback.status === "Resolved"}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 disabled:opacity-50 transition-colors"
                  >
                    <CheckCircle2 size={14} /> Resolve
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
