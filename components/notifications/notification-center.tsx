"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, X, FileText, Calendar, Search, Trash2 } from "lucide-react";
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

const MOCK_NOTIFICATIONS: Notification[] = [];

// ...

export function NotificationCenter() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

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

    const handleMarkAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const handleNotificationClick = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    return (
        <div className="relative" ref={containerRef}>
            {/* Bell Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
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
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">
                                    <Bell className="h-12 w-12 mx-auto mb-3 opacity-10" />
                                    <p className="font-medium text-sm mb-1">No notifications yet</p>
                                    <p className="text-xs text-neutral-400 dark:text-neutral-500">
                                        You'll be notified here when classes, notes, or events are updated.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            onClick={() => handleNotificationClick(notification.id)}
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
