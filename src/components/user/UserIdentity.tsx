// src/components/user/UserIdentity.tsx
import { authClient } from "../../lib/auth-client";
import { useState, useEffect, useRef } from "react";
import { UserActionMenu } from "./UserActionMenu";

export function UserIdentity() {
  const { data: session, isPending } = authClient.useSession();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (isPending || !session?.user) return null;

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#161b22] hover:bg-[#1f2937] transition-colors border border-transparent hover:border-[#30363d]"
      >
        <div
          className="bg-center bg-no-repeat bg-cover rounded-full size-9 shrink-0 bg-gray-600"
          style={{ backgroundImage: session.user.image ? `url(${session.user.image})` : undefined }}
        />
        <div className="hidden md:flex flex-col overflow-hidden text-left">
          <p className="text-sm font-medium text-white truncate">
            {session.user.name ?? "User"}
          </p>
          <p className="text-xs text-gray-400 truncate">
            @{(session.user as any).handle ?? "account"}
          </p>
        </div>
      </button>

      {open && (
        <UserActionMenu onClose={() => setOpen(false)} />
      )}
    </div>
  );
}
