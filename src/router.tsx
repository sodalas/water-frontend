import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  redirect,
  Outlet,
} from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { authClient } from "./lib/auth-client";
import { Login } from "./routes/login";
import { AppHome } from "./routes/app-home";

// Context interface for the router
interface RouterContext {
  queryClient: QueryClient;
}

// Root Route
const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: () => <Outlet />,
});

// Login Route (Guest Only)
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  beforeLoad: async ({ context }) => {
    // Check session
    const session = await context.queryClient.ensureQueryData({
      queryKey: ["session"],
      queryFn: () => authClient.getSession().then((r) => r.data),
      // Invariant 2: Coordinate with useSession freshness windows
      staleTime: 60_000,
      gcTime: 300_000,
    });

    // Redirect if authenticated
    if (session) {
      throw redirect({ to: "/app" });
    }
  },
  component: Login,
});

import { ArticleAuthoringPage } from "./pages/ArticleAuthoringPage";
import { ArticleReadingPage } from "./pages/ArticleReadingPage";
import { ThreadPage } from "./pages/ThreadPage";

// App Route (Protected)
const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app",
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData({
      queryKey: ["session"],
      queryFn: () => authClient.getSession().then((r) => r.data),
      // Invariant 2: Coordinate with useSession freshness windows
      staleTime: 60_000,
      gcTime: 300_000,
    });

    // Redirect if guest
    if (!session) {
      throw redirect({ to: "/login" });
    }
  },
  component: AppHome,
});

// 🟥 Article Authoring Route (Protected)
// Phase B3.4-B: Now supports ?revise=:id for minimal revise flow
const writeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/write",
  validateSearch: (search: Record<string, unknown>): { revise?: string } => {
    return {
      revise: typeof search.revise === 'string' ? search.revise : undefined,
    };
  },
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData({
      queryKey: ["session"],
      queryFn: () => authClient.getSession().then((r) => r.data),
      // Invariant 2: Coordinate with useSession freshness windows
      staleTime: 60_000,
      gcTime: 300_000,
    });
    if (!session) throw redirect({ to: "/login" });
  },
  component: ArticleAuthoringPage,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/login" });
  },
});

// Article Reading Route (PUBLIC - No auth required)
// 🟥 MUST work without authentication
const articleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/article/$articleId",
  component: ArticleReadingPage,
});

// Phase C.5: Thread Reading Route (PUBLIC - works without auth, visibility enforced by backend)
const threadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/thread/$assertionId",
  component: ThreadPage,
});

// Route Tree
const routeTree = rootRoute.addChildren([indexRoute, loginRoute, appRoute, writeRoute, articleRoute, threadRoute]);

// Invariant 4: Router context factory pattern (no undefined!)
export function createAppRouter(queryClient: QueryClient) {
  return createRouter({
    routeTree,
    context: {
      queryClient,
    },
    defaultPreload: "intent",
  });
}

// Type alias for router type
export type AppRouter = ReturnType<typeof createAppRouter>;

// Type Safety
declare module "@tanstack/react-router" {
  interface Register {
    router: AppRouter;
  }
}
