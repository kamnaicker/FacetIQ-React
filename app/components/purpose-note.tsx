import { purposes } from "../lib/options";

// The five reasons read as bare words on their own, and they appear on three pages. The
// explanation is kept off the controls: somebody picking one reason should not have to read
// five explanations first, and somebody who does not know the words can open this once.
const meanings: Record<string, string> = {
  Identification: "They need to prove who you are, for example before handing something over.",
  Regulatory: "Something official or legal requires them to ask, for example a bank or a government form.",
  Clinical: "They are asking in order to give you medical care.",
  Social: "An ordinary, everyday reason, with nothing official behind it.",
  Religious: "The reason has to do with faith or a religious community.",
};

export function PurposeNote({ className = "" }: { className?: string }) {
  return (
    <details className={`max-w-prose ${className}`}>
      <summary className="focus-ring w-fit cursor-pointer rounded text-sm text-muted hover:text-ink">
        What do these reasons mean?
      </summary>

      <dl className="mt-3 space-y-3 border-l border-line pl-4">
        {purposes.map((purpose) => (
          <div key={purpose.value}>
            <dt className="text-sm font-medium text-ink">{purpose.label}</dt>
            <dd className="text-sm text-muted">{meanings[purpose.value]}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}
