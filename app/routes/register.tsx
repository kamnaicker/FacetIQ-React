import { useState } from "react";
import { Link } from "react-router";
import { ResendConfirmation } from "../components/resend-confirmation";
import { Alert } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Field } from "../components/ui/field";
import { register } from "../lib/api/client";

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
      <main className="mx-auto max-w-sm px-6 py-16">
        <h1 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Check your email
        </h1>

        <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
          We sent a link to {sentTo}. Open it, then sign in.
        </p>

        <div className="mt-6 flex items-center gap-4">
          <ResendConfirmation email={sentTo} />
          <Link to="/sign-in" className="text-sm underline underline-offset-4">
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-sm px-6 py-16">
      <h1 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        Register
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && <Alert>{error}</Alert>}

        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          hint="Others use this to ask you for details or to add you."
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

      <p className="mt-6 text-sm text-neutral-600 dark:text-neutral-400">
        Already registered?{" "}
        <Link to="/sign-in" className="underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </main>
  );
}
