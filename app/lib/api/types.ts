export type Purpose = "Regulatory" | "Clinical" | "Social";

export type DisclosureRequest = {
  subjectId: string;
  attributeKey: string;
  purpose: string;
};

export type DisclosureResponse = {
  outcome: "Return" | "Transform" | "Deny";
  value: string | null;
  /** Set only when a subject reads their own claims. */
  values: string[] | null;
  denyReason: string | null;
  justifyingPrinciple: string | null;
};

export type NormResponse = {
  id: string;
  version: number;
  attributeId: string;
  relationship: string | null;
  purpose: string | null;
  action: string;
  transform: string;
  transformParameter: string | null;
  denyReason: string | null;
  justifyingPrinciple: string;
  specificity: number;
};

export type CreateNormRequest = {
  attributeId: string;
  relationship?: string | null;
  purpose?: string | null;
  transform?: string | null;
  transformParameter?: string | null;
  denyReason?: string | null;
  justifyingPrinciple: string;
};

export type NormCollision = {
  existing: NormResponse;
  specificity: number;
  overlappingRelationship: string | null;
  overlappingPurpose: string | null;
};

export type NormConflictResponse = {
  collisions: NormCollision[];
};

export type AttributeResponse = {
  id: string;
  key: string;
  value: string;
  label: string | null;
  collectedFor: string | null;
};

export type CreateAttributeRequest = {
  key: string;
  value: string;
  label?: string | null;
  collectedFor?: string | null;
};

export type StandingResponse = {
  id: string;
  subjectId: string;
  value: string;
  issuerKind: string;
  issuer: string;
  holder: string | null;
  issuedAt: string;
  acceptedAt: string | null;
};

export type StandingsResponse = {
  issued: StandingResponse[];
  held: StandingResponse[];
};

export type IssueStandingRequest = {
  email: string;
  value: string;
};

/**
 * Refusals the API can return, named in its terms rather than in HTTP status codes.
 * Field errors keep the shape the API sends so a form can bind them directly.
 */
export type ApiError =
  | { kind: "validation"; fieldErrors: Record<string, string[]> }
  | { kind: "conflict"; conflict: NormConflictResponse }
  | { kind: "unauthorized" }
  | { kind: "forbidden" }
  | { kind: "network" }
  | { kind: "unexpected"; status: number; message: string };

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };
