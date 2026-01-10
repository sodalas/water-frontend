/**
 * Phase C: Temporary Action Menu (Minimal)
 *
 * Dropdown menu for Edit/Delete actions
 * No animations, no nesting, minimal styling
 */

import { useState, useRef, useEffect } from "react";

interface PostActionMenuProps {
  canEdit: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function PostActionMenu({ canEdit, canDelete, onEdit, onDelete }: PostActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Don't render if no actions available
  if (!canEdit && !canDelete) return null;

  return (
    <div ref={menuRef} className="relative">
      {/* More button (horizontal three dots) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-text-muted hover:text-white transition p-1"
        aria-label="Post actions"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          <circle cx="19" cy="12" r="1.5" fill="currentColor" />
          <circle cx="5" cy="12" r="1.5" fill="currentColor" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-surface-dark border border-surface-highlight rounded-lg shadow-lg py-1 min-w-[120px] z-10">
          {canEdit && (
            <button
              onClick={() => {
                setIsOpen(false);
                onEdit();
              }}
              className="w-full text-left px-4 py-2 text-sm text-text-body hover:bg-surface-highlight transition"
            >
              Edit
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => {
                setIsOpen(false);
                onDelete();
              }}
              className="w-full text-left px-4 py-2 text-sm text-text-body hover:bg-surface-highlight hover:text-red-400 transition"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
