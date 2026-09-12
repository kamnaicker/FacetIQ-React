import { ConfirmButton } from "./ui/confirm-button";
import { List, ListItem } from "./ui/list";
import type { AttributeResponse } from "../lib/api/types";
import { kindLabel } from "../lib/options";

type ClaimListProps = {
  claims: AttributeResponse[];
  onDelete: (claim: AttributeResponse) => Promise<void>;
};

export function ClaimList({ claims, onDelete }: ClaimListProps) {
  if (claims.length === 0) {
    return (
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        You have not added any claims yet.
      </p>
    );
  }

  const keys = [...new Set(claims.map((claim) => claim.key))];

  return (
    <div className="space-y-6">
      {keys.map((key) => (
        <section key={key}>
          <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {kindLabel(key)}
          </h3>

          <List className="mt-2">
            {claims
              .filter((claim) => claim.key === key)
              .map((claim) => (
                <ListItem key={claim.id}>
                  <span className="text-sm text-neutral-900 dark:text-neutral-100">
                    {claim.value}
                  </span>

                  {claim.label && (
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">
                      {claim.label}
                    </span>
                  )}

                  {claim.collectedFor && (
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">
                      only for {claim.collectedFor.toLowerCase()} reasons
                    </span>
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
