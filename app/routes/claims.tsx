import { useEffect, useState } from "react";
import { ClaimForm } from "../components/claim-form";
import { ClaimList } from "../components/claim-list";
import { Alert } from "../components/ui/alert";
import { createClaim, listClaims } from "../lib/api/client";
import type { AttributeResponse, CreateAttributeRequest } from "../lib/api/types";

export function meta() {
  return [{ title: "Claims | FacetIQ" }];
}

export default function Claims() {
  const [claims, setClaims] = useState<AttributeResponse[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const result = await listClaims();

    if (result.ok) {
      setClaims(result.data);
      return;
    }

    setError("Could not load your claims.");
  }

  async function handleSubmit(body: CreateAttributeRequest) {
    setBusy(true);
    setFieldErrors({});
    setError(null);

    const result = await createClaim(body);

    setBusy(false);

    if (result.ok) {
      await load();
      return;
    }

    switch (result.error.kind) {
      case "validation":
        setFieldErrors(result.error.fieldErrors);
        break;
      case "forbidden":
        setError("This account does not hold a profile to add claims to.");
        break;
      default:
        setError("Could not add the claim.");
    }
  }

  return (
    <>
      <h1 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        Claims
      </h1>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        Several claims can share a kind. Five names are five true things about you, and a rule
        chooses between them rather than deriving one from another.
      </p>

      {error && <div className="mt-6"><Alert>{error}</Alert></div>}

      <div className="mt-8">
        <ClaimList claims={claims} />
      </div>

      <h2 className="mt-10 text-base font-semibold text-neutral-900 dark:text-neutral-100">
        Add a claim
      </h2>
      <p className="mt-1 max-w-prose text-sm text-neutral-600 dark:text-neutral-400">
        Nothing here is checked against a pattern. A hyphen, an apostrophe, one word or a script
        this page cannot render are all names, and describing when a claim applies is yours to do
        rather than something the system infers from the value.
      </p>

      <div className="mt-4">
        <ClaimForm fieldErrors={fieldErrors} busy={busy} onSubmit={handleSubmit} />
      </div>
    </>
  );
}
