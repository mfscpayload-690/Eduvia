"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Download, ExternalLink } from "lucide-react";
import type { Note } from "@/lib/types";

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNotes() {
      try {
        const response = await fetch("/api/notes");
        if (!response.ok) throw new Error("Failed to fetch notes");
        const data = await response.json();
        setNotes(data.notes || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchNotes();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-neutral-400">Loading notes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-blue-500" />
          Course Notes
        </h1>
        <p className="text-neutral-400 mt-2">Download or preview course materials</p>
      </div>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-200">
          {error}
        </div>
      )}

      {notes.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <BookOpen className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
            <p className="text-neutral-400">No notes available yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <Card key={note.id} className="hover:border-blue-600 transition-colors">
              <CardHeader>
                <CardTitle className="text-lg line-clamp-2">{note.title}</CardTitle>
                <CardDescription>{note.course}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-neutral-400">
                  {new Date(note.created_at).toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  <Link href={`/notes/${note.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <ExternalLink size={16} />
                      View
                    </Button>
                  </Link>
                  <a href={note.drive_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button size="sm" className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
                      <Download size={16} />
                      Download
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
