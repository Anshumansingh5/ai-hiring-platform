"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import BackButton from "@/app/components/BackButton";

const UNSAVED_CHANGES_MESSAGE =
  "You have unsaved changes. Are you sure you want to leave this page?";

const inputClassName =
  "block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-400 dark:focus:ring-zinc-400/10";

const labelClassName =
  "mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300";

const errorClassName = "mt-1.5 text-sm text-red-600 dark:text-red-400";

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams<{ jobId: string }>();
  const jobId = params.jobId;
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{
    title?: string;
    company?: string;
    location?: string;
    description?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [original, setOriginal] = useState<{
    title: string;
    company: string;
    location: string;
    description: string;
  } | null>(null);

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

    const fetchJob = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/jobs/${jobId}`,
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          },
        );
        const data = await response.json();

        if (!response.ok || !data.success) {
          setLoadError(data.message || "Unable to load job.");
          return;
        }

        const loaded = {
          title: data.data.title || "",
          company: data.data.company || "",
          location: data.data.location || "",
          description: data.data.description || "",
        };
        setTitle(loaded.title);
        setCompany(loaded.company);
        setLocation(loaded.location);
        setDescription(loaded.description);
        setOriginal(loaded);
      } catch {
        setLoadError("Unable to load job. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [jobId, router]);

  // Dirty = current form differs from the values loaded from the server.
  const isDirty =
    original !== null &&
    (title !== original.title ||
      company !== original.company ||
      location !== original.location ||
      description !== original.description);

  // Keep the latest dirtiness in a ref so the (once-registered) native
  // event listeners below can read it without being re-registered.
  const isDirtyRef = useRef(false);
  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  // Warn on page refresh / tab close when there are unsaved changes.
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isDirtyRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () =>
      window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // In-app Back button: confirm only when there are unsaved changes,
  // then navigate back.
  const handleBack = () => {
    if (isDirty) {
      const confirmed = window.confirm(UNSAVED_CHANGES_MESSAGE);
      if (!confirmed) return;
    }
    router.back();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) {
      router.replace("/");
      return;
    }

    if (!isDirty) {
      return;
    }

    const newErrors: {
      title?: string;
      company?: string;
      location?: string;
      description?: string;
    } = {};
    if (!title.trim()) {
      newErrors.title = "Job title is required.";
    }
    if (!company.trim()) {
      newErrors.company = "Company is required.";
    }
    if (!location.trim()) {
      newErrors.location = "Location is required.";
    }
    if (!description.trim()) {
      newErrors.description = "Job description is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSubmitError("");
    setSuccessMessage("");

    const formData = {
      title: title.trim(),
      company: company.trim(),
      location: location.trim(),
      description: description.trim(),
    };

    setIsSubmitting(true);

    try {
      const response = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setSubmitError(data.message || "Unable to update job.");
        return;
      }

      // Reset the baseline so the form is no longer "dirty" and the
      // unsaved-changes guards do not fire on the redirect below.
      setOriginal(formData);
      setSuccessMessage(data.message || "Job updated successfully.");
      router.push("/dashboard/my-jobs");
    } catch {
      setSubmitError("Unable to update job. Please try again.");
    } finally {
      setIsSubmitting(false);
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
      <div className="w-full max-w-2xl">
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-xl shadow-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-none sm:p-10">
          <BackButton onClick={handleBack} />
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Edit Job Posting
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Update the details below and save your changes
            </p>
          </div>

          {isLoading ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Loading job...
            </p>
          ) : loadError ? (
            <p className="text-sm text-red-600 dark:text-red-400">
              {loadError}
            </p>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              <div>
                <label htmlFor="title" className={labelClassName}>
                  Job Title <span className="text-red-600 dark:text-red-400">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
                  }}
                  placeholder="e.g. Senior Software Engineer"
                  className={inputClassName}
                />
                {errors.title && <p className={errorClassName}>{errors.title}</p>}
              </div>

              <div>
                <label htmlFor="company" className={labelClassName}>
                  Company <span className="text-red-600 dark:text-red-400">*</span>
                </label>
                <input
                  id="company"
                  type="text"
                  value={company}
                  onChange={(e) => {
                    setCompany(e.target.value);
                    if (errors.company) {
                      setErrors((prev) => ({ ...prev, company: undefined }));
                    }
                  }}
                  placeholder="e.g. Acme Inc."
                  className={inputClassName}
                />
                {errors.company && <p className={errorClassName}>{errors.company}</p>}
              </div>

              <div>
                <label htmlFor="location" className={labelClassName}>
                  Location <span className="text-red-600 dark:text-red-400">*</span>
                </label>
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    if (errors.location) {
                      setErrors((prev) => ({ ...prev, location: undefined }));
                    }
                  }}
                  placeholder="e.g. Bengaluru, India"
                  className={inputClassName}
                />
                {errors.location && <p className={errorClassName}>{errors.location}</p>}
              </div>

              <div>
                <label htmlFor="description" className={labelClassName}>
                  Job Description <span className="text-red-600 dark:text-red-400">*</span>
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.description) {
                      setErrors((prev) => ({ ...prev, description: undefined }));
                    }
                  }}
                  rows={8}
                  placeholder="Describe the role, responsibilities, and requirements..."
                  className={`${inputClassName} resize-y min-h-40`}
                />
                {errors.description && (
                  <p className={errorClassName}>{errors.description}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !isDirty}
                className="mt-2 w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus-visible:outline-zinc-100"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
              {submitError && <p className={errorClassName}>{submitError}</p>}
              {successMessage && (
                <p className="mt-1.5 text-sm text-emerald-600 dark:text-emerald-400">
                  {successMessage}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
