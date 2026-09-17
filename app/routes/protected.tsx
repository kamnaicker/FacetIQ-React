import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, redirect, useNavigate } from "react-router";
import { useNotify } from "../components/ui/toast";
import { currentAccount, isSignedIn, sessionExpired, signOut } from "../lib/api/client";

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
    ? "block rounded-md bg-shared-soft px-3 py-1.5 text-sm font-medium text-shared"
    : "block rounded-md px-3 py-1.5 text-sm text-muted hover:bg-raised hover:text-ink";
}

export default function Protected() {
  const navigate = useNavigate();
  const notify = useNotify();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    currentAccount().then((result) => {
      if (result.ok) {
        setEmail(result.data.email);
      }
    });
  }, []);

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
          <div className="flex items-center gap-4 px-2 md:block md:px-0">
            <Link to="/claims" className="text-base font-semibold tracking-tight text-ink md:px-3">
              FacetIQ
            </Link>

            <button
              type="button"
              onClick={handleSignOut}
              className="ml-auto rounded text-sm whitespace-nowrap text-muted underline underline-offset-4 outline-none hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-shared md:hidden"
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

        <div className="hidden border-t border-line px-7 py-4 md:mt-auto md:block">
          {email && <p className="truncate text-xs text-muted">{email}</p>}

          <button
            type="button"
            onClick={handleSignOut}
            className="mt-1 rounded text-sm text-muted underline underline-offset-4 outline-none hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-shared"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="w-full max-w-3xl px-6 py-10 md:px-10 md:py-14">
        <Outlet />
      </main>
    </div>
  );
}
