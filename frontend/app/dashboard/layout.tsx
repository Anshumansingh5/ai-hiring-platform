"use client";

import { useEffect, useState } from "react";

// Temporary role indicator for development/testing only.
const ROLE_LABELS: Record<string, string> = {
  recruiter: "Recruiter",
  candidate: "Candidate",
  admin: "Admin",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(localStorage.getItem("role"));
  }, []);

  const roleLabel = role ? ROLE_LABELS[role] : null;

  return (
    <>
      {roleLabel && (
        <div className="fixed right-4 top-4 z-50 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
          {roleLabel}
        </div>
      )}
      {children}
    </>
  );
}
