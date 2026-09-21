import { useState } from "react";
import { Link } from "react-router";
import { ResendConfirmation } from "../components/resend-confirmation";
import { Alert } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Field } from "../components/ui/field";
import { register } from "../lib/api/client";
import { limits } from "../lib/api/limits";

export function meta() {
  return [{ title: "Register | FacetIQ" }];
}

export default function Register() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    setBusy(true);
    setFieldErrors({});
    setError(null);

    const created = await register(email, password);

    setBusy(false);

    if (!created.ok) {
      if (created.error.kind === "validation") {
        setFieldErrors(created.error.fieldErrors);
      } else if (created.error.kind === "rateLimited") {
        setError("Too many attempts. Wait a few minutes and try again.");
      } else {
        setError("Could not create the account.");
      }

      return;
    }

    setSentTo(email);
  }

  if (sentTo) {
    return (
      <>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Check your email</h1>

        <p className="mt-4 text-sm text-muted">
          We sent a link to {sentTo}. Open it, then sign in.
        </p>

        <div className="mt-6 flex items-center gap-4">
          <ResendConfirmation email={sentTo} />
          <Link to="/sign-in" className="focus-ring rounded text-sm text-ink underline underline-offset-4">
            Sign in
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Register</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && <Alert>{error}</Alert>}

        <Field
          label="Email"
          name="email"
          type="email"
          maxLength={limits.email}
          autoComplete="email"
          placeholder="name@example.com"
          hint="Type an email address you check. Other people use this address to find you on FacetIQ."
          required
          errors={fieldErrors.email}
        />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          hint="At least 6 characters, with an upper and lower case letter, a number and a symbol."
          required
          errors={fieldErrors.password}
        />

        <Button type="submit" disabled={busy}>
          {busy ? "Creating account" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted">
        Already registered?{" "}
        <Link to="/sign-in" className="focus-ring rounded text-ink underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </>
  );
}
