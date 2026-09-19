import type { ButtonHTMLAttributes } from "react";

export function Button({
  className = "",
  ...button
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...button}
      className={`focus-ring rounded-md bg-shared px-4 py-2 text-sm font-medium text-shared-ink hover:bg-shared/90 disabled:opacity-50 ${className}`}
    />
  );
}
