import { Link, Outlet } from "react-router";
import { DisclosureExample } from "../components/disclosure-example";
import { ThemeToggle } from "../components/ui/theme-toggle";

// The frame sign in and register share: the brand, the theme switch, and an example of what the
// product does beside the form.
export default function SignedOut() {
  return (
    <main className="mx-auto grid max-w-4xl gap-12 px-6 py-16 md:min-h-screen md:grid-cols-2 md:content-center md:items-center md:py-24">
      <div>
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="focus-ring rounded text-base font-semibold tracking-tight text-ink">
            FacetIQ
          </Link>

          <ThemeToggle />
        </div>

        <div className="mt-8">
          <Outlet />
        </div>
      </div>

      <DisclosureExample />
    </main>
  );
}
