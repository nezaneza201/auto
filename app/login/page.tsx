"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function Login() {
  const [mode, setMode] = useState<"login"|"signup">("login");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setMessage("");
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email"));
    const password = String(f.get("password"));

    const result = mode === "login"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    setLoading(false);
    if (result.error) return setMessage(result.error.message);
    if (mode === "signup") return setMessage("Account created. Check your email if confirmation is enabled.");
    window.location.href = "/dashboard";
  }

  return <main className="auth"><div className="authCard">
    <div className="brand">Flow<span>Desk</span></div>
    <h1>{mode === "login" ? "Business login" : "Create your business account"}</h1>
    <p>{mode === "login" ? "Access your real leads, bookings and reports." : "Start with one secure business workspace."}</p>
    <form onSubmit={submit}>
      <input name="email" type="email" required placeholder="Business email" />
      <input name="password" type="password" required minLength={8} placeholder="Password (8+ characters)" />
      <button disabled={loading}>{loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</button>
    </form>
    {message && <p className="status">{message}</p>}
    <button className="linkButton" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
      {mode === "login" ? "Create an account" : "I already have an account"}
    </button>
  </div></main>;
}