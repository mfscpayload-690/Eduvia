"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Edit2 } from "lucide-react";
import type { Event } from "@/lib/types";

interface EventForm {
  title: string;
  description: string;
  starts_at: string;
  ends_at: string;
}

interface EditingEvent {
  id: string;
  form: EventForm;
}
// Helper to format date for datetime-local input (YYYY-MM-DDTHH:mm)
const formatForInput = (date: Date | string) => {
  const d = new Date(date);
  const offset = d.getTimezoneOffset() * 60000;
  const localIso = new Date(d.getTime() - offset).toISOString();
  return localIso.slice(0, 16);
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<EventForm>({ title: "", description: "", starts_at: "", ends_at: "" });
  const [editing, setEditing] = useState<EditingEvent | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load events");
      setEvents(data.events || []);
    } catch (e: any) {
      setError(e.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        starts_at: new Date(form.starts_at).toISOString(),
        ends_at: new Date(form.ends_at).toISOString(),
      };

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create event");
      setForm({ title: "", description: "", starts_at: "", ends_at: "" });
      await load();
    } catch (e: any) {
      setError(e.message || "Failed to create event");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (event: Event) => {
    setEditing({
      id: event.id,
      form: {
        title: event.title,
        description: event.description,
        starts_at: formatForInput(event.starts_at),
        ends_at: formatForInput(event.ends_at),
      },
    });
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...editing.form,
        starts_at: new Date(editing.form.starts_at).toISOString(),
        ends_at: new Date(editing.form.ends_at).toISOString(),
      };

      const res = await fetch(`/api/events/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update event");
      setEditing(null);
      await load();
    } catch (e: any) {
      setError(e.message || "Failed to update event");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    setDeleting(id);
    setError(null);
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete event");
      setDeleting(null);
      await load();
    } catch (e: any) {
      setError(e.message || "Failed to delete event");
      setDeleting(null);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Events Management</h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">Create and manage campus events.</p>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <h2 className="text-lg font-semibold">Add Event</h2>
          <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Title"
              className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
            <input
              required
              type="datetime-local"
              value={form.starts_at}
              onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
              placeholder="Starts at"
              className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
            <textarea
              required
              className="md:col-span-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Description"
            />
            <input
              required
              type="datetime-local"
              value={form.ends_at}
              onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
              placeholder="Ends at"
              className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="animate-spin h-4 w-4" /> : "Save"}
              </Button>
            </div>
          </form>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Existing Events</h2>
            {loading && <Loader2 className="animate-spin h-4 w-4 text-neutral-500" />}
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {!loading && events.length === 0 && <p className="text-sm text-neutral-500">No events yet.</p>}
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="rounded-lg border border-neutral-200 px-4 py-3 dark:border-neutral-800 flex items-start justify-between"
              >
                <div className="flex-1">
                  <div className="font-semibold">{event.title}</div>
                  <div className="text-sm text-neutral-500">Starts: {new Date(event.starts_at).toLocaleString()}</div>
                  <div className="text-sm text-neutral-500">Ends: {new Date(event.ends_at).toLocaleString()}</div>
                  <div className="text-sm text-neutral-500 line-clamp-2 mt-1">{event.description}</div>
                </div>
                <div className="flex gap-2 ml-4 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(event)}
                    className="p-2 rounded-lg border border-neutral-300 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 transition"
                    aria-label="Edit event"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    disabled={deleting === event.id}
                    className="p-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-500/10 transition disabled:opacity-50"
                    aria-label="Delete event"
                  >
                    {deleting === event.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-4 space-y-4">
              <h2 className="text-lg font-semibold">Edit Event</h2>
              <div className="space-y-3">
                <input
                  value={editing.form.title}
                  onChange={(e) => setEditing({ ...editing, form: { ...editing.form, title: e.target.value } })}
                  placeholder="Title"
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
                <input
                  type="datetime-local"
                  value={editing.form.starts_at}
                  onChange={(e) => setEditing({ ...editing, form: { ...editing.form, starts_at: e.target.value } })}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
                <textarea
                  value={editing.form.description}
                  onChange={(e) => setEditing({ ...editing, form: { ...editing.form, description: e.target.value } })}
                  placeholder="Description"
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
                <input
                  type="datetime-local"
                  value={editing.form.ends_at}
                  onChange={(e) => setEditing({ ...editing, form: { ...editing.form, ends_at: e.target.value } })}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 rounded-lg border border-neutral-300 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {saving ? <Loader2 className="animate-spin h-4 w-4 inline mr-1" /> : "Save"}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
