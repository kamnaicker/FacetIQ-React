import { useSignOut } from "../lib/use-sign-out";
import { Button } from "./ui/button";

// Every page that shows this is otherwise a dead end, so the way out lives here.
export function NoProfile() {
  const signOut = useSignOut();

  return (
    <div className="rounded-lg border border-line bg-surface px-4 py-4">
      <p className="text-sm text-ink">No profile is linked to this account.</p>
      <p className="mt-1 text-sm text-muted">Sign in with the account that holds your profile.</p>

      <Button type="button" onClick={signOut} className="mt-4">
        Sign out
      </Button>
    </div>
  );
}
