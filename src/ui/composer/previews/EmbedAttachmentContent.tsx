import React from "react";
import type { Attachment } from "@/domain/composer/Attachment";
import { AttachmentContent } from "./AttachmentContent";
import { ProviderBadge } from "./ProviderBadge";

export function EmbedAttachmentContent({
  attachment,
}: {
  attachment: Extract<Attachment, { kind: "embed" }>;
}) {
  const { canonicalUrl, metadata, source } = attachment;

  return (
    <AttachmentContent
      thumbnail={
        metadata?.thumbnailUrl ? (
          <img
            src={metadata.thumbnailUrl}
            alt={metadata.accessibilityText ?? ""}
            aria-hidden={!metadata?.accessibilityText}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            <span className="material-symbols-outlined text-2xl">
              link
            </span>
          </div>
        )
      }
      title={
        <>
          <span className="truncate text-sm font-medium text-slate-200">
            {metadata?.title ?? canonicalUrl}
          </span>
          {source && (
            <ProviderBadge
              label={source}
              tone={source === "figma" ? "purple" : "blue"}
            />
          )}
        </>
      }
      meta={metadata?.description ?? canonicalUrl}
    />
  );
}