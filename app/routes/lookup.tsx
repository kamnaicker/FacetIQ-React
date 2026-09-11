import { useEffect, useState } from "react";
import { DisclosureResult } from "../components/disclosure-result";
import { Alert } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Field } from "../components/ui/field";
import { Select } from "../components/ui/select";
import { disclose, listStandings } from "../lib/api/client";
import type { ApiError, DisclosureResponse, StandingResponse } from "../lib/api/types";
import { purposes } from "../lib/purposes";

export function meta() {
  return [{ title: "Lookup | FacetIQ" }];
}

export default function Lookup() {
  const [result, setResult] = useState<DisclosureResponse | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [known, setKnown] = useState<StandingResponse[]>([]);
  const [subjectId, setSubjectId] = useState("");

  useEffect(() => {
    listStandings().then((result) => {
      if (result.ok) {
        setKnown(result.data.held.filter((standing) => standing.acceptedAt !== null));
      }
    });
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    setBusy(true);
    setError(null);
    setFieldErrors({});
    setResult(null);

    const outcome = await disclose({
      subjectId: String(form.get("subjectId")).trim(),
      attributeKey: String(form.get("attributeKey")).trim(),
      purpose: String(form.get("purpose")),
    });

    setBusy(false);

    if (outcome.ok) {
      setResult(outcome.data);
      return;
    }

    if (outcome.error.kind === "validation") {
      setFieldErrors(outcome.error.fieldErrors);
      return;
    }

    setError(messageFor(outcome.error));
  }

  return (
    <>
      <h1 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        Lookup
      </h1>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        Ask someone for a detail from their profile.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 max-w-sm space-y-4">
        {error && <Alert>{error}</Alert>}

        <div className="space-y-2">
          <Field
            label="Who you are asking"
            name="subjectId"
            placeholder="Their profile reference"
            required
            value={subjectId}
            onChange={(event) => setSubjectId(event.target.value)}
            errors={fieldErrors.subjectId}
          />

          {known.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {known.map((standing) => (
                <button
                  key={standing.id}
                  type="button"
                  onClick={() => setSubjectId(standing.subjectId)}
                  className="rounded border border-neutral-300 px-2 py-1 text-sm text-neutral-700 hover:border-neutral-500 dark:border-neutral-700 dark:text-neutral-300"
                >
                  {standing.issuer}
                </button>
              ))}
            </div>
          )}
        </div>
        <Field
          label="Attribute"
          name="attributeKey"
          defaultValue="name"
          required
          errors={fieldErrors.attributeKey}
        />
        <Select label="Purpose" name="purpose" defaultValue="Social" options={purposes} />

        <Button type="submit" disabled={busy}>
          {busy ? "Asking" : "Ask"}
        </Button>
      </form>

      {result && <DisclosureResult result={result} />}
    </>
  );
}

function messageFor(error: ApiError): string {
  switch (error.kind) {
    case "unauthorized":
      return "Your session has expired. Sign in again.";
    case "network":
      return "Could not reach the server.";
    default:
      return "Something went wrong. Try again.";
  }
}
