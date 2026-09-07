import { Button } from "./ui/button";
import { Field } from "./ui/field";
import { Select } from "./ui/select";
import type { CreateAttributeRequest } from "../lib/api/types";
import { any, purposes } from "../lib/purposes";

type ClaimFormProps = {
  fieldErrors: Record<string, string[]>;
  busy: boolean;
  onSubmit: (body: CreateAttributeRequest) => void;
};

export function ClaimForm({ fieldErrors, busy, onSubmit }: ClaimFormProps) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const label = String(form.get("label")).trim();
    const collectedFor = String(form.get("collectedFor"));

    onSubmit({
      key: String(form.get("key")).trim(),
      value: String(form.get("value")).trim(),
      label: label === "" ? null : label,
      collectedFor: collectedFor === any ? null : collectedFor,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-4">
      <Field
        label="Kind of claim"
        name="key"
        defaultValue="name"
        required
        placeholder="name"
        errors={fieldErrors.key}
      />

      <Field label="Value" name="value" required errors={fieldErrors.value} />

      <Field
        label="When it applies"
        name="label"
        placeholder="legal, professional, family"
        errors={fieldErrors.label}
      />

      <Select
        label="Collected for"
        name="collectedFor"
        defaultValue={any}
        options={[{ value: any, label: "No stated limit" }, ...purposes]}
      />

      <Button type="submit" disabled={busy}>
        {busy ? "Adding" : "Add claim"}
      </Button>
    </form>
  );
}
