"use client";

import { FormEvent, KeyboardEvent, useState } from "react";

const inputClassName =
  "block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-400 dark:focus:ring-zinc-400/10";

const labelClassName =
  "mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300";

const errorClassName = "mt-1.5 text-sm text-red-600 dark:text-red-400";

type SkillTagInputProps = {
  id: string;
  label: string;
  skills: string[];
  onChange: (skills: string[]) => void;
  placeholder?: string;
};

function SkillTagInput({
  id,
  label,
  skills,
  onChange,
  placeholder = "Type a skill and press Enter",
}: SkillTagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addSkill = (raw: string) => {
    const skill = raw.trim();
    if (!skill || skills.includes(skill)) return;
    onChange([...skills, skill]);
    setInputValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill(inputValue);
    }
  };

  const removeSkill = (skill: string) => {
    onChange(skills.filter((s) => s !== skill));
  };

  return (
    <div>
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      <div className="rounded-lg border border-zinc-300 bg-white p-2 focus-within:border-zinc-900 focus-within:ring-2 focus-within:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:focus-within:border-zinc-400 dark:focus-within:ring-zinc-400/10">
        {skills.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2.5 py-1 text-sm text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="rounded p-0.5 text-zinc-500 transition hover:bg-zinc-200 hover:text-zinc-800 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
                  aria-label={`Remove ${skill}`}
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
        <input
          id={id}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full border-0 bg-transparent px-1.5 py-1 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
      </div>
    </div>
  );
}

export default function NewJobPage() {
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [employmentType, setEmploymentType] = useState("Full-time");
  const [experienceMin, setExperienceMin] = useState("");
  const [experienceMax, setExperienceMax] = useState("");
  const [mustHaveSkills, setMustHaveSkills] = useState<string[]>([]);
  const [niceToHaveSkills, setNiceToHaveSkills] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [minEducation, setMinEducation] = useState("Any");
  const [errors, setErrors] = useState<{ title?: string; description?: string }>(
    {},
  );

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: { title?: string; description?: string } = {};
    if (!title.trim()) {
      newErrors.title = "Job title is required.";
    }
    if (!description.trim()) {
      newErrors.description = "Job description is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const formData = {
      title: title.trim(),
      department: department.trim(),
      employmentType,
      experienceMin: experienceMin === "" ? 0 : Number(experienceMin),
      experienceMax: experienceMax === "" ? 0 : Number(experienceMax),
      mustHaveSkills,
      niceToHaveSkills,
      description: description.trim(),
      minEducation,
    };

    console.log(formData);
  };

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
              <label htmlFor="department" className={labelClassName}>
                Department
              </label>
              <input
                id="department"
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Engineering"
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="employmentType" className={labelClassName}>
                Employment Type
              </label>
              <select
                id="employmentType"
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className={inputClassName}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            <div>
              <span className={labelClassName}>Years of Experience Required</span>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="experienceMin" className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">
                    Min
                  </label>
                  <input
                    id="experienceMin"
                    type="number"
                    min={0}
                    value={experienceMin}
                    onChange={(e) => setExperienceMin(e.target.value)}
                    placeholder="0"
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label htmlFor="experienceMax" className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">
                    Max
                  </label>
                  <input
                    id="experienceMax"
                    type="number"
                    min={0}
                    value={experienceMax}
                    onChange={(e) => setExperienceMax(e.target.value)}
                    placeholder="10"
                    className={inputClassName}
                  />
                </div>
              </div>
            </div>

            <SkillTagInput
              id="mustHaveSkills"
              label="Must-Have Skills"
              skills={mustHaveSkills}
              onChange={setMustHaveSkills}
            />

            <SkillTagInput
              id="niceToHaveSkills"
              label="Nice-to-Have Skills"
              skills={niceToHaveSkills}
              onChange={setNiceToHaveSkills}
            />

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

            <div>
              <label htmlFor="minEducation" className={labelClassName}>
                Minimum Education
              </label>
              <select
                id="minEducation"
                value={minEducation}
                onChange={(e) => setMinEducation(e.target.value)}
                className={inputClassName}
              >
                <option value="Any">Any</option>
                <option value="Bachelor's">Bachelor&apos;s</option>
                <option value="Master's">Master&apos;s</option>
                <option value="PhD">PhD</option>
              </select>
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus-visible:outline-zinc-100"
            >
              Create Job Posting
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
