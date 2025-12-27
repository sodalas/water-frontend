import React from "react";
import type { Attachment } from "@/domain/composer/Attachment";
import { AttachmentContent } from "./AttachmentContent";
import { ProviderBadge } from "./ProviderBadge";

export function FileAttachmentContent({
  attachment,
}: {
  attachment: Extract<Attachment, { kind: "file" }>;
}) {
  return (
    <AttachmentContent
      thumbnail={
        <div className="flex h-full w-full items-center justify-center text-slate-400">
          <span className="material-symbols-outlined text-2xl">
            description
          </span>
        </div>
      }
      title={
        <>
          <span className="truncate text-sm font-medium text-slate-200">
            {attachment.fileName}
          </span>
          <ProviderBadge label="Upload" tone="blue" />
        </>
      }
      meta={`${attachment.size} · ${attachment.mimeType}`}
    />
  );
}