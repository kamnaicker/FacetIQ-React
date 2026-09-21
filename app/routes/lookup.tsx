import { useState } from "react";
import { DisclosureResult } from "../components/disclosure-result";
import { PurposeNote } from "../components/purpose-note";
import { Button } from "../components/ui/button";
import { Field } from "../components/ui/field";
import { PageHeader } from "../components/ui/page-header";
import { Select } from "../components/ui/select";
import { useNotify } from "../components/ui/toast";
import { disclose } from "../lib/api/client";
import { limits } from "../lib/api/limits";
import type { DisclosureResponse } from "../lib/api/types";
import { kinds, purposes } from "../lib/options";

export function meta() {
  return [{ title: "Lookup | FacetIQ" }];
}

export default function Lookup() {
  const [result, setResult] = useState<DisclosureResponse | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);
  const notify = useNotify();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    setBusy(true);
    setFieldErrors({});
    setResult(null);

    const outcome = await disclose({
      subjectEmail: String(form.get("subjectEmail")).trim(),
      attributeKey: String(form.get("attributeKey")),
      purpose: String(form.get("purpose")),
    });

    setBusy(false);

    if (outcome.ok) {
      setResult(outcome.data);
      return;
    }

    if (outcome.error.kind === "validation") {
      setFieldErrors(outcome.error.fieldErrors);
      return;
    }

    if (outcome.error.kind === "network") {
      notify("error", "Could not reach the server. Check your connection and try again.");
    } else if (outcome.error.kind !== "unauthorized") {
      notify("error", "Something went wrong. Try again.");
    }
  }

  return (
    <>
      <PageHeader
        title="Lookup"
        description="Ask someone for their name, their phone number, or anything else you need from them. The rules that person has written decide what you are given."
      />

      <form onSubmit={handleSubmit} className="mt-6 max-w-sm space-y-4">
        <Field
          label="Who you are asking"
          name="subjectEmail"
          type="email"
          maxLength={limits.email}
          placeholder="name@example.com"
          hint="Type the email address this person signed up with."
          required
          errors={fieldErrors.subjectEmail}
        />

        <Select
          label="What you want to know"
          name="attributeKey"
          hint="Pick what you want from this person. Their rules may give you less than you asked for."
          defaultValue="name"
          options={kinds}
        />

        <Select
          label="Why you are asking"
          name="purpose"
          hint="Pick your real reason. The person you are asking may share more or less depending on the reason you pick, and that person can see the reason on their own Requests page."
          defaultValue="Social"
          options={purposes}
        />

        <Button type="submit" disabled={busy}>
          {busy ? "Asking" : "Ask"}
        </Button>
      </form>

      <PurposeNote className="mt-8" />

      {result && <DisclosureResult result={result} />}
    </>
  );
}
