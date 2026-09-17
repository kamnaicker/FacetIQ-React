import { clearToken, getToken, setToken } from "./token";
import type {
  ApiError,
  AttributeResponse,
  ClaimInUseResponse,
  CreateAttributeRequest,
  CreateNormRequest,
  DisclosureRecordResponse,
  DisclosureRequest,
  DisclosureResponse,
  IssueStandingRequest,
  NormConflictResponse,
  NormResponse,
  Result,
  StandingResponse,
  StandingsResponse,
} from "./types";

// Unset in development, where Vite proxies /api to the API (see vite.config.ts). A deployed
// build sets it to the API's address at build time.
const baseUrl = import.meta.env.VITE_API_URL ?? "/api";

/**
 * The one place fetch, the base address and the token appear. Everything above this works in
 * terms of Result and ApiError.
 *
 * Refusals are returned as values rather than thrown. The API treats a refusal as a completed
 * decision, not a failure, and the client says the same thing.
 */
async function request<T>(path: string, init: RequestInit = {}): Promise<Result<T>> {
  const token = getToken();

  let response: Response;

  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
  } catch {
    return { ok: false, error: { kind: "network" } };
  }

  if (response.ok) {
    return { ok: true, data: await readBody<T>(response) };
  }

  return { ok: false, error: await readError(response) };
}

async function readBody<T>(response: Response): Promise<T> {
  if (response.status === 204 || response.headers.get("Content-Length") === "0") {
    return undefined as T;
  }

  const text = await response.text();

  return text ? (JSON.parse(text) as T) : (undefined as T);
}

export const sessionExpired = "facetiq:session-expired";

async function readError(response: Response): Promise<ApiError> {
  if (response.status === 401) {
    // Only a signed in request can expire. A wrong password on the sign in form carries no
    // token, so it is reported to the form instead of ending a session that never began.
    if (getToken() !== null) {
      clearToken();
      window.dispatchEvent(new Event(sessionExpired));
    }

    // Identity reports an unconfirmed email as a NotAllowed sign in.
    const detail = await problemDetail(response);

    return detail === "NotAllowed" ? { kind: "unconfirmed" } : { kind: "unauthorized" };
  }

  if (response.status === 403) {
    return { kind: "forbidden" };
  }

  const body = await response.text();

  // Left raw: the function that made the call knows which kind of conflict it can be.
  if (response.status === 409) {
    return { kind: "conflict", body: JSON.parse(body) };
  }

  // Every 400 from this API is ProblemDetails with an errors dictionary keyed by field. Keys
  // arrive in PascalCase, so they are lowered here to match the names the forms use.
  if (response.status === 400) {
    const problem = JSON.parse(body) as { errors?: Record<string, string[]> };
    return { kind: "validation", fieldErrors: camelCaseKeys(problem.errors ?? {}) };
  }

  return { kind: "unexpected", status: response.status, message: body };
}

async function problemDetail(response: Response): Promise<string | undefined> {
  const text = await response.text();

  if (!text) {
    return undefined;
  }

  try {
    return (JSON.parse(text) as { detail?: string }).detail;
  } catch {
    return undefined;
  }
}

/**
 * Identity keys its refusals by error code, not by field, so a form has nothing to bind them to.
 * Mapping happens here rather than in the form, so the codes stop at the facade.
 */
const identityFields: Record<string, string> = {
  duplicateEmail: "email",
  duplicateUserName: "email",
  invalidEmail: "email",
  invalidUserName: "email",
  passwordTooShort: "password",
  passwordRequiresDigit: "password",
  passwordRequiresLower: "password",
  passwordRequiresUpper: "password",
  passwordRequiresNonAlphanumeric: "password",
  passwordRequiresUniqueChars: "password",
};

function camelCaseKeys(errors: Record<string, string[]>): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(errors).map(([key, messages]) => [
      key.charAt(0).toLowerCase() + key.slice(1),
      messages,
    ]),
  );
}

function byField(errors: Record<string, string[]>): Record<string, string[]> {
  const mapped: Record<string, string[]> = {};

  for (const [code, messages] of Object.entries(errors)) {
    const field = identityFields[code] ?? code;
    mapped[field] = [...(mapped[field] ?? []), ...messages];
  }

  return mapped;
}

export async function register(email: string, password: string): Promise<Result<void>> {
  const result = await request<void>("/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (!result.ok && result.error.kind === "validation") {
    return { ok: false, error: { kind: "validation", fieldErrors: byField(result.error.fieldErrors) } };
  }

  return result;
}

export async function signIn(email: string, password: string): Promise<Result<void>> {
  const result = await request<{ accessToken: string; expiresIn: number }>("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (!result.ok) {
    return result;
  }

  setToken(result.data.accessToken, result.data.expiresIn);

  // Idempotent, so signing in is also what gives a new account its profile. Without it a first
  // sign in lands on screens that have nothing to show.
  await request<{ id: string }>("/subject", { method: "POST" });

  return { ok: true, data: undefined };
}

export async function resendConfirmation(email: string): Promise<Result<void>> {
  return request<void>("/resendConfirmationEmail", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function signOut(): void {
  clearToken();
}

export function isSignedIn(): boolean {
  return getToken() !== null;
}

export async function mySubject(): Promise<Result<{ id: string }>> {
  return request<{ id: string }>("/subject");
}

export async function currentAccount(): Promise<Result<{ email: string }>> {
  return request<{ email: string }>("/manage/info");
}

export async function disclose(
  body: DisclosureRequest,
): Promise<Result<DisclosureResponse>> {
  return request<DisclosureResponse>("/disclosure", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function listHistory(): Promise<Result<DisclosureRecordResponse[]>> {
  return request<DisclosureRecordResponse[]>("/history");
}

export async function listNorms(): Promise<Result<NormResponse[]>> {
  return request<NormResponse[]>("/norm");
}

export async function createNorm(body: CreateNormRequest): Promise<Result<NormResponse>> {
  const result = await request<NormResponse>("/norm", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!result.ok && result.error.kind === "conflict") {
    return { ok: false, error: { kind: "overlap", conflict: result.error.body as NormConflictResponse } };
  }

  return result;
}

export async function removeRule(id: string): Promise<Result<void>> {
  return request<void>(`/norm/${id}`, { method: "DELETE" });
}

export async function deleteClaim(id: string): Promise<Result<void>> {
  const result = await request<void>(`/attribute/${id}`, { method: "DELETE" });

  if (!result.ok && result.error.kind === "conflict") {
    return { ok: false, error: { kind: "inUse", rules: (result.error.body as ClaimInUseResponse).rules } };
  }

  return result;
}

export async function listStandings(): Promise<Result<StandingsResponse>> {
  return request<StandingsResponse>("/standing");
}

export async function issueStanding(
  body: IssueStandingRequest,
): Promise<Result<StandingResponse>> {
  return request<StandingResponse>("/standing", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function acceptStanding(id: string): Promise<Result<void>> {
  return request<void>(`/standing/${id}/accept`, { method: "POST" });
}

export async function listClaims(): Promise<Result<AttributeResponse[]>> {
  return request<AttributeResponse[]>("/attribute");
}

export async function createClaim(
  body: CreateAttributeRequest,
): Promise<Result<AttributeResponse>> {
  return request<AttributeResponse>("/attribute", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
