import { clearToken, getToken, setToken } from "./token";
import type {
  ApiError,
  AttributeResponse,
  CreateAttributeRequest,
  CreateNormRequest,
  DisclosureRequest,
  DisclosureResponse,
  NormConflictResponse,
  NormResponse,
  Result,
} from "./types";

const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5197";

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

async function readError(response: Response): Promise<ApiError> {
  if (response.status === 401) {
    clearToken();
    return { kind: "unauthorized" };
  }

  if (response.status === 403) {
    return { kind: "forbidden" };
  }

  const body = await response.text();

  if (response.status === 409) {
    return { kind: "conflict", conflict: JSON.parse(body) as NormConflictResponse };
  }

  // Every 400 from this API is ProblemDetails with an errors dictionary keyed by field.
  if (response.status === 400) {
    const problem = JSON.parse(body) as { errors?: Record<string, string[]> };
    return { kind: "validation", fieldErrors: problem.errors ?? {} };
  }

  return { kind: "unexpected", status: response.status, message: body };
}

export async function register(email: string, password: string): Promise<Result<void>> {
  return request<void>("/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function signIn(email: string, password: string): Promise<Result<void>> {
  const result = await request<{ accessToken: string }>("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (!result.ok) {
    return result;
  }

  setToken(result.data.accessToken);

  return { ok: true, data: undefined };
}

export function signOut(): void {
  clearToken();
}

export function isSignedIn(): boolean {
  return getToken() !== null;
}

export async function disclose(
  body: DisclosureRequest,
): Promise<Result<DisclosureResponse>> {
  return request<DisclosureResponse>("/disclosure", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function listNorms(): Promise<Result<NormResponse[]>> {
  return request<NormResponse[]>("/norm");
}

export async function createNorm(body: CreateNormRequest): Promise<Result<NormResponse>> {
  return request<NormResponse>("/norm", {
    method: "POST",
    body: JSON.stringify(body),
  });
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
