"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, Loader2 } from "lucide-react";
import type { Event } from "@/lib/types";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
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
    load();
  }, []);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateRange = (start: Date | string, end: Date | string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    // Check if it's the same day
    const isSameDay = startDate.toDateString() === endDate.toDateString();

    if (isSameDay) {
      return formatDate(start);
    }

    // Multi-day event - show range
    const startFormatted = startDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const endFormatted = endDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return `${startFormatted} - ${endFormatted}`;
  };

  const isMultiDayEvent = (start: Date | string, end: Date | string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return startDate.toDateString() !== endDate.toDateString();
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Calendar className="w-8 h-8 text-blue-500" />
          Events
        </h1>
        <p className="text-neutral-400 mt-2">Campus events and activities</p>
      </div>

      {loading && (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" />
            <p className="text-neutral-400 mt-2">Loading events...</p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="pt-6 text-center py-8">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && events.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Calendar className="w-12 h-12 mx-auto text-neutral-400 mb-3" />
            <p className="text-neutral-400">No events yet. Check back soon!</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && events.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {events.map((event) => (
            <Card key={event.id} className="border-neutral-200 dark:border-neutral-800 hover:border-blue-500 dark:hover:border-blue-400 transition">
              <CardContent className="pt-6 space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {event.title}
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    {event.description}
                  </p>
                </div>

                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span>{formatDateRange(event.starts_at, event.ends_at)}</span>
                  </div>
                  {!isMultiDayEvent(event.starts_at, event.ends_at) && (
                    <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span>
                        {formatTime(event.starts_at)} - {formatTime(event.ends_at)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
