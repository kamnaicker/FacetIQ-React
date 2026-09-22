import { useState } from "react";
import { useNavigate } from "react-router";
import { Alert } from "../components/ui/alert";
import { ConfirmButton } from "../components/ui/confirm-button";
import { Field } from "../components/ui/field";
import { PageHeader } from "../components/ui/page-header";
import { deleteAccount, signOut } from "../lib/api/client";
import { clearCache } from "../lib/api/queries";

export function meta() {
  return [{ title: "Settings | FacetIQ" }];
}

export default function Settings() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setError(null);

    if (password === "") {
      setError("Type your password to delete your account.");
      return;
    }

    const result = await deleteAccount(password);

    if (result.ok) {
      signOut();
      clearCache();
      navigate("/sign-in", { state: { deleted: true } });
      return;
    }

    if (result.error.kind === "validation") {
      setError("That password is not right.");
    } else if (result.error.kind === "rateLimited") {
      setError("Too many attempts. Wait a few minutes and try again.");
    } else if (result.error.kind !== "unauthorized") {
      setError("Your account was not deleted. Try again.");
    }
  }

  return (
    <>
      <PageHeader title="Settings" description="Your account." />

      <h2 className="mt-10 text-base font-medium text-ink">Delete your account</h2>

      <p className="mt-2 max-w-prose text-sm text-muted">
        This removes your profile, your claims, your rules, and everyone you have added or who has
        added you. It cannot be undone.
      </p>

      <p className="mt-2 max-w-prose text-sm text-muted">
        People you asked about keep their record of what you asked for, but it will no longer say who
        asked.
      </p>

      <div className="mt-6 max-w-sm space-y-4">
        {error && <Alert>{error}</Alert>}

        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          hint="Type your password to confirm it is you."
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <ConfirmButton label="Delete my account" confirmLabel="Yes, delete it" onConfirm={handleDelete} />
      </div>
    </>
  );
}
