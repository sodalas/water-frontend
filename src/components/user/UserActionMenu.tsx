// src/components/user/UserActionMenu.tsx
import { authClient } from "../../lib/auth-client";

export function UserActionMenu({ onClose }: { onClose: () => void }) {
  const handleLogout = async () => {
    await authClient.signOut();
    onClose();
  };

  return (
    <div
      role="menu"
      className="absolute top-full mt-2 right-0 w-48 rounded-lg border border-[#30363d] bg-[#161b22] shadow-xl overflow-hidden z-50"
    >
      <button
        role="menuitem"
        onClick={handleLogout}
        className="w-full px-4 py-2.5 text-left text-sm text-gray-200 hover:bg-[#1f2937] transition-colors"
      >
        Log out
      </button>
    </div>
  );
}
