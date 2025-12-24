"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Loader2 } from "lucide-react";

interface TimeSlot {
  period: number;
  start_time: string;
  end_time: string;
}

interface TimetableCell {
  subject: string;
  faculty: string;
}

interface ScheduleConfig {
  weekdaySlots: TimeSlot[];
  fridaySlots: TimeSlot[];
  weekdayLunch: string;
  fridayLunch: string;
}

interface TimetableData {
  semester: number;
  year: number;
  branch: string;
  schedule_config: ScheduleConfig;
  schedule: {
    Monday: { [period: number]: TimetableCell };
    Tuesday: { [period: number]: TimetableCell };
    Wednesday: { [period: number]: TimetableCell };
    Thursday: { [period: number]: TimetableCell };
    Friday: { [period: number]: TimetableCell };
  };
}

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday"];

const calculateDuration = (start: string, end: string): number => {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
};

export default function TimetablePage() {
  const { data: session } = useSession();
  const [timetable, setTimetable] = useState<TimetableData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTimetable() {
      try {
        // Get user profile for sem/year
        const userRes = await fetch("/api/profile");
        const userData = await userRes.json();

        if (!userData.user?.semester || !userData.user?.year_of_study) {
          setError("Please complete your profile to view timetable");
          setLoading(false);
          return;
        }

        // Fetch timetable for user's sem/year
        const params = new URLSearchParams({
          semester: userData.user.semester.toString(),
          year: userData.user.year_of_study.toString(),
          branch: userData.user.branch || "",
        });

        const response = await fetch(`/api/timetable/grid?${params}`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.error || "Failed to fetch");

        setTimetable(data.timetable);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (session) {
      fetchTimetable();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !timetable) {
    return (
      <div className="space-y-6 p-4 md:p-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Clock className="w-8 h-8 text-blue-500" />
          Timetable
        </h1>
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Clock className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
            <p className="text-neutral-400">
              {error || "No timetable available for your semester yet."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const weekdaySlots = timetable.schedule_config?.weekdaySlots || [];
  const fridaySlots = timetable.schedule_config?.fridaySlots || [];

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Clock className="w-8 h-8 text-blue-500" />
          Timetable
        </h1>
        <p className="text-neutral-400 mt-2">
          Semester {timetable.semester} - Year {timetable.year} ({timetable.branch})
        </p>
      </div>

      {/* Monday - Thursday */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-md font-bold">Monday - Thursday</h2>
            <span className="text-xs text-neutral-500">Lunch: {timetable.schedule_config?.weekdayLunch || "12:10 – 13:10"}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-neutral-300 dark:border-neutral-700 text-sm">
              <thead>
                <tr className="bg-neutral-100 dark:bg-neutral-800">
                  <th className="border border-neutral-300 dark:border-neutral-700 px-3 py-2 font-semibold sticky left-0 bg-neutral-100 dark:bg-neutral-800 z-10 min-w-[60px]">
                    Day
                  </th>
                  {weekdaySlots.map((slot) => {
                    const dur = calculateDuration(slot.start_time, slot.end_time);
                    return (
                      <th key={slot.period} className="border border-neutral-300 dark:border-neutral-700 px-3 py-2 font-semibold min-w-[130px]">
                        <div className="font-bold">P{slot.period}</div>
                        <div className="text-xs font-normal text-neutral-500">
                          {slot.start_time} - {slot.end_time}
                        </div>
                        <div className="text-[10px] text-brand-500 font-semibold">({dur} min)</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {WEEKDAYS.map((day) => {
                  const daySchedule = timetable.schedule[day as keyof typeof timetable.schedule];
                  return (
                    <tr key={day} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition">
                      <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2 font-semibold bg-neutral-50 dark:bg-neutral-900 sticky left-0 z-10">
                        {day.slice(0, 3)}
                      </td>
                      {weekdaySlots.map((slot) => {
                        const cell = daySchedule?.[slot.period];
                        return (
                          <td key={slot.period} className="border border-neutral-300 dark:border-neutral-700 p-2 align-top">
                            {cell ? (
                              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded min-h-[50px]">
                                <div className="font-bold text-xs mb-1">{cell.subject}</div>
                                <div className="text-xs text-neutral-600 dark:text-neutral-400">
                                  {cell.faculty}
                                </div>
                              </div>
                            ) : (
                              <div className="min-h-[50px] flex items-center justify-center text-neutral-300">
                                —
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Friday */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-md font-bold">Friday</h2>
            <span className="text-xs text-neutral-500">Lunch: {timetable.schedule_config?.fridayLunch || "12:30 – 14:00"}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-neutral-300 dark:border-neutral-700 text-sm">
              <thead>
                <tr className="bg-neutral-100 dark:bg-neutral-800">
                  <th className="border border-neutral-300 dark:border-neutral-700 px-3 py-2 font-semibold sticky left-0 bg-neutral-100 dark:bg-neutral-800 z-10 min-w-[60px]">
                    Day
                  </th>
                  {fridaySlots.map((slot) => {
                    const dur = calculateDuration(slot.start_time, slot.end_time);
                    return (
                      <th key={slot.period} className="border border-neutral-300 dark:border-neutral-700 px-3 py-2 font-semibold min-w-[130px]">
                        <div className="font-bold">P{slot.period}</div>
                        <div className="text-xs font-normal text-neutral-500">
                          {slot.start_time} - {slot.end_time}
                        </div>
                        <div className="text-[10px] text-brand-500 font-semibold">({dur} min)</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition">
                  <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2 font-semibold bg-neutral-50 dark:bg-neutral-900 sticky left-0 z-10">
                    Fri
                  </td>
                  {fridaySlots.map((slot) => {
                    const cell = timetable.schedule.Friday?.[slot.period];
                    return (
                      <td key={slot.period} className="border border-neutral-300 dark:border-neutral-700 p-2 align-top">
                        {cell ? (
                          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded min-h-[50px]">
                            <div className="font-bold text-xs mb-1">{cell.subject}</div>
                            <div className="text-xs text-neutral-600 dark:text-neutral-400">
                              {cell.faculty}
                            </div>
                          </div>
                        ) : (
                          <div className="min-h-[50px] flex items-center justify-center text-neutral-300">
                            —
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
