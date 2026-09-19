export function NoProfile() {
  return (
    <div className="rounded-lg border border-line bg-surface px-4 py-4">
      <p className="text-sm text-ink">No profile is linked to this account.</p>
      <p className="mt-1 text-sm text-muted">Sign in with the account that holds your profile.</p>
    </div>
  );
}
