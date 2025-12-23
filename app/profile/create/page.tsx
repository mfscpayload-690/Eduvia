"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Loader2 } from "lucide-react";

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

export default function CreateProfile() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [requestFacultyAccess, setRequestFacultyAccess] = useState(false);
  const [facultyRequestSent, setFacultyRequestSent] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    college: DEFAULT_COLLEGE,
    mobile: "",
    semester: "",
    year_of_study: "",
    branch: "" as BranchOfStudy | "",
    program_type: "" as ProgramType | ""
  });

  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Handle redirect after success
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.replace("/dashboard");
      }, 1500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [success, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      if (!formData.name || !formData.mobile || !formData.semester ||
        !formData.year_of_study || !formData.branch || !formData.program_type) {
        setError("Please fill in all required fields");
        setLoading(false);
        return;
      }

      console.log("Sending profile data:", formData);

      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          college: formData.college,
          mobile: formData.mobile,
          semester: parseInt(formData.semester),
          year_of_study: parseInt(formData.year_of_study),
          branch: formData.branch,
          program_type: formData.program_type
        })
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to create profile");
      }

      // If user requested faculty access, submit that request
      if (requestFacultyAccess) {
        try {
          const facultyRes = await fetch("/api/admin-requests", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reason: "Faculty access requested during profile creation" })
          });

          if (facultyRes.ok) {
            setFacultyRequestSent(true);
            console.log("Faculty access request submitted successfully");
          } else {
            const facultyData = await facultyRes.json();
            console.warn("Faculty request warning:", facultyData.error);
          }
        } catch (facultyErr) {
          console.warn("Could not submit faculty request:", facultyErr);
        }
      }

      console.log("Profile created successfully!");

      // Update session to reflect profile completion
      await update();

      // Set success to trigger redirect
      setSuccess(true);
      setLoading(false);

    } catch (err) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
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

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="text-neutral-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-neutral-100">Complete Your Profile</CardTitle>
          <CardDescription className="text-neutral-400">
            Welcome! Please fill in your details to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
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

            {/* Faculty Access Request Section */}
            <div className="mt-6 p-4 rounded-xl border border-brand-500/20 bg-brand-500/5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <input
                    type="checkbox"
                    id="facultyRequest"
                    checked={requestFacultyAccess}
                    onChange={(e) => setRequestFacultyAccess(e.target.checked)}
                    className="w-5 h-5 rounded border-neutral-300 text-brand-600 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="facultyRequest" className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 cursor-pointer">
                    <Shield className="w-4 h-4 text-brand-500" />
                    I am a Faculty Member
                  </label>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Check this box to request faculty/admin access. Your request will be reviewed by the platform administrator.
                  </p>
                </div>
              </div>

              {requestFacultyAccess && (
                <div className="mt-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">
                    <strong>Note:</strong> Faculty access requests are manually reviewed. You will start as a student and be promoted once your request is approved.
                  </p>
                </div>
              )}
            </div>

            {/* Success message for faculty request */}
            {facultyRequestSent && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-600 dark:text-green-400 text-sm flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Faculty access request submitted successfully!
              </div>
            )}

            {/* Profile saved success message */}
            {success && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-600 dark:text-green-400 text-sm flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">Profile saved successfully! Redirecting to dashboard...</span>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || success}
              className="w-full bg-gradient-brand hover:opacity-90 text-white py-2.5 gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : success ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Profile Saved!
                </>
              ) : (
                "Complete Profile"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
