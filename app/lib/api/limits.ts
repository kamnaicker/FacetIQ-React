// Mirrors the StringLength limits on the API's request contracts. The API remains the guard.
export const limits = {
  email: 256,
  claimValue: 512,
  claimLabel: 64,
  relationship: 64,
  principle: 256,
} as const;
