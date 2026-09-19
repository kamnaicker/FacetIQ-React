import { useState } from "react";
import { resendConfirmation } from "../lib/api/client";
import { Button } from "./ui/button";
import { useNotify } from "./ui/toast";

export function ResendConfirmation({ email }: { email: string }) {
  const notify = useNotify();
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    setBusy(true);

    const result = await resendConfirmation(email);

    setBusy(false);

    if (result.ok) {
      notify("success", `Sent another link to ${email}.`);
      return;
    }

    if (result.error.kind === "rateLimited") {
      notify("warning", "Too many attempts. Wait a few minutes and try again.");
      return;
    }

    notify("error", "The link was not sent. Try again.");
  }

  return (
    <Button type="button" onClick={handleClick} disabled={busy}>
      {busy ? "Sending" : "Send the link again"}
    </Button>
  );
}
