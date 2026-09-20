import { useState } from "react";
import { NoProfile } from "../components/no-profile";
import { Alert } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { ConfirmButton } from "../components/ui/confirm-button";
import { Field } from "../components/ui/field";
import { List, ListItem } from "../components/ui/list";
import { PageHeader } from "../components/ui/page-header";
import { Value } from "../components/ui/value";
import { useNotify } from "../components/ui/toast";
import { acceptStanding, issueStanding, removeStanding } from "../lib/api/client";
import { limits } from "../lib/api/limits";
import { useStandings } from "../lib/api/queries";
import type { StandingResponse } from "../lib/api/types";

export function meta() {
  return [{ title: "People | FacetIQ" }];
}

export default function Standings() {
  const { result, refresh } = useStandings();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);
  // The row stays in place while it is confirmed, so the button holds itself rather than
  // letting a second click land on a standing that has already been accepted.
  const [confirming, setConfirming] = useState<string | null>(null);
  const notify = useNotify();

  const issued = result?.ok ? result.data.issued : [];
  const held = result?.ok ? result.data.held : [];
  const noProfile = result?.ok === false && result.error.kind === "forbidden";
  const error = result?.ok === false && !noProfile ? "Could not load your connections." : null;

  async function handleIssue(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Read before the await: React clears currentTarget once the handler yields.
    const element = event.currentTarget;
    const form = new FormData(element);

    setBusy(true);
    setFieldErrors({});

    const result = await issueStanding({
      email: String(form.get("email")).trim(),
      value: String(form.get("value")).trim(),
    });

    setBusy(false);

    if (result.ok) {
      element.reset();
      notify("success", `Added ${result.data.holder}. It takes effect once they confirm.`);
      await refresh();
      return;
    }

    if (result.error.kind === "validation") {
      setFieldErrors(result.error.fieldErrors);
      return;
    }

    if (result.error.kind !== "unauthorized") {
      notify("error", "That person was not added. Try again.");
    }
  }

  async function handleAccept(standing: StandingResponse) {
    setConfirming(standing.id);

    const result = await acceptStanding(standing.id);

    if (result.ok) {
      notify("success", `Confirmed. ${standing.issuer}'s rules now treat you as their ${standing.value}.`);
      await refresh();
    } else if (result.error.kind !== "unauthorized") {
      notify("error", "That was not confirmed. Try again.");
    }

    setConfirming(null);
  }

  async function handleRemove(standing: StandingResponse, done: string) {
    const result = await removeStanding(standing.id);

    if (result.ok) {
      notify("success", done);
      await refresh();
      return;
    }

    if (result.error.kind !== "unauthorized") {
      notify("error", "That was not removed. Try again.");
    }
  }

  return (
    <>
      <PageHeader
        title="People"
        description="Say who someone is to you. Your rules use it once they confirm. This only changes what your rules share with them: what you see of someone else depends on their rules, and on whether they have added you."
      />

      {error && <div className="mt-6"><Alert>{error}</Alert></div>}

      {noProfile ? (
        <div className="mt-8">
          <NoProfile />
        </div>
      ) : (
        <>
          <h2 className="mt-10 text-base font-medium text-ink">How others describe you</h2>

          <p className="mt-1 max-w-prose text-sm text-muted">
            Their rules can use these once you confirm. Confirming does not show you anything of theirs.
          </p>

          <div className="mt-3">
            {held.length === 0 ? (
              <p className="text-sm text-muted">Nobody has added you yet.</p>
            ) : (
              <List>
                {held.map((standing) => (
                  <ListItem key={standing.id}>
                    <span className="text-sm text-ink">
                      {standing.issuer} calls you their <Value>{standing.value}</Value>
                    </span>

                    {standing.acceptedAt ? (
                      <span className="ml-auto flex items-center gap-4">
                        <span className="text-sm text-muted">Confirmed</span>
                        <ConfirmButton
                          label="Remove"
                          confirmLabel="Yes, remove"
                          onConfirm={() =>
                            handleRemove(
                              standing,
                              `Removed. ${standing.issuer}'s rules no longer treat you as their ${standing.value}.`,
                            )
                          }
                        />
                      </span>
                    ) : (
                      <span className="ml-auto flex items-center gap-4">
                        <ConfirmButton
                          label="Decline"
                          confirmLabel="Yes, decline"
                          onConfirm={() => handleRemove(standing, "Declined.")}
                        />
                        <Button
                          type="button"
                          disabled={confirming === standing.id}
                          onClick={() => handleAccept(standing)}
                        >
                          {confirming === standing.id ? "Confirming" : "Confirm"}
                        </Button>
                      </span>
                    )}
                  </ListItem>
                ))}
              </List>
            )}
          </div>

          <h2 className="mt-10 text-base font-medium text-ink">Who others are to you</h2>

          <p className="mt-1 max-w-prose text-sm text-muted">
            Your rules use these when the person asks about you.
          </p>

          <div className="mt-3">
            {issued.length === 0 ? (
              <p className="text-sm text-muted">You have not added anyone yet.</p>
            ) : (
              <List>
                {issued.map((standing) => (
                  <ListItem key={standing.id}>
                    <span className="text-sm text-ink">
                      {standing.issuerKind === "Institution"
                        ? `${standing.issuer} says ${standing.holder} is your `
                        : `${standing.holder} is your `}
                      <Value>{standing.value}</Value>
                    </span>

                    <span className="ml-auto flex items-center gap-4">
                      <span className="text-sm text-muted">
                        {standing.acceptedAt ? "Confirmed" : "Waiting for them to confirm"}
                      </span>
                      <ConfirmButton
                        label="Remove"
                        confirmLabel="Yes, remove"
                        onConfirm={() =>
                          handleRemove(standing, `Removed. ${standing.holder} is no longer your ${standing.value}.`)
                        }
                      />
                    </span>
                  </ListItem>
                ))}
              </List>
            )}
          </div>

          <h2 className="mt-10 text-base font-medium text-ink">Add someone</h2>

          <form onSubmit={handleIssue} className="mt-4 max-w-sm space-y-4">
            <Field
              label="Their email"
              name="email"
              type="email"
              maxLength={limits.email}
              required
              placeholder="name@example.com"
              hint="The address they use on FacetIQ. They confirm before it takes effect."
              errors={fieldErrors.email}
            />
            <Field
              label="They are your"
              name="value"
              maxLength={limits.relationship}
              required
              placeholder="colleague"
              hint="One word your rules can use, such as colleague, friend or doctor."
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
