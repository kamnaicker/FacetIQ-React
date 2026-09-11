import { useEffect, useState } from "react";
import { NoProfile } from "../components/no-profile";
import { Alert } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Field } from "../components/ui/field";
import { acceptStanding, issueStanding, listStandings } from "../lib/api/client";
import type { StandingResponse } from "../lib/api/types";

export function meta() {
  return [{ title: "People | FacetIQ" }];
}

export default function Standings() {
  const [issued, setIssued] = useState<StandingResponse[]>([]);
  const [held, setHeld] = useState<StandingResponse[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [noProfile, setNoProfile] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const result = await listStandings();

    if (result.ok) {
      setIssued(result.data.issued);
      setHeld(result.data.held);
      return;
    }

    if (result.error.kind === "forbidden") {
      setNoProfile(true);
      return;
    }

    setError("Could not load your connections.");
  }

  async function handleIssue(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    setBusy(true);
    setFieldErrors({});
    setError(null);

    const result = await issueStanding({
      email: String(form.get("email")).trim(),
      value: String(form.get("value")).trim(),
    });

    setBusy(false);

    if (result.ok) {
      event.currentTarget.reset();
      await load();
      return;
    }

    if (result.error.kind === "validation") {
      setFieldErrors(result.error.fieldErrors);
      return;
    }

    setError("Could not add that person.");
  }

  async function handleAccept(id: string) {
    setError(null);

    const result = await acceptStanding(id);

    if (result.ok) {
      await load();
      return;
    }

    setError("Could not confirm that.");
  }

  return (
    <>
      <h1 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        People
      </h1>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        Say who someone is to you. Your rules use it once they confirm.
      </p>

      {error && <div className="mt-6"><Alert>{error}</Alert></div>}

      {noProfile ? (
        <div className="mt-8">
          <NoProfile />
        </div>
      ) : (
        <>
          <h2 className="mt-8 text-base font-semibold text-neutral-900 dark:text-neutral-100">
            How others describe you
          </h2>

          <div className="mt-3">
            {held.length === 0 ? (
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Nobody has added you yet.
              </p>
            ) : (
              <ul className="divide-y divide-neutral-200 rounded-md border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
                {held.map((standing) => (
                  <li
                    key={standing.id}
                    className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3"
                  >
                    <span className="text-sm text-neutral-900 dark:text-neutral-100">
                      {standing.issuer} calls you their {standing.value}
                    </span>

                    {standing.acceptedAt ? (
                      <span className="ml-auto text-sm text-neutral-500 dark:text-neutral-400">
                        Confirmed
                      </span>
                    ) : (
                      <Button
                        type="button"
                        className="ml-auto"
                        onClick={() => handleAccept(standing.id)}
                      >
                        Confirm
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <h2 className="mt-10 text-base font-semibold text-neutral-900 dark:text-neutral-100">
            How you describe others
          </h2>

          <div className="mt-3">
            {issued.length === 0 ? (
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                You have not added anyone yet.
              </p>
            ) : (
              <ul className="divide-y divide-neutral-200 rounded-md border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
                {issued.map((standing) => (
                  <li key={standing.id} className="flex flex-wrap items-center gap-x-3 px-4 py-3">
                    <span className="text-sm text-neutral-900 dark:text-neutral-100">
                      {standing.holder} is your {standing.value}
                    </span>

                    <span className="ml-auto text-sm text-neutral-500 dark:text-neutral-400">
                      {standing.acceptedAt ? "Confirmed" : "Waiting for them to confirm"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <h2 className="mt-10 text-base font-semibold text-neutral-900 dark:text-neutral-100">
            Add someone
          </h2>

          <form onSubmit={handleIssue} className="mt-4 max-w-sm space-y-4">
            <Field
              label="Their email"
              name="email"
              type="email"
              required
              errors={fieldErrors.email}
            />
            <Field
              label="They are your"
              name="value"
              required
              placeholder="colleague"
              errors={fieldErrors.value}
            />

            <Button type="submit" disabled={busy}>
              {busy ? "Adding" : "Add"}
            </Button>
          </form>
        </>
      )}
    </>
  );
}
