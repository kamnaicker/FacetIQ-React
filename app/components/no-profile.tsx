import { useSignOut } from "../lib/use-sign-out";
import { Button } from "./ui/button";

// Every page that shows this is otherwise a dead end, so the way out lives here.
export function NoProfile() {
  const signOut = useSignOut();

  return (
    <div className="rounded-lg border border-line bg-surface px-4 py-4">
      <p className="max-w-prose text-sm text-ink">
        Nothing about you is stored under this account, so this page has nothing to show.
      </p>
      <p className="mt-1 max-w-prose text-sm text-muted">
        Sign out and sign in again with the email address you added your details under.
      </p>

      <Button type="button" onClick={signOut} className="mt-4">
        Sign out
      </Button>
    </div>
  );
}
