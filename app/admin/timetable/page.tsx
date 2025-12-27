"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Save, Trash2, X, CheckCircle, Edit, Clock } from "lucide-react";

interface TimeSlot {
  period: number;
  start_time: string;
  end_time: string;
}

interface TimetableCell {
  subject: string;
  faculty: string;
}

interface DaySchedule {
  [period: number]: TimetableCell;
}

interface TimetableSchedule {
  Monday: DaySchedule;
  Tuesday: DaySchedule;
  Wednesday: DaySchedule;
  Thursday: DaySchedule;
  Friday: DaySchedule;
}

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday"];

const calculateDuration = (start: string, end: string): number => {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
};

const DEFAULT_WEEKDAY_SLOTS: TimeSlot[] = [
  { period: 1, start_time: "09:00", end_time: "10:00" },
  { period: 2, start_time: "10:10", end_time: "11:10" },
  { period: 3, start_time: "11:10", end_time: "12:10" },
  { period: 4, start_time: "13:00", end_time: "14:00" },
  { period: 5, start_time: "14:00", end_time: "15:00" },
  { period: 6, start_time: "15:00", end_time: "16:00" },
];

const DEFAULT_FRIDAY_SLOTS: TimeSlot[] = [
  { period: 1, start_time: "09:00", end_time: "09:50" },
  { period: 2, start_time: "09:50", end_time: "10:50" },
  { period: 3, start_time: "11:00", end_time: "11:45" },
  { period: 4, start_time: "11:45", end_time: "12:30" },
  { period: 5, start_time: "14:00", end_time: "15:00" },
  { period: 6, start_time: "15:00", end_time: "16:00" },
];

const BRANCHES = [
  "Computer Science and Engineering(CS)-CS1",
  "Computer Science and Engineering(CS)-CS2",
  "Computer Science and Engineering(CYBERSECURITY)",
  "Electronics and Communication Engineering (EC)",
  "Electrical and Electronics Engineering (EE)",
  "M.Tech in Computer Science and Engineering(Cyber Forensics and Information Security)",
];

