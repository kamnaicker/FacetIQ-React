export function meta() {
  return [
    { title: "FacetIQ" },
    { name: "description", content: "Contextual disclosure of identity claims." },
  ];
}

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        FacetIQ
      </h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">
        Contextual disclosure of identity claims.
      </p>
    </main>
  );
}
