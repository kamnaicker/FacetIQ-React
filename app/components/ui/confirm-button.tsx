import { useState } from "react";

type ConfirmButtonProps = {
  label: string;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
};

// Two clicks in the same place rather than a dialog, so nothing covers the row being removed.
export function ConfirmButton({ label, confirmLabel, onConfirm }: ConfirmButtonProps) {
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!asking) {
    return (
      <button
        type="button"
        onClick={() => setAsking(true)}
        className="text-sm text-neutral-500 underline underline-offset-4 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
      >
        {label}
      </button>
    );
  }

  return (
    <span className="flex items-center gap-3 text-sm">
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          await onConfirm();
          setBusy(false);
          setAsking(false);
        }}
        className="font-medium text-red-700 underline underline-offset-4 disabled:opacity-50 dark:text-red-400"
      >
        {confirmLabel}
      </button>
      <button
        type="button"
        onClick={() => setAsking(false)}
        className="text-neutral-500 underline underline-offset-4 dark:text-neutral-400"
      >
        Cancel
      </button>
    </span>
  );
}
