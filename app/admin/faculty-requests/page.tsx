"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Check, X, Clock, User, Mail, Phone, Building, Loader2, AlertTriangle } from "lucide-react";
import type { AdminRequest } from "@/lib/types";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export default function FacultyRequestsPage() {
    const { status } = useSession();
    const [requests, setRequests] = useState<AdminRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [filter, setFilter] = useState<StatusFilter>("pending");

    const fetchRequests = async () => {
        try {
            setLoading(true);
            setError(null);
            const url = filter === "all"
                ? "/api/admin-requests"
                : `/api/admin-requests?status=${filter}`;

            const res = await fetch(url);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to fetch requests");
            }

            setRequests(data.requests || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === "authenticated") {
            fetchRequests();
        }
    }, [status, filter]);

    const handleAction = async (requestId: string, action: "approve" | "reject") => {
        try {
            setActionLoading(requestId);
            const res = await fetch(`/api/admin-requests/${requestId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || `Failed to ${action} request`);
            }

            // Refresh the list
            await fetchRequests();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Action failed");
        } finally {
            setActionLoading(null);
        }
    };

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
            </div>
        );
    }

    if (status === "unauthenticated") {
        return (
            <div className="p-8">
                <Card className="glass-card border-destructive/20">
                    <CardContent className="p-6 text-center">
                        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-destructive" />
                        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
                        <p className="text-muted-foreground">You must be signed in to view this page.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Note: The actual super admin check happens on the API side
    // This is just a UI hint - the API will reject non-super-admin requests
    if (error === "Access denied. Super admin only.") {
        return (
            <div className="p-8">
                <Card className="glass-card border-destructive/20">
                    <CardContent className="p-6 text-center">
                        <Shield className="w-12 h-12 mx-auto mb-4 text-destructive" />
                        <h2 className="text-xl font-bold mb-2">Super Admin Only</h2>
                        <p className="text-muted-foreground">This page is restricted to the platform owner.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-heading flex items-center gap-3">
                        <Shield className="w-8 h-8 text-brand-500" />
                        Faculty Access Requests
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Review and manage faculty access requests from users
                    </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 bg-muted/50 p-1 rounded-lg">
                    {(["pending", "approved", "rejected", "all"] as StatusFilter[]).map((s) => (
                        <Button
                            key={s}
                            variant={filter === s ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setFilter(s)}
                            className={filter === s ? "bg-brand-500 hover:bg-brand-600" : ""}
                        >
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Error Display */}
            {error && error !== "Access denied. Super admin only." && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    {error}
                </div>
            )}

            {/* Loading State */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                </div>
            ) : requests.length === 0 ? (
                <Card className="glass-card border-dashed">
                    <CardContent className="p-12 text-center">
                        <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-medium mb-2">
                            No {filter !== "all" ? filter : ""} requests
                        </h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            {filter === "pending"
                                ? "No pending faculty access requests at the moment."
                                : "No requests match this filter."}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {requests.map((req) => (
                        <Card key={req.id} className="glass-card hover:border-brand-500/30 transition-colors">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <CardTitle className="text-lg font-heading flex items-center gap-2">
                                            <User className="w-5 h-5 text-brand-500" />
                                            {req.name}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-2 mt-1">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${req.status === "pending"
                                                ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                                                : req.status === "approved"
                                                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                                    : "bg-red-500/10 text-red-600 dark:text-red-400"
                                                }`}>
                                                {req.status.toUpperCase()}
                                            </span>
                                            <span className="text-xs">
                                                ID: {req.id.slice(0, 8)}...
                                            </span>
                                        </CardDescription>
                                    </div>

                                    {/* Action Buttons (only for pending) */}
                                    {req.status === "pending" && (
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => handleAction(req.id, "approve")}
                                                disabled={actionLoading === req.id}
                                                className="bg-green-600 hover:bg-green-700 gap-1"
                                            >
                                                {actionLoading === req.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Check className="w-4 h-4" />
                                                )}
                                                Approve
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleAction(req.id, "reject")}
                                                disabled={actionLoading === req.id}
                                                className="gap-1"
                                            >
                                                {actionLoading === req.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <X className="w-4 h-4" />
                                                )}
                                                Reject
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent className="pt-0">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Mail className="w-4 h-4 flex-shrink-0" />
                                        <span className="truncate">{req.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Building className="w-4 h-4 flex-shrink-0" />
                                        <span className="truncate">{req.college || "Not specified"}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Phone className="w-4 h-4 flex-shrink-0" />
                                        <span>{req.mobile || "Not specified"}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Clock className="w-4 h-4 flex-shrink-0" />
                                        <span>{new Date(req.created_at).toLocaleString()}</span>
                                    </div>
                                </div>

                                {req.reason && (
                                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                                        <p className="text-sm text-muted-foreground">
                                            <strong>Reason:</strong> {req.reason}
                                        </p>
                                    </div>
                                )}

                                {req.reviewed_at && (
                                    <div className="mt-4 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                                        Reviewed on {new Date(req.reviewed_at).toLocaleString()} by {req.reviewed_by}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
