import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Alert } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Field } from "../components/ui/field";
import { register, signIn } from "../lib/api/client";

export function meta() {
  return [{ title: "Register | FacetIQ" }];
}

export default function Register() {
  const navigate = useNavigate();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    setBusy(true);
    setFieldErrors({});
    setError(null);

    const created = await register(email, password);

    if (!created.ok) {
      setBusy(false);

      if (created.error.kind === "validation") {
        setFieldErrors(created.error.fieldErrors);
      } else {
        setError("Could not create the account.");
      }

      return;
    }

    // Registering does not sign you in, so do it here rather than sending them to a second form.
    const signedIn = await signIn(email, password);

    setBusy(false);

    if (signedIn.ok) {
      navigate("/lookup");
      return;
    }

    navigate("/sign-in");
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
          required
          errors={fieldErrors.email}
        />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
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
