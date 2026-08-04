"use client";

import { FormEvent, useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

const inputClassName =
  "block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-400 dark:focus:ring-zinc-400/10";

const labelClassName =
  "mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300";

const errorClassName = "mt-1.5 text-sm text-red-600 dark:text-red-400";

const subscribeToStorage = () => () => {};

export default function NewJobPage() {
  const router = useRouter();
  const token = useSyncExternalStore(
    subscribeToStorage,
    () => localStorage.getItem("token"),
    () => null,
  );
  const role = useSyncExternalStore(
    subscribeToStorage,
    () => localStorage.getItem("role"),
    () => null,
  );
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

  useEffect(() => {
    if (!token) {
      router.replace("/");
      return;
    }

    if (role !== "recruiter") {
      router.replace("/dashboard");
    }
  }, [role, router, token]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) {
      router.replace("/");
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
      const response = await fetch("http://localhost:5000/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setSubmitError(data.message || "Unable to create job.");
        return;
      }

      setTitle("");
      setCompany("");
      setLocation("");
      setDescription("");
      setSuccessMessage(data.message || "Job created successfully.");
    } catch {
      setSubmitError("Unable to create job. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token || role !== "recruiter") {
    return null;
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl">
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-xl shadow-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-none sm:p-10">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Create New Job Posting
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Fill in the details below to publish a new role
            </p>
          </div>

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
              disabled={isSubmitting}
              className="mt-2 w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus-visible:outline-zinc-100"
            >
              {isSubmitting ? "Creating Job..." : "Create Job Posting"}
            </button>
            {submitError && <p className={errorClassName}>{submitError}</p>}
            {successMessage && (
              <p className="mt-1.5 text-sm text-emerald-600 dark:text-emerald-400">
                {successMessage}
              </p>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}
