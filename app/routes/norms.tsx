import { useEffect, useState } from "react";
import { NormConflict } from "../components/norm-conflict";
import { NormForm } from "../components/norm-form";
import { NormList } from "../components/norm-list";
import { Alert } from "../components/ui/alert";
import { createNorm, listClaims, listNorms } from "../lib/api/client";
import type {
  AttributeResponse,
  CreateNormRequest,
  NormConflictResponse,
  NormResponse,
} from "../lib/api/types";

export function meta() {
  return [{ title: "Rules | FacetIQ" }];
}

export default function Norms() {
  const [norms, setNorms] = useState<NormResponse[]>([]);
  const [claims, setClaims] = useState<AttributeResponse[]>([]);
  const [conflict, setConflict] = useState<NormConflictResponse | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const [normResult, claimResult] = await Promise.all([listNorms(), listClaims()]);

    if (normResult.ok) {
      setNorms(normResult.data);
    }

    if (claimResult.ok) {
      setClaims(claimResult.data);
    }

    if (!normResult.ok || !claimResult.ok) {
      setError("Could not load your rules.");
    }
  }

  async function handleSubmit(body: CreateNormRequest) {
    setBusy(true);
    setConflict(null);
    setFieldErrors({});
    setError(null);

    const result = await createNorm(body);

    setBusy(false);

    if (result.ok) {
      await load();
      return;
    }

    switch (result.error.kind) {
      case "conflict":
        setConflict(result.error.conflict);
        break;
      case "validation":
        setFieldErrors(result.error.fieldErrors);
        break;
      case "forbidden":
        setError("This account does not hold a profile to write rules about.");
        break;
      default:
        setError("Could not save the rule.");
    }
  }

  return (
    <>
      <h1 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        Rules
      </h1>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        Each rule says what to release, to whom, and why. A rule that cannot be told apart from one
        you have already written is refused rather than guessed between.
      </p>

      {error && <div className="mt-6"><Alert>{error}</Alert></div>}

      <div className="mt-8">
        <NormList norms={norms} claims={claims} />
      </div>

      <h2 className="mt-10 text-base font-semibold text-neutral-900 dark:text-neutral-100">
        Write a rule
      </h2>

      {conflict && (
        <div className="mt-4">
          <NormConflict conflict={conflict} claims={claims} />
        </div>
      )}

      <div className="mt-4">
        <NormForm
          claims={claims}
          fieldErrors={fieldErrors}
          busy={busy}
          onSubmit={handleSubmit}
        />
      </div>
    </>
  );
}
