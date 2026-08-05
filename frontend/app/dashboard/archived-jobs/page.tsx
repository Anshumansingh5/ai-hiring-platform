"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import BackButton from "@/app/components/BackButton";

type Job = {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
};

export default function ArchivedJobsPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    setToken(storedToken);
    setRole(storedRole);
    setAuthChecked(true);

    if (!storedToken) {
      router.replace("/");
      return;
    }

    if (storedRole !== "recruiter") {
      router.replace("/dashboard");
      return;
    }

    const fetchArchivedJobs = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/jobs/archived",
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          },
        );
        const data = await response.json();

        if (!response.ok || !data.success) {
          setError(data.message || "Unable to load archived jobs.");
          return;
        }

        setJobs(data.data);
      } catch {
        setError("Unable to load archived jobs. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchArchivedJobs();
  }, [router]);

  const handleRestore = async (jobId: string) => {
    if (!token) {
      router.replace("/");
      return;
    }

    setRestoringId(jobId);
    setActionError("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/jobs/${jobId}/restore`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        setActionError(data.message || "Unable to restore job.");
        return;
      }

      // Restored jobs become active again and move back to My Jobs.
      setJobs((prev) => prev.filter((job) => job._id !== jobId));
      setActionMessage("");
    } catch {
      setActionError("Unable to restore job. Please try again.");
    } finally {
      setRestoringId(null);
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!token) {
      router.replace("/");
      return;
    }

    const confirmed = window.confirm(
      "This job will be permanently deleted.\n\n" +
        "It can only be recovered by the platform administrator within the " +
        "next 7 days.\n\n" +
        "After 7 days, the job and all associated applications will be " +
        "permanently removed.\n\n" +
        "This action cannot be undone.",
    );
    if (!confirmed) return;

    setDeletingId(jobId);
    setActionError("");
    setActionMessage("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/jobs/${jobId}/permanent`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        setActionError(data.message || "Unable to delete job.");
        return;
      }

      setJobs((prev) => prev.filter((job) => job._id !== jobId));
      setActionMessage("Job permanently deleted.");
    } catch {
      setActionError("Unable to delete job. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  if (!authChecked) {
    return null;
  }

  if (!token || role !== "recruiter") {
    return null;
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl">
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-xl shadow-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-none sm:p-10">
          <BackButton />
          <div className="mb-8">
            <p className="text-sm font-medium tracking-wide text-zinc-500 dark:text-zinc-400">
              AI Hiring Platform
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Archived Jobs
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Restore a job to make it active and accept applications again.
            </p>
          </div>

          {actionError && (
            <p className="mb-4 text-sm text-red-600 dark:text-red-400">
              {actionError}
            </p>
          )}

          {actionMessage && (
            <p className="mb-4 text-sm text-emerald-600 dark:text-emerald-400">
              {actionMessage}
            </p>
          )}

          {loading ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Loading archived jobs...
            </p>
          ) : error ? (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : jobs.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No archived jobs.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {jobs.map((job) => (
                <article
                  key={job._id}
                  className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                    {job.title}
                  </h2>
                  <p className="mt-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {job.company}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {job.location}
                  </p>
                  <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {job.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleRestore(job._id)}
                      disabled={restoringId === job._id}
                      className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:border-zinc-400 hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800 dark:focus-visible:outline-zinc-100"
                    >
                      {restoringId === job._id ? "Restoring..." : "Restore"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(job._id)}
                      disabled={deletingId === job._id}
                      className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:border-red-400 hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900 dark:bg-zinc-900 dark:text-red-400 dark:hover:border-red-800 dark:hover:bg-red-950/30 dark:focus-visible:outline-red-500"
                    >
                      {deletingId === job._id
                        ? "Deleting..."
                        : "Delete Permanently"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
