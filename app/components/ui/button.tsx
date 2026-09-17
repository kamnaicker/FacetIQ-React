import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Quiet sits beside a primary action or inside a row, where a filled button would shout. */
  tone?: "primary" | "quiet";
};

const tones = {
  primary: "bg-shared text-shared-ink hover:bg-shared/90",
  quiet: "border border-line bg-surface text-ink hover:bg-raised",
};

export function Button({ className = "", tone = "primary", ...button }: ButtonProps) {
  return (
    <button
      {...button}
      className={`rounded-md px-4 py-2 text-sm font-medium outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-shared disabled:opacity-50 ${tones[tone]} ${className}`}
    />
  );
}
