import { QueryClient, useQuery } from "@tanstack/react-query";
import { currentAccount, listClaims, listHistory, listNorms, listStandings } from "./client";
import type {
  ApiError,
  AttributeResponse,
  DisclosureRecordResponse,
  NormResponse,
  Result,
  StandingsResponse,
} from "./types";

// One per browser: the app is client rendered. Data this fresh is reused rather than fetched again,
// which keeps navigating between pages off the host's daily CPU quota.
export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000 } },
});

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

// A blip on one poll must not replace a list that was fine. A refusal must, because it is an answer
// about this account rather than a failure to reach the API.
const transient: ApiError["kind"][] = ["network", "unexpected", "rateLimited"];

function useResource<T>(
  key: string,
  load: () => Promise<Result<T>>,
  refetchInterval?: number,
): Resource<T> {
  const query = useQuery({
    queryKey: [key],
    refetchInterval,
    async queryFn() {
      const result = await load();

      if (result.ok || !transient.includes(result.error.kind)) {
        return result;
      }

      const kept = queryClient.getQueryData<Result<T>>([key]);

      return kept?.ok ? kept : result;
    },
  });

  return {
    result: query.data,
    refresh() {
      query.refetch();
    },
  };
}

type StandingsOptions = { poll?: boolean };

// Polled where another person's action shows up, off where the page only reads the terms.
export function useStandings({ poll = true }: StandingsOptions = {}): Resource<StandingsResponse> {
  return useResource("standings", listStandings, poll ? polled : undefined);
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
