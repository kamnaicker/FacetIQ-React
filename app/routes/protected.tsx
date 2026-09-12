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

// In the order a person sets themselves up: what they hold, who people are to them, which of
// those people see what, and only then asking about someone else.
const sections = [
  { to: "/claims", label: "Claims" },
  { to: "/people", label: "People" },
  { to: "/norms", label: "Rules" },
  { to: "/requests", label: "Requests" },
  { to: "/lookup", label: "Lookup" },
];

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

  return (
    <div className="min-h-screen">
      <header className="border-b border-neutral-200 dark:border-neutral-800">
        <div className="mx-auto flex max-w-3xl items-center gap-6 px-6 py-3">
          <Link
            to="/claims"
            className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100"
          >
            FacetIQ
          </Link>

          <nav className="flex gap-4 text-sm text-neutral-600 dark:text-neutral-400">
            {sections.map((section) => (
              <NavLink
                key={section.to}
                to={section.to}
                className={({ isActive }) =>
                  isActive ? "text-neutral-900 dark:text-neutral-100" : undefined
                }
              >
                {section.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-4 text-sm">
            {email && (
              <span className="hidden text-neutral-500 sm:inline dark:text-neutral-400">{email}</span>
            )}

            <button
              type="button"
              onClick={() => {
                signOut();
                notify("success", "Signed out.");
                navigate("/sign-in");
              }}
              className="text-neutral-600 underline underline-offset-4 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}
