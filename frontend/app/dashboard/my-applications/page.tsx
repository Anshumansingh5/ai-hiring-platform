"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import BackButton from "@/app/components/BackButton";

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

    const fetchApplications = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/applications/my",
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          },
        );
        const data = await response.json();

        if (!response.ok || !data.success) {
          setError(data.message || "Unable to load applications.");
          return;
        }

        setApplications(data.data);
      } catch {
        setError("Unable to load applications. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [router]);

  if (!authChecked) {
    return null;
  }

  if (!token || role !== "candidate") {
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
              My Applications
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Track the roles you have applied to.
            </p>
          </div>

          {loading ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Loading applications...
            </p>
          ) : error ? (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : applications.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
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
