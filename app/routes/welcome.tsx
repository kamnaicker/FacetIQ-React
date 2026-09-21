import { Link } from "react-router";

export function meta() {
  return [{ title: "Welcome | FacetIQ" }];
}

// Three steps in the order they have to be done, which is why they are numbered.
const steps = [
  {
    title: "Add the things that are true about you",
    body: "Your name, your date of birth, your phone number. You can add more than one of something. If the people at work call you by a different name from the one your family uses, add both names, and you can share each name with different people.",
  },
  {
    title: "Say who the people around you are",
    body: "Enter someone's email address and the word you would use for that person, like colleague or doctor. FacetIQ asks that person to agree that the word is right. Once that person agrees, your rules can treat that person differently from someone you have never met.",
  },
  {
    title: "Decide what each person gets",
    body: "For every detail you added, write a rule saying who can see that detail and how much of that detail each person sees. You can share a detail exactly as you wrote it, show only part of a detail, such as just your initials or only whether you are over 18, or refuse to share a detail at all.",
  },
];

export default function Welcome() {
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        Deciding what people know about you
      </h1>

      <p className="mt-4 max-w-prose text-sm text-ink">
        When someone wants to know something about you, you decide what to tell them. You might
        give a doctor your full date of birth, and tell a stranger only that you are over 18.
      </p>

      <p className="mt-3 max-w-prose text-sm text-muted">
        FacetIQ makes those same decisions on your behalf. You write down what is true about you,
        you say who the people around you are, and you decide in advance what each person is
        allowed to see. After that, when someone asks about you, FacetIQ gives that person the
        answer you already decided on.
      </p>

      <ol className="mt-10 space-y-6">
        {steps.map((step, index) => (
          <li key={step.title} className="flex gap-4">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-line text-xs text-muted tabular-nums">
              {index + 1}
            </span>

            <div>
              <h2 className="text-sm font-medium text-ink">{step.title}</h2>
              <p className="mt-1 max-w-prose text-sm text-muted">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-8 max-w-prose border-t border-line pt-6 text-sm text-muted">
        Nothing about you is shared with anyone until you have written a rule that shares that
        detail, and every question anyone asks about you is listed on your Requests page.
      </p>

      <Link
        to="/claims"
        className="focus-ring mt-6 inline-block rounded-md bg-shared px-4 py-2 text-sm font-medium text-shared-ink hover:bg-shared/90"
      >
        Add the first thing about you
      </Link>
    </>
  );
}
