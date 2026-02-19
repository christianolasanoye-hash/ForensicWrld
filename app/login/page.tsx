"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase-client";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Field from "@/components/Field";
import SectionHeader from "@/components/SectionHeader";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [message, setMessage] = useState("");

  const supabase = getSupabaseClient();
  const redirectTo = searchParams.get("redirect") || "/admin";

  // Check if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push(redirectTo);
      }
    };
    checkAuth();
  }, [router, redirectTo, supabase.auth]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Basic validation
    if (!email || !password) {
      setError("Please enter both email and password");
      setLoading(false);
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (authError) {
        // Generic error message to prevent user enumeration
        setError("Invalid credentials. Please try again.");
        setLoading(false);
        return;
      }

      // Successful login - redirect
      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (!email) {
      setError("Please enter your email address");
      setLoading(false);
      return;
    }

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.toLowerCase().trim(),
        {
          redirectTo: `${window.location.origin}/admin/reset-password`,
        }
      );

      if (resetError) {
        setError("Failed to send reset email. Please try again.");
      } else {
        setMessage("If an account exists with this email, you will receive a password reset link.");
        setMode("login");
      }
    } catch {
      setError("An error occurred. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-6">
      <div className="w-full max-w-md">
        <SectionHeader
          eyebrow="ACCESS CONTROL"
          title="ADMIN"
          subtitle={mode === "login" ? "AUTHORIZED PERSONNEL ONLY." : "RECOVER ACCESS"}
        />

        {error && (
          <div className="mt-8 border border-red-500/50 bg-red-500/10 p-4 text-[10px] font-bold uppercase tracking-widest text-red-400">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-8 border border-green-500/50 bg-green-500/10 p-4 text-[10px] font-bold uppercase tracking-widest text-green-400">
            {message}
          </div>
        )}

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="mt-12 space-y-6">
            <Field label="Email">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ADMIN@FORENSICWRLD.COM"
                autoComplete="email"
                required
              />
            </Field>

            <Field label="Password">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="ENTER PASSWORD"
                autoComplete="current-password"
                required
                minLength={8}
              />
            </Field>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "AUTHENTICATING..." : "INITIALIZE SESSION →"}
            </Button>

            <button
              type="button"
              onClick={() => setMode("forgot")}
              className="w-full text-center text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white/60 transition-colors"
            >
              FORGOT PASSWORD?
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword} className="mt-12 space-y-6">
            <Field label="Email">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ADMIN@FORENSICWRLD.COM"
                autoComplete="email"
                required
              />
            </Field>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "SENDING..." : "SEND RESET LINK →"}
            </Button>

            <button
              type="button"
              onClick={() => setMode("login")}
              className="w-full text-center text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white/60 transition-colors"
            >
              BACK TO LOGIN
            </button>
          </form>
        )}

        <div className="mt-12 text-center text-[9px] text-white/20 uppercase tracking-widest">
          Protected by Supabase Auth
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">
          Loading...
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
