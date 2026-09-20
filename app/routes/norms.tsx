import { useState } from "react";
import { NormConflict } from "../components/norm-conflict";
import { NormForm } from "../components/norm-form";
import { NormList } from "../components/norm-list";
import { NoProfile } from "../components/no-profile";
import { Alert } from "../components/ui/alert";
import { PageHeader } from "../components/ui/page-header";
import { useNotify } from "../components/ui/toast";
import { createNorm, removeRule } from "../lib/api/client";
import { useClaims, useNorms, useStandings } from "../lib/api/queries";
import type {
  CreateNormRequest,
  NormConflictResponse,
  NormResponse,
} from "../lib/api/types";

export function meta() {
  return [{ title: "Rules | FacetIQ" }];
}

export default function Norms() {
  const { result: normResult, refresh } = useNorms();
  const { result: claimResult } = useClaims();
  // Only the terms are read here, and only this person adds those.
  const { result: standingResult } = useStandings({ poll: false });
  const [conflict, setConflict] = useState<NormConflictResponse | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);
  const notify = useNotify();

  const norms = normResult?.ok ? normResult.data : [];
  const claims = claimResult?.ok ? claimResult.data : [];
  const terms = standingResult?.ok
    ? distinctTerms(standingResult.data.issued.map((standing) => standing.value))
    : [];

  const failure = [normResult, claimResult, standingResult].find((result) => result?.ok === false);
  const noProfile = failure?.ok === false && failure.error.kind === "forbidden";
  const error = failure && !noProfile ? "Could not load your rules." : null;

  async function handleSubmit(body: CreateNormRequest): Promise<boolean> {
    setBusy(true);
    setConflict(null);
    setFieldErrors({});

    const result = await createNorm(body);

    setBusy(false);

    if (result.ok) {
      notify("success", "Rule saved.");
      refresh();
      return true;
    }

    switch (result.error.kind) {
      case "overlap":
        setConflict(result.error.conflict);
        notify("warning", "Not saved. It overlaps a rule you already have.");
        break;
      case "validation":
        setFieldErrors(result.error.fieldErrors);
        break;
      case "forbidden":
        refresh();
        break;
      case "unauthorized":
        break;
      default:
        notify("error", "The rule was not saved. Try again.");
    }

    return false;
  }

  async function handleRemove(norm: NormResponse) {
    const result = await removeRule(norm.id);

    if (result.ok) {
      notify("success", "Rule removed. It no longer applies to anyone.");
      refresh();
      return;
    }

    if (result.error.kind !== "unauthorized") {
      notify("error", "The rule was not removed. Try again.");
    }
  }

  return (
    <>
      <PageHeader
        title="Rules"
        description="What each person sees when they ask about you. To change a rule, remove it and write it again."
      />

      {error && <div className="mt-6"><Alert>{error}</Alert></div>}

      {noProfile ? (
        <div className="mt-8">
          <NoProfile />
        </div>
      ) : (
        <>
          <div className="mt-8">
            <NormList norms={norms} claims={claims} onRemove={handleRemove} />
          </div>

          <h2 className="mt-10 text-base font-medium text-ink">Write a rule</h2>

          {conflict && (
            <div className="mt-4">
              <NormConflict conflict={conflict} claims={claims} />
            </div>
          )}

          <div className="mt-4">
            <NormForm
              claims={claims}
              terms={terms}
              fieldErrors={fieldErrors}
              busy={busy}
              onSubmit={handleSubmit}
            />
          </div>
        </>
      )}
    </>
  );
}

// Matching compares terms case-insensitively, so "Colleague" and "colleague" are one choice here.
function distinctTerms(values: string[]): string[] {
  const seen = new Map<string, string>();

  for (const value of values) {
    const key = value.toLowerCase();

    if (!seen.has(key)) {
      seen.set(key, value);
    }
  }

  return [...seen.values()].sort((a, b) => a.localeCompare(b));
}
