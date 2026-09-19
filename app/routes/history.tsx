import { NoProfile } from "../components/no-profile";
import { Alert } from "../components/ui/alert";
import { List, ListItem } from "../components/ui/list";
import { PageHeader } from "../components/ui/page-header";
import { Value, type Tone } from "../components/ui/value";
import { useHistory } from "../lib/api/queries";
import type { DisclosureRecordResponse } from "../lib/api/types";
import { displayLabel, kindLabel } from "../lib/options";

export function meta() {
  return [{ title: "Requests | FacetIQ" }];
}

export default function History() {
  const { result } = useHistory();

  const records = result?.ok ? result.data : [];
  const noProfile = result?.ok === false && result.error.kind === "forbidden";
  const error =
    result?.ok === false && !noProfile && result.error.kind !== "unauthorized"
      ? "Could not load your requests."
      : null;

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
        <p className="mt-8 text-sm text-muted">Nobody has asked about you yet.</p>
      ) : (
        <List className="mt-8">
          {records.map((record) => {
            const given = outcome(record);

            return (
              <ListItem key={record.id} className="items-start gap-4">
                <div className="flex-1">
                  <p className="text-sm text-ink">
                    {record.isSelf
                      ? `You looked at your own ${kindLabel(record.attributeKey).toLowerCase()}.`
                      : `${record.requester ?? "An account that no longer exists"} asked for your ${kindLabel(record.attributeKey).toLowerCase()} for ${record.purpose.toLowerCase()} reasons.`}
                  </p>

                  <p className="mt-1.5 text-sm text-muted">
                    <Value tone={given.tone}>{given.label}</Value>{" "}
                    {given.reason}
                    {record.justifyingPrinciple && ` Your rule: ${record.justifyingPrinciple}`}
                  </p>
                </div>

                <time
                  dateTime={record.timestamp}
                  className="text-xs text-muted tabular-nums"
                >
                  {new Date(record.timestamp).toLocaleString()}
                </time>
              </ListItem>
            );
          })}
        </List>
      )}
    </>
  );
}

const refusals: Record<string, string> = {
  NoMatchingNorm: "No rule of yours covered it.",
  AmbiguousNorms: "Two of your rules disagreed.",
  RefusedByRule: "Your rule refused it.",
  PurposeIncompatible: "The claim is limited to another reason.",
  ClaimUnavailable: "The claim was no longer held.",
};

// What was given, short enough to sit beside the rest of the line, and why where a refusal needs it.
function outcome(record: DisclosureRecordResponse): { label: string; tone: Tone; reason?: string } {
  if (record.outcome === "Deny") {
    return {
      label: "Nothing shared",
      tone: "withheld",
      reason: refusals[record.denyReason ?? ""],
    };
  }

  if (record.isSelf) {
    return { label: "Every claim of that kind", tone: "shared" };
  }

  if (record.outcome === "Return") {
    return { label: "Shared as you hold it", tone: "shared" };
  }

  return {
    label: displayLabel({
      action: record.outcome,
      transform: record.transform ?? "None",
      transformParameter: record.transformParameter,
    }),
    tone: "withheld",
  };
}
