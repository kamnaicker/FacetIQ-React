import type { InputHTMLAttributes } from "react";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  hint?: string;
  errors?: string[];
};

export function Field({ label, name, hint, errors, ...input }: FieldProps) {
  const hintId = hint ? `${name}-hint` : undefined;
  const errorId = errors?.length ? `${name}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
      >
        {label}
      </label>

      {hint && (
        <p id={hintId} className="text-sm text-neutral-500 dark:text-neutral-400">
          {hint}
        </p>
      )}

      <input
        {...input}
        id={name}
        name={name}
        aria-invalid={errorId ? true : undefined}
        aria-describedby={describedBy}
        className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-500 aria-invalid:border-red-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:[color-scheme:dark]"
      />

      {errorId && (
        <p id={errorId} className="text-sm text-red-700 dark:text-red-400">
          {errors!.join(" ")}
        </p>
      )}
    </div>
  );
}
