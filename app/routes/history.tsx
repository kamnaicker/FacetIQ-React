import { useEffect, useState } from "react";
import { NoProfile } from "../components/no-profile";
import { Alert } from "../components/ui/alert";
import { List, ListItem } from "../components/ui/list";
import { PageHeader } from "../components/ui/page-header";
import { listHistory } from "../lib/api/client";
import type { DisclosureRecordResponse } from "../lib/api/types";
import { displayLabel, kindLabel } from "../lib/options";

export function meta() {
  return [{ title: "Requests | FacetIQ" }];
}

export default function History() {
  const [records, setRecords] = useState<DisclosureRecordResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [noProfile, setNoProfile] = useState(false);

  useEffect(() => {
    listHistory().then((result) => {
      if (result.ok) {
        setRecords(result.data);
      } else if (result.error.kind === "forbidden") {
        setNoProfile(true);
      } else if (result.error.kind !== "unauthorized") {
        setError("Could not load your requests.");
      }
    });
  }, []);

  return (
    <>
      <PageHeader
        title="Requests"
        description="Who has asked about you, what they asked, and what they were given. Nothing here is stored twice: the answer itself is not kept."
      />

      {error && <div className="mt-6"><Alert>{error}</Alert></div>}

      {noProfile ? (
        <div className="mt-8">
          <NoProfile />
        </div>
      ) : records.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-600 dark:text-neutral-400">
          Nobody has asked about you yet.
        </p>
      ) : (
        <List className="mt-8">
          {records.map((record) => (
            <ListItem key={record.id} className="items-start gap-4">
              <div className="flex-1">
                <p className="text-sm text-neutral-900 dark:text-neutral-100">
                  {record.isSelf
                    ? `You looked at your own ${kindLabel(record.attributeKey).toLowerCase()}.`
                    : `${record.requester ?? "An account that no longer exists"} asked for your ${kindLabel(record.attributeKey).toLowerCase()} for ${record.purpose.toLowerCase()} reasons.`}
                </p>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  {outcome(record)}
                  {record.justifyingPrinciple && ` Your rule: ${record.justifyingPrinciple}`}
                </p>
              </div>

              <time
                dateTime={record.timestamp}
                className="text-sm text-neutral-500 tabular-nums dark:text-neutral-400"
              >
                {new Date(record.timestamp).toLocaleString()}
              </time>
            </ListItem>
          ))}
        </List>
      )}
    </>
  );
}

const refusals: Record<string, string> = {
  NoMatchingNorm: "Nothing shared: no rule of yours covered it.",
  AmbiguousNorms: "Nothing shared: two of your rules disagreed.",
  RefusedByRule: "Nothing shared: your rule refused it.",
  PurposeIncompatible: "Nothing shared: the claim is limited to another reason.",
  ClaimUnavailable: "Nothing shared: the claim was no longer held.",
};

function outcome(record: DisclosureRecordResponse): string {
  if (record.outcome === "Deny") {
    return refusals[record.denyReason ?? ""] ?? "Nothing shared.";
  }

  if (record.isSelf) {
    return "Every claim of that kind, as you hold them.";
  }

  if (record.outcome === "Return") {
    return "Shared as you hold it.";
  }

  return `${displayLabel({
    action: record.outcome,
    transform: record.transform ?? "None",
    transformParameter: record.transformParameter,
  })}.`;
}
