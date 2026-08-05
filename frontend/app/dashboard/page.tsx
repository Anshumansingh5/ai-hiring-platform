"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    setToken(storedToken);
    setRole(storedRole);
    setAuthChecked(true);

    if (!storedToken) {
      router.replace("/");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("id");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    router.replace("/");
  };

  if (!authChecked) {
    return null;
  }

  if (!token || (role !== "recruiter" && role !== "candidate")) {
    return null;
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl">
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-xl shadow-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-none sm:p-10">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium tracking-wide text-zinc-500 dark:text-zinc-400">
                AI Hiring Platform
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                Welcome back
              </h1>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Manage your hiring workflow from one place.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 self-start rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
              Logged in
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {role === "recruiter" ? (
              <>
                <button
                  type="button"
                  onClick={() => router.push("/dashboard/new-job")}
                  className="rounded-xl border border-zinc-200 bg-white p-5 text-left transition hover:border-zinc-400 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600 dark:focus-visible:outline-zinc-100"
                >
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                    Create Job
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Publish a new role for candidates.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/dashboard/my-jobs")}
                  className="rounded-xl border border-zinc-200 bg-white p-5 text-left transition hover:border-zinc-400 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600 dark:focus-visible:outline-zinc-100"
                >
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                    My Jobs
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    View the roles you have created.
                  </p>
                </button>

                <button
                  type="button"
                  disabled
                  className="rounded-xl border border-zinc-200 bg-white p-5 text-left opacity-60 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                    Applications
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Coming soon.
                  </p>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => router.push("/dashboard/browse-jobs")}
                  className="rounded-xl border border-zinc-200 bg-white p-5 text-left transition hover:border-zinc-400 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600 dark:focus-visible:outline-zinc-100"
                >
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                    Browse Jobs
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Explore open roles and apply.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/dashboard/my-applications")}
                  className="rounded-xl border border-zinc-200 bg-white p-5 text-left transition hover:border-zinc-400 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600 dark:focus-visible:outline-zinc-100"
                >
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                    My Applications
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Track the roles you have applied to.
                  </p>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-zinc-200 bg-white p-5 text-left transition hover:border-red-300 hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-red-900 dark:hover:bg-red-950/30"
            >
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                Logout
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                End your current session.
              </p>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
