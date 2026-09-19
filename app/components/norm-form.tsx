import { useState } from "react";
import { Link } from "react-router";
import { Button } from "./ui/button";
import { Field } from "./ui/field";
import { Select, type Option } from "./ui/select";
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
      <p className="text-sm text-muted">
        <Link to="/claims" className="text-ink underline underline-offset-4">
          Add a claim
        </Link>{" "}
        first, then choose here who can see it.
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
        options={claimOptions}
        value={selected.id}
        onValueChange={(id) => {
          setClaimId(id);
          setDisplay("None");
        }}
      />

      {terms.length === 0 ? (
        <p className="text-sm text-muted">
          Anyone can see it. To limit a rule to certain people, first say who they are to you on
          the{" "}
          <Link to="/people" className="text-ink underline underline-offset-4">
            People page
          </Link>
          .
        </p>
      ) : (
        <Select
          label="Who can see it"
          name="relationship"
          hint="People you have described this way, once they have confirmed it."
          defaultValue={any}
          options={[{ value: any, label: "Anyone" }, ...terms.map((term) => ({ value: term, label: term }))]}
        />
      )}

      <Select
        label="When they are asking for"
        name="purpose"
        hint="The reason they give when they ask."
        errors={fieldErrors.purpose}
        defaultValue={any}
        options={[{ value: any, label: "Any purpose" }, ...purposes]}
      />

      <Select
        label="How it is shown"
        name="transform"
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
          hint="They see only whether you are over or under this age, never the date."
          errors={fieldErrors.transformParameter}
        />
      )}

      <Field
        label="Why you are sharing it"
        name="justifyingPrinciple"
        required
        placeholder="Colleagues know me by my professional name."
        hint="Kept with every answer, so you can check later why something was shared."
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
