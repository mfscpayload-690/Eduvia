"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, FileText, Calendar, Clock, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type NotificationType = "CLASS_UPDATE" | "NEW_NOTE" | "EVENT" | "LOST_FOUND";

export interface Notification {
    id: string;
    title: string;
    description: string;
    type: NotificationType;
    timestamp: Date;
    read: boolean;
    link?: string;
}



const getIcon = (type: NotificationType) => {
    switch (type) {
        case "CLASS_UPDATE":
            return <Calendar className="h-4 w-4 text-blue-500" />;
        case "NEW_NOTE":
            return <FileText className="h-4 w-4 text-purple-500" />;
        case "EVENT":
            return <Clock className="h-4 w-4 text-amber-500" />;
        case "LOST_FOUND":
            return <Package className="h-4 w-4 text-rose-500" />;
        default:
            return <Bell className="h-4 w-4 text-neutral-500" />;
    }
};

const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
};

export function NotificationCenter() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/notifications");
            const data = await res.json();
            if (data.success) {
                // Convert timestamp strings to Date objects
                const parsed = data.notifications.map((n: any) => ({
                    ...n,
                    timestamp: new Date(n.created_at)
                }));
                setNotifications(parsed);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    // Poll for notifications every 60 seconds
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    // Refresh when opening
    useEffect(() => {
        if (isOpen) fetchNotifications();
    }, [isOpen]);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleMarkAllRead = async () => {
        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));

        try {
            await fetch("/api/notifications", { method: "PATCH" });
        } catch (error) {
            console.error("Failed to mark all read");
            fetchNotifications(); // Revert/Refresh
        }
    };

    const handleNotificationClick = async (id: string, link?: string) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

        // Async call
        fetch(`/api/notifications/${id}`, { method: "PATCH" });

        if (link) {
            window.location.href = link;
            setIsOpen(false);
        }
    };

    return (
        <div className="relative" ref={containerRef}>
            {/* Bell Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                aria-label="Notifications"
            >
                <Bell className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-neutral-950 animate-pulse" />
                )}
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 backdrop-blur-sm">
                            <h3 className="font-semibold text-sm">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                >
                                    <Check className="h-3 w-3" /> Mark all read
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {loading && notifications.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    <div className="animate-spin h-5 w-5 border-2 border-brand-500 border-t-transparent rounded-full mx-auto mb-2" />
                                    <p className="text-xs">Loading updates...</p>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">
                                    <Bell className="h-12 w-12 mx-auto mb-3 opacity-10" />
                                    <p className="font-medium text-sm mb-1">No notifications yet</p>
                                    <p className="text-xs text-neutral-400 dark:text-neutral-500">
                                        You&apos;ll be notified here when classes, notes, or events are updated.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            onClick={() => handleNotificationClick(notification.id, notification.link)}
                                            className={cn(
                                                "p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer flex gap-3 items-start group",
                                                !notification.read && "bg-blue-50/50 dark:bg-blue-900/10"
                                            )}
                                        >
                                            {/* Icon Box */}
                                            <div className={cn(
                                                "mt-1 h-8 w-8 rounded-full flex items-center justify-center shrink-0 border",
                                                !notification.read
                                                    ? "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 shadow-sm"
                                                    : "bg-neutral-100 dark:bg-neutral-800 border-transparent opacity-70"
                                            )}>
                                                {getIcon(notification.type)}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start gap-2">
                                                    <p className={cn(
                                                        "text-sm font-medium leading-none mb-1",
                                                        notification.read ? "text-neutral-700 dark:text-neutral-300" : "text-neutral-900 dark:text-white"
                                                    )}>
                                                        {notification.title}
                                                    </p>
                                                    <span className="text-[10px] text-neutral-400 shrink-0 whitespace-nowrap">
                                                        {getTimeAgo(notification.timestamp)}
                                                    </span>
                                                </div>
                                                <p className={cn(
                                                    "text-xs line-clamp-2",
                                                    notification.read ? "text-neutral-500" : "text-neutral-600 dark:text-neutral-300"
                                                )}>
                                                    {notification.description}
                                                </p>
                                            </div>

                                            {/* Unread Indicator Dot */}
                                            {!notification.read && (
                                                <div className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-2 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-center">
                            <Button variant="ghost" className="w-full h-8 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200">
                                View all notifications
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
