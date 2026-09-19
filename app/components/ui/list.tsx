import type { HTMLAttributes, LiHTMLAttributes } from "react";

// The bordered list every screen uses for the things a person holds: claims, rules, people.
export function List({ className = "", ...list }: HTMLAttributes<HTMLUListElement>) {
  return (
    <ul
      {...list}
      className={`divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface ${className}`}
    />
  );
}

export function ListItem({ className = "", ...item }: LiHTMLAttributes<HTMLLIElement>) {
  return (
    <li
      {...item}
      className={`flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3.5 ${className}`}
    />
  );
}
