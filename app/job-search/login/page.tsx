"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface LoginFormData {
  username: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      // User is already authenticated, redirect to HR search page
      router.push("/job-search/search");
    }
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.error || "Login failed");
      }

      // Store the token
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("token_type", data.token_type);

      setSuccess(true);

      // Redirect to home page after successful login
      setTimeout(() => {
        window.location.href = "/job-search";
      }, 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred during login";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.username.trim() && formData.password.trim();

  return (
    <div className="mx-auto flex min-h-[calc(100vh-104px)] max-w-md flex-col items-center justify-center px-4 py-8 sm:px-6">
      <div className="glass-panel relative w-full p-8 sm:p-10">
        <div className="pointer-events-none absolute inset-0 -z-10 rounded-[1.25rem] border border-white/10" />

        {/* HR Badge */}
        <div className="mb-8 flex flex-col items-center gap-4">
          <span className="pill-badge inline-flex items-center gap-2 px-4 py-1.5">
            <span className="h-2 w-2 rounded-full bg-violet-400 shadow-[0_0_18px_rgba(167,139,250,1)]" />
            <span className="font-medium text-[11px] uppercase tracking-[0.18em] text-zinc-200">
              JA Team
            </span>
          </span>

          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
              Welcome Back
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Sign in to access the JA Team dashboard
            </p>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-950/60 px-4 py-3 text-center text-sm text-emerald-200 shadow-[0_15px_35px_rgba(6,78,59,0.65)]">
            <div className="flex items-center justify-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,1)]" />
              <span>Login successful! Redirecting...</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-950/60 px-4 py-3 text-center text-sm text-red-200 shadow-[0_15px_35px_rgba(127,29,29,0.65)]">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            <label
              htmlFor="username"
              className="flex items-center justify-between text-xs font-medium text-zinc-200"
            >
              <span>Username</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <svg
                  className="h-4 w-4 text-zinc-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter your username"
                className="w-full rounded-lg border border-white/30 bg-zinc-700/90 py-3 pl-10 pr-4 text-sm text-zinc-50 outline-none ring-0 transition focus:border-violet-400/70 focus:ring-2 focus:ring-violet-500/50"
                disabled={loading || success}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label
              htmlFor="password"
              className="flex items-center justify-between text-xs font-medium text-zinc-200"
            >
              <span>Password</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <svg
                  className="h-4 w-4 text-zinc-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className="w-full rounded-lg border border-white/30 bg-zinc-700/90 py-3 pl-10 pr-4 text-sm text-zinc-50 outline-none ring-0 transition focus:border-violet-400/70 focus:ring-2 focus:ring-violet-500/50"
                disabled={loading || success}
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!isFormValid || loading || success}
            className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-lg border border-violet-400/60 bg-violet-600/80 px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_35px_rgba(139,92,246,0.5)] transition hover:bg-violet-600 hover:border-violet-400/80 hover:shadow-[0_15px_40px_rgba(139,92,246,0.6)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-violet-600/80"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Signing in...</span>
              </span>
            ) : success ? (
              <span className="inline-flex items-center gap-2">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Success!</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-300 shadow-[0_0_14px_rgba(167,139,250,1)]" />
                <span>Sign In</span>
              </span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-center">
          <p className="text-[11px] text-zinc-500">
            JA Team Access Only
          </p>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-6 flex items-center gap-2 text-[11px] text-zinc-500">
        <svg
          className="h-3.5 w-3.5 text-emerald-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
        <span>Secured connection • TJH JA Team</span>
      </div>
    </div>
  );
}
