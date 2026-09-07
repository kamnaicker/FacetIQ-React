import type { Option } from "../components/ui/select";

// Unspecified is the enum's default and is not something a person would choose, so it is not
// offered.
export const purposes: readonly Option[] = [
  { value: "Identification", label: "Identification" },
  { value: "Regulatory", label: "Regulatory" },
  { value: "Clinical", label: "Clinical" },
  { value: "Social", label: "Social" },
  { value: "Religious", label: "Religious" },
];

export const transforms: readonly Option[] = [
  { value: "None", label: "None" },
  { value: "Redact", label: "Redact" },
  { value: "Reformat", label: "Reformat" },
  { value: "Generalise", label: "Generalise" },
];

/** Selects cannot hold an empty value, so an unbound condition is carried as this sentinel. */
export const any = "Any";
