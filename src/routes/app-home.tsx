import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { authClient } from "../lib/auth-client";
import { useSession } from "../lib/useSession";

export function AppHome() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    await queryClient.invalidateQueries({ queryKey: ["session"] });
    router.invalidate(); // ✅ re-run guards
  };

  return (
    <div>
      <p>{session?.user.email}</p>
      <button onClick={handleLogout}>Sign Out</button>
    </div>
  );
}
