import type { ButtonHTMLAttributes } from "react";

export function Button({
  className = "",
  ...button
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...button}
      className={`rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white outline-none hover:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-neutral-400 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 ${className}`}
    />
  );
}
