import { useState } from "react";
import { Link } from "react-router";
import { Button } from "./ui/button";
import { Field } from "./ui/field";
import { Select, type Option } from "./ui/select";
import { limits } from "../lib/api/limits";
import type { AttributeResponse, CreateNormRequest } from "../lib/api/types";
import { any, deny, displaysFor, kindLabel, purposes } from "../lib/options";

type NormFormProps = {
  claims: AttributeResponse[];
  /** The relationship terms the subject has given people, so a rule can only name one of them. */
  terms: string[];
  fieldErrors: Record<string, string[]>;
  busy: boolean;
  onSubmit: (body: CreateNormRequest) => Promise<boolean>;
};

export function NormForm({ claims, terms, fieldErrors, busy, onSubmit }: NormFormProps) {
  const [claimId, setClaimId] = useState("");
  const [display, setDisplay] = useState("None");

  // Claims arrive after the first render, so fall back to the first one until a choice is made.
  const selected = claims.find((claim) => claim.id === claimId) ?? claims[0];

  if (!selected) {
    return (
      <p className="max-w-prose text-sm text-muted">
        A rule shares one thing you have added about yourself, and you have not added anything
        yet. Add your name or your date of birth on the{" "}
        <Link to="/claims" className="text-ink underline underline-offset-4">
          Claims page
        </Link>{" "}
        first, then come back here and write a rule for it.
      </p>
    );
  }

  const claimOptions: Option[] = claims.map((claim) => ({ value: claim.id, label: describe(claim) }));

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const element = event.currentTarget;
    const form = new FormData(element);
    const relationship = String(form.get("relationship") ?? any);
    const purpose = String(form.get("purpose"));
    const age = String(form.get("age") ?? "").trim();

    const saved = await onSubmit({
      attributeId: selected.id,
      relationship: relationship === any ? null : relationship,
      purpose: purpose === any ? null : purpose,
      transform: display === "None" || display === deny ? null : display,
      transformParameter: display === "Generalise" ? age || "18" : null,
      denyReason: display === deny ? "RefusedByRule" : null,
      justifyingPrinciple: String(form.get("justifyingPrinciple")).trim(),
    });

    if (saved) {
      element.reset();
      setDisplay("None");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-5">
      <Select
        label="What to share"
        name="attributeId"
        hint="Pick which of the things you have added this rule is about. Each thing you have added needs its own rules."
        options={claimOptions}
        value={selected.id}
        onValueChange={(id) => {
          setClaimId(id);
          setDisplay("None");
        }}
      />

      {terms.length === 0 ? (
        <p className="max-w-prose text-sm text-muted">
          This rule will cover everybody who asks, because you have not said who anyone is to you
          yet. To write a rule that covers only your colleagues or only your doctor, add those
          people on the{" "}
          <Link to="/people" className="text-ink underline underline-offset-4">
            People page
          </Link>{" "}
          first.
        </p>
      ) : (
        <Select
          label="Who can see it"
          name="relationship"
          hint={`Pick "Anyone" to cover every person who asks. Pick a word like colleague to cover only the people you have called a colleague on the People page, once each of those people has agreed.`}
          defaultValue={any}
          options={[{ value: any, label: "Anyone" }, ...terms.map((term) => ({ value: term, label: term }))]}
        />
      )}

      <Select
        label="Their reason for asking"
        name="purpose"
        hint={`Leave this on "Any purpose" to cover every reason. Pick one reason to cover only the people who give that reason.`}
        errors={fieldErrors.purpose}
        defaultValue={any}
        options={[{ value: any, label: "Any purpose" }, ...purposes]}
      />

      <Select
        label="How it is shown"
        name="transform"
        hint="Pick how much the person is given when this rule applies."
        errors={fieldErrors.transform}
        options={displaysFor(selected.key)}
        value={display}
        onValueChange={setDisplay}
      />

      {display === "Generalise" && (
        <Field
          label="Age"
          name="age"
          type="number"
          min={1}
          max={150}
          defaultValue={18}
          required
          hint="The person asking is told only that you are older or younger than the age you type, never your date of birth."
          errors={fieldErrors.transformParameter}
        />
      )}

      <Field
        label="Why you are sharing it"
        name="justifyingPrinciple"
        maxLength={limits.principle}
        required
        placeholder="Colleagues know me by my professional name."
        hint="Write a sentence in your own words. The person who asks reads your sentence underneath the answer, and your sentence is kept on your Requests page."
        errors={fieldErrors.justifyingPrinciple}
      />

      <Button type="submit" disabled={busy}>
        {busy ? "Saving" : "Save rule"}
      </Button>
    </form>
  );
}

function describe(claim: AttributeResponse): string {
  if (claim.key === "name") {
    return claim.label ? `${claim.value} (${claim.label})` : claim.value;
  }

  return `${kindLabel(claim.key)}: ${claim.value}`;
}
