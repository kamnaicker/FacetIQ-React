import { ConfirmButton } from "./ui/confirm-button";
import { List, ListItem } from "./ui/list";
import { Value } from "./ui/value";
import type { AttributeResponse } from "../lib/api/types";
import { kindLabel } from "../lib/options";

type ClaimListProps = {
  claims: AttributeResponse[];
  onDelete: (claim: AttributeResponse) => Promise<void>;
};

export function ClaimList({ claims, onDelete }: ClaimListProps) {
  if (claims.length === 0) {
    return (
      <p className="max-w-prose text-sm text-muted">
        You have not added anything about yourself yet. Use the form at the bottom of this page,
        and whatever you add stays private until you write a rule that shares it.
      </p>
    );
  }

  const keys = [...new Set(claims.map((claim) => claim.key))];

  return (
    <div className="space-y-6">
      {keys.map((key) => (
        <section key={key}>
          <h3 className="text-sm font-medium text-ink">{kindLabel(key)}</h3>

          <List className="mt-2">
            {claims
              .filter((claim) => claim.key === key)
              .map((claim) => (
                <ListItem key={claim.id}>
                  <span className="text-sm text-ink">{claim.value}</span>

                  {claim.label && <span className="text-sm text-muted">{claim.label}</span>}

                  {claim.collectedFor && (
                    <Value tone="withheld">
                      only for {claim.collectedFor.toLowerCase()} reasons
                    </Value>
                  )}

                  <span className="ml-auto">
                    <ConfirmButton
                      label="Delete"
                      confirmLabel="Delete for good"
                      onConfirm={() => onDelete(claim)}
                    />
                  </span>
                </ListItem>
              ))}
          </List>
        </section>
      ))}
    </div>
  );
}
