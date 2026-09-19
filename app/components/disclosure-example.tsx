import { Value } from "./ui/value";

// Beside the signed out forms. One claim, three askers, three answers, so the product shows what
// it does before an account exists.
const rows = [
  { asker: "A colleague asks your name", answer: <Value>Amara Nwosu</Value> },
  { asker: "A stranger asks your name", answer: <Value>A. N.</Value> },
  {
    asker: "A shop asks your date of birth",
    answer: <Value tone="withheld">Over 18</Value>,
  },
];

export function DisclosureExample() {
  return (
    <section className="rounded-lg border border-line bg-surface p-6">
      <h2 className="text-sm font-medium text-ink">One detail, shown as you decide</h2>

      <dl className="mt-4 space-y-3 text-sm">
        {rows.map((row) => (
          <div
            key={row.asker}
            className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
          >
            <dt className="text-muted">{row.asker}</dt>
            <dd className="self-start">{row.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
