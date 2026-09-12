import { Link } from "react-router";
import type { AttributeResponse, NormResponse } from "../lib/api/types";
import { who, why } from "./norm-list";

type ClaimInUseProps = {
  claim: AttributeResponse;
  rules: NormResponse[];
};

export function ClaimInUse({ claim, rules }: ClaimInUseProps) {
  return (
    <section
      role="alert"
      className="rounded-md border border-amber-300 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950"
    >
      <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
        Not deleted. "{claim.value}" is still shared by {rules.length === 1 ? "a rule" : `${rules.length} rules`}.
      </h3>

      <ul className="mt-2 space-y-1 text-sm text-amber-800 dark:text-amber-300">
        {rules.map((rule) => (
          <li key={rule.id}>
            It is {who(rule.relationship)}, {why(rule.purpose)}.
          </li>
        ))}
      </ul>

      <p className="mt-3 text-sm text-amber-900 dark:text-amber-200">
        <Link to="/norms" className="underline underline-offset-4">
          Remove {rules.length === 1 ? "that rule" : "those rules"}
        </Link>{" "}
        first, then delete the claim.
      </p>
    </section>
  );
}
