import { ConfirmButton } from "./ui/confirm-button";
import { List, ListItem } from "./ui/list";
import type { AttributeResponse, NormResponse } from "../lib/api/types";
import { displayLabel, kindLabel } from "../lib/options";

type NormListProps = {
  norms: NormResponse[];
  claims: AttributeResponse[];
  onRemove: (norm: NormResponse) => Promise<void>;
};

export function NormList({ norms, claims, onRemove }: NormListProps) {
  if (norms.length === 0) {
    return (
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        No rules yet, so nobody else can see anything about you.
      </p>
    );
  }

  return (
    <List>
      {norms.map((norm) => (
        <ListItem key={`${norm.id}-${norm.version}`} className="items-start gap-4">
          <div className="flex-1">
            <p className="text-sm text-neutral-900 dark:text-neutral-100">
              <Claim norm={norm} claims={claims} /> {who(norm.relationship)}, {why(norm.purpose)}.
            </p>

            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {displayLabel(norm.transform, norm.transformParameter)}. {norm.justifyingPrinciple}
            </p>
          </div>

          <ConfirmButton label="Remove" confirmLabel="Remove rule" onConfirm={() => onRemove(norm)} />
        </ListItem>
      ))}
    </List>
  );
}

function Claim({ norm, claims }: { norm: NormResponse; claims: AttributeResponse[] }) {
  const claim = claims.find((candidate) => candidate.id === norm.attributeId);

  if (!claim) {
    return <span className="text-neutral-500">A claim you no longer hold</span>;
  }

  const name = claim.key === "name" ? claim.value : kindLabel(claim.key);

  return <span className="font-medium">{name}</span>;
}

export function who(relationship: string | null): string {
  return relationship
    ? `is shared with people you have described as ${relationship}`
    : "is shared with anyone";
}

export function why(purpose: string | null): string {
  return purpose ? `when they ask for ${purpose.toLowerCase()} reasons` : "for any reason";
}
