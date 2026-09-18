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
    { value: "Redact", label: "Hidden, but they are told it exists" },
    { value: deny, label: "Not shared at all" },
  ];
}

/**
 * A refusal is a rule like any other, so it can be the most specific one and beat a wider rule
 * that shares. It is carried as a display choice here and becomes a deny reason on the way out.
 */
export const deny = "Deny";

/** Who a rule covers, as the middle of a sentence. */
export function who(relationship: string | null): string {
  return relationship
    ? `shared with people you have described as ${relationship}`
    : "shared with anyone";
}

/** Which asking reasons a rule covers, as the end of a sentence. */
export function why(purpose: string | null): string {
  return purpose ? `when they ask for ${purpose.toLowerCase()} reasons` : "for any reason";
}

export function displayLabel(rule: {
  action: string;
  transform: string;
  transformParameter: string | null;
}): string {
  if (rule.action === "Deny") {
    return "Not shared at all";
  }

  switch (rule.transform) {
    case "Reformat":
      return "Shown as initials";
    case "Generalise":
      return `Shown only as over or under ${rule.transformParameter ?? "18"}`;
    case "Redact":
      return "Hidden, but they are told it exists";
    default:
      return "Shown exactly as written";
  }
}
