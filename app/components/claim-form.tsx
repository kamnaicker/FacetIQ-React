import { useState } from "react";
import { Button } from "./ui/button";
import { Field } from "./ui/field";
import { PhoneField } from "./ui/phone-field";
import { Select } from "./ui/select";
import { limits } from "../lib/api/limits";
import type { CreateAttributeRequest } from "../lib/api/types";
import { any, kinds, purposes } from "../lib/options";

type ClaimFormProps = {
  fieldErrors: Record<string, string[]>;
  busy: boolean;
  onSubmit: (body: CreateAttributeRequest) => Promise<boolean>;
};

// The label above this input changes with the kind chosen, but what the input does never does,
// so one line covers all of them rather than seven lines saying the same thing.
const valueHint =
  "Enter your answer the way you want other people to see it. FacetIQ never corrects or reformats what you type.";

export function ClaimForm({ fieldErrors, busy, onSubmit }: ClaimFormProps) {
  const [kind, setKind] = useState("name");
  const [saves, setSaves] = useState(0);
  const selected = kinds.find((option) => option.value === kind) ?? kinds[0];

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const element = event.currentTarget;
    const form = new FormData(element);
    const label = String(form.get("label")).trim();
    const collectedFor = String(form.get("collectedFor"));

    const saved = await onSubmit({
      key: kind,
      value: String(form.get("value")).trim(),
      label: label === "" ? null : label,
      collectedFor: collectedFor === any ? null : collectedFor,
    });

    if (saved) {
      element.reset();
      setSaves(saves + 1);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-5">
      <Select
        label="What are you adding"
        name="key"
        hint="Pick what you want to add. The box below changes to match what you pick."
        options={kinds}
        value={kind}
        onValueChange={setKind}
      />

      {/* Remounted after each save so the phone number clears with the rest of the form. */}
      {kind === "phone" ? (
        <PhoneField
          key={`${kind}-${saves}`}
          label={selected.label}
          name="value"
          defaultCountry="ZA"
          hint={valueHint}
          errors={fieldErrors.value}
        />
      ) : (
        <Field
          key={kind}
          label={selected.label}
          name="value"
          type={selected.type ?? "text"}
          maxLength={limits.claimValue}
          required
          placeholder={selected.placeholder}
          hint={valueHint}
          errors={fieldErrors.value}
        />
      )}

      <Field
        label="Where you use it"
        name="label"
        maxLength={limits.claimLabel}
        placeholder="at work"
        hint="Write a short note for yourself. If you add two names, the note is how you tell the two names apart when you write your rules. Nobody who asks about you is shown the note."
        errors={fieldErrors.label}
      />

      <Select
        label="Only ever share this for"
        name="collectedFor"
        hint={`Leave this set to "Any reason" unless you want a hard limit. If you pick one reason, FacetIQ refuses every request that gives a different reason, even when one of your rules would have shared it.`}
        defaultValue={any}
        options={[{ value: any, label: "Any reason" }, ...purposes]}
      />

      <Button type="submit" disabled={busy}>
        {busy ? "Adding" : "Add claim"}
      </Button>
    </form>
  );
}
