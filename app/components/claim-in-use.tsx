import { Link } from "react-router";
import type { AttributeResponse, NormResponse } from "../lib/api/types";
import { who, why } from "../lib/options";

type ClaimInUseProps = {
  claim: AttributeResponse;
  rules: NormResponse[];
};

export function ClaimInUse({ claim, rules }: ClaimInUseProps) {
  return (
    <section
      role="alert"
      className="rounded-lg border border-withheld/40 bg-withheld-soft p-4"
    >
      <h3 className="text-sm font-medium text-withheld">
        Not deleted. "{claim.value}" is still shared by {rules.length === 1 ? "a rule" : `${rules.length} rules`}.
      </h3>

      <ul className="mt-2 space-y-1 text-sm text-muted">
        {rules.map((rule) => (
          <li key={rule.id}>
            It is {who(rule.relationship)}, {why(rule.purpose)}.
          </li>
        ))}
      </ul>

      <p className="mt-3 text-sm text-ink">
        <Link to="/norms" className="underline underline-offset-4">
          Remove {rules.length === 1 ? "that rule" : "those rules"}
        </Link>{" "}
        first, then delete the claim.
      </p>
    </section>
  );
}
