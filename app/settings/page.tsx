"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type BranchOfStudy =
  | "Computer Science and Engineering(CS)"
  | "Computer Science and Engineering(CYBERSECURITY)"
  | "Electronics and Communication Engineering (EC)"
  | "Electrical and Electronics Engineering (EE)"
  | "M.Tech in Computer Science and Engineering(Cyber Forensics and Information Security)";

type ProgramType = "B.Tech" | "M.Tech";

const DEFAULT_COLLEGE = "IHRD College of Engineering Kallooppara";

const BRANCHES: { value: BranchOfStudy; label: string; program: ProgramType }[] = [
  { value: "Computer Science and Engineering(CS)", label: "Computer Science and Engineering (CS)", program: "B.Tech" },
  { value: "Computer Science and Engineering(CYBERSECURITY)", label: "Computer Science and Engineering (CYBERSECURITY)", program: "B.Tech" },
  { value: "Electronics and Communication Engineering (EC)", label: "Electronics and Communication Engineering (EC)", program: "B.Tech" },
  { value: "Electrical and Electronics Engineering (EE)", label: "Electrical and Electronics Engineering (EE)", program: "B.Tech" },
  { value: "M.Tech in Computer Science and Engineering(Cyber Forensics and Information Security)", label: "M.Tech in CS (Cyber Forensics & Information Security)", program: "M.Tech" }
];

export default function Settings() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    college: DEFAULT_COLLEGE,
    mobile: "",
    semester: "",
    year_of_study: "",
    branch: "" as BranchOfStudy | "",
    program_type: "" as ProgramType | "",
    division: "" // CS1 or CS2 for CS branch
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/profile");
        if (!response.ok) throw new Error("Failed to fetch profile");

        const data = await response.json();
        if (data.user) {
          // Parse division from branch if exists (e.g., "Computer Science...-CS1" -> "CS1")
          let storedBranch = data.user.branch || "";
          let division = "";
          if (storedBranch.includes("-CS1") || storedBranch.includes("-CS2")) {
            division = storedBranch.includes("-CS1") ? "CS1" : "CS2";
            storedBranch = storedBranch.replace("-CS1", "").replace("-CS2", "");
          }
          setFormData({
            name: data.user.name || session?.user?.name || "",
            college: DEFAULT_COLLEGE,
            mobile: data.user.mobile || "",
            semester: data.user.semester?.toString() || "",
            year_of_study: data.user.year_of_study?.toString() || "",
            branch: storedBranch as BranchOfStudy,
            program_type: data.user.program_type || "",
            division: division
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setFetchLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, session?.user?.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!formData.name || !formData.mobile || !formData.semester ||
        !formData.year_of_study || !formData.branch || !formData.program_type) {
        setError("Please fill in all required fields");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          college: formData.college,
          mobile: formData.mobile,
          semester: parseInt(formData.semester),
          year_of_study: parseInt(formData.year_of_study),
          // Combine branch + division for CS students
          branch: formData.branch === "Computer Science and Engineering(CS)" && formData.division
            ? `${formData.branch}-${formData.division}`
            : formData.branch,
          program_type: formData.program_type
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update profile");
      }

      // Update session to reflect profile completion
      await update();

      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Delete your account? This will remove your profile and related data. This action cannot be undone."
    );
    if (!confirmed) return;

    setDeleteLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/profile", { method: "DELETE" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete account");
      }

      // Immediately sign the user out and redirect
      await signOut({ callbackUrl: "/auth/signin" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleBranchChange = (branch: BranchOfStudy) => {
    const selectedBranch = BRANCHES.find(b => b.value === branch);
    if (selectedBranch) {
      setFormData(prev => ({
        ...prev,
        branch,
        program_type: selectedBranch.program
      }));
    }
  };

  if (status === "loading" || fetchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="text-neutral-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Settings</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">Manage your profile and account settings</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Profile Information</CardTitle>
            <CardDescription>
              Update your personal details and academic information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100"
                  required
                />
              </div>

              {/* College (Pre-set) */}
              <div>
                <label htmlFor="college" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  College
                </label>
                <input
                  id="college"
                  type="text"
                  value={DEFAULT_COLLEGE}
                  disabled
                  className="w-full px-4 py-2 bg-neutral-100 border border-neutral-300 rounded-lg text-neutral-700 cursor-not-allowed dark:bg-neutral-800/50 dark:border-neutral-700 dark:text-neutral-300"
                />
              </div>

              {/* Email (Pre-filled, read-only) */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={session?.user?.email || ""}
                  disabled
                  className="w-full px-4 py-2 bg-neutral-100 border border-neutral-300 rounded-lg text-neutral-500 cursor-not-allowed dark:bg-neutral-800/50 dark:border-neutral-700 dark:text-neutral-400"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="mobile"
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="Enter your mobile number"
                  className="w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100"
                  required
                />
              </div>

              {/* Branch Selection */}
              <div>
                <label htmlFor="branch" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Branch of Study <span className="text-red-500">*</span>
                </label>
                <select
                  id="branch"
                  value={formData.branch}
                  onChange={(e) => handleBranchChange(e.target.value as BranchOfStudy)}
                  className="w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100"
                  required
                >
                  <option value="">Select your branch</option>
                  {BRANCHES.map(branch => (
                    <option key={branch.value} value={branch.value}>
                      {branch.label} ({branch.program})
                    </option>
                  ))}
                </select>
              </div>

              {/* Division Selection (CS only) */}
              {formData.branch === "Computer Science and Engineering(CS)" && (
                <div>
                  <label htmlFor="division" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Division <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="division"
                    value={formData.division}
                    onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100"
                    required
                  >
                    <option value="">Select your division</option>
                    <option value="CS1">CS1</option>
                    <option value="CS2">CS2</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Year of Study */}
                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Year of Study <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="year"
                    value={formData.year_of_study}
                    onChange={(e) => setFormData({ ...formData, year_of_study: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100"
                    required
                  >
                    <option value="">Select year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>

                {/* Current Semester */}
                <div>
                  <label htmlFor="semester" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Current Semester <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="semester"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100"
                    required
                  >
                    <option value="">Select semester</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
                  {success}
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                  className="flex-1 border-neutral-300 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-red-500 dark:text-red-400">Delete Account</CardTitle>
            <CardDescription>
              Permanently delete your account and related data. This cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-neutral-700 dark:text-neutral-300">
              <p>No user data selling, ads usage, or hidden collection. You can delete your account anytime.</p>
              <p className="text-neutral-400">This will remove your profile and linked data stored in eduvia.</p>
            </div>
            <div className="mt-4">
              <Button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                {deleteLoading ? "Deleting..." : "Delete My Account"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
