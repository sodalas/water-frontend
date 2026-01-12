/**
 * Action Menu with Permission Surface
 *
 * Dropdown menu for Edit/Delete actions with:
 * - Disabled states with explanations
 * - Delete confirmation dialog
 * - Clear permission feedback
 */

import { useState, useRef, useEffect } from "react";
import { Tooltip } from "./Tooltip";
import { ConfirmDialog } from "./ConfirmDialog";

interface PostActionMenuProps {
  canEdit: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
  /** Explanation for why edit is disabled */
  editDisabledReason?: string;
  /** Explanation for why delete is disabled */
  deleteDisabledReason?: string;
  /** Whether this is a superseded version (prevents all actions) */
  isSuperseded?: boolean;
}

export function PostActionMenu({
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  editDisabledReason,
  deleteDisabledReason,
  isSuperseded = false,
}: PostActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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

  // Compute effective disabled reasons (superseded takes precedence)
  const effectiveEditDisabled = isSuperseded
    ? "Cannot edit superseded content"
    : editDisabledReason;

  const effectiveDeleteDisabled = isSuperseded
    ? "Cannot delete superseded content"
    : deleteDisabledReason;

  // Show menu if any action is potentially available (even if disabled)
  // This provides visibility into why actions aren't available
  const hasAnyPotentialAction = canEdit || canDelete;

  // If no potential actions and not authenticated, don't show menu
  if (!hasAnyPotentialAction && !editDisabledReason && !deleteDisabledReason) {
    return null;
  }

  const handleDeleteClick = () => {
    setIsOpen(false);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false);
    onDelete();
  };

  return (
    <>
      <div ref={menuRef} className="relative">
        {/* More button (horizontal three dots) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-[#4b5563] hover:text-[#9ca3af] transition-colors p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]/50"
          aria-label="Post actions"
          aria-expanded={isOpen}
          aria-haspopup="menu"
        >
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
          </svg>
        </button>

        {/* Dropdown menu */}
        {isOpen && (
          <div
            role="menu"
            className="absolute right-0 top-full mt-1 bg-[#1a1f2e] border border-[#2a3142] rounded-lg shadow-xl py-1 min-w-[120px] z-10"
          >
            {/* Edit action */}
            {canEdit && !isSuperseded ? (
              <button
                role="menuitem"
                onClick={() => {
                  setIsOpen(false);
                  onEdit();
                }}
                className="w-full text-left px-3 py-1.5 text-sm text-[#e5e7eb] hover:bg-[#2a3142] transition-colors focus-visible:outline-none focus-visible:bg-[#2a3142]"
              >
                Edit
              </button>
            ) : effectiveEditDisabled ? (
              <Tooltip content={effectiveEditDisabled} position="left">
                <button
                  role="menuitem"
                  disabled
                  className="w-full text-left px-3 py-1.5 text-sm text-[#4b5563] cursor-not-allowed"
                  aria-disabled="true"
                >
                  Edit
                </button>
              </Tooltip>
            ) : null}

            {/* Delete action */}
            {canDelete && !isSuperseded ? (
              <button
                role="menuitem"
                onClick={handleDeleteClick}
                className="w-full text-left px-3 py-1.5 text-sm text-[#e5e7eb] hover:bg-[#2a3142] hover:text-red-400 transition-colors focus-visible:outline-none focus-visible:bg-[#2a3142]"
              >
                Delete
              </button>
            ) : effectiveDeleteDisabled ? (
              <Tooltip content={effectiveDeleteDisabled} position="left">
                <button
                  role="menuitem"
                  disabled
                  className="w-full text-left px-3 py-1.5 text-sm text-[#4b5563] cursor-not-allowed"
                  aria-disabled="true"
                >
                  Delete
                </button>
              </Tooltip>
            ) : null}
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}
