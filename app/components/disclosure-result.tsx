import type { DisclosureResponse } from "../lib/api/types";

export function DisclosureResult({ result }: { result: DisclosureResponse }) {
  return (
    <section className="mt-8 rounded-md border border-neutral-200 dark:border-neutral-800">
      <dl className="divide-y divide-neutral-200 dark:divide-neutral-800">
        <Row label="Outcome">{result.outcome}</Row>

        {result.value !== null && <Row label="Value">{result.value}</Row>}

        {result.values !== null && (
          <Row label="Values">
            <ul className="space-y-1">
              {result.values.map((value) => (
                <li key={value}>{value}</li>
              ))}
            </ul>
          </Row>
        )}

        {result.denyReason !== null && (
          <Row label="Refused because">{result.denyReason}</Row>
        )}

        {result.justifyingPrinciple !== null && (
          <Row label="Justifying principle">{result.justifyingPrinciple}</Row>
        )}
      </dl>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 px-4 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="text-sm text-neutral-500 dark:text-neutral-400">{label}</dt>
      <dd className="text-sm text-neutral-900 dark:text-neutral-100">{children}</dd>
    </div>
  );
}
