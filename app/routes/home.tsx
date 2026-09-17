import { Link, redirect } from "react-router";
import { DisclosureExample } from "../components/disclosure-example";
import { isSignedIn } from "../lib/api/client";

// Someone already signed in has no use for the sign-in links.
export function clientLoader() {
  if (isSignedIn()) {
    throw redirect("/lookup");
  }

  return null;
}

export function meta() {
  return [
    { title: "FacetIQ" },
    { name: "description", content: "Contextual disclosure of identity claims." },
  ];
}

export default function Home() {
  return (
    <main className="mx-auto grid max-w-4xl gap-12 px-6 py-16 md:min-h-screen md:grid-cols-2 md:content-center md:items-center md:py-24">
      <div>
        <p className="text-base font-semibold tracking-tight text-ink">FacetIQ</p>

        <h1 className="mt-8 max-w-prose text-2xl font-semibold tracking-tight text-balance text-ink">
          Decide what each person sees about you.
        </h1>

        <p className="mt-3 max-w-prose text-sm text-muted">
          Keep your details in one place, say who counts as a colleague or a friend, and write the
          rules that answer for you when someone asks.
        </p>

        <div className="mt-8 flex items-center gap-3">
          <Link
            to="/register"
            className="rounded-md bg-shared px-4 py-2 text-sm font-medium text-shared-ink outline-none hover:bg-shared/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-shared"
          >
            Create an account
          </Link>

          <Link
            to="/sign-in"
            className="rounded-md border border-line bg-surface px-4 py-2 text-sm font-medium text-ink outline-none hover:bg-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-shared"
          >
            Sign in
          </Link>
        </div>
      </div>

      <DisclosureExample />
    </main>
  );
}
