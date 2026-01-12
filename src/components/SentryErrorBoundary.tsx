// Phase E.0: Sentry-integrated error boundary for React
import * as Sentry from "@sentry/react";
import { Component, type ReactNode } from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  eventId: string | null;
}

interface ErrorFallbackProps {
  error: Error | null;
  eventId: string | null;
  resetError: () => void;
}

function ErrorFallback({ error, eventId, resetError }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen bg-[#0f1219] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#1a1f2e] border border-[#2a3142] rounded-xl p-6 text-center">
        <div className="size-12 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
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

        <h2 className="text-xl font-semibold text-[#e5e7eb] mb-2">
          Something went wrong
        </h2>

        <p className="text-[#9ca3af] text-sm mb-4">
          An unexpected error occurred. Our team has been notified.
        </p>

        {error && import.meta.env.MODE !== "production" && (
          <pre className="text-left text-xs text-red-400 bg-[#0f1219] rounded-lg p-3 mb-4 overflow-auto max-h-32">
            {error.message}
          </pre>
        )}

        {eventId && (
          <p className="text-[#6b7280] text-xs mb-4">
            Error ID: {eventId}
          </p>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={resetError}
            className="px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-medium rounded-lg transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.href = "/app"}
            className="px-4 py-2 bg-[#2a3142] hover:bg-[#3b4252] text-[#e5e7eb] text-sm font-medium rounded-lg transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}

export class SentryErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, eventId: null };
  }

  static getDerivedStateFromError(): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Capture to Sentry with component stack
    const eventId = Sentry.captureException(error, {
      extra: {
        componentStack: errorInfo.componentStack,
      },
      tags: {
        type: "react-error-boundary",
      },
    });
    this.setState({ eventId });
  }

  resetError = () => {
    this.setState({ hasError: false, eventId: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={null}
          eventId={this.state.eventId}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

// Hook for setting user context (call when session changes)
export function setSentryUser(user: { id: string; email?: string | null; name?: string | null } | null) {
  if (!user) {
    Sentry.setUser(null);
    return;
  }
  Sentry.setUser({
    id: user.id,
    email: user.email ?? undefined,
    username: user.name ?? undefined,
  });
}

// Utility for capturing errors with context
export function captureError(
  error: Error,
  context: {
    operation?: string;
    assertionId?: string;
    route?: string;
    [key: string]: unknown;
  } = {}
) {
  const { operation, assertionId, route, ...extra } = context;

  Sentry.withScope((scope) => {
    if (operation) scope.setTag("operation", operation);
    if (route) scope.setTag("route", route);
    if (assertionId) scope.setContext("assertion", { assertionId });
    if (Object.keys(extra).length > 0) scope.setContext("extra", extra);
    Sentry.captureException(error);
  });
}

// Add breadcrumb for important operations
export function addBreadcrumb(
  category: string,
  message: string,
  data: Record<string, unknown> = {}
) {
  Sentry.addBreadcrumb({
    category,
    message,
    data,
    level: "info",
  });
}
