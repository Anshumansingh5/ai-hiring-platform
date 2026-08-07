"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import BackButton from "@/app/components/BackButton";

const controlClassName =
  "block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-400 dark:focus:ring-zinc-400/10";

type Candidate = {
  _id: string;
  name?: string;
  email?: string;
};

type Application = {
  _id: string;
  status: string;
  candidate?: Candidate | null;
};

const STATUS_OPTIONS = [
  "applied",
  "shortlisted",
  "interview",
  "selected",
  "rejected",
];

export default function JobApplicationsPage() {
  const router = useRouter();
  const params = useParams<{ jobId: string }>();
  const jobId = params.jobId;
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    id: string;
    type: "success" | "error";
    text: string;
  } | null>(null);
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

    if (storedRole !== "recruiter") {
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
        const url = `http://localhost:5000/api/applications/job/${jobId}${
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
  }, [token, jobId, search, statusFilter, sort]);

  const handleStatusChange = async (
    applicationId: string,
    status: string,
  ) => {
    if (!token) {
      router.replace("/");
      return;
    }

    setUpdatingId(applicationId);
    setFeedback(null);

    try {
      const response = await fetch(
        `http://localhost:5000/api/applications/${applicationId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        },
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        setFeedback({
          id: applicationId,
          type: "error",
          text: data.message || "Unable to update status.",
        });
        return;
      }

      setApplications((prev) =>
        prev.map((application) =>
          application._id === applicationId
            ? { ...application, status }
            : application,
        ),
      );
      setFeedback({
        id: applicationId,
        type: "success",
        text: "Status updated successfully.",
      });
    } catch {
      setFeedback({
        id: applicationId,
        type: "error",
        text: "Unable to update status. Please try again.",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  if (!authChecked) {
    return null;
  }

  if (!token || role !== "recruiter") {
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
              Applications
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Review candidates and update their status.
            </p>
          </div>

          <div className="mb-6 space-y-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by candidate name or email..."
              className={controlClassName}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by status"
                className={controlClassName}
              >
                <option value="">All statuses</option>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
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
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {hasActiveFilters
                  ? "No matching applications found."
                  : "No applications received yet."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {applications.map((application) => (
                <article
                  key={application._id}
                  className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                    {application.candidate?.name || "Unknown candidate"}
                  </h2>
                  {application.candidate?.email && (
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      {application.candidate.email}
                    </p>
                  )}
                  <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                    Current status:{" "}
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">
                      {application.status}
                    </span>
                  </p>

                  <label
                    htmlFor={`status-${application._id}`}
                    className="mb-1.5 mt-4 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Update status
                  </label>
                  <select
                    id={`status-${application._id}`}
                    value={application.status}
                    disabled={updatingId === application._id}
                    onChange={(e) =>
                      handleStatusChange(application._id, e.target.value)
                    }
                    className="block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-400 dark:focus:ring-zinc-400/10"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  {feedback && feedback.id === application._id && (
                    <p
                      className={
                        feedback.type === "success"
                          ? "mt-1.5 text-sm text-emerald-600 dark:text-emerald-400"
                          : "mt-1.5 text-sm text-red-600 dark:text-red-400"
                      }
                    >
                      {feedback.text}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
