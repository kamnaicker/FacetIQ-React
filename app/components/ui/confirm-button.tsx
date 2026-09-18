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
        className="focus-ring rounded text-sm text-muted underline underline-offset-4 hover:text-ink"
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
        className="rounded font-medium text-danger underline underline-offset-4 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger disabled:opacity-50"
      >
        {confirmLabel}
      </button>
      <button
        type="button"
        onClick={() => setAsking(false)}
        className="focus-ring rounded text-muted underline underline-offset-4 hover:text-ink"
      >
        Cancel
      </button>
    </span>
  );
}
