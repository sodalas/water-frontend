// Sentry initialization - must be first
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://3846788b464e1efb571231b9cbab091f@o4510693980045312.ingest.us.sentry.io/4510697267068928",
  environment: import.meta.env.MODE,
  sendDefaultPii: false,
  tracesSampleRate: import.meta.env.MODE === "production" ? 0.1 : 1.0,
  initialScope: {
    tags: {
      phase: "E.0-stabilization",
    },
  },
  // Capture unhandled promise rejections
  integrations: [
    Sentry.browserTracingIntegration(),
  ],
});

console.log("MAIN TSX EXECUTED — CSS SHOULD LOAD");

import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppRouter } from "./router";
import { SentryErrorBoundary } from "./components/SentryErrorBoundary";

// Invariant 4: Instantiate router only after queryClient exists
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Capture query errors to Sentry
      throwOnError: false,
    },
    mutations: {
      // Capture mutation errors to Sentry
      onError: (error) => {
        Sentry.captureException(error, {
          tags: { type: "react-query-mutation" },
        });
      },
    },
  },
});
const router = createAppRouter(queryClient);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SentryErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </SentryErrorBoundary>
  </StrictMode>
);
