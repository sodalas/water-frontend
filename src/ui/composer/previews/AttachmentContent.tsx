import React from "react";

type AttachmentContentProps = {
  thumbnail?: React.ReactNode;
  title: React.ReactNode;
  meta?: React.ReactNode;
};

export function AttachmentContent({
  thumbnail,
  title,
  meta,
}: AttachmentContentProps) {
  return (
    <div className="grid grid-cols-[64px_minmax(0,1fr)] gap-3 items-center">
      <div className="h-16 w-16 rounded-lg overflow-hidden bg-slate-700 shrink-0 border border-white/5">
        {thumbnail}
      </div>

      <div className="min-w-0 flex flex-col gap-1">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {title}
        </div>
        {meta && <div className="text-xs text-slate-400">{meta}</div>}
      </div>
    </div>
  );
}