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
      className="flex flex-col items-center justify-center text-center gap-4 py-16"
    >
      {/* Error icon */}
      <div
        className="size-12 rounded-full bg-red-500/10 flex items-center justify-center"
        aria-hidden="true"
      >
        <svg
          className="size-6 text-red-400"
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
      <div className="max-w-xs">
        <h2 className="text-base font-semibold text-white mb-1">{title}</h2>
        <p className="text-sm text-[#6b7280] leading-relaxed">{message}</p>
      </div>

      {/* Action */}
      <button
        type="button"
        onClick={onRetry}
        className="
          mt-1
          inline-flex items-center justify-center
          rounded-lg
          bg-[#3b82f6]
          px-4 py-2
          text-sm font-medium text-white
          hover:bg-[#2563eb]
          transition-colors
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-[#3b82f6] focus-visible:ring-offset-2
          focus-visible:ring-offset-[#0f1219]
        "
      >
        Try again
      </button>
    </section>
  );
}
