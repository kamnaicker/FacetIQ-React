import { QueryClient, useQuery } from "@tanstack/react-query";
import { listStandings } from "./client";
import type { Result, StandingsResponse } from "./types";

// One per browser: the app is client rendered.
export const queryClient = new QueryClient();

// The facade never throws, so a failure is cached as data and pages branch on Result as before.
// result is undefined until the first load returns.
export type Resource<T> = {
  result: Result<T> | undefined;
  refresh(): void;
};

// Lists another person can change. TanStack pauses polling while the tab is hidden.
const polled = 30_000;

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
