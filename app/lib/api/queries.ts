import { QueryClient, useQuery } from "@tanstack/react-query";
import { currentAccount, listClaims, listHistory, listNorms, listStandings } from "./client";
import type {
  AttributeResponse,
  DisclosureRecordResponse,
  NormResponse,
  Result,
  StandingsResponse,
} from "./types";

// One per browser: the app is client rendered.
export const queryClient = new QueryClient();

// The facade never throws, so a failure is cached as data and pages branch on Result as before.
// result is undefined until the first load returns.
export type Resource<T> = {
  result: Result<T> | undefined;
  refresh(): void;
};

// Lists another person can change. TanStack pauses polling while the tab is hidden.
// Set at build time; kept modest because the F1 host has a daily CPU quota.
const pollSeconds = Number(import.meta.env.VITE_POLL_SECONDS);
const polled = pollSeconds > 0 ? pollSeconds * 1000 : 10_000;

function useResource<T>(
  key: string,
  load: () => Promise<Result<T>>,
  refetchInterval?: number,
): Resource<T> {
  const query = useQuery({ queryKey: [key], queryFn: load, refetchInterval });

  return {
    result: query.data,
    refresh() {
      query.refetch();
    },
  };
}

export function useStandings(): Resource<StandingsResponse> {
  return useResource("standings", listStandings, polled);
}

export function useHistory(): Resource<DisclosureRecordResponse[]> {
  return useResource("history", listHistory, polled);
}

export function useClaims(): Resource<AttributeResponse[]> {
  return useResource("claims", listClaims);
}

export function useNorms(): Resource<NormResponse[]> {
  return useResource("norms", listNorms);
}

export function useAccount(): Resource<{ email: string }> {
  return useResource("account", currentAccount);
}

// Called on sign-in, so one account never sees another's cached data on a shared browser.
export function clearCache(): void {
  queryClient.clear();
}
