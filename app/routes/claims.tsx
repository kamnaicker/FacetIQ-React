import { useEffect, useState } from "react";
import { ClaimForm } from "../components/claim-form";
import { ClaimInUse } from "../components/claim-in-use";
import { ClaimList } from "../components/claim-list";
import { NoProfile } from "../components/no-profile";
import { Alert } from "../components/ui/alert";
import { PageHeader } from "../components/ui/page-header";
import { useNotify } from "../components/ui/toast";
import { createClaim, deleteClaim, listClaims } from "../lib/api/client";
import type { AttributeResponse, CreateAttributeRequest, NormResponse } from "../lib/api/types";

export function meta() {
  return [{ title: "Claims | FacetIQ" }];
}

export default function Claims() {
  const [claims, setClaims] = useState<AttributeResponse[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [noProfile, setNoProfile] = useState(false);
  const [busy, setBusy] = useState(false);
  const [inUse, setInUse] = useState<{ claim: AttributeResponse; rules: NormResponse[] } | null>(null);
  const notify = useNotify();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const result = await listClaims();

    if (result.ok) {
      setClaims(result.data);
      setNoProfile(false);
      return;
    }

    if (result.error.kind === "forbidden") {
      setNoProfile(true);
      return;
    }

    setError("Could not load your claims.");
  }

  async function handleSubmit(body: CreateAttributeRequest): Promise<boolean> {
    setBusy(true);
    setFieldErrors({});

    const result = await createClaim(body);

    setBusy(false);

    if (result.ok) {
      notify("success", `Added "${result.data.value}".`);
      await load();
      return true;
    }

    switch (result.error.kind) {
      case "validation":
        setFieldErrors(result.error.fieldErrors);
        break;
      case "forbidden":
        setNoProfile(true);
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
      await load();
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
      <PageHeader title="Claims" description="What you hold about yourself. You can keep more than one of the same kind." />

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

          <h2 className="mt-10 text-base font-semibold text-neutral-900 dark:text-neutral-100">
            Add a claim
          </h2>

          <div className="mt-4">
            <ClaimForm fieldErrors={fieldErrors} busy={busy} onSubmit={handleSubmit} />
          </div>
        </>
      )}
    </>
  );
}
