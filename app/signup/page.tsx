"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function Signup() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", business: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  function set(key: string, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setDone(false);

    const { data, error } = await createClient().auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.name,
          business_name: form.business,
        },
      },
    });

    if (error) {
      setError(error.message);
      return;
    }

    if (data.session) router.push("/dashboard");
    else setDone(true);
  }

  return (
    <main className="auth">
      <div className="authbox">
        <div className="authBrand">
          <Link href="/" className="brand">
            Follow<span>Flow</span>
          </Link>
          <div className="authMark" aria-hidden="true">F</div>
        </div>

        <div className="authKicker">✦ Built for growing businesses</div>

        <h1>Create your workspace</h1>
        <p className="muted authSub">
          Bring your customer inquiries into one simple place and stay on top of every follow-up.
        </p>

        {error && <div className="error">{error}</div>}
        {done && (
          <div className="success">
            Your workspace is almost ready. Check your email to confirm your account, then log in.
          </div>
        )}

        <form className="form" onSubmit={submit}>
          <label>
            Your name
            <input
              required
              autoComplete="name"
              placeholder="e.g. Enzo Neza"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </label>

          <label>
            Business name
            <input
              required
              autoComplete="organization"
              placeholder="e.g. Volcano Café"
              value={form.business}
              onChange={(e) => set("business", e.target.value)}
            />
          </label>

          <label>
            Email
            <input
              required
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </label>

          <label>
            Password
            <input
              required
              minLength={8}
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
            />
          </label>

          <button className="btn" type="submit">Create my workspace →</button>
        </form>

        <p className="muted small authFoot">
          Already have an account?{" "}
          <Link href="/login" className="link">Log in</Link>
        </p>
      </div>
    </main>
  );
}