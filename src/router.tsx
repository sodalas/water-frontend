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
    });

    // Redirect if authenticated
    if (session) {
      throw redirect({ to: "/app" });
    }
  },
  component: Login,
});

import { ArticleWritePage } from "./pages/ArticleWritePage";
import { ArticleReadingPage } from "./pages/ArticleReadingPage";

// App Route (Protected)
const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app",
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData({
      queryKey: ["session"],
      queryFn: () => authClient.getSession().then((r) => r.data),
    });

    // Redirect if guest
    if (!session) {
      throw redirect({ to: "/login" });
    }
  },
  component: AppHome,
});

const writeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/write",
  beforeLoad: async ({ context }) => {
     // Protected route, similar to /app
    const session = await context.queryClient.ensureQueryData({
      queryKey: ["session"],
      queryFn: () => authClient.getSession().then((r) => r.data),
    });
    if (!session) throw redirect({ to: "/login" });
  },
  component: ArticleWritePage,
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

// Route Tree
const routeTree = rootRoute.addChildren([indexRoute, loginRoute, appRoute, writeRoute, articleRoute]);

// Create Router
export const router = createRouter({
  routeTree,
  context: {
    queryClient: undefined!, // Injected in main.tsx
  },
  defaultPreload: "intent",
});

// Type Safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
