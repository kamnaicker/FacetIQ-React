import type { AttributeResponse, NormResponse } from "../lib/api/types";

type NormListProps = {
  norms: NormResponse[];
  claims: AttributeResponse[];
};

export function NormList({ norms, claims }: NormListProps) {
  if (norms.length === 0) {
    return (
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        You have not written any rules yet.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-neutral-200 rounded-md border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
      {norms.map((norm) => (
        <li key={`${norm.id}-${norm.version}`} className="px-4 py-3">
          <p className="text-sm text-neutral-900 dark:text-neutral-100">
            Release <Claim norm={norm} claims={claims} /> to {who(norm)} asking for{" "}
            {why(norm)}.
          </p>

          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {norm.transform === "None" ? "Unchanged" : `Transformed by ${norm.transform}`}
            {norm.transformParameter ? ` (${norm.transformParameter})` : ""}
            {". Specificity "}
            {norm.specificity}.
          </p>

          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {norm.justifyingPrinciple}
          </p>
        </li>
      ))}
    </ul>
  );
}

function Claim({ norm, claims }: { norm: NormResponse; claims: AttributeResponse[] }) {
  const claim = claims.find((candidate) => candidate.id === norm.attributeId);

  if (!claim) {
    return <span className="text-neutral-500">a claim you no longer hold</span>;
  }

  return (
    <span className="font-medium">
      {claim.value}
      {claim.label ? ` (${claim.label})` : ""}
    </span>
  );
}

function who(norm: NormResponse): string {
  return norm.relationship ? `anyone holding "${norm.relationship}"` : "anyone";
}

function why(norm: NormResponse): string {
  return norm.purpose ? `${norm.purpose.toLowerCase()} purposes` : "any purpose";
}
