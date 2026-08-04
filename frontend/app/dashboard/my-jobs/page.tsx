"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Job = {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
};

export default function MyJobsPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

    const fetchJobs = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/jobs", {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          setError(data.message || "Unable to load jobs.");
          return;
        }

        setJobs(data.data);
      } catch {
        setError("Unable to load jobs. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [router]);

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
          <div className="mb-8">
            <p className="text-sm font-medium tracking-wide text-zinc-500 dark:text-zinc-400">
              AI Hiring Platform
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              My Jobs
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Review the roles you have created.
            </p>
          </div>

          {loading ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Loading jobs...
            </p>
          ) : error ? (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : jobs.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No jobs created yet.
              </p>
              <button
                type="button"
                onClick={() => router.push("/dashboard/new-job")}
                className="mt-4 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus-visible:outline-zinc-100"
              >
                Create Job
              </button>
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
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/dashboard/my-jobs/${job._id}/applications`,
                      )
                    }
                    className="mt-4 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:border-zinc-400 hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800 dark:focus-visible:outline-zinc-100"
                  >
                    View Applications
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
