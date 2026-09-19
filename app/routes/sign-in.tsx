import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ResendConfirmation } from "../components/resend-confirmation";
import { Alert } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Field } from "../components/ui/field";
import { signIn } from "../lib/api/client";
import { limits } from "../lib/api/limits";
import { clearCache } from "../lib/api/queries";
import type { ApiError } from "../lib/api/types";

export function meta() {
  return [{ title: "Sign in | FacetIQ" }];
}

export default function SignIn() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [unconfirmed, setUnconfirmed] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));

    setBusy(true);
    setError(null);
    setUnconfirmed(null);

    const result = await signIn(email, String(form.get("password")));

    setBusy(false);

    if (result.ok) {
      clearCache();
      navigate("/lookup");
      return;
    }

    if (result.error.kind === "unconfirmed") {
      setUnconfirmed(email);
    }

    setError(messageFor(result.error));
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Sign in</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && <Alert>{error}</Alert>}

        <Field
          label="Email"
          name="email"
          type="email"
          maxLength={limits.email}
          autoComplete="email"
          placeholder="name@example.com"
          required
        />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />

        <Button type="submit" disabled={busy}>
          {busy ? "Signing in" : "Sign in"}
        </Button>
      </form>

      {unconfirmed && (
        <div className="mt-4">
          <ResendConfirmation email={unconfirmed} />
        </div>
      )}

      <p className="mt-6 text-sm text-muted">
        No account?{" "}
        <Link to="/register" className="focus-ring rounded text-ink underline underline-offset-4">
          Register
        </Link>
      </p>
    </>
  );
}

function messageFor(error: ApiError): string {
  switch (error.kind) {
    case "unauthorized":
      return "That email and password do not match an account.";
    case "unconfirmed":
      return "Confirm your email before signing in. The link is in your inbox.";
    case "rateLimited":
      return "Too many attempts. Wait a few minutes and try again.";
    case "network":
      return "Could not reach the server.";
    default:
      return "Something went wrong. Try again.";
  }
}
