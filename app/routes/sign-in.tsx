import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ResendConfirmation } from "../components/resend-confirmation";
import { Alert } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Field } from "../components/ui/field";
import { signIn } from "../lib/api/client";
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
      navigate("/lookup");
      return;
    }

    if (result.error.kind === "unconfirmed") {
      setUnconfirmed(email);
    }

    setError(messageFor(result.error));
  }

  return (
    <main className="mx-auto max-w-sm px-6 py-16">
      <h1 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        Sign in
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && <Alert>{error}</Alert>}

        <Field
          label="Email"
          name="email"
          type="email"
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

      <p className="mt-6 text-sm text-neutral-600 dark:text-neutral-400">
        No account?{" "}
        <Link to="/register" className="underline underline-offset-4">
          Register
        </Link>
      </p>
    </main>
  );
}

function messageFor(error: ApiError): string {
  switch (error.kind) {
    case "unauthorized":
      return "That email and password do not match an account.";
    case "unconfirmed":
      return "Confirm your email before signing in. The link is in your inbox.";
    case "network":
      return "Could not reach the server.";
    default:
      return "Something went wrong. Try again.";
  }
}
