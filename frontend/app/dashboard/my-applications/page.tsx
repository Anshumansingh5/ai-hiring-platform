"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import BackButton from "@/app/components/BackButton";

const controlClassName =
  "block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-400 dark:focus:ring-zinc-400/10";

const STATUS_OPTIONS = [
  "applied",
  "shortlisted",
  "interview",
  "selected",
  "rejected",
];

type Job = {
  _id: string;
  title: string;
  company: string;
  location: string;
  status?: string;
};

type JobSnapshot = {
  title?: string;
  company?: string;
  location?: string;
};

type Application = {
  _id: string;
  status: string;
  job?: Job | null;
  rejectionReason?: string | null;
  jobSnapshot?: JobSnapshot | null;
};

const STATUS_BADGE_CLASSES: Record<string, string> = {
  applied:
    "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  shortlisted:
    "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
  interview:
    "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400",
  selected:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
  rejected:
    "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400",
};

const getStatusBadgeClasses = (status: string) =>
  STATUS_BADGE_CLASSES[status] || STATUS_BADGE_CLASSES.applied;

export default function MyApplicationsPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searching, setSearching] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState("newest");

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

    if (storedRole !== "candidate") {
      router.replace("/");
      return;
    }
  }, [router]);

  // Fetch (and re-fetch) applications whenever a filter changes. Debounced so
  // typing in the search box doesn't fire a request on every keystroke.
  useEffect(() => {
    if (!token) return;

    const fetchApplications = async () => {
      // `searching` drives a small inline indicator; it never hides the list.
      setSearching(true);
      setError("");

      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (statusFilter) params.set("status", statusFilter);
        if (sort) params.set("sort", sort);

        const queryString = params.toString();
        const url = `http://localhost:5000/api/applications/my${
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
          setError(data.message || "Unable to load applications.");
          return;
        }

        // Swap the list in only after a successful response, so the previous
        // results stay visible (no flicker) while the request is in flight.
        setApplications(data.data);
      } catch {
        setError("Unable to load applications. Please try again.");
      } finally {
        setSearching(false);
        // Clears the initial full-page loading after the first fetch; it is
        // never set back to true, so searches don't trigger it again.
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchApplications, 500);
    return () => clearTimeout(timer);
  }, [token, search, statusFilter, sort]);

  if (!authChecked) {
    return null;
  }

  if (!token || role !== "candidate") {
    return null;
  }

  const hasActiveFilters = Boolean(search || statusFilter);

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
              My Applications
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Track the roles you have applied to.
            </p>
          </div>

          <div className="mb-6 space-y-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by job title or company..."
              className={controlClassName}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by status"
                className={controlClassName}
              >
                <option value="">All Statuses</option>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
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
            {!searching && error && applications.length > 0 && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>

          {loading ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Loading applications...
            </p>
          ) : error && applications.length === 0 ? (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : applications.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
              {hasActiveFilters ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  No matching applications found.
                </p>
              ) : (
                <>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    No applications yet.
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard/browse-jobs")}
                    className="mt-4 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus-visible:outline-zinc-100"
                  >
                    Browse Jobs
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {applications.map((application) => {
                const job = application.job;
                const snapshot = application.jobSnapshot;
                const displayTitle =
                  job?.title || snapshot?.title || "Job no longer available";
                const displayCompany = job?.company || snapshot?.company;
                const displayLocation = job?.location || snapshot?.location;
                // Job document was permanently removed (post-cleanup): there is
                // no live job, but a snapshot remains on the application.
                const isPermanentlyDeleted = !job && !!snapshot;

                return (
                  <article
                    key={application._id}
                    className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                        {displayTitle}
                      </h2>
                      <span
                        className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadgeClasses(
                          application.status,
                        )}`}
                      >
                        {application.status}
                      </span>
                    </div>
                    {displayCompany && (
                      <p className="mt-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        {displayCompany}
                      </p>
                    )}
                    {displayLocation && (
                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        {displayLocation}
                      </p>
                    )}
                    {job?.status === "archived" && (
                      <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/60">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                          Job Status: Archived
                        </p>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                          This position is no longer accepting new applications.
                          Existing applications are still being reviewed.
                        </p>
                      </div>
                    )}
                    {job?.status === "deleted" && (
                      <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/60">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                          Job Status: Deleted
                        </p>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                          This job posting has been removed. If the recruiter
                          wishes to continue the hiring process, they may contact
                          you directly.
                        </p>
                      </div>
                    )}
                    {isPermanentlyDeleted && (
                      <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/60">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                          Job Status: Deleted
                        </p>
                        {application.rejectionReason === "Position Closed" && (
                          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                            This position has been closed by the recruiter.
                          </p>
                        )}
                        {(application.status === "interview" ||
                          application.status === "shortlisted" ||
                          application.status === "selected") && (
                          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                            This job posting has been removed. However, your
                            application is still active and the recruiter may
                            continue the hiring process.
                          </p>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
