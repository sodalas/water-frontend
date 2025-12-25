import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { authClient } from "../lib/auth-client";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await authClient.signIn.email({ email, password });

    if (error) {
      setError(error.message);
      return;
    }

    // Force session refetch and await it
    await queryClient.refetchQueries({ queryKey: ["session"] });

    // Now navigate — guards will see the session
    await router.navigate({ to: "/app" });
  };

  return (
    <form onSubmit={handleLogin}>
      <h1>Login</h1>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Sign In</button>
    </form>
  );
}
