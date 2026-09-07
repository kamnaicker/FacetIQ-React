import type { AttributeResponse } from "../lib/api/types";

export function ClaimList({ claims }: { claims: AttributeResponse[] }) {
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
          <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{key}</h3>

          <ul className="mt-2 divide-y divide-neutral-200 rounded-md border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
            {claims
              .filter((claim) => claim.key === key)
              .map((claim) => (
                <li key={claim.id} className="flex flex-wrap items-baseline gap-x-3 px-4 py-3">
                  <span className="text-sm text-neutral-900 dark:text-neutral-100">
                    {claim.value}
                  </span>

                  {claim.label && (
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">
                      {claim.label}
                    </span>
                  )}

                  {claim.collectedFor && (
                    <span className="ml-auto text-sm text-neutral-500 dark:text-neutral-400">
                      collected for {claim.collectedFor.toLowerCase()} purposes only
                    </span>
                  )}
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
