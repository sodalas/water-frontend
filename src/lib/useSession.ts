import { useQuery } from "@tanstack/react-query";
import { authClient } from "./auth-client";

export function useSession() {
    return useQuery({
        queryKey: ["session"],
        queryFn: async () => {
            const result = await authClient.getSession();
            return result.data; 
        },
        staleTime: 60 * 1000, // 60 seconds
    });
}
