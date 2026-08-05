"use client";

import { useRouter } from "next/navigation";

type BackButtonProps = {
  // Optional override (e.g. Edit Job's unsaved-changes confirmation).
  // When omitted, the button simply navigates back.
  onClick?: () => void;
};

export default function BackButton({ onClick }: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    router.back();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 transition hover:text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 dark:focus-visible:outline-zinc-100"
    >
      <span aria-hidden="true">&larr;</span> Back
    </button>
  );
}
