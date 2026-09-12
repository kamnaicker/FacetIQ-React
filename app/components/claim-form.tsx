import { useState } from "react";
import { Button } from "./ui/button";
import { Field } from "./ui/field";
import { Select } from "./ui/select";
import type { CreateAttributeRequest } from "../lib/api/types";
import { any, kinds, purposes } from "../lib/options";

type ClaimFormProps = {
  fieldErrors: Record<string, string[]>;
  busy: boolean;
  onSubmit: (body: CreateAttributeRequest) => Promise<boolean>;
};

export function ClaimForm({ fieldErrors, busy, onSubmit }: ClaimFormProps) {
  const [kind, setKind] = useState("name");
  const isDate = kind === "dateOfBirth";

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
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-5">
      <Select label="Kind" name="key" options={kinds} value={kind} onValueChange={setKind} />

      <Field
        key={kind}
        label={isDate ? "Date of birth" : "Name"}
        name="value"
        type={isDate ? "date" : "text"}
        required
        placeholder={isDate ? undefined : "Amara Nwosu"}
        hint={isDate ? undefined : "Exactly as you want it shown, in any script or spelling."}
        errors={fieldErrors.value}
      />

      <Field
        label="Where you use it"
        name="label"
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
