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
      <Select label="Kind" name="key" options={kinds} value={kind} onValueChange={setKind} />

      {/* Remounted after each save so the phone number clears with the rest of the form. */}
      {kind === "phone" ? (
        <PhoneField
          key={`${kind}-${saves}`}
          label={selected.label}
          name="value"
          defaultCountry="ZA"
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
          hint={kind === "name" ? "Exactly as you want it shown, in any script or spelling." : undefined}
          errors={fieldErrors.value}
        />
      )}

      <Field
        label="Where you use it"
        name="label"
        maxLength={limits.claimLabel}
        placeholder="professional"
        hint="A note for yourself, so you can tell your claims apart when writing rules."
        errors={fieldErrors.label}
      />

      <Select
        label="Never shared except for"
        name="collectedFor"
        hint="Pick a reason to keep this claim to it. Your rules cannot share it for any other reason."
        defaultValue={any}
        options={[{ value: any, label: "Any reason" }, ...purposes]}
      />

      <Button type="submit" disabled={busy}>
        {busy ? "Adding" : "Add claim"}
      </Button>
    </form>
  );
}
