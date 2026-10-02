"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function Home() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    const form = new FormData(e.currentTarget);

    const { error } = await supabase.from("public_leads").insert({
      name: String(form.get("name") || "").trim(),
      phone: String(form.get("phone") || "").trim(),
      service: String(form.get("service") || "").trim(),
      message: String(form.get("message") || "").trim()
    });

    setLoading(false);
    setStatus(error ? "We could not save your enquiry. Please try WhatsApp or call us." : "Enquiry received. The business has been notified.");
    if (!error) e.currentTarget.reset();
  }

  return (
    <main>
      <nav className="nav"><div className="brand">Flow<span>Desk</span></div><a href="/login">Business Login</a></nav>
      <section className="hero">
        <div className="eyebrow">REAL BUSINESS AUTOMATION</div>
        <h1>Turn every enquiry into a customer.</h1>
        <p>Capture leads, manage bookings, follow up with customers and track what is actually happening in your business.</p>
        <div className="actions"><a className="button" href="#enquiry">Contact the business</a><a className="ghost" href="/login">Business dashboard →</a></div>
      </section>
      <section className="grid">
        <article><b>01</b><h3>Lead capture</h3><p>Every enquiry is stored as a real customer record.</p></article>
        <article><b>02</b><h3>Bookings</h3><p>Track requested, confirmed, completed and cancelled bookings.</p></article>
        <article><b>03</b><h3>Follow-ups</h3><p>Never lose a customer because nobody followed up.</p></article>
        <article><b>04</b><h3>Reporting</h3><p>See real activity instead of fake dashboard numbers.</p></article>
      </section>
      <section id="enquiry" className="panel">
        <div><div className="eyebrow">CONTACT</div><h2>Send an enquiry</h2><p>Your information goes into the business's FlowDesk lead queue.</p></div>
        <form onSubmit={submit}>
          <input name="name" required placeholder="Your name" />
          <input name="phone" required placeholder="Phone / WhatsApp" />
          <input name="service" required placeholder="Service or booking" />
          <textarea name="message" placeholder="Tell us what you need" rows={4} />
          <button disabled={loading}>{loading ? "Sending…" : "Send enquiry"}</button>
          {status && <p className="status">{status}</p>}
        </form>
      </section>
      <footer>FlowDesk © 2026 · Built for real businesses.</footer>
    </main>
  );
}