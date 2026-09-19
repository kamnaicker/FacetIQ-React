/** Withheld reads as a refusal, which is a rule working rather than an error. */
export type Tone = "shared" | "withheld";

const tones: Record<Tone, string> = {
  shared: "bg-shared-soft text-shared",
  withheld: "bg-withheld-soft text-withheld",
};

// The parts of a rule that change: who it covers, why, and how the claim comes out. Tinting them
// lets a list of rules be scanned rather than read line by line.
export function Value({ children, tone = "shared" }: { children: React.ReactNode; tone?: Tone }) {
  return (
    <span className={`rounded px-1.5 py-0.5 text-sm whitespace-nowrap ${tones[tone]}`}>
      {children}
    </span>
  );
}
