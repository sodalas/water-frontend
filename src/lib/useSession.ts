import { useQuery } from "@tanstack/react-query";
import { authClient } from "./auth-client";

export function useSession() {
    return useQuery({
        queryKey: ["session"],
        queryFn: async () => {
            const result = await authClient.getSession();
            return result.data;
        },
        // Invariant 2: Explicit freshness windows
        staleTime: 60_000, // 60 seconds
        gcTime: 300_000, // 5 minutes
    });
}
