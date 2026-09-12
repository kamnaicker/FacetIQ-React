import { ConfirmButton } from "./ui/confirm-button";
import { List, ListItem } from "./ui/list";
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
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        No rules yet, so nobody else can see anything about you.
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
          <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {describe(claim)}
          </h3>

          <List className="mt-2">
            {rules.map((norm) => (
              <ListItem key={`${norm.id}-${norm.version}`} className="items-start gap-4">
                <div className="flex-1">
                  <p className="text-sm text-neutral-900 dark:text-neutral-100">
                    {norm.action === "Deny" ? "Not " : ""}
                    {norm.action === "Deny" ? who(norm.relationship) : capitalise(who(norm.relationship))},{" "}
                    {why(norm.purpose)}.
                  </p>

                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    {norm.action === "Deny" ? "" : `${displayLabel(norm)}. `}
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

function describe(claim: AttributeResponse): string {
  return claim.key === "name" ? claim.value : `${kindLabel(claim.key)}: ${claim.value}`;
}

function capitalise(sentence: string): string {
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}

export function who(relationship: string | null): string {
  return relationship
    ? `shared with people you have described as ${relationship}`
    : "shared with anyone";
}

export function why(purpose: string | null): string {
  return purpose ? `when they ask for ${purpose.toLowerCase()} reasons` : "for any reason";
}
