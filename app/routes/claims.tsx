import { useState } from "react";
import { ClaimForm } from "../components/claim-form";
import { ClaimInUse } from "../components/claim-in-use";
import { ClaimList } from "../components/claim-list";
import { NoProfile } from "../components/no-profile";
import { PurposeNote } from "../components/purpose-note";
import { Alert } from "../components/ui/alert";
import { PageHeader } from "../components/ui/page-header";
import { useNotify } from "../components/ui/toast";
import { createClaim, deleteClaim } from "../lib/api/client";
import { useClaims } from "../lib/api/queries";
import type { AttributeResponse, CreateAttributeRequest, NormResponse } from "../lib/api/types";

export function meta() {
  return [{ title: "Claims | FacetIQ" }];
}

export default function Claims() {
  const { result, refresh } = useClaims();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);
  const [inUse, setInUse] = useState<{ claim: AttributeResponse; rules: NormResponse[] } | null>(null);
  const notify = useNotify();

  const claims = result?.ok ? result.data : [];
  const noProfile = result?.ok === false && result.error.kind === "forbidden";
  const error = result?.ok === false && !noProfile ? "Could not load your claims." : null;

  async function handleSubmit(body: CreateAttributeRequest): Promise<boolean> {
    setBusy(true);
    setFieldErrors({});

    const result = await createClaim(body);

    setBusy(false);

    if (result.ok) {
      notify("success", `Added "${result.data.value}".`);
      await refresh();
      return true;
    }

    switch (result.error.kind) {
      case "validation":
        setFieldErrors(result.error.fieldErrors);
        break;
      case "forbidden":
        await refresh();
        break;
      case "unauthorized":
        break;
      default:
        notify("error", "The claim was not added. Try again.");
    }

    return false;
  }

  async function handleDelete(claim: AttributeResponse) {
    setInUse(null);

    const result = await deleteClaim(claim.id);

    if (result.ok) {
      notify("success", `Deleted "${claim.value}".`);
      await refresh();
      return;
    }

    if (result.error.kind === "inUse") {
      setInUse({ claim, rules: result.error.rules });
      return;
    }

    if (result.error.kind !== "unauthorized") {
      notify("error", "The claim was not deleted. Try again.");
    }
  }

  return (
    <>
      <PageHeader
        title="Claims"
        description="Add your name, your date of birth, your phone number, or anything else people ask you for. Nothing you add is shown to anybody until you write a rule that shares it."
      />

      {error && <div className="mt-6"><Alert>{error}</Alert></div>}

      {noProfile ? (
        <div className="mt-8">
          <NoProfile />
        </div>
      ) : (
        <>
          {inUse && (
            <div className="mt-8">
              <ClaimInUse claim={inUse.claim} rules={inUse.rules} />
            </div>
          )}

          <div className="mt-8">
            <ClaimList claims={claims} onDelete={handleDelete} />
          </div>

          <h2 className="mt-10 text-base font-medium text-ink">Add a claim</h2>

          <div className="mt-4">
            <ClaimForm fieldErrors={fieldErrors} busy={busy} onSubmit={handleSubmit} />
          </div>

          <PurposeNote className="mt-8" />
        </>
      )}
    </>
  );
}
