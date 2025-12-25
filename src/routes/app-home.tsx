import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { authClient } from "../lib/auth-client";
import { useSession } from "../lib/useSession";
import { Button } from "../ui/button";
import { Stack } from "../ui/stack";
import { Surface } from "../ui/surface";

export function AppHome() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    await queryClient.invalidateQueries({ queryKey: ["session"] });
    router.invalidate();
  };

  return (
    <div className="p-8 max-w-lg mx-auto">
      <Surface>
        <Stack gap="lg">
          <h1 className="text-2xl font-bold">App Home</h1>

          <Stack gap="sm">
            <p>Welcome, {session?.user.email}</p>
            <p className="text-sm text-gray-500">User ID: {session?.user.id}</p>
          </Stack>

          <div>
            <Button onClick={handleLogout} variant="secondary">Sign Out</Button>
          </div>
        </Stack>
      </Surface>
    </div>
  );
}
