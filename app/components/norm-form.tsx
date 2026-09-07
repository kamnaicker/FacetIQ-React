import { Button } from "./ui/button";
import { Field } from "./ui/field";
import { Select, type Option } from "./ui/select";
import type { AttributeResponse, CreateNormRequest } from "../lib/api/types";
import { any, purposes, transforms } from "../lib/purposes";

type NormFormProps = {
  claims: AttributeResponse[];
  fieldErrors: Record<string, string[]>;
  busy: boolean;
  onSubmit: (body: CreateNormRequest) => void;
};

export function NormForm({ claims, fieldErrors, busy, onSubmit }: NormFormProps) {
  const claimOptions: Option[] = claims.map((claim) => ({
    value: claim.id,
    label: claim.label ? `${claim.value} (${claim.label})` : claim.value,
  }));

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const relationship = String(form.get("relationship")).trim();
    const purpose = String(form.get("purpose"));
    const transform = String(form.get("transform"));
    const parameter = String(form.get("transformParameter")).trim();

    onSubmit({
      attributeId: String(form.get("attributeId")),
      relationship: relationship === "" ? null : relationship,
      purpose: purpose === any ? null : purpose,
      transform: transform === "None" ? null : transform,
      transformParameter: parameter === "" ? null : parameter,
      justifyingPrinciple: String(form.get("justifyingPrinciple")).trim(),
    });
  }

  if (claimOptions.length === 0) {
    return (
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        Add a claim before writing a rule about one.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-4">
      <Select
        label="Release"
        name="attributeId"
        defaultValue={claimOptions[0].value}
        options={claimOptions}
      />

      <Field
        label="To anyone holding"
        name="relationship"
        placeholder="Leave empty for anyone"
        errors={fieldErrors.relationship}
      />

      <Select
        label="Asking for"
        name="purpose"
        defaultValue={any}
        options={[{ value: any, label: "Any purpose" }, ...purposes]}
      />

      <Select label="Shaped by" name="transform" defaultValue="None" options={transforms} />

      <Field
        label="Transform setting"
        name="transformParameter"
        placeholder="For example 18"
        errors={fieldErrors.transformParameter}
      />

      <Field
        label="Because"
        name="justifyingPrinciple"
        required
        placeholder="The principle this rule rests on"
        errors={fieldErrors.justifyingPrinciple}
      />

      <Button type="submit" disabled={busy}>
        {busy ? "Saving" : "Save rule"}
      </Button>
    </form>
  );
}
