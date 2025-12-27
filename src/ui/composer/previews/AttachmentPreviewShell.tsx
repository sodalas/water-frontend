import React from "react";

type AttachmentPreviewShellProps = {
  children: React.ReactNode;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  position?: number;
  total?: number;
};

export function AttachmentPreviewShell({
  children,
  onRemove,
  onMoveUp,
  onMoveDown,
  position,
  total,
}: AttachmentPreviewShellProps) {
  return (
    <div
      role="group"
      tabIndex={0}
      aria-roledescription="attachment"
      aria-label={
        position !== undefined && total !== undefined
          ? `Attachment ${position + 1} of ${total}`
          : "Attachment"
      }
      onKeyDown={(e) => {
        if (e.ctrlKey && e.key === "ArrowUp") {
          e.preventDefault();
          onMoveUp?.();
        }
        if (e.ctrlKey && e.key === "ArrowDown") {
          e.preventDefault();
          onMoveDown?.();
        }
        if (e.key === "Backspace" || e.key === "Delete") {
          e.preventDefault();
          onRemove();
        }
      }}
      className="group grid grid-cols-[28px_minmax(0,1fr)_32px] items-center gap-3 rounded-xl border border-slate-700/50 bg-slate-800/60 px-3 py-3 hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/60 transition-colors"
    >
      <div
        aria-hidden
        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 cursor-grab"
        title="Reorder attachment"
      >
        <span className="material-symbols-outlined text-[18px]">
          drag_indicator
        </span>
      </div>

      <div className="min-w-0">{children}</div>

      <button
        onClick={onRemove}
        aria-label="Remove attachment"
        className="justify-self-center rounded-full p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
      >
        <span className="material-symbols-outlined text-[18px]">
          close
        </span>
      </button>
    </div>
  );
}