// src/lib/auth-client.ts
import {
  createAuthClient as createBetterAuthClient,
  type AuthClient,
} from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";

/**
 * Factory function to create an authentication client.
 *
 * This function encapsulates the logic for creating an auth client
 * but decouples it from the specific configuration, which is injected
 * by the caller. This adheres to the DI directive.
 *
 * @param config - The configuration for the auth client, including the baseURL.
 * @returns An instance of the auth client.
 */
export function createAuthClient(config: { baseURL: string }): AuthClient {
  return createBetterAuthClient({
    baseURL: config.baseURL,
    fetchOptions: {
      credentials: "include",
    },
    plugins: [magicLinkClient()],
  });
}

// Composition Root:
// This is the boundary where the application's dependencies are composed.
// The configuration is provided here, separated from the construction logic.
const AUTH_BASE_URL = "http://localhost:5173/api/auth";

export const authClient = createAuthClient({ baseURL: AUTH_BASE_URL });

// Regression Guard:
// If login UI succeeds but magicLink logs do not appear, the client is not calling the correct auth base URL.
