import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: "http://localhost:5173/api/auth", // Corrected: Full URL required by Better Auth validator
  fetchOptions: { 
      credentials: "include" 
  },
  plugins: [magicLinkClient()]
});

// Regression Guard:
// If login UI succeeds but magicLink logs do not appear, the client is not calling the correct auth base URL.
