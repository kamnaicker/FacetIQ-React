import type { AttributeResponse, NormConflictResponse } from "../lib/api/types";
import { kindLabel, who, why } from "../lib/options";

type NormConflictProps = {
  conflict: NormConflictResponse;
  claims: AttributeResponse[];
};

// In place rather than in a dialog, since a modal would cover the form being corrected.
export function NormConflict({ conflict, claims }: NormConflictProps) {
  return (
    <section
      role="alert"
      className="rounded-lg border border-withheld/40 bg-withheld-soft p-4"
    >
      <h3 className="text-sm font-medium text-withheld">
        Not saved. This rule overlaps{" "}
        {conflict.collisions.length === 1 ? "one you already have" : "rules you already have"}.
      </h3>

      <p className="mt-2 max-w-prose text-sm text-ink">
        Both would answer the same question with different things, and neither takes priority.
        Make one of them more specific than the other, by setting both who can see it and what
        they are asking for, or remove the one you no longer want.
      </p>

      <ul className="mt-3 space-y-3">
        {conflict.collisions.map((collision, index) => (
          <li
            key={`${collision.existing.id}-${index}`}
            className="border-t border-withheld/25 pt-3 text-sm text-ink"
          >
            <p>
              <span className="font-medium">{name(collision.existing.attributeId, claims)}</span> is{" "}
              {who(collision.existing.relationship)}, {why(collision.existing.purpose)}.
            </p>

            <p className="mt-1 text-muted">
              Both would apply to {asker(collision.overlappingRelationship)} asking{" "}
              {collision.overlappingPurpose
                ? `for ${collision.overlappingPurpose.toLowerCase()} reasons`
                : "for any reason"}
              .
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function name(attributeId: string, claims: AttributeResponse[]): string {
  const claim = claims.find((candidate) => candidate.id === attributeId);

  if (!claim) {
    return "A claim you no longer hold";
  }

  return claim.key === "name" ? claim.value : kindLabel(claim.key);
}

function asker(relationship: string | null): string {
  return relationship ? `someone you have described as ${relationship}` : "anyone";
}
