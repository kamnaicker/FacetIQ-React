import type { DisclosureResponse } from "../lib/api/types";

// Outcomes and reasons arrive as the API's names. They are turned into sentences here, and only
// here, so the words a person reads never depend on what the engine calls things.
const refusals: Record<string, string> = {
  NoMatchingNorm: "They have no rule that shares this with you for this reason.",
  AmbiguousNorms: "Their rules disagree about this request, so nothing is shared until they resolve it.",
  PurposeIncompatible: "They limited this detail to a different reason.",
  RefusedByRule: "They have chosen not to share this with you.",
  ClaimUnavailable: "The detail their rule points to is no longer held.",
};

export function DisclosureResult({ result }: { result: DisclosureResponse }) {
  return (
    <section
      aria-live="polite"
      className="mt-8 rounded-md border border-neutral-200 px-4 py-4 dark:border-neutral-800"
    >
      <Body result={result} />

      {result.justifyingPrinciple !== null && (
        <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
          In their words: {result.justifyingPrinciple}
        </p>
      )}
    </section>
  );
}

function Body({ result }: { result: DisclosureResponse }) {
  if (result.values !== null) {
    return result.values.length === 0 ? (
      <Headline>You hold nothing of this kind yet.</Headline>
    ) : (
      <>
        <Headline>Your own claims, every one of them.</Headline>
        <ul className="mt-2 space-y-1 text-lg text-neutral-900 dark:text-neutral-100">
          {result.values.map((value) => (
            <li key={value}>{value}</li>
          ))}
        </ul>
      </>
    );
  }

  if (result.outcome === "Deny") {
    return (
      <>
        <Headline>Nothing shared.</Headline>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          {refusals[result.denyReason ?? ""] ?? "Their rules do not allow it."}
        </p>
      </>
    );
  }

  return (
    <>
      <Headline>
        {result.outcome === "Transform" ? "Shared in a reduced form." : "Shared as they hold it."}
      </Headline>
      <p className="mt-2 text-lg text-neutral-900 dark:text-neutral-100">{result.value}</p>
      {result.outcome === "Transform" && (
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Their rule shares only this much for this reason, never the exact detail.
        </p>
      )}
    </>
  );
}

function Headline({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{children}</h2>;
}
