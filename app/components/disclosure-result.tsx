import type { DisclosureResponse } from "../lib/api/types";
import { Value } from "./ui/value";

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
      className="mt-8 max-w-sm rounded-lg border border-line bg-surface px-5 py-5"
    >
      <Body result={result} />

      {result.justifyingPrinciple !== null && (
        <p className="mt-4 border-t border-line pt-3 text-sm text-muted">
          In their words: {result.justifyingPrinciple}
        </p>
      )}
    </section>
  );
}

function Body({ result }: { result: DisclosureResponse }) {
  if (result.values !== null) {
    return result.values.length === 0 ? (
      <Headline>You have not added anything like that about yourself yet.</Headline>
    ) : (
      <>
        <Headline>You asked about yourself, so here is everything you have added.</Headline>
        <ul className="mt-3 space-y-1 text-xl text-ink">
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
        <Headline tone="withheld">Nothing shared</Headline>
        <p className="mt-3 text-sm text-muted">
          {refusals[result.denyReason ?? ""] ?? "Their rules do not allow it."}
        </p>
      </>
    );
  }

  return (
    <>
      <Headline tone={result.outcome === "Transform" ? "withheld" : "shared"}>
        {result.outcome === "Transform" ? "Shared in a reduced form" : "Shared as they hold it"}
      </Headline>
      <p className="mt-3 text-xl text-ink">{result.value}</p>
      {result.outcome === "Transform" && (
        <p className="mt-2 text-sm text-muted">
          Their rule shares only this much for this reason, never the exact detail.
        </p>
      )}
    </>
  );
}

type HeadlineProps = { children: React.ReactNode; tone?: "shared" | "withheld" };

function Headline({ children, tone }: HeadlineProps) {
  if (!tone) {
    return <h2 className="text-sm font-medium text-ink">{children}</h2>;
  }

  return (
    <h2 className="text-sm font-medium">
      <Value tone={tone}>{children}</Value>
    </h2>
  );
}
