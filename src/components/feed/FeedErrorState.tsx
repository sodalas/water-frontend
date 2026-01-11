// src/components/feed/FeedErrorState.tsx

interface FeedErrorStateProps {
  title?: string;
  message?: string;
  onRetry: () => void;
}

export function FeedErrorState({
  title = "Couldn't load feed",
  message = "We're having trouble connecting right now. Please check your connection and try again.",
  onRetry,
}: FeedErrorStateProps) {
  return (
    <section
      role="alert"
      aria-live="assertive"
      className="flex flex-col items-center justify-center text-center gap-5 py-16"
    >
      {/* Error icon */}
      <div
        className="size-14 rounded-full bg-red-500/10 flex items-center justify-center"
        aria-hidden="true"
      >
        <svg
          className="size-7 text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      </div>

      {/* Text */}
      <div className="max-w-sm">
        <h2 className="text-lg font-semibold text-white mb-2">{title}</h2>
        <p className="text-sm text-text-muted leading-relaxed">{message}</p>
      </div>

      {/* Action */}
      <button
        type="button"
        onClick={onRetry}
        className="
          mt-1
          inline-flex items-center justify-center
          rounded-lg
          bg-brand-primary
          px-5 py-2.5
          text-sm font-medium text-white
          hover:bg-brand-light
          transition-colors
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-brand-primary focus-visible:ring-offset-2
          focus-visible:ring-offset-[#0b0f14]
        "
      >
        Try again
      </button>
    </section>
  );
}
