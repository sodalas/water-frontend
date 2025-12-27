// src/components/feed/FeedErrorState.tsx
import React from "react";

interface FeedErrorStateProps {
  title?: string;
  message?: string;
  onRetry: () => void;
}

export function FeedErrorState({
  title = "Couldn't load feed",
  message = "We're having trouble connecting to the server right now. Please check your connection.",
  onRetry,
}: FeedErrorStateProps) {
  return (
    <section
      role="alert"
      aria-live="assertive"
      className="
        flex flex-col items-center justify-center
        text-center
        gap-4
        py-16
      "
    >
      {/* Icon placeholder */}
      <div
        className="
          size-14 rounded-full
          bg-surface-highlight/40
          flex items-center justify-center
        "
        aria-hidden="true"
      >
        <div className="size-6 rounded bg-surface-highlight/70" />
      </div>

      {/* Text */}
      <div className="max-w-sm">
        <h2 className="text-lg font-semibold text-white mb-1">{title}</h2>
        <p className="text-sm text-text-muted">{message}</p>
      </div>

      {/* Action */}
      <button
        type="button"
        onClick={onRetry}
        className="
          mt-2
          inline-flex items-center justify-center
          rounded-full
          bg-accent-primary
          px-6 py-2
          text-sm font-medium text-white
          hover:bg-accent-primary/90
          focus:outline-none focus-visible:ring
          focus-visible:ring-accent-primary/60
        "
      >
        Retry
      </button>
    </section>
  );
}
