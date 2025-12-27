"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Search, Plus, Phone, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { LostFoundItem, LostFoundStatus } from "@/lib/types";

type FilterType = "all" | "lost" | "found" | "mine";

export default function LostFoundPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    item_name: "",
    description: "",
    status: "lost" as LostFoundStatus,
    contact: "",
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/lostfound");
      const data = await res.json();
      if (data.success) {
        setItems(data.items);
      }
    } catch (error) {
      console.error("Failed to fetch items", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/lostfound", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowForm(false);
        setFormData({ item_name: "", description: "", status: "lost", contact: "" });
        fetchItems();
      }
    } catch (error) {
      console.error("Failed to submit", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: LostFoundStatus) => {
    try {
      // Optimistic update
      setItems(prev => prev.map(item =>
        item.id === id ? { ...item, status: newStatus } : item
      ));

      await fetch(`/api/lostfound/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (error) {
      console.error("Failed to update status", error);
      fetchItems(); // Revert on error
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      // Optimistic update
      setItems(prev => prev.filter(item => item.id !== id));

      await fetch(`/api/lostfound/${id}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Failed to delete", error);
      fetchItems();
    }
  };

  const filteredItems = items.filter(item => {
    if (activeFilter === "all") return true;
    if (activeFilter === "mine") return item.user_id === session?.user?.id;
    return item.status === activeFilter;
  });

  const getStatusColor = (status: LostFoundStatus) => {
    switch (status) {
      case "lost": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "found": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "claimed": return "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400";
      default: return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-8 min-h-screen bg-neutral-50/50 dark:bg-neutral-900/10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 text-foreground">
            <Heart className="w-8 h-8 text-brand-500 fill-brand-500" />
            Lost & Found
          </h1>
          <p className="text-muted-foreground mt-1">Community driven lost and found board</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Report Item
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {(["all", "lost", "found", "mine"] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeFilter === filter
              ? "bg-brand-500 text-white shadow-md shadow-brand-500/25"
              : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700"
              }`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 rounded-2xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-neutral-800/50 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700">
          <Search className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">No items found</h3>
          <p className="text-neutral-500 dark:text-neutral-400">Try adjusting your filters or report a new item.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden border-neutral-200 dark:border-neutral-800 hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="p-4 pb-2 flex flex-row justify-between items-start space-y-0">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
                {session?.user?.id === item.user_id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-neutral-400 hover:text-red-500 -mt-1 -mr-1"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-4 pt-2 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-brand-500 transition-colors">
                    {item.item_name}
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-1">
                    {item.description}
                  </p>
                </div>

                {/* Contact Info (Always Valid visible for quick access as per request) */}
                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800/50 p-2 rounded-lg">
                  <Phone className="w-4 h-4 text-brand-500" />
                  <span className="font-medium select-all">{item.contact}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  <span>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
                </div>
              </CardContent>

              {/* Owner Actions */}
              {session?.user?.id === item.user_id && item.status !== "claimed" && (
                <CardFooter className="p-3 bg-neutral-50 dark:bg-neutral-800/30">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs gap-2 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/20"
                    onClick={() => handleStatusUpdate(item.id, item.status === 'lost' ? 'found' : 'claimed')}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Mark as {item.status === 'lost' ? 'Found' : 'Claimed'}
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-md animate-in zoom-in-95 duration-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Report an Item</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                  <XCircle className="w-5 h-5 text-neutral-400" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Status Toggles - Replaces Dropdown */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Are you reporting a lost or found item?</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, status: "lost" })}
                      className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${formData.status === "lost"
                        ? "bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 ring-2 ring-red-500/20 shadow-sm"
                        : "border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                        }`}
                    >
                      <Search className="w-4 h-4" />
                      <span className="font-medium">I Lost Something</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, status: "found" })}
                      className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${formData.status === "found"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400 ring-2 ring-emerald-500/20 shadow-sm"
                        : "border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                        }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-medium">I Found Something</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">What is it?</label>
                  <input
                    required
                    placeholder="e.g. Blue Water Bottle, ID Card"
                    className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                    value={formData.item_name}
                    onChange={e => setFormData({ ...formData, item_name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Contact Details</label>
                  <input
                    required
                    placeholder="Phone number or Email address"
                    className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                    value={formData.contact}
                    onChange={e => setFormData({ ...formData, contact: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    required
                    placeholder="Provide details like color, brand, specific location where it was lost/found..."
                    className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent h-24 resize-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white" disabled={submitting}>
                  {submitting ? "Posting..." : "Post Item"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
