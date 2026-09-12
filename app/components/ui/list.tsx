import type { HTMLAttributes, LiHTMLAttributes } from "react";

// The bordered list every screen uses for the things a person holds: claims, rules, people.
export function List({ className = "", ...list }: HTMLAttributes<HTMLUListElement>) {
  return (
    <ul
      {...list}
      className={`divide-y divide-neutral-200 rounded-md border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800 ${className}`}
    />
  );
}

export function ListItem({ className = "", ...item }: LiHTMLAttributes<HTMLLIElement>) {
  return (
    <li
      {...item}
      className={`flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 ${className}`}
    />
  );
}
