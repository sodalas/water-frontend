import { Surface } from "../ui/surface";
import { HomeFeedPage } from "../pages/HomeFeedPage";
import { UserIdentity } from "../components/user/UserIdentity";
import { NotificationBell } from "../components/NotificationBell";

export function AppHome() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0d1117]">
      {/* Top bar with user identity (mobile + desktop) */}
      <header className="sticky top-0 z-40 border-b border-[#21262d] bg-[#0d1117] px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="text-lg font-semibold text-white">Water</h1>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <UserIdentity />
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 p-8 max-w-lg mx-auto w-full">
        <Surface>
          <HomeFeedPage />
        </Surface>
      </div>
    </div>
  );
}
