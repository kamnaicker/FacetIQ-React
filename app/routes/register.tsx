import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Alert } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Field } from "../components/ui/field";
import { useNotify } from "../components/ui/toast";
import {
  confirmRegistration,
  resendRegistrationCode,
  signOut,
  startRegistration,
} from "../lib/api/client";
import { limits } from "../lib/api/limits";
import { clearCache } from "../lib/api/queries";
import {
  clearRegistration,
  onRegistrationChange,
  readRegistration,
  saveRegistration,
  type PendingRegistration,
} from "../lib/registration";

export function meta() {
  return [{ title: "Register | FacetIQ" }];
}

const alreadyRegistered = "That did not work. If you already have an account, sign in instead.";

// Mirrors the API, which enforces both.
const resendCooldownSeconds = 30;
const maxResends = 3;

export default function Register() {
  // Read on first render: routes only render in the browser, so storage is there.
  const [pending, setPending] = useState(readRegistration);

  // Another tab may cancel this attempt or start a new one.
  useEffect(() => onRegistrationChange(() => setPending(readRegistration())), []);

  if (pending) {
    return <CodeStep key={pending.registrationId} pending={pending} onStartAgain={() => setPending(null)} />;
  }

  return <DetailsStep onStarted={setPending} />;
}

function DetailsStep({ onStarted }: { onStarted: (pending: PendingRegistration) => void }) {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email")).trim();

    // A registration and a session never share a browser, so nobody registering on a shared
    // machine can read the previous person's data while they wait for a code.
    signOut();
    clearCache();

    setBusy(true);
    setFieldErrors({});
    setError(null);

    const result = await startRegistration(email, String(form.get("password")));

    setBusy(false);

    if (result.ok) {
      const started = { registrationId: result.data.registrationId, email, lastSentAt: Date.now() };

      saveRegistration(started);
      onStarted(started);
      return;
    }

    if (result.error.kind === "validation") {
      setFieldErrors(result.error.fieldErrors);
    } else if (result.error.kind === "conflict") {
      setError(alreadyRegistered);
    } else if (result.error.kind === "rateLimited") {
      setError("Too many attempts. Wait a few minutes and try again.");
    } else {
      setError("Could not start the registration. Try again.");
    }
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Register</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && <Alert>{error}</Alert>}

        <Field
          label="Email"
          name="email"
          type="email"
          maxLength={limits.email}
          autoComplete="email"
          placeholder="name@example.com"
          hint="Type an email address you check. Other people use this address to find you on FacetIQ."
          required
          errors={fieldErrors.email}
        />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          hint="At least 6 characters, with an upper and lower case letter, a number and a symbol."
          required
          errors={fieldErrors.password}
        />

        <Button type="submit" disabled={busy}>
          {busy ? "Sending a code" : "Send me a code"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted">
        Already registered?{" "}
        <Link to="/sign-in" className="focus-ring rounded text-ink underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </>
  );
}

function secondsUntilResend(lastSentAt: number): number {
  return Math.max(0, Math.ceil((lastSentAt + resendCooldownSeconds * 1000 - Date.now()) / 1000));
}

function CodeStep({ pending, onStartAgain }: { pending: PendingRegistration; onStartAgain: () => void }) {
  const navigate = useNavigate();
  const notify = useNotify();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [waitSeconds, setWaitSeconds] = useState(() => secondsUntilResend(pending.lastSentAt ?? 0));
  const [resendsLeft, setResendsLeft] = useState(maxResends);

  useEffect(() => {
    if (waitSeconds <= 0) {
      return;
    }

    const timer = window.setTimeout(() => setWaitSeconds((seconds) => seconds - 1), 1000);

    return () => window.clearTimeout(timer);
  }, [waitSeconds]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    setBusy(true);
    setError(null);

    const result = await confirmRegistration(
      pending.registrationId,
      String(form.get("code")).trim(),
      String(form.get("password")),
    );

    setBusy(false);

    if (result.ok) {
      clearRegistration();
      navigate("/sign-in", { state: { email: pending.email, registered: true } });
      return;
    }

    // The API does not say which part was wrong, so neither does this.
    if (result.error.kind === "validation") {
      setError("That code or password is not right, or the code has expired.");
    } else if (result.error.kind === "conflict") {
      setError(alreadyRegistered);
    } else {
      setError("Something went wrong. Try again.");
    }
  }

  async function handleResend() {
    setResending(true);

    const result = await resendRegistrationCode(pending.registrationId);

    setResending(false);

    if (!result.ok) {
      notify("error", "The code was not sent. Try again.");
      return;
    }

    const { sent, retryAfterSeconds, resendsLeft: left } = result.data;

    setResendsLeft(left);
    setWaitSeconds(retryAfterSeconds);

    if (sent) {
      saveRegistration({ ...pending, lastSentAt: Date.now() });
      notify("success", "A new code is on its way. The previous one no longer works.");
    } else if (left > 0 && retryAfterSeconds === 0) {
      notify("error", "The code was not sent. Try again.");
    }
  }

  function handleStartAgain() {
    clearRegistration();
    onStartAgain();
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Check your email</h1>

      <p className="mt-4 text-sm text-muted">
        We sent a six digit code to {pending.email}. Each code lasts ten minutes.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && <Alert>{error}</Alert>}

        <Field
          label="Code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          placeholder="123456"
          required
        />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          hint="The password you chose on the last screen."
          required
        />

        <Button type="submit" disabled={busy}>
          {busy ? "Creating account" : "Create account"}
        </Button>
      </form>

      <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
        {resendsLeft > 0 ? (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || waitSeconds > 0}
            className="focus-ring rounded text-ink underline underline-offset-4 disabled:text-muted disabled:no-underline"
          >
            {resending ? "Sending" : waitSeconds > 0 ? `Send a new code in ${waitSeconds}s` : "Send a new code"}
          </button>
        ) : (
          <span className="text-muted">No more codes can be sent. Start again to get a new one.</span>
        )}
        <button
          type="button"
          onClick={handleStartAgain}
          className="focus-ring rounded text-muted underline underline-offset-4 hover:text-ink"
        >
          Start again
        </button>
      </div>
    </>
  );
}
