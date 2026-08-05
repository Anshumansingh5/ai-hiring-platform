"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import BackButton from "@/app/components/BackButton";

const controlClassName =
  "block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-400 dark:focus:ring-zinc-400/10";

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
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [search, setSearch] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [sort, setSort] = useState("newest");
  const [companies, setCompanies] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);

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

    // Build the Company / Location dropdown options from the recruiter's full
    // active-jobs list (unfiltered), so the options stay stable while filtering.
    const fetchFilterOptions = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/jobs", {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });
        const data = await response.json();
        if (!response.ok || !data.success) return;

        const jobsData: Job[] = data.data;
        setCompanies(
          Array.from(new Set(jobsData.map((job) => job.company))).sort(),
        );
        setLocations(
          Array.from(new Set(jobsData.map((job) => job.location))).sort(),
        );
      } catch {
        // Filter options are best-effort; ignore failures here.
      }
    };

    fetchFilterOptions();
  }, [router]);

  // Fetch (and re-fetch) results whenever a filter changes. Debounced so
  // typing in the search box doesn't fire a request on every keystroke.
  useEffect(() => {
    if (!token) return;

    const fetchJobs = async () => {
      // `searching` drives a small inline indicator; it never hides the list.
      setSearching(true);
      setError("");

      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (company) params.set("company", company);
        if (location) params.set("location", location);
        if (sort) params.set("sort", sort);

        const queryString = params.toString();
        const url = `http://localhost:5000/api/jobs${
          queryString ? `?${queryString}` : ""
        }`;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          // Keep the previous results on screen; just surface the error.
          setError(data.message || "Unable to load jobs.");
          return;
        }

        // Swap the list in only after a successful response, so the previous
        // results stay visible (no flicker) while the request is in flight.
        setJobs(data.data);
      } catch {
        setError("Unable to load jobs. Please try again.");
      } finally {
        setSearching(false);
        // Clears the initial full-page loading after the first fetch; it is
        // never set back to true, so searches don't trigger it again.
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchJobs, 500);
    return () => clearTimeout(timer);
  }, [token, search, company, location, sort]);

  const handleArchive = async (jobId: string) => {
    if (!token) {
      router.replace("/");
      return;
    }

    const confirmed = window.confirm(
      "Archive this job?\n\n" +
        "• The job will no longer accept new applications.\n" +
        "• Existing applications remain available.\n" +
        "• You can restore this job later.",
    );
    if (!confirmed) return;

    setArchivingId(jobId);
    setActionError("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/jobs/${jobId}/archive`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        setActionError(data.message || "Unable to archive job.");
        return;
      }

      // Archived jobs no longer belong in the (active-only) My Jobs list.
      setJobs((prev) => prev.filter((job) => job._id !== jobId));
    } catch {
      setActionError("Unable to archive job. Please try again.");
    } finally {
      setArchivingId(null);
    }
  };

  if (!authChecked) {
    return null;
  }

  if (!token || role !== "recruiter") {
    return null;
  }

  const hasActiveFilters = Boolean(search || company || location);

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
              My Jobs
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Review the roles you have created.
            </p>
            <button
              type="button"
              onClick={() => router.push("/dashboard/archived-jobs")}
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-zinc-600 transition hover:text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 dark:focus-visible:outline-zinc-100"
            >
              View archived jobs <span aria-hidden="true">&rarr;</span>
            </button>
          </div>

          <div className="mb-6 space-y-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or company..."
              className={controlClassName}
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <select
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                aria-label="Filter by company"
                className={controlClassName}
              >
                <option value="">All companies</option>
                {companies.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                aria-label="Filter by location"
                className={controlClassName}
              >
                <option value="">All locations</option>
                {locations.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label="Sort order"
                className={controlClassName}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
            {searching && !loading && (
              <p
                className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400"
                aria-live="polite"
              >
                <span
                  className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-700 dark:border-t-zinc-300"
                  aria-hidden="true"
                />
                Searching...
              </p>
            )}
            {!searching && error && jobs.length > 0 && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>

          {actionError && (
            <p className="mb-4 text-sm text-red-600 dark:text-red-400">
              {actionError}
            </p>
          )}

          {loading ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Loading jobs...
            </p>
          ) : error && jobs.length === 0 ? (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : jobs.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
              {hasActiveFilters ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  No matching jobs found.
                </p>
              ) : (
                <>
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
                </>
              )}
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
                      onClick={() =>
                        router.push(
                          `/dashboard/my-jobs/${job._id}/applications`,
                        )
                      }
                      className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:border-zinc-400 hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800 dark:focus-visible:outline-zinc-100"
                    >
                      View Applications
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        router.push(`/dashboard/my-jobs/${job._id}/edit`)
                      }
                      className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:border-zinc-400 hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800 dark:focus-visible:outline-zinc-100"
                    >
                      Edit Job
                    </button>
                    <button
                      type="button"
                      onClick={() => handleArchive(job._id)}
                      disabled={archivingId === job._id}
                      className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:border-zinc-400 hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800 dark:focus-visible:outline-zinc-100"
                    >
                      {archivingId === job._id ? "Archiving..." : "Archive Job"}
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