export default function AdminTimetablePage() {
  const [semester, setSemester] = useState(4);
  const [year, setYear] = useState(2);
  const [branch, setBranch] = useState(BRANCHES[0]);
  const [schedule, setSchedule] = useState<TimetableSchedule>({
    Monday: {},
    Tuesday: {},
    Wednesday: {},
    Thursday: {},
    Friday: {},
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [modalData, setModalData] = useState({ day: "", period: 0, subject: "", faculty: "" });
  const [savedTimetables, setSavedTimetables] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Fetch existing timetables on mount
  useEffect(() => {
    fetchSavedTimetables();
  }, []);

  const fetchSavedTimetables = async () => {
    try {
      setLoadingList(true);
      const res = await fetch("/api/timetable/grid?list=true");
      const data = await res.json();
      if (data.success) {
        setSavedTimetables(data.timetables || []);
      }
    } catch (e) {
      console.error("Failed to fetch timetables", e);
    } finally {
      setLoadingList(false);
    }
  };

  const loadTimetable = async (tt: any) => {
    try {
      const res = await fetch(`/api/timetable/grid?semester=${tt.semester}&year=${tt.year}&branch=${encodeURIComponent(tt.branch)}`);
      const data = await res.json();
      if (data.timetable) {
        setSemester(data.timetable.semester);
        setYear(data.timetable.year);
        setBranch(data.timetable.branch);
        setSchedule(data.timetable.schedule || { Monday: {}, Tuesday: {}, Wednesday: {}, Thursday: {}, Friday: {} });
        setEditingId(data.timetable.id);
      }
    } catch (e) {
      console.error("Failed to load timetable", e);
    }
  };

  const deleteTimetable = async (id: string) => {
    if (!confirm("Are you sure you want to delete this timetable?")) return;
    try {
      const res = await fetch(`/api/timetable/grid?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchSavedTimetables();
        if (editingId === id) {
          setEditingId(null);
          setSchedule({ Monday: {}, Tuesday: {}, Wednesday: {}, Thursday: {}, Friday: {} });
        }
      }
    } catch (e) {
      console.error("Failed to delete", e);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setSemester(4);
    setYear(2);
    setBranch(BRANCHES[0]);
    setSchedule({ Monday: {}, Tuesday: {}, Wednesday: {}, Thursday: {}, Friday: {} });
  };

  const openModal = (day: string, period: number) => {
    const existing = schedule[day as keyof TimetableSchedule]?.[period];
    setModalData({
      day,
      period,
      subject: existing?.subject || "",
      faculty: existing?.faculty || "",
    });
    setShowModal(true);
  };

  const saveCell = () => {
    if (!modalData.subject || !modalData.faculty) {
      alert("Please fill in both Subject and Faculty");
      return;
    }
    setSchedule((prev) => ({
      ...prev,
      [modalData.day]: {
        ...prev[modalData.day as keyof TimetableSchedule],
        [modalData.period]: {
          subject: modalData.subject,
          faculty: modalData.faculty,
        },
      },
    }));
    setShowModal(false);
  };

  const deleteCell = (day: string, period: number) => {
    setSchedule((prev) => {
      const newDay = { ...prev[day as keyof TimetableSchedule] };
      delete newDay[period];
      return { ...prev, [day]: newDay };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        semester,
        year,
        branch,
        section: "",
        scheduleConfig: {
          weekdaySlots: DEFAULT_WEEKDAY_SLOTS,
          fridaySlots: DEFAULT_FRIDAY_SLOTS,
          weekdayLunch: "12:10 – 13:00",
          fridayLunch: "12:30 – 14:00",
        },
        schedule,
      };
      const res = await fetch("/api/timetable/grid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      fetchSavedTimetables(); // Refresh list
    } catch (e: any) {
      setError(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Timetable Management</h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">Create and manage timetables in grid format</p>
      </div>

      {/* Saved Timetables Section */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-500" />
              Saved Timetables
            </h2>
            <Button variant="outline" size="sm" onClick={resetForm}>
              <Plus className="w-4 h-4 mr-1" /> New Timetable
            </Button>
          </div>

          {loadingList ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
            </div>
          ) : savedTimetables.length === 0 ? (
            <p className="text-neutral-500 text-sm text-center py-6">No timetables saved yet.</p>
          ) : (
            <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {savedTimetables.map((tt) => (
                <div key={tt.id} className={`flex items-center justify-between py-3 px-2 rounded ${editingId === tt.id ? 'bg-brand-50 dark:bg-brand-900/20' : ''}`}>
                  <div>
                    <span className="font-semibold">S{tt.semester} - Year {tt.year}</span>
                    <span className="text-sm text-neutral-500 ml-2">({tt.branch})</span>
                    {editingId === tt.id && (
                      <span className="ml-2 text-xs bg-brand-500 text-white px-2 py-0.5 rounded">Editing</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => loadTimetable(tt)}>
                      <Edit className="w-4 h-4 mr-1" /> Load
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => deleteTimetable(tt.id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Semester</label>
              <input type="number" value={semester} onChange={(e) => setSemester(Number(e.target.value))} min={1} max={8}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Year</label>
              <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} min={1} max={4}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Branch</label>
              <select value={branch} onChange={(e) => setBranch(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800">
                {BRANCHES.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">S{semester}{branch} - Year {year}</h2>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Timetable
            </Button>
          </div>

          {/* Monday - Thursday */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3 bg-neutral-100 dark:bg-neutral-800 px-4 py-2 rounded-lg">
              <h3 className="text-md font-bold">Monday - Thursday</h3>
              <span className="text-xs text-neutral-500">Lunch: 12:10 – 13:00</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-neutral-300 dark:border-neutral-700 text-sm">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-900">
                    <th className="border border-neutral-300 dark:border-neutral-700 px-3 py-2 font-semibold min-w-[80px]">Day</th>
                    {DEFAULT_WEEKDAY_SLOTS.map((slot) => {
                      const dur = calculateDuration(slot.start_time, slot.end_time);
                      return (
                        <th key={slot.period} className="border border-neutral-300 dark:border-neutral-700 px-3 py-2 font-semibold min-w-[140px]">
                          <div className="font-bold">P{slot.period}</div>
                          <div className="text-xs font-normal text-neutral-600 dark:text-neutral-400">
                            {slot.start_time} - {slot.end_time}
                          </div>
                          <div className="text-[10px] text-brand-500 font-semibold">({dur} min)</div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {WEEKDAYS.map((day) => (
                    <tr key={day} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                      <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2 font-medium bg-neutral-50 dark:bg-neutral-900">
                        {day.slice(0, 3)}
                      </td>
                      {DEFAULT_WEEKDAY_SLOTS.map((slot) => {
                        const cell = schedule[day as keyof TimetableSchedule]?.[slot.period];
                        return (
                          <td key={slot.period} className="border border-neutral-300 dark:border-neutral-700 p-1 align-top">
                            {cell ? (
                              <div className="relative group">
                                <div
                                  onClick={() => openModal(day, slot.period)}
                                  className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded min-h-[60px] cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40 transition"
                                >
                                  <div className="font-semibold text-xs mb-1">{cell.subject}</div>
                                  <div className="text-xs text-neutral-600 dark:text-neutral-400">{cell.faculty}</div>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); deleteCell(day, slot.period); }}
                                  className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl opacity-0 group-hover:opacity-100 transition">
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <button onClick={() => openModal(day, slot.period)}
                                className="w-full h-full min-h-[60px] flex items-center justify-center text-neutral-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition rounded">
                                <Plus className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Friday */}
          <div>
            <div className="flex items-center justify-between mb-3 bg-neutral-100 dark:bg-neutral-800 px-4 py-2 rounded-lg">
              <h3 className="text-md font-bold">Friday</h3>
              <span className="text-xs text-neutral-500">Lunch: 12:30 – 14:00</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-neutral-300 dark:border-neutral-700 text-sm">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-900">
                    <th className="border border-neutral-300 dark:border-neutral-700 px-3 py-2 font-semibold min-w-[80px]">Day</th>
                    {DEFAULT_FRIDAY_SLOTS.map((slot) => {
                      const dur = calculateDuration(slot.start_time, slot.end_time);
                      return (
                        <th key={slot.period} className="border border-neutral-300 dark:border-neutral-700 px-3 py-2 font-semibold min-w-[140px]">
                          <div className="font-bold">P{slot.period}</div>
                          <div className="text-xs font-normal text-neutral-600 dark:text-neutral-400">
                            {slot.start_time} - {slot.end_time}
                          </div>
                          <div className="text-[10px] text-brand-500 font-semibold">({dur} min)</div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                    <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2 font-medium bg-neutral-50 dark:bg-neutral-900">
                      Fri
                    </td>
                    {DEFAULT_FRIDAY_SLOTS.map((slot) => {
                      const cell = schedule.Friday?.[slot.period];
                      return (
                        <td key={slot.period} className="border border-neutral-300 dark:border-neutral-700 p-1 align-top">
                          {cell ? (
                            <div className="relative group">
                              <div
                                onClick={() => openModal("Friday", slot.period)}
                                className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded min-h-[60px] cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40 transition"
                              >
                                <div className="font-semibold text-xs mb-1">{cell.subject}</div>
                                <div className="text-xs text-neutral-600 dark:text-neutral-400">{cell.faculty}</div>
                              </div>
                              <button onClick={(e) => { e.stopPropagation(); deleteCell("Friday", slot.period); }}
                                className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl opacity-0 group-hover:opacity-100 transition">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => openModal("Friday", slot.period)}
                              className="w-full h-full min-h-[60px] flex items-center justify-center text-neutral-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition rounded">
                              <Plus className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        </CardContent>
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {modalData.subject ? "Edit" : "Add"} Class - {modalData.day} P{modalData.period}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Subject Name</label>
                  <input
                    value={modalData.subject}
                    onChange={(e) => setModalData({ ...modalData, subject: e.target.value })}
                    placeholder="e.g. DBMS, Maths, OS"
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Faculty Name</label>
                  <input
                    value={modalData.faculty}
                    onChange={(e) => setModalData({ ...modalData, faculty: e.target.value })}
                    placeholder="e.g. Dr. John, Prof. Jane"
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button onClick={saveCell}>Save</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm animate-in zoom-in-95 duration-200">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                Timetable Saved!
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                S{semester}{branch} - Year {year} has been updated successfully.
              </p>
              <Button onClick={() => setShowSuccess(false)} className="w-full">
                Done
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
