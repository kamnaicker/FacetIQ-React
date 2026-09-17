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
      <p className="text-sm text-muted">No rules yet, so nobody else can see anything about you.</p>
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
            {rules.map((norm) => {
              const tone = norm.action === "Deny" ? "withheld" : "shared";

              return (
              <ListItem key={`${norm.id}-${norm.version}`} className="items-start gap-4">
                <div className="flex-1">
                  <p className="text-sm text-ink">
                    {norm.action === "Deny" ? "Not shared with " : "Shared with "}
                    {norm.relationship ? (
                      <>
                        people you have described as <Value tone={tone}>{norm.relationship}</Value>
                      </>
                    ) : (
                      <Value tone={tone}>anyone</Value>
                    )}
                    ,{" "}
                    {norm.purpose ? (
                      <>
                        when they ask for <Value tone={tone}>{norm.purpose.toLowerCase()}</Value>{" "}
                        reasons
                      </>
                    ) : (
                      <>
                        for <Value tone={tone}>any reason</Value>
                      </>
                    )}
                    .
                  </p>

                  <p className="mt-1.5 text-sm text-muted">
                    {norm.action !== "Deny" && (
                      <>
                        <Value>{displayLabel(norm)}</Value>{" "}
                      </>
                    )}
                    {norm.justifyingPrinciple}
                  </p>
                </div>

                <ConfirmButton label="Remove" confirmLabel="Remove rule" onConfirm={() => onRemove(norm)} />
              </ListItem>
              );
            })}
          </List>
        </section>
      ))}
    </div>
  );
}

function describe(claim: AttributeResponse): string {
  return claim.key === "name" ? claim.value : `${kindLabel(claim.key)}: ${claim.value}`;
}

export function who(relationship: string | null): string {
  return relationship
    ? `shared with people you have described as ${relationship}`
    : "shared with anyone";
}

export function why(purpose: string | null): string {
  return purpose ? `when they ask for ${purpose.toLowerCase()} reasons` : "for any reason";
}
