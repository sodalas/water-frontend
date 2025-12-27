// import { useQueryClient } from "@tanstack/react-query";
// import { useRouter } from "@tanstack/react-router";
// import { authClient } from "../lib/auth-client";
// import { useSession } from "../lib/useSession";
// import { Button } from "../ui/button";
// import { Stack } from "../ui/stack";
import { Surface } from "../ui/surface";
import { HomeFeedPage } from "../pages/HomeFeedPage";

export function AppHome() {
  // const { data: session } = useSession();
  // const queryClient = useQueryClient();
  // const router = useRouter();

  // const handleLogout = async () => {
  //   await authClient.signOut();
  //   await queryClient.invalidateQueries({ queryKey: ["session"] });
  //   router.invalidate();
  // };

  return (
    <div className="p-8 max-w-lg mx-auto">
      <Surface>
        <HomeFeedPage />
      </Surface>
    </div>
  );
}
