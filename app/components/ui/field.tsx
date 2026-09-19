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
      <label htmlFor={name} className="block text-sm font-medium text-ink">
        {label}
      </label>

      {hint && (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      )}

      <input
        {...input}
        id={name}
        name={name}
        aria-invalid={errorId ? true : undefined}
        aria-describedby={describedBy}
        className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-muted/70 focus-visible:border-shared focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-shared/40 aria-invalid:border-danger"
      />

      {errorId && (
        <p id={errorId} className="text-xs text-danger">
          {errors!.join(" ")}
        </p>
      )}
    </div>
  );
}
