import { Link, useLocation } from "react-router";
import { useClaims, useNorms, useStandings } from "../lib/api/queries";

type Step = { label: string; to: string; done: boolean };

type GettingStartedProps = {
  onClose: () => void;
};

// Steps tick from data the pages already load. Nothing records a lookup the person made, so the
// last step never ticks. Inline above the page on narrow screens, floating where there is room.
export function GettingStarted({ onClose }: GettingStartedProps) {
  const { pathname } = useLocation();
  const { result: claims } = useClaims();
  const { result: standings } = useStandings();
  const { result: norms } = useNorms();

  // Waits for the claims answer so the steps never show unticked first, and stays out of the way
  // for an account without a profile.
  if (claims === undefined || (!claims.ok && claims.error.kind === "forbidden")) {
    return null;
  }

  const steps: Step[] = [
    { label: "Add a claim", to: "/claims", done: claims.ok && claims.data.length > 0 },
    {
      label: "Say who someone is to you",
      to: "/people",
      done: standings?.ok === true && standings.data.issued.length > 0,
    },
    { label: "Write a rule", to: "/norms", done: norms?.ok === true && norms.data.length > 0 },
  ];

  const finished = steps.every((step) => step.done);

  return (
    <section
      aria-labelledby="getting-started"
      className="mb-8 rounded-lg border border-line bg-surface p-4 min-[1360px]:fixed min-[1360px]:top-8 min-[1360px]:right-8 min-[1360px]:z-10 min-[1360px]:mb-0 min-[1360px]:w-72 min-[1360px]:shadow-lg min-[1360px]:shadow-ink/5"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 id="getting-started" className="text-sm font-medium text-ink">
          Getting started
        </h2>

        <button
          type="button"
          onClick={onClose}
          aria-label="Hide the setup guide"
          className="focus-ring -mt-0.5 rounded p-0.5 text-muted hover:text-ink"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M3 3l6 6M9 3l-6 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <p className="mt-1 text-xs text-muted">
        {finished ? "You're set up. Try a lookup next." : "Decide what others see when they ask about you."}
      </p>

      <ol className="mt-3 space-y-2.5">
        {steps.map((step, index) => (
          <li key={step.to} className="flex items-center gap-3 text-sm">
            <Marker number={index + 1} done={step.done} />
            <StepLabel label={step.label} to={step.to} muted={step.done} current={pathname === step.to} />
          </li>
        ))}

        <li className="flex items-center gap-3 text-sm">
          <Marker number={4} done={false} />
          <StepLabel label="Try a lookup" to="/lookup" muted={false} current={pathname === "/lookup"} />
        </li>
      </ol>
    </section>
  );
}

// The page you are on is not a link: there is nowhere to go.
function StepLabel({ label, to, muted, current }: { label: string; to: string; muted: boolean; current: boolean }) {
  if (current) {
    return (
      <span aria-current="page" className={muted ? "text-muted" : "font-medium text-ink"}>
        {label}
      </span>
    );
  }

  return (
    <Link
      to={to}
      className={`focus-ring rounded underline underline-offset-4 ${muted ? "text-muted" : "text-ink"}`}
    >
      {label}
    </Link>
  );
}

function Marker({ number, done }: { number: number; done: boolean }) {
  if (!done) {
    return (
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-line text-xs text-muted tabular-nums">
        {number}
      </span>
    );
  }

  return (
    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-shared-soft text-shared">
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
        <path d="M2.5 6.5 5 9l4.5-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="sr-only">Done:</span>
    </span>
  );
}
