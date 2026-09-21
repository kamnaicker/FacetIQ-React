import { ConfirmButton } from "./ui/confirm-button";
import { List, ListItem } from "./ui/list";
import { Value } from "./ui/value";
import type { AttributeResponse, NormResponse } from "../lib/api/types";
import { displayLabel, kindLabel } from "../lib/options";

type NormListProps = {
  norms: NormResponse[];
  claims: AttributeResponse[];
  onRemove: (norm: NormResponse) => Promise<void>;
};

// Grouped by the claim each rule releases, in the order the claims are held, so a person reads
// "here is everything I have said about this name" rather than one long list of sentences.
export function NormList({ norms, claims, onRemove }: NormListProps) {
  if (norms.length === 0) {
    return (
      <p className="max-w-prose text-sm text-muted">
        You have not written any rules yet, which means anybody who asks about you is told
        nothing. Write your first rule at the bottom of this page.
      </p>
    );
  }

  const groups = claims
    .map((claim) => ({ claim, rules: norms.filter((norm) => norm.attributeId === claim.id) }))
    .filter((group) => group.rules.length > 0);

  return (
    <div className="space-y-6">
      {groups.map(({ claim, rules }) => (
        <section key={claim.id}>
          <h3 className="text-sm font-medium text-ink">{describe(claim)}</h3>

          <List className="mt-2">
            {rules.map((norm) => (
              <ListItem key={`${norm.id}-${norm.version}`} className="items-start gap-4">
                <div className="flex-1">
                  <RuleSentence norm={norm} />

                  <p className="mt-1.5 text-sm text-muted">
                    {norm.action !== "Deny" && <Value>{displayLabel(norm)}</Value>}{" "}
                    {norm.justifyingPrinciple}
                  </p>
                </div>

                <ConfirmButton label="Remove" confirmLabel="Remove rule" onConfirm={() => onRemove(norm)} />
              </ListItem>
            ))}
          </List>
        </section>
      ))}
    </div>
  );
}

// The parts that change between rules are tinted, so a list of them can be scanned.
function RuleSentence({ norm }: { norm: NormResponse }) {
  const tone = norm.action === "Deny" ? "withheld" : "shared";

  return (
    <p className="text-sm text-ink">
      {norm.action === "Deny" ? "Not shared with " : "Shared with "}
      {norm.relationship ? (
        <>
          people you have described as <Value tone={tone}>{norm.relationship}</Value>
        </>
      ) : (
        <Value tone={tone}>anyone</Value>
      )}
      {norm.purpose ? (
        <>
          , when they ask for <Value tone={tone}>{norm.purpose.toLowerCase()}</Value> reasons.
        </>
      ) : (
        <>
          , for <Value tone={tone}>any reason</Value>.
        </>
      )}
    </p>
  );
}

function describe(claim: AttributeResponse): string {
  return claim.key === "name" ? claim.value : `${kindLabel(claim.key)}: ${claim.value}`;
}
