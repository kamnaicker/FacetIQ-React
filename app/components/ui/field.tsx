import type { InputHTMLAttributes } from "react";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  errors?: string[];
};

export function Field({ label, name, errors, ...input }: FieldProps) {
  const errorId = errors?.length ? `${name}-error` : undefined;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
      >
        {label}
      </label>

      <input
        {...input}
        id={name}
        name={name}
        aria-invalid={errorId ? true : undefined}
        aria-describedby={errorId}
        className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-500 aria-invalid:border-red-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
      />

      {errorId && (
        <p id={errorId} className="text-sm text-red-700 dark:text-red-400">
          {errors!.join(" ")}
        </p>
      )}
    </div>
  );
}
