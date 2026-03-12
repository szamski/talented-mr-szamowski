"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push("/admin");
      } else {
        setError("Invalid credentials");
      }
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050a08]">
      <div className="w-full max-w-sm">
        <div className="glass rounded-2xl p-8 border border-white/5">
          <div className="text-center mb-8">
            <h1 className="text-xl font-bold text-brand font-mono">
              szamowski.dev
            </h1>
            <p className="text-sm text-white/40 mt-2">Admin Panel</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-xs text-brand/70 font-mono uppercase tracking-wider mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#080818] border border-white/10 rounded-lg px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-brand/50 transition-colors"
                autoFocus
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs text-brand/70 font-mono uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#080818] border border-white/10 rounded-lg px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-brand/50 transition-colors"
                required
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs font-mono text-center">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand text-[#080818] font-bold py-3 rounded-lg text-sm font-mono hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-wait"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
