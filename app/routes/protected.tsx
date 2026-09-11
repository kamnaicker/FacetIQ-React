import { Link, NavLink, Outlet, redirect, useNavigate } from "react-router";
import { isSignedIn, signOut } from "../lib/api/client";

// Runs in the browser, since the app is client rendered. The API refuses these calls anyway;
// this only saves the round trip and keeps the signed out state out of the screens.
export function clientLoader() {
  if (!isSignedIn()) {
    throw redirect("/sign-in");
  }

  return null;
}

export default function Protected() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <header className="border-b border-neutral-200 dark:border-neutral-800">
        <div className="mx-auto flex max-w-3xl items-center gap-6 px-6 py-3">
          <Link
            to="/lookup"
            className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100"
          >
            FacetIQ
          </Link>

          <nav className="flex gap-4 text-sm text-neutral-600 dark:text-neutral-400">
            <NavLink
              to="/lookup"
              className={({ isActive }) =>
                isActive ? "text-neutral-900 dark:text-neutral-100" : undefined
              }
            >
              Lookup
            </NavLink>
            <NavLink
              to="/norms"
              className={({ isActive }) =>
                isActive ? "text-neutral-900 dark:text-neutral-100" : undefined
              }
            >
              Rules
            </NavLink>
            <NavLink
              to="/claims"
              className={({ isActive }) =>
                isActive ? "text-neutral-900 dark:text-neutral-100" : undefined
              }
            >
              Claims
            </NavLink>
            <NavLink
              to="/people"
              className={({ isActive }) =>
                isActive ? "text-neutral-900 dark:text-neutral-100" : undefined
              }
            >
              People
            </NavLink>
          </nav>

          <button
            type="button"
            onClick={() => {
              signOut();
              navigate("/sign-in");
            }}
            className="ml-auto text-sm text-neutral-600 underline underline-offset-4 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}
