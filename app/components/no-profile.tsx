export function NoProfile() {
  return (
    <div className="rounded-md border border-neutral-200 px-4 py-3 dark:border-neutral-800">
      <p className="text-sm text-neutral-900 dark:text-neutral-100">
        No profile is linked to this account.
      </p>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        Sign in with the account that holds your profile.
      </p>
    </div>
  );
}
