import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, redirect, useNavigate } from "react-router";
import { GettingStarted } from "../components/getting-started";
import { Switch } from "../components/ui/switch";
import { ThemeToggle } from "../components/ui/theme-toggle";
import { useNotify } from "../components/ui/toast";
import { isSignedIn, sessionExpired, signOut } from "../lib/api/client";
import { useAccount } from "../lib/api/queries";
import { guideShown, setGuideShown } from "../lib/guide";

// Runs in the browser, since the app is client rendered. The API refuses these calls anyway;
// this only saves the round trip and keeps the signed out state out of the screens.
export function clientLoader() {
  if (!isSignedIn()) {
    throw redirect("/sign-in");
  }

  return null;
}

// Two groups because the app has two sides: what others see of you, and what you ask of them.
// Within the first, the order a person sets themselves up in.
const groups = [
  {
    label: "Your profile",
    sections: [
      { to: "/claims", label: "Claims" },
      { to: "/people", label: "People" },
      { to: "/norms", label: "Rules" },
      { to: "/requests", label: "Requests" },
    ],
  },
  {
    label: "Ask someone",
    sections: [{ to: "/lookup", label: "Lookup" }],
  },
];

function navClass({ isActive }: { isActive: boolean }): string {
  return isActive
    ? "focus-ring block rounded-md bg-shared-soft px-3 py-1.5 text-sm font-medium text-shared"
    : "focus-ring block rounded-md px-3 py-1.5 text-sm text-muted hover:bg-raised hover:text-ink";
}

export default function Protected() {
  const navigate = useNavigate();
  const notify = useNotify();
  const { result: account } = useAccount();
  const email = account?.ok ? account.data.email : null;
  // Read on first render: routes only render in the browser, so storage is there.
  const [guide, setGuide] = useState(guideShown);

  function handleGuide(shown: boolean) {
    setGuide(shown);
    setGuideShown(shown);
  }

  // A token expiring mid page would otherwise leave the screen showing a generic failure.
  useEffect(() => {
    function onExpired() {
      notify("warning", "Your session has ended. Sign in again to continue.");
      navigate("/sign-in");
    }

    window.addEventListener(sessionExpired, onExpired);

    return () => window.removeEventListener(sessionExpired, onExpired);
  }, [navigate, notify]);

  function handleSignOut() {
    signOut();
    notify("success", "Signed out.");
    navigate("/sign-in");
  }

  return (
    <div className="min-h-screen md:flex">
      {/* A column on a desktop, a bar above the content on a phone. */}
      <header className="border-b border-line bg-surface md:sticky md:top-0 md:flex md:h-screen md:w-60 md:shrink-0 md:flex-col md:border-r md:border-b-0">
        <div className="px-4 py-3 md:px-4 md:py-5">
          <div className="flex items-center gap-4 px-2 md:px-3">
            <Link to="/" className="focus-ring rounded text-base font-semibold tracking-tight text-ink">
              FacetIQ
            </Link>

            {/* The sidebar row is too narrow for both switches, so on a desktop Guide sits in the footer. */}
            <Switch label="Guide" checked={guide} onCheckedChange={handleGuide} className="ml-auto md:hidden" />
            <ThemeToggle className="md:ml-auto" />

            <button
              type="button"
              onClick={handleSignOut}
              className="focus-ring rounded text-sm whitespace-nowrap text-muted hover:text-ink md:hidden"
            >
              Sign out
            </button>
          </div>

          <nav className="mt-2 flex flex-wrap gap-1 md:mt-6 md:block md:space-y-6">
            {groups.map((group) => (
              <div key={group.label} className="flex flex-wrap gap-1 md:block">
                <p className="hidden px-3 pb-1 text-xs text-muted md:block">{group.label}</p>

                {group.sections.map((section) => (
                  <NavLink key={section.to} to={section.to} className={navClass}>
                    {section.label}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>
        </div>

        <div className="hidden border-t border-line p-4 md:mt-auto md:block">
          <Switch label="Setup guide" checked={guide} onCheckedChange={handleGuide} className="mb-3 px-3" />

          {email && <p className="truncate px-3 text-xs text-muted">{email}</p>}

          <button
            type="button"
            onClick={handleSignOut}
            className="focus-ring mt-1 block w-full rounded-md px-3 py-1.5 text-left text-sm text-muted hover:bg-raised hover:text-ink"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="w-full max-w-3xl px-6 py-10 md:px-10 md:py-14">
        {guide && <GettingStarted onClose={() => handleGuide(false)} />}
        <Outlet />
      </main>
    </div>
  );
}
