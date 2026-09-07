import type { AttributeResponse, NormConflictResponse } from "../lib/api/types";

type NormConflictProps = {
  conflict: NormConflictResponse;
  claims: AttributeResponse[];
};

/**
 * Shown in place rather than in a dialog. The subject has to compare what they wrote against what
 * is already there, and a modal would cover the form they need to edit.
 */
export function NormConflict({ conflict, claims }: NormConflictProps) {
  return (
    <section
      role="alert"
      className="rounded-md border border-amber-300 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950"
    >
      <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
        Not saved. This rule cannot be told apart from{" "}
        {conflict.collisions.length === 1 ? "one you have already written" : "rules you have already written"}.
      </h3>

      <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">
        Each pair below scores the same specificity, so nothing decides between them. Bind another
        condition on one of them, or change what this rule releases.
      </p>

      <ul className="mt-3 space-y-3">
        {conflict.collisions.map((collision, index) => (
          <li
            key={`${collision.existing.id}-${index}`}
            className="border-t border-amber-200 pt-3 text-sm text-amber-900 dark:border-amber-900 dark:text-amber-200"
          >
            <p>
              Collides with: <span className="font-medium">{name(collision.existing.attributeId, claims)}</span>
              {collision.existing.purpose ? ` for ${collision.existing.purpose.toLowerCase()} purposes` : " for any purpose"}
              {collision.existing.relationship ? `, to anyone holding "${collision.existing.relationship}"` : ", to anyone"}.
            </p>

            <p className="mt-1 text-amber-800 dark:text-amber-300">
              Both would apply to {witness(collision.overlappingRelationship, collision.overlappingPurpose)},
              at specificity {collision.specificity}.
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function name(attributeId: string, claims: AttributeResponse[]): string {
  const claim = claims.find((candidate) => candidate.id === attributeId);

  return claim ? claim.value : "a claim you no longer hold";
}

function witness(relationship: string | null, purpose: string | null): string {
  const who = relationship ? `someone holding "${relationship}"` : "anyone";
  const why = purpose ? `for ${purpose.toLowerCase()} purposes` : "for any purpose";

  return `${who} asking ${why}`;
}
