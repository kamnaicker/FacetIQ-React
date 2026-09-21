import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Alert } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { cancelRegistration } from "../lib/api/client";
import { clearRegistration } from "../lib/registration";

export function meta() {
  return [{ title: "Cancel a registration | FacetIQ" }];
}

// Cancels on a button press, never on load: mail scanners open links, and would cancel real
// registrations if visiting the page were enough.
export default function RegistrationCancel() {
  const token = useSearchParams()[0].get("token");
  const [cancelled, setCancelled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleCancel() {
    if (!token) {
      return;
    }

    setBusy(true);
    setError(null);

    const result = await cancelRegistration(token);

    setBusy(false);

    if (result.ok) {
      // The attempt no longer exists, so this browser must not offer its code screen again. Any
      // other open tab sees the change and returns to the form.
      clearRegistration();
      setCancelled(true);
      return;
    }

    setError("The registration was not cancelled. Try again.");
  }

  if (cancelled) {
    return (
      <>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Registration cancelled</h1>

        <p className="mt-4 text-sm text-muted">
          No account will be created from that email. If you want a FacetIQ account of your own, you
          can{" "}
          <Link to="/register" className="focus-ring rounded text-ink underline underline-offset-4">
            register
          </Link>
          .
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Cancel a registration</h1>

      {token ? (
        <>
          <p className="mt-4 text-sm text-muted">
            Someone asked to create a FacetIQ account with your email address. If it was not you,
            cancel it here. Nothing has been created yet.
          </p>

          {error && (
            <div className="mt-6">
              <Alert>{error}</Alert>
            </div>
          )}

          <div className="mt-6">
            <Button type="button" onClick={handleCancel} disabled={busy}>
              {busy ? "Cancelling" : "Cancel the registration"}
            </Button>
          </div>
        </>
      ) : (
        <p className="mt-4 text-sm text-muted">
          This link is incomplete. Open the whole link from the email and try again.
        </p>
      )}
    </>
  );
}
