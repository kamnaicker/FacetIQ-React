import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
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

type Arrival = { email?: string; registered?: boolean; deleted?: boolean } | null;

export default function SignIn() {
  const navigate = useNavigate();
  // Set by the register page after an account is created, or by settings after one is deleted.
  const arrival = useLocation().state as Arrival;
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    setBusy(true);
    setError(null);

    const result = await signIn(String(form.get("email")), String(form.get("password")));

    setBusy(false);

    if (result.ok) {
      clearCache();
      // Home decides where a signed in person lands, so a first sign in reaches the welcome page.
      navigate("/");
      return;
    }

    setError(messageFor(result.error));
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Sign in</h1>

      {arrival?.registered && (
        <p className="mt-4 text-sm text-muted">Your account is ready. Sign in to continue.</p>
      )}

      {arrival?.deleted && <p className="mt-4 text-sm text-muted">Your account has been deleted.</p>}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && <Alert>{error}</Alert>}

        <Field
          label="Email"
          name="email"
          type="email"
          maxLength={limits.email}
          autoComplete="email"
          placeholder="name@example.com"
          hint="Type the email address you signed up with."
          defaultValue={arrival?.email}
          required
        />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          hint="Type the password you chose when you created your account."
          required
        />

        <Button type="submit" disabled={busy}>
          {busy ? "Signing in" : "Sign in"}
        </Button>
      </form>

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
    case "rateLimited":
      return "Too many attempts. Wait a few minutes and try again.";
    case "network":
      return "Could not reach the server.";
    default:
      return "Something went wrong. Try again.";
  }
}
