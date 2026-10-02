"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

type Lead = { id:string; name:string; phone:string; service:string; message:string|null; status:string; created_at:string };

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data:{ user } } = await supabase.auth.getUser();
    if (!user) return window.location.href = "/login";
    setEmail(user.email || "");
    const { data } = await supabase.from("leads").select("*").order("created_at", { ascending:false });
    setLeads(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id:string, status:string) {
    await supabase.from("leads").update({ status }).eq("id", id);
    load();
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return <main className="dash">
    <header className="dashHead"><div><div className="brand">Flow<span>Desk</span></div><p>{email}</p></div><button className="ghostButton" onClick={logout}>Log out</button></header>
    <section className="dashTitle"><div><div className="eyebrow">LIVE WORKSPACE</div><h1>Business dashboard</h1><p>Everything below comes from your real database.</p></div></section>
    <section className="stats">
      <div><span>New</span><strong>{leads.filter(x=>x.status==="new").length}</strong></div>
      <div><span>Contacted</span><strong>{leads.filter(x=>x.status==="contacted").length}</strong></div>
      <div><span>Booked</span><strong>{leads.filter(x=>x.status==="booked").length}</strong></div>
      <div><span>Completed</span><strong>{leads.filter(x=>x.status==="completed").length}</strong></div>
    </section>
    <section className="tableCard">
      <div className="tableHead"><h2>Lead queue</h2><button className="ghostButton" onClick={load}>Refresh</button></div>
      {loading ? <p>Loading real leads…</p> : leads.length === 0 ? <div className="empty"><h3>No leads yet</h3><p>New customer enquiries will appear here automatically.</p></div> :
      <div className="leadList">{leads.map(l=><article className="lead" key={l.id}>
        <div><h3>{l.name}</h3><p>{l.phone} · {l.service}</p>{l.message && <small>{l.message}</small>}</div>
        <select value={l.status} onChange={e=>updateStatus(l.id,e.target.value)}>
          <option value="new">New</option><option value="contacted">Contacted</option><option value="booked">Booked</option><option value="completed">Completed</option><option value="lost">Lost</option>
        </select>
      </article>)}</div>}
    </section>
  </main>;
}