import type { Option } from "../components/ui/select";

/** Selects cannot hold an empty value, so an unbound condition is carried as this sentinel. */
export const any = "Any";

// Unspecified is the enum's default and is not something a person would choose.
export const purposes: readonly Option[] = [
  { value: "Identification", label: "Identification" },
  { value: "Regulatory", label: "Regulatory" },
  { value: "Clinical", label: "Clinical" },
  { value: "Social", label: "Social" },
  { value: "Religious", label: "Religious" },
];

// A fixed list rather than free text: keys are compared exactly, so "Name" typed on one screen
// would never match "name" asked for on another.
export const kinds: readonly Option[] = [
  { value: "name", label: "Name" },
  { value: "dateOfBirth", label: "Date of birth" },
];

export function kindLabel(key: string): string {
  return kinds.find((kind) => kind.value === key)?.label ?? key;
}

// What a claim can be shown as depends on what it is. An age threshold only works on a date and
// initials only mean something for a name, and offering either on the other kind would save a
// rule that fails every time it is used.
export function displaysFor(key: string): readonly Option[] {
  const specific =
    key === "dateOfBirth"
      ? { value: "Generalise", label: "Only whether they are over an age" }
      : { value: "Reformat", label: "Initials only" };

  return [
    { value: "None", label: "Exactly as written" },
    specific,
    { value: "Redact", label: "Hidden" },
  ];
}

export function displayLabel(transform: string, parameter: string | null): string {
  switch (transform) {
    case "Reformat":
      return "Shown as initials";
    case "Generalise":
      return `Shown only as over or under ${parameter ?? "18"}`;
    case "Redact":
      return "Hidden";
    default:
      return "Shown exactly as written";
  }
}
